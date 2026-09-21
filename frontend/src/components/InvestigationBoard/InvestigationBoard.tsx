import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useParams, Link } from 'react-router-dom'
import { toPng } from 'html-to-image'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { boardsApi, type BoardConnection, type BoardPin, type EntityType } from '@/services/api/boards'
import { toast } from '@/utils/toast'
import { nodeTypes, type PinData } from './nodes'
import { Palette } from './Palette'
import { LabelPopover } from './LabelPopover'
import { BoardToolbar } from './BoardToolbar'
import { CaseHistoryPanel } from './CaseHistoryPanel'
import { useUIStore } from '@/stores/uiStore'

type RFNode = Node<{ pin: BoardPin; onRename: (pinId: string, label: string) => void }>
type RFEdge = Edge<{ conn: BoardConnection }>

const SECONDARY: EntityType[] = ['phone', 'location', 'document', 'note']
const DEFAULT_BOARD = 'board-1'

function edgeLabel(c: { label: string | null; confidence: number | null }): string | undefined {
  if (!c.label && c.confidence == null) return undefined
  return `${c.label || 'linked'}${c.confidence != null ? ` (${c.confidence})` : ''}`
}

function toRFNode(pin: BoardPin, onRename: PinData['onRename']): RFNode {
  return { id: pin.id, type: pin.entity_type, position: { x: pin.x, y: pin.y }, data: { pin, onRename } }
}

function toRFEdge(c: BoardConnection): RFEdge {
  return {
    id: c.id, source: c.source_pin_id, target: c.target_pin_id,
    label: edgeLabel(c),
    labelBgPadding: [6, 4] as [number, number],
    labelBgBorderRadius: 6,
    labelBgStyle: { fill: '#10161c', fillOpacity: 0.95 },
    labelStyle: { fill: '#8b98a5', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
    style: { stroke: '#5a6672', strokeWidth: 1.5 },
    data: { conn: c },
  }
}

/** Local error boundary: a canvas crash must not take down the route. */
class BoardErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError(): { failed: boolean } { return { failed: true } }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="flex h-[calc(100vh-96px)] gap-3">
        <Card className="w-[260px] shrink-0 p-4"><Palette /></Card>
        <Card className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
          <div className="font-medium text-text-primary">Board failed to load — try New Board.</div>
          <button onClick={() => window.location.reload()} className="rounded-control bg-accent-primary px-4 py-2 text-sm text-white hover:bg-accent-hover">
            New Board
          </button>
        </Card>
      </div>
    )
  }
}

