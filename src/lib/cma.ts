// The app serves CMA Intermediate only (ICMAI Syllabus 2022, Papers 5 to 12).
export const LEVELS = ['Intermediate'] as const;
export type Level = typeof LEVELS[number];
export const DEFAULT_GOAL_MINUTES = 150;
/** The next three ICMAI exam terms (June and December), e.g. ["Dec 2026 Term", "June 2027 Term", "Dec 2027 Term"]. */
export function examTerms(now = new Date()) {
    let year = now.getFullYear(), june = now.getMonth() <= 5;
    return Array.from({ length: 3 }, () => {
        const term = `${june ? 'June' : 'Dec'} ${year} Term`;
        if (!june) year++;
        june = !june;
        return term;
    });
}
export const SUBJECTS = [
    ['5', 'Intermediate', 'Business Laws and Ethics'],
    ['6', 'Intermediate', 'Financial Accounting'],
    ['7', 'Intermediate', 'Direct and Indirect Taxation'],
    ['8', 'Intermediate', 'Cost Accounting'],
    ['9', 'Intermediate', 'Operations Management and Strategic Management'],
    ['10', 'Intermediate', 'Corporate Accounting and Auditing'],
    ['11', 'Intermediate', 'Financial Management and Business Data Analytics'],
    ['12', 'Intermediate', 'Management Accounting'],
].map(([id, level, name]) => ({ id, level, name }));
export const indiaDay = (now = Date.now()) => new Date(now + 330 * 60000).toISOString().slice(0, 10);
export function creditedSeconds(last: number, now: number) {
    // A lost connection or closed browser never earns an unbounded session.
    return Math.max(0, Math.min(90, Math.floor((now - last) / 1000)));
}
export const duration = (seconds = 0) => `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m`;
export function dailyCredits(last: number, now: number) {
    const result: Record<string, number> = {};
    let cursor = last;
    const end = last + creditedSeconds(last, now) * 1000;
    while (cursor < end) {
        const day = indiaDay(cursor);
        const midnight = Date.parse(`${day}T00:00:00+05:30`) + 86400000;
        const next = Math.min(end, midnight);
        result[day] = (result[day] ?? 0) + (next - cursor) / 1000;
        cursor = next;
    }
    return result;
}
export function indiaWeek(now: number) {
    const date = new Date(`${indiaDay(now)}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
    return Array.from({ length: 7 }, (_, i) => new Date(date.getTime() + i * 86400000).toISOString().slice(0, 10));
}
export type StudyState = {
    dailyGoalMinutes?: number;
    level?: Level;
    totalSeconds?: number;
    checkinCount?: number;
    lastCheckin?: string;
    streak?: number;
    lastSeen?: number;
    lastMaterial?: string;
    hideStudyStatus?: boolean;
    onboardingCompleted?: boolean;
    targetExam?: string;
    primarySubject?: string;
    subjects?: Record<string, number>;
    active?: {
        id: string;
        subject: string;
        startedAt: number;
        last: number;
        seconds: number;
    } | null;
};
