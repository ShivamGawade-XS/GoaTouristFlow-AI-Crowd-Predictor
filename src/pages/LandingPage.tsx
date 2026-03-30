import React from 'react';
import { Link } from 'react-router-dom';
import { Map as MapIcon, ChevronRight, Search, Activity, Wind, History, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-on-background overflow-x-hidden">
      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        <section className="mt-8 mb-16 lg:mt-12">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-3/5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-primary animate-pulse rounded-full"></div>
                <span className="text-xs font-label uppercase tracking-widest text-primary font-medium">Live: Updated 2 mins ago</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-headline font-extrabold tracking-tighter leading-[0.9] mb-6">
                Know your beach <br/> <span className="text-primary-dim">before you go.</span>
              </h1>
              <p className="text-on-surface-variant text-lg max-w-xl mb-10 leading-relaxed">
                Real-time Crowd Density Score (CDS) utilizing advanced signal processing of social patterns, weather telemetry, and historical occupancy data.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/map" className="bg-primary text-on-primary px-8 py-4 font-headline font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all">
                  GO TO LIVE MAP
                  <MapIcon size={20} />
                </Link>
                <div className="relative">
                  <select className="appearance-none bg-surface-container-high border-b-2 border-outline-variant focus:border-primary px-6 py-4 pr-12 text-on-surface font-headline font-medium w-full sm:w-64 cursor-pointer outline-none transition-all">
                    <option value="">Select Beach</option>
                    <option value="calangute">Calangute</option>
                    <option value="baga">Baga</option>
                    <option value="anjuna">Anjuna</option>
                  </select>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:w-2/5 w-full relative"
            >
              <div className="aspect-square bg-surface-container relative overflow-hidden shadow-2xl rounded-2xl">
                <img 
                  className="w-full h-full object-cover grayscale opacity-40 mix-blend-screen" 
                  src="https://picsum.photos/seed/goa-coast/800/800" 
                  alt="Goa Coastline"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
                <div className="absolute top-8 right-8 glass-panel p-4 border-l-2 border-primary rounded-lg">
                  <div className="text-[10px] uppercase tracking-widest text-outline-variant font-bold mb-1">Statewide Average</div>
                  <div className="text-3xl font-headline font-black tabular-nums text-primary">CDS 24</div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-primary-dim font-bold">
                    <Activity size={12} />
                    <span>12% VS YESTERDAY</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mb-24">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-headline font-bold">Live Density Monitor</h2>
            <span className="text-outline text-sm">Showing top destinations</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BeachCard name="Calangute" cds={18} status="Low" />
            <BeachCard name="Baga" cds={78} status="High" />
            <BeachCard name="Anjuna" cds={12} status="Very Low" />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-outline-variant/15 pt-16">
          <div>
            <h2 className="text-4xl font-headline font-extrabold tracking-tighter mb-4">How it <br/> Works.</h2>
            <p className="text-on-surface-variant">The Crowd Density Score (CDS) is an aggregated intelligence metric computed every 120 seconds.</p>
          </div>
          <div className="space-y-8">
            <FeatureItem num="01" title="Social Synthesis" desc="Processing real-time geo-tagged signal clusters from public social platforms." />
            <FeatureItem num="02" title="Weather Telemetry" desc="Cross-referencing tide charts, wind speeds, and UV index to predict shifts." />
          </div>
          <div className="space-y-8">
            <FeatureItem num="03" title="Historical Benchmarks" desc="Comparing current flow against 5 years of seasonal data to identify anomalies." />
            <div className="bg-surface-container-high p-4 border-l-2 border-secondary rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-secondary" />
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">AI Intelligence</span>
              </div>
              <p className="text-xs text-on-surface italic">"Current trend suggests a 15% density drop across North Goa within the next 45 minutes."</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function BeachCard({ name, cds, status }: { name: string; cds: number; status: string }) {
  const isHigh = cds > 50;
  return (
    <div className="bg-surface-container-high p-8 flex flex-col justify-between group cursor-pointer hover:bg-surface-bright transition-all rounded-xl border border-outline-variant/5">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-3xl font-headline font-bold mb-1">{name}</h3>
          <p className="text-on-surface-variant text-sm">North Goa • Tourist Hub</p>
        </div>
        <div className={cn(
          "px-3 py-1 text-xs font-headline font-bold rounded",
          isHigh ? "bg-error/10 text-error" : "bg-primary/10 text-primary"
        )}>
          CDS {cds}
        </div>
      </div>
      <div className="mt-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-1 w-24 bg-outline-variant overflow-hidden rounded-full">
            <div 
              className={cn("h-full transition-all duration-1000", isHigh ? "bg-error" : "bg-primary")} 
              style={{ width: `${cds}%` }} 
            />
          </div>
          <span className={cn("text-xs font-headline font-bold uppercase", isHigh ? "text-error" : "text-primary")}>
            {status}
          </span>
        </div>
        <ChevronRight size={20} className="text-on-surface-variant group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
}

function FeatureItem({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <span className="text-primary font-headline font-black text-2xl">{num}</span>
      <div>
        <h4 className="font-headline font-bold mb-2">{title}</h4>
        <p className="text-sm text-on-surface-variant leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
