// Widget type definitions

export type WidgetType = 
  | 'links' 
  | 'tasks' 
  | 'kanban' 
  | 'ai' 
  | 'quickTasks' 
  | 'scratchpad'
  | 'dailyBriefing';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
}

export interface WidgetConfig {
  type: WidgetType;
  title: string;
  description: string;
  icon: string; // SVG path or icon name
  isLarge?: boolean; // Takes 2 columns
}

// Available widgets catalog
export const WIDGET_CATALOG: WidgetConfig[] = [
  {
    type: 'dailyBriefing',
    title: 'Daily Briefing',
    description: 'AI-powered morning productivity report',
    icon: 'sparkles',
    isLarge: true
  },
  {
    type: 'quickTasks',
    title: 'Quick Tasks',
    description: 'Your top priority tasks at a glance',
    icon: 'zap',
    isLarge: true
  },
  {
    type: 'links',
    title: 'Links',
    description: 'Save your favorite websites',
    icon: 'link'
  },
  {
    type: 'tasks',
    title: 'Task List',
    description: 'View and manage all your tasks',
    icon: 'clipboard'
  },
  {
    type: 'kanban',
    title: 'Kanban Board',
    description: 'Drag and drop task management',
    icon: 'kanban'
  },
  {
    type: 'ai',
    title: 'AI Assistant',
    description: 'Get instant task breakdowns',
    icon: 'sparkles'
  },
  {
    type: 'scratchpad',
    title: 'Scratchpad',
    description: 'Quick notes and ideas',
    icon: 'edit',
    isLarge: true
  }
];

// Default layout for new users
export const DEFAULT_WIDGETS: Widget[] = [
  { id: 'widget-0', type: 'dailyBriefing', title: 'Daily Briefing' },
  { id: 'widget-1', type: 'links', title: 'Links' },
  { id: 'widget-2', type: 'tasks', title: 'Task List' },
  { id: 'widget-3', type: 'kanban', title: 'Kanban Board' },
  { id: 'widget-4', type: 'ai', title: 'AI Assistant' },
];
