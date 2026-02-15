
# ThyroSakhi — Women's Thyroid Health App

A warm, accessible health app for rural and semi-urban women with large touch targets, soft calming colors (soft teal/mint greens, warm peach accents), and bilingual Telugu/English support throughout.

---

## Core Setup
- **Color palette**: Soft teal (#5BBFB5), warm peach (#F5A373), light cream backgrounds, gentle greens/yellows/reds for health indicators
- **Typography**: Large, readable fonts (18px+ body text) with support for Telugu script
- **Language system**: Full i18n with real Telugu translations stored in JSON, togglable from any screen
- **Backend (Lovable Cloud)**: Supabase for user auth, health scores history, contacts, and settings

---

## Screens

### 1. Splash Screen
- Centered app logo with a friendly health/thyroid icon
- Tagline in selected language: "Early thyroid care, right from your phone" / "మీ ఫోన్ నుండే ముందస్తు థైరాయిడ్ సంరక్షణ"
- Auto-navigates to language selection after 2 seconds

### 2. Language Selection
- Two large, card-style buttons with flag/script icons for Telugu and English
- Selection saved to profile and persists across sessions

### 3. Home Dashboard
- Warm welcome message with user's name
- Large "Start Health Check" button (prominent CTA)
- Previous risk score summary card (color-coded green/yellow/red)
- Icon grid: Voice Test, Neck Scan, Diet Tips, Find PHC — each with simple illustrated icons and labels

### 4. Voice Test Screen
- Friendly instruction text: "Please read this sentence aloud"
- Display sentence in selected language
- Large microphone button with pulse animation
- 10-second circular timer indicator
- Simulated recording → transitions to processing screen

### 5. Neck Scan Screen
- Camera preview area (simulated with placeholder)
- Overlay guide showing chin-up position
- Flash toggle button
- Large capture button
- Scan quality indicator (good/retry feedback)

### 6. Processing Screen
- Gentle loading animation (pulsing heart or wave)
- Reassuring text: "Checking your health…" / "మీ ఆరోగ్యాన్ని తనిఖీ చేస్తోంది…"
- Auto-advances to results after 3 seconds (simulated)

### 7. Risk Score Result Screen
- Visual health meter (semicircle gauge) — Green/Yellow/Red zones
- Large numeric score (0–100)
- Simple, friendly explanation text (no medical jargon)
- "What to do next" button leading to diet guidance or PHC info

### 8. Diet & Lifestyle Guidance
- Cards with local food illustrations and names
- Do's and Don'ts sections with checkmark/cross icons
- Regional food suggestions (ragi, millets, curry leaves, etc.)
- Warm, encouraging tone

### 9. PHC & Support Screen
- Map placeholder showing nearby Primary Health Centers
- "Get Directions" button
- "Call PHC" tap-to-call button
- Info card about free test camps with dates

### 10. Family Alert Screen
- Toggle switch to enable/disable family alerts
- Add emergency contact form (name + phone number)
- Preview of the alert SMS message
- Contacts saved to database

### 11. History & Progress
- Timeline/list of past health check scores with dates
- Simple trend arrows (improving ↑, stable →, declining ↓)
- Color-coded score badges
- "Recheck Now" button

### 12. Settings Screen
- Language toggle (Telugu/English)
- Privacy & consent information
- Help & support section with FAQ
- Logout option

---

## Backend (Lovable Cloud / Supabase)
- **Auth**: Simple phone number or email signup (no complex passwords)
- **Tables**: profiles, health_scores (score, date, voice_data_ref, scan_ref), emergency_contacts, user_settings (language preference)
- **Storage**: For any captured images (neck scan photos)

---

## Navigation
- Bottom tab bar with 4 tabs: Home, History, Diet, Settings
- All screens accessible within 1-2 taps from home
- Back buttons on every sub-screen
- Mobile-first responsive layout (optimized for 360-414px width)
