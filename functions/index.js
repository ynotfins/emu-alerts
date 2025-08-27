// Cloud Function: ingestBNN
// Implements alerts/{alertId} main document + messages subcollection
// Validates X-Ingest-Token via env/config and supports CORS/OPTIONS

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Admin once
try {
  admin.app();
} catch (e) {
  admin.initializeApp();
}

const db = admin.firestore();

function getExpectedToken() {
  // Prefer env var, fallback to functions config: functions:config:set ingest.token=...
  const fromEnv = process.env.X_INGEST_TOKEN;
  // functions.config() access can throw if not set;
  let fromConfig;
  try {
    fromConfig = functions.config()?.ingest?.token;
  } catch (_) {}
  return fromEnv || fromConfig || '';
}

function setCors(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'content-type,x-ingest-token');
  res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
}

exports.ingestBNN = functions.https.onRequest(async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed. Only POST requests are accepted.');
    return;
  }

  const headerToken = req.get('x-ingest-token') || req.get('X-Ingest-Token');
  const expected = getExpectedToken();
  if (!headerToken || headerToken !== expected) {
    res.status(401).send('Unauthorized. Invalid X-Ingest-Token.');
    return;
  }

  try {
    const body = req.body || {};
    const {
      source,
      title,
      appName,
      appPackage,
      receivedAtEpoch,
      receivedAtText,
      rawText,
      state,
      county,
      city,
      address,
      addressForMaps,
      alertType,
      message,
      alertId,
      geo,
      formattedAddress,
    } = body;

    if (!alertId || !message) {
      res.status(400).send('Bad Request: Missing alertId or message in payload.');
      return;
    }

    // Normalize geo input (support `{geo:{latitude,longitude}}` OR `{lat,lng}`)
    let normalizedGeo = undefined;
    if (geo && typeof geo === 'object' && typeof geo.latitude === 'number' && typeof geo.longitude === 'number') {
      normalizedGeo = { latitude: geo.latitude, longitude: geo.longitude };
    } else if (typeof body.lat === 'number' && typeof body.lng === 'number') {
      normalizedGeo = { latitude: body.lat, longitude: body.lng };
    }

    const alertDocRef = db.collection('alerts').doc(String(alertId));
    const snap = await alertDocRef.get();
    const now = admin.firestore.FieldValue.serverTimestamp();

    if (!snap.exists) {
      // Create main alert document
      const newAlertData = {
        alertId: String(alertId),
        source: source || null,
        title: title || null,
        appName: appName || null,
        appPackage: appPackage || null,
        rawText: rawText || null,
        state: state || null,
        county: county || null,
        city: city || null,
        address: address || null,
        addressForMaps: addressForMaps || null,
        formattedAddress: formattedAddress || null,
        alertType: alertType || null,
        geo: normalizedGeo || null,
        createdAt: now,
        lastUpdatedAt: now,
        initialMessage: message,
        initialReceivedAtEpoch: receivedAtEpoch || null,
        initialReceivedAtText: receivedAtText || null,
      };

      await alertDocRef.set(newAlertData, { merge: true });

      await alertDocRef.collection('messages').add({
        message,
        receivedAtEpoch: receivedAtEpoch || null,
        receivedAtText: receivedAtText || null,
        serverTimestamp: now,
      });

      res.status(200).json({ ok: true, created: true, alertId });
      return;
    }

    // Existing alert: add message and bump lastUpdatedAt
    await alertDocRef.update({ lastUpdatedAt: now });
    await alertDocRef.collection('messages').add({
      message,
      receivedAtEpoch: receivedAtEpoch || null,
      receivedAtText: receivedAtText || null,
      serverTimestamp: now,
    });

    res.status(200).json({ ok: true, created: false, alertId });
  } catch (err) {
    console.error('ingestBNN error:', err);
    res.status(500).send('Internal Server Error. Check logs for details.');
  }
});


