# Zuboc Customer Service - Modern Help Desk SaaS

Zuboc is a production-ready customer support platform built with React, Tailwind CSS, and Supabase.

## Features
- **Ticketing System**: Complete ticket lifecycle management with public/private replies.
- **Dashboard**: Real-time KPIs and trends using Recharts.
- **Knowledge Base**: Manage help articles and categories.
- **CRM-lite**: Customer and organization management.
- **SLA Management**: Track response and resolution times.
- **Auth**: Secure role-based access control via Supabase Auth.
- **Real-time**: Live updates for tickets and notifications.

## Tech Stack
- **Frontend**: React 18 (Vite), Tailwind CSS, Lucide Icons.
- **Backend**: Supabase (Auth, Database, Realtime, Storage).
- **Charts**: Recharts.
- **Forms**: React Hook Form + Zod.

## Setup Instructions

### 1. Supabase Project Setup
1. Create a new project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** and run the contents of `supabase/schema.sql`.
3. Go to **Project Settings > API** and copy your `URL` and `anon public` key.

### 2. Environment Variables
Add the following secrets to your AI Studio project (or create a `.env` file):
- `VITE_SUPABASE_URL`: Your Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon public key.

### 3. Authentication
- Enable **Email/Password** provider in Supabase Auth settings.
- (Optional) Enable **Google** provider for social login.

### 4. Storage
- Create a storage bucket named `attachments` in Supabase and set its privacy to public or configure RLS.

## Deployment
This app is ready for deployment to Cloud Run or any static hosting service (after building with `npm run build`).

## Future Roadmap
- AI-powered reply suggestions using Gemini API.
- WhatsApp and Social Media integrations.
- Advanced automation rules engine.
