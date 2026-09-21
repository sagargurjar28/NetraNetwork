import { useQuery } from '@tanstack/react-query'
import { networkApi } from '@/services/api'
export const useEntities = (q?:string)=> useQuery({ queryKey:['entities',q], queryFn:()=> networkApi.getEntities({q}) })
export const useEntity = (id:string)=> useQuery({ queryKey:['entity',id], queryFn:()=> networkApi.getEntity(id), enabled:!!id })
export const useCases = (q?:string)=> useQuery({ queryKey:['cases',q], queryFn:()=> networkApi.getCases({q}) })
export const useCase = (id:string)=> useQuery({ queryKey:['case',id], queryFn:()=> networkApi.getCase(id), enabled:!!id })
export const useGraph = ()=> useQuery({ queryKey:['graph'], queryFn:()=> networkApi.getGraph() })
export const useNetworkStats = ()=> useQuery({ queryKey:['network-stats'], queryFn:()=> networkApi.stats() })
