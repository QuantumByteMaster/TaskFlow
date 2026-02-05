'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import { 
  ChevronLeft, ChevronRight, Plus, X, Check, 
  Calendar, Clock, Bell, Trash2, Edit3, Mail
} from 'lucide-react'

// Types
interface Reminder {
  type: 'email' | 'push' | 'both'
  timeBefore: number
  sent: boolean
}

interface CalendarEvent {
  _id: string
  title: string
  description: string
  date: string
  endDate?: string
  allDay: boolean
  color: string
  reminders: Reminder[]
}

// Color options for events
const EVENT_COLORS = [
  { name: 'blue', bg: 'bg-blue-500', light: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400' },
  { name: 'green', bg: 'bg-emerald-500', light: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' },
  { name: 'purple', bg: 'bg-purple-500', light: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400' },
  { name: 'orange', bg: 'bg-orange-500', light: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400' },
  { name: 'red', bg: 'bg-red-500', light: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400' },
  { name: 'pink', bg: 'bg-pink-500', light: 'bg-pink-100 dark:bg-pink-500/20', text: 'text-pink-600 dark:text-pink-400' },
  { name: 'indigo', bg: 'bg-indigo-500', light: 'bg-indigo-100 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400' },
  { name: 'teal', bg: 'bg-teal-500', light: 'bg-teal-100 dark:bg-teal-500/20', text: 'text-teal-600 dark:text-teal-400' },
]

// Reminder options
const REMINDER_OPTIONS = [
  { label: '5 minutes before', value: 5 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '2 hours before', value: 120 },
  { label: '1 day before', value: 1440 },
]

export default function CalendarPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  
  const [viewDate, setViewDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  
  // Form state
  const [eventTitle, setEventTitle] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [eventColor, setEventColor] = useState('blue')
  const [eventReminders, setEventReminders] = useState<number[]>([30])
  const [allDay, setAllDay] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // Fetch events
  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user, viewDate])

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token')
      const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
      const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0)
      
      const response = await fetch(
        `/api/events?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calendar calculations
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  const navigateMonth = (direction: number) => {
    setViewDate(new Date(year, month + direction, 1))
  }

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === day && 
             eventDate.getMonth() === month && 
             eventDate.getFullYear() === year
    })
  }

  const openNewEventModal = (date: Date) => {
    setSelectedDate(date)
    setEditingEvent(null)
    setEventTitle('')
    setEventDescription('')
    setEventDate(date.toISOString().split('T')[0])
    setEventTime('09:00')
    setEventColor('blue')
    setEventReminders([30])
    setAllDay(false)
    setShowEventModal(true)
  }

  const openEditEventModal = (event: CalendarEvent) => {
    setEditingEvent(event)
    setEventTitle(event.title)
    setEventDescription(event.description)
    const d = new Date(event.date)
    setEventDate(d.toISOString().split('T')[0])
    setEventTime(d.toTimeString().slice(0, 5))
    setEventColor(event.color)
    setEventReminders(event.reminders.map(r => r.timeBefore))
    setAllDay(event.allDay)
    setShowEventModal(true)
  }

  const closeModal = () => {
    setShowEventModal(false)
    setEditingEvent(null)
  }

  const saveEvent = async () => {
    if (!eventTitle.trim()) return

    const token = localStorage.getItem('token')
    const dateTime = allDay 
      ? new Date(eventDate + 'T00:00:00')
      : new Date(eventDate + 'T' + eventTime)

    const eventData = {
      title: eventTitle,
      description: eventDescription,
      date: dateTime.toISOString(),
      allDay,
      color: eventColor,
      reminders: eventReminders.map(minutes => ({
        type: 'email',
        timeBefore: minutes,
        sent: false
      }))
    }

    try {
      const url = editingEvent 
        ? `/api/events/${editingEvent._id}`
        : '/api/events'
      
      const response = await fetch(url, {
        method: editingEvent ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      })

      if (response.ok) {
        fetchEvents()
        closeModal()
      }
    } catch (error) {
      console.error('Failed to save event:', error)
    }
  }

  const deleteEvent = async (eventId: string) => {
    const token = localStorage.getItem('token')
    
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        fetchEvents()
        closeModal()
      }
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  const toggleReminder = (minutes: number) => {
    setEventReminders(prev => 
      prev.includes(minutes) 
        ? prev.filter(m => m !== minutes)
        : [...prev, minutes]
    )
  }

  const getColorClasses = (colorName: string) => {
    return EVENT_COLORS.find(c => c.name === colorName) || EVENT_COLORS[0]
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Calendar</h1>
            <p className="text-slate-500 dark:text-neutral-500 mt-1">Manage your events and reminders</p>
          </div>
          <button
            onClick={() => openNewEventModal(new Date())}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Event</span>
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-white/[0.06] overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-lg text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold min-w-[200px] text-center">
                {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 rounded-lg text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            {!isCurrentMonth && (
              <button
                onClick={() => setViewDate(new Date())}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
              >
                Today
              </button>
            )}
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-white/[0.06]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-sm font-medium text-slate-500 dark:text-neutral-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before first of month */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="min-h-[120px] border-b border-r border-slate-100 dark:border-white/[0.04] bg-slate-50 dark:bg-neutral-950/50" />
            ))}
            
            {/* Day cells */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const isToday = isCurrentMonth && day === today.getDate()
              const dayEvents = getEventsForDay(day)
              const cellDate = new Date(year, month, day)
              
              return (
                <div
                  key={day}
                  onClick={() => openNewEventModal(cellDate)}
                  className="min-h-[120px] border-b border-r border-slate-100 dark:border-white/[0.04] p-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full mb-1 ${
                    isToday 
                      ? 'bg-indigo-500 text-white font-semibold' 
                      : 'text-slate-600 dark:text-neutral-400'
                  }`}>
                    {day}
                  </div>
                  
                  {/* Events for this day */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => {
                      const colorClasses = getColorClasses(event.color)
                      return (
                        <div
                          key={event._id}
                          onClick={(e) => { e.stopPropagation(); openEditEventModal(event) }}
                          className={`px-2 py-1 rounded-md text-xs font-medium truncate ${colorClasses.light} ${colorClasses.text} hover:opacity-80 transition-opacity`}
                        >
                          {event.title}
                        </div>
                      )
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-slate-400 dark:text-neutral-500 px-2">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div 
            className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/50 dark:border-white/[0.08] w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Minimal */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {editingEvent ? 'Edit Event' : 'New Event'}
                </h3>
                <button onClick={closeModal} className="p-2 -mr-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - Clean minimal form */}
            <div className="px-6 pb-4 space-y-4">
              {/* Title - Large input */}
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Event title"
                autoFocus
                className="w-full text-lg font-medium px-0 py-2 bg-transparent border-0 border-b-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-neutral-600 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
              />

              {/* Description */}
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Add description..."
                rows={2}
                className="w-full text-sm px-0 py-2 bg-transparent border-0 text-slate-600 dark:text-neutral-300 placeholder-slate-300 dark:placeholder-neutral-600 outline-none resize-none"
              />

              {/* Date & Time Row */}
              <div className="flex items-center gap-3 py-3 border-t border-slate-100 dark:border-white/[0.04]">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div className="flex-1 flex gap-3">
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border-0 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 ring-indigo-500/20"
                  />
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    disabled={allDay}
                    className="w-28 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border-0 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 ring-indigo-500/20 disabled:opacity-40"
                  />
                </div>
              </div>

              {/* All Day Toggle */}
              <label className="flex items-center gap-3 py-2 cursor-pointer group">
                <div className={`w-10 h-6 rounded-full transition-all relative ${
                  allDay ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-white/10'
                }`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                    allDay ? 'left-5' : 'left-1'
                  }`} />
                </div>
                <span className="text-sm text-slate-600 dark:text-neutral-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">All day</span>
              </label>

              {/* Color Selection - Inline */}
              <div className="flex items-center gap-3 py-3 border-t border-slate-100 dark:border-white/[0.04]">
                <span className="text-sm text-slate-500 dark:text-neutral-500 min-w-[60px]">Color</span>
                <div className="flex gap-2">
                  {EVENT_COLORS.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setEventColor(color.name)}
                      className={`w-7 h-7 rounded-full ${color.bg} transition-all ${
                        eventColor === color.name 
                          ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 ring-slate-900/20 dark:ring-white/20 scale-110' 
                          : 'hover:scale-110 opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Reminders - Clean chips */}
              <div className="py-3 border-t border-slate-100 dark:border-white/[0.04]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-neutral-300">Remind me</span>
                </div>
                <div className="flex flex-wrap gap-2 ml-[52px]">
                  {REMINDER_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => toggleReminder(option.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        eventReminders.includes(option.value)
                          ? 'bg-indigo-500 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer - Clean action buttons */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
              {editingEvent ? (
                <button
                  onClick={() => deleteEvent(editingEvent._id)}
                  className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  Delete
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEvent}
                  disabled={!eventTitle.trim()}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-semibold hover:bg-slate-800 dark:hover:bg-neutral-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {editingEvent ? 'Save' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
