import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TimeEntry, TimerSession } from '../supabase';

interface TimeTrackingState {
  // Timer state
  activeTimer: (TimerSession & { project?: any; milestone?: any }) | null;
  timerSeconds: number;
  isTimerRunning: boolean;
  
  // Time entries
  timeEntries: (TimeEntry & { project?: any; milestone?: any })[];
  totalEntries: number;
  
  // Loading states
  isLoading: boolean;
  isStartingTimer: boolean;
  isStoppingTimer: boolean;
  
  // Filters
  filters: {
    projectId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  };
  
  // Actions
  setActiveTimer: (timer: (TimerSession & { project?: any; milestone?: any }) | null) => void;
  setTimerSeconds: (seconds: number) => void;
  setIsTimerRunning: (running: boolean) => void;
  setTimeEntries: (entries: (TimeEntry & { project?: any; milestone?: any })[]) => void;
  setTotalEntries: (total: number) => void;
  setIsLoading: (loading: boolean) => void;
  setIsStartingTimer: (starting: boolean) => void;
  setIsStoppingTimer: (stopping: boolean) => void;
  setFilters: (filters: Partial<TimeTrackingState['filters']>) => void;
  addTimeEntry: (entry: TimeEntry & { project?: any; milestone?: any }) => void;
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void;
  removeTimeEntry: (id: string) => void;
  reset: () => void;
}

const initialState = {
  activeTimer: null,
  timerSeconds: 0,
  isTimerRunning: false,
  timeEntries: [],
  totalEntries: 0,
  isLoading: false,
  isStartingTimer: false,
  isStoppingTimer: false,
  filters: {},
};

export const useTimeTrackingStore = create<TimeTrackingState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setActiveTimer: (timer) => set({ activeTimer: timer }),
      setTimerSeconds: (seconds) => set({ timerSeconds: seconds }),
      setIsTimerRunning: (running) => set({ isTimerRunning: running }),
      setTimeEntries: (entries) => set({ timeEntries: entries }),
      setTotalEntries: (total) => set({ totalEntries: total }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setIsStartingTimer: (starting) => set({ isStartingTimer: starting }),
      setIsStoppingTimer: (stopping) => set({ isStoppingTimer: stopping }),
      setFilters: (filters) => set((state) => ({ 
        filters: { ...state.filters, ...filters } 
      })),
      
      addTimeEntry: (entry) => set((state) => ({
        timeEntries: [entry, ...state.timeEntries],
        totalEntries: state.totalEntries + 1,
      })),
      
      updateTimeEntry: (id, updates) => set((state) => ({
        timeEntries: state.timeEntries.map((entry) =>
          entry.id === id ? { ...entry, ...updates } : entry
        ),
      })),
      
      removeTimeEntry: (id) => set((state) => ({
        timeEntries: state.timeEntries.filter((entry) => entry.id !== id),
        totalEntries: Math.max(0, state.totalEntries - 1),
      })),
      
      reset: () => set(initialState),
    }),
    {
      name: 'time-tracking-store',
      partialize: (state) => ({
        filters: state.filters,
        timerSeconds: state.timerSeconds,
      }),
    }
  )
);