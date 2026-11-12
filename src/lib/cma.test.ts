import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creditedSeconds, dailyCredits, examTerms, indiaDay, indiaWeek, SUBJECTS, LEVELS } from './cma.ts';

test('study time cannot grow indefinitely after closing the tab or from clock reversal', () => {
  assert.equal(creditedSeconds(1000, 31000), 30);
  assert.equal(creditedSeconds(1000, 3601000), 90);
  assert.equal(creditedSeconds(31000, 1000), 0);
});
test('check-in rolls over at India midnight, including year boundary', () => {
  assert.equal(indiaDay(Date.parse('2026-12-31T18:29:59Z')), '2026-12-31');
  assert.equal(indiaDay(Date.parse('2026-12-31T18:30:00Z')), '2027-01-01');
});
test('all levels have unique paper identifiers including Final electives', () => {
  assert.equal(new Set(SUBJECTS.map(s => s.id)).size, 22);
  assert.deepEqual(LEVELS.map(l => SUBJECTS.filter(s => s.level === l).length), [4,8,10]);
});
test('credited seconds split at midnight without duplicating time', () => {
  const start = Date.parse('2026-12-31T18:29:40Z');
  assert.deepEqual(dailyCredits(start,start+60000), {'2026-12-31':20,'2027-01-01':40});
  assert.equal(Object.values(dailyCredits(start,start+3600000)).reduce((a,b)=>a+b,0),90);
  assert.deepEqual(dailyCredits(start,start-1000),{});
});
test('calendar weeks run Monday to Sunday across a year boundary', () => {
  assert.deepEqual(indiaWeek(Date.parse('2027-01-01T10:00:00Z')), ['2026-12-28','2026-12-29','2026-12-30','2026-12-31','2027-01-01','2027-01-02','2027-01-03']);
});

test('exam terms are always upcoming June/December sessions', () => {
  assert.deepEqual(examTerms(new Date(2026, 10, 12)), ['Dec 2026 Term', 'June 2027 Term', 'Dec 2027 Term']);
  assert.deepEqual(examTerms(new Date(2027, 0, 5)), ['June 2027 Term', 'Dec 2027 Term', 'June 2028 Term']);
  assert.deepEqual(examTerms(new Date(2027, 5, 30)), ['June 2027 Term', 'Dec 2027 Term', 'June 2028 Term']);
});
