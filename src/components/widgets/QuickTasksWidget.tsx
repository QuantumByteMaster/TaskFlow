'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Zap, CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Task {
  _id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status: string;
}

export default function QuickTasksWidget() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const filtered = response.data
        .filter((t: Task) => t.status !== 'Completed')
        .sort((a: Task, b: Task) => {
          const priorityOrder = { High: 0, Medium: 1, Low: 2 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        })
        .slice(0, 4)
      
      setTasks(filtered)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = async (taskId: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem('token')
      const newStatus = currentStatus === 'Completed' ? 'To Do' : 'Completed'
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Quick Tasks</h3>
            <p className="text-xs text-slate-400 dark:text-neutral-500">Top priority items</p>
          </div>
        </div>
        <button 
          onClick={() => router.push('/dashboard')}
          className="text-sm text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-300 dark:border-white/20 border-t-slate-600 dark:border-t-white"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-6 text-slate-400 dark:text-neutral-500 text-sm">
            <p>No pending tasks!</p>
            <p className="text-xs mt-1">All caught up 🎉</p>
          </div>
        ) : (
          tasks.map(task => (
            <div 
              key={task._id}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors group"
            >
              <button 
                onClick={() => toggleTask(task._id, task.status)}
                className="flex-shrink-0"
              >
                {task.status === 'Completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className={`w-5 h-5 ${
                    task.priority === 'High' ? 'text-rose-500' :
                    task.priority === 'Medium' ? 'text-amber-500' :
                    'text-neutral-400'
                  } group-hover:text-emerald-400 transition-colors`} />
                )}
              </button>
              <span className={`text-sm flex-1 truncate ${task.status === 'Completed' ? 'text-neutral-400 line-through' : 'text-slate-700 dark:text-neutral-300'}`}>
                {task.title}
              </span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                task.priority === 'High' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                task.priority === 'Medium' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-neutral-400'
              }`}>
                {task.priority}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
