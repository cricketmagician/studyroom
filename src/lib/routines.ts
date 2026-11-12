import { indiaDay } from './cma';

export const CATEGORIES = ['Study', 'Exam prep', 'Sports', 'Health', 'Reminder', 'Other'] as const;
export const REPEATS = ['Once', 'Daily', 'Weekdays', 'Custom'] as const;
export const REMINDERS = [0, 5, 10, 15, 30, 60] as const;
export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export type RoutineInput = {
  title: string; category: typeof CATEGORIES[number]; time: string; minutes: number;
  repeat: typeof REPEATS[number]; days: number[]; startDate: string; reminder: number; note: string;
};
export type Routine = RoutineInput & { id: string };
export type RoutineState = { items: Routine[]; day: string; done: string[] };

export function validDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function validateRoutine(value: unknown): RoutineInput {
  if (!value || typeof value !== 'object') throw new Error('Enter your routine details.');
  const r = value as RoutineInput;
  if (typeof r.title !== 'string' || !r.title.trim() || r.title.trim().length > 100) throw new Error('Give your routine a name (up to 100 characters).');
  if (!CATEGORIES.includes(r.category) || !REPEATS.includes(r.repeat)) throw new Error('Choose a category and repeat schedule.');
  if (typeof r.time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(r.time)) throw new Error('Choose a valid time.');
  if (!Number.isInteger(r.minutes) || r.minutes < 5 || r.minutes > 480) throw new Error('Duration must be 5–480 minutes.');
  if (!validDate(r.startDate)) throw new Error('Choose a valid starting date.');
  if (!Array.isArray(r.days) || r.days.length > 7 || r.days.some(d => !Number.isInteger(d) || d < 0 || d > 6) || (r.repeat === 'Custom' && !r.days.length)) throw new Error('Choose at least one day for a custom schedule.');
  if (!REMINDERS.includes(r.reminder as typeof REMINDERS[number])) throw new Error('Choose a reminder time.');
  if (typeof r.note !== 'string' || r.note.length > 1000) throw new Error('Keep your note under 1,000 characters.');
  return { title:r.title.trim(), category:r.category, time:r.time, minutes:r.minutes, repeat:r.repeat,
    days:[...new Set(r.days)].sort(), startDate:r.startDate, reminder:r.reminder, note:r.note.trim() };
}

export function occursOn(r: RoutineInput, day: string) {
  if (day < r.startDate) return false;
  const weekday = new Date(day + 'T00:00:00Z').getUTCDay();
  return r.repeat === 'Once' ? day === r.startDate : r.repeat === 'Daily' ||
    (r.repeat === 'Weekdays' ? weekday >= 1 && weekday <= 5 : r.days.includes(weekday));
}

export function scheduleLabel(r: RoutineInput) {
  return r.repeat === 'Custom' ? r.days.map(d => DAYS[d]).join(', ') : r.repeat === 'Once' ? r.startDate : r.repeat === 'Daily' ? 'Every day' : 'Mon–Fri';
}

export function timeLabel(time: string) {
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

// shortcut: reminders need an open app; add a server scheduler for closed-app delivery.
export function dueReminder(r: Routine, now: number) {
  for (const day of [indiaDay(now), indiaDay(now + 86400000)]) {
    const start = Date.parse(`${day}T${r.time}:00+05:30`);
    if (occursOn(r, day) && now >= start - r.reminder * 60000 && now < start + 60000) return day;
  }
  return null;
}

export const TEMPLATES: Omit<RoutineInput, 'startDate'>[] = [
  { title:'Study session', category:'Study', time:'18:00', minutes:60, repeat:'Daily', days:[], reminder:10, note:'' },
  { title:'Revise for exams', category:'Exam prep', time:'21:00', minutes:30, repeat:'Daily', days:[], reminder:10, note:'' },
  { title:'Gym / workout', category:'Sports', time:'06:30', minutes:45, repeat:'Custom', days:[1,3,5], reminder:10, note:'' },
  { title:'Morning walk', category:'Sports', time:'06:00', minutes:30, repeat:'Daily', days:[], reminder:5, note:'' },
  { title:'Drink water', category:'Health', time:'11:00', minutes:5, repeat:'Daily', days:[], reminder:0, note:'' },
  { title:'Plan tomorrow', category:'Other', time:'22:00', minutes:15, repeat:'Daily', days:[], reminder:5, note:'' },
];
