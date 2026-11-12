"use client";
import { RequireRole } from '@/lib/auth';
import { RoutinesSection } from '@/components/routines-section';

export default function RoutinesPage() {
  return <RequireRole><RoutinesSection/></RequireRole>;
}
