import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  BarChart3, 
  PieChart as PieChartIcon,
  Calendar,
  MessageSquare,
  CreditCard,
  ChevronRight,
  Sparkles,
  MapPin,
  Package,
  Wind,
  Coffee,
  Train,
  Hospital,
  TreePine,
  Camera,
  History,
  Info,
  Menu,
  X,
  Share2,
  DollarSign,
  Activity,
  FileText,
  Mail,
  Wrench,
  LayoutGrid
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { ShimmerBackground, ShimmerEffect } from './components/VisualEffects';
import { AIPropertyVisualizer } from './components/AIImageGenerator';
import { RentRollDashboard } from './components/RentRollDashboard';
import { MaintenanceModule } from './components/MaintenanceModule';
import { FeatureSummarySheet } from './components/FeatureSummarySheet';
import { PropertyHierarchy } from './components/PropertyHierarchy';
import { TenantPortal } from './components/TenantPortal';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './components/ThemeContext';

import { CEOBriefingPortal } from './components/CEOBriefingPortal';
import { AdminLegalLog } from './components/AdminLegalLog';
import { SFPlusModule } from './components/SFPlusModule';
import { MarketMaxModule } from './components/MarketMaxModule';
import { TenantConcernsModule } from './components/TenantConcernsModule';
import { VendorManagement } from './components/VendorManagement';
import { BuildingIntelligence } from './components/BuildingIntelligence';
import { ProductTour } from './components/ProductTour';
import { MaintenanceFlow } from './components/MaintenanceFlow';
import { OwnerPresentation } from './components/OwnerPresentation';
import { NeighborhoodRadiusMap } from './components/NeighborhoodRadiusMap';
import { OwnerShowcaseSnapshot } from './components/OwnerShowcaseSnapshot';

// Revamped Components
import { HeroSection } from './components/HeroSection';
import { NeighborhoodMosaic } from './components/NeighborhoodMosaic';
import { AIDoorman } from './components/AIDoorman';

type AppView = 'hub' | 'admin' | 'tenant';
type AdminTab = 'portfolio' | 'rent-roll' | 'maintenance' | 'marketing' | 'community' | 'ceo' | 'sfplus' | 'marketmax' | 'vendors' | 'concerns';

const revenueData = [
  { month: 'Jan', revenue: 45000, occupancy: 92 },
  { month: 'Feb', revenue: 52000, occupancy: 94 },
  { month: 'Mar', revenue: 48000, occupancy: 93 },
  { month: 'Apr', revenue: 61000, occupancy: 96 },
  { month: 'May', revenue: 59000, occupancy: 95 },
  { month: 'Jun', revenue: 72000, occupancy: 98 },
];

const distributionData = [
  { name: 'Residential', value: 65, color: '#A64B4B' },
  { name: 'Commercial', value: 25, color: '#7A3333' },
  { name: 'Short-term', value: 10, color: '#D18E8E' },
];

const getInitialView = (): AppView => {
  const params = new URLSearchParams(window.location.search);
  const requestedView = params.get('view');

  if (requestedView === 'admin' || requestedView === 'tenant' || requestedView === 'hub') {
    return requestedView;
  }

  return 'hub';
};

