import React from 'react';
import { motion } from 'motion/react';
import {
  COMPLIANCE_LEGEND,
  type ComplianceLevel,
  type ComplianceStatus,
} from '../lib/tenantCompliance';

interface ComplianceLightProps {
  status: ComplianceStatus;
  size?: 'sm' | 'md';
  showReason?: boolean;
}

const levelStyles: Record<
  Exclude<ComplianceLevel, 'none'>,
  { dot: string; glow: string; chip: string; label: string }
> = {
  green: {
    dot: 'bg-[#169B62]',
    glow: 'bg-[#169B62]/40',
    chip: 'bg-[#169B62]/10 border-[#169B62]/25 text-[#0F6B42]',
    label: 'text-[#0F6B42]',
  },
  orange: {
    dot: 'bg-[#FF883E]',
    glow: 'bg-[#FF883E]/40',
    chip: 'bg-[#FF883E]/10 border-[#FF883E]/25 text-[#C45A12]',
    label: 'text-[#C45A12]',
  },
  red: {
    dot: 'bg-[#DC2626]',
    glow: 'bg-[#DC2626]/40',
    chip: 'bg-[#DC2626]/10 border-[#DC2626]/25 text-[#B91C1C]',
    label: 'text-[#B91C1C]',
  },
};

const assertNever = (value: never): never => {
  throw new Error(`Unhandled compliance level: ${String(value)}`);
};

export const ComplianceDot = ({
  level,
  size = 'md',
}: {
  level: ComplianceLevel;
  size?: 'sm' | 'md';
}) => {
  if (level === 'none') {
    return (
      <span
        className={`${size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-full bg-app-text/20`}
        aria-hidden="true"
      />
    );
  }

  switch (level) {
    case 'green':
    case 'orange':
    case 'red': {
      const styles = levelStyles[level];
      const dimension = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5';
      return (
        <span className={`relative inline-flex ${dimension} items-center justify-center`}>
          <motion.span
            className={`absolute inset-0 rounded-full ${styles.glow}`}
            animate={{ scale: [1, 1.85, 1], opacity: [0.55, 0, 0.55] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className={`relative ${dimension} rounded-full ${styles.dot} shadow-sm`} />
        </span>
      );
    }
    default:
      return assertNever(level);
  }
};

export const ComplianceLight = ({
  status,
  size = 'md',
  showReason = true,
}: ComplianceLightProps) => {
  if (status.level === 'none') {
    return (
      <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-app-text/35">
        <ComplianceDot level="none" size={size} />
        Vacant
      </div>
    );
  }

  const styles = levelStyles[status.level];

  return (
    <div
      className={`inline-flex max-w-full items-center gap-3 rounded-full border px-3 py-1.5 ${styles.chip}`}
      title={status.reason}
    >
      <ComplianceDot level={status.level} size={size} />
      <div className="min-w-0">
        <div className={`text-[10px] font-black uppercase tracking-[0.18em] ${styles.label}`}>
          {status.label}
        </div>
        {showReason && (
          <div className="text-[9px] font-bold normal-case tracking-normal text-app-text/50 leading-snug truncate">
            {status.reason}
          </div>
        )}
      </div>
    </div>
  );
};

export const ComplianceLegend = ({ compact = false }: { compact?: boolean }) => (
  <div className={`flex flex-wrap gap-3 ${compact ? '' : 'mt-4'}`}>
    {COMPLIANCE_LEGEND.map((item) => (
      <div
        key={item.level}
        className="flex items-start gap-2 rounded-2xl border border-app-border bg-white/60 px-3 py-2"
      >
        <ComplianceDot level={item.level} size="sm" />
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-app-text">
            {item.title}
          </div>
          {!compact && (
            <div className="text-[9px] font-bold text-app-text/45 leading-snug max-w-[16rem]">
              {item.detail}
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);
