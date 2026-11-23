export function pushToken(value: unknown): string {
  if (typeof value !== 'string' || value.length < 20 || value.length > 4096 || !/^[A-Za-z0-9_:\-]+$/.test(value)) throw new Error('Invalid device token.');
  return value;
}
export function notificationPath(value: unknown): string {
  return typeof value === 'string' && /^\/(?!\/)[a-zA-Z0-9/?=&_%.-]*$/.test(value) ? value : '/';
}
