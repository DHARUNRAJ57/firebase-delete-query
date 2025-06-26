# Firebase User Details to CSV

A Node.js application that fetches user details from Firebase Realtime Database and converts them to CSV format.

## Features

- Connects to Firebase Realtime Database
- Retrieves all user records from the UserDetails collection
- Converts the data to properly formatted CSV
- Handles nested objects and special characters
- Saves the CSV file with a timestamp in the filename

## Prerequisites

- Node.js installed (v14 or higher recommended)
- Firebase project with Realtime Database

## Installation

1. Clone this repository or download the files
2. Install dependencies:

```bash
npm install
```

## Usage

Run the script with:

```bash
node datafetch.js
```

The CSV file will be generated in the `output` directory with a filename like `user_details_2023-10-25T12-45-30-000Z.csv`.

## Configuration

The Firebase configuration is already included in the script. If you need to use a different Firebase project, update the `firebaseConfig` object in `datafetch.js`.

## Output Format

The CSV file includes:
- All user fields as columns
- The Firebase user ID as the first column
- Proper escaping of special characters
- Nested objects are JSON stringified

## Troubleshooting

If you encounter any issues:

1. Make sure your Firebase project has the Realtime Database enabled
2. Check that the UserDetails collection exists in your database
3. Verify your internet connection
4. Ensure you have proper read permissions in your Firebase security rules 