# Sattis App

A comprehensive appointment management system for beauty salons and professional services. Built with Next.js 15, TypeScript, and modern React patterns.

## 🚀 Features

### Core Functionality
- **Appointment Management**: Create, view, and manage appointments with filtering and search capabilities
- **Professional Management**: Admin-only access to manage service professionals
- **Service Management**: Complete CRUD operations for salon services
- **Dashboard Analytics**: Real-time insights with charts and statistics
- **History Tracking**: Complete appointment history with status tracking
- **Role-based Access Control**: Different permissions for admins and regular users

### Technical Features
- **Modern UI**: Built with Radix UI components and Tailwind CSS
- **Authentication**: Secure login system with NextAuth.js
- **Responsive Design**: Mobile-first approach with responsive components
- **Real-time Updates**: Dynamic data fetching and state management
- **Type Safety**: Full TypeScript implementation
- **Performance**: Optimized with Next.js 15 and Turbopack

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **React 18** - Latest React features
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### UI Components
- **shadcn/ui** - Modern component library
- **Recharts** - Data visualization charts
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **date-fns** - Date manipulation

### Authentication & State
- **NextAuth.js** - Authentication solution
- **React Context** - State management
- **Local Storage** - Client-side data persistence

## 📁 Project Structure

```
sattis-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Main dashboard pages
│   │   │   ├── appointments/  # Appointment management
│   │   │   ├── services/      # Service management
│   │   │   ├── professionals/ # Professional management
│   │   │   ├── history/       # Appointment history
│   │   │   └── dashboard/     # Analytics dashboard
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   └── *.tsx            # Feature-specific components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
└── package.json             # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Access to the Sattis API

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sattis-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=your_api_url_here
   AUTH_SECRET=your_auth_secret_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔐 Authentication

The app uses NextAuth.js with credentials provider. Users can log in with their email and password, and the system supports role-based access control:

- **Admin Users**: Full access to all features including service and professional management
- **Regular Users**: Access to appointments and dashboard features

## 📊 Dashboard Features

### Analytics Overview
- Appointment statistics with date range filtering
- Revenue tracking and visualization
- Service performance metrics
- Professional workload analysis

### Appointment Management
- View all confirmed appointments
- Filter by date, service, and professional
- Real-time status updates
- Bulk operations support

### Service Management (Admin Only)
- Create, edit, and delete services
- Set pricing and duration
- Service categorization
- Availability management

### Professional Management (Admin Only)
- Add and manage service professionals
- Assign services to professionals
- Professional availability settings
- Performance tracking

## 🎨 UI/UX Features

- **Dark/Light Mode**: Theme switching capability
- **Responsive Design**: Works seamlessly on all devices
- **Loading States**: Skeleton loaders for better UX
- **Toast Notifications**: User feedback system
- **Form Validation**: Real-time validation with Zod
- **Accessibility**: WCAG compliant components

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS v4 with custom configuration for consistent styling.

### TypeScript
Strict TypeScript configuration with path aliases for better import management.

### Next.js
Optimized configuration with Turbopack for faster development builds.

## 📱 Mobile Support

The application is fully responsive and includes:
- Mobile-optimized navigation
- Touch-friendly interfaces
- Responsive data tables
- Mobile-specific components

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Environment Variables for Production
Ensure all required environment variables are set in your production environment:
- `NEXT_PUBLIC_API_URL`
- `AUTH_SECRET`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is under the MIT license. See the `LICENSE` file for more details.
---


## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Version**: 1.0.1  
**Last Updated**: 2025 


Developed with ❤️ for Sattis Studio 
