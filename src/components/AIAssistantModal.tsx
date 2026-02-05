'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIAssistantModal({ isOpen, onClose }: AIAssistantModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<{ title: string; description: string; priority: 'Low' | 'Medium' | 'High'; dueDateOffset?: number }[]>([]);
  const { addTask } = useTasks();

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('Failed to generate tasks');
      }

      const data = await response.json();
      setGeneratedTasks(data as typeof generatedTasks);
    } catch (error) {
      console.error("AI Generation failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (task: typeof generatedTasks[0], index: number) => {
    const dueDate = new Date();
    if (task.dueDateOffset) {
      dueDate.setDate(dueDate.getDate() + task.dueDateOffset);
    }

    await addTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: 'To Do',
      dueDate: dueDate.toISOString()
    });
    setGeneratedTasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddAll = async () => {
    for (const task of generatedTasks) {
      const dueDate = new Date();
      if (task.dueDateOffset) {
        dueDate.setDate(dueDate.getDate() + task.dueDateOffset);
      }
      
      await addTask({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: 'To Do',
        dueDate: dueDate.toISOString()
      });
    }
    setGeneratedTasks([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-xl border border-slate-200 dark:border-white/[0.08]"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-white/[0.08]">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-slate-600 dark:text-neutral-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-white">AI Task Breakdown</h2>
                    <p className="text-slate-500 dark:text-neutral-500 text-xs">
                      Describe your goal and get actionable tasks
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              {!generatedTasks.length ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                      What do you want to accomplish?
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Plan a birthday party..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:border-slate-300 dark:focus:border-white/20 focus:bg-white dark:focus:bg-white/[0.08] outline-none transition-all text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                  </div>
                  
                  <button 
                    onClick={handleGenerate} 
                    disabled={isLoading || !prompt}
                    className="w-full py-2.5 text-sm font-medium rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Tasks
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-slate-900 dark:text-white text-sm">
                      {generatedTasks.length} tasks generated
                    </h3>
                    <button 
                      onClick={() => setGeneratedTasks([])} 
                      className="text-xs text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
                      Start over
                    </button>
                  </div>
                  
                  <div className="max-h-[280px] overflow-y-auto space-y-2">
                    {generatedTasks.map((task, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/[0.06] group hover:border-slate-200 dark:hover:border-white/10 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-slate-900 dark:text-white text-sm truncate">{task.title}</h4>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0
                                ${task.priority === 'High' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 
                                  task.priority === 'Medium' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 
                                  'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-neutral-500 mt-1 line-clamp-2">{task.description}</p>
                          </div>
                          <button 
                            onClick={() => handleAddTask(task, index)}
                            className="p-1.5 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <button 
                    onClick={handleAddAll} 
                    className="w-full py-2.5 text-sm font-medium rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 transition-all"
                  >
                    Add all to tasks
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
