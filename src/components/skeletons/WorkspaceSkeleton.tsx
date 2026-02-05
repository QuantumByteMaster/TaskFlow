import { Skeleton } from "@/components/ui/skeleton"
import { Link2, ListTodo, LayoutGrid, Sparkles, Zap, StickyNote } from "lucide-react"

const WIDGET_ICONS = [
  { icon: Link2, label: "Links" },
  { icon: ListTodo, label: "Tasks" },
  { icon: LayoutGrid, label: "Kanban" },
  { icon: Sparkles, label: "AI" },
  { icon: Zap, label: "Quick" },
  { icon: StickyNote, label: "Notes" }
]

export default function WorkspaceSkeleton() {
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

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Welcome header */}
        <div className="mb-12 space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-72 opacity-60" />
        </div>

        {/* Widget grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {WIDGET_ICONS.map((item, i) => {
            const Icon = item.icon
            return (
              <div 
                key={i}
                className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-white/[0.04] p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-400 dark:text-white/40" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-4 w-full mb-2 opacity-60" />
                <Skeleton className="h-4 w-3/4 opacity-40" />
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
