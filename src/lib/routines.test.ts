import test from 'node:test';
import assert from 'node:assert/strict';
import { dueReminder, occursOn, TEMPLATES, validateRoutine } from './routines';

const routine = { ...TEMPLATES[0], id:'test', startDate:'2026-11-11' };
test('routine validation rejects malformed values and strips unknown fields', () => {
  assert.equal(validateRoutine({...routine, title:'  Revision  ', role:'teacher'}).title, 'Revision');
  assert.equal('role' in validateRoutine({...routine, role:'teacher'}), false);
  for (const patch of [{title:' '}, {time:'24:00'}, {minutes:0}, {minutes:NaN}, {startDate:'2026-02-30'}, {repeat:'Custom',days:[]}, {days:[7]}, {reminder:2}, {category:'Unknown'}, {note:'a'.repeat(1001)}]) {
    assert.throws(() => validateRoutine({...routine,...patch}));
  }
});
test('repeat schedules respect start date, weekends and one-time dates', () => {
  assert.equal(occursOn(routine, '2026-11-10'), false);
  assert.equal(occursOn(routine, '2026-11-14'), true);
  assert.equal(occursOn({...routine,repeat:'Weekdays'}, '2026-11-14'), false);
  assert.equal(occursOn({...routine,repeat:'Weekdays'}, '2026-11-16'), true);
  assert.equal(occursOn({...routine,repeat:'Once'}, '2026-11-12'), false);
  assert.equal(occursOn({...routine,repeat:'Custom',days:[3]}, '2026-11-11'), true);
});
test('reminders use India time, stop after start and support midnight crossover', () => {
  assert.equal(dueReminder(routine, Date.parse('2026-11-11T17:49:00+05:30')), null);
  assert.equal(dueReminder(routine, Date.parse('2026-11-11T17:50:00+05:30')), '2026-11-11');
  assert.equal(dueReminder(routine, Date.parse('2026-11-11T18:01:00+05:30')), null);
  assert.equal(dueReminder({...routine,time:'00:05'}, Date.parse('2026-11-11T23:56:00+05:30')), '2026-11-12');
});
