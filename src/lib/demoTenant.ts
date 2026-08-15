export const DEMO_TENANT = {
  name: 'McDuff Gillis',
  firstName: 'McDuff',
  unit: '105',
  rent: 2450,
  email: 'mcduff.gillis@rent-ruby.com',
  leaseStart: '2024-08-01',
  leaseEnd: '2027-08-01',
  lastPayment: '2026-08-01',
} as const;

const TENANT_DEMO_HOSTS = new Set([
  'tenant.rent-ruby.com',
  'tenant.localhost',
  'tenant.127.0.0.1.nip.io',
]);

export const isTenantDemoHost = (hostname = window.location.hostname) =>
  hostname.startsWith('tenant.') || TENANT_DEMO_HOSTS.has(hostname);
