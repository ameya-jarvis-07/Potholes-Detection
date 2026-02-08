# 🚀 Quick Start Guide - Map Integration

## 1️⃣ Get API Key (2 minutes)

1. Go to: **https://locationiq.com**
2. Click **"Sign Up"** (free account)
3. Login → **Dashboard** → **Access Tokens**
4. Copy your API key

---

## 2️⃣ Add to Project (30 seconds)

**Open:** `dashboard.js`

**Line 7:** Replace this:
```javascript
const LOCATIONIQ_API_KEY = 'YOUR_LOCATIONIQ_API_KEY_HERE';
```

**With your key:**
```javascript
const LOCATIONIQ_API_KEY = 'pk.your_actual_key_here';
```

---

## 3️⃣ Optional: Change Default Location

**Line 20 in dashboard.js:**
```javascript
// Current: New Delhi
const DEFAULT_MAP_CENTER = [28.6139, 77.2090];

// Change to your city's [latitude, longitude]
```

**Popular Cities:**
- New York: `[40.7128, -74.0060]`
- London: `[51.5074, -0.1278]`
- Paris: `[48.8566, 2.3522]`
- Tokyo: `[35.6762, 139.6503]`
- Sydney: `[-33.8688, 151.2093]`
- Mumbai: `[19.0760, 72.8777]`

---

## 4️⃣ Start Server

```bash
node server.js
```

---

## 5️⃣ Test It!

### Test Map Picker:
1. Login to dashboard
2. Upload pothole image
3. Click **"Analyze Media"**
4. Click **"Pick on Map"** button
5. Click anywhere on map
6. Click **"Confirm Location"**
7. ✅ Location should auto-fill!

### Test Pothole Map:
1. Click **"Pothole Map"** in sidebar
2. ✅ Should show all your reports as markers
3. Click any marker for details

---

## 🎯 Files Modified

All changes are already implemented! Here's what was updated:

| File | Changes |
|------|---------|
| `dashboard.html` | Added Leaflet library, map picker modal, updated form |
| `dashboard.js` | Added map functions, reverse geocoding, marker display |
| `style.css` | Added map styles, modal styles, responsive design |
| `server.js` | Added latitude/longitude fields to database |

---

## 📋 What You Get

✅ Interactive map picker modal  
✅ Click-to-select pothole location  
✅ Automatic address from coordinates  
✅ Visual pothole map with color-coded markers  
✅ Mobile responsive  
✅ Geolocation support  
✅ Real-time coordinate display  

---

## 🆘 Quick Troubleshooting

**Map not loading?**
- Check API key is correct (no spaces/quotes)
- Check browser console for errors (F12)

**No address showing?**
- Click on a populated area (not ocean/remote)
- Wait 2-3 seconds for API response

**Markers not showing?**
- Make sure you submitted reports using "Pick on Map"
- Old reports without coordinates won't show

---

## 📚 Full Documentation

See **MAP_INTEGRATION_GUIDE.md** for:
- Detailed architecture
- Customization options
- Advanced features
- Complete API documentation

---

**That's it! You're ready to go! 🎉**
