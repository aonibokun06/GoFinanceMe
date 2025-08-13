# GoFinanceMe 

A modern peer-to-peer lending platform built with React and Firebase, connecting borrowers with lenders in a secure and user-friendly environment.

## Features

- **User Authentication** - Secure login and registration with Firebase Auth
- **Loan Requests** - Create and manage loan requests with detailed information
- **Lending Dashboard** - Browse and evaluate loan opportunities
- **Request Management** - Track and manage your loan requests and offers
- **Profile Management** - Complete user profiles with verification
- **Real-time Updates** - Live updates using Firebase Firestore
- **Responsive Design** - Modern UI built with Tailwind CSS and Chakra UI

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, Chakra UI
- **Backend**: Firebase (Firestore, Authentication)
- **Charts**: Chart.js with React Chart.js 2
- **Icons**: Heroicons, React Icons
- **Routing**: React Router DOM
- **Animations**: Framer Motion

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GoFinanceMe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

##  Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   └── request_wizard/ # Loan request wizard components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── App.jsx             # Main application component
├── main.jsx            # Application entry point
├── firebase.js         # Firebase configuration
└── index.css           # Global styles
```




