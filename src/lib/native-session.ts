"use client";
import { AbhyasNative, isNative } from './native';
import { postAi } from './ai-client';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { auth } from './firebase/config';
let syncedUid = '';
let signingOut = false;
let currentToken = '';
let listeners: Promise<unknown> | null = null;
let syncing: Promise<void> | null = null;
export async function syncNativeAuth() {
  if (!isNative() || !auth.currentUser) return;
  const uid = auth.currentUser.uid;
  if (syncedUid === uid) return;
  if (syncing) await syncing;
  if (syncedUid === uid) return;
  syncing = (async () => {
    const result = await postAi<{token:string}>('/api/mobile',{action:'native_auth'});
    if (auth.currentUser?.uid !== uid) return;
    await AbhyasNative.syncAuth(result); syncedUid = uid; signingOut=false;
  })();
  try { await syncing; } finally { syncing = null; }
}
export async function registerNativePush() {
  if (!isNative()) return;
  listeners ??= Promise.all([
    PushNotifications.addListener('registration', async ({value}) => {
      currentToken = value;
      if (auth.currentUser && !signingOut) await postAi('/api/mobile',{action:'register',token:value}).catch(() => window.dispatchEvent(new Event('native:push-error')));
    }),
    PushNotifications.addListener('registrationError', () => window.dispatchEvent(new Event('native:push-error'))),
    PushNotifications.addListener('pushNotificationActionPerformed', async ({notification}) => {
      const { notificationPath } = await import('./mobile-validation');
      window.location.assign(notificationPath(notification.data?.url));
    }),
  ]);
  await listeners;
  if ((await PushNotifications.checkPermissions()).receive === 'granted') await PushNotifications.register();
}
export async function clearNativeSession() {
  if (!isNative()) return;
  if (syncing) await syncing.catch(()=>{});
  signingOut=true;
  if (currentToken && auth.currentUser) await postAi('/api/mobile',{action:'unregister',token:currentToken}).catch(()=>{});
  await LocalNotifications.cancel(await LocalNotifications.getPending());
  await AbhyasNative.logout();
  await PushNotifications.removeAllDeliveredNotifications();
  syncedUid = ''; currentToken = '';
}
