import { create } from 'zustand'

type EmailStore = {
  unreadCount: number
  lastSeenUids: Set<number>
  setUnreadCount: (count: number) => void
  setLastSeenUids: (uids: Set<number>) => void
  markAllSeen: () => void
}

export const useEmailStore = create<EmailStore>((set) => ({
  unreadCount: 0,
  lastSeenUids: new Set(),
  setUnreadCount: (count) => set({ unreadCount: count }),
  setLastSeenUids: (uids) => set({ lastSeenUids: uids }),
  markAllSeen: () => set({ unreadCount: 0 }),
}))
