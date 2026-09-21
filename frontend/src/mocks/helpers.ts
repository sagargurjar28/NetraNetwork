export const isMock = ()=> import.meta.env.VITE_USE_MOCKS === 'true'
export const delay = (ms?:number)=> new Promise(r=> setTimeout(r, ms ?? (200+Math.random()*600)))
export const maybeError = (rate=0.08)=> Math.random() < rate
