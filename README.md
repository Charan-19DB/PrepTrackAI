# PrepTrack AI — CSE Learning & Placement Preparation System 🚀

> A production-grade personal learning management system, placement preparation dashboard, and interview preparation platform designed for Computer Science & Engineering students.

[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Google Gemini](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%202.5-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 🌟 Highlights & Features

- 📚 **Comprehensive 22-Subject Syllabus**: Over 500+ canonical CSE topics with structured 4-layer learning checklists (Theory, Assessment, Practical, Interview).
- 🧠 **Smart Spaced Repetition**: Ebbinghaus forgetting curve scheduling (+1d, +3d, +7d, +14d, +30d) for long-term retention.
- ⏱️ **Focus Pomodoro Timer**: Built-in 25/5 study timer with audio chimes and continuous session tracking.
- 🎯 **Daily Study Planner**: Automatic time slot breakdown (Morning, Afternoon, Evening, Night) + AI schedule generation targeting weak areas.
- 💡 **AI Tutor & Mock Interviewer**: Integrated Google Gemini 2.5 Flash assistant providing instant explanations, code walk-throughs, and mock technical interviews with rubrics.
- 💻 **DSA Tracker**: Curated LeetCode & GFG problems with complexity tracking, category tags, and revisit flags.
- 📊 **Rich Analytics**: Weekly time distributions, assessment accuracy, subject progress radar, and GitHub-style 365-day contribution heatmaps.
- 🔐 **Google Sign-In & Verification**: 1-click Google authentication + 6-digit OTP student email verification.
- 📱 **Mobile & PWA Ready**: Installable as a Progressive Web App (PWA) and convertible to a native Android APK via Capacitor.

---

## 🗂️ 22 Pre-Seeded CSE Subjects

1. Quantitative Aptitude (34 topics)
2. Logical Reasoning (20 topics)
3. Verbal Ability (21 topics)
4. Python Programming (36 topics)
5. C Programming (20 topics)
6. Java Programming (34 topics)
7. Data Structures & Algorithms (38 topics)
8. DBMS and SQL (46 topics)
9. Operating Systems (35 topics)
10. Computer Networks (34 topics)
11. Object-Oriented Programming (15 topics)
12. AI and Machine Learning (38 topics)
13. Deep Learning (30 topics)
14. Generative AI (32 topics)
15. RAG (Retrieval-Augmented Generation) (15 topics)
16. AI Agents (11 topics)
17. Model Fine-Tuning (9 topics)
18. Blockchain & Smart Contracts (24 topics)
19. Full-Stack Web Development (27 topics)
20. Software Engineering & System Design (20 topics)
21. Cloud, DevOps & Tools (20 topics)
22. Cybersecurity & Cryptography (18 topics)

---

## 🏗️ Project Architecture

```
LearnWithT/
├── backend/                  # Node.js + Express REST API
│   ├── config/               # MongoDB Atlas connection
│   ├── middleware/           # JWT Auth & Error handlers
│   ├── models/               # Mongoose Schemas (User, Subject, Topic, etc.)
│   ├── routes/               # Modular Express API endpoints
│   ├── seeders/              # 22-subject curriculum seeder (500+ topics)
│   ├── services/             # Gemini 2.5 AI service
│   ├── .env.example          # Environment template
│   └── server.js             # Express entry point
│
├── frontend/                 # React 19 + Vite + Tailwind CSS
│   ├── public/               # Static assets & manifest.json
│   ├── src/
│   │   ├── api/              # Axios client with dynamic API URL
│   │   ├── components/       # Layout, Modals, Pomodoro, Google Auth
│   │   ├── context/          # Auth, Theme, and Timer contexts
│   │   ├── pages/            # 15+ Core Application Views
│   │   ├── App.jsx           # Main Router & Providers
│   │   └── main.jsx          # React DOM entry
│   └── package.json
│
├── DEPLOYMENT_AND_MOBILE_APK_GUIDE.md  # Cloud deployment & APK guide
└── README.md
```

---

## ⚡ Quick Start Locally

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local MongoDB

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGODB_URI and JWT_SECRET
npm run seed     # Seeds all 22 subjects, 500+ topics, and demo user
npm run dev      # Runs server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Launches Vite dev server on http://localhost:5173
```

---

## 🚀 Deployment to Render

Detailed instructions are documented in [DEPLOYMENT_AND_MOBILE_APK_GUIDE.md](./DEPLOYMENT_AND_MOBILE_APK_GUIDE.md).

- **Backend**: Deploy `backend/` as a **Web Service** on Render with `npm install` and `node server.js`.
- **Frontend**: Deploy `frontend/` as a **Static Site** with `npm run build` and publish directory `dist`.

---

## 📱 Mobile App (Android APK)

To build a native Android APK:
```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init PrepTrackAI com.preptrack.ai --web-dir dist
npm run build
npx cap add android
cd android && ./gradlew assembleDebug
```
The resulting APK will be generated at `frontend/android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 📄 License
MIT © 2026 Charan Kurupudi
