import { create } from 'zustand'
import { persist } from 'zustand/middleware'
type UploadState = { step:number; file: any; metadata:any; setStep:(n:number)=>void; setFile:(f:any)=>void; setMetadata:(m:any)=>void; reset:()=>void }
export const useUploadStore = create<UploadState>()(persist((set)=>({
  step:1, file:null, metadata:{},
  setStep:(step)=> set({step}), setFile:(file)=> set({file}), setMetadata:(metadata)=> set({metadata}), reset:()=> set({step:1,file:null,metadata:{}}),
}),{ name:'upload-storage'}))
