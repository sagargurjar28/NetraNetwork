export const mockEntities = [
  { id:'ENT-001', name:'Vikram Singh', aliases:['Vicky','VS'], type:'Person', risk:'High', status:'Active', cases:['11111111-1111-1111-1111-111111111111'], phone:'+91 98XXX X2100', associates:['ENT-002','ENT-003'], lastSeen:'2024-11-02', photo:'https://i.pravatar.cc/150?img=12' },
  { id:'ENT-002', name:'Anita Rao', aliases:['Anu'], type:'Person', risk:'Medium', status:'Active', cases:['11111111-1111-1111-1111-111111111111'], phone:'+91 98XXX X2101', associates:['ENT-001'], lastSeen:'2024-10-28', photo:'https://i.pravatar.cc/150?img=5' },
  { id:'ENT-003', name:'Rahul Mehta', aliases:[], type:'Person', risk:'High', status:'Wanted', cases:['11111111-1111-1111-1111-111111111111'], phone:'+91 98XXX X2102', associates:['ENT-001','ENT-004'], lastSeen:'2024-11-10', photo:'https://i.pravatar.cc/150?img=8' },
  { id:'ENT-004', name:'Sun Logistics Pvt Ltd', aliases:['SLPL'], type:'Organization', risk:'Medium', status:'Under Watch', cases:['11111111-1111-1111-1111-111111111111'], phone:'-', associates:['ENT-003'], lastSeen:'2024-09-15', photo:'' },
  { id:'ENT-005', name:'Ahmed Khan', aliases:['AK'], type:'Person', risk:'Low', status:'Cleared', cases:['11111111-1111-1111-1111-111111111111'], phone:'+91 98XXX X2105', associates:[], lastSeen:'2024-08-01', photo:'https://i.pravatar.cc/150?img=15' },
  { id:'ENT-006', name:'Priya Desai', aliases:[], type:'Person', risk:'High', status:'Active', cases:['11111111-1111-1111-1111-111111111111'], phone:'+91 98XXX X2106', associates:['ENT-002'], lastSeen:'2024-11-12', photo:'https://i.pravatar.cc/150?img=9' },
]

export const mockCases = [
  { id:'11111111-1111-1111-1111-111111111111', title:'Operation Black Kite', status:'Open', priority:'High', entities:3, officer:'Insp. Arjun', created:'2024-09-12', summary:'Cross-border smuggling network' },
  { id:'33333333-3333-3333-3333-333333333333', title:'Sun Logistics Fraud', status:'Investigating', priority:'Medium', entities:5, officer:'SI Meena', created:'2024-10-01', summary:'Invoice forgery and hawala' },
  { id:'44444444-4444-4444-4444-444444444444', title:'Cyber Extortion Ring', status:'Closed', priority:'Low', entities:2, officer:'Insp. Arjun', created:'2024-07-20', summary:'Phishing syndicate' },
  { id:'55555555-5555-5555-5555-555555555555', title:'Narcotics Corridor', status:'Open', priority:'High', entities:6, officer:'ACP Verma', created:'2024-11-05', summary:'Interstate trafficking route' },
]

export const mockGraph = {
  nodes: mockEntities.map(e=> ({ id:e.id, label:e.name, type:e.type, risk:e.risk, val: e.risk==='High'?18: e.risk==='Medium'?12:8 })),
  links: [
    { source:'ENT-001', target:'ENT-002', type:'associate', strength:0.8 },
    { source:'ENT-001', target:'ENT-003', type:'financial', strength:0.9 },
    { source:'ENT-003', target:'ENT-004', type:'owner', strength:0.7 },
    { source:'ENT-002', target:'ENT-006', type:'call', strength:0.5 },
    { source:'ENT-001', target:'ENT-006', type:'associate', strength:0.4 },
  ]
}
export const mockRelations = [
  { id:'R1', from:'ENT-001', to:'ENT-002', type:'associate', strength:0.8 },
  { id:'R2', from:'ENT-001', to:'ENT-003', type:'financial', strength:0.9 },
]

export const mockDocuments = [
  { id:'DOC-001', name:'FIR_2024_112.pdf', type:'FIR', classification:'Confidential', status:'Verified', uploadedBy:'Insp. Arjun', date:'2024-10-11', size:'2.4 MB', caseRef:'11111111-1111-1111-1111-111111111111' },
  { id:'DOC-002', name:'Seizure_Memo_33.docx', type:'Memo', classification:'Restricted', status:'Pending', uploadedBy:'SI Meena', date:'2024-11-02', size:'1.1 MB', caseRef:'11111111-1111-1111-1111-111111111111' },
  { id:'DOC-003', name:'Forensic_Report_ND.pdf', type:'Report', classification:'Secret', status:'Flagged', uploadedBy:'ACP Verma', date:'2024-09-20', size:'4.8 MB', caseRef:'11111111-1111-1111-1111-111111111111' },
  { id:'DOC-004', name:'Witness_Statement_A.pdf', type:'Statement', classification:'Confidential', status:'Verified', uploadedBy:'Insp. Arjun', date:'2024-09-25', size:'0.9 MB', caseRef:'11111111-1111-1111-1111-111111111111' },
]

export const mockConversations = [
  { id:'conv-1', title:'Black Kite network analysis', updated:'2024-11-13', pinned:true },
  { id:'conv-2', title:'Document verification help', updated:'2024-11-12', pinned:false },
]

export const mockUsers = [
  { id:'U1', name:'Inspector Arjun', role:'admin', email:'arjun@intel.gov.in', lastActive:'2m ago' },
  { id:'U2', name:'SI Meena', role:'analyst', email:'meena@intel.gov.in', lastActive:'1h ago' },
  { id:'U3', name:'Const. Ramesh', role:'operator', email:'ramesh@intel.gov.in', lastActive:'3h ago' },
]

export const mockAuditLogs = [
  { id:'L1', action:'LOGIN', user:'Inspector Arjun', target:'auth', time:'2024-11-13 10:00', ip:'10.0.1.12' },
  { id:'L2', action:'VIEW_ENTITY', user:'SI Meena', target:'ENT-001', time:'2024-11-13 09:55', ip:'10.0.1.14' },
  { id:'L3', action:'UPLOAD_DOC', user:'ACP Verma', target:'DOC-003', time:'2024-11-12 18:20', ip:'10.0.1.10' },
]

export function mockLogin(username:string){
  return { token:'mock-jwt-'+Date.now(), user:{ id:'1', name: username || 'Inspector Arjun', role:'admin', email: username+'@intel.gov.in' } }
}
