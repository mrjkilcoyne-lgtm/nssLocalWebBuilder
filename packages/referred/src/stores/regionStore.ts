import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Region = 'US' | 'EU' | 'CN' | 'ROW';

interface RegionState {
  region: Region;
  setRegion: (region: Region) => void;
}

export const useRegionStore = create<RegionState>()(
  persist(
    (set) => ({
      region: 'US',
      setRegion: (region) => set({ region }),
    }),
    {
      name: 'referred-region',
    }
  )
);
