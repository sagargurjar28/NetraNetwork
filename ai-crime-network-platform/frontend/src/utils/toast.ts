let handler: ((msg: string, type?: string) => void) | null = null
export function registerToast(fn: (msg: string, type?: string) => void) { handler = fn }
export function toast(msg: string, type: 'success' | 'error' | 'info' = 'info') {
  if (handler) handler(msg, type)
  else console.log('[toast]', type, msg)
}
