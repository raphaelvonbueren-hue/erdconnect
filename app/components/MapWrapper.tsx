'use client'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./Map'), { ssr: false })

type Marker = { id: string; lat: number; lng: number; title: string; category: string; color: string }

export default function MapWrapper({ markers }: { markers: Marker[] }) {
  return (
    <div style={{ height: 600, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
      <Map markers={markers} />
    </div>
  )
}
