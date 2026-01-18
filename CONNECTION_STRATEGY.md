# Connection Stability Strategy - Implementation Guide

## ✅ Implemented Improvements

### 1. **Enhanced API Client** ([src/utils/apiClient.js](frontend/src/utils/apiClient.js))
- ✅ **Request Timeout**: 10-second timeout prevents hanging requests
- ✅ **Automatic Retry**: Up to 3 retries with exponential backoff
- ✅ **Network Error Handling**: Graceful handling of network failures
- ✅ **Token Management**: Automatic token refresh and expiration handling
- ✅ **Health Check**: Backend connectivity verification

### 2. **Connection Monitoring** ([src/hooks/useConnectionMonitor.js](frontend/src/hooks/useConnectionMonitor.js))
- ✅ **Periodic Health Checks**: Every 30 seconds
- ✅ **Online/Offline Events**: Automatic detection of network changes
- ✅ **Real-time Status**: Live connection status tracking

### 3. **Visual Feedback** ([src/components/ConnectionStatus.jsx](frontend/src/components/ConnectionStatus.jsx))
- ✅ **Warning Banner**: Shows when backend is unreachable
- ✅ **User Notification**: Clear message about connection status

### 4. **Vite Proxy Configuration** ([vite.config.js](frontend/vite.config.js))
- ✅ **Development Proxy**: Routes `/api` and `/health` to backend
- ✅ **Request Logging**: Debugging support for development
- ✅ **CORS Handling**: Prevents CORS issues in development

### 5. **Improved Auth Context** ([src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx))
- ✅ **Network Error Handling**: Distinguishes between auth and network errors
- ✅ **Auto Logout**: Token expiration handling
- ✅ **Better Error Messages**: User-friendly error messages

---

## 🚀 How to Use

### 1. Install Dependencies
\`\`\`bash
cd frontend
npm install
\`\`\`

### 2. Start Backend (First!)
\`\`\`bash
cd "java backend"
mvn spring-boot:run
# Or if already compiled:
java -jar target/chess-backend-0.0.1-SNAPSHOT.jar
\`\`\`

### 3. Start Frontend
\`\`\`bash
cd frontend
npm run dev
\`\`\`

---

## 📋 Connection Stability Strategies

### **Strategy 1: Request Retry with Exponential Backoff**
- Failed requests automatically retry up to 3 times
- Delay increases: 1s → 2s → 3s
- Only retries on network/server errors, not client errors (4xx)

### **Strategy 2: Request Timeout**
- All requests timeout after 10 seconds
- Prevents infinite waiting on slow/dead connections
- User gets clear timeout error message

### **Strategy 3: Connection Health Monitoring**
- Backend health checked every 30 seconds
- Visual warning when connection is lost
- Automatic recovery detection

### **Strategy 4: Network Event Handling**
- Listens to browser online/offline events
- Immediate notification when network changes
- Auto re-check when connection restored

### **Strategy 5: Smart Token Management**
- Expired tokens trigger auto-logout
- Token persisted in localStorage
- Prevents unnecessary re-login on page refresh

### **Strategy 6: Development Proxy**
- Vite proxies API calls to backend
- Prevents CORS issues during development
- Easier debugging with request logging

---

## 🔧 Configuration Options

### Adjust Timeout Duration
In [src/utils/apiClient.js](frontend/src/utils/apiClient.js):
\`\`\`javascript
const REQUEST_TIMEOUT = 10000 // Change to desired milliseconds
\`\`\`

### Adjust Retry Attempts
\`\`\`javascript
const MAX_RETRIES = 3 // Change number of retries
const RETRY_DELAY = 1000 // Base delay in ms
\`\`\`

### Adjust Health Check Frequency
In [src/components/ConnectionStatus.jsx](frontend/src/components/ConnectionStatus.jsx):
\`\`\`javascript
const { isConnected } = useConnectionMonitor(30000) // 30 seconds
\`\`\`

### Change Backend URL
Create `.env` file in frontend folder:
\`\`\`
VITE_API_BASE=http://localhost:8080
\`\`\`

---

## 🛡️ Backend Stability (Already Configured)

Your backend already has good connection pooling in [application.yml](java backend/src/main/resources/application.yml):

\`\`\`yaml
datasource:
  hikari:
    keepaliveTime: 300000      # 5 min keepalive
    idleTimeout: 600000        # 10 min before idle release
    maxLifetime: 1800000       # 30 min connection recycle
    minimumIdle: 2             # Keep 2 connections ready
    maximumPoolSize: 10        # Max 10 concurrent connections
\`\`\`

---

## 🧪 Testing Connection Resilience

### Test 1: Backend Restart
1. Start both frontend and backend
2. Stop backend (Ctrl+C)
3. ⚠️ Red warning banner should appear
4. Try to login → See "Cannot connect to server" error
5. Restart backend
6. ✅ Warning banner disappears within 30 seconds

### Test 2: Network Interruption
1. Open DevTools → Network Tab
2. Select "Offline" from throttling dropdown
3. ⚠️ Warning banner appears
4. Select "No throttling"
5. ✅ Connection restored automatically

### Test 3: Slow Network
1. DevTools → Network → "Slow 3G"
2. Requests will retry if they timeout
3. User sees timeout message if server too slow

---

## 📊 Error Messages You'll See

### Good Connection
- No banners or warnings
- Login/register works normally

### Backend Down
- 🔴 Red banner: "Backend connection lost"
- Login error: "Cannot connect to server. Please check if backend is running."

### Network Issues
- Automatic retries in console: "Request failed, retrying (1/3)..."
- After 3 failures: "Network error - please check your connection"

### Token Expired
- Auto logout
- Message: "Token expired or invalid"
- Redirected to login

---

## 🎯 Best Practices

1. **Always start backend before frontend**
2. **Check console for connection errors**
3. **Monitor the red warning banner**
4. **Clear localStorage if having auth issues**: `localStorage.clear()`
5. **Use browser DevTools Network tab** to debug API calls

---

## 🔍 Troubleshooting

### Frontend can't connect to backend
1. Check backend is running: `http://localhost:8080/health`
2. Check CORS in [SecurityConfig.java](java backend/src/main/java/com/chessopening/config/SecurityConfig.java)
3. Verify Vite proxy in [vite.config.js](frontend/vite.config.js)

### Requests timing out
1. Check database is running
2. Check backend logs for errors
3. Increase timeout in apiClient.js if needed

### Connection banner won't disappear
1. Check health endpoint: `curl http://localhost:8080/health`
2. Check browser console for errors
3. Manually refresh connection

---

## 📝 Summary

Your application now has:
- ✅ Automatic request retries
- ✅ Timeout protection
- ✅ Connection monitoring
- ✅ Visual status indicators
- ✅ Smart error handling
- ✅ Development proxy

This ensures a **stable, reliable connection** between your frontend and backend! 🎉
