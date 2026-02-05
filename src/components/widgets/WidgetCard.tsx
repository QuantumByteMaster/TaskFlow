'use client'

import { Draggable } from '@hello-pangea/dnd'
import { GripVertical, X } from 'lucide-react'
import { Widget } from '@/types/widgets'

interface WidgetCardProps {
  widget: Widget;
  index: number;
  onRemove: (id: string) => void;
  children: React.ReactNode;
  isLarge?: boolean;
  isSpecial?: boolean;
}

export default function WidgetCard({ 
  widget, 
  index, 
  onRemove, 
  children,
  isLarge = false,
  isSpecial = false
}: WidgetCardProps) {
  return (
    <Draggable draggableId={widget.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`
            group relative
            ${isLarge ? 'col-span-2' : 'col-span-1'}
            ${snapshot.isDragging ? 'z-50' : ''}
          `}
        >
          <div 
            className={`
              h-full rounded-xl border transition-all duration-200
              ${isSpecial 
                ? 'bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-white/5 dark:to-white/[0.02] border-violet-100 dark:border-white/10 hover:border-violet-200 dark:hover:border-white/20' 
                : 'bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/15 hover:shadow-md dark:hover:shadow-none'
              }
              ${snapshot.isDragging ? 'shadow-xl ring-2 ring-slate-200 dark:ring-white/20' : ''}
            `}
          >
            {/* Drag Handle */}
            <div 
              {...provided.dragHandleProps}
              className="absolute top-2 left-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-slate-400 dark:text-neutral-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-white"
            >
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemove(widget.id)}
              className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 dark:text-neutral-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Widget Content */}
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}
