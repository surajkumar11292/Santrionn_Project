import { create } from 'zustand';
import { api } from '../api/client';

export const useDisasterStore = create((set, get) => ({
  disasters: [],
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
    const { filters } = get();
    try {
      const params = {};
      if (filters.tag) params.tag = filters.tag;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      params.limit = 50;

      const response = await api.disasters.list(params);
      const disasters = response.data || [];

      set({
        disasters,
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
      const exists = state.disasters.some((d) => d.id === newDisaster.id);
      if (exists) return state;
      return {
        disasters: [newDisaster, ...state.disasters]
      };
    });
  },

  onDisasterUpdated: (updatedDisaster) => {
    set((state) => ({
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
      disasters: state.disasters.filter((d) => d.id !== disasterId),
      selectedDisaster:
        state.selectedDisaster?.id === disasterId ? null : state.selectedDisaster
    }));
  }
}));
