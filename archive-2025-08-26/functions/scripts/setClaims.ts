import * as admin from 'firebase-admin';

async function main() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.warn('⚠️ GOOGLE_APPLICATION_CREDENTIALS not set. Ensure admin SDK can authenticate.');
  }
  if (!admin.apps.length) admin.initializeApp();
  const args = process.argv.slice(2);
  const uidArg = args.find(a => a.startsWith('--uid='));
  const roleArg = args.find(a => a.startsWith('--role='));
  if (!uidArg || !roleArg) {
    console.error('Usage: ts-node scripts/setClaims.ts --uid=<UID> --role=employee|customer');
    process.exit(1);
  }
  const uid = uidArg.split('=')[1];
  const role = roleArg.split('=')[1];
  if (!['employee','customer'].includes(role)) {
    console.error('Role must be employee or customer');
    process.exit(1);
  }
  await admin.auth().setCustomUserClaims(uid, { role });
  console.log(`✅ Set role=${role} for uid=${uid}`);
}

main().catch(e => { console.error(e); process.exit(1); });
