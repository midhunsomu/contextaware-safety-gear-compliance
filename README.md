# ContextAware Safety Gear Compliance (Context-Aware CV)

A **context-aware safety gear monitoring system** that detects **helmet compliance** using a live camera feed and **AI-based environment reasoning**.

Unlike traditional PPE compliance systems, this project reduces **false alarms** by triggering violations **only in High Risk Zones** (construction / machinery areas) and suppressing alerts in **Safe Zones** (office / walkway / break areas).

---

## 🚀 Features

- 📷 Live camera monitoring (browser-based)
- 🧠 AI-based detection using **Google Gemini**
- 🦺 Detects:
  - Worker presence
  - Helmet presence
- 🏗️ Zone classification:
  - Safe Zone
  - High Risk Zone
- 🔔 Smart alert logic:
  - Alerts only when **Helmet Missing + High Risk Zone**
  - Suppresses alerts in Safe Zones
- 🕒 Auto-analyzes every **5 seconds**
- 🧾 Stores latest alerts (up to 10)

## ⚙️ Setup & Installation

### 1) Clone the repository
```bash
git clone https://github.com/midhunsomu/contextaware-safety-gear-compliance.git
cd contextaware-safety-gear-compliance
```

## Install dependencies

```bash
npm install
```

## Run the Project
```bash
npm run dev
```
