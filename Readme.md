# Zarvo HRMS - Human Resource Management System

A comprehensive web-based HR management platform built to streamline employee administration, attendance tracking, leave management, and payroll operations for modern organizations.

## 📋 Overview

Zarvo HRMS is a full-stack application that provides organizations with essential HR tools to manage their workforce effectively. The system offers role-based access control with distinct interfaces for employees and HR administrators, ensuring appropriate access to sensitive information while maintaining ease of use.

## ✨ Key Features

### Authentication & Security
- Secure user registration with employee ID assignment
- Role-based authentication (Employee, HR, Admin)
- JWT token-based session management
- Password encryption using bcrypt
- Protected routes and API endpoints

### Employee Management
- Comprehensive employee profiles with personal and job details
- Employee directory with search and filtering capabilities
- Department and position tracking
- Employee status management
- Bulk employee operations for HR staff

### Attendance System
- Daily check-in/check-out functionality
- Automatic work hours calculation
- Attendance status tracking (Present, Absent, Late, Half-day)
- Monthly attendance reports
- Real-time attendance monitoring for supervisors

### Leave Management
- Multiple leave types (Annual, Sick, Personal, Unpaid)
- Leave application with date range selection
- Approval workflow for HR/Admin
- Leave balance tracking
- Status updates (Pending, Approved, Rejected)
- Comment system for leave requests

### Payroll System
- Detailed salary structure management
- Multiple allowance types (Housing, Transport, Medical)
- Automated deductions (Tax, Insurance, Provident Fund)
- Monthly payroll generation
- Salary slip viewing for employees
- Comprehensive payroll reports

### Dashboard & Analytics
- Personalized dashboards for different user roles
- Key performance indicators and statistics
- Recent activity tracking
- Quick access to common tasks
- Visual data representation

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Fetch API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Zod

## 📁 Project Structure

```
OdooXGCET/
├── Backend/
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Authentication & authorization
│   │   ├── validators/      # Input validation schemas
│   │   ├── lib/            # Database client & utilities
│   │   └── index.ts        # Application entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # Utilities & API clients
│   │   └── main.tsx       # Application entry point
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd OdooXGCET
   ```

2. **Set up the Backend**
   ```bash
   cd Backend
   pnpm install
   ```

3. **Configure Database**
   
   Create a `.env` file in the Backend directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/hrms_db"
   JWT_SECRET="your-secret-key-here"
   PORT=3000
   ```

4. **Initialize Database**
   ```bash
   pnpm prisma generate
   pnpm prisma migrate deploy
   ```

5. **Set up the Frontend**
   ```bash
   cd ../Frontend
   npm install
   ```

   Create a `.env` file in the Frontend directory:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd Backend
   pnpm start
   ```
   The API will be available at `http://localhost:3000`

2. **Start the Frontend Development Server**
   ```bash
   cd Frontend
   npm run dev
   ```
   The application will be available at `http://localhost:8080`

## 👥 User Roles & Permissions

### Employee
- View personal dashboard
- Check-in/check-out for attendance
- View own attendance records
- Apply for leave
- View leave status and history
- View own payroll and salary slips
- Update limited profile information

### HR / Admin
- Access to all employee features
- View all employee records
- Manage employee profiles
- View attendance for all employees
- Approve or reject leave requests
- Generate and manage payroll
- Access analytics and reports
- Export data

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email address
- `GET /api/auth/me` - Get current user profile

### Attendance
- `POST /api/attendance/check-in` - Check in for the day
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance/my-attendance` - Get personal attendance
- `GET /api/attendance/today` - Get today's attendance status
- `GET /api/attendance/all` - Get all attendance (HR only)

### Leave Management
- `POST /api/leave/create` - Apply for leave
- `GET /api/leave/my-requests` - Get personal leave requests
- `GET /api/leave/all` - Get all requests (HR only)
- `PATCH /api/leave/:id/approve` - Approve leave (HR only)
- `PATCH /api/leave/:id/reject` - Reject leave (HR only)

### Payroll
- `GET /api/payroll/my-payroll` - Get personal payroll
- `GET /api/payroll/all` - Get all payroll (HR only)
- `POST /api/payroll/generate` - Generate monthly payroll (HR only)
- `PUT /api/payroll/:id` - Update payroll record (HR only)

### Employees
- `GET /api/employee/list` - Get all employees (HR only)
- `GET /api/employee/:id` - Get employee details
- `PUT /api/employee/:id` - Update employee (HR only)
- `POST /api/employee/create` - Create employee (HR only)

## 🗄️ Database Schema

### User Table
Stores employee information including credentials, personal details, and job information.

### Attendance Table
Records daily check-in/check-out times with status tracking.

### LeaveRequest Table
Manages leave applications with approval workflow.

### Payroll Table
Maintains salary structures and monthly payment records.

## 🎨 Design Philosophy

The application follows modern UI/UX principles with:
- Clean, intuitive interface
- Responsive design for all screen sizes
- Consistent color scheme and typography
- Accessible components (WCAG compliant)
- Fast loading times and smooth transitions

## 🔧 Development

### Building for Production

**Backend:**
```bash
cd Backend
pnpm run build
pnpm start
```

**Frontend:**
```bash
cd Frontend
npm run build
```

The built files will be in the `dist` folder and can be deployed to any static hosting service.

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Zod for runtime validation

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env file
- Ensure database exists and migrations are applied

### Port Already in Use
- Backend: Change PORT in .env file
- Frontend: Vite will automatically use next available port

### Authentication Errors
- Verify JWT_SECRET is set in backend .env
- Check token expiration (default: 7 days)
- Clear localStorage if experiencing persistent issues

## 📝 License

This project is developed as part of an educational/organizational initiative.

## 🤝 Support

For issues, questions, or contributions, please contact the development team or create an issue in the repository.

---

Built with ❤️ for efficient workforce management