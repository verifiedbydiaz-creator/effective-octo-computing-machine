import { supabase } from '@/lib/supabase'
import { KanbanBoard } from '@/components/backlog/kanban-board'
import type { BacklogItem } from '@/lib/types'

export default async function BacklogPage() {
  const { data } = await supabase
    .from('backlog_items')
    .select('*')
    .order('sort_order')
    .order('created_at')

  const items = (data ?? []) as BacklogItem[]

  return (
    <div className="flex flex-col h-screen p-4 md:p-6 overflow-hidden">
      <KanbanBoard initialItems={items} />
    </div>
  )
}
