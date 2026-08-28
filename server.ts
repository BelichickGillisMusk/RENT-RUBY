import express, { type Request } from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databasePath = process.env.DATABASE_PATH || "rentroll_v3.db";
const databaseDir = path.dirname(databasePath);
if (databaseDir !== "." && !fs.existsSync(databaseDir)) {
  fs.mkdirSync(databaseDir, { recursive: true });
}

const db = new Database(databasePath);

const LEGAL_LIBRARY_USAGE_WINDOW_MS = 60 * 1000;
const LEGAL_LIBRARY_USAGE_MAX_PER_WINDOW = 30;
const legalLibraryUsageRequests = new Map<string, { count: number; resetAt: number }>();

const getClientIp = (req: Request) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0] || req.ip || "unknown";
  }

  return forwardedFor?.split(",")[0]?.trim() || req.ip || "unknown";
};

const canLogLegalLibraryUsage = (clientIp: string) => {
  const now = Date.now();
  const current = legalLibraryUsageRequests.get(clientIp);

  if (!current || current.resetAt <= now) {
    legalLibraryUsageRequests.set(clientIp, {
      count: 1,
      resetAt: now + LEGAL_LIBRARY_USAGE_WINDOW_MS,
    });
    return true;
  }

  if (current.count >= LEGAL_LIBRARY_USAGE_MAX_PER_WINDOW) {
    return false;
  }

  current.count += 1;
  return true;
};

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    neighborhood TEXT,
    trash_day TEXT,
    street_sweeping_day TEXT,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    unit_number TEXT NOT NULL,
    rent_amount REAL NOT NULL,
    status TEXT DEFAULT 'Vacant',
    photos TEXT,
    needs_reply INTEGER DEFAULT 0,
    last_tenant_activity_at DATETIME,
    FOREIGN KEY (property_id) REFERENCES properties(id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'GM', -- 'OWNER', 'GM', 'ACCOUNTING', 'TENANT'
    name TEXT NOT NULL,
    phone TEXT
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    preferred_notification_time TEXT DEFAULT '09:00',
    sms_enabled INTEGER DEFAULT 1,
    email_enabled INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    unit_id INTEGER,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    lease_start DATE,
    lease_end DATE,
    balance_due REAL DEFAULT 0,
    last_login_at TEXT,
    last_login_ip TEXT,
    FOREIGN KEY (unit_id) REFERENCES units(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER,
    friend_name TEXT NOT NULL,
    friend_email TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS construction_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    update_date DATE DEFAULT CURRENT_DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id)
  );

  CREATE TABLE IF NOT EXISTS security_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    type TEXT NOT NULL, -- 'Recognition', 'Deterrence', 'Alert'
    description TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    image_url TEXT,
    FOREIGN KEY (property_id) REFERENCES properties(id)
  );

  CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER,
    description TEXT NOT NULL,
    photo_url TEXT,
    status TEXT DEFAULT 'Pending Review',
    gm_notes TEXT,
    approval_notes TEXT,
    assigned_to TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES units(id)
  );

  CREATE TABLE IF NOT EXISTS tenant_concerns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    gm_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES units(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES units(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER,
    amount REAL NOT NULL,
    payment_date DATE NOT NULL,
    status TEXT DEFAULT 'Paid',
    FOREIGN KEY (unit_id) REFERENCES units(id)
  );

  CREATE TABLE IF NOT EXISTS legal_forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Notice', 'Lease', 'Addendum'
    content_template TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS laws_regulations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    jurisdiction TEXT NOT NULL, -- 'Oakland', 'California', 'Federal'
    summary TEXT NOT NULL,
    link TEXT,
    last_updated DATE
  );

  CREATE TABLE IF NOT EXISTS market_comparables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_name TEXT NOT NULL,
    address TEXT NOT NULL,
    sale_price REAL,
    rental_rate REAL,
    occupancy_rate REAL,
    distance_miles REAL,
    last_updated DATE
  );

  CREATE TABLE IF NOT EXISTS bank_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    matched_unit_id INTEGER,
    status TEXT DEFAULT 'Unmatched', -- 'Matched', 'Unmatched', 'Ignored'
    FOREIGN KEY (matched_unit_id) REFERENCES units(id)
  );

  CREATE TABLE IF NOT EXISTS investment_projections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    projected_roi REAL,
    banked_rents REAL DEFAULT 0,
    target_occupancy REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id)
  );

  CREATE TABLE IF NOT EXISTS tenant_notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'Sent', -- 'Sent', 'Viewed', 'Acknowledged'
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    viewed_at DATETIME,
    acknowledged_at DATETIME,
    viewed_ip TEXT,
    acknowledged_ip TEXT,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS lease_violations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER,
    violation_type TEXT, -- 'Unauthorized Occupant', 'Property Damage', 'Noise Complaint', 'Non-Payment', etc.
    description TEXT NOT NULL,
    violation_date DATE NOT NULL,
    photo_url TEXT,
    gm_notes TEXT,
    status TEXT DEFAULT 'Logged', -- 'Logged', 'Notice Sent', 'Resolved'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS lease_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER,
    year INTEGER NOT NULL,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'In Progress', 'Completed'
    walkthrough_completed INTEGER DEFAULT 0,
    signed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS lease_update_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    service_type TEXT NOT NULL, -- 'Plumbing', 'Electrical', 'Cleaning', 'Security'
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    insurance_expiry_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS security_cameras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    location TEXT NOT NULL,
    model TEXT NOT NULL,
    installation_date DATE NOT NULL,
    status TEXT DEFAULT 'Operational', -- 'Operational', 'Maintenance Required', 'Offline'
    last_update DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (property_id) REFERENCES properties(id)
  );

  CREATE TABLE IF NOT EXISTS legal_library_2026 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    pdf_url TEXT,
    external_link TEXT,
    is_mandatory INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS legal_library_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    user_email TEXT NOT NULL,
    accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES legal_library_2026(id)
  );

  CREATE TABLE IF NOT EXISTS wizard_chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS waitlist_signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    desired_move_in TEXT,
    unit_pref TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: Add neighborhood column if it doesn't exist
try {
  db.exec("ALTER TABLE properties ADD COLUMN neighborhood TEXT");
} catch (e) {
  // Column likely already exists
}

