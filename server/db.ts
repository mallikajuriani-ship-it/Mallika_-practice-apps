import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  avatarColor: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
  lastLoginAt: number;
}

export interface SessionRecord {
  token: string;
  userId: string;
  expiresAt: number;
  createdAt: number;
}

export interface AnalysisRecord {
  id: string;
  userId: string;
  client: string;
  retailer: string;
  documentName: string;
  analysisDate: string;
  timestamp: number;
  totalChanges: number;
  highImpactCount: number;
  mediumImpactCount: number;
  lowImpactCount: number;
  tags: string[];
  isShared: boolean;
  data: any;
  createdAt: number;
  updatedAt: number;
}

export interface AuditLogRecord {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: number;
}

interface DatabaseSchema {
  version: number;
  users: UserRecord[];
  sessions: SessionRecord[];
  analyses: AnalysisRecord[];
  auditLogs: AuditLogRecord[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'cpg_radar_database.json');

// Ensure DB directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const testHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(testHash, 'hex'));
}

class DatabaseService {
  private db: DatabaseSchema = {
    version: 1,
    users: [],
    sessions: [],
    analyses: [],
    auditLogs: [],
  };

  private isLoaded = false;

  constructor() {
    this.load();
    this.seedDefaultDataIfEmpty();
  }

