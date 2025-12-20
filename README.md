# Property Rental & Selling System

A full-stack MERN application for land/property rental and selling system.

## Tech Stack

### Frontend
- React.js with TypeScript
- Tailwind CSS (latest version)
- Shadcn UI components
- Form validation (React Hook Form + Zod)
- React Router for navigation

### Backend
- Express.js with TypeScript
- MySQL with Prisma ORM
- Multer for file uploads
- JWT cookies for authentication
- Bcrypt for password hashing

## Project Structure

```
.
├── backend/          # Express.js backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── scripts/
│   ├── prisma/
│   └── public/uploads/
├── frontend/         # React.js frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── lib/
├── package.json      # Root package.json with concurrently
└── README.md
```

## Setup Instructions

1. Install all dependencies:
```bash
npm run install:all
```

2. Set up backend environment:
- Copy `backend/.env.example` to `backend/.env`
- Configure database connection and JWT secret:
  ```
  DATABASE_URL="mysql://user:password@localhost:3306/property_rental_db"
  JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
  JWT_EXPIRE=7d
  PORT=5000
  NODE_ENV=development
  FRONTEND_URL=http://localhost:3000
  ```

3. Set up database:
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run init
```

4. Run development servers:
```bash
npm run dev
```

This will start both backend (port 5000) and frontend (port 3000) simultaneously.

## Default Admin Credentials

After running the init script:
- Email: `admin@property.com`
- Password: `admin123`

**Important:** Change the admin password after first login!

## Features

- User authentication (Register, Login)
- Property listing and management
- Search and filter properties by location, type, purpose, price
- Admin approval workflow for properties
- User dashboard with property statistics
- Admin panel with reports and charts
- Contact requests system
- Image upload for properties
- Responsive design for mobile, tablet, and desktop

## User Roles

- **Guest**: Browse and search properties
- **Registered User**: List properties, manage listings, contact owners
- **Admin**: Manage users, properties, handle reports and charts

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Properties
- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create property (authenticated)
- `PUT /api/properties/:id` - Update property (owner only)
- `DELETE /api/properties/:id` - Delete property (owner only)
- `GET /api/properties/user/my-properties` - Get user's properties
- `POST /api/properties/:id/contact` - Contact property owner

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/change-password` - Change password

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/properties` - Get all properties
- `PUT /api/admin/properties/:id/approve` - Approve property
- `PUT /api/admin/properties/:id/reject` - Reject property
- `DELETE /api/admin/properties/:id` - Delete property
- `GET /api/admin/reports` - Get reports and charts

## Currency

All prices are displayed in Nepali Rupee (NPR).

## Nepal Locations

The system includes 15+ pre-configured locations in Nepal including:
- Kathmandu, Pokhara, Lalitpur, Bharatpur, Biratnagar, Birgunj, Butwal, Dharan, Hetauda, Janakpur, Nepalgunj, Itahari, Bhaktapur, Dhulikhel, Chitwan

## Development

### Backend
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run prisma:studio # Open Prisma Studio
```

### Frontend
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Notes

- Backend console logs all API hits with timestamp and IP address
- File uploads are stored in `backend/public/uploads/`
- JWT tokens are stored in HTTP-only cookies
- Properties require admin approval before being visible to public
- All forms include client-side and server-side validation
