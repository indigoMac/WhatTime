# WhatTime - Outlook Add-in for Smart Meeting Scheduling

WhatTime is a Microsoft Outlook add-in that optimizes meeting scheduling with smart calendar insights and Microsoft Graph API integration.

## Project Structure

```
whattime/
├── frontend/               # Next.js React frontend for the add-in
│   ├── app/
│   │   ├── taskpane/      # Main add-in interface
│   │   ├── commands/      # UI-less command functions
│   │   └── auth/          # OAuth callback pages
│   ├── components/ui/     # Reusable UI components
│   ├── lib/              # Authentication store and API client
│   ├── manifest.xml      # Outlook add-in manifest
│   └── next.config.mjs   # Next.js configuration
├── backend/               # Express.js backend API
│   ├── src/
│   │   ├── auth/         # Authentication services
│   │   ├── routes/       # API route handlers
│   │   ├── db/           # Database schema and migrations
│   │   └── index.ts      # Express server entry point
│   └── drizzle.config.ts # Database configuration
└── docs/                 # Additional documentation
```

## Features

- **Microsoft OAuth Integration**: Secure authentication with Microsoft accounts
- **JWT Token Management**: Secure session handling with refresh tokens
- **Calendar Integration**: Access to Microsoft Calendar via Graph API
- **Smart Scheduling**: Find optimal meeting times across multiple calendars
- **Availability Checking**: Check participant availability
- **Conflict Detection**: Identify and resolve calendar conflicts

## Technology Stack

### Frontend

- **Next.js 15** - React framework with static export support
- **TypeScript** - Type safety and development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management for authentication
- **Axios** - HTTP client for API requests
- **Custom UI Components** - Built-in components for consistency

### Backend

- **Express.js** - Web application framework
- **TypeScript** - Type safety across the stack
- **Drizzle ORM** - Database ORM with PostgreSQL
- **MSAL Node** - Microsoft authentication library
- **JWT** - Token-based authentication
- **CORS & Security** - Cross-origin and security middleware

### Database

- **PostgreSQL** - Reliable relational database
- **Drizzle ORM** - Type-safe database operations

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Microsoft Azure App Registration

### Environment Setup

1. **Backend Environment** (`.env` in `/backend`):

```env
DATABASE_URL=postgresql://username:password@localhost:5432/whattime
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret
MICROSOFT_CLIENT_ID=your_azure_app_client_id
MICROSOFT_CLIENT_SECRET=your_azure_app_client_secret
MICROSOFT_TENANT_ID=your_azure_tenant_id
CORS_ORIGIN=http://localhost:3000
PORT=5000
```

2. **Frontend Environment** (`.env.local` in `/frontend`):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NODE_ENV=development
```

### Installation & Development

1. **Install Dependencies**:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install --legacy-peer-deps
```

2. **Database Setup**:

```bash
cd backend
npm run db:migrate
```

3. **Start Development Servers**:

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run addin:dev
```

### Microsoft Azure Setup

1. Register your application in Azure Portal
2. Configure redirect URIs:
   - `http://localhost:3000/auth/success`
   - `http://localhost:3000/auth/error`
3. Grant Microsoft Graph API permissions:
   - `Calendars.ReadWrite`
   - `User.Read`
   - `offline_access`

### Outlook Add-in Installation

1. Load the manifest in Outlook:

   - Go to Outlook → Get Add-ins → My add-ins → Custom add-ins
   - Choose "Add from file" and select `frontend/manifest.xml`

2. For development, ensure the frontend is running on `http://localhost:3000`

## API Endpoints

### Authentication

- `GET /api/auth/microsoft` - Get Microsoft OAuth URL
- `GET /api/auth/microsoft/callback` - Handle OAuth callback
- `POST /api/auth/refresh` - Refresh JWT tokens
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Calendar (Future Implementation)

- `GET /api/calendar/connections` - Get connected calendars
- `GET /api/calendar/events` - Get calendar events
- `GET /api/calendar/free-busy` - Check availability

## Database Schema

### Users Table

- `id` - Primary key
- `email` - User email address
- `name` - User display name
- `microsoft_id` - Microsoft Graph user ID
- `created_at` / `updated_at` - Timestamps

### Calendar Connections Table

- `id` - Primary key
- `user_id` - Foreign key to users
- `provider` - Calendar provider (microsoft)
- `email` - Calendar email
- `access_token` - Encrypted OAuth token
- `refresh_token` - Encrypted refresh token
- `expires_at` - Token expiration
- `created_at` / `updated_at` - Timestamps

## Security Features

- **CORS Protection** - Configured for specific origins
- **Rate Limiting** - API request throttling
- **Helmet Security** - Security headers and CSP
- **JWT Authentication** - Secure token-based auth
- **Token Encryption** - Sensitive data encryption
- **Input Validation** - Request data validation

## Development Scripts

### Backend

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:migrate` - Run database migrations

### Frontend

- `npm run addin:dev` - Start add-in development server
- `npm run addin:build` - Build add-in for production
- `npm run dev` - Standard Next.js development
- `npm run build` - Build for production

## Production Deployment

### Backend Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy to hosting service (Railway, Heroku, etc.)

### Frontend Deployment

1. Update `frontend/manifest.xml` with production URLs
2. Build static files: `npm run addin:build`
3. Deploy to static hosting (Vercel, Netlify, etc.)
4. Update Office add-in manifest with production URLs

## Architecture Notes

### Authentication Flow

1. User clicks "Connect Microsoft Calendar"
2. Frontend opens Microsoft OAuth window
3. User authenticates and grants permissions
4. OAuth callback creates user and calendar connection
5. JWT tokens are issued and stored securely
6. Frontend receives user session and updates state

### State Management

- **Zustand Store** - Handles authentication state
- **React Query** - Server state management (future)
- **Local Storage** - Persistent auth token storage

### Component Architecture

- **Taskpane** - Main add-in interface
- **UI Components** - Reusable, typed components
- **Auth Pages** - OAuth success/error handling
- **Commands** - UI-less add-in functions

## Future Enhancements

- [ ] Calendar event creation and editing
- [ ] Smart meeting time suggestions
- [ ] Participant availability matrix
- [ ] Meeting conflict resolution
- [ ] Calendar synchronization
- [ ] Recurring meeting optimization
- [ ] Integration with Teams/Zoom
- [ ] Email scheduling templates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:

- Create an issue in the GitHub repository
- Check the troubleshooting section in `/docs`
- Review Microsoft Office Add-ins documentation
