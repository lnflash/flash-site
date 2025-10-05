# Keys of the Caribbean - Deployment Architecture

## 🏗️ Infrastructure Separation

For security, the treasure hunt is split into **two separate deployments**:

### 1. **Public Website** (getflash.io)
Marketing and informational pages only - NO backend logic or sensitive data.

### 2. **Private API Server** (separate repo + server)
All game logic, database, prizes, and sensitive operations.

---

## 📁 File Organization

### **PUBLIC** - Deploy to `getflash.io/treasure-hunt/`

Keep only these files on the main Flash website:

```
/treasure-hunt/
├── index.html              # Landing page ✅
├── register.html           # Registration form (UI only) ✅
├── leaderboard.html        # Leaderboard (UI only) ✅
├── rules.html              # Official rules (create this)
├── css/
│   ├── hunt.css           # Styles ✅
│   ├── register.css       # Styles ✅
│   ├── leaderboard.css    # Styles ✅
│   └── dashboard.css      # Styles ✅
└── js/
    ├── hunt.js            # Landing page JS ✅
    ├── register.js        # Registration UI (UPDATE API URLs) ✅
    └── leaderboard.js     # Leaderboard UI (UPDATE API URLs) ✅
```

**❌ DELETE from public site:**
- All `/api/` files
- All stage pages (rabbithole.html, stage2-7.html)
- Dashboard.html
- schema.sql
- Any puzzle solutions or game logic

---

### **PRIVATE** - New Repository `kotc-server`

Move these to a separate private server:

```
kotc-server/
├── api/
│   ├── config.php                 # Database & secrets
│   ├── register.php               # Registration handler
│   ├── verify-session.php         # Auth
│   ├── leaderboard.php            # Data endpoint
│   ├── get-stage1-token.php       # Stage 1 tokens
│   ├── verify-stage1.php          # Stage 1 verification
│   ├── complete-stage1.php        # Stage 1 completion
│   ├── lnurl-withdraw.php         # Prize withdrawal
│   └── get-prizes.php             # Prize data
├── stages/
│   ├── rabbithole.html            # Stage 1 page
│   ├── stage2.html                # Stage 2 page
│   ├── stage3.html                # ... etc
│   ├── stage4.html
│   ├── stage5.html
│   ├── stage6.html
│   └── stage7.html
├── dashboard.html                 # Hunter dashboard
├── profile.html                   # Hunter profile
├── schema.sql                     # Database schema
├── .env.example                   # Environment vars template
├── .htaccess                      # Security config
└── README.md                      # Private deployment docs
```

---

## 🔐 Security Configuration

### Public Site (`getflash.io`)

**Update ALL API calls** in JS files to point to private server:

```javascript
// Before (INSECURE):
fetch('/treasure-hunt/api/register.php', ...)

// After (SECURE):
fetch('https://hunt-api.getflash.io/api/register.php', ...)
// OR
fetch('https://api-hunt.yourserver.com/register', ...)
```

### Private API Server

1. **Subdomain Option**: `hunt-api.getflash.io`
   - DNS A record pointing to separate server
   - Completely isolated from main site

2. **Separate Domain Option**: `treasurehunt-api.com`
   - Fully separate domain
   - Even better security isolation

**Required CORS Configuration** (`api/config.php`):

```php
// Only allow requests from your public site
define('ALLOWED_ORIGINS', [
    'https://getflash.io',
    'https://www.getflash.io'
    // Remove localhost in production
]);
```

---

## 🚀 Deployment Steps

### Step 1: Set Up Private API Server

1. **Provision a new server** (VPS, DigitalOcean, AWS, etc.)
   ```bash
   # Recommended specs:
   # - 2GB RAM minimum
   # - Ubuntu 22.04 LTS
   # - PHP 8.2+ with MySQL
   # - SSL certificate (Let's Encrypt)
   ```

2. **Install LAMP stack**:
   ```bash
   sudo apt update
   sudo apt install apache2 mysql-server php8.2 php8.2-mysql php8.2-curl
   sudo a2enmod rewrite headers
   sudo systemctl restart apache2
   ```

3. **Clone private repo**:
   ```bash
   cd /var/www
   git clone https://github.com/your-org/kotc-server.git hunt
   sudo chown -R www-data:www-data hunt
   sudo chmod -R 755 hunt
   ```

4. **Set up database**:
   ```bash
   mysql -u root -p
   CREATE DATABASE flash_treasure_hunt;
   CREATE USER 'hunt_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON flash_treasure_hunt.* TO 'hunt_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;

   # Import schema
   mysql -u hunt_user -p flash_treasure_hunt < schema.sql
   ```

5. **Configure environment**:
   ```bash
   cp .env.example .env
   nano .env

   # Update with your values:
   # DB_HOST=localhost
   # DB_NAME=flash_treasure_hunt
   # DB_USER=hunt_user
   # DB_PASS=your_secure_password
   # JWT_SECRET=generate_random_64_char_string
   # HMAC_SECRET=generate_random_64_char_string
   # LNURL_API_KEY=your_lnurl_service_key
   ```

6. **Set up SSL**:
   ```bash
   sudo apt install certbot python3-certbot-apache
   sudo certbot --apache -d hunt-api.getflash.io
   ```

### Step 2: Update Public Site

