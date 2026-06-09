# 🌟 Dear Me: 30 Days Self Growth Challenge

![Project Status](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-19.0-blue)
![Vite](https://img.shields.io/badge/Vite-6.0-purple)
![Firebase](https://img.shields.io/badge/Firebase-12.0-orange)
![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-008744)

---

## 📖 Project Overview

**Dear Me: 30 Days Self Growth Challenge** is an innovative, hybrid (physical-digital) educational media designed specifically for adolescents to cultivate healthy habits, self-awareness, and self-confidence. Developed as a campus project for Universitas Negeri Jakarta (UNJ), this initiative addresses the critical psychological challenges adolescents face today, including identity confusion, insecurity stemming from unrealistic social media standards, and a decline in mental health.

This repository contains the **Digital Web Application** component of the project, which seamlessly integrates with the physical board game via QR codes to provide an interactive, data-driven self-growth experience.

---

## 👥 Credits & Acknowledgements

* **Ideation & Project Management:** Lutvia Ananda Putri
* **Software Engineering & Architecture:** ramadanny
* **Academic Context:** Universitas Negeri Jakarta (State University of Jakarta) - Faculty of Engineering, Family Welfare Education Study Program (2026).

---

## ✨ Core Features

### Physical Component (Starter Kit)
* **30-Day Challenge Board**: A physical gamified tracker for daily self-growth activities.
* **80 Interactive Cards**: Categorized into *Challenge*, *Self-Love*, *Education*, and *Linda's Story* cards to guide the user's emotional and physical journey.
* **Calming Aesthetics**: Designed using soft pastel palettes to create a safe, non-judgmental, and relaxing learning atmosphere.

### Digital Application (This Repository)
* **Interactive BMI Calculator**: Allows users to calculate their Body Mass Index (BMI), Basal Metabolic Rate (BMR), and Total Energy Expenditure (TEE).
* **AI-Powered Health Insights**: Utilizes **Google Gemini AI** to deliver personalized, empathetic, and motivating health evaluations based on the user's current physical metrics and historical data.
* **Progress Dashboard**: Visualizes health and growth trajectories over time using interactive line charts.
* **Secure Cloud Syncing**: Implements Firebase Authentication and Firestore to safely store user profiles and history.
* **Social Sharing Capabilities**: Enables users to capture their milestones and share them directly to WhatsApp.

---

## 🛠 Technical Stack

* **Frontend**: React 19, TypeScript, Vite
* **Styling & UI**: Tailwind CSS v4, Framer Motion, Lucide React
* **Data Visualization**: Recharts, html2canvas
* **Backend & Database**: Firebase (Auth, Firestore)
* **Artificial Intelligence**: Google Gen AI SDK (`gemini-3.1-flash-lite-preview`)

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher recommended)
* npm or yarn
* Firebase Project Credentials
* Google Gemini API Key

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/ramadanny/dear-me.git
cd dear-me
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Configuration:**
Copy the example environment file and fill in your credentials:
```bash
cp .env.example .env
```

Required environment variables:
* `GEMINI_API_KEY`
* `VITE_FIREBASE_API_KEY`
* `VITE_FIREBASE_AUTH_DOMAIN`
* `VITE_FIREBASE_PROJECT_ID`
* `VITE_FIREBASE_STORAGE_BUCKET`
* `VITE_FIREBASE_MESSAGING_SENDER_ID`
* `VITE_FIREBASE_APP_ID`

4. **Start the development server:**
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

---

## 📂 Project Structure

```text
dear-me/
├── public/                 # Static assets (images, logos)
├── src/
│   ├── components/         # Reusable UI components (Layout, Spinners)
│   ├── context/            # Global state management (AuthContext)
│   ├── pages/              # Application views (Dashboard, Calculator, Docs, etc.)
│   ├── services/           # External API integrations (Firebase config)
│   ├── App.tsx             # Root application routing
│   └── main.tsx            # React application entry point
├── firestore.rules         # Firebase database security rules
├── firebase-blueprint.json # Firestore schema documentation
└── package.json            # Project dependencies and scripts
```

---

## 📄 License

This project utilizes a dual-licensing model to protect its academic intellectual property while simultaneously supporting the open-source community:

1. **Source Code:** Distributed under the [MIT License](LICENSE-CODE). You are free to use, modify, and distribute the application's source code.
2. **Content Assets, Visual Designs, and Game Concept:** Distributed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](LICENSE-CONTENT) license. The educational concepts, board game designs, card designs, and characters are strictly prohibited from being reproduced for commercial purposes without prior written consent from the creator team and Universitas Negeri Jakarta.