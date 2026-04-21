'use client'
import { useEffect, useRef } from 'react'

type Marker = { id: string; lat: number; lng: number; title: string; category: string; color: string }

export default function Map({ markers }: { markers: Marker[] }) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return
    if (mapRef.current) {
      const L = require('leaflet')
      mapRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) mapRef.current.removeLayer(layer)
      })
      markers.forEach(m => {
        const icon = L.divIcon({
          html: '<div style="background:' + m.color + ';width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>',
          className: '', iconSize: [14, 14], iconAnchor: [7, 7],
        })
        L.marker([m.lat, m.lng], { icon }).addTo(mapRef.current).bindPopup('<strong>' + m.title + '</strong><br/>' + m.category)
      })
      return
    }
    const L = require('leaflet')
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
    const map = L.map(containerRef.current).setView([47.0, 8.3], 8)
    mapRef.current = map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'Leaflet | OpenStreetMap' }).addTo(map)
    markers.forEach(m => {
      const icon = L.divIcon({
        html: '<div style="background:' + m.color + ';width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>',
        className: '', iconSize: [14, 14], iconAnchor: [7, 7],
      })
      L.marker([m.lat, m.lng], { icon }).addTo(map).bindPopup('<strong>' + m.title + '</strong><br/>' + m.category)
    })
  }, [markers])

  return <div ref={containerRef} style={{ height: '100%', width: '100%', minHeight: 600, borderRadius: 12 }} />
}
