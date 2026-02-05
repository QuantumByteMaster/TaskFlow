'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useTaskContext } from '@/context/TaskContext'
import Navbar from '@/components/Navbar'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import TaskForm from '@/components/TaskForm'
import { useTasks } from '@/hooks/useTasks'
import KanbanSkeleton from '@/components/skeletons/KanbanSkeleton'

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate: string;
}

type Column = {
  title: string;
  items: Task[];
};

type Columns = {
  [key: string]: Column;
};

type TaskStatus = 'To Do' | 'In Progress' | 'Completed';

export default function Kanban() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { tasks, loading: tasksLoading, error, fetchTasks, showToast } = useTaskContext();
  const { moveTask } = useTasks();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [columns, setColumns] = useState<Columns>({
    'To Do': { title: 'To Do', items: [] },
    'In Progress': { title: 'In Progress', items: [] },
    'Completed': { title: 'Completed', items: [] }
  });

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

  const getPriorityWeight = (priority: string) => {
    switch (priority) {
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 0;
    }
  };

  useEffect(() => {
    if (tasks.length > 0) {
      const newColumns: Columns = {
        'To Do': { title: 'To Do', items: [] },
        'In Progress': { title: 'In Progress', items: [] },
        'Completed': { title: 'Completed', items: [] }
      };
      
      const sortedTasks = [...tasks].sort((a, b) => {
        return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
      });
      
      sortedTasks.forEach(task => {
        if (newColumns[task.status]) {
          newColumns[task.status].items.push(task);
        }
      });
      setColumns(newColumns);
    }
  }, [tasks]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      
      const newColumns = {
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems }
      };
      
      setColumns(newColumns);
      await moveTask(removed._id, destination.droppableId as TaskStatus);
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: { ...column, items: copiedItems }
      });
    }
  };

  if (authLoading || tasksLoading) {
    return <KanbanSkeleton />;
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Navbar />
     
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Kanban Board</h1>
            <p className="text-slate-500 dark:text-neutral-500">Drag and drop to update task status</p>
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
              onClick={() => router.push('/dashboard')}
              className="btn-secondary"
            >
              List View
            </button>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(columns).map(([columnId, column]) => (
              <Droppable key={columnId} droppableId={columnId}>
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef} 
                    className="bg-slate-50 dark:bg-[#0a0a0a] rounded-2xl p-4 min-h-[500px] border border-slate-200 dark:border-white/[0.08]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-700 dark:text-white">{column.title}</h3>
                      <span className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-neutral-400 text-xs px-2 py-1 rounded-md font-medium">
                        {column.items.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {column.items.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => !snapshot.isDragging && setSelectedTask(task)}
                              className={`
                                bg-white dark:bg-[#111111] p-4 rounded-xl border cursor-grab active:cursor-grabbing
                                ${snapshot.isDragging 
                                  ? 'shadow-xl border-slate-300 dark:border-white/20' 
                                  : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/15 hover:shadow-md dark:hover:shadow-none'}
                                transition-all duration-150
                              `}
                              style={provided.draggableProps.style}
                            >
                              <h4 className="font-medium text-slate-900 dark:text-white mb-3 text-sm">{task.title}</h4>
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-medium
                                  ${task.priority === 'High' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 
                                    task.priority === 'Medium' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 
                                    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                                  {task.priority}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-neutral-500">
                                  {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </main>

      {/* Add Task Modal */}
      {isAddingTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-white/10">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Add New Task</h2>
            <TaskForm
              onSubmit={async () => {
                setIsAddingTask(false);
                await fetchTasks();
                showToast('Task created successfully', 'success');
              }}
              onCancel={() => setIsAddingTask(false)}
              showToast={showToast}
            />
          </div>
        </div>
      )}
      
      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50" onClick={() => setSelectedTask(null)}>
          <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedTask.title}</h2>
              <button 
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-500 dark:text-neutral-500 uppercase tracking-wide mb-1">Description</h3>
                <p className="text-slate-700 dark:text-neutral-300 text-sm">
                  {selectedTask.description || 'No description provided.'}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-neutral-500 uppercase tracking-wide mb-1">Status</h3>
                  <p className="text-sm font-medium text-slate-700 dark:text-neutral-300">{selectedTask.status}</p>
                </div>
                
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-neutral-500 uppercase tracking-wide mb-1">Priority</h3>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium
                    ${selectedTask.priority === 'High' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 
                    selectedTask.priority === 'Medium' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 
                    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                    {selectedTask.priority}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-neutral-500 uppercase tracking-wide mb-1">Due Date</h3>
                  <p className="text-sm text-slate-700 dark:text-neutral-300">{new Date(selectedTask.dueDate).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric' 
                  })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}