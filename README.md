# 🌊 AquaGuardian

**AI-Powered Water Management Platform | SDG 6: Clean Water & Sanitation**

> A real-time, community-driven web application connecting citizens, farmers, and municipal authorities to track, report, and resolve water and sanitation issues — powered by a live cloud database.

🌐 **Live App:** [https://aquaguardian.vercel.app](https://aquaguardian.vercel.app)

---

## ✨ Features

### 🏙️ Municipal Command Center (Admin Panel)
- **Passcode-protected** dashboard for water authorities
- **Live Triage** — incoming citizen reports update in real-time via Convex
- **Field Teams Management** — Add, remove and manage real field teams stored in the database
- **Report Assignment** — Assign reports to available teams, shifting status from `Pending → Investigating → Resolved`

### 🗺️ Live Water Issue Map
- Interactive map powered by **React Leaflet**
- Every citizen report drops a pin in real-time
- Filter by issue type or zoom to any region

### 📋 Citizen Reporting
- Submit reports with: type, location, photo, GPS coordinates, description
- Categories include: Pipe Leak, Contamination, Drought, Flooding, and **Agriculture-specific types** (Irrigation Shortage, Canal Blockage)

### 📊 AI Analytics Dashboard
- Log real daily water usage and quality scores
- **OLS Linear Regression** algorithm forecasts the next 7 days
- Zero mock data — charts only generate from real entries logged by admins
- Fully deletable records stored in Convex

### 🧪 Community Awareness Portal
- Dynamic safety alerts generated from real report data (e.g., "Boil Water Advisory")
- SDG 6 education and hygiene best practices

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), Tailwind CSS, Framer Motion |
| **Database** | [Convex](https://convex.dev) — Real-time, serverless |
| **Maps** | React Leaflet + OpenStreetMap |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Deployment** | Vercel |
| **PWA** | `manifest.json` for mobile install support |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Convex](https://convex.dev) account (free)

### 1. Clone the repo
```bash
git clone https://github.com/martyn-in/HACKNX.git
cd HACKNX
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Convex
```bash
npx convex dev
```
Copy the `CONVEX_DEPLOYMENT` URL into a `.env.local` file:
```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

### 4. Run the dev server
```bash
npm run dev
```

### 5. Deploy to Vercel
```bash
npx vercel --prod
```

---

## 📁 Project Structure

```
HACKNX/
├── convex/              # Serverless backend (Convex functions)
│   ├── schema.ts        # Database schema: reports, teams, waterData
│   ├── reports.ts       # CRUD for citizen reports
│   ├── teams.ts         # Field team management
│   └── waterData.ts     # Water analytics data
├── src/
│   ├── pages/
│   │   ├── Home.jsx           # Landing page
│   │   ├── MapPage.jsx        # Live issue map
│   │   ├── ReportIssue.jsx    # Citizen report form
│   │   ├── Dashboard.jsx      # Stats dashboard
│   │   ├── AdminPanel.jsx     # Municipal command center
│   │   ├── Awareness.jsx      # Community portal
│   │   └── Analytics.jsx      # AI predictive analytics
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── AquaBot.jsx        # AI chatbot assistant
│   │   └── ErrorBoundary.jsx
│   └── context/
│       └── LanguageContext.jsx # i18n: English, Telugu, Hindi
└── public/
    └── manifest.json   # PWA configuration
```

---

## 🌍 SDG 6 Impact

This platform directly addresses **UN Sustainable Development Goal 6** — Clean Water and Sanitation:

- 📍 **Real-time crowdsourced reporting** of water infrastructure failures
- 🚒 **Rapid municipal response** via coordinated field team dispatch
- 🧪 **Predictive analytics** to anticipate demand spikes and quality drops
- 🌾 **Agriculture support** for farmers to report and track irrigation issues
- 📣 **Public awareness** of hygiene and local water safety advisories

---

## 🔐 Admin Access

The Admin Panel at `/admin` is secured with a passcode.

---

## 📄 License

MIT © 2025 [martyn-in](https://github.com/martyn-in)
