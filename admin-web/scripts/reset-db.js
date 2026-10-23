const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyBaTrL0f9IYorgNJ1h96LlPhJmSm9065m0',
  authDomain: 'apila-barangay.firebaseapp.com',
  projectId: 'apila-barangay',
  storageBucket: 'apila-barangay.appspot.com',
  messagingSenderId: '686449307162',
  appId: '1:686449307162:web:6eeea5072efc4d9ad15fa1'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const collectionsToReset = [
  'registrations',
  'attendance',
  'programs',
  'announcements',
  'residents',
  'users'
];

async function resetAllData() {
  console.log('--- STARTING COMPLETE DATABASE RESET (BACK TO 0) ---');
  
  for (const colName of collectionsToReset) {
    try {
      const snap = await getDocs(collection(db, colName));
      console.log(`Deleting ${snap.size} documents from '${colName}'...`);
      for (const d of snap.docs) {
        await deleteDoc(doc(db, colName, d.id));
      }
      console.log(`✓ '${colName}' is now at 0 documents.`);
    } catch (err) {
      console.error(`Error resetting collection '${colName}':`, err.message);
    }
  }

  console.log('--- RESET COMPLETE. ALL COLLECTIONS ARE AT 0 ---');
}

resetAllData().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
