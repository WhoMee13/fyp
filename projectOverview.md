# Project Overview: Property Rental Platform

This document provide a comprehensive overview of the **Property Rental platform**, a full-stack MERN application (using MySQL with Prisma ORM) designed for property management, rental, and sales.

## 🚀 Core Features

### 🏢 Property Management
- **Multi-Category Listings**: Supports Residential, Agricultural, and Commercial properties.
- **Dynamic Purpose**: Properties can be listed for either **Sale** or **Rent**.
- **Precise Geolocation**: Integrated Leaflet map for pinpointing property locations with 4-decimal precision coordinates.
- **Image Handling**: Support for multiple high-quality property images.

### 👥 Role-Based Access Control (RBAC)
- **Customer**: Browse properties, book rentals, or buy properties. Access to personal profile and booking history.
- **Vendor**: Manage personal property listings, handle bookings, and view specialized dashboards.
- **Admin**: Full platform oversight, including user management, property approval, vendor verification, and dynamic site branding.

### 🎨 Modern UI/UX
- **Dark Mode**: System-wide dark mode support with manual toggle.
- **Side Navigation**: Professional sidebar layout for administrators.
- **Dynamic Branding**: Site title, logo, and footer content are fully manageable via the Admin panel.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React (Vite), TypeScript, Tailwind CSS 4.0 |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | MySQL |
| **ORM** | Prisma |
| **API** | RESTful Architecture |
| **Authentication** | JWT (JSON Web Tokens) with Cookie storage |

---

## 📊 Database Schema (Prisma Models)

### `User`
The central model for all actors (Admin, Vendor, Customer). Stores authentication details, contact info, and relations to properties and bookings.

### `Property`
Stores all property metadata. Includes fields for various property types (bedrooms for residential, soil type for agricultural, etc.).
- **Relations**: Linked to `User` (Owner), `Location`, `PropertyImage`, and `Booking`.

### `Location`
Stores precise address and geographic coordinates (`latitude`, `longitude`) for each property.

### `VendorProfile`
Extended information for users who apply to become vendors, including verification documents (Citizenship ID/Images).

### `Booking`
Tracks transactions between customers and vendors for both rentals and purchases.

### `SiteSetting`
A singleton-pattern table used to store dynamic global configuration such as `appName`, `logo`, and `footerText`.

---

## 🏗️ Project Structure

### `/backend`
- `prisma/`: Database schema and migrations.
- `src/controllers/`: Logic for handling API requests.
- `src/routes/`: API endpoint definitions.
- `src/middleware/`: Auth verification, file upload (Multer) config, and validation.

### `/frontend`
- `src/components/`: Reusable UI components (Navbar, Sidebar, Footer, UI-kit).
- `src/pages/`: Main page components (Home, Dashboard, AdminSettings, Profile).
- `src/context/`: Global state management for Auth, Theme, and Site Settings.
- `src/lib/`: Axios configuration and utility functions.

---

## 🔧 Maintenance & Setup
1. **Migrations**: `npx prisma migrate dev`
2. **Seeding**: `npm run seed` (Initializes admin user and site settings)
3. **Environment**: Managed via `.env` files in both frontend and backend.
