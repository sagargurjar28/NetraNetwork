/**
 * API barrel — re-exports every public symbol from src/services/api/*.
 * Rule: no file under src/services/api/ may import from this barrel
 * (each module imports directly from siblings; prevents cycles).
 */
export { default as apiClient } from './api/client'
export * from './api/admin'
export * from './api/auth'
export * from './api/copilot'
export * from './api/documents'
export * from './api/network'
export * from './api/boards'
