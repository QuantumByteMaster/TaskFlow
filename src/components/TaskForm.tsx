'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTaskContext } from '@/context/TaskContext'
import { Task } from '@/context/TaskContext'
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import axios from 'axios'


type TaskFormProps = {
  task?: Task
  onSubmit: () => void
  onCancel: () => void
  showToast: (message: string, type: 'success' | 'error') => void
}

export default function TaskForm({ task, onSubmit, onCancel, showToast }: TaskFormProps) {
  const { addTask, updateTask } = useTaskContext()
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [status, setStatus] = useState<'To Do' | 'In Progress' | 'Completed'>(task?.status || 'To Do')
  const [priority, setPriority] = useState(task?.priority || 'Medium')
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate ? new Date(task.dueDate) : undefined)
  
  // AI Enrichment state
  const [isEnriching, setIsEnriching] = useState(false)
  const [suggestions, setSuggestions] = useState<any>(null)
  const [appliedFields, setAppliedFields] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const taskData = { 
      title, 
      description, 
      status, 
      priority, 
      dueDate: dueDate ? dueDate.toISOString() : undefined
    }
    try {
      if (task?._id) {
        await updateTask(task._id, taskData)
        showToast('Task updated successfully', 'success')
      } else {
        await addTask({
          ...taskData,
          dueDate: taskData.dueDate || ''
        });
      }
      onSubmit()
    } catch (error) {
      console.error('Error submitting task:', error)
      showToast('Error creating/updating task', 'error')
    }
  }

  // Get AI suggestions for task
  const handleEnrichTask = async () => {
    if (!title.trim()) {
      showToast('Please enter a task title first', 'error')
      return
    }

    setIsEnriching(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        '/api/ai/enrich-task',
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuggestions(response.data.suggestions)
      setAppliedFields([])
    } catch (error) {
      console.error('Error enriching task:', error)
      showToast('Failed to get AI suggestions', 'error')
    } finally {
      setIsEnriching(false)
    }
  }

  // Apply individual suggestion
  const applySuggestion = (field: string) => {
    if (!suggestions) return
    
    if (field === 'priority') {
      setPriority(suggestions.priority)
    } else if (field === 'dueDate') {
      setDueDate(new Date(suggestions.dueDate))
    }
    
    setAppliedFields([...appliedFields, field])
    setTimeout(() => {
      setAppliedFields(appliedFields.filter(f => f !== field))
    }, 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-slate-800">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="title" className="text-gray-700">Title</Label>
          <button
            type="button"
            onClick={handleEnrichTask}
            disabled={isEnriching || !title.trim()}
            className="ai-badge flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Get AI suggestions"
          >
            {isEnriching ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            )}
            {isEnriching ? 'Analyzing...' : 'AI Suggest'}
          </button>
        </div>
        <Input
          id="title"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="text-gray-800"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-700">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="text-gray-800"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value: 'To Do' | 'In Progress' | 'Completed') => setStatus(value)}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="To Do">To Do</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select value={priority} onValueChange={(value: "Low" | "Medium" | "High") => setPriority(value)}>
          <SelectTrigger id="priority">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate" className="text-gray-700">Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`w-full justify-start text-left font-normal ${!dueDate ? "text-gray-500" : "text-gray-800"}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* AI Suggestions Cards */}
      {suggestions && (
        <div className="space-y-3 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 animate-fade-in-up">
          <div className="flex items-center gap-2 text-sm font-semibold text-purple-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Suggestions (Confidence: {Math.round(suggestions.confidence * 100)}%)
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Priority Suggestion */}
            <div className={`p-3 bg-white rounded-lg border border-gray-200 transition-all duration-300 ${appliedFields.includes('priority') ? 'ring-2 ring-emerald-500 shadow-lg' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</span>
                <button
                  type="button"
                  onClick={() => applySuggestion('priority')}
                  className="text-xs px-2 py-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                >
                  Apply
                </button>
              </div>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                suggestions.priority === 'High' ? 'bg-red-100 text-red-700' : 
                suggestions.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                'bg-emerald-100 text-emerald-700'
              }`}>
                {suggestions.priority}
              </span>
            </div>

            {/* Due Date Suggestion */}
            <div className={`p-3 bg-white rounded-lg border border-gray-200 transition-all duration-300 ${appliedFields.includes('dueDate') ? 'ring-2 ring-emerald-500 shadow-lg' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Due Date</span>
                <button
                  type="button"
                  onClick={() => applySuggestion('dueDate')}
                  className="text-xs px-2 py-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                >
                  Apply
                </button>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {new Date(suggestions.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Tags Suggestion */}
            {suggestions.tags && suggestions.tags.length > 0 && (
              <div className="p-3 bg-white rounded-lg border border-gray-200 md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Suggested Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.tags.map((tag: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">{task?._id ? 'Update' : 'Create'} Task</button>
      </div>
    </form>
  )
}
