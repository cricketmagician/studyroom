import { initializeAppCheck, ReCaptchaEnterpriseProvider, getToken, type AppCheck } from 'firebase/app-check';
import { getApp } from 'firebase/app';
export async function appCheckHeaders():Promise<Record<string,string>> {
  const key=process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;
  if(typeof window==='undefined' || !key || process.env.NEXT_PUBLIC_USE_EMULATOR==='true')return {};
  const scope=globalThis as typeof globalThis & {studyroomAppCheck?:AppCheck};
  scope.studyroomAppCheck??=initializeAppCheck(getApp(),{provider:new ReCaptchaEnterpriseProvider(key),isTokenAutoRefreshEnabled:true});
  return {'X-Firebase-AppCheck':(await getToken(scope.studyroomAppCheck)).token};
}
