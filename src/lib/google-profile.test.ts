import { test } from 'node:test';
import assert from 'node:assert/strict';
import { googleStudentProfile } from './google-profile.ts';

test('Google signup creates a student with the selected course and bounded name', () => {
  const profile = googleStudentProfile({displayName:' A'.repeat(90),email:'student@example.test'},'Final');
  assert.equal(profile.role,'student'); assert.equal(profile.level,'Final'); assert.equal(profile.name.length,80);
});
test('Google signup handles missing names and refuses missing email', () => {
  assert.equal(googleStudentProfile({displayName:null,email:'student@example.test'},'Foundation').name,'CMA Student');
  assert.throws(() => googleStudentProfile({displayName:'Student',email:null},'Intermediate'), /email address/);
});
