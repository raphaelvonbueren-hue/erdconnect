import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .limit(5)

  return (
    <main style={{ padding: '40px', fontFamily: 'system-ui' }}>
      <h1>🌍 ErdConnect</h1>
      <p>B2B/C2C Marktplatz für Erdmaterialien</p>
      
      <h2>Aktuelle Inserate ({listings?.length || 0})</h2>
      {listings?.map(l => (
        <div key={l.id} style={{ 
          border: '1px solid #ddd', 
          padding: '16px', 
          margin: '12px 0',
          borderRadius: '8px'
        }}>
          <strong>{l.title}</strong><br/>
          {l.total_quantity} {l.unit} · {l.location}
        </div>
      ))}
    </main>
  )
}