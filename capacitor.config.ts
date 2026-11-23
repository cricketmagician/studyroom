import type { CapacitorConfig } from '@capacitor/cli';

const config:CapacitorConfig={
  appId:'com.abhyas.cma',appName:'Abhyas',webDir:'mobile',loggingBehavior:'none',
  // Next.js server routes stay on the existing backend; only this trusted origin gets the native bridge.
  server:{url:'https://studyroom-five-jade.vercel.app',cleartext:false,errorPath:'offline.html'},
  android:{allowMixedContent:false,webContentsDebuggingEnabled:false},
  plugins:{
    SplashScreen:{
      launchAutoHide:true,
      launchShowDuration:1500,
      launchFadeOutDuration:400,
      backgroundColor:'#0B6B5C', // same teal as the web splash, so the native splash flows straight into the animation
      showSpinner:false,
      splashFullScreen:true,
      splashImmersive:true,
    },
    PushNotifications:{presentationOptions:['badge','sound','alert']},
  },
};
export default config;
