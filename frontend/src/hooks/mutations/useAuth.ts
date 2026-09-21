import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
export const useLogin = ()=>{
  const login = useAuthStore(s=>s.login)
  return useMutation({ mutationFn:({username,password}:{username:string,password:string})=> authApi.login(username,password), onSuccess:(data)=>{ login(data.user, data.token) } })
}
