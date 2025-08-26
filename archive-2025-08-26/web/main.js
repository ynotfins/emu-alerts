import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, getIdTokenResult } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getFirestore, collection, query, where, orderBy, limit, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

const cfg = window.FIREBASE_CONFIG;
if (!cfg) {
  document.getElementById('status').textContent = '🚧 Missing web/firebase-config.js config.';
  throw new Error('Missing FIREBASE_CONFIG');
}

const app = initializeApp(cfg);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const signinBtn = document.getElementById('signin');
const signoutBtn = document.getElementById('signout');
const statusEl = document.getElementById('status');
const listEl = document.getElementById('list');
const roleTag = document.getElementById('roleTag');

let unsub = null;

function mapUrlFor(alert) {
  if (typeof alert.lat === 'number' && typeof alert.lng === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${alert.lat},${alert.lng}`;
  }
  if (alert.address) {
    return `https://www.google.com/maps?q=${encodeURIComponent(alert.address)}`;
  }
  return null;
}

function renderAlerts(alerts) {
  listEl.innerHTML = '';
  for (const a of alerts) {
    const li = document.createElement('li');
    const item = document.createElement('div');
    item.className = 'item';

    const ts = a.ts ? a.ts.toDate() : new Date();
    const tsEl = document.createElement('div');
    tsEl.className = 'ts';
    tsEl.textContent = ts.toLocaleString();
    const msgEl = document.createElement('div');
    msgEl.className = 'msg';
    msgEl.textContent = a.message || '';

    item.appendChild(tsEl);
    item.appendChild(msgEl);
    li.appendChild(item);

    const url = mapUrlFor(a);
    if (url) {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      anchor.textContent = 'Map';
      anchor.className = 'map';
      li.appendChild(anchor);
    }

    listEl.appendChild(li);
  }
}

async function startFeed(user) {
  const tokenRes = await getIdTokenResult(user, true);
  const role = tokenRes.claims.role || 'customer';
  roleTag.textContent = `(${role})`;

  const audiences = role === 'employee' ? ['employee','both'] : ['customer','both'];
  const q = query(
    collection(db, 'alerts'),
    where('audience', 'in', audiences),
    orderBy('ts', 'desc'),
    limit(200)
  );

  if (unsub) unsub();
  unsub = onSnapshot(q, (snap) => {
    const items = [];
    snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    renderAlerts(items);
  }, (err) => {
    statusEl.textContent = 'Error: ' + err.message;
  });
  statusEl.textContent = 'Live updates connected.';
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    signinBtn.style.display = '';
    signoutBtn.style.display = 'none';
    statusEl.textContent = 'Not signed in.';
    roleTag.textContent = '';
    if (unsub) { unsub(); unsub = null; }
    listEl.innerHTML = '';
    return;
  }
  signinBtn.style.display = 'none';
  signoutBtn.style.display = '';
  await startFeed(user);
});

signinBtn.addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    statusEl.textContent = 'Sign-in error: ' + e.message;
  }
});
signoutBtn.addEventListener('click', async () => {
  await signOut(auth);
});
