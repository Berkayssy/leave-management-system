### 🚀 Leave Management System
Modern leave management application with Ruby on Rails API and Next.js frontend.

## ✨ Features

# 👥 Role-Based Access
Employee: Create and track leave requests

Manager: Approve/reject team leave requests

Admin: System-wide management and analytics

# 📊 Dashboards
Main Dashboard: Quick stats and recent activities

Manager Panel: Team leave management

Admin Panel: System analytics and reporting

# 🔔 Real-time Notifications
Toast notifications for all actions

Leave status updates

Approval/rejection alerts

# 📈 Reporting & Analytics
CSV export functionality

Department-wise analytics

Monthly trend charts

Leave type distribution

# 🏗️ Tech Stack

Frontend
Framework: Next.js 14 (App Router)

Language: TypeScript

Styling: Tailwind CSS

Charts: Recharts

Icons: Lucide React

State: React Hooks

Backend
Framework: Ruby on Rails 7+

Database: PostgreSQL

Authentication: Devise + JWT

API: RESTful JSON API

## 🚀 Quick Start

# Clone the Repository

git clone https://github.com/yourusername/leave-management.git
cd leave-management

# Backend Setup (Rails API)

cd backend

# Install dependencies
bundle install

# Setup database
rails db:create
rails db:migrate
rails db:seed

# Start server (port 3001)
rails server -p 3001

# Frontend Setup (Next.js)

cd frontend

# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

## ⚙️ Environment Variables

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Backend (.env)
DATABASE_URL=postgresql://localhost/leave_management_dev
JWT_SECRET_KEY=your-secure-jwt-secret-key-here
RAILS_ENV=development

# 📁 Project Structure
leave-management/
├── frontend/                 # Next.js application
│   ├── app/                 # App Router pages
│   │   ├── (auth)/         # Authentication pages
│   │   ├── (dashboard)/    # Dashboard pages
│   │   └── api/            # API routes
│   ├── components/         # React components
│   │   ├── ui/            # UI components
│   │   ├── modals/        # Modal components
│   │   └── layout/        # Layout components
│   ├── lib/               # Utilities & helpers
│   └── public/            # Static assets
│
├── backend/                # Rails API
│   ├── app/
│   │   ├── controllers/   # API controllers
│   │   ├── models/        # ActiveRecord models
│   │   └── serializers/   # JSON serializers
│   ├── config/            # Configuration
│   ├── db/                # Database migrations
│   └── spec/              # Tests
│
└── README.md              # This file

## 🔌 API Endpoints

# Authentication
POST   /api/v1/auth/login      # User login
POST   /api/v1/auth/register   # User registration
DELETE /api/v1/auth/logout     # User logout

# Leaves
GET    /api/v1/leaves          # List all leaves
POST   /api/v1/leaves          # Create new leave
GET    /api/v1/leaves/:id      # Get leave details
PATCH  /api/v1/leaves/:id      # Update leave
DELETE /api/v1/leaves/:id      # Delete leave

# Management
PATCH  /manager/leaves/:id/approve  # Approve leave
PATCH  /manager/leaves/:id/reject   # Reject leave
GET    /manager/dashboard           # Manager dashboard
GET    /admin/dashboard             # Admin dashboard

## 👥 User Roles & Permissions

# Employee
Create leave requests
View own leave history
Track request status

# Manager
Approve/reject team leave requests
View team leave calendar
Export team reports

# Admin
System-wide analytics
User management
Department management
Full report exports

## 📊 Database Schema

# Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'employee',
  department VARCHAR(100),
  encrypted_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

# Leaves Table
CREATE TABLE leaves (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type VARCHAR(50),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  manager_notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

## UI Components

# Core Components
Button - Reusable button component
Header - Navigation header with user dropdown
StatCard - Dashboard statistic cards
LeaveCard - Leave request display card

# Modals
ViewDetailsModal - Leave details viewer
ApproveModal - Leave approval modal
RejectModal - Leave rejection modal

# Charts
MonthlyTrendChart - Bar chart for monthly trends
LeaveTypeChart - Pie chart for leave distribution
DepartmentChart - Department performance chart

## 📱 Responsive Design
Mobile-first approach
Tailwind CSS breakpoints
Touch-friendly interfaces
Optimized for all screen sizes

## 🔒 Security Features
JWT-based authentication
Role-based authorization
Input validation & sanitization
SQL injection prevention
XSS protection
CORS configuration

## 🚀 Deployment
Backend (Railway/Heroku)
bash
# Railway (Recommended)
railway login
railway init
railway up

# Heroku
heroku create your-app-name
git push heroku main
heroku run rails db:migrate
Frontend (Vercel)
bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
vercel --prod
Docker Deployment
dockerfile
# Backend Dockerfile
FROM ruby:3.2
WORKDIR /app
COPY Gemfile* ./
RUN bundle install
COPY . .
CMD ["rails", "server", "-b", "0.0.0.0"]

# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]

## 📈 Performance Optimizations

# Frontend
Next.js server-side rendering
Code splitting & lazy loading
Image optimization
Bundle size optimization

# Backend
Database indexing
Query optimization
Response caching
Background jobs for reports

## 🧪 Testing

# Frontend Tests
bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run lint          # ESLint check
npm run type-check    # TypeScript check
Backend Tests
bash
bundle exec rspec     # Run RSpec tests
rails test            # Run unit tests
bundle exec rubocop   # Code style check

## 📝 Scripts
Development
bash

# Start both frontend and backend
npm run dev:full

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend
Production
bash
# Build both
npm run build:full

# Build frontend
npm run build

# Start production
npm run start

🤝 Contributing
Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

Commit Convention
feat: New feature
fix: Bug fix
docs: Documentation
style: Code style
refactor: Code refactoring
test: Testing
chore: Maintenance

# 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

# 🙏 Acknowledgments
Next.js Team
Ruby on Rails Team
Tailwind CSS Team
All open-source contributors

# 📞 Support
For support, email your-email@example.com or create an issue in the GitHub repository.

# 🔗 Links
Repository: GitHub
Issue Tracker: GitHub Issues
Documentation: Wiki

⭐ If you find this project useful, please give it a star!

