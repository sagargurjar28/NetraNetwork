import axios from 'axios'
const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api', timeout: 15000 })
client.interceptors.request.use(cfg=>{
  const token = localStorage.getItem('token')
  if(token) cfg.headers.Authorization = `Bearer ${token}`
  if(import.meta.env.DEV) console.log('[API]', cfg.method, cfg.url)
  return cfg
})
client.interceptors.response.use(res=>{
  if(import.meta.env.DEV) console.log('[API RES]', res.config.url, res.status)
  return res
}, err=>{
  const msg = err.response?.data?.message || err.message || 'Unknown error'
  if(err.response?.status===401){ localStorage.removeItem('token'); window.location.href='/login' }
  return Promise.reject({ message:msg, status:err.response?.status, raw:err })
})
export default client
