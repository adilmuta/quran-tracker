// === FIREBASE ===
firebase.initializeApp({
  apiKey: "AIzaSyCzRFAzUuo-NJBIQn0hqncN8QdpRMNbVFk",
  authDomain: "shireen-quran-tracker.firebaseapp.com",
  projectId: "shireen-quran-tracker",
  storageBucket: "shireen-quran-tracker.firebasestorage.app",
  messagingSenderId: "42666035695",
  appId: "1:42666035695:web:9feef659381731dc8b4e1a"
});
const auth = firebase.auth();
const db = firebase.firestore();
db.enablePersistence().catch(() => {});

const ALLOWED_EMAILS = ['adilmacd@gmail.com','nooraink@gmail.com','nooraink@googlemail.com'];
let currentUser = null;

function googleSignIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(e => {
    document.getElementById('signin-error').textContent = e.message;
  });
}

auth.onAuthStateChanged(user => {
  if (user && ALLOWED_EMAILS.includes(user.email.toLowerCase())) {
    currentUser = user;
    document.getElementById('signin-screen').classList.add('hidden');
    document.getElementById('pin-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    initTabHTML(); initHifdhHTML(); initFeaturesHTML(); initReportsHTML();
    currentRole = 'parent'; // Everyone is parent for now
    applyRole();
    renderDashboard();
    // Sync in background
    migrateToFirestore().catch(() => {});
    loadFromFirestore().catch(() => {});
  } else if (user) {
    auth.signOut();
    document.getElementById('signin-error').textContent = 'Access denied: ' + user.email + ' is not authorized.';
  }
});

// Sync helpers
function userDoc() { return db.collection('users').doc(currentUser.uid); }

async function syncToFirestore(key, value) {
  if (!currentUser) return;
  try { await userDoc().collection('data').doc(key).set({value, updated: Date.now()}); } catch(e) {}
}

async function loadFromFirestore() {
  if (!currentUser) return;
  try {
    const snap = await userDoc().collection('data').get();
    snap.forEach(doc => {
      const val = doc.data().value;
      localStorage.setItem(doc.id, JSON.stringify(val));
    });
    if (typeof applySeeds === 'function') applySeeds();
    // Re-render current view after data loads
    const visible = document.querySelector('.tab-content:not(.hidden)');
    if (visible) navTo(visible.id);
  } catch(e) { console.log('loadFromFirestore error:', e); }
}

async function migrateToFirestore() {
  if (!currentUser) return;
  const existing = await userDoc().collection('data').limit(1).get();
  if (!existing.empty) return; // Already has data in cloud
  // Upload all localStorage
  const batch = db.batch();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key === 'theme') continue;
    try {
      const value = JSON.parse(localStorage.getItem(key));
      batch.set(userDoc().collection('data').doc(key), {value, updated: Date.now()});
    } catch(e) {}
  }
  await batch.commit();
}

// Override save to also sync to Firestore
const _origSave = (k, v) => localStorage.setItem(k, JSON.stringify(v));

