# Software Requirements Specification (SRS) - PujaCircle 🕉️

## 1. Introduction

### 1.1 Purpose
This document provides a comprehensive specification of functional and non-functional requirements for the PujaCircle web application.

### 1.2 Unauthenticated Marketing Pages Specification
- **Landing Page (`/`)**: Short, sweet, and focused purely on brand marketing for unauthenticated visitors. Features a hero banner, 3-step "How It Works" overview, featured Vedic rituals preview, and devotee/priest account creation CTAs.
- **About Us (`/about`)**: Short, sweet introduction to the PujaCircle mission, vetted Vedic Gurukul scholars, and direct cash Dakshina principles.
- **Contact Us (`/contact`)**: Purely informational direct contact directory — **strictly NO FORM**. Provides Phone Helpline, Email Support, WhatsApp text support, operating hours (6:00 AM – 9:00 PM IST), and active operating cities.
- **Compact Footer**: Minimal, single-row responsive footer with brand emblem, tagline, essential links, and copyright note.
- **Strict Visitor Isolation**: When any authenticated user (`USER`, `PRIEST`, `ADMIN`) accesses `/`, `/about`, or `/contact`, they are automatically redirected to their dedicated workspace (`/rituals`, `/priest/dashboard`, or `/admin/dashboard`).

### 1.3 Postal PIN Code API Integration
- Real postal PIN code auto-detection powered by `https://api.postalpincode.in/pincode/{PINCODE}`.
- Supports multi-locality selection dropdown and auto-populates City, District, and State for both Devotees and Purohits.

---

## 2. Role Access Matrix

| Route | Visitor (Logged Out) | USER | PRIEST | ADMIN |
| :--- | :--- | :--- | :--- | :--- |
| **Landing (`/`)** | YES (Marketing) | NO (-> `/rituals`) | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **About (`/about`)** | YES | NO (-> `/rituals`) | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **Contact (`/contact`)** | YES (No Form) | NO (-> `/rituals`) | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **User Sign In (`/auth/user/login`)** | YES | NO (-> `/rituals`) | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **User Register (`/auth/user/register`)** | YES | NO (-> `/rituals`) | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **Priest Sign In (`/auth/priest/login`)** | YES | NO (-> `/rituals`) | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **Priest Register (`/auth/priest/register`)** | YES | NO (-> `/rituals`) | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **Admin Sign In (`/auth/admin/login`)** | YES | NO (-> `/rituals`) | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **Rituals (`/rituals`)** | NO (-> `/auth/user/login`) | YES (Customer Home) | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **Priests (`/priests`)** | NO (-> `/auth/user/login`) | YES | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **Bookings (`/bookings`)** | NO (-> `/auth/user/login`) | YES | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **Addresses (`/addresses`)** | NO (-> `/auth/user/login`) | YES | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **Profile (`/profile`)** | NO (-> `/auth/user/login`) | YES | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **Priest Workspace (`/priest/*`)** | NO (-> `/auth/priest/login`) | NO (-> `/rituals`) | YES | NO (-> `/admin/dashboard`) |
| **Admin Workspace (`/admin/*`)** | NO (-> `/auth/admin/login`) | NO (-> `/rituals`) | NO (-> `/priest/dashboard`) | YES |
