'use client'
import { useEffect, useRef } from 'react'

type Marker = {
  id: string; lat: number; lng: number; title: string; category: string; color: string
  location: string; total_quantity: number | null; price: number | null; unit: string
  type: string; availability_type: string | null; availability_date_from: string | null
  availability_quarter_from: string | null
}

const MAT_LABELS: Record<string, string> = {
  humus: 'Humus / Muttererde', aushub: 'Aushub / Erdmaterial', kies: 'Kies / Schotter',
  gruenmaterial: 'Grünmaterial / Holz', beton: 'Betonabbruch', andere: 'Andere',
}

function availabilityLabel(m: Marker): string {
  if (!m.availability_type || m.availability_type === 'sofort') return '⚡ Ab sofort'
  if (m.availability_type === 'datum' && m.availability_date_from) {
    const d = new Date(m.availability_date_from)
    return '📅 ' + d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
  if (m.availability_type === 'quartal' && m.availability_quarter_from)
    return '📅 ' + m.availability_quarter_from
  return ''
}

function buildPopupNode(m: Marker, L: any): HTMLElement {
  const matLabel = MAT_LABELS[m.category] || m.category
  const typeLabel = m.type === 'request' ? 'Gesuch' : 'Angebot'
  const typeBg = m.type === 'request' ? '#ede9fe' : '#dcfce7'
  const typeColor = m.type === 'request' ? '#7c3aed' : '#15803d'
  const qty = m.total_quantity != null ? `${m.total_quantity} ${m.unit}` : '–'
  const priceText = m.price != null && m.price > 0
    ? `CHF ${m.price.toLocaleString('de-CH')}`
    : 'Gratis'
  const priceColor = m.price != null && m.price > 0 ? '#0f172a' : '#16a34a'
  const avail = availabilityLabel(m)

  const div = L.DomUtil.create('div')
  div.style.cssText = 'font-family:system-ui,sans-serif;width:280px'
  div.innerHTML = `
    <div style="height:4px;background:${m.color};border-radius:2px;margin-bottom:12px"></div>
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
      <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;background:${typeBg};color:${typeColor}">${typeLabel}</span>
      <span style="font-size:11px;color:#64748b;font-weight:500">${matLabel}</span>
    </div>
    <div style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:10px;line-height:1.35;white-space:normal">${m.title}</div>
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <div style="flex:1;background:#f8fafc;border-radius:7px;padding:8px 10px;min-width:0">
        <div style="font-size:10px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px">Menge</div>
        <div style="font-size:15px;font-weight:700;color:#0f172a;white-space:normal">${qty}</div>
      </div>
      <div style="flex:1;background:#f8fafc;border-radius:7px;padding:8px 10px;min-width:0">
        <div style="font-size:10px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px">Preis</div>
        <div style="font-size:14px;font-weight:700;color:${priceColor};white-space:normal">${priceText}</div>
      </div>
    </div>
    ${m.location ? `<div style="font-size:12px;color:#475569;margin-bottom:5px;white-space:normal">📍 ${m.location}</div>` : ''}
    ${avail ? `<div style="font-size:12px;color:#475569;margin-bottom:12px;white-space:normal">${avail}</div>` : '<div style="margin-bottom:12px"></div>'}
    <a href="/listing/${m.id}" style="display:block;text-align:center;background:#0f172a;color:#fff;font-size:13px;font-weight:600;padding:9px 12px;border-radius:7px;text-decoration:none;cursor:pointer">Details ansehen →</a>
  `
  return div
}

function addMarkers(L: any, map: any, markers: Marker[]) {
  markers.forEach(m => {
    const icon = L.divIcon({
      html: `<div style="background:${m.color};width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
      className: '', iconSize: [14, 14], iconAnchor: [7, 7],
    })
    L.marker([m.lat, m.lng], { icon })
      .addTo(map)
      .bindPopup(() => buildPopupNode(m, L), { minWidth: 280, maxWidth: 300 })
  })
}

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
      addMarkers(L, mapRef.current, markers)
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
    addMarkers(L, map, markers)
  }, [markers])

  return <div ref={containerRef} style={{ height: '100%', width: '100%', minHeight: 600, borderRadius: 12 }} />
}
