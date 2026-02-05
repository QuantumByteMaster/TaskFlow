import { Skeleton } from "@/components/ui/skeleton"
import { LayoutGrid, Circle, Clock, CheckCircle2, Plus, List } from "lucide-react"

const COLUMN_ICONS = [
  { icon: Circle, label: "To Do", color: "text-slate-400 dark:text-white/40" },
  { icon: Clock, label: "In Progress", color: "text-amber-500 dark:text-amber-400" },
  { icon: CheckCircle2, label: "Completed", color: "text-emerald-500 dark:text-emerald-400" }
]

export default function KanbanSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navbar */}
      <div className="h-16 border-b border-slate-200 dark:border-white/[0.04] px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-white/10 flex items-center justify-center">
            <LayoutGrid className="w-3.5 h-3.5 text-slate-400 dark:text-white/40" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex items-center gap-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-6 h-6 text-slate-300 dark:text-white/20" />
              <Skeleton className="h-7 w-36" />
            </div>
            <Skeleton className="h-4 w-56 opacity-60" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 rounded-lg bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center gap-2">
              <Plus className="w-4 h-4 text-slate-400 dark:text-white/40" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="h-9 w-24 rounded-lg bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center gap-2">
              <List className="w-4 h-4 text-slate-400 dark:text-white/40" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>

        {/* Kanban columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMN_ICONS.map((column, colIndex) => {
            const Icon = column.icon
            return (
              <div 
                key={colIndex} 
                className="bg-slate-50 dark:bg-white/[0.02] rounded-2xl p-4 min-h-[500px] border border-slate-200 dark:border-white/[0.04]"
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${column.color}`} />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-5 w-6 rounded" />
                </div>
                
                {/* Cards */}
                <div className="space-y-3">
                  {[1, 2, 3].map((card) => (
                    <div 
                      key={card} 
                      className="bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-slate-200 dark:border-white/[0.04]"
                    >
                      <Skeleton className="h-4 w-3/4 mb-3" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-12 rounded" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