function BoardCanvas() {
  const params = useParams()
  const boardId = (params as { boardId?: string }).boardId || DEFAULT_BOARD
  const [nodes, setNodes, onNodesChange] = useNodesState<RFNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFEdge>([])
  const [loading, setLoading] = useState(true)
  const [selectedPin, setSelectedPin] = useState<BoardPin | null>(null)
  const [selectedConn, setSelectedConn] = useState<BoardConnection | null>(null)
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; kind: 'node' | 'edge'; id: string } | null>(null)
  const [pendingNode, setPendingNode] = useState<{ type: EntityType; x: number; y: number } | null>(null)
  const [pendingEdge, setPendingEdge] = useState<{ source: string; target: string } | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const splitDrag = useRef(false)
  const boardRef = useRef(boardId)
  boardRef.current = boardId
  const split = useUIStore((s) => s.boardPanelSplit)
  const setSplit = useUIStore((s) => s.setBoardPanelSplit)
  const { screenToFlowPosition, fitView, zoomIn, zoomOut, getEdges } = useReactFlow()

  const onRename = useCallback((pinId: string, label: string) => {
    setNodes((nds) => nds.map((n) => (n.id === pinId ? { ...n, data: { ...n.data, pin: { ...n.data.pin, label } } } : n)))
    boardsApi.renamePin(boardRef.current, pinId, label)
    setSelectedPin((p) => (p && p.id === pinId ? { ...p, label } : p))
  }, [setNodes])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const b = await boardsApi.getBoard(boardRef.current)
      setNodes(b.pins.map((p) => toRFNode(p, onRename)))
      setEdges(b.connections.map(toRFEdge))
      setSelectedPin(null)
      setSelectedConn(null)
    } catch (e: unknown) {
      toast((e as { message?: string })?.message || 'Board failed to load', 'error')
    } finally {
      setLoading(false)
    }
  }, [onRename, setNodes, setEdges])

  useEffect(() => { void load() }, [load, boardId])

  function selectCase(caseId: string) {
    // TODO: real GET /api/cases/{id}/boards/ when backend is wired — all cases map to board-1 for now.
    void caseId
    toast('Loaded board for case', 'success')
    void load()
  }

  function onSplitPointerDown(e: React.PointerEvent) {
    splitDrag.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  function onSplitPointerMove(e: React.PointerEvent) {
    if (!splitDrag.current) return
    const parent = (e.currentTarget as HTMLElement).parentElement
    if (!parent) return
    const r = parent.getBoundingClientRect()
    if (r.height <= 0) return
    setSplit((e.clientY - r.top) / r.height)
  }
  function onSplitPointerUp() {
    splitDrag.current = false
  }

  async function refetch() {
    try {
      const b = await boardsApi.getBoard(boardRef.current)
      setNodes(b.pins.map((p) => toRFNode(p, onRename)))
      setEdges(b.connections.map(toRFEdge))
    } catch { /* keep local state on refetch failure */ }
  }

  function handleNodesChange(changes: Parameters<typeof onNodesChange>[0]) {
    const removed = changes.filter((c) => c.type === 'remove').map((c) => (c as { id: string }).id)
    onNodesChange(changes.filter((c) => c.type !== 'remove'))
    // optimistic position-only updates (persist x/y in pin data, no endpoint)
    for (const c of changes) {
      if (c.type === 'position' && (c as { dragging?: boolean }).dragging === false) {
        const pos = (c as { position?: { x: number; y: number } }).position
        if (pos) boardsApi.movePin(boardRef.current, (c as { id: string }).id, Math.round(pos.x), Math.round(pos.y))
      }
    }
    void (async () => {
      for (const id of removed) {
        onNodesChange([{ type: 'remove', id } as never])
        setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
        try {
          await boardsApi.deletePin(boardRef.current, id)
          toast('Pin deleted', 'success')
        } catch (e: unknown) {
          toast((e as { message?: string })?.message || 'Delete failed — reverted', 'error')
          await refetch()
        }
      }
    })()
  }

  function handleEdgesChange(changes: Parameters<typeof onEdgesChange>[0]) {
    const removed = changes.filter((c) => c.type === 'remove').map((c) => (c as { id: string }).id)
    onEdgesChange(changes.filter((c) => c.type !== 'remove'))
    void (async () => {
      for (const id of removed) {
        onEdgesChange([{ type: 'remove', id } as never])
        try {
          await boardsApi.deleteConnection(boardRef.current, id)
          toast('Connection deleted', 'success')
        } catch (e: unknown) {
          toast((e as { message?: string })?.message || 'Delete failed — reverted', 'error')
          await refetch()
        }
      }
    })()
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const type = e.dataTransfer.getData('application/pin-type') as EntityType | ''
    if (!type) return
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    let x = Math.round(pos.x)
    // secondary pins spawn inside the unattached band (leftmost 15%)
    if ((SECONDARY as string[]).includes(type) && wrapRef.current) {
      const r = wrapRef.current.getBoundingClientRect()
      x = Math.round(screenToFlowPosition({ x: r.left + r.width * 0.075, y: e.clientY }).x)
    }
    setPendingNode({ type, x, y: Math.round(pos.y) })
  }

  async function confirmNode(label: string) {
    const p = pendingNode
    setPendingNode(null)
    if (!p) return
    const draft = {
      entity_type: p.type,
      entity_id: null,
      label: label || `${p.type[0].toUpperCase()}${p.type.slice(1)} ${nodes.length + 1}`,
      content: p.type === 'note' ? { note_text: '' } : {},
      x: p.x, y: p.y, color: null,
    }
    const tempId = `tmp-${Date.now()}`
    setNodes((nds) => [...nds, toRFNode({ ...draft, id: tempId, board_id: boardRef.current }, onRename)])
    try {
      const created = await boardsApi.createPin(boardRef.current, draft)
      setNodes((nds) => nds.map((n) => (n.id === tempId ? toRFNode(created, onRename) : n)))
      toast('Pin created', 'success')
    } catch (e: unknown) {
      setNodes((nds) => nds.filter((n) => n.id !== tempId))
      toast((e as { message?: string })?.message || 'Create failed — reverted', 'error')
    }
  }

  function onConnect(params: Connection) {
    if (!params.source || !params.target) return
    if (params.source === params.target) { toast('Cannot link a pin to itself', 'error'); return }
    // React Flow drops duplicate directed edges; say so instead of a silent no-op.
    if (getEdges().some((e) => e.source === params.source && e.target === params.target)) {
      toast('These pins are already linked', 'info')
      return
    }
    setPendingEdge({ source: params.source, target: params.target })
  }

  async function confirmEdge(label: string, confidence: number | null) {
    const p = pendingEdge
    setPendingEdge(null)
    if (!p) return
    // React Flow drops duplicate directed edges; say so instead of a silent no-op.
    if (getEdges().some((e) => e.source === p.source && e.target === p.target)) {
      toast('These pins are already linked', 'info')
      return
    }
    const draft = { source_pin_id: p.source, target_pin_id: p.target, label: label || null, confidence, notes: null }
    const tempId = `tmp-conn-${Date.now()}`
    setEdges((eds) => addEdge({ ...draft, id: tempId, source: p.source, target: p.target } as never, eds))
    try {
      const created = await boardsApi.createConnection(boardRef.current, draft)
      setEdges((eds) => eds.map((e) => (e.id === tempId ? toRFEdge(created) : e)))
      toast('Connection created', 'success')
    } catch (e: unknown) {
      setEdges((eds) => eds.filter((e) => e.id !== tempId))
      toast((e as { message?: string })?.message || 'Create failed — reverted', 'error')
    }
  }

  async function exportPNG() {
    try {
      const el = wrapRef.current
      if (!el) { toast('Nothing to export', 'error'); return }
      const url = await toPng(el, { pixelRatio: 2, backgroundColor: '#0b1015' })
      const a = document.createElement('a')
      a.href = url
      a.download = `${boardRef.current}.png`
      a.click()
      toast('Board exported as PNG', 'success')
    } catch { toast('Export failed', 'error') }
  }

  function onImportFile(f: File | undefined) {
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as { pins?: BoardPin[]; connections?: BoardConnection[] }
        if (!Array.isArray(parsed.pins) || !Array.isArray(parsed.connections)) throw new Error('bad shape')
        const okTypes = ['person', 'organization', 'building', 'phone', 'location', 'document', 'note']
        const pins = parsed.pins.filter((p) => p && typeof p.id === 'string' && okTypes.includes(p.entity_type))
        const ids = new Set(pins.map((p) => p.id))
        const conns = parsed.connections.filter((c) => c && ids.has(c.source_pin_id) && ids.has(c.target_pin_id))
        setNodes(pins.map((p) => toRFNode({ ...p, board_id: boardRef.current }, onRename)))
        setEdges(conns.map(toRFEdge))
        toast(`Imported ${pins.length} pins, ${conns.length} connections`, 'success')
      } catch { toast('Import failed: expected JSON { pins, connections }', 'error') }
    }
    reader.readAsText(f)
  }

  if (loading) return <Skeleton className="h-[70vh]" />

  return (
    <div className="flex h-[calc(100vh-96px)] gap-3">
      <CaseHistoryPanel pinCount={nodes.length} linkCount={edges.length} onSelectCase={selectCase} />

      {/* canvas */}
      <Card className="relative flex-1 overflow-hidden bg-base">
        <style>{`.react-flow__edge.selected .react-flow__edge-path{stroke:#dc2626 !important;stroke-width:2.5 !important;}`}</style>
        <div
          id="graph-wrap"
          ref={wrapRef}
          className="absolute inset-0"
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeContextMenu={(e, n) => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, kind: 'node', id: n.id }) }}
            onEdgeContextMenu={(e, ed) => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, kind: 'edge', id: ed.id }) }}
            onPaneClick={() => setCtxMenu(null)}
            onSelectionChange={({ nodes: sn, edges: se }) => {
              setSelectedPin(sn.length ? (sn[0].data as PinData).pin : null)
              setSelectedConn(se.length ? (se[0].data as { conn: BoardConnection }).conn : null)
            }}
            deleteKeyCode={['Backspace', 'Delete']}
            minZoom={0.2}
            maxZoom={2}
            fitView
            attributionPosition="bottom-right"
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.06)" />
          </ReactFlow>

          {nodes.length === 0 && !pendingNode && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-sm text-text-muted">Empty board — drag a template from the palette, or Import.</div>
            </div>
          )}

          {pendingNode && (
            <LabelPopover title={`New ${pendingNode.type}`} onConfirm={(label) => void confirmNode(label)} onCancel={() => setPendingNode(null)} />
          )}
          {pendingEdge && (
            <LabelPopover title="New connection" withConfidence onConfirm={(label, c) => void confirmEdge(label, c)} onCancel={() => setPendingEdge(null)} />
          )}
        </div>

        {ctxMenu && (
          <div className="fixed z-50 min-w-[160px] rounded-control border border-[rgba(255,255,255,0.1)] bg-surface-2 py-1 shadow-soft" style={{ left: ctxMenu.x, top: ctxMenu.y }} onClick={(e) => e.stopPropagation()}>
            <button
              className="w-full px-3 py-1.5 text-left text-sm text-accent-danger hover:bg-surface-3"
              onClick={() => {
                if (ctxMenu.kind === 'node') handleNodesChange([{ type: 'remove', id: ctxMenu.id }] as never)
                else handleEdgesChange([{ type: 'remove', id: ctxMenu.id }] as never)
                setCtxMenu(null)
              }}
            >
              Delete
            </button>
          </div>
        )}

        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => { onImportFile(e.target.files?.[0]); e.target.value = '' }} />
        <BoardToolbar
          onFit={() => fitView({ duration: 400 })}
          onZoomIn={() => zoomIn({ duration: 300 })}
          onZoomOut={() => zoomOut({ duration: 300 })}
          onExport={() => void exportPNG()}
          onNewBoard={() => { setNodes([]); setEdges([]); setSelectedPin(null); setSelectedConn(null); toast('New blank board', 'success') }}
          onImport={() => fileRef.current?.click()}
        />
      </Card>

      {/* right panel: node details (top) + palette (bottom), draggable split */}
      <Card className="hidden w-[300px] shrink-0 flex-col overflow-hidden p-0 md:flex">
        <div className="min-h-0 overflow-auto p-4" style={{ flex: `${split} 1 0%` }}>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Node Details</div>
          {selectedPin ? (
            <div className="space-y-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{selectedPin.entity_type}</div>
              <h3 className="font-semibold text-text-primary">{selectedPin.label}</h3>
              <div className="font-mono text-xs text-text-muted">{selectedPin.id}</div>
              {selectedPin.entity_id && <div className="font-mono text-xs text-text-secondary">entity: {selectedPin.entity_id}</div>}
              {selectedPin.content?.phone && <div className="text-sm text-text-secondary">📞 {String(selectedPin.content.phone)}</div>}
              {selectedPin.content?.address && <div className="text-sm text-text-secondary">📍 {String(selectedPin.content.address)}</div>}
              {typeof selectedPin.content?.associates_count === 'number' && (
                <div className="text-sm text-text-secondary">{selectedPin.content.associates_count} known associates</div>
              )}
              {((selectedPin.content?.linked_cases as string[] | undefined) || []).length > 0 && (
                <div className="space-y-1 border-t border-[rgba(255,255,255,0.06)] pt-3">
                  <div className="mb-1 text-xs font-medium text-text-primary">Linked cases</div>
                  {(selectedPin.content?.linked_cases as string[]).map((id) => (
                    <Link key={id} to={`/network/cases/${id}`} className="block font-mono text-xs text-accent-hover hover:underline">
                      {id} →
                    </Link>
                  ))}
                </div>
              )}
              <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 font-mono text-[11px] text-text-muted">
                x: {Math.round(selectedPin.x)} • y: {Math.round(selectedPin.y)}
              </div>
            </div>
          ) : selectedConn ? (
            <div className="space-y-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Connection</div>
              <div className="font-mono text-xs text-text-secondary">{selectedConn.source_pin_id} → {selectedConn.target_pin_id}</div>
              <div className="text-sm text-text-primary">Label: {selectedConn.label || '—'}</div>
              <div className="text-sm text-text-secondary">Confidence: {selectedConn.confidence ?? '—'}</div>
              {selectedConn.notes && <div className="text-sm text-text-secondary">{selectedConn.notes}</div>}
            </div>
          ) : (
            <div className="text-sm text-text-muted">Select a node to view details.</div>
          )}
        </div>

        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize details and palette"
          onPointerDown={onSplitPointerDown}
          onPointerMove={onSplitPointerMove}
          onPointerUp={onSplitPointerUp}
          className="h-1.5 shrink-0 cursor-row-resize touch-none transition-colors hover:bg-accent-primary/30"
        />

        <div className="min-h-0 overflow-auto border-t border-[rgba(255,255,255,0.06)] p-4" style={{ flex: `${1 - split} 1 0%` }}>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Palette · {boardId}</div>
          <Palette />
          <div className="mt-3 border-t border-[rgba(255,255,255,0.06)] pt-2 font-mono text-[11px] text-text-muted">
            Pins: {nodes.length} • Links: {edges.length}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function InvestigationBoard() {
  return (
    <ReactFlowProvider>
      <BoardErrorBoundary>
        <BoardCanvas />
      </BoardErrorBoundary>
    </ReactFlowProvider>
  )
}
