/**
 * CrisisConnect — Optimizer Firestore Service
 * Handles reading volunteers/requests from Firestore and writing assignment results.
 * Used for the production flow — demo mode uses demoDataService.ts instead.
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch,
  onSnapshot,
  query,
  where,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase/config';
import type { Volunteer, DisasterRequest, Assignment } from '@/types/optimizer';

// ─── Collections ──────────────────────────────────────────────────────────────

const VOLUNTEERS_COL = 'volunteers';
const REQUESTS_COL = 'requests';
const ASSIGNMENTS_COL = 'assignments';

// ─── Reads ────────────────────────────────────────────────────────────────────

/**
 * Fetches all available volunteers from Firestore.
 */
export async function fetchActiveVolunteers(): Promise<Volunteer[]> {
  try {
    const q = query(
      collection(db, VOLUNTEERS_COL),
      where('available', '==', true),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Volunteer));
  } catch (error) {
    console.error('[optimizerService] fetchActiveVolunteers error:', error);
    return [];
  }
}

/**
 * Fetches all active disaster requests from Firestore.
 */
export async function fetchActiveRequests(): Promise<DisasterRequest[]> {
  try {
    const q = query(
      collection(db, REQUESTS_COL),
      where('isActive', '==', true),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DisasterRequest));
  } catch (error) {
    console.error('[optimizerService] fetchActiveRequests error:', error);
    return [];
  }
}

// ─── Writes ───────────────────────────────────────────────────────────────────

/**
 * Batch-writes all assignments to Firestore under the `assignments/` collection.
 * Each document ID is `${volunteerId}_${requestId}` for easy querying.
 */
export async function saveAssignments(assignments: Assignment[]): Promise<void> {
  if (assignments.length === 0) return;

  try {
    const batch = writeBatch(db);

    for (const assignment of assignments) {
      const docId = `${assignment.volunteerId}_${assignment.requestId}`;
      const ref = doc(db, ASSIGNMENTS_COL, docId);
      batch.set(ref, {
        ...assignment,
        assignedAt: Timestamp.fromMillis(assignment.assignedAt),
      });
    }

    await batch.commit();
  } catch (error) {
    console.error('[optimizerService] saveAssignments error:', error);
  }
}

/**
 * Saves a single volunteer document to Firestore (used by demo seed).
 */
export async function saveVolunteer(volunteer: Volunteer): Promise<void> {
  await setDoc(doc(db, VOLUNTEERS_COL, volunteer.id), volunteer);
}

/**
 * Saves a single disaster request document to Firestore (used by demo seed).
 */
export async function saveRequest(request: DisasterRequest): Promise<void> {
  await setDoc(doc(db, REQUESTS_COL, request.id), request);
}

// ─── Real-Time Subscriptions ──────────────────────────────────────────────────

/**
 * Subscribes to real-time volunteer updates.
 * Triggers `callback` whenever any volunteer's availability changes.
 * Returns an unsubscribe function.
 */
export function subscribeToVolunteers(
  callback: (volunteers: Volunteer[]) => void,
): Unsubscribe {
  const q = query(collection(db, VOLUNTEERS_COL), where('available', '==', true));
  return onSnapshot(q, (snap) => {
    const volunteers = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Volunteer));
    callback(volunteers);
  });
}

/**
 * Subscribes to real-time request updates.
 * Triggers `callback` whenever a new request is added or status changes.
 * Returns an unsubscribe function.
 */
export function subscribeToRequests(
  callback: (requests: DisasterRequest[]) => void,
): Unsubscribe {
  const q = query(collection(db, REQUESTS_COL), where('isActive', '==', true));
  return onSnapshot(q, (snap) => {
    const requests = snap.docs.map((d) => ({ id: d.id, ...d.data() } as DisasterRequest));
    callback(requests);
  });
}

/**
 * Subscribes to completed assignments for dashboard display.
 */
export function subscribeToAssignments(
  callback: (assignments: Assignment[]) => void,
): Unsubscribe {
  return onSnapshot(collection(db, ASSIGNMENTS_COL), (snap) => {
    const assignments = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        assignedAt: data.assignedAt instanceof Timestamp
          ? data.assignedAt.toMillis()
          : data.assignedAt,
      } as Assignment;
    });
    callback(assignments);
  });
}
