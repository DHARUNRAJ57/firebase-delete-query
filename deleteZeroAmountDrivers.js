const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteZeroAmountDrivers() {
  try {
    // Get all documents from DriverDetails collection
    const querySnapshot = await getDocs(collection(db, 'DriverDetails'));
    
    let deletedCount = 0;
    
    // Process each document
    const deletePromises = querySnapshot.docs.map(async (document) => {
      const data = document.data();
      
      // Check if amount is 0 or less
      if (data.amount == 0) {
        console.log(`Deleting document ${document.id} with amount: ${data.amount}`);
        await deleteDoc(doc(db, 'DriverDetails', document.id));
        deletedCount++;
      }
    });
    
    // Wait for all deletions to complete
    await Promise.all(deletePromises);
    
    console.log(`Successfully deleted ${deletedCount} documents with zero or negative amount`);
    
  } catch (error) {
    console.error('Error deleting documents:', error);
  }
}

// Run the function
deleteZeroAmountDrivers();