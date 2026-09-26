import React from 'react'
import type { Citation } from '@/stores/copilotStore'

export function renderMarkdown(content: string, citations: Citation[] = [], onCite?: (c: Citation) => void) {
  // split code fences
  const parts = content.split(/```/g)
  return (
    <>
      {parts.map((p, i) => {
        if (i % 2 === 1) return <pre key={i} className="mt-2 p-3 rounded-lg bg-base border border-[rgba(255,255,255,0.08)] text-xs font-mono overflow-auto">{p}</pre>
        return <Block key={i} text={p} citations={citations} onCite={onCite} />
      })}
    </>
  )
}

function Block({ text, citations, onCite }: { text: string; citations: Citation[]; onCite?: (c: Citation) => void }) {
  const lines = text.split('\n')
  const els: React.ReactNode[] = []
  let ti = 0
  const tableBuf: string[] = []
  const flushTable = () => {
    if (!tableBuf.length) return
    const rows = tableBuf.filter((l) => l.includes('|')).map((l) => l.split('|').map((s) => s.trim()).filter(Boolean))
    const body = rows.filter((r) => !/^-+$/.test(r.join('')))
    tableBuf.length = 0
    els.push(
      <table key={'t' + ti++} className="mt-2 w-full text-xs border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden">
        <tbody>{body.map((r, ri) => <tr key={ri} className={ri === 0 ? 'bg-surface-3 text-text-primary' : 'text-text-secondary'}>{r.map((c, ci) => <td key={ci} className="px-2 py-1 border-t border-[rgba(255,255,255,0.06)]">{inline(c, citations, onCite)}</td>)}</tr>)}</tbody>
      </table>,
    )
  }
  lines.forEach((ln, li) => {
    if (/^\s*\|.*\|\s*$/.test(ln)) { tableBuf.push(ln); return }
    flushTable()
    if (!ln.trim()) { els.push(<div key={li} className="h-2" />); return }
    els.push(<div key={li} className="leading-relaxed">{inline(ln, citations, onCite)}</div>)
  })
  flushTable()
  return <>{els}</>
}

function inline(s: string, citations: Citation[], onCite?: (c: Citation) => void): React.ReactNode[] {
  // citations [DOC-001], [ENT-001], [11111111-1111-1111-1111-111111111111] + **bold** + `code`
  const re = /(\[((?:DOC|ENT)-[0-9A-Za-z-]+|C-[0-9-]+)\])|(\*\*(.+?)\*\*)|(`(.+?)`)/g
  const out: React.ReactNode[] = []
  let last = 0, m: RegExpExecArray | null, k = 0
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(<span key={k++}>{s.slice(last, m.index)}</span>)
    if (m[1]) {
      const refId = m[2]
      const found = citations.find((c) => c.refId === refId || c.id === refId)
      const c: Citation = found || { id: refId, type: refId.startsWith('DOC') ? 'document' : refId.startsWith('ENT') ? 'entity' : 'case', refId, title: refId, excerpt: 'Open source ' + refId }
      out.push(<button key={k++} onClick={() => onCite?.(c)} className="mx-0.5 px-1.5 py-0.5 rounded-full bg-accent-primary/15 text-accent-hover border border-accent-primary/30 text-[11px] font-mono hover:bg-accent-primary/25" title={c.title}>[{refId}]</button>)
    } else if (m[3]) out.push(<strong key={k++} className="text-text-primary">{m[4]}</strong>)
    else if (m[5]) out.push(<code key={k++} className="px-1 rounded bg-base border border-[rgba(255,255,255,0.08)] font-mono text-[12px]">{m[6]}</code>)
    last = m.index + m[0].length
  }
  if (last < s.length) out.push(<span key={k++}>{s.slice(last)}</span>)
  return out
}
