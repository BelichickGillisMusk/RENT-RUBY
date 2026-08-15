import React from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Bell,
  CheckCircle2,
  Database,
  FileText,
  Filter,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { ComplianceLegend, ComplianceLight } from './ComplianceLight';
import type { ComplianceLevel, ComplianceStatus } from '../lib/tenantCompliance';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const rentRollSnapshot = [
  { unit: '105', resident: 'McDuff Gillis', rent: '$2,450', status: 'Paid', lease: 'Signature open', risk: 'Watch', compliance: 'orange' as const, note: '2026 lease packet awaiting signed copy.' },
  { unit: '101', resident: 'Tenant A.', rent: '$2,450', status: 'Paid', lease: 'Current', risk: 'Low', compliance: 'green' as const, note: 'Paperwork and rent file are current.' },
  { unit: '104', resident: 'Tenant M.', rent: '$2,725', status: 'Paid', lease: '12 mo left', risk: 'Low', compliance: 'green' as const, note: 'Notices acknowledged; deposit matched.' },
  { unit: '203', resident: 'Tenant K.', rent: '$2,300', status: 'Watch', lease: '62 days past due', risk: 'High', compliance: 'red' as const, note: 'Rent 62 days past due · possible unauthorized subletter.' },
  { unit: '302', resident: 'Vacant', rent: '$2,950', status: 'Listed', lease: 'Open', risk: 'Market', compliance: 'none' as const, note: 'No resident file to track.' },
];

const showcaseComplianceStatus = (
  level: ComplianceLevel,
  reason: string,
): ComplianceStatus => {
  switch (level) {
    case 'green':
      return { level, label: 'Paperwork current', reason };
    case 'orange':
      return { level, label: 'Waiting on signature', reason };
    case 'red':
      return { level, label: 'Action needed', reason };
    case 'none':
      return { level, label: 'Vacant', reason };
    default: {
      const exhaustive: never = level;
      return exhaustive;
    }
  }
};

const filterStack = [
  'Chase deposit sync',
  'Automatic legal notices',
  'Read receipts',
  'Signature metadata',
  'Sublease risk',
  'Offsite archive',
];

const performanceData = [
  { label: 'Jan', value: 91 },
  { label: 'Feb', value: 94 },
  { label: 'Mar', value: 93 },
  { label: 'Apr', value: 97 },
  { label: 'May', value: 96 },
  { label: 'Jun', value: 98 },
];

const techStack = [
  { label: 'Chase deposit matching', icon: Database },
  { label: 'Timestamped legal notices', icon: FileText },
  { label: 'Smart building signals', icon: Zap },
  { label: 'Signature audit trail', icon: ShieldCheck },
  { label: 'Owner-ready alerts', icon: Bell },
  { label: 'Sublease protections', icon: Users },
];

const safeguardStack = [
  'Notice to Enter packets with sent/opened/acknowledged timestamps',
  'Lease updates with tenant signature, IP/domain, device, and time evidence',
  'Construction notifications archived with the exact document version',
  'Sublease and guest-policy acknowledgments for false-claim defense',
];

const notificationFeed = [
  {
    source: 'GM',
    title: 'GM · 3875 Ruby',
    detail: 'Chase deposit downloaded and matched to McDuff Gillis, Unit 105 rent.',
    badge: 'Matched',
    color: 'bg-[#169B62]',
  },
  {
    source: '105',
    title: 'McDuff 105 direct',
    detail: 'Maintenance note received; timestamped and routed to GM queue.',
    badge: 'Tenant',
    color: 'bg-[#FF883E]',
  },
  {
    source: 'GM',
    title: 'GM · Piedmont',
    detail: 'Notice to Enter packet ready for owner review and offsite archive.',
    badge: 'Legal',
    color: 'bg-[#169B62]',
  },
  {
    source: 'T',
    title: 'Tenant direct · Berkeley Lofts',
    detail: 'Construction notification viewed; read receipt captured.',
    badge: 'Viewed',
    color: 'bg-[#FF883E]',
  },
];

