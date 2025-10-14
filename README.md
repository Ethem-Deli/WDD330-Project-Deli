# 🌍 History Timeline – Interactive World History

**History Timeline** is a modern, responsive web application built for exploring and visualizing historical events interactively.  
Users can view timelines, filter by year/decade/theme, view event locations on maps, and manage their favorite historical moments.  
It also integrates with Firebase Authentication for secure user login, registration, and data storage.

---

## 🧠 Project Purpose

This project was developed for the **WDD 330: Web Frontend Development II** course at BYU–Pathway.  
It demonstrates advanced web development concepts, including:

- **Modular JavaScript (ES Modules)**
- **Vite build tool for production optimization**
- **Firebase Authentication & Firestore integration**
- **API data fetching and JSON data handling**
- **Google Maps JavaScript API**
- **Dynamic UI filtering and animations**
- **Persistent user data and favorites management**

---

## ✨ Key Features

### 🗺️ Interactive Timeline
- Displays historical events from both a **local JSON file** and a **remote API**.
- Each event includes an image, title, and short description.
- Clicking an event opens a modal with more details and a Google Map location.

### 🔍 Search and Filters
- Users can search events by name or keyword.
- Filter by **year**, **decade**, or **theme** (e.g., War, Revolution, Technology).

### ❤️ Favorites System
- Logged-in users can **save events to favorites** (stored in Firestore).
- Guests can save favorites locally.
- Export or share your favorites with others.

### 🧭 Map Integration
- Uses **Google Maps API** to show event locations.
- Fallback to geocoding based on the event name if coordinates are missing.

### 🔐 Authentication
- Firebase-powered **Register / Login** system.
- Supports both **email-password** and **Google Sign-In**.
- Authenticated users’ favorites are synced across devices.

### 🍔 Mobile-Friendly Navigation
- Responsive layout with a **hamburger menu** for small screens.

### 🔔 Toast Notifications
- Elegant toast pop-ups for user feedback (success, error, info).

---

## 🛠️ Tech Stack

| Category | Technology |
|-----------|-------------|
| Frontend | HTML5, CSS3, JavaScript (ES Modules) |
| Framework | [Vite](https://vitejs.dev/) |
| Database | Firebase Firestore |
| Authentication | Firebase Auth |
| APIs | Google Maps API, Custom Event API |
| Hosting | Vite Dev Server / Static Deployment |
| Version Control | Git & GitHub |

---

## 🧩 Project Structure

WDD330-Project-Deli/
├── auth/ # Login and Register pages
├── data/ # Local JSON data (events.json)
├── public/assets/ # Static images and icons
├── src/
│ ├── js/ # Modular JS files
│ │ ├── favorites.mjs
│ │ ├── auth.mjs
│ │ ├── toast.mjs
│ │ ├── maps-loader.mjs
│ │ ├── search.mjs
│ │ ├── hamburger.mjs
│ │ └── firebase-config.mjs
│ ├── modules/
│ │ └── api.js # Fetches events from API
│ ├── partials/ # Header & footer HTML partials
│ └── main.js # Main application logic
├── index.html # Home page (timeline view)
├── favorites.html # Favorites page
├── about.html # About page
├── vite.config.js # Vite build configuration
└── package.json

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Ethem-Deli/WDD330-Project-Deli.git
cd WDD330-Project-Deli
 Install dependencies

Make sure you have Node.js (v18+) installed, then run:

npm install

 Add your Firebase configuration

Create a file:

src/js/firebase-config.mjs


and paste your Firebase credentials:

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

Add your Google Maps API Key

In src/main.js, replace this line:

const GMAPS_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

🧪 Development

To start the local development server:

npm run dev


Then open:

http://localhost:5173/


The app will auto-reload when you edit files.

🏗️ Build for Production
npm run build


The final build will be generated inside /dist.

Vite automatically optimizes, minifies, and bundles your assets.
The /data folder is copied to the /dist/data directory.

🌐 Deployment

You can host the /dist folder on:

Vercel

Netlify

GitHub Pages

Any static hosting provider

🔒 Notes

Favorites are synced to Firebase Firestore only when the user is logged in.

Guest users’ favorites are saved in localStorage.

Google Maps requires a valid API key with the Maps JavaScript API and Geocoding API enabled.

👨‍💻 Author

Ethem Deli
WDD 330 – Web Frontend Development II
BYU–Pathway Worldwide
📧 edeli@byupathway.edu

🏁 License

This project is for educational purposes only.
You may reuse, remix, or extend it for learning or non-commercial projects.
