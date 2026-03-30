import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Sun, AlertTriangle, Network, Smile, Meh, Frown, MapPin } from 'lucide-react';
import { getCDSInfo, cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

export function BeachDetailPage() {
  const { id } = useParams();
  const { data: beach, isLoading } = useQuery({
    queryKey: ['beach', id],
    queryFn: () => fetch(`/api/beaches/${id}`).then(res => res.json())
  });

  if (isLoading || !beach) return <div className="pt-24 text-center">Loading intelligence...</div>;

  const info = getCDSInfo(beach.cds);

  return (
    <div className="pt-24 pb-20 lg:pb-8 px-4 md:px-8 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-1 bg-primary rounded-full"></div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary-dim font-bold">Live Telemetry</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter">{beach.name} Beach</h1>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-sm">
              <span className="text-xs text-on-surface-variant">CURRENT CDS</span>
              <span className={cn("text-lg font-headline font-bold", info.color)}>{beach.cds}</span>
              <span className={cn("text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider rounded-sm", info.bg, info.color)}>
                {info.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Sun className="text-primary" size={24} />
              <div className="flex flex-col">
                <span className="text-xl font-headline font-medium tabular-nums leading-none">31°C</span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Clear Sky</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-3">
          <button className="bg-primary text-on-primary px-6 py-3 font-headline font-bold text-sm tracking-wide active:scale-95 transition-transform flex items-center gap-2 rounded-md">
            SUBSCRIBE TO LOW CROWD ALERTS
          </button>
          <p className="text-[10px] text-on-surface-variant max-w-[240px] md:text-right">Receive high-priority push notifications when crowd levels drop below 30%.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Forecast Chart */}
        <div className="lg:col-span-8 bg-surface-container rounded-lg p-6 flex flex-col gap-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="font-headline text-xl font-bold text-primary">48-Hour Crowd Forecast</h3>
              <span className="text-xs text-on-surface-variant">Predicted CDS variations based on AI models</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={beach.forecast}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#46484b" opacity={0.1} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#aaabaf' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1d2024', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#81ecff' }}
                />
                <Bar dataKey="cds" radius={[4, 4, 0, 0]}>
                  {beach.forecast.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.cds > 50 ? '#ff716c' : '#81ecff'} fillOpacity={0.6} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly Box */}
        <div className="lg:col-span-4 bg-surface-container-high rounded-lg p-6 border-l-4 border-tertiary shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-tertiary" />
            <h3 className="font-headline text-lg font-bold">Anomaly Explanation</h3>
          </div>
          <p className="text-sm text-on-surface leading-relaxed mb-6">
            Predicted spike at <span className="text-tertiary font-bold">7 PM</span> due to the <span className="text-tertiary">Saturday Night Market</span> influx. Historical patterns show a 40% density increase.
          </p>
          <div className="bg-background/40 p-4 rounded border border-outline-variant/10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">Confidence Score</span>
              <span className="text-[10px] font-bold text-primary">92%</span>
            </div>
            <div className="h-1.5 w-full bg-outline-variant/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[92%]"></div>
            </div>
          </div>
        </div>

        {/* Signals */}
        <div className="lg:col-span-6 bg-surface-container rounded-lg p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Network className="text-primary" />
            <h3 className="font-headline text-lg font-bold">Intelligence Signals</h3>
          </div>
          <div className="space-y-6">
            <SignalProgress label="Social Signals" sub="Check-ins & Social Velocity" value={64} />
            <SignalProgress label="Weather Context" sub="Heat Index & Wind Velocity" value={12} />
            <SignalProgress label="Historical Trends" sub="Past 5-year Seasonal Average" value={24} />
          </div>
        </div>

        {/* Verification */}
        <div className="lg:col-span-6 glass-panel rounded-lg p-6 flex flex-col justify-center items-center text-center gap-6">
          <div className="space-y-1">
            <h3 className="font-headline text-xl font-bold">Crowd Truth Verification</h3>
            <p className="text-sm text-on-surface-variant">Are you currently at {beach.name}? Help calibrate our AI.</p>
          </div>
          <div className="flex gap-4 w-full max-w-md">
            <VoteButton icon={Smile} label="Low" color="text-primary-dim" />
            <VoteButton icon={Meh} label="Med" color="text-tertiary" />
            <VoteButton icon={Frown} label="High" color="text-error" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SignalProgress({ label, sub, value }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-[10px] text-on-surface-variant">{sub}</span>
        </div>
        <span className="text-lg font-headline font-bold tabular-nums text-primary">{value}%</span>
      </div>
      <div className="h-1 w-full bg-outline-variant/10 rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}

function VoteButton({ icon: Icon, label, color }: any) {
  return (
    <button className="flex-1 flex flex-col items-center gap-2 p-4 bg-surface-container-high border border-outline-variant/10 rounded-lg hover:border-primary/50 transition-all active:scale-95">
      <Icon className={color} size={24} />
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