export default function App() {
  const { theme } = useTheme();
  const isStaticShowcase = (import.meta as any).env?.VITE_STATIC_SHOWCASE === 'true';
  const [view, setView] = useState<AppView>(getInitialView);
  const [adminTab, setAdminTab] = useState<AdminTab>('portfolio');
  const [rentRollUnlocked, setRentRollUnlocked] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOwnerVision, setShowOwnerVision] = useState(false);

  const adminTabs = isStaticShowcase
    ? [
        { id: 'portfolio', label: 'Portfolio', icon: LayoutGrid },
        { id: 'rent-roll', label: 'Rent Roll', icon: FileText },
      ]
    : [
        { id: 'portfolio', label: 'Portfolio', icon: LayoutGrid },
        { id: 'rent-roll', label: 'Rent Roll', icon: FileText },
        { id: 'maintenance', label: 'Ops', icon: Wrench },
        { id: 'ceo', label: 'CEO Brief', icon: Activity },
        { id: 'vendors', label: 'Vendors', icon: ShieldCheck }
      ];

  return (
    <div className={`min-h-screen font-sans selection:bg-app-accent/30 transition-colors duration-700`}>
      {view === 'admin' && <ShimmerBackground />}
      
      <AnimatePresence>
        {showOwnerVision && (
          <OwnerPresentation onClose={() => setShowOwnerVision(false)} />
        )}
      </AnimatePresence>
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 border-b border-app-border bg-app-bg/80 backdrop-blur-xl transition-all duration-500`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 font-black tracking-tighter text-2xl">
              <span className="text-app-text">RENT-</span>
              <span className="text-app-accent">RUBY</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {view === 'hub' ? (
              <>
                <a href="#about" className="text-app-text/60 hover:text-app-text transition-colors">About</a>
                <a href="#neighborhood-mosaic" className="text-app-text/60 hover:text-app-text transition-colors">Neighborhood</a>
                <a href="#ai-doorman" className="text-app-text/60 hover:text-app-text transition-colors">AI Assistant</a>
              </>
            ) : (
              <>
                <a href="#features" className="text-app-text/60 hover:text-app-text transition-colors">Features</a>
                <a href="#intelligence" className="text-app-text/60 hover:text-app-text transition-colors">Intelligence</a>
                <a href="#rent-roll" className="text-app-text/60 hover:text-app-text transition-colors">Rent Roll</a>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {view === 'admin' && (
              <button 
                onClick={() => setShowOwnerVision(true)}
                className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-app-accent/10 border border-app-accent/20 text-app-accent text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-app-accent hover:text-white transition-all"
              >
                <ShieldCheck className="w-3 h-3" /> Vision Deck
              </button>
            )}
            {/* View Toggle */}
            <div className={`flex p-1 rounded-full bg-app-text/10 border border-app-border`}>
              <button 
                onClick={() => setView('hub')}
                className={`px-3 sm:px-4 py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${
                  view === 'hub' 
                  ? 'bg-app-accent text-white shadow-lg' 
                  : 'text-app-text/60 hover:text-app-text'
                }`}
              >
                Hub
              </button>
              <button 
                onClick={() => setView('admin')}
                className={`px-3 sm:px-4 py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${
                  view === 'admin' 
                  ? 'bg-app-accent text-white shadow-lg' 
                  : 'text-app-text/60 hover:text-app-text'
                }`}
              >
                Admin
              </button>
              <button 
                onClick={() => setView('tenant')}
                className={`px-3 sm:px-4 py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${
                  view === 'tenant' 
                  ? 'bg-app-accent text-white shadow-lg' 
                  : 'text-app-text/60 hover:text-app-text'
                }`}
              >
                Tenant
              </button>
            </div>

            <button className={`md:hidden p-2 text-app-text`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed inset-0 z-40 pt-24 px-6 bg-app-bg text-app-text md:hidden`}
          >
            <div className="flex flex-col gap-8 text-2xl font-serif font-bold">
              {view === 'hub' ? (
                <>
                  <a href="#about" onClick={() => setIsMenuOpen(false)}>About</a>
                  <a href="#neighborhood-mosaic" onClick={() => setIsMenuOpen(false)}>Neighborhood</a>
                  <a href="#ai-doorman" onClick={() => setIsMenuOpen(false)}>AI Assistant</a>
                </>
              ) : (
                <>
                  <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
                  <a href="#intelligence" onClick={() => setIsMenuOpen(false)}>Intelligence</a>
                  <a href="#rent-roll" onClick={() => setIsMenuOpen(false)}>Rent Roll</a>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view === 'hub' ? (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HeroSection />
            <NeighborhoodMosaic />
            <AIDoorman />
            <ProductTour />
            <BuildingIntelligence />
            <OwnerShowcaseSnapshot />
            
            {/* Feature Highlights Section */}
            <section className="py-24 bg-app-bg border-t border-app-border">
              <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                  <div>
                    <h2 className="text-4xl font-black text-app-text uppercase tracking-tighter mb-8">
                      Dual-Sided <span className="text-app-accent">Intelligence</span>.
                    </h2>
                    <div className="space-y-8">
                      <div className="p-6 bg-white rounded-3xl border border-app-border shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-500" />
                          </div>
                          <h3 className="text-xl font-bold text-app-text">Tenant Portal</h3>
                        </div>
                        <p className="text-app-text/60">A sleek, stadium-inspired interface for residents to manage rent, maintenance, and community perks.</p>
                      </div>
                      <div className="p-6 bg-white rounded-3xl border border-app-border shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 rounded-full bg-app-accent/10 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-app-accent" />
                          </div>
                          <h3 className="text-xl font-bold text-app-text">Owner Admin</h3>
                        </div>
                        <p className="text-app-text/60">High-fidelity dashboards featuring AI rent roll analysis and instant bank-speed notifications.</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="aspect-video bg-app-text/5 rounded-[2rem] border border-app-border overflow-hidden shadow-2xl">
                      <img 
                        src="https://images.unsplash.com/photo-1551288049-bbb6518149a8?q=80&w=1000&auto=format&fit=crop" 
                        alt="Dashboard Preview" 
                        className="w-full h-full object-cover opacity-80"
                      />
                    </div>
                    <div className="absolute -bottom-6 -right-6 bg-app-accent text-white p-6 rounded-2xl shadow-xl">
                      <div className="text-2xl font-black">FAST</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Sync Speed</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <footer className="py-20 bg-app-text text-white">
              <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                  <div className="col-span-2">
                    <div className="flex items-center gap-1 font-black tracking-tighter text-3xl mb-8">
                      <span>RENT-</span>
                      <span className="text-app-accent">RUBY</span>
                    </div>
                    <p className="text-white/40 max-w-sm mb-8">
                      Oakland's premier residential experience. Powered by AI, designed for humans.
                    </p>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-app-accent transition-colors cursor-pointer">
                        <Share2 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-xs mb-8 text-app-accent">Navigation</h4>
                    <ul className="space-y-4 text-sm text-white/60">
                      <li className="hover:text-white transition-colors cursor-pointer">About</li>
                      <li className="hover:text-white transition-colors cursor-pointer">Neighborhood</li>
                      <li className="hover:text-white transition-colors cursor-pointer">Apply</li>
                      <li className="hover:text-white transition-colors cursor-pointer">Portal</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-xs mb-8 text-app-accent">Contact</h4>
                    <ul className="space-y-4 text-sm text-white/60">
                      <li>3612 Webster St, Oakland, CA</li>
                      <li>hello@rent-ruby</li>
                      <li>415-900-8563</li>
                    </ul>
                  </div>
                </div>
                <div className="pt-8 border-t border-white/10 flex flex-col md:row justify-between items-center gap-4">
                  <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                    © 2026 RENT-RUBY // ALL RIGHTS RESERVED
                  </div>
                  <div className="flex gap-8 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                  </div>
                </div>
              </div>
            </footer>
          </motion.div>
        ) : view === 'admin' ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pt-24 px-6 pb-20 max-w-7xl mx-auto"
          >
            {/* Admin Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="px-2 py-0.5 bg-app-accent/10 border border-app-accent/20 text-app-accent text-[8px] font-bold uppercase tracking-widest rounded">
                    {isStaticShowcase ? 'Showcase Live' : 'System Live'}
                  </div>
                  <div className="text-[10px] text-app-text/40 font-bold uppercase tracking-widest">Last sync: Just now</div>
                </div>
                <h1 className="text-5xl font-black text-app-text uppercase tracking-tighter">Owner <span className="text-app-accent italic">Intelligence</span>.</h1>
              </div>
              
              <div className="flex p-1 bg-app-text/5 border border-app-border rounded-xl">
                {adminTabs.map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${adminTab === tab.id ? 'bg-white text-app-text shadow-sm' : 'text-app-text/40 hover:text-app-text'}`}
                  >
                    <tab.icon className="w-3 h-3" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Content */}
            <div className="grid grid-cols-1 gap-8">
              {adminTab === 'portfolio' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-app-border shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-app-accent/10 flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-app-accent" />
                        </div>
                        <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
                          <TrendingUp className="w-3 h-3" /> +12.5%
                        </div>
                      </div>
                      <div className="text-app-text/40 text-[10px] font-bold uppercase tracking-widest mb-1">Monthly Revenue</div>
                      <div className="text-4xl font-black text-app-text">$72,450</div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-app-border shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
                          <TrendingUp className="w-3 h-3" /> +2%
                        </div>
                      </div>
                      <div className="text-app-text/40 text-[10px] font-bold uppercase tracking-widest mb-1">Occupancy Rate</div>
                      <div className="text-4xl font-black text-app-text">98.2%</div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-app-border shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                          <Activity className="w-6 h-6 text-purple-500" />
                        </div>
                        <div className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-bold uppercase tracking-widest rounded">Optimal</div>
                      </div>
                      <div className="text-app-text/40 text-[10px] font-bold uppercase tracking-widest mb-1">Market Max Delta</div>
                      <div className="text-4xl font-black text-app-text">+$4,200</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-app-border shadow-sm">
                      <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-app-text">Revenue Performance</h3>
                        <div className="flex gap-2">
                          <div className="flex items-center gap-2 px-3 py-1 bg-app-text/5 rounded-full text-[10px] font-bold uppercase tracking-widest">6 Months</div>
                        </div>
                      </div>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueData}>
                            <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-app-accent)" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="var(--color-app-accent)" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: 'rgba(0,0,0,0.3)'}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: 'rgba(0,0,0,0.3)'}} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                              itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="var(--color-app-accent)" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-app-border shadow-sm">
                      <h3 className="text-xl font-bold text-app-text mb-8">Portfolio Mix</h3>
                      <div className="h-[200px] w-full mb-8">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={distributionData} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: 'rgba(0,0,0,0.3)'}} width={80} />
                            <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                              {distributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-4">
                        {distributionData.map((item) => (
                          <div key={item.name} className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-xs font-bold text-app-text/60">{item.name}</span>
                            </div>
                            <span className="text-xs font-black text-app-text">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {adminTab === 'rent-roll' && (isStaticShowcase ? <OwnerShowcaseSnapshot /> : <RentRollDashboard />)}
              {adminTab === 'maintenance' && <MaintenanceModule />}
              {adminTab === 'ceo' && <CEOBriefingPortal />}
              {adminTab === 'vendors' && <VendorManagement />}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="tenant"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="pt-24 px-6 pb-20 max-w-7xl mx-auto"
          >
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-app-accent flex items-center justify-center text-white">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-app-text uppercase tracking-tighter">Tenant <span className="text-app-accent italic">Lounge</span>.</h1>
                  <p className="text-app-text/40 text-[10px] font-bold uppercase tracking-[0.2em]">Welcome back to the Ruby Soul.</p>
                </div>
              </div>
            </div>
            <TenantPortal demoMode={isStaticShowcase} initialTab="mailbox" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
