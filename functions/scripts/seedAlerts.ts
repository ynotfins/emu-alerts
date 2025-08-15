import * as admin from 'firebase-admin';

async function main() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.warn('⚠️ GOOGLE_APPLICATION_CREDENTIALS not set. Ensure admin SDK can authenticate.');
  }
  if (!admin.apps.length) admin.initializeApp();
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();
  const samples = [
    { message: 'Employee-only system check', audience: 'employee', source: 'seed', ts: now },
    { message: 'Customer promo starts', audience: 'customer', source: 'seed', ts: now },
    { message: 'All-hands meeting tomorrow', audience: 'both', source: 'seed', ts: now, address: '123 5th Ave, New York, NY' }
  ];
  for (const s of samples) {
    const ref = await db.collection('alerts').add(s as any);
    console.log('✅ Wrote alert', ref.id);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
