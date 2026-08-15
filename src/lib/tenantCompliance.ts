export type ComplianceLevel = 'green' | 'orange' | 'red' | 'none';

export interface ComplianceInputs {
  vacant?: boolean;
  balanceDue: number;
  daysPastDue: number | null;
  pendingSignature: boolean;
  unsignedNotices: boolean;
  subletRisk: boolean;
}

export interface ComplianceStatus {
  level: ComplianceLevel;
  label: string;
  reason: string;
}

export const COMPLIANCE_LEGEND: Array<{
  level: Exclude<ComplianceLevel, 'none'>;
  title: string;
  detail: string;
}> = [
  {
    level: 'green',
    title: 'Paperwork current',
    detail: 'Lease, notices, and rent file are up to date.',
  },
  {
    level: 'orange',
    title: 'Waiting on signature',
    detail: 'A lease update, addendum, or notice still needs a signed copy.',
  },
  {
    level: 'red',
    title: 'Action needed',
    detail: 'Rent is 60+ days past due and/or a possible unauthorized subletter is flagged.',
  },
];

export const daysPastDue = (
  lastPaymentDate: string | null | undefined,
  balanceDue: number,
  asOf = new Date(),
): number | null => {
  if (balanceDue <= 0) {
    return 0;
  }

  if (!lastPaymentDate) {
    return null;
  }

  const paidAt = new Date(lastPaymentDate);
  if (Number.isNaN(paidAt.getTime())) {
    return null;
  }

  return Math.max(0, Math.floor((asOf.getTime() - paidAt.getTime()) / 86_400_000));
};

export const deriveComplianceStatus = (input: ComplianceInputs): ComplianceStatus => {
  if (input.vacant) {
    return {
      level: 'none',
      label: 'Vacant',
      reason: 'No resident file to track.',
    };
  }

  const pastDueLongEnough =
    input.daysPastDue !== null && input.daysPastDue >= 60 && input.balanceDue > 0;

  if (input.subletRisk || pastDueLongEnough) {
    const reasons: string[] = [];
    if (pastDueLongEnough && input.daysPastDue !== null) {
      reasons.push(`Rent ${input.daysPastDue} days past due`);
    }
    if (input.subletRisk) {
      reasons.push('Possible unauthorized subletter');
    }

    return {
      level: 'red',
      label: 'Action needed',
      reason: reasons.join(' · '),
    };
  }

  if (input.pendingSignature || input.unsignedNotices) {
    return {
      level: 'orange',
      label: 'Waiting on signature',
      reason: input.pendingSignature
        ? 'Lease or addendum awaiting a signed copy.'
        : 'Notice opened; acknowledgment or signature still open.',
    };
  }

  return {
    level: 'green',
    label: 'Paperwork current',
    reason: 'Lease, notices, and rent file are up to date.',
  };
};
