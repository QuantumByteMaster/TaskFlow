'use client';

import { TaskProvider } from '@/context/TaskContext';
import '@/app/globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import SpotlightModal from '@/components/SpotlightModal';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <TaskProvider>
              {children}
              <SpotlightModal />
            </TaskProvider>
            <Toaster 
              position="top-center"
              toastOptions={{
                className: '',
                style: {
                  background: 'var(--toast-bg, #fff)',
                  color: 'var(--toast-color, #1e293b)',
                  border: '1px solid var(--toast-border, #e2e8f0)',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}