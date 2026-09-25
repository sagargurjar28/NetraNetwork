import React from 'react'
import { ErrorState } from '@/components/ui/ErrorState'
export class ErrorBoundary extends React.Component<{children:React.ReactNode},{hasError:boolean,msg:string}>{
  constructor(props:any){ super(props); this.state={hasError:false,msg:''}}
  static getDerivedStateFromError(e:any){ return {hasError:true, msg:e?.message||'Unexpected error'}}
  render(){ if(this.state.hasError) return <ErrorState message={this.state.msg} onRetry={()=> this.setState({hasError:false})}/>; return this.props.children }
}
