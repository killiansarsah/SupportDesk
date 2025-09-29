# Database Connection Setup Guide

## 🚀 Quick Start

### Option 1: Automatic Startup (Recommended)
```bash
# Double-click this file or run in terminal:
start-system.bat
```

### Option 2: Manual Startup
```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend  
npm run dev
```

## 🔍 Connection Testing

### Test Backend Connection
```bash
npm run test-connection
```

### Manual Health Check
Open in browser: http://localhost:3002/api/health

## 🛠️ Troubleshooting

### Backend Won't Start
1. **Check Node.js**: `node --version` (need v18+)
2. **Install Dependencies**: 
   ```bash
   cd backend
   npm install
   ```
3. **Check MongoDB URI**: Verify `.env` file in backend folder
4. **Port Conflict**: Make sure port 3002 is available

### Database Connection Issues
1. **MongoDB Atlas**: Check if IP is whitelisted
2. **Network**: Verify internet connection
3. **Credentials**: Check MongoDB URI in `backend/.env`

### Frontend Connection Issues
1. **Backend Running**: Ensure backend is on port 3002
2. **CORS**: Backend configured for localhost:5173
3. **Firewall**: Check if ports 3002/5173 are blocked

## 📊 Connection Status

The app shows real-time connection status in the header:
- 🟢 **Connected**: Backend + Database OK
- 🟡 **DB Issue**: Backend OK, Database problem  
- 🔴 **Offline**: Backend not reachable

## 🔧 Configuration Files

### Backend Environment (backend/.env)
```env
MONGODB_URI=mongodb+srv://SupportDeskdb:SupportDeskdb123@supportdesk.rkyqlqg.mongodb.net/?retryWrites=true&w=majority&appName=SupportDesk
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
PORT=3002
NODE_ENV=development
```

### API Endpoints
- Health: `GET /api/health`
- Login: `POST /api/auth/login`
- Tickets: `GET /api/tickets`
- Users: `GET /api/users`

## 🎯 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | password123 |
| Agent | agent@company.com | password123 |
| Customer | customer@email.com | password123 |

## 📱 Application URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3002/api
- **Health Check**: http://localhost:3002/api/health

## 🆘 Common Issues

### "Cannot connect to server"
- Backend not running → Run `cd backend && npm run dev`
- Wrong port → Check if using port 3002
- Firewall blocking → Allow ports 3002, 5173

### "Database connection failed"  
- MongoDB Atlas down → Check MongoDB Atlas status
- Wrong credentials → Verify MONGODB_URI
- Network issues → Check internet connection

### "CORS Error"
- Backend CORS configured for localhost:5173
- If using different port, update backend/server.js

## 🔄 Data Flow

1. **Frontend** (React) → **Backend** (Express) → **Database** (MongoDB)
2. **Fallback**: If backend fails, app uses localStorage
3. **Real-time**: Connection status monitored every 30 seconds

## 📞 Support

If issues persist:
1. Check browser console for errors
2. Check backend terminal for error messages  
3. Run connection test: `npm run test-connection`
4. Verify all services are running on correct ports