'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'
import { Plus, Link2, ClipboardList, LayoutGrid, Sparkles } from 'lucide-react'
import { Widget, WidgetType, WIDGET_CATALOG, DEFAULT_WIDGETS } from '@/types/widgets'
import WidgetCard from './WidgetCard'
import ScratchpadWidget from './ScratchpadWidget'
import QuickTasksWidget from './QuickTasksWidget'
import DailyBriefingWidget from './DailyBriefingWidget'

interface WidgetGridProps {
  onOpenAIModal: () => void;
}

const STORAGE_KEY = 'dashboard-widgets'

export default function WidgetGrid({ onOpenAIModal }: WidgetGridProps) {
  const router = useRouter()
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setWidgets(JSON.parse(saved))
      } catch {
        setWidgets(DEFAULT_WIDGETS)
      }
    } else {
      setWidgets(DEFAULT_WIDGETS)
    }
  }, [])

  useEffect(() => {
    if (widgets.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets))
    }
  }, [widgets])

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const items = Array.from(widgets)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    setWidgets(items)
  }

  const handleRemoveWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id))
  }

  const handleAddWidget = (type: WidgetType) => {
    const config = WIDGET_CATALOG.find(w => w.type === type)
    if (!config) return
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: config.title
    }
    setWidgets(prev => [...prev, newWidget])
    setIsAddMenuOpen(false)
  }

  const isWidgetAdded = (type: WidgetType) => widgets.some(w => w.type === type)

  const WidgetIcon = ({ type }: { type: WidgetType }) => {
    const iconClass = "w-5 h-5"
    switch (type) {
      case 'links':
        return <Link2 className={`${iconClass} text-slate-600 dark:text-neutral-400`} />
      case 'tasks':
        return <ClipboardList className={`${iconClass} text-slate-600 dark:text-neutral-400`} />
      case 'kanban':
        return <LayoutGrid className={`${iconClass} text-slate-600 dark:text-neutral-400`} />
      case 'ai':
        return <Sparkles className={`${iconClass} text-white dark:text-black`} />
      default:
        return null
    }
  }

  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case 'links':
        return (
          <button onClick={() => router.push('/links')} className="w-full text-left group/inner">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 group-hover/inner:bg-slate-200 dark:group-hover/inner:bg-white/10 transition-colors">
              <WidgetIcon type="links" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Links</h3>
            <p className="text-sm text-slate-500 dark:text-neutral-500">Save your favorite websites</p>
          </button>
        )

      case 'tasks':
        return (
          <button onClick={() => router.push('/dashboard')} className="w-full text-left group/inner">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 group-hover/inner:bg-slate-200 dark:group-hover/inner:bg-white/10 transition-colors">
              <WidgetIcon type="tasks" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Task List</h3>
            <p className="text-sm text-slate-500 dark:text-neutral-500">View and manage all your tasks</p>
          </button>
        )

      case 'kanban':
        return (
          <button onClick={() => router.push('/kanban')} className="w-full text-left group/inner">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 group-hover/inner:bg-slate-200 dark:group-hover/inner:bg-white/10 transition-colors">
              <WidgetIcon type="kanban" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Kanban Board</h3>
            <p className="text-sm text-slate-500 dark:text-neutral-500">Drag and drop task management</p>
          </button>
        )

      case 'ai':
        return (
          <button onClick={onOpenAIModal} className="w-full text-left">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center">
                <WidgetIcon type="ai" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
                AI Powered
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">AI Assistant</h3>
            <p className="text-sm text-slate-600 dark:text-neutral-500 mb-3">Describe any goal and get a complete task breakdown instantly</p>
            <div className="flex items-center text-slate-900 dark:text-white text-sm font-medium gap-1">
              <span>Try it now</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        )

      case 'quickTasks':
        return <QuickTasksWidget />

      case 'scratchpad':
        return <ScratchpadWidget />

      case 'dailyBriefing':
        return <DailyBriefingWidget />

      default:
        return null
    }
  }

  const isLargeWidget = (type: WidgetType) => ['quickTasks', 'scratchpad', 'dailyBriefing'].includes(type)

  return (
    <div className="relative">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="widgets" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {widgets.map((widget, index) => (
                <WidgetCard
                  key={widget.id}
                  widget={widget}
                  index={index}
                  onRemove={handleRemoveWidget}
                  isLarge={isLargeWidget(widget.type)}
                  isSpecial={widget.type === 'ai'}
                >
                  {renderWidgetContent(widget)}
                </WidgetCard>
              ))}
              {provided.placeholder}

              {/* Add Widget Button */}
              <div className="col-span-1 relative">
                <button
                  onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                  className="w-full h-full min-h-[140px] rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-white"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-sm font-medium">Add Widget</span>
                </button>

                {isAddMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsAddMenuOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-[#0a0a0a] rounded-xl shadow-xl border border-slate-200 dark:border-white/10 p-2 z-50">
                      <p className="text-xs font-semibold text-slate-400 dark:text-neutral-600 uppercase tracking-wider px-2 py-1 mb-1">
                        Available Widgets
                      </p>
                      {WIDGET_CATALOG.map(config => {
                        const added = isWidgetAdded(config.type)
                        return (
                          <button
                            key={config.type}
                            onClick={() => !added && handleAddWidget(config.type)}
                            disabled={added}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                              added ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                              <WidgetIcon type={config.type} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-700 dark:text-white">{config.title}</p>
                              <p className="text-xs text-slate-400 dark:text-neutral-500">{config.description}</p>
                            </div>
                            {added && (
                              <span className="text-[10px] text-slate-400 dark:text-neutral-500 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                                Added
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