export const OwnerShowcaseSnapshot = () => {
  return (
    <section id="rent-roll" className="py-28 bg-app-bg border-t border-app-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-14">
          <div className="max-w-3xl">
            <div className="text-[10px] font-black text-app-accent uppercase tracking-[0.35em] mb-4">
              RENT DMC Owner Portal
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-app-text uppercase tracking-tighter leading-[0.9]">
              <span className="text-[#169B62]">RENT</span> <span className="text-app-text">D</span><span className="text-[#FF883E]">MC</span>
              <br />
              <span className="text-4xl md:text-6xl">owner command center.</span>
            </h2>
          </div>
          <p className="text-app-text/55 text-lg font-medium max-w-md">
            Large owner-facing view with Irish flag colors, rent roll, GM and
            tenant notifications, Chase deposits, automatic legal notices, read
            receipts, sublease protection, and offsite archives.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="xl:col-span-8 bg-white rounded-[2.5rem] border border-app-border shadow-2xl overflow-hidden"
          >
            <div className="p-6 md:p-8 border-b border-app-border flex flex-col md:flex-row gap-4 md:items-center justify-between">
              <div>
                <div className="text-[10px] font-black text-app-text/35 uppercase tracking-[0.25em] mb-2">
                  3875 Ruby Street / Chase + Legal Evidence View
                </div>
                <h3 className="text-2xl font-black text-app-text">Intelligent Rent Roll</h3>
                <p className="text-xs font-bold text-app-text/45 mt-2 max-w-xl">
                  Updates when Chase deposits download, matches payments to units,
                  flags exceptions, and stores deposit evidence offsite. Internal
                  file lights stay on the staff side only.
                </p>
                <ComplianceLegend compact />
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="px-3 py-2 rounded-full bg-app-text/5 text-[10px] font-black uppercase tracking-widest text-app-text/60 flex items-center gap-2">
                  <Search className="w-3 h-3" /> Search
                </div>
                <div className="px-3 py-2 rounded-full bg-app-accent text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Filter className="w-3 h-3" /> 12 Filters
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 md:p-8">
              {[
                ['Monthly Rent', '$72,450', '+12.5%'],
                ['Occupancy', '98.2%', 'Only 2 open'],
                ['Upside Found', '+$4,200', 'Market Max'],
              ].map(([label, value, detail]) => (
                <div key={label} className="p-5 rounded-[1.5rem] bg-app-text/[0.03] border border-app-border">
                  <div className="text-[9px] font-black text-app-text/35 uppercase tracking-[0.25em] mb-2">{label}</div>
                  <div className="text-3xl font-black text-app-text">{value}</div>
                  <div className="mt-2 text-xs font-bold text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {detail}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 md:px-8 pb-8 overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead>
                  <tr className="text-[9px] font-black uppercase tracking-[0.25em] text-app-text/35">
                    <th className="py-4">Unit</th>
                    <th>Resident</th>
                    <th>Rent</th>
                    <th>Status</th>
                    <th>Lease</th>
                    <th>Staff light</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {rentRollSnapshot.map((row) => (
                    <tr key={row.unit} className="text-sm font-bold text-app-text">
                      <td className="py-4">
                        <span className="px-3 py-1 rounded-sm bg-app-text text-white text-xs font-black">{row.unit}</span>
                      </td>
                      <td>{row.resident}</td>
                      <td>{row.rent}</td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest ${
                          row.status === 'Paid' ? 'bg-green-500/10 text-green-700' :
                          row.status === 'Watch' ? 'bg-amber-500/10 text-amber-700' :
                          'bg-app-accent/10 text-app-accent'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="text-app-text/55">{row.lease}</td>
                      <td className="py-4 pr-2">
                        <ComplianceLight
                          status={showcaseComplianceStatus(row.compliance, row.note)}
                          size="sm"
                          showReason={false}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <div className="xl:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-[#169B62]/15 via-white to-[#FF883E]/20 rounded-[2.5rem] p-8 border-2 border-[#169B62]/20 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-app-text">Notifications</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#169B62]">17 new</span>
              </div>
              <div className="space-y-3">
                {notificationFeed.map((item) => (
                  <div key={`${item.title}-${item.badge}`} className="grid grid-cols-[auto_1fr_auto] gap-3 items-center p-4 rounded-2xl bg-white/80 border border-app-border">
                    <div className={`w-10 h-10 rounded-xl ${item.color} text-white text-[10px] font-black flex items-center justify-center`}>
                      {item.source}
                    </div>
                    <div>
                      <div className="text-sm font-black text-app-text">{item.title}</div>
                      <div className="text-xs font-bold text-app-text/50 leading-relaxed">{item.detail}</div>
                    </div>
                    <div className="px-2 py-1 rounded-full bg-app-text/5 text-[9px] font-black uppercase tracking-widest text-app-text/50">
                      {item.badge}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-app-text text-white rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black">Filter Stack</h3>
                <CheckCircle2 className="w-5 h-5 text-app-accent" />
              </div>
              <div className="grid grid-cols-1 gap-3">
                {filterStack.map((filter) => (
                  <div key={filter} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-white/70">
                    {filter}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2.5rem] p-8 border border-app-border shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-app-text">Occupancy Signal</h3>
                <span className="text-[9px] font-black uppercase tracking-widest text-green-600">Optimal</span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                    <YAxis hide domain={[80, 100]} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      {performanceData.map((_, index) => (
                        <Cell key={index} fill={index === performanceData.length - 1 ? '#FF5F1F' : '#0B1A2D'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2.5rem] p-8 border border-app-border shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-app-text">Owner Safeguards</h3>
                <ShieldCheck className="w-5 h-5 text-app-accent" />
              </div>
              <div className="space-y-3">
                {safeguardStack.map((safeguard) => (
                  <div key={safeguard} className="p-4 rounded-2xl bg-app-text/[0.03] border border-app-border text-xs font-bold text-app-text/65 leading-relaxed">
                    {safeguard}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          {techStack.map((item) => (
            <div key={item.label} className="bg-white/70 backdrop-blur-sm border border-app-border rounded-[1.5rem] p-5">
              <item.icon className="w-5 h-5 text-app-accent mb-4" />
              <div className="text-[10px] font-black uppercase tracking-widest text-app-text/60 leading-relaxed">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
