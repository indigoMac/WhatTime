# WhatTime - Microsoft Outlook Add-in for Meeting Scheduling

WhatTime is a Microsoft Outlook add-in that streamlines meeting scheduling with intelligent time selection, participant management, and email-based availability collection.

## 🏗️ Project Architecture

This project consists of **three main components**:

```
WhatTime/
├── whattime/              # 📱 Office Add-in (Main Application)
│   ├── src/
│   │   ├── taskpane/     # Add-in interface (HTML/CSS/TypeScript)
│   │   ├── middle-tier/  # Express server + Microsoft Graph SSO
│   │   ├── commands/     # Outlook command functions
│   │   └── helpers/      # Utility functions
│   ├── manifest.xml      # Office Add-in manifest
│   └── dist/            # Compiled files
├── backend/              # 🚀 Express.js API Server
│   ├── src/
│   │   ├── auth/        # Authentication & Microsoft OAuth
│   │   ├── routes/      # REST API endpoints
│   │   ├── database/    # Drizzle ORM + PostgreSQL
│   │   ├── calendar/    # Microsoft Graph integration
│   │   └── types/       # TypeScript definitions
│   └── drizzle.config.ts
└── whattime_example/     # 🎨 Next.js UI Reference
    ├── app/create/      # Meeting creation interfaces
    ├── components/ui/   # React UI components
    └── hooks/          # React hooks (for reference)
```

## ✅ Current Status (Phase 1.2 Complete)

### Working Features

- **Office Add-in**: Running on localhost:3000 with HTTPS
- **Microsoft Graph SSO**: Environment-based authentication (mock for dev, real for production)
- **Backend API**: Express.js server on port 8000 with PostgreSQL database
- **Database**: User creation/lookup with JWT authentication
- **ngrok Integration**: External access for Outlook testing

### Authentication Flow (✅ Working)

1. Office Add-in loads in Outlook
2. User clicks authentication button
3. SSO connects to Microsoft Graph (production) or uses mock data (development)
4. Profile sent to backend API (`/api/auth/microsoft/profile`)
5. Backend creates/updates user in PostgreSQL database
6. JWT tokens returned and stored in localStorage

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Microsoft Azure app registration (for production SSO)

### 1. Environment Setup

Create `.env` files:

**Backend** (`.env` in `/backend`):

```env
DATABASE_URL=postgresql://username:password@localhost:5432/whattime
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret
MICROSOFT_CLIENT_ID=your_azure_app_client_id
MICROSOFT_CLIENT_SECRET=your_azure_app_client_secret
MICROSOFT_TENANT_ID=your_azure_tenant_id
PORT=8000
NODE_ENV=development
```

**Office Add-in** (`.env` in `/whattime`):

```env
HTTPS=true
PORT=3000
```

### 2. Installation

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install Office Add-in dependencies
cd ../whattime
npm install

# Install example frontend dependencies (optional)
cd ../whattime_example
npm install
```

### 3. Database Setup

```bash
cd backend
npm run db:migrate
npm run dev  # Start backend server
```

### 4. Start Office Add-in

```bash
cd whattime
npm start  # Starts HTTPS server on port 3000
```

### 5. ngrok Setup (for Outlook testing)

```bash
# In new terminal
ngrok http https://localhost:3000

# Update manifest.xml with ngrok URL
# Load manifest in Outlook: Get Add-ins → My add-ins → Custom add-ins
```

## 🛠️ Development

### Backend Server (Port 8000)

```bash
cd backend
npm run dev     # Start with hot reload
npm run build   # Build for production
npm start       # Start production server
```

**API Endpoints:**

- `GET /health` - Health check
- `POST /api/auth/microsoft/profile` - User authentication
- `GET /api/auth/me` - Current user info
- `POST /api/auth/logout` - Logout

### Office Add-in (Port 3000)

```bash
cd whattime
npm start           # Build and start with HTTPS
npm run dev-server  # Start server only (no auto-sideload)
npm run build       # Build for production
```

**Key Files:**

- `src/taskpane/taskpane.html` - Main add-in interface
- `src/taskpane/taskpane.ts` - Add-in logic and API calls
- `src/middle-tier/app.ts` - Express server with SSO helpers
- `manifest.xml` - Office Add-in configuration

### Testing Commands

```bash
# Check servers
curl -k https://localhost:3000/taskpane.html  # Office Add-in
curl http://localhost:8000/health             # Backend API