  private load(): void {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
        this.isLoaded = true;
      } else {
        this.save();
        this.isLoaded = true;
      }
    } catch (err) {
      console.error('Failed to load database file, creating fresh store:', err);
      this.save();
      this.isLoaded = true;
    }
  }

  private save(): void {
    try {
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.db, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  private seedDefaultDataIfEmpty(): void {
    if (this.db.users.length === 0) {
      // Create primary demo user
      const { hash, salt } = hashPassword('cpg2026!');
      const demoUser: UserRecord = {
        id: 'usr-demo-01',
        email: 'commercial.director@brandco.com',
        name: 'Sarah Jenkins',
        role: 'Commercial Strategy Director',
        department: 'Revenue Growth & Sales',
        avatarColor: 'blue-pink',
        passwordHash: hash,
        salt,
        createdAt: Date.now() - 30 * 86400000,
        lastLoginAt: Date.now(),
      };

      const demoUser2: UserRecord = {
        id: 'usr-demo-02',
        email: 'category.lead@brandco.com',
        name: 'Marcus Vance',
        role: 'Senior Category Manager',
        department: 'UK & EU Modern Trade',
        avatarColor: 'pink-blue',
        passwordHash: hash,
        salt,
        createdAt: Date.now() - 15 * 86400000,
        lastLoginAt: Date.now() - 86400000,
      };

      this.db.users.push(demoUser, demoUser2);

      // Add pre-seeded real CPG audit records
      const seedAnalysis1: AnalysisRecord = {
        id: 'audit-tesco-q3',
        userId: demoUser.id,
        client: 'BrandCo Confectionery & Snacking',
        retailer: 'Tesco UK Stores',
        documentName: 'Tesco_Autumn_Range_Review_Final.xlsx',
        analysisDate: new Date(Date.now() - 2 * 86400000).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        timestamp: Date.now() - 2 * 86400000,
        totalChanges: 4,
        highImpactCount: 2,
        mediumImpactCount: 2,
        lowImpactCount: 0,
        tags: ['Range Review', 'Delisting Risk', 'Price Shift'],
        isShared: true,
        data: {
          id: 'audit-tesco-q3',
          timestamp: Date.now() - 2 * 86400000,
          metadata: {
            clientBrand: 'BrandCo Confectionery & Snacking',
            retailer: 'Tesco UK Stores',
            documentName: 'Tesco_Autumn_Range_Review_Final.xlsx',
            previousVersionDate: '2026-05-15',
            newVersionDate: '2026-09-01',
          },
          previousFileName: 'Tesco_Summer_Range_Baseline.csv',
          newFileName: 'Tesco_Autumn_Range_Review_Final.csv',
          executiveSummary: {
            totalChanges: 4,
            highImpactCount: 2,
            mediumImpactCount: 2,
            lowImpactCount: 0,
            narrativeSummary:
              'Critical delisting of flagship Caramel Bar 200g across 450 superstores requires urgent escalation before October planogram freeze. Wholesale price adjustments successfully reflected on 2 SKUs with an estimated +£140k annual gross margin contribution.',
          },
          changes: [
            {
              id: 'c-1',
              change_type: 'removed',
              category: 'Range',
              title: 'Flagship SKU 501234 Caramel Crunch 200g delisted from Extra & Superstores',
              what_changed: 'SKU dropped completely from Tesco range matrix for Autumn 2026.',
              previous_value: 'Listed in 620 stores (Tier 1 core range)',
              new_value: 'Delisted (0 stores)',
              impact: 'high',
              why_it_matters: 'Direct annualized revenue loss of £480,000 and £115k stranded packaging inventory.',
              recommended_action: 'Present sell-in data and counter-proposal to category buyer before next Tuesday.',
              evidence_previous: 'Line 28: 501234, Caramel Crunch 200g, Listed Tier 1',
              evidence_new: 'SKU 501234 absent in range table.',
            },
            {
              id: 'c-2',
              change_type: 'changed',
              category: 'Price',
              title: 'Wholesale Base Cost (CPI) agreed at £1.42 (previous £1.28)',
              what_changed: 'Cost price increase of +10.9% successfully updated in master terms.',
              previous_value: '£1.28 cost per unit',
              new_value: '£1.42 cost per unit',
              impact: 'high',
              why_it_matters: 'Protects gross margins against commodity cocoa inflation.',
              recommended_action: 'Audit initial purchase orders to ensure invoice price matches £1.42.',
              evidence_previous: 'CPI Column: 1.28',
              evidence_new: 'CPI Column: 1.42',
            },
            {
              id: 'c-3',
              change_type: 'changed',
              category: 'Supply Chain',
              title: 'Order lead time increased from 48h to 72h for regional DC distribution',
              what_changed: 'Delivery window extended by 24 hours.',
              previous_value: '48 hours EDI window',
              new_value: '72 hours EDI window',
              impact: 'medium',
              why_it_matters: 'Improves OTIF compliance and lowers emergency freight expediting costs.',
              recommended_action: 'Update SAP transport dispatch scheduling.',
              evidence_previous: 'Lead_Time: 48h',
              evidence_new: 'Lead_Time: 72h',
            },
            {
              id: 'c-4',
              change_type: 'added',
              category: 'Promotion',
              title: 'Inclusion in October £1.50 Clubcard Promotion Feature Space',
              what_changed: 'Added promotional slot for Peanut Crisp 150g.',
              previous_value: 'No promotional slot booked',
              new_value: 'Gondola End Promo Week 41-43',
              impact: 'medium',
              why_it_matters: 'Drives 3.2x baseline unit volume lift during Halloween peak period.',
              recommended_action: 'Build buffer safety stock at Hinckley distribution center.',
              evidence_previous: 'Promo status: None',
              evidence_new: 'Promo status: GE Promo W41-43',
            },
          ],
          actionPlan: [
            {
              id: 'act-1',
              priority: 'high',
              action: 'Escalate delisting of Caramel Crunch 200g to Tesco Commercial Category Lead',
              reason: 'Prevents £480k sales attrition and defends brand market share.',
              related_change: 'SKU 501234 delisted',
              category: 'Range',
              status: 'pending',
            },
            {
              id: 'act-2',
              priority: 'high',
              action: 'Audit EDI Price Master to confirm £1.42 CPI takes effect October 1',
              reason: 'Avoids invoice deduction disputes and EDI purchase order blocks.',
              related_change: 'Wholesale Base Cost £1.42',
              category: 'Price',
              status: 'completed',
            },
            {
              id: 'act-3',
              priority: 'medium',
              action: 'Align Hinckley warehouse logistics with new 72h delivery SLA',
              reason: 'Maintains OTIF service level above 98.5%.',
              related_change: 'Lead time 72h',
              category: 'Supply Chain',
              status: 'in_progress',
            },
          ],
        },
        createdAt: Date.now() - 2 * 86400000,
        updatedAt: Date.now() - 2 * 86400000,
      };

      this.db.analyses.push(seedAnalysis1);
      this.db.auditLogs.push({
        id: 'log-01',
        userId: demoUser.id,
        userEmail: demoUser.email,
        action: 'INITIALIZE_DATABASE',
        details: 'System database provisioned with initial commercial records and authentication store.',
        timestamp: Date.now(),
      });

      this.save();
    }
  }

  // --- AUTHENTICATION & USERS ---
  public registerUser(params: {
    email: string;
    password: string;
    name: string;
    role?: string;
    department?: string;
  }): { user: Omit<UserRecord, 'passwordHash' | 'salt'>; token: string } {
    const existing = this.db.users.find(
      (u) => u.email.toLowerCase() === params.email.toLowerCase().trim()
    );
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const { hash, salt } = hashPassword(params.password);
    const newUser: UserRecord = {
      id: `usr-${crypto.randomUUID()}`,
      email: params.email.toLowerCase().trim(),
      name: params.name.trim() || params.email.split('@')[0],
      role: params.role?.trim() || 'Commercial Manager',
      department: params.department?.trim() || 'Sales & Category Strategy',
      avatarColor: 'blue-pink',
      passwordHash: hash,
      salt,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };

    this.db.users.push(newUser);
    const token = this.createSession(newUser.id);
    this.logAction(newUser.id, newUser.email, 'REGISTER', 'User account created');
    this.save();

    const { passwordHash, salt: _, ...safeUser } = newUser;
    return { user: safeUser, token };
  }

  public login(
    email: string,
    password: string
  ): { user: Omit<UserRecord, 'passwordHash' | 'salt'>; token: string } {
    const user = this.db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    user.lastLoginAt = Date.now();
    const token = this.createSession(user.id);
    this.logAction(user.id, user.email, 'LOGIN', 'User logged in');
    this.save();

    const { passwordHash, salt: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  public demoLogin(roleType: 'director' | 'category' = 'director'): {
    user: Omit<UserRecord, 'passwordHash' | 'salt'>;
    token: string;
  } {
    const targetEmail =
      roleType === 'director'
        ? 'commercial.director@brandco.com'
        : 'category.lead@brandco.com';

    let user = this.db.users.find((u) => u.email === targetEmail);
    if (!user) {
      user = this.db.users[0];
    }
    if (!user) {
      return this.registerUser({
        email: 'commercial.director@brandco.com',
        password: 'demo',
        name: 'Sarah Jenkins',
        role: 'Commercial Strategy Director',
        department: 'Revenue Growth & Sales',
      });
    }

    user.lastLoginAt = Date.now();
    const token = this.createSession(user.id);
    this.logAction(user.id, user.email, 'DEMO_LOGIN', `Logged in via Quick Demo as ${user.role}`);
    this.save();

    const { passwordHash, salt: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  public createSession(userId: string): string {
    const token = `cpg_sess_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = Date.now() + 30 * 86400000; // 30 days
    this.db.sessions.push({
      token,
      userId,
      expiresAt,
      createdAt: Date.now(),
    });
    // Cleanup expired sessions
    this.db.sessions = this.db.sessions.filter((s) => s.expiresAt > Date.now());
    this.save();
    return token;
  }

  public getUserBySession(token?: string): Omit<UserRecord, 'passwordHash' | 'salt'> | null {
    if (!token) return null;
    const session = this.db.sessions.find(
      (s) => s.token === token && s.expiresAt > Date.now()
    );
    if (!session) return null;

    const user = this.db.users.find((u) => u.id === session.userId);
    if (!user) return null;

    const { passwordHash, salt: _, ...safeUser } = user;
    return safeUser;
  }

  public logout(token: string): boolean {
    const initialLen = this.db.sessions.length;
    this.db.sessions = this.db.sessions.filter((s) => s.token !== token);
    this.save();
    return this.db.sessions.length < initialLen;
  }

  public updateProfile(
    userId: string,
    updates: { name?: string; role?: string; department?: string }
  ): Omit<UserRecord, 'passwordHash' | 'salt'> {
    const user = this.db.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found.');

    if (updates.name) user.name = updates.name.trim();
    if (updates.role) user.role = updates.role.trim();
    if (updates.department) user.department = updates.department.trim();

    this.save();
    const { passwordHash, salt: _, ...safeUser } = user;
    return safeUser;
  }

  // --- AUDIT ANALYSES & DATABASE PERSISTENCE ---
  public getAnalyses(userId?: string, query?: string): AnalysisRecord[] {
    let list = this.db.analyses;
    if (userId) {
      // Return user's analyses + shared team analyses
      list = list.filter((a) => a.userId === userId || a.isShared);
    }

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.client.toLowerCase().includes(q) ||
          a.retailer.toLowerCase().includes(q) ||
          a.documentName.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }

  public getAnalysisById(id: string, userId?: string): AnalysisRecord | null {
    const item = this.db.analyses.find((a) => a.id === id);
    if (!item) return null;
    return item;
  }

  public saveAnalysis(userId: string, analysisData: any): AnalysisRecord {
    const id = analysisData.id || `audit-${Date.now()}`;
    const client = analysisData.metadata?.clientBrand || 'Unspecified Brand';
    const retailer = analysisData.metadata?.retailer || 'Unspecified Retailer';
    const documentName =
      analysisData.metadata?.documentName ||
      analysisData.newFileName ||
      'Document Comparison';

    const existingIndex = this.db.analyses.findIndex((a) => a.id === id);

    const record: AnalysisRecord = {
      id,
      userId,
      client,
      retailer,
      documentName,
      analysisDate: new Date(analysisData.timestamp || Date.now()).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      timestamp: analysisData.timestamp || Date.now(),
      totalChanges: analysisData.executiveSummary?.totalChanges || 0,
      highImpactCount: analysisData.executiveSummary?.highImpactCount || 0,
      mediumImpactCount: analysisData.executiveSummary?.mediumImpactCount || 0,
      lowImpactCount: analysisData.executiveSummary?.lowImpactCount || 0,
      tags: [retailer, client].filter(Boolean),
      isShared: true,
      data: analysisData,
      createdAt: existingIndex >= 0 ? this.db.analyses[existingIndex].createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    if (existingIndex >= 0) {
      this.db.analyses[existingIndex] = record;
    } else {
      this.db.analyses.unshift(record);
    }

    this.logAction(userId, '', 'SAVE_ANALYSIS', `Saved analysis ${id} for ${client} / ${retailer}`);
    this.save();
    return record;
  }

  public deleteAnalysis(id: string, userId: string): boolean {
    const prevCount = this.db.analyses.length;
    this.db.analyses = this.db.analyses.filter((a) => a.id !== id);
    if (this.db.analyses.length < prevCount) {
      this.logAction(userId, '', 'DELETE_ANALYSIS', `Deleted analysis ${id}`);
      this.save();
      return true;
    }
    return false;
  }

  public updateActionItemStatus(
    analysisId: string,
    actionId: string,
    status: 'pending' | 'in_progress' | 'completed',
    userId: string
  ): boolean {
    const analysis = this.db.analyses.find((a) => a.id === analysisId);
    if (!analysis || !analysis.data?.actionPlan) return false;

    const action = analysis.data.actionPlan.find((act: any) => act.id === actionId);
    if (action) {
      action.status = status;
      analysis.updatedAt = Date.now();
      this.logAction(userId, '', 'UPDATE_ACTION_ITEM', `Updated action ${actionId} to ${status}`);
      this.save();
      return true;
    }
    return false;
  }

  public getDatabaseStats(userId?: string): {
    totalAnalyses: number;
    totalChangesTracked: number;
    highImpactTracked: number;
    pendingActions: number;
    completedActions: number;
    totalUsers: number;
    dbVersion: number;
    lastUpdated: number;
  } {
    let analyses = this.db.analyses;
    if (userId) {
      analyses = analyses.filter((a) => a.userId === userId || a.isShared);
    }

    let totalChanges = 0;
    let highImpact = 0;
    let pendingActions = 0;
    let completedActions = 0;

    for (const a of analyses) {
      totalChanges += a.totalChanges || 0;
      highImpact += a.highImpactCount || 0;
      const actions = a.data?.actionPlan || [];
      for (const act of actions) {
        if (act.status === 'completed') completedActions++;
        else pendingActions++;
      }
    }

    return {
      totalAnalyses: analyses.length,
      totalChangesTracked: totalChanges,
      highImpactTracked: highImpact,
      pendingActions,
      completedActions,
      totalUsers: this.db.users.length,
      dbVersion: this.db.version,
      lastUpdated: Date.now(),
    };
  }

  private logAction(
    userId: string,
    userEmail: string,
    action: string,
    details: string
  ): void {
    this.db.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userEmail,
      action,
      details,
      timestamp: Date.now(),
    });
    // Keep last 100 logs
    if (this.db.auditLogs.length > 100) {
      this.db.auditLogs = this.db.auditLogs.slice(0, 100);
    }
  }
}

export const db = new DatabaseService();
