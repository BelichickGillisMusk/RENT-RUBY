import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Train, Hospital, TreePine, Coffee } from 'lucide-react';

const landmarks = [
  {
    name: 'Mosswood Park',
    image: '/assets/neighborhood/mosswood-park.jpg',
    category: 'Park',
    icon: TreePine,
    size: 'col-span-2 row-span-2'
  },
  {
    name: 'Kaiser Permanente',
    image: '/assets/neighborhood/kaiser-permanente.jpg',
    category: 'Medical',
    icon: Hospital,
    size: 'col-span-1 row-span-1'
  },
  {
    name: 'MacArthur BART',
    image: '/assets/neighborhood/macarthur-bart.jpg',
    category: 'Transit',
    icon: Train,
    size: 'col-span-1 row-span-2'
  },
  {
    name: 'Piedmont Avenue',
    image: '/assets/neighborhood/piedmont-ave.png',
    category: 'Dining',
    icon: Coffee,
    size: 'col-span-1 row-span-1'
  }
];

export const NeighborhoodMosaic = () => {
  return (
    <section id="neighborhood-mosaic" className="py-24 bg-app-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-app-text uppercase tracking-tighter mb-4">
            The Heart of <span className="text-app-accent">Oakland</span>.
          </h2>
          <p className="text-app-text/60 max-w-2xl mx-auto font-medium">
            Perfectly positioned at the intersection of healthcare, transit, and recreation. Everything you need is just steps away.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-4 h-[600px]">
          {landmarks.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-3xl overflow-hidden group ${item.size}`}
            >
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute bottom-6 left-6 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className="w-4 h-4 text-app-accent" />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{item.category}</span>
                </div>
                <h3 className="text-xl font-bold">{item.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 p-8 bg-app-accent/5 border border-app-accent/10 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-app-accent flex items-center justify-center shadow-lg shadow-app-accent/20">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-app-text">3612 Webster St, Oakland</h4>
              <p className="text-app-text/60 font-medium">98 Walk Score • 92 Bike Score • 85 Transit Score</p>
            </div>
          </div>
          <button className="px-10 py-4 bg-app-accent text-white font-black text-sm uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-xl shadow-app-accent/20">
            Apply Now
          </button>
        </div>
      </div>
    </section>
  );
};
