'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useTaskContext } from '@/context/TaskContext'
import Navbar from '@/components/Navbar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from 'framer-motion'
import { Task } from '@/context/TaskContext'
import TaskForm from '@/components/TaskForm'
import NaturalSearchBar from '@/components/NaturalSearchBar'
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton'

export default function Dashboard() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { tasks, loading: tasksLoading, error, fetchTasks, showToast, updateTask, deleteTask } = useTaskContext();
  const [sortField, setSortField] = useState<keyof Task>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [aiFilters, setAiFilters] = useState<any>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated && !authLoading) {
        router.push('/auth/login');
      } else if (isAuthenticated && !authLoading) {
        fetchTasks();
      }
    };
    init();
  }, [isAuthenticated, authLoading, router, fetchTasks]);

  const handleSort = (field: keyof Task) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleFilter = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value === 'all' ? '' : value });
  };

  const handleAISearch = (searchFilters: any, interpretation: string) => {
    setAiFilters(searchFilters);
  };

  const handleClearAISearch = () => {
    setAiFilters(null);
  };

  const filteredAndSortedTasks = tasks
    ? tasks
        .filter((task: Task) => {
          const manualMatch = (!filters.status || task.status === filters.status) &&
            (!filters.priority || task.priority === filters.priority) &&
            (!filters.search || task.title.toLowerCase().includes(filters.search.toLowerCase()));
          
          if (!aiFilters) return manualMatch;
          
          let aiMatch = true;
          if (aiFilters.priority && task.priority !== aiFilters.priority) aiMatch = false;
          if (aiFilters.status && task.status !== aiFilters.status) aiMatch = false;
          if (aiFilters.dueDate) {
            const taskDate = new Date(task.dueDate);
            if (aiFilters.dueDate.$gte && taskDate < new Date(aiFilters.dueDate.$gte)) aiMatch = false;
            if (aiFilters.dueDate.$lte && taskDate > new Date(aiFilters.dueDate.$lte)) aiMatch = false;
            if (aiFilters.dueDate.$lt && taskDate >= new Date(aiFilters.dueDate.$lt)) aiMatch = false;
          }
          if (aiFilters.title && !task.title.toLowerCase().includes(aiFilters.title.$regex?.toLowerCase() || '')) aiMatch = false;
          
          return aiMatch;
        })
        .sort((a: Task, b: Task) => {
          if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
          if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        })
    : [];

  if (!isAuthenticated) {
    return null
  }

  if (authLoading || tasksLoading) return <DashboardSkeleton />;
  if (error) return <div className="flex justify-center items-center h-screen text-slate-600 dark:text-neutral-400">Error: {error}</div>;

  return (
    <div className="min-h-screen">
      <Navbar />
       
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Tasks</h1>
            <p className="text-slate-500 dark:text-neutral-500">Manage your tasks efficiently</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAddingTask(true)}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
            <button
              onClick={() => router.push('/kanban')}
              className="btn-secondary"
            >
              Board View
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="mb-6">
          <NaturalSearchBar 
            onSearch={handleAISearch}
            onClear={handleClearAISearch}
          />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Select onValueChange={(value) => handleFilter('status', value)}>
            <SelectTrigger className="bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-white/10">
              <SelectItem value="all" className="text-slate-700 dark:text-neutral-300">All Statuses</SelectItem>
              <SelectItem value="To Do" className="text-slate-700 dark:text-neutral-300">To Do</SelectItem>
              <SelectItem value="In Progress" className="text-slate-700 dark:text-neutral-300">In Progress</SelectItem>
              <SelectItem value="Completed" className="text-slate-700 dark:text-neutral-300">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => handleFilter('priority', value)}>
            <SelectTrigger className="bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-white/10">
              <SelectItem value="all" className="text-slate-700 dark:text-neutral-300">All Priorities</SelectItem>
              <SelectItem value="Low" className="text-slate-700 dark:text-neutral-300">Low</SelectItem>
              <SelectItem value="Medium" className="text-slate-700 dark:text-neutral-300">Medium</SelectItem>
              <SelectItem value="High" className="text-slate-700 dark:text-neutral-300">High</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            placeholder="Search tasks..." 
            onChange={(e) => handleFilter('search', e.target.value)}
            className="w-full bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 placeholder:text-slate-400 dark:placeholder:text-neutral-600"
          />
        </div>
        <div className="mb-6 flex justify-center gap-1">
          <button 
            onClick={() => handleSort('title')}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              sortField === 'title' 
                ? 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white' 
                : 'text-slate-500 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            Title {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            onClick={() => handleSort('dueDate')}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              sortField === 'dueDate' 
                ? 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white' 
                : 'text-slate-500 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            Due Date {sortField === 'dueDate' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            onClick={() => handleSort('priority')}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              sortField === 'priority' 
                ? 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white' 
                : 'text-slate-500 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            Priority {sortField === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
        <AnimatePresence>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredAndSortedTasks.length > 0 ? (
              filteredAndSortedTasks.map((task: Task) => (
                <motion.div
                  key={task._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <div className="h-full bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-white/[0.08] p-5 flex flex-col hover:shadow-md dark:hover:shadow-none hover:border-slate-300 dark:hover:border-white/15 transition-all duration-150">
                    {/* Title */}
                    <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-3">{task.title}</h3>
                    
                    {/* Description */}
                    {task.description && (
                      <p className="text-slate-500 dark:text-neutral-500 text-sm mb-4 line-clamp-2">{task.description}</p>
                    )}
                    
                    {/* Meta info */}
                    <div className="flex-grow space-y-1.5 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 dark:text-neutral-600 w-16">Status</span>
                        <span className={`font-medium ${
                          task.status === 'Completed' ? 'text-emerald-600 dark:text-emerald-400' : 
                          task.status === 'In Progress' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-neutral-400'
                        }`}>{task.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 dark:text-neutral-600 w-16">Priority</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          task.priority === 'High' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 
                          task.priority === 'Medium' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}>{task.priority}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 dark:text-neutral-600 w-16">Due</span>
                        <span className="text-slate-600 dark:text-neutral-400">{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Buttons */}
                    <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-white/5 mt-auto">
                      <button 
                        onClick={() => updateTask(task._id, { status: task.status === 'To Do' ? 'In Progress' : 'Completed' })}
                        className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-slate-200 dark:border-white/10"
                      >
                        {task.status === 'To Do' ? 'Start' : 'Complete'}
                      </button>
                      <button 
                        onClick={() => deleteTask(task._id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-400 dark:text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-400 dark:text-neutral-500">
                No tasks found
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      {isAddingTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-white/10">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Add New Task</h2>
            <TaskForm
              onSubmit={() => {
                setIsAddingTask(false);
                showToast('Task created successfully', 'success');
              }}
              onCancel={() => setIsAddingTask(false)}
              showToast={showToast}
            />
          </div>
        </div>
      )}
    </div>
  )
}