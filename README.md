# Courier and Parcel Management System

A full-stack PERN application for managing courier services with real-time tracking, role-based access, and comprehensive parcel management features.

## Backend of the live site https://app-for-courier.vercel.app/ is hosted on free hosting platform so it may take some time to get interative.

## 🚀 Features

### Customer Features

- User registration and authentication

- Parcel booking with pickup/delivery addresses

- Parcel size/type specification and payment options (COD/Prepaid)

- Booking history and status tracking

- Real-time parcel tracking on interactive maps

### Delivery Agent Features

- View assigned parcels with detailed information

- Update delivery status (Picked Up, In Transit, Delivered, Failed)

- Optimized delivery routes using Google Maps API

### Admin Features

- Comprehensive dashboard with parcel metrics

- Agent assignment and management

- User and booking management system

### Technical Features

- Real-time updates using Socket.IO

- JWT-based authentication with role-based access control

- Multi-language support (English & Bengali)

- Email notifications for status updates

- QR code generation for parcels

- Responsive design for all devices

## 🛠️ Tech Stack

### Frontend

- React (v19.1.1) with TypeScript

- Vite for build tooling

- Tailwind CSS & ShadcnUI for styling

- React Router DOM for navigation

- Socket.IO Client for real-time updates

- React Hook Form with Zod for form validation

- Google Maps API for mapping functionality

- i18next for internationalization

### Backend

- Node.js with Express.js server

- PostgreSQL with Prisma ORM

- JWT for authentication

- Socket.IO for real-time communication

- Nodemailer for email notifications

- Joi for request validation

- QR Code generation

- Jest for testing

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)

- PostgreSQL database

- Google Maps API key

- SMTP credentials for email notifications

### Frontend Setup

bash

- cd frontend
- npm install
- cp .env.example .env
- Add your environment variables
- npm run dev

### Backend Setup

bash

- cd backend
- npm install
- cp .env.example .env
- Add your environment variables
- npx prisma generate
- npx prisma migrate dev
- npm run seed
- npm run dev

## 🗄️ Database Schema

The application uses PostgreSQL with the following main models:

- User - Authentication and user profiles with role-based access

- Parcel - Core parcel information and tracking

- DeliveryAgent - Agent details and availability

- TrackingHistory - Status updates and location history

- Notification - User notifications system

## 🔌 API Endpoints

### Find details about all available api endpoint on this postman documentation: https://documenter.getpostman.com/view/32081062/2sB3BLj7q1

## 🧪 Testing

Run the test suite with the following commands:

bash

# Backend tests

cd backend
npm test # Run all tests
npm run test:auth # Auth tests only
npm run test:parcel # Parcel tests only
npm run test:coverage # Test with coverage

## 📱 Usage

1.  Registration: Users can register with email, password, and role

2.  Parcel Booking: Customers can book parcels with details and payment method

3.  Agent Assignment: Admins can assign parcels to available agents

4.  Tracking: Real-time tracking with status updates and map integration

5.  Notifications: Email notifications for important status changes

6.  Reports: Admins can generate and export reports in CSV/PDF format

## 🚀 Deployment

### Frontend Deployment (Vercel)

bash

cd frontend
npm run build
vercel --prod

### Backend Deployment (Railway/Render)

bash

cd backend

# Update database URL for production

vercel --prod

### Database Migration

bash

npx prisma migrate deploy
npx prisma generate

## 🔒 Security Features

- JWT authentication with secure HTTP-only cookies

- Role-based access control middleware

- Input validation and sanitization

- Rate limiting on authentication endpoints

- SQL injection prevention with Prisma

- XSS protection with helmet.js

## 🤝 Contributing

1.  Fork the repository

2.  Create a feature branch (`git checkout -b feature/amazing-feature`)

3.  Commit your changes (`git commit -m 'Add amazing feature'`)

4.  Push to the branch (`git push origin feature/amazing-feature`)

5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