// Migration: Add assigned_to and gm_notes to maintenance_requests if they don't exist
try {
  db.exec("ALTER TABLE maintenance_requests ADD COLUMN assigned_to TEXT");
} catch (e) {}
try {
  db.exec("ALTER TABLE maintenance_requests ADD COLUMN gm_notes TEXT");
} catch (e) {}
try {
  db.exec("ALTER TABLE maintenance_requests ADD COLUMN cost REAL DEFAULT 0");
} catch (e) {}
try {
  db.exec("ALTER TABLE maintenance_requests ADD COLUMN is_emergency INTEGER DEFAULT 0");
} catch (e) {}
try {
  db.exec("ALTER TABLE maintenance_requests ADD COLUMN is_escalated INTEGER DEFAULT 0");
} catch (e) {}

// Migration: Add photos column to units if it doesn't exist
try {
  db.exec("ALTER TABLE units ADD COLUMN photos TEXT");
} catch (e) {}
try {
  db.exec("ALTER TABLE maintenance_requests ADD COLUMN cost REAL DEFAULT 0");
} catch (e) {}
try {
  db.exec("ALTER TABLE maintenance_requests ADD COLUMN is_emergency INTEGER DEFAULT 0");
} catch (e) {}
try {
  db.exec("ALTER TABLE maintenance_requests ADD COLUMN is_escalated INTEGER DEFAULT 0");
} catch (e) {}

// Migration: Add photos to units
try {
  db.exec("ALTER TABLE units ADD COLUMN photos TEXT");
} catch (e) {}

// Migration: Add schedule info to properties
try {
  db.exec("ALTER TABLE properties ADD COLUMN trash_day TEXT");
} catch (e) {}
try {
  db.exec("ALTER TABLE properties ADD COLUMN street_sweeping_day TEXT");
} catch (e) {}

// Migration: Add violation_type to lease_violations
try {
  db.exec("ALTER TABLE lease_violations ADD COLUMN violation_type TEXT");
} catch (e) {}

