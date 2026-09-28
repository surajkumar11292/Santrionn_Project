import { create } from 'zustand';
import { api } from '../api/client';

export const useDisasterStore = create((set, get) => ({
  disasters: [],
  allDisasters: [], // Global unfiltered incident registry for constant overview statistics
  selectedDisaster: null,
  filters: {
    tag: '',
    status: '',
    search: ''
  },
  loading: false,
  error: null,

  fetchDisasters: async () => {
    set({ loading: true, error: null });
    const { filters, allDisasters } = get();
    try {
      const isUnfiltered = !filters.tag && !filters.status && !filters.search;
      
      const params = {};
      if (filters.tag) params.tag = filters.tag;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      params.limit = 100;

      // 1. Maintain global unfiltered dataset for StatsBar
      let currentAll = allDisasters;
      if (currentAll.length === 0) {
        const fullRes = await api.disasters.list({ limit: 100 });
        currentAll = fullRes.data || [];
      }

      // 2. Fetch filtered disaster list for card display
      let disasters;
      if (isUnfiltered) {
        disasters = currentAll;
      } else {
        const response = await api.disasters.list(params);
        disasters = response.data || [];
      }

      set({
        disasters,
        allDisasters: currentAll,
        loading: false,
        error: null
      });
    } catch (err) {
      set({
        loading: false,
        error: err.message || 'Failed to fetch disasters'
      });
    }
  },

  selectDisaster: (disaster) => set({ selectedDisaster: disaster }),

  setFilter: (key, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value
      }
    }));
    get().fetchDisasters();
  },

  resetFilters: () => {
    set({
      filters: { tag: '', status: '', search: '' }
    });
    get().fetchDisasters();
  },

  // Real-Time Event Handlers
  onDisasterCreated: (newDisaster) => {
    set((state) => {
      const existsInAll = state.allDisasters.some((d) => d.id === newDisaster.id);
      const updatedAll = existsInAll ? state.allDisasters : [newDisaster, ...state.allDisasters];

      const existsInFiltered = state.disasters.some((d) => d.id === newDisaster.id);
      const updatedFiltered = existsInFiltered ? state.disasters : [newDisaster, ...state.disasters];

      return {
        allDisasters: updatedAll,
        disasters: updatedFiltered
      };
    });
  },

  onDisasterUpdated: (updatedDisaster) => {
    set((state) => ({
      allDisasters: state.allDisasters.map((d) =>
        d.id === updatedDisaster.id ? { ...d, ...updatedDisaster } : d
      ),
      disasters: state.disasters.map((d) =>
        d.id === updatedDisaster.id ? { ...d, ...updatedDisaster } : d
      ),
      selectedDisaster:
        state.selectedDisaster?.id === updatedDisaster.id
          ? { ...state.selectedDisaster, ...updatedDisaster }
          : state.selectedDisaster
    }));
  },

  onDisasterDeleted: (disasterId) => {
    set((state) => ({
      allDisasters: state.allDisasters.filter((d) => d.id !== disasterId),
      disasters: state.disasters.filter((d) => d.id !== disasterId),
      selectedDisaster:
        state.selectedDisaster?.id === disasterId ? null : state.selectedDisaster
    }));
  }
}));

