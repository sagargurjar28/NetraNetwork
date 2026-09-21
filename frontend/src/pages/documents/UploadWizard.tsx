import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useUploadStore } from '@/stores/uploadStore'
import { documentsApi } from '@/services/api'
import { useToast } from '@/components/ui/Toast'
import { Upload, File } from 'lucide-react'

export default function UploadWizard(){
  const { step, setStep, file, setFile, metadata, setMetadata, reset } = useUploadStore()
  const [dragOver,setDragOver]=useState(false)
  const [progress,setProgress]=useState(0)
  const [result,setResult]=useState<any>(null)
  const { addToast } = useToast()
  const [errors,setErrors]=useState<any>({})

  const onFile = (f:File)=>{
    if(f.size>25*1024*1024) { addToast('File too large (max 25MB)','error'); return }
    setFile({ name:f.name, size:(f.size/1024/1024).toFixed(2)+' MB', type:f.type, file:f })
  }

  const validate=()=>{
    const e:any={}
    if(!metadata.docName) e.docName='Required'
    if(!metadata.uploadedBy) e.uploadedBy='Required'
    if(!metadata.department) e.department='Required'
    if(!metadata.caseRef) e.caseRef='Required'
    if(!metadata.docType) e.docType='Required'
    if(!metadata.classification) e.classification='Required'
    if(!metadata.docDate) e.docDate='Required'
    setErrors(e); return Object.keys(e).length===0
  }

  const doUpload = async()=>{
    setProgress(10)
    const id=setInterval(()=> setProgress(p=> Math.min(95, p+12)), 300)
    const res= await documentsApi.upload({})
    clearInterval(id); setProgress(100); setResult(res); addToast('Upload complete')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-2 text-sm text-[#8b98a5]"><span className={step>=1?'text-[#dc2626]':''}>1. File</span> → <span className={step>=2?'text-[#dc2626]':''}>2. Metadata</span> → <span className={step>=3?'text-[#dc2626]':''}>3. Review</span> → <span className={step>=4?'text-[#dc2626]':''}>4. Upload</span></div>
      <ProgressBar value={(step/4)*100}/>

      {step===1 && (
        <Card className="p-6">
          <h3 className="font-medium text-[#e6edf3] mb-4">Step 1 — Select File</h3>
          <div onDragOver={e=>{e.preventDefault(); setDragOver(true)}} onDragLeave={()=> setDragOver(false)} onDrop={e=>{e.preventDefault(); setDragOver(false); const f=e.dataTransfer.files[0]; if(f) onFile(f)}} className={"border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 "+(dragOver?"border-[#dc2626] bg-[#dc2626]/5":"border-[rgba(255,255,255,0.08)] bg-[#0b1015]")}>
            <Upload className="text-[#8b98a5]"/>
            <div className="text-sm text-[#8b98a5]">Drag & drop file here or</div>
            <label className="px-4 py-2 rounded-lg bg-[#dc2626] text-white text-sm cursor-pointer">Browse Files<input type="file" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) onFile(f)}}/></label>
            {file && <div className="flex items-center gap-2 mt-3 text-sm text-[#e6edf3]"><File size={16}/>{file.name} • {file.size} • {file.type}</div>}
          </div>
          <div className="flex justify-end mt-4"><Button disabled={!file} onClick={()=> setStep(2)}>Next</Button></div>
        </Card>
      )}

      {step===2 && (
        <Card className="p-6 space-y-3">
          <h3 className="font-medium text-[#e6edf3]">Step 2 — Metadata (all required except Description)</h3>
          <Input label="Document Name *" value={metadata.docName||''} onChange={e=> setMetadata({...metadata, docName:e.target.value})} error={errors.docName}/>
          <Input label="Uploaded By *" value={metadata.uploadedBy||''} onChange={e=> setMetadata({...metadata, uploadedBy:e.target.value})} error={errors.uploadedBy}/>
          <Select label="Department *" value={metadata.department||''} onChange={e=> setMetadata({...metadata, department:(e.target as HTMLSelectElement).value})} error={errors.department}><option value="">Select</option><option>Crime Branch</option><option>Cyber Cell</option><option>Forensics</option></Select>
          <Input label="Case Reference *" value={metadata.caseRef||''} onChange={e=> setMetadata({...metadata, caseRef:e.target.value})} error={errors.caseRef}/>
          <Select label="Document Type *" value={metadata.docType||''} onChange={e=> setMetadata({...metadata, docType:(e.target as HTMLSelectElement).value})} error={errors.docType}><option value="">Select</option><option>FIR</option><option>Memo</option><option>Report</option><option>Statement</option></Select>
          <Select label="Classification Level *" value={metadata.classification||''} onChange={e=> setMetadata({...metadata, classification:(e.target as HTMLSelectElement).value})} error={errors.classification}><option value="">Select</option><option>Confidential</option><option>Restricted</option><option>Secret</option></Select>
          <Input label="Date of Document *" type="date" value={metadata.docDate||''} onChange={e=> setMetadata({...metadata, docDate:e.target.value})} error={errors.docDate}/>
          <Textarea label="Description" value={metadata.description||''} onChange={e=> setMetadata({...metadata, description:e.target.value})}/>
          <div className="flex justify-between"><Button variant="secondary" onClick={()=> setStep(1)}>Back</Button><Button onClick={()=>{ if(validate()) setStep(3)}}>Next</Button></div>
        </Card>
      )}

      {step===3 && (
        <Card className="p-6">
          <h3 className="font-medium text-[#e6edf3] mb-3">Step 3 — Review</h3>
          <div className="space-y-2 text-sm">
            <div className="text-[#8b98a5]">File: <span className="text-[#e6edf3] font-mono">{file?.name}</span></div>
            {Object.entries(metadata).map(([k,v])=> <div key={k} className="text-[#8b98a5]">{k}: <span className="text-[#e6edf3]">{String(v)}</span></div>)}
          </div>
          <div className="flex justify-between mt-4"><Button variant="secondary" onClick={()=> setStep(2)}>Back</Button><Button onClick={()=>{ setStep(4); doUpload()}}>Confirm & Upload</Button></div>
        </Card>
      )}

      {step===4 && (
        <Card className="p-6">
          <h3 className="font-medium text-[#e6edf3] mb-3">Step 4 — Upload</h3>
          {!result ? <div className="space-y-3"><ProgressBar value={progress}/><div className="text-sm text-[#8b98a5]">Uploading... {progress}%</div></div> :
            <div className="space-y-2 text-sm">
              <div className="text-[#22c55e] font-medium">Upload Successful ✓</div>
              <div className="font-mono text-xs text-[#8b98a5]">Hash: <span className="text-[#e6edf3]">{result.hash}</span></div>
              <div className="font-mono text-xs text-[#8b98a5]">IPFS CID: <span className="text-[#e6edf3]">{result.cid}</span></div>
              <div className="font-mono text-xs text-[#8b98a5]">Tx Hash: <span className="text-[#e6edf3]">{result.tx}</span></div>
              <div className="text-xs text-[#8b98a5]">Timestamp: {result.timestamp}</div>
              <Button variant="secondary" className="mt-3" onClick={()=>{ reset(); setResult(null); setProgress(0)}}>Upload Another</Button>
            </div>
          }
        </Card>
      )}
    </div>
  )
}
