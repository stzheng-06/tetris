import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  count: number
}

interface CounterState {
  users: User[]
  addUser: (name: string) => void
  removeUser: (id: string) => void
  increment: (id: string) => boolean
  decrement: (id: string) => boolean
  reset: (id: string) => void
}

export const useCounterStore = create<CounterState>()(
  persist(
    (set, get) => ({
      users: [],
      addUser: (name) => {
        const id = Math.random().toString(36).slice(2, 9)
        set((state) => ({
          users: [...state.users, { id, name, count: 0 }]
        }))
      },
      removeUser: (id) => {
        set((state) => ({
          users: state.users.filter(user => user.id !== id)
        }))
      },
      increment: (id) => {
        const user = get().users.find(u => u.id === id)
        if (user && user.count < 10) {
          set((state) => ({
            users: state.users.map(u => 
              u.id === id ? { ...u, count: u.count + 1 } : u
            )
          }))
          return true
        }
        return false
      },
      decrement: (id) => {
        const user = get().users.find(u => u.id === id)
        if (user && user.count > 0) {
          set((state) => ({
            users: state.users.map(u => 
              u.id === id ? { ...u, count: u.count - 1 } : u
            )
          }))
          return true
        }
        return false
      },
      reset: (id) => {
        set((state) => ({
          users: state.users.map(u => 
            u.id === id ? { ...u, count: 0 } : u
          )
        }))
      }
    }),
    {
      name: 'multi-counter-storage'
    }
  )
) 