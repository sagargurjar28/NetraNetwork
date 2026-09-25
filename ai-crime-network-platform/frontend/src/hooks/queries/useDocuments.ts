import { useQuery } from '@tanstack/react-query'
import { documentsApi } from '@/services/api'
export const useDocuments = (q?:string)=> useQuery({ queryKey:['documents',q], queryFn:()=> documentsApi.list({q}) })
export const useDocument = (id:string)=> useQuery({ queryKey:['document',id], queryFn:()=> documentsApi.get(id), enabled:!!id })
export const useDocumentStats = ()=> useQuery({ queryKey:['doc-stats'], queryFn:()=> documentsApi.stats() })
