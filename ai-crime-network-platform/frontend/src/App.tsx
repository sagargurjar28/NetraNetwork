import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/components/ui/Toast'
import { AppShell } from '@/components/layout/AppShell'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary'
import Login from '@/pages/Login'
import NetworkHome from '@/pages/NetworkAnalysisPage'
import GraphExplorer from '@/components/InvestigationBoard/InvestigationBoard'
import Entities from '@/pages/network/Entities'
import EntityDetail from '@/pages/network/EntityDetail'
import Cases from '@/pages/network/Cases'
import CaseDetail from '@/pages/CaseInvestigationPage'
import DocsHome from '@/pages/DocumentManagementPage'
import UploadWizard from '@/pages/documents/UploadWizard'
import Library from '@/pages/documents/Library'
import DocumentDetail from '@/pages/documents/Detail'
import CopilotPage from '@/pages/copilot/FullPage'
import Settings from '@/pages/Settings'
import Admin from '@/pages/Admin'

const qc = new QueryClient({ defaultOptions:{ queries:{ retry:1, staleTime: 30000 }}})

export default function App(){
  return (
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/login" element={<Login/>}/>
              <Route element={<AuthGuard/>}>
                <Route element={<AppShell/>}>
                  <Route path="/" element={<Navigate to="/network" replace/>}/>
                  <Route path="/network" element={<RouteErrorBoundary label="Network home"><NetworkHome/></RouteErrorBoundary>}/>
                  <Route path="/network/graph" element={<RouteErrorBoundary label="Graph"><GraphExplorer/></RouteErrorBoundary>}/>
                  <Route path="/network/boards/:boardId" element={<RouteErrorBoundary label="Board"><GraphExplorer/></RouteErrorBoundary>}/>
                  <Route path="/network/entities" element={<RouteErrorBoundary label="Entities"><Entities/></RouteErrorBoundary>}/>
                  <Route path="/network/entities/:id" element={<RouteErrorBoundary label="Entity detail"><EntityDetail/></RouteErrorBoundary>}/>
                  <Route path="/network/cases" element={<RouteErrorBoundary label="Cases"><Cases/></RouteErrorBoundary>}/>
                  <Route path="/network/cases/:id" element={<RouteErrorBoundary label="Case detail"><CaseDetail/></RouteErrorBoundary>}/>
                  <Route path="/documents" element={<RouteErrorBoundary label="Documents home"><DocsHome/></RouteErrorBoundary>}/>
                  <Route path="/documents/upload" element={<RouteErrorBoundary label="Upload"><UploadWizard/></RouteErrorBoundary>}/>
                  <Route path="/documents/library" element={<RouteErrorBoundary label="Library"><Library/></RouteErrorBoundary>}/>
                  <Route path="/documents/:id" element={<RouteErrorBoundary label="Document detail"><DocumentDetail/></RouteErrorBoundary>}/>
                  <Route path="/copilot" element={<RouteErrorBoundary label="Copilot"><CopilotPage/></RouteErrorBoundary>}/>
                  <Route path="/settings" element={<RouteErrorBoundary label="Settings"><Settings/></RouteErrorBoundary>}/>
                  <Route path="/admin" element={<RouteErrorBoundary label="Admin"><Admin/></RouteErrorBoundary>}/>
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}
