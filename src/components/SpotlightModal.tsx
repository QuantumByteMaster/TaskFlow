'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Plus, Command, CornerDownLeft } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Action {
  id: string
  label: string
  icon: 'navigate' | 'create'
  keywords: string[]
  action: () => void
}

export default function SpotlightModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Define available actions
  const baseActions: Action[] = [
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      icon: 'navigate',
      keywords: ['dashboard', 'home', 'tasks', 'main'],
      action: () => { router.push('/dashboard'); close(); }
    },
    {
      id: 'kanban',
      label: 'Go to Kanban Board',
      icon: 'navigate',
      keywords: ['kanban', 'board', 'scrum', 'agile'],
      action: () => { router.push('/kanban'); close(); }
    },
    {
      id: 'links',
      label: 'Go to Links',
      icon: 'navigate',
      keywords: ['links', 'bookmarks', 'urls'],
      action: () => { router.push('/links'); close(); }
    },
    {
      id: 'workspace',
      label: 'Go to Workspace',
      icon: 'navigate',
      keywords: ['workspace', 'widgets', 'home'],
      action: () => { router.push('/workspace'); close(); }
    },
    {
      id: 'calendar',
      label: 'Go to Calendar',
      icon: 'navigate',
      keywords: ['calendar', 'events', 'schedule', 'planner'],
      action: () => { router.push('/calendar'); close(); }
    },
    {
      id: 'personal',
      label: 'Go to Personal Dashboard',
      icon: 'navigate',
      keywords: ['personal', 'goals', 'focus', 'dashboard'],
      action: () => { router.push('/personal'); close(); }
    },
    {
      id: 'profile',
      label: 'Go to Profile',
      icon: 'navigate',
      keywords: ['profile', 'settings', 'account', 'user'],
      action: () => { router.push('/profile'); close(); }
    },
  ]

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  // Filter actions based on query
  const filteredActions = query.trim()
    ? baseActions.filter(action => 
        action.label.toLowerCase().includes(query.toLowerCase()) ||
        action.keywords.some(k => k.includes(query.toLowerCase()))
      )
    : baseActions

  // Check if query looks like a task creation command
  const isTaskCommand = query.toLowerCase().startsWith('add task:') || 
                        query.toLowerCase().startsWith('new task:') ||
                        query.toLowerCase().startsWith('task:')

  const taskTitle = isTaskCommand 
    ? query.replace(/^(add task:|new task:|task:)\s*/i, '').trim()
    : ''

  // Create task action
  const createTask = async () => {
    if (!taskTitle) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        '/api/tasks',
        { 
          title: taskTitle, 
          priority: 'Medium', 
          status: 'To Do',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Default: 1 week from now
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(`Task "${taskTitle}" created!`)
      close()
    } catch (error) {
      console.error('Task creation error:', error)
      toast.error('Failed to create task')
    }
  }

  // All displayable actions
  const allActions = isTaskCommand && taskTitle
    ? [{ id: 'create-task', label: `Create Task: "${taskTitle}"`, icon: 'create' as const, keywords: [], action: createTask }, ...filteredActions]
    : filteredActions

  // Keyboard listener for Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      
      if (isOpen) {
        if (e.key === 'Escape') {
          close()
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, allActions.length - 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter') {
          e.preventDefault()
          allActions[selectedIndex]?.action()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, allActions, selectedIndex, close])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50"
        onClick={close}
      />
      
      {/* Modal */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50">
        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-white/5">
            <Search className="w-5 h-5 text-slate-400 dark:text-neutral-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or type a command..."
              className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 outline-none text-base"
            />
            <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-neutral-600">
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[10px] font-medium">ESC</kbd>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-72 overflow-y-auto py-2">
            {allActions.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400 dark:text-neutral-500 text-sm">
                No results found
              </div>
            ) : (
              allActions.map((action, index) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-slate-100 dark:bg-white/5'
                      : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    action.icon === 'create'
                      ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-neutral-400'
                  }`}>
                    {action.icon === 'create' ? (
                      <Plus className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </div>
                  <span className="flex-1 text-sm text-slate-700 dark:text-neutral-200">
                    {action.label}
                  </span>
                  {index === selectedIndex && (
                    <CornerDownLeft className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2.5 border-t border-slate-100 dark:border-white/5 flex items-center gap-4 text-xs text-slate-400 dark:text-neutral-500">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[10px]">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[10px]">↵</kbd>
              select
            </span>
            <span className="flex items-center gap-1 ml-auto">
              <span className="text-slate-300 dark:text-neutral-600">Tip:</span>
              Type <kbd className="font-mono text-slate-500 dark:text-neutral-400">task: Buy milk</kbd> to quick-add
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
