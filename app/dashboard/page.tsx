import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { deleteListing } from '@/app/inserat/actions'
import { updateReservationStatus } from '@/app/reservations/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: listings } = await supabase.from('listings').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  const listingIds = (listings || []).map((l) => l.id)
  const { data: incomingRes } = listingIds.length > 0
    ? await supabase.from('reservations').select('*, listings(title, material)').in('listing_id', listingIds).order('created_at', { ascending: false })
    : { data: [] }
  const { data: outgoingRes } = await supabase.from('reservations').select('*, listings(title, material)').eq('buyer_id', user.id).order('created_at', { ascending: false })

  const categoryColors: Record<string, string> = { humus: '#4ade80', aushub: '#a78bfa', kies: '#fb923c' }
  const statusBadge = (s: string) => {
    const map: Record<string, {label: string, color: string}> = {
      pending: {label: 'Ausstehend', color: '#f59e0b'}, accepted: {label: 'Akzeptiert', color: '#22c55e'},
      rejected: {label: 'Abgelehnt', color: '#ef4444'}, completed: {label: 'Abgeschlossen', color: '#3b82f6'},
    }
    return map[s] || {label: s, color: '#94a3b8'}
  }

  async function handleDelete(formData: FormData) { 'use server'; await deleteListing(formData.get('listingId') as string) }
  async function handleStatus(formData: FormData) {
    'use server'
    const id = formData.get('reservationId') as string
    const status = formData.get('status') as 'accepted' | 'rejected' | 'completed'
    await updateReservationStatus(id, status)
  }

  const SS = {background:'#fff',borderRadius:10,padding:24,boxShadow:'0 1px 6px rgba(0,0,0,0.07)',marginBottom:20} as React.CSSProperties
  const CS = {background:'#f8fafc',borderRadius:8,padding:16,marginBottom:12,border:'1px solid #e2e8f0'} as React.CSSProperties

  return (
    <div style={{fontFamily:'system-ui,sans-serif',minHeight:'100vh',background:'#f1f5f9'}}>
      <div style={{background:'#fff',borderBottom:'1px solid #e2e8f0',padding:'0 32px'}}>
        <div style={{maxWidth:1000,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',height:64}}>
          <Link href="/" style={{fontWeight:800,fontSize:20,color:'#111',textDecoration:'none'}}>ErdConnect</Link>
          <Link href="/inserat/neu" style={{background:'#22c55e',color:'#fff',borderRadius:8,padding:'8px 18px',textDecoration:'none',fontWeight:600,fontSize:14}}>+ Inserat</Link>
        </div>
      </div>
      <div style={{maxWidth:1000,margin:'0 auto',padding:'32px 16px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
          {[
            {label:'Meine Inserate', value: listings?.length || 0, color:'#22c55e'},
            {label:'Eingehende Anfragen', value: incomingRes?.length || 0, color:'#3b82f6'},
            {label:'Meine Anfragen', value: outgoingRes?.length || 0, color:'#a78bfa'},
            {label:'Offene Anfragen', value: incomingRes?.filter((r: {status:string})=>r.status==='pending').length || 0, color:'#f59e0b'},
          ].map(s => (
            <div key={s.label} style={{background:'#fff',borderRadius:10,padding:'16px 20px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)',borderTop:`3px solid ${s.color}`}}>
              <div style={{fontSize:28,fontWeight:800,color:s.color}}>{s.value}</div>
              <div style={{fontSize:12,color:'#888',marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={SS}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h2 style={{margin:0,fontSize:18,fontWeight:700}}>Meine Inserate</h2>
            <Link href="/inserat/neu" style={{color:'#22c55e',fontWeight:600,fontSize:13,textDecoration:'none'}}>+ Neu</Link>
          </div>
          {(listings||[]).length===0 ? <p style={{color:'#888',textAlign:'center',padding:'24px 0'}}>Noch keine Inserate. <Link href="/inserat/neu" style={{color:'#22c55e'}}>Jetzt erstellen</Link></p> : listings?.map((l)=>(
            <div key={l.id} style={{...CS, borderLeft:`4px solid ${categoryColors[l.material]||'#94a3b8'}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <span style={{background:categoryColors[l.material]||'#94a3b8',color:'#fff',borderRadius:4,padding:'2px 8px',fontSize:11,fontWeight:700,textTransform:'uppercase'}}>{l.material}</span>
                  <span style={{marginLeft:8,background:l.type==='offer'?'#dcfce7':'#fef3c7',color:l.type==='offer'?'#166534':'#92400e',borderRadius:4,padding:'2px 8px',fontSize:11,fontWeight:600}}>{l.type==='offer'?'Angebot':'Gesuch'}</span>
                  <h3 style={{margin:'8px 0 4px',fontWeight:700,fontSize:15}}>{l.title}</h3>
                  <div style={{fontSize:13,color:'#666'}}>Ort: {l.location} - {l.total_quantity} m3 {l.price?'- CHF '+l.price+'/m3':''}</div>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <Link href={`/listing/${l.id}`} style={{color:'#3b82f6',fontSize:13,textDecoration:'none',fontWeight:600}}>Anzeigen</Link>
                  <form action={handleDelete}><input type="hidden" name="listingId" value={l.id}/><button type="submit" style={{background:'#fee2e2',color:'#dc2626',border:'none',borderRadius:6,padding:'4px 12px',cursor:'pointer',fontSize:12,fontWeight:600}}>Loeschen</button></form>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={SS}>
          <h2 style={{margin:'0 0 16px',fontSize:18,fontWeight:700}}>Eingehende Anfragen ({incomingRes?.length||0})</h2>
          {(incomingRes||[]).length===0 ? <p style={{color:'#888',textAlign:'center',padding:'24px 0'}}>Keine eingehenden Anfragen</p> : incomingRes?.map((r:Record<string,unknown>)=>{
            const badge=statusBadge(r.status as string); const listing=r.listings as {title:string,category:string}
            return (<div key={r.id as string} style={CS}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <span style={{background:categoryColors[listing?.material]||'#94a3b8',color:'#fff',borderRadius:4,padding:'2px 8px',fontSize:11,fontWeight:700,textTransform:'uppercase'}}>{listing?.material}</span>
                  <h3 style={{margin:'8px 0 4px',fontWeight:700,fontSize:14}}>{listing?.title}</h3>
                  <div style={{fontSize:13,color:'#666'}}>Menge: {r.quantity_reserved as number} m3 {r.pickup_date?'- '+new Date(r.pickup_date as string).toLocaleDateString('de-CH'):''}</div>
                  {(r.message as string) && <div style={{fontSize:12,color:'#444',marginTop:4,fontStyle:'italic'}}>``"{r.message as string}"</div>}
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:6,alignItems:'flex-end'}}>
                  <span style={{background:badge.color,color:'#fff',borderRadius:5,padding:'3px 10px',fontSize:12,fontWeight:600}}>{badge.label}</span>
                  {r.status==='pending' && <div style={{display:'flex',gap:6}}>
                    <form action={handleStatus}><input type="hidden" name="reservationId" value={r.id as string}/><input type="hidden" name="status" value="accepted"/><button type="submit" style={{background:'#22c55e',color:'#fff',border:'none',borderRadius:5,padding:'4px 10px',cursor:'pointer',fontSize:12,fontWeight:600}}>Akzeptieren</button></form>
                    <form action={handleStatus}><input type="hidden" name="reservationId" value={r.id as string}/><input type="hidden" name="status" value="rejected"/><button type="submit" style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:5,padding:'4px 10px',cursor:'pointer',fontSize:12,fontWeight:600}}>Ablehnen</button></form>
                  </div>}
                  {r.status==='accepted' && <form action={handleStatus}><input type="hidden" name="reservationId" value={r.id as string}/><input type="hidden" name="status" value="completed"/><button type="submit" style={{background:'#3b82f6',color:'#fff',border:'none',borderRadius:5,padding:'4px 10px',cursor:'pointer',fontSize:12,fontWeight:600}}>Erledigt</button></form>}
                </div>
              </div>
            </div>)
          })}
        </div>

        <div style={SS}>
          <h2 style={{margin:'0 0 16px',fontSize:18,fontWeight:700}}>Meine Anfragen ({outgoingRes?.length||0})</h2>
          {(outgoingRes||[]).length===0 ? <p style={{color:'#888',textAlign:'center',padding:'24px 0'}}>Noch keine Anfragen. <Link href="/" style={{color:'#22c55e'}}>Inserate entdecken</Link></p> : outgoingRes?.map((r:Record<string,unknown>)=>{
            const badge=statusBadge(r.status as string); const listing=r.listings as {title:string,category:string}
            return (<div key={r.id as string} style={CS}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <h3 style={{margin:'0 0 4px',fontWeight:700,fontSize:14}}>{listing?.title}</h3>
                  <div style={{fontSize:13,color:'#666'}}>Menge: {r.quantity_reserved as number} m3 {r.pickup_date?'- '+new Date(r.pickup_date as string).toLocaleDateString('de-CH'):''}</div>
                  {(r.message as string) && <div style={{fontSize:12,color:'#444',marginTop:4,fontStyle:'italic'}}>``"{r.message as string}"</div>}
                </div>
                <span style={{background:badge.color,color:'#fff',borderRadius:5,padding:'3px 10px',fontSize:12,fontWeight:600}}>{badge.label}</span>
              </div>
            </div>)
          })}
        </div>
      </div>
    </div>
  )
}



