import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-app-bg pt-20">
      {/* Muted Graphic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-[0.03] rotate-12">
          <div className="grid grid-cols-12 h-full w-full">
            {[...Array(144)].map((_, i) => (
              <div key={i} className="border-[0.5px] border-app-text flex items-center justify-center text-[8px] font-black uppercase tracking-tighter text-app-text/20">
                RUBY
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-app-bg via-transparent to-app-bg" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-app-accent/10 border border-app-accent/20 rounded-full mb-8">
              <Sparkles className="w-3.5 h-3.5 text-app-accent" />
              <span className="text-[10px] font-bold text-app-accent uppercase tracking-[0.2em]">
                EST. 1924 // OAKLAND, CA
              </span>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-app-text uppercase tracking-tighter leading-[0.85] mb-8">
              LIVE <br />
              <span className="text-app-accent">RUBY.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-app-text/60 font-medium max-w-xl mb-12 leading-relaxed">
              Historic Oakland charm meets high-speed management. Experience the ultimate lifestyle with AI-powered concierge and seamless owner reporting.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <button className="group px-10 py-5 bg-app-accent text-white font-black text-sm uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-xl shadow-app-accent/30 flex items-center justify-center gap-3">
                Apply Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-10 py-5 bg-white border border-app-border text-app-text font-black text-sm uppercase tracking-widest rounded-full hover:bg-app-text hover:text-white transition-all">
                View Units
              </button>
            </div>
            
            <div className="mt-12 flex items-center gap-8 border-t border-app-border pt-8">
              <div>
                <div className="text-3xl font-black text-app-text">98%</div>
                <div className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest">Occupancy</div>
              </div>
              <div className="w-px h-8 bg-app-border" />
              <div>
                <div className="text-3xl font-black text-app-text">0.8s</div>
                <div className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest">AI Response</div>
              </div>
              <div className="w-px h-8 bg-app-border" />
              <div>
                <div className="text-3xl font-black text-app-text">24/7</div>
                <div className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest">Support</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1560662105-57f8ad6ae2d1?q=80&w=1000&auto=format&fit=crop" 
                alt="Historic Oakland Building" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-12 left-12 right-12">
                <div className="text-[10px] font-bold text-app-accent uppercase tracking-widest mb-2">The Ruby Building</div>
                <div className="text-3xl font-serif italic text-white">Historic Charm. <br />Modern Living.</div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-app-accent rounded-full blur-3xl opacity-20 animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500 rounded-full blur-[100px] opacity-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
