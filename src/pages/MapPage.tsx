import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { History, Play, Grid, Waves, Info } from 'lucide-react';
import { useCDSWebSocket } from '@/src/hooks/useWebSocket';
import { getCDSInfo } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export function MapPage() {
  const navigate = useNavigate();
  useCDSWebSocket();
  const [timeOffset, setTimeOffset] = useState(0);

  const { data: beaches = [] } = useQuery({
    queryKey: ['beaches'],
    queryFn: () => fetch('/api/beaches').then(res => res.json())
  });

  return (
    <div className="h-screen w-full relative bg-[#060709] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={[15.5, 73.8]} 
          zoom={11} 
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {beaches.map((beach: any) => (
            <BeachMarker key={beach.id} beach={beach} onClick={() => navigate(`/beach/${beach.id}`)} />
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="absolute top-20 left-6 z-30 glass-panel p-4 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-[10px] font-bold uppercase tracking-widest text-outline-variant mb-3">CDS Density Index</div>
        <div className="space-y-3">
          <LegendItem color="bg-primary" label="0-20 Low" />
          <LegendItem color="bg-tertiary" label="21-50 Moderate" />
          <LegendItem color="bg-error-dim" label="51-80 High" />
          <LegendItem color="bg-error" label="81+ Critical" />
        </div>
      </div>

      {/* Right Sidebar - Intelligence Feed */}
      <aside className="absolute top-20 right-6 bottom-32 w-80 glass-panel rounded-3xl border border-white/10 p-6 flex flex-col gap-6 z-10 hidden xl:flex shadow-2xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <h3 className="font-headline font-bold text-xs tracking-widest uppercase text-primary">Live Signals</h3>
          </div>
          <span className="text-[10px] text-outline tabular-nums">{new Date().toLocaleTimeString()}</span>
        </div>
        <div className="space-y-4 overflow-y-auto pr-2">
          <SignalCard type="Environment" title="UV Warning: Index 9.4" desc="Extreme exposure risk. Suggesting shade advisory." color="text-primary-dim" />
          <SignalCard type="Event Protocol" title="Sunburn Mainstage Peak" desc="Vagator access gates at 95% capacity." color="text-tertiary" border="border-l-tertiary" />
          <SignalCard type="Traffic Alert" title="Baga Bridge Gridlock" desc="Structural load limits approaching." color="text-error" border="border-l-error" />
        </div>
        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black font-headline uppercase tracking-widest text-outline">System Sync</span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/20 rounded-full text-primary text-[10px] font-black">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              SYNCED
            </div>
          </div>
        </div>
      </aside>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-6 right-6 lg:left-8 lg:right-8 z-30">
        <div className="glass-panel p-4 lg:p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
          <div className="flex flex-col min-w-[140px]">
            <div className="flex items-center gap-2 mb-1">
              <History size={14} className="text-primary" />
              <span className="text-[11px] font-black uppercase text-primary font-headline tracking-widest">Projection</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-headline font-black tabular-nums">+{timeOffset}h</span>
              <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[8px] font-black uppercase">Real-Time</span>
            </div>
          </div>
          <div className="flex-1 w-full flex flex-col gap-2">
            <input 
              type="range" 
              min="0" max="48" 
              value={timeOffset}
              onChange={(e) => setTimeOffset(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] font-black text-outline uppercase tracking-tighter">
              <span>Present Day</span>
              <span>+12h Forecast</span>
              <span>+24h Peak</span>
              <span>+48h Window</span>
            </div>
          </div>
          <div className="flex items-center gap-4 pl-6 border-l border-white/10">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-outline uppercase mb-2">View</span>
              <div className="flex bg-white/5 p-1 rounded-xl">
                <button className="p-2 bg-primary/20 text-primary rounded-lg"><Grid size={16} /></button>
                <button className="p-2 text-outline hover:text-primary"><Waves size={16} /></button>
              </div>
            </div>
            <button className="flex flex-col items-center gap-1 group">
              <span className="text-[10px] font-bold text-outline uppercase">Play</span>
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                <Play size={20} fill="currentColor" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BeachMarker({ beach, onClick }: { beach: any; onClick: () => void; key?: any }) {
  const info = getCDSInfo(beach.cds);
  
  return (
    <Marker 
      position={[beach.lat, beach.lng]}
      eventHandlers={{ click: onClick }}
      icon={L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="glass-panel p-1 rounded-xl shadow-2xl border-2 border-${info.color.split('-')[1]}/50 flex items-center gap-3 pr-4 transition-transform hover:scale-110 active:scale-95 cursor-pointer">
            <div class="w-12 h-12 ${info.bg.replace('/20', '')} rounded-lg flex items-center justify-center font-headline font-black text-xl text-on-primary">
              ${beach.cds}
            </div>
            <div class="flex flex-col">
              <span class="text-[11px] uppercase font-black ${info.color} leading-tight">${beach.name}</span>
              <div class="flex items-center gap-1">
                <span class="text-[9px] text-outline font-medium">${info.label} Density</span>
              </div>
            </div>
          </div>
        `,
        iconSize: [140, 60],
        iconAnchor: [70, 60]
      })}
    />
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-sm ${color} shadow-lg`}></div>
      <span className="text-[10px] font-bold text-on-surface/80">{label}</span>
    </div>
  );
}

function SignalCard({ type, title, desc, color, border = "" }: any) {
  return (
    <div className={`bg-white/5 p-4 rounded-2xl border border-white/5 ${border}`}>
      <div className="flex justify-between mb-2">
        <span className={`text-[10px] font-black ${color} uppercase tracking-tighter`}>{type}</span>
        <span className="text-[8px] text-outline font-medium">NOW</span>
      </div>
      <p className="text-xs font-bold mb-1">{title}</p>
      <p className="text-[10px] text-outline-variant leading-relaxed">{desc}</p>
    </div>
  );
}