// Seed data if empty
const propertyCount = db.prepare("SELECT COUNT(*) as count FROM properties").get() as { count: number };
if (propertyCount.count === 0) {
  const insertProperty = db.prepare("INSERT INTO properties (name, address, neighborhood, trash_day, street_sweeping_day, image_url) VALUES (?, ?, ?, ?, ?, ?)");
  
  // Property 1: Ruby Street
  const rubyId = insertProperty.run(
    "3875 Ruby Street", 
    "3875 Ruby St, Oakland, CA 94609", 
    "Mosswood",
    "Tuesday",
    "2nd & 4th Thursday",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200"
  ).lastInsertRowid;

  // Property 2: Piedmont Ave
  const piedmontId = insertProperty.run(
    "4200 Piedmont", 
    "4200 Piedmont Ave, Oakland, CA 94611", 
    "Piedmont Ave",
    "Monday",
    "1st & 3rd Wednesday",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200"
  ).lastInsertRowid;

  // Property 3: Berkeley Lofts
  const berkeleyId = insertProperty.run(
    "Berkeley Lofts", 
    "2100 University Ave, Berkeley, CA 94704", 
    "Downtown Berkeley",
    "Friday",
    "Every Tuesday",
    "https://images.unsplash.com/photo-1600607687940-467f4b637779?q=80&w=1200"
  ).lastInsertRowid;

  const insertUser = db.prepare("INSERT INTO users (email, role, name) VALUES (?, ?, ?)");
  insertUser.run("admin@mobilecarbsmoketest.com", "OWNER", "Owner");
  insertUser.run("mezfin@example.com", "GM", "Mezfin");

  const insertUnit = db.prepare("INSERT INTO units (property_id, unit_number, rent_amount, status) VALUES (?, ?, ?, ?)");
  const insertTenant = db.prepare("INSERT INTO tenants (unit_id, name, email, lease_start, lease_end, balance_due, last_login_at, last_login_ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  const insertPayment = db.prepare("INSERT INTO payments (unit_id, amount, payment_date, status) VALUES (?, ?, ?, ?)");

  // Generate units for Ruby Street
  for (let floor = 1; floor <= 3; floor++) {
    for (let unitIdx = 1; unitIdx <= 8; unitIdx++) {
      const unitNum = `${floor}${unitIdx.toString().padStart(2, '0')}`;
      const rent = 1800 + (floor * 200) + (Math.random() * 300);
      const isOccupied = Math.random() > 0.1;
      const status = isOccupied ? "Occupied" : "Vacant";
      const unitId = insertUnit.run(rubyId, unitNum, Math.round(rent), status).lastInsertRowid;

      if (isOccupied) {
        const name = `Tenant ${unitNum}`;
        // Varied lease ends for testing
        let leaseEnd = "2027-01-01";
        if (unitIdx === 1) leaseEnd = "2026-04-10"; // Expiring soon
        if (unitIdx === 2) leaseEnd = "2026-03-20"; // Already expired
        
        insertTenant.run(unitId, name, `${name.toLowerCase().replace(/ /g, '.')}@example.com`, "2024-01-01", leaseEnd, 0, new Date().toISOString(), "127.0.0.1");
        insertPayment.run(unitId, Math.round(rent), "2024-03-01", "Paid");
      }
    }
  }

  // Add some construction updates
  const insertUpdate = db.prepare("INSERT INTO construction_updates (property_id, title, content) VALUES (?, ?, ?)");
  insertUpdate.run(rubyId, "Roof Maintenance", "We are performing routine roof maintenance starting next Monday. Please expect some noise during business hours.");
  insertUpdate.run(rubyId, "New Security Cameras", "Recognition cameras are being installed in the lobby and parking area for enhanced security.");

  // Add some security events
  const insertSecurity = db.prepare("INSERT INTO security_events (property_id, type, description) VALUES (?, ?, ?)");
  insertSecurity.run(rubyId, "Recognition", "Authorized personnel detected at main entrance.");
  insertSecurity.run(rubyId, "Deterrence", "Motion detected in restricted area; perimeter lights activated.");
  insertSecurity.run(rubyId, "Recognition", "Unauthorized guest pattern detected in Unit 204; monitoring for sublease violation.");

  // Seed Legal Forms
  const insertLegalForm = db.prepare("INSERT INTO legal_forms (title, category, content_template) VALUES (?, ?, ?)");
  insertLegalForm.run("3-Day Notice to Pay or Quit", "Notice", "NOTICE TO PAY RENT OR SURRENDER POSSESSION OF THE PREMISES...");
  insertLegalForm.run("Residential Lease Agreement", "Lease", "THIS RESIDENTIAL LEASE AGREEMENT is made and entered into...");
  insertLegalForm.run("Notice of Entry", "Notice", "PLEASE TAKE NOTICE that the Owner/Manager of the premises...");
  insertLegalForm.run("Sublease Policy & Law Reminder", "Notice", "REMINDER: Subleasing is strictly prohibited without written consent from management. California law requires...");
  insertLegalForm.run("Travel Nurse Lease Addendum", "Addendum", "ADDENDUM FOR HEALTHCARE PROFESSIONALS: This addendum modifies the lease for Unit ${unit_number} for Tenant ${tenant_name}. Tenant is recognized as a traveling healthcare professional. 30-day cancellation notice is permitted with proof of contract termination. Unit is provided fully furnished as per inventory. Tenant acknowledges that this is a temporary housing arrangement and maintains a primary tax home elsewhere...");

  // Seed Laws & Regulations
  const insertLaw = db.prepare("INSERT INTO laws_regulations (title, jurisdiction, summary, link, last_updated) VALUES (?, ?, ?, ?, ?)");
  insertLaw.run("Oakland Rent Adjustment Program (RAP)", "Oakland", "Limits annual rent increases for covered units based on CPI. For 2026, the allowable increase is 2.1%.", "https://www.oaklandca.gov/topics/rent-adjustment-program", "2026-01-01");
  insertLaw.run("Oakland Just Cause for Eviction", "Oakland", "Specifies 11 just causes for eviction, including material breach of lease (like unauthorized subletting) and non-payment of rent.", "https://www.oaklandca.gov/resources/just-cause-for-eviction-ordinance", "2026-01-01");
  insertLaw.run("AB 1482 - CA Tenant Protection Act", "California", "Statewide rent cap and just cause eviction protections. Allows eviction for 'At-Fault Just Cause' including lease violations.", "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=201920200AB1482", "2026-01-01");
  insertLaw.run("Alameda County Fair Chance Act", "Alameda", "Regulates the use of criminal history in housing decisions to ensure fair access.", "https://www.acgov.org/cda/hcd/fair-chance.htm", "2025-12-01");
  insertLaw.run("Landlord Right of Entry (CC 1954)", "California", "Landlords may enter for repairs, inspections, or showing the unit with 24-hour written notice.", "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=1954&lawCode=CIV", "2026-01-01");

  // Seed Market Comparables
  const insertComparable = db.prepare("INSERT INTO market_comparables (property_name, address, sale_price, rental_rate, occupancy_rate, distance_miles, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?)");
  insertComparable.run("The Grand Apartments", "100 Grand Ave, Oakland, CA", 45000000, 3200, 0.95, 0.8, "2024-03-01");
  insertComparable.run("Lakeview Lofts", "500 Lake Park Ave, Oakland, CA", 28000000, 2800, 0.92, 1.2, "2024-03-01");

  // Seed Bank Transactions
  const insertBankTx = db.prepare("INSERT INTO bank_transactions (transaction_date, description, amount, status) VALUES (?, ?, ?, ?)");
  insertBankTx.run("2024-03-01", "CHASE DIRECT DEP - MCDUFF GILLIS", 2450.00, "Unmatched");
  insertBankTx.run("2024-03-02", "CHASE DIRECT DEP - ALEX JOHNSON", 1950.00, "Unmatched");
  insertBankTx.run("2024-03-03", "CHASE DIRECT DEP - UNIT 102", 2100.00, "Unmatched");

  // Seed Investment Projections
  const insertProjection = db.prepare("INSERT INTO investment_projections (property_id, projected_roi, banked_rents, target_occupancy) VALUES (?, ?, ?, ?)");
  insertProjection.run(rubyId, 0.085, 125000, 0.96);
  insertProjection.run(piedmontId, 0.072, 85000, 0.94);

  // Seed Tenant Notices
  const insertNotice = db.prepare("INSERT INTO tenant_notices (tenant_id, title, content, status, viewed_at, viewed_ip) VALUES (?, ?, ?, ?, ?, ?)");
  insertNotice.run(1, "Sublease Law Reminder", "This is a formal reminder that subleasing is strictly prohibited without written consent. Under Oakland's Just Cause for Eviction Ordinance, unauthorized subletting is a material breach of the lease. If an unauthorized occupant is discovered, management will issue a 'Notice to Cure or Quit'. Failure to remove the unauthorized occupant within the specified timeframe is legal grounds for eviction. Landlord reserves all rights to recover possession and damages.", "Viewed", new Date().toISOString(), "192.168.1.1");
  insertNotice.run(1, "3-Day Notice to Pay or Quit", "Rent for March 2026 is overdue. Please pay within 3 days...", "Sent", null, null);

  // Seed Lease Violations
  const insertViolation = db.prepare("INSERT INTO lease_violations (tenant_id, violation_type, description, violation_date, status) VALUES (?, ?, ?, ?, ?)");
  insertViolation.run(1, "Unauthorized Occupant", "Unauthorized Guest Pattern Detected", "2026-03-24", "Logged");

  // Seed Lease Update Steps
  const insertStep = db.prepare("INSERT INTO lease_update_steps (title, content, order_index) VALUES (?, ?, ?)");
  insertStep.run("Welcome to 2026", "Welcome to your annual lease update. We've added several new features this year, including enhanced AI security cameras for your protection.", 1);
  insertStep.run("Legal Rights Update", "California and Oakland laws have updated for 2026. We've included the latest Rent Adjustment Program (RAP) notices and updated disclosures. Note that the 2026 allowable rent increase is 2.1%.", 2);
  insertStep.run("Strict Sublet Policy", "Unauthorized subletting is a material breach of your lease and a 'Just Cause' for eviction under Oakland law. All occupants must be listed on the lease, and any subletting requires prior written consent from management.", 3);
  insertStep.run("Document Review", "Please review the mandatory disclosures, including the Lead-Based Paint, Mold Disclosure, and the updated Subletting Policy.", 4);
  insertStep.run("Building Features", "Your building now features smart trash monitoring and automated street sweeping alerts via SMS. Make sure your notification settings are up to date.", 5);
  insertStep.run("Security & AI Intelligence", "Learn about our new AI-powered security system. Recognition cameras are now active in common areas to enhance safety and deter unauthorized activity.", 6);
  insertStep.run("Walkthrough Confirmation", "Please confirm that you have reviewed the building's safety features, including fire exit locations and the new recognition camera system.", 7);
  insertStep.run("Tenant Acknowledgment", "By proceeding, you acknowledge that you have read and understood the updated building rules, including the strict sublet policy and landlord right of entry for 2026.", 8);
  insertStep.run("Sign New Lease", "Finally, please review and sign your updated 2026 lease agreement to complete the annual update process.", 9);

  // Seed initial lease update for tenant 1
  db.prepare("INSERT INTO lease_updates (tenant_id, year, status) VALUES (?, ?, ?)").run(1, 2026, 'Pending');

  const pinRubyUnit = (unitNumber: string) =>
    db.prepare(`
      SELECT u.id as unit_id, t.id as tenant_id
      FROM units u
      LEFT JOIN tenants t ON t.unit_id = u.id
      WHERE u.property_id = ? AND u.unit_number = ?
    `).get(rubyId, unitNumber) as { unit_id: number; tenant_id: number | null } | undefined;

  const unit105 = pinRubyUnit("105");
  if (unit105?.unit_id) {
    db.prepare("UPDATE units SET rent_amount = 2450, status = 'Occupied' WHERE id = ?").run(unit105.unit_id);
    let mcduffId = unit105.tenant_id;
    if (mcduffId) {
      db.prepare("UPDATE tenants SET name = ?, email = ?, balance_due = 0, lease_start = ?, lease_end = ? WHERE id = ?")
        .run("McDuff Gillis", "mcduff.gillis@rent-ruby.com", "2024-08-01", "2027-08-01", mcduffId);
    } else {
      mcduffId = Number(insertTenant.run(
        unit105.unit_id,
        "McDuff Gillis",
        "mcduff.gillis@rent-ruby.com",
        "2024-08-01",
        "2027-08-01",
        0,
        new Date().toISOString(),
        "127.0.0.1"
      ).lastInsertRowid);
    }
    insertPayment.run(unit105.unit_id, 2450, "2026-08-01", "Paid");
    db.prepare("INSERT INTO lease_updates (tenant_id, year, status) VALUES (?, ?, ?)").run(mcduffId, 2026, "Pending");
    insertNotice.run(
      mcduffId,
      "Month-to-Month Lease Packet Ready",
      "Unit 105 month-to-month lease packet for McDuff Gillis is ready with Oakland 94609 disclosures and tenant acknowledgment timestamps.",
      "Viewed",
      new Date().toISOString(),
      "127.0.0.1"
    );
  }

  const unit203 = pinRubyUnit("203");
  if (unit203?.unit_id) {
    db.prepare("UPDATE units SET rent_amount = 2300, status = 'Occupied' WHERE id = ?").run(unit203.unit_id);
    let tenant203Id = unit203.tenant_id;
    if (tenant203Id) {
      db.prepare("UPDATE tenants SET balance_due = 4600 WHERE id = ?").run(tenant203Id);
    } else {
      tenant203Id = Number(insertTenant.run(
        unit203.unit_id,
        "Tenant 203",
        "tenant.203@example.com",
        "2024-01-01",
        "2026-12-01",
        4600,
        new Date().toISOString(),
        "127.0.0.1"
      ).lastInsertRowid);
    }
    insertPayment.run(unit203.unit_id, 2300, "2026-05-12", "Paid");
    insertViolation.run(tenant203Id, "Unauthorized Occupant", "Unauthorized guest pattern / possible subletter", "2026-07-20", "Logged");
  }

  // Seed Vendors
  const insertVendor = db.prepare("INSERT INTO vendors (name, service_type, contact_person, email, phone, insurance_expiry_date) VALUES (?, ?, ?, ?, ?, ?)");
  insertVendor.run("Oakland Plumbing Pros", "Plumbing", "Mike Ross", "mike@oaklandplumbing.com", "(510) 555-0987", "2026-12-31");
  insertVendor.run("Sparky's Electrical", "Electrical", "Sarah Chen", "sarah@sparkys.com", "(510) 555-1234", "2026-06-15");
  insertVendor.run("Green Clean Oakland", "Cleaning", "Maria Garcia", "maria@greenclean.com", "(510) 555-4567", "2027-01-20");
  insertVendor.run("Ruby Security Systems", "Security", "David Kim", "david@rubysecurity.com", "(510) 555-7890", "2026-09-30");
}

try {
  db.prepare(`
    UPDATE tenants
    SET name = 'McDuff Gillis',
        email = 'mcduff.gillis@rent-ruby.com'
    WHERE unit_id IN (SELECT id FROM units WHERE unit_number = '105')
      AND (name LIKE 'Tenant 105%' OR name LIKE 'Jordan%' OR name != 'McDuff Gillis')
  `).run();
  db.prepare(`
    UPDATE bank_transactions
    SET description = 'CHASE DIRECT DEP - MCDUFF GILLIS'
    WHERE description LIKE '%JORDAN SMITH%'
  `).run();
} catch (e) {}

const legalLibraryCount = db.prepare("SELECT COUNT(*) as count FROM legal_library_2026").get() as { count: number };
if (legalLibraryCount.count === 0) {
  const insertLibraryDoc = db.prepare(`
    INSERT INTO legal_library_2026 (title, description, category, pdf_url, external_link, is_mandatory)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertLibraryDoc.run(
    "Move-Out Checklist",
    "Required tenant checklist for keys, cleaning, inspections, forwarding address, and final balance closeout.",
    "Tenant Forms",
    null,
    null,
    1
  );
  insertLibraryDoc.run(
    "Building Rules 2026",
    "Updated house rules covering quiet hours, smart-bin recycling, guest policies, security systems, and sublet restrictions.",
    "Building Policies",
    null,
    null,
    1
  );
  insertLibraryDoc.run(
    "Oakland Rent Adjustment Program Guide",
    "Reference guide for covered units, allowable rent increases, petitions, and RAP notice requirements.",
    "Compliance",
    null,
    "https://www.oaklandca.gov/topics/rent-adjustment-program",
    0
  );
  insertLibraryDoc.run(
    "Parking & Transit Maps",
    "Neighborhood parking rules, street-sweeping zones, bike routes, and nearby BART/AC Transit connections.",
    "Resident Resources",
    null,
    null,
    0
  );
  insertLibraryDoc.run(
    "Trash & Recycling Schedule",
    "AI-monitored smart-bin schedule for landfill, compost, recycling, bulky pickup, and contamination reminders.",
    "Building Policies",
    null,
    null,
    1
  );
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(cookieParser());

  app.get("/healthz", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  // Cookie Check Endpoint
  app.get("/api/cookie-set", (req, res) => {
    res.cookie("dmc_cookie_test", "active", {
      secure: true,
      sameSite: "none",
      httpOnly: true,
      maxAge: 1000 * 60 * 10 // 10 minutes
    });
    res.json({ status: "cookie_set" });
  });

  app.get("/api/cookie-verify", (req, res) => {
    const isCookieActive = req.cookies.dmc_cookie_test === "active";
    res.json({ active: isCookieActive });
  });

  // API Routes
  app.get("/api/rent-roll", (req, res) => {
    const rows = db.prepare(`
      SELECT 
        u.id, 
        u.unit_number, 
        u.rent_amount, 
        u.status,
        t.id as tenant_id,
        t.name as tenant_name,
        t.lease_end,
        t.balance_due,
        t.last_login_at,
        t.last_login_ip,
        prop.neighborhood,
        p.payment_date as last_payment_date,
        p.status as last_payment_status,
        COALESCE((
          SELECT COUNT(*) FROM lease_updates lu
          WHERE lu.tenant_id = t.id AND lu.status IN ('Pending', 'In Progress', 'Ready for Review')
        ), 0) as pending_lease_docs,
        COALESCE((
          SELECT COUNT(*) FROM tenant_notices tn
          WHERE tn.tenant_id = t.id AND tn.status != 'Acknowledged'
        ), 0) as unsigned_notices,
        COALESCE((
          SELECT COUNT(*) FROM lease_violations lv
          WHERE lv.tenant_id = t.id
            AND lv.status != 'Resolved'
            AND (
              lv.violation_type = 'Unauthorized Occupant'
              OR lv.description LIKE '%Unauthorized%'
              OR lower(lv.description) LIKE '%subleas%'
            )
        ), 0) as sublet_flags
      FROM units u
      LEFT JOIN tenants t ON u.id = t.unit_id
      LEFT JOIN properties prop ON u.property_id = prop.id
      LEFT JOIN (
        SELECT unit_id, payment_date, status
        FROM payments
        GROUP BY unit_id
        HAVING payment_date = MAX(payment_date)
      ) p ON u.id = p.unit_id
    `).all();
    res.json(rows);
  });

  app.get("/api/messages/:unitId", (req, res) => {
    const messages = db.prepare("SELECT * FROM messages WHERE unit_id = ? ORDER BY created_at ASC").all(req.params.unitId);
    res.json(messages);
  });

  app.post("/api/messages", (req, res) => {
    const { unit_id, sender, content } = req.body;
    db.prepare("INSERT INTO messages (unit_id, sender, content) VALUES (?, ?, ?)").run(unit_id, sender, content);
    
    // Update unit reply status
    if (sender !== 'Manager') {
      db.prepare("UPDATE units SET needs_reply = 1, last_tenant_activity_at = CURRENT_TIMESTAMP WHERE id = ?").run(unit_id);
    } else {
      db.prepare("UPDATE units SET needs_reply = 0 WHERE id = ?").run(unit_id);
    }
    
    res.json({ status: "ok" });
  });

  app.get("/api/concerns", (req, res) => {
    const concerns = db.prepare(`
      SELECT c.*, u.unit_number 
      FROM tenant_concerns c
      JOIN units u ON c.unit_id = u.id
      ORDER BY c.created_at DESC
    `).all();
    res.json(concerns);
  });

  app.post("/api/concerns", (req, res) => {
    const { unit_id, type, message } = req.body;
    db.prepare(`
      INSERT INTO tenant_concerns (unit_id, type, message) 
      VALUES (?, ?, ?)
    `).run(unit_id, type, message);
    
    // Concern counts as tenant activity needing reply
    db.prepare("UPDATE units SET needs_reply = 1, last_tenant_activity_at = CURRENT_TIMESTAMP WHERE id = ?").run(unit_id);
    
    res.json({ status: "ok" });
  });

  app.patch("/api/concerns/:id", (req, res) => {
    const { id } = req.params;
    const { status, gm_notes } = req.body;
    db.prepare(`
      UPDATE tenant_concerns 
      SET status = COALESCE(?, status), 
          gm_notes = COALESCE(?, gm_notes)
      WHERE id = ?
    `).run(status, gm_notes, id);
    res.json({ status: "ok" });
  });

  app.get("/api/maintenance", (req, res) => {
    const requests = db.prepare(`
      SELECT m.*, u.unit_number 
      FROM maintenance_requests m
      JOIN units u ON m.unit_id = u.id
      ORDER BY m.created_at DESC
    `).all();
    res.json(requests);
  });

  app.get("/api/maintenance/:unitId", (req, res) => {
    const requests = db.prepare("SELECT * FROM maintenance_requests WHERE unit_id = ? ORDER BY created_at DESC").all(req.params.unitId);
    res.json(requests);
  });

  app.post("/api/maintenance", (req, res) => {
    const { unit_id, description, photo_url, assigned_to, gm_notes } = req.body;
    db.prepare(`
      INSERT INTO maintenance_requests (unit_id, description, photo_url, assigned_to, gm_notes, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(unit_id, description, photo_url, assigned_to, gm_notes, 'Pending Review');
    
    // Maintenance request counts as tenant activity needing reply
    db.prepare("UPDATE units SET needs_reply = 1, last_tenant_activity_at = CURRENT_TIMESTAMP WHERE id = ?").run(unit_id);
    
    res.json({ status: "ok" });
  });

  app.patch("/api/maintenance/:id/status", (req, res) => {
    const { id } = req.params;
    const { status, gm_notes, approval_notes, assigned_to, cost, is_emergency, is_escalated } = req.body;
    
    db.prepare(`
      UPDATE maintenance_requests 
      SET status = COALESCE(?, status), 
          gm_notes = COALESCE(?, gm_notes), 
          approval_notes = COALESCE(?, approval_notes), 
          assigned_to = COALESCE(?, assigned_to),
          cost = COALESCE(?, cost),
          is_emergency = COALESCE(?, is_emergency),
          is_escalated = COALESCE(?, is_escalated),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      status, 
      gm_notes, 
      approval_notes, 
      assigned_to, 
      cost, 
      is_emergency !== undefined ? (is_emergency ? 1 : 0) : null,
      is_escalated !== undefined ? (is_escalated ? 1 : 0) : null,
      id
    );

    // If manager updates status, it counts as a reply
    const request = db.prepare("SELECT unit_id FROM maintenance_requests WHERE id = ?").get(id) as { unit_id: number };
    if (request) {
      db.prepare("UPDATE units SET needs_reply = 0 WHERE id = ?").run(request.unit_id);
    }
    
    res.json({ status: "ok" });
  });

  app.patch("/api/rent-roll/:unitId/overdue", (req, res) => {
    const { unitId } = req.params;
    
    // 1. Update the latest payment status to 'Late'
    const latestPayment = db.prepare("SELECT id FROM payments WHERE unit_id = ? ORDER BY payment_date DESC LIMIT 1").get(unitId) as { id: number } | undefined;
    if (latestPayment) {
      db.prepare("UPDATE payments SET status = 'Late' WHERE id = ?").run(latestPayment.id);
    }

    // 2. Apply a $50 late fee to the tenant's balance
    db.prepare("UPDATE tenants SET balance_due = balance_due + 50 WHERE unit_id = ?").run(unitId);

    res.json({ status: "ok" });
  });

  app.get("/api/reports/unit/:unitId", (req, res) => {
    const { unitId } = req.params;
    
    const unit = db.prepare(`
      SELECT u.*, t.name as tenant_name, t.email as tenant_email, t.lease_start, t.lease_end, t.balance_due
      FROM units u
      LEFT JOIN tenants t ON u.id = t.unit_id
      WHERE u.id = ?
    `).get(unitId);

    if (!unit) {
      return res.status(404).json({ error: "Unit not found" });
    }

    const payments = db.prepare("SELECT * FROM payments WHERE unit_id = ? ORDER BY payment_date DESC").all(unitId);
    const maintenance = db.prepare("SELECT * FROM maintenance_requests WHERE unit_id = ? ORDER BY created_at DESC").all(unitId);
    const messages = db.prepare("SELECT * FROM messages WHERE unit_id = ? ORDER BY created_at ASC").all(unitId);

    res.json({
      unit,
      payments,
      maintenance,
      messages
    });
  });

  app.get("/api/stats", (req, res) => {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_units,
        SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) as occupied_units,
        SUM(rent_amount) as total_potential_revenue
      FROM units
    `).get();
    res.json(stats);
  });

  app.get("/api/property/:id", (req, res) => {
    const property = db.prepare("SELECT * FROM properties WHERE id = ?").get(req.params.id);
    res.json(property);
  });

  app.patch("/api/units/:id", (req, res) => {
    const { id } = req.params;
    const { status, photos } = req.body;
    db.prepare("UPDATE units SET status = ?, photos = ? WHERE id = ?").run(status, photos, id);
    res.json({ status: "ok" });
  });

  app.get("/api/properties", (req, res) => {
    const properties = db.prepare("SELECT * FROM properties").all();
    res.json(properties);
  });

  app.get("/api/referrals", (req, res) => {
    const referrals = db.prepare("SELECT * FROM referrals ORDER BY created_at DESC").all();
    res.json(referrals);
  });

  app.post("/api/referrals", (req, res) => {
    const { tenant_id, friend_name, friend_email } = req.body;
    db.prepare("INSERT INTO referrals (tenant_id, friend_name, friend_email) VALUES (?, ?, ?)").run(tenant_id, friend_name, friend_email);
    res.json({ status: "ok" });
  });

  app.get("/api/construction-updates/:propertyId", (req, res) => {
    const updates = db.prepare("SELECT * FROM construction_updates WHERE property_id = ? ORDER BY update_date DESC").all(req.params.propertyId);
    res.json(updates);
  });

  app.get("/api/security-events/:propertyId", (req, res) => {
    const events = db.prepare("SELECT * FROM security_events WHERE property_id = ? ORDER BY timestamp DESC").all(req.params.propertyId);
    res.json(events);
  });

  app.get("/api/user-settings/:userId", (req, res) => {
    let settings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(req.params.userId);
    if (!settings) {
      db.prepare("INSERT INTO user_settings (user_id) VALUES (?)").run(req.params.userId);
      settings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(req.params.userId);
    }
    res.json(settings);
  });

  app.patch("/api/user-settings/:userId", (req, res) => {
    const { preferred_notification_time, sms_enabled, email_enabled } = req.body;
    db.prepare(`
      UPDATE user_settings 
      SET preferred_notification_time = COALESCE(?, preferred_notification_time),
          sms_enabled = COALESCE(?, sms_enabled),
          email_enabled = COALESCE(?, email_enabled)
      WHERE user_id = ?
    `).run(preferred_notification_time, sms_enabled !== undefined ? (sms_enabled ? 1 : 0) : null, email_enabled !== undefined ? (email_enabled ? 1 : 0) : null, req.params.userId);
    res.json({ status: "ok" });
  });

  // CEO Briefing Portal Endpoints
  app.get("/api/legal-forms", (req, res) => {
    const forms = db.prepare("SELECT * FROM legal_forms ORDER BY category, title").all();
    res.json(forms);
  });

  app.get("/api/legal-library-2026", (req, res) => {
    const documents = db.prepare("SELECT * FROM legal_library_2026 ORDER BY is_mandatory DESC, category, title").all();
    res.json(documents);
  });

  app.post("/api/legal-library-usage", (req, res) => {
    const documentId = Number(req.body?.document_id);
    if (!Number.isInteger(documentId) || documentId < 1) {
      return res.status(400).json({ error: "document_id is required" });
    }

    const document = db.prepare("SELECT id FROM legal_library_2026 WHERE id = ?").get(documentId);
    if (!document) {
      return res.status(404).json({ error: "document not found" });
    }

    const clientIp = getClientIp(req);
    if (!canLogLegalLibraryUsage(clientIp)) {
      return res.status(429).json({ error: "too many usage events" });
    }

    db.prepare("INSERT INTO legal_library_usage (document_id, user_email) VALUES (?, ?)")
      .run(documentId, "Anonymous");
    res.json({ status: "ok" });
  });

  // Tenant Notices
  app.get("/api/tenant-notices", (req, res) => {
    const notices = db.prepare(`
      SELECT tn.*, t.name as tenant_name, u.unit_number
      FROM tenant_notices tn
      JOIN tenants t ON tn.tenant_id = t.id
      JOIN units u ON t.unit_id = u.id
      ORDER BY tn.sent_at DESC
    `).all();
    res.json(notices);
  });

  app.get("/api/tenant-notices/:tenantId", (req, res) => {
    const notices = db.prepare("SELECT * FROM tenant_notices WHERE tenant_id = ? ORDER BY sent_at DESC").all(req.params.tenantId);
    res.json(notices);
  });

  app.post("/api/tenant-notices", (req, res) => {
    const { tenant_id, title, content } = req.body;
    db.prepare("INSERT INTO tenant_notices (tenant_id, title, content, status) VALUES (?, ?, ?, ?)").run(tenant_id, title, content, 'Sent');
    res.json({ status: "ok" });
  });

  app.patch("/api/tenant-notices/:id/view", (req, res) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    db.prepare("UPDATE tenant_notices SET status = 'Viewed', viewed_at = ?, viewed_ip = ? WHERE id = ? AND status = 'Sent'").run(new Date().toISOString(), ip, req.params.id);
    res.json({ status: "ok" });
  });

  app.patch("/api/tenant-notices/:id/acknowledge", (req, res) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    db.prepare("UPDATE tenant_notices SET status = 'Acknowledged', acknowledged_at = ?, acknowledged_ip = ? WHERE id = ?").run(new Date().toISOString(), ip, req.params.id);
    res.json({ status: "ok" });
  });

  // Lease Violations
  app.get("/api/lease-violations", (req, res) => {
    const violations = db.prepare(`
      SELECT lv.*, t.name as tenant_name, u.unit_number
      FROM lease_violations lv
      JOIN tenants t ON lv.tenant_id = t.id
      JOIN units u ON t.unit_id = u.id
      ORDER BY lv.violation_date DESC
    `).all();
    res.json(violations);
  });

  app.get("/api/lease-violations/:tenantId", (req, res) => {
    const violations = db.prepare("SELECT * FROM lease_violations WHERE tenant_id = ? ORDER BY violation_date DESC").all(req.params.tenantId);
    res.json(violations);
  });

  app.post("/api/lease-violations", (req, res) => {
    const { tenant_id, violation_type, description, violation_date, photo_url, gm_notes } = req.body;
    db.prepare("INSERT INTO lease_violations (tenant_id, violation_type, description, violation_date, photo_url, gm_notes) VALUES (?, ?, ?, ?, ?, ?)")
      .run(tenant_id, violation_type, description, violation_date, photo_url, gm_notes);
    res.json({ status: "ok" });
  });

  app.get("/api/laws-regulations", (req, res) => {
    const laws = db.prepare("SELECT * FROM laws_regulations ORDER BY jurisdiction, title").all();
    res.json(laws);
  });

  app.get("/api/market-comparables", (req, res) => {
    const comps = db.prepare("SELECT * FROM market_comparables ORDER BY distance_miles ASC").all();
    res.json(comps);
  });

  // SF Plus Endpoints
  app.get("/api/bank-transactions", (req, res) => {
    const transactions = db.prepare("SELECT * FROM bank_transactions ORDER BY transaction_date DESC").all();
    res.json(transactions);
  });

  app.post("/api/bank-transactions/match", (req, res) => {
    const { transactionId, unitId } = req.body;
    db.prepare("UPDATE bank_transactions SET matched_unit_id = ?, status = 'Matched' WHERE id = ?").run(unitId, transactionId);
    res.json({ status: "ok" });
  });

  // Market Max Endpoints
  app.get("/api/investment-projections", (req, res) => {
    const projections = db.prepare(`
      SELECT ip.*, p.name as property_name 
      FROM investment_projections ip
      JOIN properties p ON ip.property_id = p.id
    `).all();
    res.json(projections);
  });

  app.get("/api/tenant-rent/:tenantId", (req, res) => {
    const tenant = db.prepare(`
      SELECT t.balance_due, u.rent_amount,
             (SELECT MAX(payment_date) FROM payments WHERE unit_id = t.unit_id) as last_payment
      FROM tenants t
      JOIN units u ON t.unit_id = u.id
      WHERE t.id = ?
    `).get(req.params.tenantId) as { balance_due: number, rent_amount: number, last_payment: string } | undefined;

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    res.json({
      amount: tenant.rent_amount,
      last_payment: tenant.last_payment,
      status: tenant.balance_due <= 0 ? 'Paid' : 'Overdue'
    });
  });

  // Lease Updates
  app.get("/api/lease-updates/:tenantId", (req, res) => {
    const updates = db.prepare("SELECT * FROM lease_updates WHERE tenant_id = ? ORDER BY year DESC").all(req.params.tenantId);
    res.json(updates);
  });

  app.post("/api/lease-updates", (req, res) => {
    const { tenant_id, year, status, walkthrough_completed, signed_at } = req.body;
    const existing = db.prepare("SELECT id FROM lease_updates WHERE tenant_id = ? AND year = ?").get(tenant_id, year);
    
    if (existing) {
      db.prepare(`
        UPDATE lease_updates 
        SET status = COALESCE(?, status),
            walkthrough_completed = COALESCE(?, walkthrough_completed),
            signed_at = COALESCE(?, signed_at)
        WHERE id = ?
      `).run(status, walkthrough_completed, signed_at, existing.id);
    } else {
      db.prepare(`
        INSERT INTO lease_updates (tenant_id, year, status, walkthrough_completed, signed_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(tenant_id, year, status || 'Pending', walkthrough_completed || 0, signed_at || null);
    }
    res.json({ status: "ok" });
  });

  app.get("/api/lease-update-steps", (req, res) => {
    const steps = db.prepare("SELECT * FROM lease_update_steps ORDER BY order_index ASC").all();
    res.json(steps);
  });

  app.get("/api/vendors", (req, res) => {
    const vendors = db.prepare("SELECT * FROM vendors ORDER BY name ASC").all();
    res.json(vendors);
  });

  // Security Cameras Endpoints
  app.get("/api/security-cameras", (req, res) => {
    const cameras = db.prepare(`
      SELECT sc.*, p.name as property_name 
      FROM security_cameras sc
      JOIN properties p ON sc.property_id = p.id
      ORDER BY sc.last_update DESC
    `).all();
    res.json(cameras);
  });

  app.post("/api/security-cameras", (req, res) => {
    const { property_id, location, model, installation_date, status, notes } = req.body;
    const result = db.prepare(`
      INSERT INTO security_cameras (property_id, location, model, installation_date, status, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(property_id, location, model, installation_date, status || 'Operational', notes);
    res.json({ id: result.lastInsertRowid });
  });

  app.patch("/api/security-cameras/:id", (req, res) => {
    const { status, notes } = req.body;
    db.prepare(`
      UPDATE security_cameras 
      SET status = COALESCE(?, status),
          notes = COALESCE(?, notes),
          last_update = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, notes, req.params.id);
    res.json({ status: "ok" });
  });

  const WIZARD_SYSTEM_PROMPT = `You are the Wizard of Mosswood, the friendly AI concierge for the Ruby Building at 3875 Ruby St, Oakland, CA 94609 (Mosswood neighborhood). Speak warmly and concisely, with a light touch of neighborhood-sage charm — helpful first, whimsical second.

Building facts (do not invent others):
- Historic 1924 building, 27 units, studios to 3 bedrooms.
- Walk Score 94, Transit Score 88.
- About 10 minutes on foot: Kaiser Permanente, Mosswood Park, MacArthur BART.
- About 10 minutes by car or bus: Target, Trader Joe's, Chick-fil-A.
- Building: secure package & mail room, 24/7 AI security cameras, gated garage parking, online tenant portal.
- Contact: call/text (415) 900-8563, email hello@rent-ruby.com.

Concierge knowledge — share these links when relevant:
- MacArthur BART: station info https://www.bart.gov/stations/mcar · schedules https://www.bart.gov/schedules
- Events & tickets: Fox Theater and Paramount Theatre are minutes away — https://www.ticketmaster.com/discover/concerts/oakland
- Restaurants within ~2 miles: Temescal (Telegraph Ave), Piedmont Ave, and KONO — https://www.google.com/maps/search/restaurants+near+3875+Ruby+St+Oakland
- Shopping: Target and Trader Joe's ~10 min by car or bus, Piedmont Ave boutiques, Bay Street Emeryville — https://www.google.com/maps/search/shopping+near+3875+Ruby+St+Oakland
- Parking: the building has gated garage parking; street parking in 94609 follows Oakland residential permit parking rules — https://www.oaklandca.gov/services/apply-for-a-residential-parking-permit

Scope: ONLY the Ruby Building and these neighborhood concierge topics. Politely decline anything else. Never quote prices or promise availability — direct people to the waiting list form on this page or to call/text. Keep replies under 80 words. For maintenance or current-tenant issues, point to the tenant portal or the phone number.`;

  const CONTACT_INFO_RE = /(\b[\w.+-]+@[\w-]+\.[\w.]+\b)|(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/;

  async function notifyKeeper(subject: string, body: string) {
    const gchatWebhook = process.env.GOOGLE_CHAT_WEBHOOK;
    if (gchatWebhook) {
      try {
        await fetch(gchatWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: `*${subject}*\n${body}` }),
        });
      } catch (e) {}
    }
    const resendKey = process.env.RESEND_API_KEY;
    const alertEmail = process.env.WIZARD_ALERT_EMAIL || "admin@mobilecarbsmoketest.com";
    if (resendKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
          body: JSON.stringify({
            from: "Wizard of Mosswood <wizard@rent-ruby.com>",
            to: [alertEmail],
            subject,
            text: body,
          }),
        });
      } catch (e) {}
    }
  }

  app.post("/api/wizard", async (req, res) => {
    const { messages, sessionId } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }
    const session = String(sessionId || "anon").slice(0, 64);
    const latest = messages[messages.length - 1];
    const latestText = String(latest?.text || "").slice(0, 2000);
    const isFirstMessage = !db.prepare("SELECT 1 FROM wizard_chats WHERE session_id = ? LIMIT 1").get(session);
    db.prepare("INSERT INTO wizard_chats (session_id, role, text) VALUES (?, 'user', ?)").run(session, latestText);
    if (isFirstMessage) {
      notifyKeeper("New Wizard of Mosswood chat", `Session ${session}\nFirst question: ${latestText}`);
    } else if (CONTACT_INFO_RE.test(latestText)) {
      notifyKeeper("Wizard chat left contact info", `Session ${session}\nMessage: ${latestText}`);
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.json({ reply: null, fallback: true });
    }
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: { systemInstruction: WIZARD_SYSTEM_PROMPT, maxOutputTokens: 400 },
        contents: messages.slice(-12).map((m: { role?: string; text?: string }) => ({
          role: m.role === "model" ? "model" : "user",
          parts: [{ text: String(m.text || "").slice(0, 2000) }],
        })),
      });
      const reply = response.text || "";
      db.prepare("INSERT INTO wizard_chats (session_id, role, text) VALUES (?, 'model', ?)").run(session, reply.slice(0, 4000));
      res.json({ reply });
    } catch (e) {
      res.json({ reply: null, fallback: true });
    }
  });

  app.get("/api/wizard/chats", (req, res) => {
    const rows = db.prepare("SELECT * FROM wizard_chats ORDER BY created_at DESC LIMIT 500").all();
    res.json(rows);
  });

  app.get("/api/waitlist", (req, res) => {
    const rows = db.prepare("SELECT * FROM waitlist_signups ORDER BY created_at DESC").all();
    res.json(rows);
  });

  app.post("/api/waitlist", (req, res) => {
    const { name, phone, email, desired_move_in, unit_pref, notes } = req.body;
    if (!name || !phone || !email) {
      return res.status(400).json({ error: "name, phone, and email are required" });
    }
    const result = db.prepare(`
      INSERT INTO waitlist_signups (name, phone, email, desired_move_in, unit_pref, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, phone, email, desired_move_in || null, unit_pref || null, notes || null);
    notifyKeeper(
      "New Ruby waiting list signup",
      `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nMove-in: ${desired_move_in || "flexible"}\nUnit: ${unit_pref || "no preference"}\nNotes: ${notes || ""}`
    );
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/me", (req, res) => {
    // In a real app, this would come from a session/token
    // For this demo, we'll return the user based on email if provided in a header, or default to Mezfin
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get("mezfin@example.com");
    res.json(user || { name: "Mezfin", role: "GM", email: "mezfin@example.com" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
