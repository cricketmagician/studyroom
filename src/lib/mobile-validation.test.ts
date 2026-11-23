import test from 'node:test';
import assert from 'node:assert/strict';
import { notificationPath, pushToken } from './mobile-validation';
test('notification navigation stays within our app',()=>{
  for(const path of ['https://evil.test','//evil.test','/\\evil.test','javascript:alert(1)',null]) assert.equal(notificationPath(path),'/');
  assert.equal(notificationPath('/?view=Friends'),'/?view=Friends');
});
test('device tokens reject malformed values',()=>{
  for(const token of ['',42,'x'.repeat(4097),'foo/bar','token\n'+'a'.repeat(30)]) assert.throws(()=>pushToken(token));
  assert.equal(pushToken('abc_123:token-'+'a'.repeat(30)), 'abc_123:token-'+'a'.repeat(30));
});
