import {CONFIG} from './config.js';
let auth,provider,authModule;
export async function setupAuth(onChange){
 if(!CONFIG.firebase.apiKey||!CONFIG.firebase.projectId){onChange(null,'LUMINA authentication requires the existing Firebase configuration.');return false;}
 const [{initializeApp},{getAuth,GoogleAuthProvider,onAuthStateChanged}]=await Promise.all([import('firebase/app'),import('firebase/auth')]);
 const app=initializeApp(CONFIG.firebase,'cc-global');auth=getAuth(app);provider=new GoogleAuthProvider();authModule=await import('firebase/auth');
 onAuthStateChanged(auth,u=>onChange(u,null));return true;
}
export async function signIn(){if(!auth)throw new Error('LUMINA authentication is not configured.');return authModule.signInWithPopup(auth,provider);}
export async function signOut(){if(auth)return authModule.signOut(auth);}
export async function idToken(){return auth?.currentUser?auth.currentUser.getIdToken():null;}