1. **Update API URLs** in JS files:

   **`js/register.js`**:
   ```javascript
   const API_BASE = 'https://hunt-api.getflash.io/api';

   const response = await fetch(`${API_BASE}/register.php`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(data)
   });
   ```

   **`js/leaderboard.js`**:
   ```javascript
   const API_BASE = 'https://hunt-api.getflash.io/api';

   const response = await fetch(`${API_BASE}/leaderboard.php`);
   ```

2. **Remove sensitive files**:
   ```bash
   cd /Users/dread/Documents/Island-Bitcoin/Flash/flash-site/treasure-hunt
   rm -rf api/
   rm schema.sql
   rm dashboard.html
   rm rabbithole.html
   ```

3. **Deploy to getflash.io**:
   ```bash
   # Upload only public files:
   # - index.html
   # - register.html
   # - leaderboard.html
   # - rules.html
   # - css/
   # - js/ (with updated API URLs)
   ```

### Step 3: Configure Lightning Integration

On the **private server**, set up LNURL withdrawal:

**Option A: LNbits**
```bash
# Install LNbits on same server or separate
# Update api/config.php:
define('LNURL_ENDPOINT', 'https://lnbits.yourserver.com/api/v1');
define('LNURL_API_KEY', 'your_lnbits_admin_key');
```

**Option B: BTCPay Server**
```bash
# Connect to existing BTCPay instance
define('LNURL_ENDPOINT', 'https://btcpay.yourserver.com/api/v1');
define('LNURL_API_KEY', 'your_btcpay_api_key');
```

**Option C: Strike/OpenNode API**
```bash
# Use hosted Lightning service
define('LNURL_ENDPOINT', 'https://api.strike.me/v1');
define('LNURL_API_KEY', 'your_strike_api_key');
```

---

## 🧪 Testing

### Test API Connectivity

1. **CORS test**:
   ```bash
   curl -H "Origin: https://getflash.io" \
        -H "Access-Control-Request-Method: POST" \
        -X OPTIONS \
        https://hunt-api.getflash.io/api/register.php
   ```

2. **Registration test**:
   ```bash
   curl -X POST https://hunt-api.getflash.io/api/register.php \
        -H "Content-Type: application/json" \
        -d '{
          "username": "testuser",
          "email": "test@example.com",
          "satoshi_date": "2008-10-31",
          "satoshi_topic": "Bitcoin: A Peer-to-Peer Electronic Cash System",
          "agree_rules": true,
          "age_confirm": true
        }'
   ```

3. **Leaderboard test**:
   ```bash
   curl https://hunt-api.getflash.io/api/leaderboard.php
   ```

---

## 🔒 Security Checklist

### Private API Server

- [ ] Firewall configured (only ports 80, 443, 22)
- [ ] SSH key-based authentication only (disable password auth)
- [ ] Database not exposed to internet
- [ ] CORS restricted to getflash.io only
- [ ] Rate limiting enabled
- [ ] SSL/TLS certificate installed
- [ ] Environment variables not in git
- [ ] Error reporting disabled in production
- [ ] Regular backups configured
- [ ] Monitoring/alerts set up

### Public Website

- [ ] No API credentials in frontend code
- [ ] No database connections
- [ ] No puzzle solutions visible
- [ ] Stage pages removed from public access
- [ ] All API calls use HTTPS
- [ ] CSP headers configured

---

## 📊 Monitoring

Set up monitoring on **private server**:

```bash
# Install monitoring tools
sudo apt install prometheus-node-exporter
sudo apt install fail2ban

# Monitor API logs
tail -f /var/log/apache2/error.log
tail -f /var/log/apache2/access.log

# Database monitoring
mysql -u root -p -e "SHOW PROCESSLIST;"
```

---

## 🚨 Emergency Procedures

### If private server is compromised:

1. **Immediately**:
   ```bash
   # Take server offline
   sudo systemctl stop apache2

   # Lock database
   mysql -u root -p -e "FLUSH TABLES WITH READ LOCK;"
   ```

2. **Rotate secrets**:
   - Change JWT_SECRET
   - Change HMAC_SECRET
   - Regenerate all active tokens
   - Reset database passwords

3. **Audit**:
   ```bash
   # Check for unauthorized access
   sudo cat /var/log/auth.log | grep "Failed password"

   # Review database changes
   SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 100;
   ```

---

## 📝 DNS Configuration

Point subdomain to private server:

```
Type: A
Name: hunt-api (or api-hunt)
Value: 123.45.67.89 (your private server IP)
TTL: 3600
```

Allow 1-24 hours for DNS propagation.

---

## ✅ Final Deployment Verification

1. ✅ Public site shows landing/leaderboard (no backend)
2. ✅ Registration works via private API
3. ✅ Stage 1 easter egg triggers (console message)
4. ✅ HMAC tokens generated correctly
5. ✅ Prize claiming works via LNURL
6. ✅ Dashboard accessible only on private server
7. ✅ CORS blocks unauthorized origins
8. ✅ SSL certificates valid
9. ✅ Database backups running
10. ✅ Monitoring alerts active

---

## 📞 Support

For deployment help:
- **Infrastructure**: DevOps team
- **Lightning/LNURL**: Lightning network team
- **Database**: DBA team
- **Security**: Security team

---

**Next Steps**: Create the private repository and begin server provisioning.
