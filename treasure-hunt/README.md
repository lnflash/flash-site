# 🏴‍☠️ Keys of the Caribbean - Public Pages

**PUBLIC REPOSITORY** - This contains only the marketing and informational pages for the treasure hunt.

## ⚠️ Important

**NO backend logic or sensitive data should be in this directory.**

All game logic, puzzles, API endpoints, and database operations are in the **private backend repository**.

## 📁 Directory Contents

### ✅ **Keep These Files** (Public)

```
/treasure-hunt/
├── index.html              # Landing page
├── register.html           # Registration form (UI only)
├── leaderboard.html        # Leaderboard display (UI only)
├── rules.html              # Official rules (TO CREATE)
├── css/
│   ├── hunt.css           # Base styles
│   ├── register.css       # Registration styles
│   └── leaderboard.css    # Leaderboard styles
├── js/
│   ├── hunt.js            # Landing page logic
│   ├── register.js        # Registration UI
│   └── leaderboard.js     # Leaderboard UI
├── DEPLOYMENT.md          # Deployment guide
└── README.md              # This file
```

### ❌ **DELETE These Files** (Move to Private Repo)

Before deploying to production, **remove**:

```
❌ /api/                    # All backend logic
❌ schema.sql               # Database schema
❌ dashboard.html           # Protected dashboard
❌ rabbithole.html          # Stage 1 page
❌ css/dashboard.css        # Dashboard styles
❌ css/stage.css           # Stage styles
❌ js/dashboard.js          # Dashboard logic
❌ js/rabbithole.js         # Stage 1 logic
```

These files have been **moved to**: `/Users/dread/Documents/Island-Bitcoin/Flash/kotc-server/`

## 🔗 API Configuration

All JavaScript files have been updated to point to the **private backend server**:

```javascript
const API_BASE = 'https://hunt-api.getflash.io/api';
```

### API Endpoints Used

The public pages make requests to these backend endpoints:

- `POST /api/register.php` - Hunter registration
- `GET /api/leaderboard.php` - Leaderboard data
- `POST /api/verify-session.php` - Session validation

## 🚀 Deployment Checklist

Before deploying to `getflash.io/treasure-hunt/`:

1. **Update API URL** if using different subdomain:
   ```javascript
   // In hunt.js, register.js, leaderboard.js
   const API_BASE = 'https://YOUR-SUBDOMAIN.getflash.io/api';
   ```

2. **Remove private files**:
   ```bash
   rm -rf api/
   rm schema.sql dashboard.html rabbithole.html
   rm css/dashboard.css css/stage.css
   rm js/dashboard.js js/rabbithole.js
   ```

3. **Create rules page**:
   - Copy template from sponsor deck
   - Include legal disclaimers
   - Add age verification notice

4. **Test CORS**:
   ```bash
   # From browser console on getflash.io
   fetch('https://hunt-api.getflash.io/api/leaderboard.php')
     .then(r => r.json())
     .then(console.log)
   ```

5. **Verify SSL**:
   - Ensure both main site and API server use HTTPS
   - Check certificate validity

## 📊 Features

### Landing Page (`index.html`)
- Hero section with hunt overview
- 7-stage breakdown
- Prize information
- Leaderboard preview
- CTA to register

### Registration (`register.html`)
- Username/email collection
- Satoshi trivia validation (frontend only - backend validates)
- Terms agreement
- Auto-redirect to backend dashboard on success

### Leaderboard (`leaderboard.html`)
- Real-time rankings
- Filter by stage
- Sort options
- Hall of Heroes section
- Auto-refresh every 30s

## 🎨 Branding

Uses **Keys of the Caribbean** brand kit:
- **Colors**: Rich Black (#0B0E11), Deep Teal (#053B44), Flash Green (#41AD49), Gold Accent (#F6C453)
- **Typography**: Urbanist (headlines), Inter (body)
- **Consistent visual language** across all pages

## 🔒 Security Notes

- **No secrets in frontend code** ✅
- **No direct database access** ✅
- **All sensitive operations on backend** ✅
- **CORS configured on backend** ✅
- **HTTPS required** ✅

## 📱 Responsive Design

All pages are mobile-responsive:
- Landing page: Mobile-first design
- Registration: Touch-friendly forms
- Leaderboard: Horizontal scroll for stage progress

## 🐛 Debugging

### Common Issues

**Problem**: API calls fail with CORS error
```
Solution: Backend CORS not configured. Check api/config.php on backend server.
```

**Problem**: Registration succeeds but redirects to 404
```
Solution: Dashboard is on backend server, not public site. Update redirect URL in register.js
```

**Problem**: Leaderboard shows empty
```
Solution: Backend API not returning data. Check backend logs.
```

## 📞 Support

For issues with:
- **Public pages**: Frontend team
- **API connectivity**: Backend team
- **Infrastructure**: DevOps team

## 🔗 Related Repositories

- **Backend API**: `kotc-server` (PRIVATE)
- **Main Site**: `flash-site` (this repo)
- **Sponsor Materials**: `flash-marketing` (if exists)

---

**Last Updated**: January 2025
**Deployed At**: https://getflash.io/treasure-hunt/
**Backend API**: https://hunt-api.getflash.io/
**Security Level**: PUBLIC
