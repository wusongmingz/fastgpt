import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type State = {
  lastGraphId: string;
  setLastGraphId: (id: string) => void;
};

export const useGraphStore = create<State>()(
  devtools(
    persist(
      immer((set) => ({
        lastGraphId: '1', //先给个默认值
        setLastGraphId(id: string) {
          set((state) => {
            state.lastGraphId = id;
          });
        }
      })),
      {
        name: 'graphStore',
        partialize: (state) => ({
          lastGraphId: state.lastGraphId
        })
      }
    )
  )
);
