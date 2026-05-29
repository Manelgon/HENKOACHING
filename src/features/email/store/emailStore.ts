import { create } from 'zustand'
import type { ImapFolder, FolderType } from '../types'

type EmailStore = {
  unreadCount: number
  failedCount: number
  lastSeenUids: Set<number>
  activeFolder: FolderType
  folders: ImapFolder[]
  setUnreadCount: (count: number) => void
  setFailedCount: (count: number) => void
  setLastSeenUids: (uids: Set<number>) => void
  markAllSeen: () => void
  setActiveFolder: (folder: FolderType) => void
  setFolders: (folders: ImapFolder[]) => void
}

export const useEmailStore = create<EmailStore>((set) => ({
  unreadCount: 0,
  failedCount: 0,
  lastSeenUids: new Set(),
  activeFolder: 'inbox',
  folders: [],
  setUnreadCount: (count) => set({ unreadCount: count }),
  setFailedCount: (count) => set({ failedCount: count }),
  setLastSeenUids: (uids) => set({ lastSeenUids: uids }),
  markAllSeen: () => set({ unreadCount: 0 }),
  setActiveFolder: (folder) => set({ activeFolder: folder }),
  setFolders: (folders) => set({ folders }),
}))
