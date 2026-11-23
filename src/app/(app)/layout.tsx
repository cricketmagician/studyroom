"use client";
import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { StudyNavigation } from '@/components/study-navigation';
import '@/components/study-hub.css';

function AppNav() {
  const pathname = usePathname() || '';
  const active = pathname.startsWith('/notes') ? 'Notes' : pathname === '/syllabus' ? 'Syllabus' : pathname === '/routines' ? 'Routines' : pathname === '/tasks' ? 'Planner' : pathname === '/profile' ? 'Profile' : 'Library';
  return <StudyNavigation active={active}/>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cma">
      <div className="cma-main">
        <main id="main" className="max-w-4xl mx-auto">
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </main>
        <Suspense fallback={null}>
          <AppNav />
        </Suspense>
      </div>
    </div>
  );
}
