import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, ShieldCheck, MessageSquare, Smartphone, Clock } from 'lucide-react';

export const AIDoorman = () => {
  const features = [
    {
      title: "24/7 Digital Concierge",
      desc: "Instant answers for maintenance, guests, and neighborhood tips.",
      icon: MessageSquare
    },
    {
      title: "AI-Powered Entry",
      desc: "Secure, keyless smartphone access for you and your verified guests.",
      icon: Smartphone
    },
    {
      title: "Speed of Chase Bank",
      desc: "Owner notifications and rent roll updates delivered instantly.",
      icon: Zap
    },
    {
      title: "Assistant GM Logic",
      desc: "AI-driven triage that handles issues before they become problems.",
      icon: ShieldCheck
    }
  ];

  return (
    <section id="ai-doorman" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-app-accent/5 -skew-x-12 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-app-accent/10 text-app-accent rounded-full mb-8">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Next-Gen Management</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-app-text uppercase tracking-tighter leading-none mb-8">
              Meet Your <br />
              <span className="text-app-accent">AI Doorman.</span>
            </h2>
            <p className="text-xl text-app-text/70 mb-12 leading-relaxed">
              Rent-Ruby isn't just a building; it's a smart ecosystem. Our AI Assistant GM handles the heavy lifting, from tenant requests to owner reporting, with the precision of a high-end bank.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-app-accent/10 flex items-center justify-center">
                    <f.icon className="w-6 h-6 text-app-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-app-text mb-1">{f.title}</h4>
                    <p className="text-sm text-app-text/60 leading-snug">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-app-border bg-app-bg p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-app-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-app-accent flex items-center justify-center text-white font-black">R</div>
                  <div>
                    <div className="font-bold text-app-text">Ruby Assistant</div>
                    <div className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Always Active
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-app-text/5 rounded-full text-[10px] font-bold">GM MODE</div>
              </div>
              
              <div className="space-y-6 mb-8">
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-app-text/5 p-4 rounded-2xl rounded-tl-none text-sm">
                    "Welcome back, Unit 302. I've processed your maintenance request and scheduled a technician for tomorrow at 10 AM. Would you like a calendar invite?"
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-app-accent text-white p-4 rounded-2xl rounded-tr-none text-sm shadow-lg shadow-app-accent/20">
                    "Yes, please. Also, can you grant guest access for 'John Smith' at 6 PM?"
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-app-text/5 p-4 rounded-2xl rounded-tl-none text-sm">
                    "Access granted. John will receive a secure link to his smartphone. I've also notified the Owner Admin that guest protocols are active."
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ask Ruby Assistant..." 
                  className="w-full bg-app-text/5 border border-app-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-app-accent transition-colors"
                />
                <button className="absolute right-2 top-2 bottom-2 px-6 bg-app-accent text-white rounded-xl text-xs font-bold uppercase tracking-widest">
                  Send
                </button>
              </div>
            </div>
            
            {/* Floating stats */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-10 -right-10 bg-white shadow-xl rounded-2xl p-6 border border-app-border hidden md:block"
            >
              <div className="text-3xl font-black text-app-accent mb-1">0.8s</div>
              <div className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest">Response Time</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
