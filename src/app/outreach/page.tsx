import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { OutreachBoard } from '@/components/outreach/outreach-board'
import type { OutreachContact } from '@/lib/types'

export const metadata: Metadata = { title: 'Outreach' }

export default async function OutreachPage() {
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('outreach_contacts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col h-screen p-4 md:p-6 overflow-hidden">
      <OutreachBoard
        initialContacts={(data ?? []) as OutreachContact[]}
        today={today}
      />
    </div>
  )
}
