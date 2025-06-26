const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load the service account key from firebase.json
const serviceAccount = require('./firebase.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://silver-drop-taxi-3b2e9-default-rtdb.firebaseio.com"
});

// Get Firestore database reference
const db = admin.firestore();

/**
 * Convert JSON data to CSV format
 * @param {Array} jsonData - Array of user objects
 * @returns {string} CSV formatted string
 */
function convertToCSV(jsonData) {
  if (!jsonData || jsonData.length === 0) {
    return '';
  }

  // Get headers from the first object
  const headers = Object.keys(jsonData[0]);
  
  // Create CSV header row
  const csvRows = [headers.join(',')];
  
  // Add data rows
  for (const item of jsonData) {
    const values = headers.map(header => {
      const value = item[header];
      // Handle values that might contain commas, quotes, or are undefined/null
      if (value === null || value === undefined) {
        return '';
      } else if (typeof value === 'object') {
        // For nested objects, stringify them
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      } else {
        // Escape quotes and wrap in quotes if contains commas or quotes
        const valueStr = String(value);
        return valueStr.includes(',') || valueStr.includes('"') || valueStr.includes('\n') 
          ? `"${valueStr.replace(/"/g, '""')}"` 
          : valueStr;
      }
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

/**
 * Fetch user details from Firestore and save as CSV
 */
async function fetchUserDetailsToCSV() {
  try {
    console.log('Fetching user details from Firestore...');
    
    // Reference to UserDetails collection in Firestore
    const userDetailsRef = db.collection('UserDetails');
    
    // Get all user details
    const snapshot = await userDetailsRef.get();
    
    if (snapshot.empty) {
      console.log('No user details found in the database');
      return;
    }
    
    // Convert Firestore snapshot to array of objects
    const userArray = [];
    
    // Process each document
    snapshot.forEach(doc => {
      userArray.push({
        userId: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Found ${userArray.length} user records`);
    
    // Convert to CSV
    const csvData = convertToCSV(userArray);
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(outputDir, `user_details_${timestamp}.csv`);
    
    // Write to file
    fs.writeFileSync(outputPath, csvData);
    
    console.log(`CSV file successfully created at: ${outputPath}`);
    
    // Store a copy in Firestore for record keeping
    await storeCSVMetadataInFirestore(outputPath, userArray.length);
    
  } catch (error) {
    console.error('Error fetching user details:', error);
  }
}

/**
 * Store metadata about the generated CSV in Firestore
 * @param {string} filePath - Path where CSV was saved
 * @param {number} recordCount - Number of records in the CSV
 */
async function storeCSVMetadataInFirestore(filePath, recordCount) {
  try {
    const csvMetadata = {
      filePath: filePath,
      recordCount: recordCount,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      fileName: path.basename(filePath)
    };
    
    // Store metadata in a CSVExports collection
    await db.collection('CSVExports').add(csvMetadata);
    
    console.log('CSV metadata stored in Firestore');
  } catch (error) {
    console.error('Error storing CSV metadata:', error);
  }
}

// Execute the function
fetchUserDetailsToCSV();
