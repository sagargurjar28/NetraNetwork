import { useState } from 'react'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { Button } from '@/components/ui/Button'
import { boardsApi } from '@/services/api/boards'
import { toast } from '@/utils/toast'

type ReportPin = { id: string; entity_type: string; label: string }
type ReportConnection = {
  id: string
  source_pin_id: string
  target_pin_id: string
  label: string | null
}
type ReportDocument = { id: string; filename: string; ipfs_cid: string | null; tx_hash: string | null }
type CaseReport = {
  case: { id: string; title: string; description: string | null; status: string }
  pins: ReportPin[]
  connections: ReportConnection[]
  documents: ReportDocument[]
  summary: Record<string, number>
}

/** Fetch the case report payload, embed the live canvas PNG, save a PDF. */
export function ShareReportButton({ caseId }: { caseId: string; boardId: string }) {
  const [busy, setBusy] = useState(false)

  async function onShare() {
    setBusy(true)
    try {
      const report = (await boardsApi.getReport(caseId)) as CaseReport

      const el = document.querySelector('.react-flow__viewport') as HTMLElement | null
      if (!el) throw new Error('Board canvas not found')
      const dataUrl = await toPng(el, {
        backgroundColor: '#0b0f14',
        pixelRatio: 2,
        filter: (node) =>
          !node.classList?.contains('react-flow__controls') &&
          !node.classList?.contains('react-flow__minimap'),
      })

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
      const W = pdf.internal.pageSize.getWidth()
      const H = pdf.internal.pageSize.getHeight()
      let y = 40

      // Header
      pdf.setFontSize(20)
      pdf.text('Netra Network — Case Report', 40, y)
      y += 26
      pdf.setFontSize(14)
      pdf.text(report.case.title, 40, y)
      y += 20
      pdf.setFontSize(10)
      if (report.case.description) {
        pdf.text(pdf.splitTextToSize(report.case.description, W - 80), 40, y)
        y += 20
      }
      pdf.text(`Status: ${report.case.status}`, 40, y)
      y += 14
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 40, y)
      y += 24

      // Summary table
      pdf.setFontSize(12)
      pdf.text('Summary', 40, y)
      y += 16
      pdf.setFontSize(10)
      Object.entries(report.summary).forEach(([k, v]) => {
        pdf.text(`${k.replace(/_/g, ' ')}: ${v}`, 40, y)
        y += 14
      })
      y += 10

      // Graph PNG
      pdf.setFontSize(12)
      pdf.text('Network Graph', 40, y)
      y += 16
      const imgW = W - 80
      const imgH = imgW * 0.55
      if (y + imgH > H - 40) {
        pdf.addPage()
        y = 40
      }
      pdf.addImage(dataUrl, 'PNG', 40, y, imgW, imgH)
      y += imgH + 20

      // Entity table
      if (y + 40 > H - 40) {
        pdf.addPage()
        y = 40
      }
      pdf.setFontSize(12)
      pdf.text('Entities', 40, y)
      y += 16
      pdf.setFontSize(9)
      report.pins.forEach((p) => {
        if (y > H - 40) {
          pdf.addPage()
          y = 40
        }
        pdf.text(`${p.entity_type.padEnd(12)} ${p.label}`, 40, y)
        y += 12
      })

      // Connections table
      y += 10
      if (y > H - 60) {
        pdf.addPage()
        y = 40
      }
      pdf.setFontSize(12)
      pdf.text('Connections', 40, y)
      y += 16
      pdf.setFontSize(9)
      const pinLabel = (id: string) => report.pins.find((x) => x.id === id)?.label ?? id
      report.connections.forEach((c) => {
        if (y > H - 40) {
          pdf.addPage()
          y = 40
        }
        pdf.text(
          `${pinLabel(c.source_pin_id)} —[${c.label ?? 'ASSOCIATED'}]→ ${pinLabel(c.target_pin_id)}`,
          40,
          y,
        )
        y += 12
      })

      // Documents table
      y += 10
      if (y > H - 60) {
        pdf.addPage()
        y = 40
      }
      pdf.setFontSize(12)
      pdf.text('Documents', 40, y)
      y += 16
      pdf.setFontSize(9)
      report.documents.forEach((d) => {
        if (y > H - 40) {
          pdf.addPage()
          y = 40
        }
        pdf.text(`${d.filename}`, 40, y)
        y += 12
        if (d.ipfs_cid) {
          pdf.text(`  IPFS: ${d.ipfs_cid}`, 50, y)
          y += 11
        }
        if (d.tx_hash) {
          pdf.text(`  Tx:   ${d.tx_hash}`, 50, y)
          y += 11
        }
      })

      pdf.save(`netra-report-${report.case.title.replace(/\s+/g, '-')}.pdf`)
      toast('Report downloaded', 'success')
    } catch (e: unknown) {
      console.error('[ShareReport]', e)
      toast('Report failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button size="sm" variant="secondary" onClick={() => void onShare()} loading={busy}>
      Share Report
    </Button>
  )
}
