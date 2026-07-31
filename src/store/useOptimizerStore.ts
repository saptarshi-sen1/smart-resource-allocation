/**
 * CrisisConnect — Optimizer Zustand Store
 * Global state management for the assignment optimizer.
 * Works in two modes:
 *   - Demo mode: uses in-memory data from demoDataService
 *   - Production mode: reads from Firestore via optimizerService
 */

import { create } from 'zustand';
import type {
  OptimizationResult,
  GreedyResult,
  Volunteer,
  DisasterRequest,
} from '@/types/optimizer';
import { runOptimizer, runGreedyBaseline } from '@/lib/optimization/optimizer';
import { DEMO_VOLUNTEERS, DEMO_REQUESTS } from '@/services/demoDataService';
import { fetchActiveVolunteers, fetchActiveRequests, saveAssignments } from '@/services/optimizerService';

interface OptimizerStore {
  // ─── State ───────────────────────────────────────────────────────────────
  result: OptimizationResult | null;
  greedyResult: GreedyResult | null;
  volunteers: Volunteer[];
  requests: DisasterRequest[];
  isRunning: boolean;
  lastRunAt: Date | null;
  error: string | null;
  isDemoMode: boolean;

  // ─── Actions ─────────────────────────────────────────────────────────────
  /** Runs the optimizer on current volunteers + requests */
  run: () => Promise<void>;
  /** Runs with demo data (in-memory, no Firestore) */
  runDemo: () => Promise<void>;
  /** Loads volunteers and requests from Firestore */
  loadFromFirestore: () => Promise<void>;
  /** Sets demo mode flag */
  setDemoMode: (demo: boolean) => void;
  /** Resets optimizer results */
  reset: () => void;
  /** Clears any error */
  clearError: () => void;
}

export const useOptimizerStore = create<OptimizerStore>((set, get) => ({
  result: null,
  greedyResult: null,
  volunteers: [],
  requests: [],
  isRunning: false,
  lastRunAt: null,
  error: null,
  isDemoMode: true,

  run: async () => {
    const { volunteers, requests, isDemoMode } = get();
    const v = isDemoMode ? DEMO_VOLUNTEERS : volunteers;
    const r = isDemoMode ? DEMO_REQUESTS : requests;

    set({ isRunning: true, error: null });

    try {
      // Small async tick so UI updates before heavy computation
      await new Promise<void>((resolve) => setTimeout(resolve, 50));

      const result = runOptimizer(v, r);
      const greedyResult = runGreedyBaseline(v, r);

      // Save to Firestore if in production mode
      if (!isDemoMode && result.assignments.length > 0) {
        await saveAssignments(result.assignments);
      }

      set({
        result,
        greedyResult,
        isRunning: false,
        lastRunAt: new Date(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Optimization failed';
      set({ error: message, isRunning: false });
    }
  },

  runDemo: async () => {
    set({
      volunteers: DEMO_VOLUNTEERS,
      requests: DEMO_REQUESTS,
      isDemoMode: true,
      isRunning: true,
      error: null,
    });

    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 50));

      const result = runOptimizer(DEMO_VOLUNTEERS, DEMO_REQUESTS);
      const greedyResult = runGreedyBaseline(DEMO_VOLUNTEERS, DEMO_REQUESTS);

      set({
        result,
        greedyResult,
        isRunning: false,
        lastRunAt: new Date(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Demo optimization failed';
      set({ error: message, isRunning: false });
    }
  },

  loadFromFirestore: async () => {
    set({ isRunning: true, error: null });
    try {
      const [volunteers, requests] = await Promise.all([
        fetchActiveVolunteers(),
        fetchActiveRequests(),
      ]);
      set({ volunteers, requests, isDemoMode: false, isRunning: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data from Firestore';
      set({ error: message, isRunning: false });
    }
  },

  setDemoMode: (demo) => set({ isDemoMode: demo }),

  reset: () =>
    set({
      result: null,
      greedyResult: null,
      error: null,
      lastRunAt: null,
    }),

  clearError: () => set({ error: null }),
}));
