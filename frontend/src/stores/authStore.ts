import { create } from 'zustand'
import { persist } from 'zustand/middleware'
type User = { id:string; name:string; role:string; avatar?:string }
type AuthState = { user: User | null; token: string | null; login:(u:User,t:string)=>void; logout:()=>void; isAuthenticated:()=>boolean }
export const useAuthStore = create<AuthState>()(persist((set,get)=>({
  user:null, token:null,
  login:(user, token)=>{ localStorage.setItem('token',token); set({user,token}) },
  logout:()=>{ localStorage.removeItem('token'); set({user:null, token:null}) },
  isAuthenticated:()=> !!get().token,
}),{ name:'auth-storage', partialize:s=>({ user:s.user, token:s.token })}))