# Validate manifest
npx office-addin-manifest validate whattime/manifest.xml

# Test authentication
curl -X POST http://localhost:8000/api/auth/microsoft/profile \
  -H "Content-Type: application/json" \
  -d '{"profile":{"email":"test@example.com","displayName":"Test User"}}'
```

## 🎯 Development Roadmap

### ✅ Phase 1: Foundation & Authentication (COMPLETED)

- Office Add-in infrastructure
- Microsoft Graph SSO integration
- Backend API connection
- User authentication flow

### 🎯 Phase 2: Core Meeting Management (NEXT)

- Replace welcome screen with meeting creation form
- Port UI components from Next.js example to Office Add-in
- Implement time zone handling and participant management
- Connect to backend meeting APIs

### 🎯 Phase 3: Response Management System

- Email generation with interactive time grids
- Response collection and tracking
- Dashboard with pending/upcoming meetings
- Analytics and availability visualization

### 🎯 Phase 4: Advanced Features

- Meeting confirmation and calendar integration
- Conflict detection and resolution
- Advanced analytics and optimization
- Responsive design improvements

### 🎯 Phase 5: Production Deployment

- Production infrastructure setup
- Security hardening and testing
- Documentation and user training
- Monitoring and backup systems

## 🏢 Meeting Management Features (Planned)

### Core Features

- **Meeting Creation**: Title, description, location, duration (15-120 minutes)
- **Time Zone Support**: 15 different zones (ET, CT, MT, PT, GMT, BST, CET, EET, MSK, GST, IST, CST Asia, JST, AEST, NZST)
- **Participant Groups**: Organize attendees by project, department, or role
- **Location Integration**: Quick-add for Zoom, Teams, Webex
- **Email Requests**: HTML emails with interactive availability grids

### Advanced Features

- **Response Tracking**: Real-time availability collection
- **Conflict Detection**: Identify scheduling conflicts
- **Analytics**: Response rates, availability heatmaps
- **Smart Suggestions**: Optimal meeting time recommendations

## 🔧 Technology Stack

### Office Add-in

- **TypeScript** - Type-safe development
- **HTML/CSS** - Custom add-in interface
- **Microsoft Graph** - Office 365 integration
- **Express.js** - Local server for SSO
- **Webpack** - Build and bundling

### Backend API

- **Express.js** - Web application framework
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens
- **Microsoft Graph** - Calendar and user APIs

### Development Tools

- **ngrok** - Local tunnel for Outlook testing
- **HTTPS** - Required for Office Add-ins
- **Git** - Version control with clean commit history

## 📋 Project Status

- **Environment**: Development mode with mock SSO data
- **Database**: PostgreSQL with user management working
- **Authentication**: Full SSO flow implemented and tested
- **UI**: Currently showing welcome screen (next: meeting creation form)
- **API**: Backend endpoints working, ready for meeting management features

## 🤝 Contributing

1. Read `DEVELOPMENT_PLAN.md` for detailed technical context
2. Check current phase and pick up specific tasks
3. Test both Office Add-in and backend API after changes
4. Update development plan with progress
5. Follow conventional commit messages

## 📄 License

[License information to be added]

---

**Last Updated**: Phase 1.2 COMPLETED - Authentication integration working  
**Next Milestone**: Phase 1.3 - UI Component Analysis and Migration  
**Current Focus**: Replace welcome screen with meeting creation interface
