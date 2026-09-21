import { useQuery } from '@tanstack/react-query'
import { copilotApi } from '@/services/api'
export const useConversations = ()=> useQuery({ queryKey:['conversations'], queryFn:()=> copilotApi.listConversations() })
