"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpenText as BookOpen, ChartLineUp as ChartNoAxesCombined, House, ListChecks as ListTodo, NotePencil as NotebookPen, UsersThree as Users, UserCircle as UserRound, ShieldCheck, DotsThreeCircle as Ellipsis, X, Repeat as Repeat2, GraduationCap } from "@phosphor-icons/react";
import { useAuth } from '@/lib/auth';
import { haptic } from '@/lib/haptics';

export function StudyNavigation({ active, onChange }: { active?: string; onChange?: (view: string) => void }) {
  const { profile } = useAuth();
  const dialog = useRef<HTMLDialogElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = [
    { name: 'Home', view: 'Overview', href: '/', icon: House },
    { name: 'Library', view: 'Library', href: '/?view=Library', icon: BookOpen },
    { name: 'Progress', view: 'Progress', href: '/?view=Progress', icon: ChartNoAxesCombined },
    { name: 'Friends', view: 'Friends', href: '/?view=Friends', icon: Users },
  ];
  const secondary = [
    { name: 'Syllabus', view: 'Syllabus', href: '/syllabus', icon: GraduationCap, tint: 'violet' },
    { name: 'Routines', view: 'Routines', href: '/routines', icon: Repeat2, tint: 'pink' },
    { name: 'Planner', view: 'Planner', href: '/tasks', icon: ListTodo, tint: 'blue' },
    { name: 'Notes', view: 'Notes', href: '/notes', icon: NotebookPen, tint: 'amber' },
    { name: 'Profile', view: 'Profile', href: '/profile', icon: UserRound, tint: 'green' },
    ...(profile?.role === 'teacher' ? [{ name: 'Admin', view: 'Admin', href: '/admin', icon: ShieldCheck, tint: 'orange' }] : []),
  ];
  const moreActive = secondary.some(item => item.view === active);
  // One light tick for every tab, segment and menu tap on student screens.
  useEffect(() => {
    const tick = (e: MouseEvent) => { if ((e.target as Element | null)?.closest?.('.study-bottom-nav :is(a,button), .cma-segments button, .cma-more-grid a')) haptic(); };
    document.addEventListener('click', tick);
    return () => document.removeEventListener('click', tick);
  }, []);
  return <>
    <nav className="study-bottom-nav" aria-label="Main navigation"><div>{primary.map(({name,view,href,icon: Icon}) => {
    const content = <><Icon size={24} weight={active === view ? "fill" : "duotone"} aria-hidden="true"/><span>{name}</span></>;
    return onChange
      ? <button type="button" key={view} aria-current={active === view ? 'page' : undefined} onClick={() => onChange(view)}>{content}</button>
      : <Link key={view} href={href} aria-current={active === view ? 'page' : undefined}>{content}</Link>;
    })}
      <button type="button" aria-haspopup="dialog" aria-controls="study-more-dialog" aria-expanded={moreOpen} data-active={moreActive || undefined} onClick={() => { dialog.current?.showModal(); setMoreOpen(true); }}>
        <Ellipsis size={24} weight={moreActive ? "fill" : "duotone"} aria-hidden="true"/><span>More</span>
      </button>
    </div></nav>
    <dialog ref={dialog} id="study-more-dialog" className="cma-more-dialog" aria-labelledby="study-more-title" onClose={() => setMoreOpen(false)}>
      <header><div><span className="cma-eyebrow">YOUR STUDY TOOLS</span><h2 id="study-more-title">More from studyroom</h2></div><button type="button" autoFocus aria-label="Close study tools" onClick={() => dialog.current?.close()}><X size={20} aria-hidden="true"/></button></header>
      <div className="cma-more-grid">{secondary.map(({name,view,href,icon: Icon,tint}) => <Link key={view} href={href} aria-current={active === view ? 'page' : undefined} onClick={() => dialog.current?.close()}><span className="tint" data-tint={tint}><Icon size={24} weight="duotone" aria-hidden="true"/></span><span>{name}</span></Link>)}</div>
    </dialog>
  </>;
}

