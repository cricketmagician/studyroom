"use client";
import { Capacitor, registerPlugin } from '@capacitor/core';
import type { Routine } from './routines';
export const isNative = () => Capacitor.getPlatform() === 'android';
export const AbhyasNative = registerPlugin<{
  googleSignIn(): Promise<{idToken:string}>;
  syncAuth(options:{token:string}): Promise<void>;
  logout(): Promise<void>;
  syncRoutines(options:{items:Routine[]}): Promise<void>;
  timer(options:{id:string;subject?:string;startedAt?:number}): Promise<{stopped?:boolean}>;
  exactAlarmStatus(): Promise<{granted:boolean}>;
  settings(options:{kind:'alarms'|'app'}): Promise<void>;
}>('AbhyasNative');

export async function shareLocalImage(url: string, name: string) {
  const { Filesystem, Directory } = await import('@capacitor/filesystem');
  const { Share } = await import('@capacitor/share');
  const blob = await (await fetch(url)).blob();
  const data = await new Promise<string>((resolve,reject) => {
    const reader = new FileReader(); reader.onload=()=>resolve(String(reader.result).split(',')[1]); reader.onerror=()=>reject(new Error('Could not read image.')); reader.readAsDataURL(blob);
  });
  const path = `note-export-${Date.now()}-${name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
  const file = await Filesystem.writeFile({path,data,directory:Directory.Cache});
  // Keep the cached export until Android has finished handing it to the chosen app.
  await Share.share({title:name,files:[file.uri],dialogTitle:'Save or share original photo'});
}
