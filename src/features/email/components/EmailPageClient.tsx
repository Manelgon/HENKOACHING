'use client'

import { useState } from 'react'
import EmailConfigForm from './EmailConfigForm'
import BandejaInbox from './BandejaInbox'
import type { EmailConfigPublic } from '@/actions/email'

type Tab = 'bandeja' | 'config'

type Props = {
  config: EmailConfigPublic
}

export default function EmailPageClient({ config }: Props) {
  const [tab, setTab] = useState<Tab>('bandeja')

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        <TabBtn active={tab === 'bandeja'} onClick={() => setTab('bandeja')}>
          Bandeja de entrada
        </TabBtn>
        <TabBtn active={tab === 'config'} onClick={() => setTab('config')}>
          Configuración
        </TabBtn>
      </div>

      {tab === 'bandeja' && (
        <BandejaInbox hasImapConfig={!!(config.imap_host && config.hasImapPassword)} emailConfig={config} />
      )}
      {tab === 'config' && <EmailConfigForm config={config} />}
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-2 rounded-xl font-raleway text-sm font-semibold transition-colors ${
        active
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  )
}
