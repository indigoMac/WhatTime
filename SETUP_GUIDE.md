# WhatTime Outlook Add-in Setup Guide

## 🚀 Complete Setup Instructions

Follow these steps in order to get your add-in working.

## 1. Prerequisites

- **Node.js 18+** installed
- **PostgreSQL** database (local or cloud)
- **ngrok** for development HTTPS tunnel
- **Microsoft 365** account for testing

```bash
# Install ngrok
brew install ngrok
# OR
npm install -g ngrok

# Verify installations
node --version
npm --version
ngrok --version
```

## 2. Microsoft Azure App Registration

### Step 1: Create Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **"New registration"**
4. Fill in:
   - **Name**: `WhatTime Outlook Add-in`
   - **Supported account types**: `Accounts in any organizational directory and personal Microsoft accounts`
   - **Redirect URI**: Leave blank for now

### Step 2: Configure Permissions

1. Go to **API permissions**
2. Click **"Add a permission"** > **Microsoft Graph** > **Delegated permissions**
3. Add these permissions:
   - `User.Read`
   - `Calendars.Read`
   - `Calendars.Read.Shared`
   - `offline_access`
4. Click **"Grant admin consent"** (if you're an admin)

### Step 3: Get Credentials

1. Go to **Overview** tab and copy:
   - **Application (client) ID**
   - **Directory (tenant) ID**
2. Go to **Certificates & secrets**
3. Click **"New client secret"**
4. Copy the **secret value** (not the ID)

### Step 4: Add Redirect URIs (after ngrok setup)

1. Go to **Authentication**
2. Click **"Add a platform"** > **Web**
3. Add these redirect URIs:
   - `https://YOUR_NGROK_URL.ngrok-free.app/api/auth/microsoft/callback`
   - `http://localhost:8000/api/auth/microsoft/callback` (for future local testing)

## 3. Database Setup

Choose one option:

### Option A: Local PostgreSQL (Recommended)

```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
psql postgres
CREATE DATABASE whattime_dev;
CREATE USER whattime WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE whattime_dev TO whattime;
\q
```

### Option B: Docker PostgreSQL

```bash
docker run --name whattime-postgres \
  -e POSTGRES_DB=whattime_dev \
  -e POSTGRES_USER=whattime \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15
```

### Option C: Cloud Database (Supabase/Railway/Neon)

1. Sign up for [Supabase](https://supabase.com), [Railway](https://railway.app), or [Neon](https://neon.tech)
2. Create a new PostgreSQL database
3. Copy the connection string

## 4. Environment Variables

### Backend Environment Variables (.env)

Create `backend/.env` file:

```env
# ===========================================
# DATABASE CONFIGURATION
# ===========================================
DATABASE_URL=postgresql://whattime:password@localhost:5432/whattime_dev

# ===========================================
# API CONFIGURATION
# ===========================================
API_PORT=8000
NODE_ENV=development
DEBUG=true
LOG_LEVEL=INFO

# JWT Secret (generate a random string)
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production-abc123xyz789
JWT_EXPIRES_IN=7d

# ===========================================
# FRONTEND URLS (UPDATE WITH YOUR NGROK URL)
# ===========================================
FRONTEND_URL=https://YOUR_NGROK_URL.ngrok-free.app
API_URL=https://YOUR_NGROK_URL.ngrok-free.app
OUTLOOK_ADDIN_URL=https://YOUR_NGROK_URL.ngrok-free.app

# ===========================================
# MICROSOFT OAUTH (FROM AZURE APP REGISTRATION)
# ===========================================
MICROSOFT_CLIENT_ID=your_microsoft_client_id_from_azure
MICROSOFT_TENANT_ID=your_microsoft_tenant_id_from_azure
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_from_azure
MICROSOFT_REDIRECT_URI=https://YOUR_NGROK_URL.ngrok-free.app/api/auth/microsoft/callback

# ===========================================
# SESSION CONFIGURATION
# ===========================================
SESSION_SECRET=your-session-secret-key-change-this-in-production-def456uvw

# ===========================================
# DEVELOPMENT FLAGS
# ===========================================
ENABLE_CORS=true
ENABLE_DOCS=true
ENABLE_HTTPS=false
```

### Frontend Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://YOUR_NGROK_URL.ngrok-free.app/api
```

## 5. Start ngrok Tunnel

```bash
# In a separate terminal, run ngrok
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`) and:

1. **Update your environment variables** with this URL
2. **Add to Azure redirect URIs**
3. **Update manifest.xml** URLs

## 6. Update Manifest URLs

Edit `frontend/manifest.xml` and replace all `http://localhost:3000` with your ngrok URL:

```xml
<!-- Update these URLs -->
<IconUrl DefaultValue="https://YOUR_NGROK_URL.ngrok-free.app/assets/icon-32.png" />
<HighResolutionIconUrl DefaultValue="https://YOUR_NGROK_URL.ngrok-free.app/assets/icon-64.png" />
<SupportUrl DefaultValue="https://YOUR_NGROK_URL.ngrok-free.app/support" />

<!-- And in the Resources section -->
<bt:Url id="Commands.Url" DefaultValue="https://YOUR_NGROK_URL.ngrok-free.app/commands/" />
<bt:Url id="Taskpane.Url" DefaultValue="https://YOUR_NGROK_URL.ngrok-free.app/taskpane/" />
<bt:Url id="MobileTaskpane.Url" DefaultValue="https://YOUR_NGROK_URL.ngrok-free.app/taskpane/" />
```

## 7. Install Dependencies & Run

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Go back to root
cd ..
```

## 8. Database Migration

```bash
# Run database migrations
cd backend
npm run db:generate
npm run db:migrate
cd ..
```

## 9. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# OR start individually:
# Backend: npm run dev:backend
# Frontend: npm run dev:frontend
```

You should see:

- ✅ Database connection successful
- 🚀 WhatTime API server running on port 8000
- Frontend running on port 3000

## 10. Test the Add-in

### Upload Manifest to Outlook

1. Open [Outlook Web](https://outlook.office.com)
2. Go to **Settings** (gear icon) > **View all Outlook settings**
3. Navigate to **General** > **Manage add-ins**
4. Click **"Add a custom add-in"** > **"Add from file"**
5. Upload your `frontend/manifest.xml` file

### Test Authentication

1. Open an email or calendar event in Outlook
2. Look for the **WhatTime** button in the ribbon
3. Click it to open the task pane
4. Click **"Connect Microsoft Calendar"**
5. Complete the OAuth flow

## 🔍 Troubleshooting

### Common Issues:

**OAuth Error: "redirect_uri_mismatch"**

- Check that your ngrok URL is added to Azure redirect URIs
- Ensure environment variables match your ngrok URL

**Database Connection Failed**

- Verify PostgreSQL is running: `brew services list | grep postgresql`
- Check DATABASE_URL format: `postgresql://user:password@host:port/database`

**Manifest Upload Failed**

- Ensure all URLs in manifest.xml use HTTPS (ngrok URL)
- Check XML syntax is valid

**CORS Errors**

- Verify FRONTEND_URL environment variable matches ngrok URL
- Check CORS settings in backend/src/index.ts

**Token Validation Failed**

- Ensure JWT_SECRET_KEY is set and consistent
- Check that environment variables are loaded

### Environment Variable Checklist:

✅ **Required for OAuth:**

- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `MICROSOFT_TENANT_ID`
- `MICROSOFT_REDIRECT_URI`

✅ **Required for Database:**

- `DATABASE_URL`

✅ **Required for JWT:**

- `JWT_SECRET_KEY`

✅ **Required for CORS:**

- `FRONTEND_URL`
- `API_URL`

## 🎉 Success!

If everything is working:

1. You can open the add-in in Outlook
2. Successfully authenticate with Microsoft
3. See the connected calendar status
4. Backend shows successful database connection

## Next Steps

- Set up production deployment
- Configure custom domain
- Add SSL certificates
- Deploy to cloud hosting

## Need Help?

Check the console logs for detailed error messages:

- Backend: Terminal running `npm run dev:backend`
- Frontend: Browser developer tools
- Database: Check PostgreSQL logs
