import { create } from 'zustand'

type EmailStore = {
  gmailUnread: number
  imapUnread: number
  failedCount: number
  lastSeenUids: Set<number>
  setGmailUnread: (count: number) => void
  setImapUnread: (count: number) => void
  setFailedCount: (count: number) => void
  setLastSeenUids: (uids: Set<number>) => void
}

export const useEmailStore = create<EmailStore>((set) => ({
  gmailUnread: 0,
  imapUnread: 0,
  failedCount: 0,
  lastSeenUids: new Set(),
  setGmailUnread: (count) => set({ gmailUnread: count }),
  setImapUnread: (count) => set({ imapUnread: count }),
  setFailedCount: (count) => set({ failedCount: count }),
  setLastSeenUids: (uids) => set({ lastSeenUids: uids }),
}))
