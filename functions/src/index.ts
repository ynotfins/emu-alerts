import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';
import type { Request, Response } from 'express';
import * as logger from 'firebase-functions/logger';

// v1 ONLY for the auth trigger (Gen1-friendly)
import * as functionsV1 from 'firebase-functions/v1';
import type { UserRecord } from 'firebase-functions/v1/auth';

// Initialize Admin SDK once
admin.initializeApp();
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

// ── Secrets (set with: firebase functions:secrets:set X_INGEST_TOKEN)
const X_INGEST_TOKEN = defineSecret('X_INGEST_TOKEN');

// ── Minimal CORS helper (no dependency)
function withCors(handler: (req: Request, res: Response) => Promise<void> | void) {
  return async (req: Request, res: Response) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'authorization,content-type');
    res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    return handler(req, res);
  };
}

// ── Types & helpers
type ParsedLine = {
  state: string; county: string; city: string; address: string;
  alertType: string; alertMessage: string; incidentId: string;
};

// Accepts "#123456" or "# 123456" (first occurrence)
function extractIncidentId(idCandidate: string, rawText: string): string | undefined {
  let m = idCandidate.match(/#\s*(\d{5,})\b/);
  if (m) return m[1];
  m = rawText.match(/#\s*(\d{5,})\b/);
  if (m) return m[1];
  // last resort: bare number (tolerant)
  m = idCandidate.match(/\b(\d{5,})\b/);
  return m ? m[1] : undefined;
}

// Pick which field to parse + optionally infer reportedAt from lastFormattedMessage
function pickLineToParse(body: any): { line: string; reportedAt?: Date } {
  const line = String(body?.message ?? body?.text ?? body?.lastMessage ?? '').trim();
  if (!line) throw new Error('missing-message');
  const lfm = String(body?.lastFormattedMessage ?? '');
  let reportedAt: Date | undefined;
  const m = lfm.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(\d{1,2}:\d{2}\s*[AP]M)\b/i);
  if (m) {
    const d = new Date(`${m[1]} ${m[2]}`);
    if (!isNaN(+d)) reportedAt = d;
  }
  return { line, reportedAt };
}

function parseSevenFieldsStrict(line: string): ParsedLine {
  const parts = line.split('|').map(s => s.trim()).filter(Boolean);
  if (parts.length < 7) {
    throw new Error(`expected-7-fields-got-${parts.length}`);
  }
  const [state, county, city, address, alertType, alertMessage, idRaw] = parts.slice(0, 7);
  const incidentId = extractIncidentId(idRaw, line);
  if (!incidentId) throw new Error('missing-incident-id');
  return { state, county, city, address, alertType, alertMessage, incidentId };
}

// ──────────────────────────────────────────────────────────────
// HTTP ingestion: MacroDroid/other sources -> Firestore (v2 HTTP)
// ──────────────────────────────────────────────────────────────
export const ingestBNN = onRequest(
  { secrets: [X_INGEST_TOKEN] },
  withCors(async (req: Request, res: Response) => {
    try {
      if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return; }

      // Auth via header secret
      const headerToken = req.header('X-Ingest-Token');
      const expected = X_INGEST_TOKEN.value() || process.env.X_INGEST_TOKEN;
      if (!headerToken || headerToken !== expected) {
        res.status(401).json({ ok: false, reason: 'unauthorized' });
        return;
      }

      const { line, reportedAt } = pickLineToParse(req.body || {});
      const { state, county, city, address, alertType, alertMessage, incidentId } =
        parseSevenFieldsStrict(line);

      // Prefer explicit address field if present in body, else parsed
      const addressFinal = (req.body?.address ? String(req.body.address) : address) || undefined;
      const lat = typeof req.body?.lat === 'number' ? req.body.lat : undefined;
      const lng = typeof req.body?.lng === 'number' ? req.body.lng : undefined;

      const incRef = db.collection('incidents').doc(incidentId);
      let stage: 'new' | 'update' = 'update';

      // Transaction to race-proof first/new vs later/update
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(incRef);
        if (!snap.exists) {
          stage = 'new';
          tx.set(incRef, {
            firstSeenAt: admin.firestore.FieldValue.serverTimestamp(),
            state, county, city, address: addressFinal, lastType: alertType
          }, { merge: true });
        } else {
          stage = 'update';
          tx.set(incRef, { lastSeenAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
        }
      });

      // Flat feed (optional to keep)
const alertDoc: any = {
  ts: admin.firestore.FieldValue.serverTimestamp(),
  reportedAt: reportedAt ? admin.firestore.Timestamp.fromDate(reportedAt) : null,
  audience: 'employee',
  source: 'BNN',
  stage,
  state, county, city,
  address: addressFinal ?? null,
  alertType, alertMessage, incidentId,
  lat: typeof lat === 'number' ? lat : null,
  lng: typeof lng === 'number' ? lng : null,
  rawText: line
};
await db.collection('alerts').add(alertDoc);

      // History stream (for details screen)
      await incRef.collection('updates').add({
        ts: admin.firestore.FieldValue.serverTimestamp(),
        reportedAt: reportedAt ? admin.firestore.Timestamp.fromDate(reportedAt) : null,
        stage,
        message: alertMessage,
        title: req.body?.lastTitle || null,
        address: addressFinal || null,
        lat: typeof lat === 'number' ? lat : null,
        lng: typeof lng === 'number' ? lng : null,
        source: 'BNN'
      });

      // Latest snapshot (for list screen)
      await incRef.set({
        lastTs: admin.firestore.FieldValue.serverTimestamp(),
        lastMessage: alertMessage,
        lastType: alertType,
        address: addressFinal || null,
        lat: typeof lat === 'number' ? lat : null,
        lng: typeof lng === 'number' ? lng : null,
        stage,
        state, county, city,
        source: 'BNN',
        updateCount: admin.firestore.FieldValue.increment(1)
      }, { merge: true });

      res.status(202).json({ ok: true, incidentId, stage });
    } catch (e: any) {
      logger.error(e);
      res.status(400).json({ ok: false, reason: e?.message || 'bad-request' });
    }
  })
);

