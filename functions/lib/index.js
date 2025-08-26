"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserRole = exports.setDefaultRole = exports.ingestBNN = void 0;
// functions/src/index.ts
const admin = __importStar(require("firebase-admin"));
const params_1 = require("firebase-functions/params");
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
// v1 ONLY for the auth trigger (Gen1-friendly)
const functionsV1 = __importStar(require("firebase-functions/v1"));
const crypto_1 = require("crypto");
// Initialize Admin SDK once
admin.initializeApp();
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });
// ── Secrets (set with: firebase functions:secrets:set X_INGEST_TOKEN)
const X_INGEST_TOKEN = (0, params_1.defineSecret)('X_INGEST_TOKEN');
// ── Minimal CORS helper (no dependency)
function withCors(handler) {
    return async (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');
        // allow our custom auth header too
        res.set('Access-Control-Allow-Headers', 'authorization,content-type,x-ingest-token');
        res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }
        return handler(req, res);
    };
}
// Accepts "#123456" or "# 123456" (first occurrence)
function extractIncidentId(idCandidate, rawText) {
    let m = idCandidate.match(/#\s*(\d{5,})\b/);
    if (m)
        return m[1];
    m = rawText.match(/#\s*(\d{5,})\b/);
    if (m)
        return m[1];
    // last resort: bare number (tolerant)
    m = idCandidate.match(/\b(\d{5,})\b/);
    return m ? m[1] : undefined;
}
// Create a stable synthetic ID when BNN doesn't include a #id.
// We hash a canonical key (state|county|city|address|alertType).
function synthesizeIncidentId(p) {
    const key = `${p.state}|${p.county}|${p.city}|${p.address}|${p.alertType}`.toLowerCase();
    return (0, crypto_1.createHash)('sha1').update(key).digest('hex').slice(0, 16); // short, deterministic
}
// Pick which field to parse + optionally infer reportedAt from lastFormattedMessage.
// Also strips common body prefixes like "U/D ", "Update ", "New Incident ", etc.
function pickLineToParse(body) {
    let line = String(body?.message ?? body?.text ?? body?.lastMessage ?? '').trim();
    if (!line)
        throw new Error('missing-message');
    // Strip common leading prefixes that BNN sometimes embeds in the body
    // Examples: "U/D ", "U/D", "Update ", "New Incident ", "New Media "
    line = line.replace(/^(U\/D\s*|Update\s*|New Incident\s*|New Media\s*)/i, '').trim();
    const lfm = String(body?.lastFormattedMessage ?? '');
    let reportedAt;
    const m = lfm.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(\d{1,2}:\d{2}\s*[AP]M)\b/i);
    if (m) {
        const d = new Date(`${m[1]} ${m[2]}`);
        if (!isNaN(+d))
            reportedAt = d;
    }
    return { line, reportedAt };
}
/**
 * Parse BNN notification line.
 * Real-world format from notifications:
 *   state | county | city | alertType | address | alertMessage | (metadata...) | #123456
 * We only need the first 6 tokens in that exact order, and we attempt to pull an id
 * from any trailing "#123456".
 */
function parseBNNLine(line) {
    // split on pipes, trim whitespace, drop empty tokens caused by "||"
    const parts = line.split('|').map(s => s.trim()).filter(Boolean);
    if (parts.length < 6) {
        throw new Error(`expected-6-fields-got-${parts.length}`);
    }
    const [state, county, city, alertType, address, alertMessage] = parts.slice(0, 6);
    // Try to pull an incident id from the tail (anything after the first 6 tokens)
    const tail = parts.slice(6).join(' | ');
    const incidentId = extractIncidentId(tail, line) || extractIncidentId('', line);
    return { state, county, city, address, alertType, alertMessage, incidentId };
}
// ──────────────────────────────────────────────────────────────
// HTTP ingestion: MacroDroid/other sources -> Firestore (v2 HTTP)
// ──────────────────────────────────────────────────────────────
exports.ingestBNN = (0, https_1.onRequest)({ secrets: [X_INGEST_TOKEN] }, withCors(async (req, res) => {
    try {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }
        // Auth via header secret
        const headerToken = req.header('X-Ingest-Token');
        const expected = X_INGEST_TOKEN.value() || process.env.X_INGEST_TOKEN;
        if (!headerToken || headerToken !== expected) {
            res.status(401).json({ ok: false, reason: 'unauthorized' });
            return;
        }
        // Pull/clean the raw line and parse according to BNN's real format
        const { line, reportedAt } = pickLineToParse(req.body || {});
        const parsed = parseBNNLine(line);
        const { state, county, city, address, alertType, alertMessage } = parsed;
        // Prefer explicit address field if present in body, else parsed
        const addressFinal = (req.body?.address ? String(req.body.address) : address) || undefined;
        const lat = typeof req.body?.lat === 'number' ? req.body.lat : undefined;
        const lng = typeof req.body?.lng === 'number' ? req.body.lng : undefined;
        // Incident ID: use BNN id if present, else synthesize a stable one
        const incidentId = parsed.incidentId || synthesizeIncidentId({
            state, county, city, address: addressFinal ?? address, alertType
        });
        const incRef = db.collection('incidents').doc(incidentId);
        let stage = 'update';
        // Transaction to race-proof first/new vs later/update
        await db.runTransaction(async (tx) => {
            const snap = await tx.get(incRef);
            if (!snap.exists) {
                stage = 'new';
                tx.set(incRef, {
                    firstSeenAt: admin.firestore.FieldValue.serverTimestamp(),
                    state, county, city,
                    address: addressFinal ?? null,
                    lastType: alertType,
                    source: 'BNN',
                    updateCount: 0, // will be incremented below
                }, { merge: true });
            }
            else {
                stage = 'update';
                tx.set(incRef, {
                    lastSeenAt: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }
        });
        // Flat alerts feed (optional to keep)
        const alertDoc = {
            ts: admin.firestore.FieldValue.serverTimestamp(),
            reportedAt: reportedAt ? admin.firestore.Timestamp.fromDate(reportedAt) : null,
            audience: 'employee',
            source: 'BNN',
            stage,
            state, county, city,
            address: addressFinal ?? null,
            alertType, alertMessage,
            incidentId,
            lat: typeof lat === 'number' ? lat : null,
            lng: typeof lng === 'number' ? lng : null,
            rawText: line,
        };
        await db.collection('alerts').add(alertDoc);
        // History stream (for details screen)
        await incRef.collection('updates').add({
            ts: admin.firestore.FieldValue.serverTimestamp(),
            reportedAt: reportedAt ? admin.firestore.Timestamp.fromDate(reportedAt) : null,
            stage,
            message: alertMessage,
            title: req.body?.lastTitle || null, // keep if sent by MacroDroid
            address: addressFinal ?? null,
            lat: typeof lat === 'number' ? lat : null,
            lng: typeof lng === 'number' ? lng : null,
            source: 'BNN',
        });
        // Latest snapshot (for list screen)
        await incRef.set({
            lastTs: admin.firestore.FieldValue.serverTimestamp(),
            lastMessage: alertMessage,
            lastType: alertType,
            address: addressFinal ?? null,
            lat: typeof lat === 'number' ? lat : null,
            lng: typeof lng === 'number' ? lng : null,
            stage,
            state, county, city,
            source: 'BNN',
            updateCount: admin.firestore.FieldValue.increment(1),
        }, { merge: true });
        res.status(202).json({ ok: true, incidentId, stage });
    }
    catch (e) {
        logger.error(e);
        const msg = typeof e?.message === 'string' ? e.message : 'bad-request';
        res.status(400).json({ ok: false, reason: msg });
    }
}));
// ──────────────────────────────────────────────────────────────
// Auth / Roles helpers
// ─────────────────────────────────────────────────────────────-
// Default role on sign-up (Gen1 v1 trigger; deploys on Node 20)
exports.setDefaultRole = functionsV1.auth.user().onCreate(async (user) => {
    await admin.auth().setCustomUserClaims(user.uid, { role: 'employee' });
    // Later (optional): domain-based default
    // const email = (user.email || '').toLowerCase();
    // const isEmployee = email.endsWith('@YOURDOMAIN.com');
    // await admin.auth().setCustomUserClaims(user.uid, { role: isEmployee ? 'employee' : 'customer' });
});
// Role admin endpoint (v2 HTTP + CORS)
exports.setUserRole = (0, https_1.onRequest)(withCors(async (req, res) => {
    try {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }
        const authHeader = req.headers.authorization || '';
        const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
        if (!idToken) {
            res.status(401).send('Missing token');
            return;
        }
        const decoded = await admin.auth().verifyIdToken(idToken);
        if (decoded.role !== 'employee' && decoded.role !== 'manager') {
            res.status(403).send('Forbidden');
            return;
        }
        const { uid, role } = (req.body || {});
        if (!uid || !['employee', 'manager', 'customer'].includes(role || '')) {
            res.status(400).json({ error: 'uid and role (employee|manager|customer) required' });
            return;
        }
        await admin.auth().setCustomUserClaims(String(uid), { role });
        res.status(200).json({ ok: true });
    }
    catch (e) {
        logger.error(e);
        res.status(500).json({ error: 'internal' });
    }
}));
