/**
 * Disaster Offline-First Sync Engine for CrisisConnect
 * Handles network status monitoring, local data queueing, and auto-syncing.
 */

const QUEUE_KEY = 'crisis_connect_offline_queue';
const CACHE_PREFIX = 'crisis_connect_cache_';

export function isOnline() {
  return navigator.onLine;
}

export function getOfflineQueue() {
  try {
    const data = localStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading offline queue:', e);
    return [];
  }
}

export function queueOfflineAction(actionType, payload) {
  const queue = getOfflineQueue();
  const item = {
    id: 'offline_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    actionType,
    payload,
    timestamp: new Date().toISOString()
  };
  queue.push(item);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  updateOfflineUI();
  return item;
}

export function removeFromOfflineQueue(id) {
  let queue = getOfflineQueue();
  queue = queue.filter(item => item.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  updateOfflineUI();
}

export function clearOfflineQueue() {
  localStorage.removeItem(QUEUE_KEY);
  updateOfflineUI();
}

export function cacheData(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn('Cache quota exceeded or error:', e);
  }
}

export function getCachedData(key, fallback = null) {
  try {
    const data = localStorage.getItem(CACHE_PREFIX + key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

export async function syncOfflineQueue(db, firestoreMethods) {
  if (!isOnline()) return { synced: 0, pending: getOfflineQueue().length };
  
  const queue = getOfflineQueue();
  if (queue.length === 0) return { synced: 0, pending: 0 };
  
  const { collection, addDoc, setDoc, doc } = firestoreMethods;
  let syncedCount = 0;
  
  const itemsToSync = [...queue];
  
  for (const item of itemsToSync) {
    try {
      if (item.actionType === 'ADD_REQUEST') {
        await addDoc(collection(db, 'requests'), item.payload);
      } else if (item.actionType === 'UPDATE_VOLUNTEER_PROFILE') {
        const { uid, profileData } = item.payload;
        await setDoc(doc(db, 'volunteers', uid), profileData, { merge: true });
      } else if (item.actionType === 'CONFIRM_MATCH') {
        await addDoc(collection(db, 'confirmedMatches'), item.payload);
      }
      
      removeFromOfflineQueue(item.id);
      syncedCount++;
    } catch (err) {
      console.error(`Failed to sync item ${item.id}:`, err);
    }
  }
  
  updateOfflineUI();
  return { synced: syncedCount, pending: getOfflineQueue().length };
}

export function updateOfflineUI() {
  const statusBadge = document.getElementById('network-status-badge');
  const queueBadge = document.getElementById('pending-sync-count');
  const queue = getOfflineQueue();
  
  if (statusBadge) {
    if (isOnline()) {
      statusBadge.className = 'badge badge-online';
      statusBadge.innerHTML = '🟢 Online';
    } else {
      statusBadge.className = 'badge badge-offline';
      statusBadge.innerHTML = '🔴 Offline Mode';
    }
  }
  
  if (queueBadge) {
    if (queue.length > 0) {
      queueBadge.classList.remove('hidden');
      queueBadge.textContent = `📥 ${queue.length} Unsynced`;
    } else {
      queueBadge.classList.add('hidden');
    }
  }
}

export function initOfflineSync(db, firestoreMethods) {
  window.addEventListener('online', async () => {
    updateOfflineUI();
    if (db && firestoreMethods) {
      const result = await syncOfflineQueue(db, firestoreMethods);
      if (result.synced > 0) {
        alert(`✅ Connection restored! ${result.synced} offline submission(s) uploaded successfully.`);
      }
    }
  });

  window.addEventListener('offline', () => {
    updateOfflineUI();
  });

  updateOfflineUI();
}
