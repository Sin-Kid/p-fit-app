# PulseMonitor Enterprise — Production-Ready Cross-Platform Monitoring System

A commercial-grade, multi-platform infrastructure and fleet monitoring ecosystem engineered for high reliability, offline resilience, real-time telemetry, and home-screen glanceability.

---

## 🏗️ Architecture Overview

```text
                                  ┌───────────────────────────┐
                                  │      Supabase Cloud       │
                                  │  • PostgreSQL + RLS       │
                                  │  • Supabase Auth (JWT)    │
                                  │  • Realtime WebSocket     │
                                  │  • Storage & Edge Funcs   │
                                  └─────────────┬─────────────┘
                                                │
                     ┌──────────────────────────┴──────────────────────────┐
                     │                                                     │
                     ▼                                                     ▼
      ┌─────────────────────────────┐                       ┌─────────────────────────────┐
      │  Flutter App (iOS/Android)  │                       │  Next.js Admin Dashboard    │
      │  • Riverpod State Mgmt      │                       │  • Next.js 15 (TypeScript)  │
      │  • Drift + SQLite (Offline) │                       │  • Tailwind CSS + Lucide    │
      │  • Supabase Realtime Client │                       │  • Recharts Live Analytics  │
      │  • GoRouter Navigation      │                       │  • User & Device Management │
      │  • Android / iOS Widgets    │                       │  • Realtime Alert Triage    │
      └─────────────────────────────┘                       └─────────────────────────────┘
```

---

## 📦 Directory Structure

```text
├── backend/
│   ├── schema.sql           # Normalized PostgreSQL schema with RLS, triggers, indexes
│   └── seed.sql             # Demo fleet endpoints, telemetry metrics, and alerts
├── mobile/                  # Flutter Mobile & Tablet Application (iOS, Android, iPadOS)
│   ├── lib/
│   │   ├── core/            # Theme, Drift SQLite, router, and design tokens
│   │   └── features/        # Home, Monitoring, Activity, Notifications, Profile
│   ├── android/             # Android native AppWidgetProvider (RemoteViews)
│   └── ios/                 # iOS WidgetKit Swift extension (systemSmall/Medium)
└── admin/                   # Next.js 15 Web Admin Monitoring Dashboard (TypeScript + Tailwind)
    ├── app/                 # Overview, Monitoring Wall, Alerts, Analytics, Users, Settings
    └── lib/                 # Supabase client & real-time mock data generator
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup (PostgreSQL / Supabase)
1. In your Supabase project dashboard, open the **SQL Editor**.
2. Run `backend/schema.sql` to provision all normalized tables, Row Level Security (RLS) policies, and Realtime replication publications.
3. Run `backend/seed.sql` to populate initial demo fleet data.

### 2. Next.js Web Admin Dashboard
1. Navigate to the `admin/` directory:
   ```bash
   cd admin
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.
4. To create a production build:
   ```bash
   npm run build && npm start
   ```

### 3. Flutter Mobile Application (Android, iOS, iPadOS)
1. Navigate to the `mobile/` directory:
   ```bash
   cd mobile
   ```
2. Fetch dependencies:
   ```bash
   flutter pub get
   ```
3. Run on your connected device or simulator:
   ```bash
   flutter run
   ```

---

## 📱 Home-Screen Widgets

### Android Widget (`AppWidgetProvider`)
- **Layout**: `mobile/android/app/src/main/res/layout/widget_system_status.xml`
- **Provider**: `MonitoringAppWidgetProvider.kt`
- **Features**: Live operational indicator (🟢 / 🟠), Online node count (e.g. 6/8), Active critical incidents, and deep linking.

### iOS WidgetKit (`SwiftUI`)
- **Source**: `mobile/ios/Runner/MonitoringWidget.swift`
- **Supported Families**: `.systemSmall`, `.systemMedium`
- **Timeline**: Auto-refreshes every 15 minutes with cached offline snapshot.

---

## 🔒 Security & RBAC (Role-Based Access Control)
- **User**: View own assigned telemetry metrics and manage personal notification channels.
- **Admin**: Full fleet visibility, live node restart/ping triggers, and alert triage.
- **Super Admin**: System-wide configuration, telemetry threshold tuning, and user role assignment.
- **Zero-Trust**: Client applications communicate exclusively with authenticated Row Level Security policies. Service keys are never embedded on client devices.