// ──────────────────────────────────────────────────────────────
// Auth / Roles helpers
// ─────────────────────────────────────────────────────────────-

// Default role on sign-up (Gen1 v1 trigger; deploys on Node 20)
export const setDefaultRole = functionsV1.auth.user().onCreate(async (user: UserRecord) => {
  await admin.auth().setCustomUserClaims(user.uid, { role: 'employee' });
  // Later (optional): domain-based default
  // const email = (user.email || '').toLowerCase();
  // const isEmployee = email.endsWith('@YOURDOMAIN.com');
  // await admin.auth().setCustomUserClaims(user.uid, { role: isEmployee ? 'employee' : 'customer' });
});

// Role admin endpoint (v2 HTTP + CORS)
export const setUserRole = onRequest(
  withCors(async (req: Request, res: Response) => {
    try {
      if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return; }

      const authHeader = req.headers.authorization || '';
      const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
      if (!idToken) { res.status(401).send('Missing token'); return; }

      const decoded = await admin.auth().verifyIdToken(idToken);
      if (decoded.role !== 'employee' && decoded.role !== 'manager') {
        res.status(403).send('Forbidden'); return;
      }

      const { uid, role } = (req.body || {}) as { uid?: string; role?: string };
      if (!uid || !['employee', 'manager', 'customer'].includes(role || '')) {
        res.status(400).json({ error: 'uid and role (employee|manager|customer) required' });
        return;
      }

      await admin.auth().setCustomUserClaims(String(uid), { role });
      res.status(200).json({ ok: true });
    } catch (e: any) {
      logger.error(e);
      res.status(500).json({ error: 'internal' });
    }
  })
);
