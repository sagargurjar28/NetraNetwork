import React from 'react'
import { ErrorState } from '@/components/ui/ErrorState'

type S = { hasError: boolean; msg: string }
export class RouteErrorBoundary extends React.Component<{ children: React.ReactNode; label?: string }, S> {
  state: S = { hasError: false, msg: '' }
  static getDerivedStateFromError(e: any): S { return { hasError: true, msg: e?.message || 'Route crashed' } }
  componentDidCatch(err: any) { console.error('[RouteErrorBoundary]', this.props.label, err) }
  render() {
    if (this.state.hasError) return <ErrorState message={(this.props.label ? this.props.label + ': ' : '') + this.state.msg} onRetry={() => this.setState({ hasError: false, msg: '' })} />
    return this.props.children
  }
}
