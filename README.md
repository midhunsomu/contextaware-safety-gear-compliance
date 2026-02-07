# Context-Aware Safety Gear Compliance System

A lightweight **context-aware computer vision system** that monitors worker safety gear compliance using a live camera feed and local machine learning models.

Unlike traditional PPE detection systems that raise alerts for every missing helmet, this system uses **zone-based reasoning** to reduce false alarms. Alerts are triggered **only when workers without required safety gear enter High-Risk zones**.

---

## 🚀 Features

- 📷 Live camera / video monitoring
- 🧠 Local AI detection
- 🦺 Detects:
  - Person
  - Helmet
  - Safety vest
- 🏗️ Zone classification:
  - Safe Zone
  - High-Risk Zone
- 🔔 Smart context-aware alerts:
  - Alert → Missing gear + High-Risk zone
  - Ignore → Safe zone
- ⚡ Real-time processing
- 🧾 On-screen violation messages
- 💻 Fully offline

---

## 🧠 How It Works

Pipeline:

Camera Frame
→ Object Detection (YOLO)
→ Worker Tracking
→ Zone Check
→ Gear Compliance Logic
→ Alert

### Logic

IF Safe Zone → ignore  
IF High-Risk Zone + missing helmet/vest → alert  

This reduces unnecessary alerts and improves practical usability.

---

## 🛠️ Tech Stack

- Python
- OpenCV
- Ultralytics YOLO
- NumPy


## Demo Video
[Click here to watch the demo video](https://drive.google.com/file/d/19FF663XlM6x36gQQSwaFjS6LHKUga2tk/view?usp=sharing)


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
