import React from 'react';
import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'P-fit — Health, Steps, Hydration & Medication Tracker',
  description: 'Professional health management app with step counting, water hydration logging, tablet reminders, pomodoro timer, and widgets.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="bg-[#F8FAFC] text-[#0F172A] min-h-screen font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
