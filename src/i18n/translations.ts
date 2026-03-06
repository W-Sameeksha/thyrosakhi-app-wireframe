export type Language = "en" | "te";

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Login
    "login.title": "Create Your Profile",
    "login.subtitle": "Your personal thyroid health companion",
    "login.name": "Full Name",
    "login.namePlaceholder": "Enter your name",
    "login.nameRequired": "Name is required",
    "login.nameMinLength": "Name must be at least 2 characters",
    "login.phone": "Phone Number",
    "login.phonePlaceholder": "10-digit mobile number",
    "login.phoneRequired": "Phone number is required",
    "login.phoneInvalid": "Please enter a valid 10-digit phone number",
    "login.age": "Age",
    "login.agePlaceholder": "Enter your age",
    "login.ageRequired": "Age is required",
    "login.ageInvalid": "Please enter a valid age (1-120)",
    "login.email": "Email",
    "login.emailPlaceholder": "your@email.com",
    "login.optional": "optional",
    "login.continue": "Continue",
    "login.loading": "Please wait...",
    "login.privacyNote": "Your information is secure and will only be used to personalize your experience.",

    // Splash
    "splash.tagline": "Early thyroid care, right from your phone",
    
    // Language Selection
    "lang.title": "Choose Your Language",
    "lang.subtitle": "ఏ భాషలో కొనసాగించాలి?",
    "lang.english": "English",
    "lang.telugu": "తెలుగు",
    
    // Home
    "home.welcome": "Welcome",
    "home.greeting": "How are you feeling today?",
    "home.startCheck": "Start Health Check",
    "home.lastScore": "Last Health Score",
    "home.noScore": "No tests yet",
    "home.voiceTest": "Voice Test",
    "home.neckScan": "Neck Scan",
    "home.dietTips": "Diet Tips",
    "home.findPHC": "Find PHC",
    
    // Voice Test
    "voice.title": "Voice Test",
    "voice.instruction": "Please read this sentence aloud clearly",
    "voice.sentence": "The butterfly sat on the bright yellow flower in the garden.",
    "voice.tapToRecord": "Tap to Record",
    "voice.recording": "Recording...",
    "voice.timeLeft": "seconds left",
    
    // Neck Scan
    "neck.title": "Neck Scan",
    "neck.instruction": "Position your neck in the guide area",
    "neck.detailedInstruction": "Position your chin and neck inside the guide. Hold a sip of water and swallow. Capture the image while swallowing.",
    "neck.chinUp": "Tilt your chin up slightly",
    "neck.chinArea": "Chin",
    "neck.neckRegion": "Neck Region",
    "neck.upperChest": "Upper Chest",
    "neck.swallowNow": "Swallow Now",
    "neck.flash": "Flash",
    "neck.capture": "Capture Neck Scan",
    "neck.quality.good": "Good position!",
    "neck.quality.adjust": "Please adjust position",
    
    // Processing
    "processing.title": "Checking your health…",
    "processing.subtitle": "This will only take a moment",
    
    // Risk Score
    "risk.title": "Your Health Score",
    "risk.low": "Low Risk — You're doing great!",
    "risk.medium": "Moderate Risk — Let's take some steps",
    "risk.high": "Higher Risk — Please visit a health center",
    "risk.nextSteps": "View Full Report",
    "risk.score": "Score",
    "risk.highWarning": "⚠️ High thyroid risk detected. We recommend visiting a nearby healthcare center for proper diagnosis.",
    "risk.findNearbyClinics": "Find Nearby Clinics",
    "risk.geolocationNotSupported": "Geolocation is not supported by this browser.",
    "risk.geolocationError": "Unable to get your location. Please try again.",

    // Health Report
    "report.title": "Health Summary Report",
    "report.incomplete": "Complete all tests to view your report",
    "report.goBack": "Go Back",
    "report.finalRisk": "Final Thyroid Risk",
    "report.riskLow": "Low Risk",
    "report.riskMedium": "Moderate Risk",
    "report.riskHigh": "High Risk",
    "report.healthScore": "Health Score",
    "report.aiAnalysis": "AI Analysis Summary",
    "report.explanationLow": "Your thyroid risk appears low based on voice, symptom, and neck analysis. Maintaining a healthy lifestyle and balanced diet is recommended.",
    "report.explanationModerate": "Some indicators suggest a possible thyroid imbalance. Monitoring symptoms and improving dietary habits may help. Consider consulting a healthcare professional if symptoms persist.",
    "report.explanationHigh": "Multiple indicators suggest a higher thyroid risk. We strongly recommend consulting a healthcare professional for proper diagnosis and treatment.",
    "report.detailedResults": "Detailed Analysis Results",
    "report.voiceTitle": "Voice Analysis",
    "report.symptomTitle": "Symptom Analysis",
    "report.neckTitle": "Neck Scan",
    "report.voiceLow": "Voice patterns appear normal",
    "report.voiceModerate": "Possible vocal instability detected",
    "report.voiceHigh": "Significant vocal changes detected",
    "report.symptomLow": "Few or no symptoms reported",
    "report.symptomModerate": "Some thyroid-related symptoms present",
    "report.symptomHigh": "Multiple symptoms reported",
    "report.neckLow": "No visible swelling detected",
    "report.neckModerate": "Possible mild swelling detected",
    "report.neckHigh": "Possible swelling detected",
    "report.viewDiet": "View Dietary Guidance",
    "report.findClinics": "Find Nearby Clinics",
    "report.download": "Download Report",
    "report.retake": "Retake Test",
    
    // Diet
    "diet.title": "Diet & Lifestyle Tips",
    "diet.dos": "Good Foods ✓",
    "diet.donts": "Avoid These ✗",
    "diet.tip": "Tip",
    "diet.allergyPreferences": "Any allergic preferences?",
    "diet.noMatchingFoods": "No matching foods for selected allergy preferences.",
    
    // Processing
    "processing.title": "Checking your health…",
    "processing.subtitle": "This will only take a moment",
    "processing.neckResult": "Neck Scan Result",
    "processing.neckScore": "Neck Score",
    "processing.swellingLevel": "Swelling Level",
    
    // PHC
    "phc.title": "Health Centers Near You",
    "phc.directions": "Get Directions",
    "phc.call": "Call PHC",
    "phc.camps": "Free Test Camps",
    "phc.campInfo": "Next free thyroid camp on March 15, 2026 at the District Hospital",

    // PHC Nearby
    "phcNearby.title": "Nearby Health Centers",
    "phcNearby.alert": "⚠ High Thyroid Risk Detected",
    "phcNearby.alertMessage": "Please consult a healthcare professional immediately.",
    "phcNearby.loading": "Finding nearby clinics...",
    "phcNearby.retry": "Retry",
    "phcNearby.noClinics": "No clinics found nearby",
    "phcNearby.found": "Found",
    "phcNearby.clinicsNear": "clinics near you",
    
    // Family Alert
    "family.title": "Family Alerts",
    "family.enable": "Enable family alerts",
    "family.addContact": "Add Emergency Contact",
    "family.name": "Contact Name",
    "family.phone": "Phone Number",
    "family.save": "Save Contact",
    "family.preview": "Alert Preview",
    "family.sampleMsg": "THYRO_TRACK Alert: Your family member completed a health check. Score: {score}/100. Please ensure they visit a nearby PHC.",
    
    // History
    "history.title": "Health History",
    "history.noData": "No health checks yet",
    "history.recheck": "Recheck Now",
    "history.improving": "Improving",
    "history.stable": "Stable",
    "history.declining": "Needs attention",
    "history.clearHistory": "Clear History",
    "history.confirmClear": "Are you sure you want to clear all history?",
    "history.risk.low": "Low Risk",
    "history.risk.medium": "Moderate Risk",
    "history.risk.high": "High Risk",
    
    // Settings
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.privacy": "Privacy & Consent",
    "settings.privacyText": "Your health data is private and secure. We never share your information without your consent.",
    "settings.help": "Help & Support",
    "settings.faq1q": "Is this app a replacement for a doctor?",
    "settings.faq1a": "No. THYRO_TRACK helps with early awareness. Always consult a doctor for treatment.",
    "settings.faq2q": "Is my data safe?",
    "settings.faq2a": "Yes. Your data is encrypted and stored securely.",
    "settings.logout": "Logout",
    "settings.logoutConfirm": "Are you sure you want to logout?",
    "settings.years": "years",
    
    // Nav
    "nav.home": "Home",
    "nav.history": "History",
    "nav.diet": "Diet",
    "nav.settings": "Settings",

    // Common
    "common.back": "Back",
    "common.resetScreening": "Reset Screening Data",
    
    // Index/Blank App
    "index.welcome": "Welcome to Your Blank App",
    "index.startBuilding": "Start building your amazing project here!",
    
    // NotFound
    "notFound.title": "404",
    "notFound.message": "Oops! Page not found",
    "notFound.returnHome": "Return to Home",
    
    // Home - Cold Warning
    "home.coldWarning": "Screening is temporarily unavailable until your cold or cough is resolved.",
    
    // NeckScan extra
    "neck.thyroidArea": "↓ Thyroid Area ↓",
    "neck.needsHttps": "Camera needs HTTPS or localhost. Open the app on localhost.",
    "neck.notSupported": "Camera API not supported in this browser.",
    "neck.tapRetry": "Tap Retry Camera to start preview.",
    "neck.permissionDenied": "Camera permission denied. Please allow camera access.",
    "neck.noDevice": "No camera device found on this system.",
    "neck.unableToAccess": "Unable to access camera. Please check browser camera settings.",
    "neck.on": "ON",
    "neck.off": "OFF",
    "neck.analyzing": "Analyzing neck image...",
    "neck.retryCamera": "Retry Camera",
    
    // PHC Support extra
    "phc.mapComingSoon": "Map view coming soon",
    "phc.clinicName": "District PHC - Warangal",
    "phc.clinicAddress": "Main Road, Near Bus Stand, Warangal - 506002",
    
    // Risk Score extra
    "risk.completeAll": "Complete all tests to view final result",
    "risk.symptomsTest": "Symptoms Test",
    "risk.voiceTestName": "Voice Test",
    "risk.neckScanName": "Neck Scan",
    "risk.completeSymptoms": "Complete Symptoms Test",
    "risk.completeVoice": "Complete Voice Test",
    "risk.completeNeck": "Complete Neck Scan",
    
    // Voice Test extra
    "voice.analysisTimeout": "Analysis timed out. Please try again.",
    "voice.serverUnavailable": "Unable to reach analysis server. Please make sure backend is running.",
    "voice.analyzingVoice": "Analyzing voice... this may take a moment.",
    
    // PHC Nearby extra
    "phcNearby.distance": "Distance",
    
    // Symptom Assistant
    "assistant.title": "Symptom Assistant",
    "assistant.subtitle": "AI voice health assistant",
    "assistant.startConversation": "Start Conversation",
    "assistant.tapToStart": "Tap the button below to start your health screening conversation",
    "assistant.listening": "Listening...",
    "assistant.speaking": "Assistant speaking...",
    "assistant.waiting": "Tap Start to begin",
    "assistant.locked": "Screening locked",
    "assistant.stopped": "Conversation stopped",
    "assistant.returnHome": "Return to Home",
    "assistant.tryAgain": "Try Again",
    "assistant.recognized": "Recognized",
    "assistant.retry": "Retry",
    "assistant.intro": "Hello. Before we begin the thyroid screening, I need to ask a few quick health questions.",
    "assistant.yesNoInstruction": "Please answer only in Yes or No.",
    "assistant.safetyQuestion": "Do you currently have cold or cough?",
    "assistant.coldCoughWarning": "Voice-based thyroid screening may not be accurate during cold or cough. Please return once your symptoms are gone.",
    "assistant.lockMessage": "Screening is temporarily unavailable until your cold or cough is resolved.",
    "assistant.fallbackMessage": "I didn't catch that. Please say Yes or No.",
    "assistant.finalUnclearMessage": "We are unable to understand your response. Please try again later.",
    "assistant.microphoneDenied": "Microphone permission denied. Please allow microphone access.",
    "assistant.speechNotSupported": "Speech recognition is not supported in this browser.",
    "assistant.unableToRecognize": "Unable to recognize speech. Please try again later.",
    "assistant.couldNotStart": "Could not start microphone listening. Please try again.",
    "assistant.question.fatigue": "Do you often feel unexplained fatigue?",
    "assistant.question.weight_change": "Have you experienced sudden weight gain or weight loss?",
    "assistant.question.hair_fall": "Are you experiencing unusual hair fall?",
    "assistant.question.temperature_sensitivity": "Do you feel unusually sensitive to cold or heat?",
    "assistant.question.irregular_cycles": "Do you have irregular menstrual cycles?",
  },
  te: {    // Login
    "login.title": "మీ ప్రొఫైల్ సృష్టించండి",
    "login.subtitle": "మీ వ్యక్తిగత థైరాయిడ్ ఆరోగ్య సహచరుడు",
    "login.name": "పూర్తి పేరు",
    "login.namePlaceholder": "మీ పేరు నమోదు చేయండి",
    "login.nameRequired": "పేరు అవసరం",
    "login.nameMinLength": "పేరు కనీసం 2 అక్షరాలు ఉండాలి",
    "login.phone": "ఫోన్ నంబర్",
    "login.phonePlaceholder": "10 అంకెల మొబైల్ నంబర్",
    "login.phoneRequired": "ఫోన్ నంబర్ అవసరం",
    "login.phoneInvalid": "దయచేసి చెల్లుబాటు అయ్యే 10 అంకెల ఫోన్ నంబర్ నమోదు చేయండి",
    "login.age": "వయసు",
    "login.agePlaceholder": "మీ వయసు నమోదు చేయండి",
    "login.ageRequired": "వయసు అవసరం",
    "login.ageInvalid": "దయచేసి చెల్లుబాటు అయ్యే వయసు నమోదు చేయండి (1-120)",
    "login.email": "ఇమెయిల్",
    "login.emailPlaceholder": "your@email.com",
    "login.optional": "ఐచ్ఛికం",
    "login.continue": "కొనసాగించండి",
    "login.loading": "దయచేసి వేచి ఉండండి...",
    "login.privacyNote": "మీ సమాచారం సురక్షితంగా ఉంటుంది మరియు మీ అనుభవాన్ని వ్యక్తిగతం చేయడానికి మాత్రమే ఉపయోగించబడుతుంది.",
    // Splash
    "splash.tagline": "మీ ఫోన్ నుండే ముందస్తు థైరాయిడ్ సంరక్షణ",
    
    // Language Selection
    "lang.title": "మీ భాషను ఎంచుకోండి",
    "lang.subtitle": "Choose Your Language",
    "lang.english": "English",
    "lang.telugu": "తెలుగు",
    
    // Home
    "home.welcome": "స్వాగతం",
    "home.greeting": "మీరు ఈ రోజు ఎలా ఉన్నారు?",
    "home.startCheck": "ఆరోగ్య పరీక్ష ప్రారంభించండి",
    "home.lastScore": "చివరి ఆరోగ్య స్కోర్",
    "home.noScore": "ఇంకా పరీక్షలు లేవు",
    "home.voiceTest": "గొంతు పరీక్ష",
    "home.neckScan": "మెడ స్కాన్",
    "home.dietTips": "ఆహార సలహాలు",
    "home.findPHC": "PHC కనుగొనండి",
    
    // Voice Test
    "voice.title": "గొంతు పరీక్ష",
    "voice.instruction": "దయచేసి ఈ వాక్యాన్ని బిగ్గరగా చదవండి",
    "voice.sentence": "తోటలో ప్రకాశవంతమైన పసుపు పువ్వు మీద సీతాకోకచిలుక కూర్చుంది.",
    "voice.tapToRecord": "రికార్డ్ చేయడానికి నొక్కండి",
    "voice.recording": "రికార్డ్ అవుతోంది...",
    "voice.timeLeft": "సెకన్లు మిగిలి ఉన్నాయి",
    
    // Neck Scan
    "neck.title": "మెడ స్కాన్",
    "neck.instruction": "మీ మెడను గైడ్ ఏరియాలో ఉంచండి",
    "neck.detailedInstruction": "మీ గడ్డం మరియు మెడను గైడ్ లోపల ఉంచండి. నీటిని తీసుకుని మింగండి. మింగుతున్నప్పుడు చిత్రాన్ని క్యాప్చర్ చేయండి.",
    "neck.chinUp": "మీ గడ్డాన్ని కొంచెం పైకి ఎత్తండి",
    "neck.chinArea": "గడ్డం",
    "neck.neckRegion": "మెడ ప్రాంతం",
    "neck.upperChest": "పై ఛాతీ",
    "neck.swallowNow": "ఇప్పుడు మింగండి",
    "neck.flash": "ఫ్లాష్",
    "neck.capture": "మెడ స్కాన్ క్యాప్చర్",
    "neck.quality.good": "మంచి స్థానం!",
    "neck.quality.adjust": "దయచేసి స్థానాన్ని సరి చేయండి",
    
    // Processing
    "processing.title": "మీ ఆరోగ్యాన్ని తనిఖీ చేస్తోంది…",
    "processing.subtitle": "ఇది కొన్ని క్షణాలు మాత్రమే పడుతుంది",
    
    // Risk Score
    "risk.title": "మీ ఆరోగ్య స్కోర్",
    "risk.low": "తక్కువ ప్రమాదం — మీరు బాగా చేస్తున్నారు!",
    "risk.medium": "మధ్యస్థ ప్రమాదం — కొన్ని చర్యలు తీసుకుందాం",
    "risk.high": "ఎక్కువ ప్రమాదం — దయచేసి ఆరోగ్య కేంద్రాన్ని సందర్శించండి",
    "risk.nextSteps": "పూర్తి నివేదిక చూడండి",
    "risk.score": "స్కోర్",
    "risk.highWarning": "⚠️ అధిక థైరాయిడ్ ప్రమాదం గుర్తించబడింది. సరైన రోగనిర్ధారణ కోసం సమీపంలోని ఆరోగ్య కేంద్రాన్ని సందర్శించాలని మే సిఫారసు చేస్తున్నాం.",
    "risk.findNearbyClinics": "సమీపంలోని క్లినిక్‌లను కనుగొనండి",
    "risk.geolocationNotSupported": "ఈ బ్రౌజర్ జియోలొకేషన్‌ను సపోర్ట్ చేయదు.",
    "risk.geolocationError": "మీ స్థానాన్ని పొందడం సాధ్యం కాలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.",

    // Health Report
    "report.title": "ఆరోగ్య సారాంశ నివేదిక",
    "report.incomplete": "మీ నివేదికను చూడటానికి అన్ని పరీక్షలు పూర్తి చేయండి",
    "report.goBack": "వెనుకకు వెళ్ళండి",
    "report.finalRisk": "అంతిమ థైరాయిడ్ ప్రమాదం",
    "report.riskLow": "తక్కువ ప్రమాదం",
    "report.riskMedium": "మధ్యస్థ ప్రమాదం",
    "report.riskHigh": "అధిక ప్రమాదం",
    "report.healthScore": "ఆరోగ్య స్కోర్",
    "report.aiAnalysis": "AI విశ్లేషణ సారాంశం",
    "report.explanationLow": "గొంతు, లక్షణాలు మరియు మెడ విశ్లేషణ ఆధారంగా మీ థైరాయిడ్ ప్రమాదం తక్కువగా కనిపిస్తోంది. ఆరోగ్యకరమైన జీవనశైలి మరియు సమతుల్య ఆహారం కొనసాగించండి.",
    "report.explanationModerate": "కొన్ని సూచనలు సాధ్యమైన థైరాయిడ్ అసమతుల్యతను సూచిస్తున్నాయి. లక్షణాలను పర్యవేక్షించడం మరియు ఆహార అలవాట్లను మెరుగుపరచడం సహాయపడవచ్చు. లక్షణాలు కొనసాగితే వైద్య నిపుణులను సంప్రదించండి.",
    "report.explanationHigh": "బహుళ సూచికలు అధిక థైరాయిడ్ ప్రమాదాన్ని సూచిస్తున్నాయి. సరైన రోగనిర్ధారణ మరియు చికిత్స కోసం వైద్య నిపుణులను సంప్రదించాలని మేము గట్టిగా సిఫారసు చేస్తున్నాం.",
    "report.detailedResults": "వివరమైన విశ్లేషణ ఫలితాలు",
    "report.voiceTitle": "గొంతు విశ్లేషణ",
    "report.symptomTitle": "లక్షణాల విశ్లేషణ",
    "report.neckTitle": "మెడ స్కాన్",
    "report.voiceLow": "గొంతు నమూనాలు సామాన్యంగా కనిపిస్తున్నాయి",
    "report.voiceModerate": "సాధ్యమైన గొంతు అస్థిరత గుర్తించబడింది",
    "report.voiceHigh": "గోచరమైన గొంతు మార్పులు గుర్తించబడ్డాయి",
    "report.symptomLow": "తక్కువ లేదా లక్షణాలు నివేదించబడ్డాయి",
    "report.symptomModerate": "కొన్ని థైరాయిడ్-సంబంధిత లక్షణాలు ఉన్నాయి",
    "report.symptomHigh": "బహుళ లక్షణాలు నివేదించబడ్డాయి",
    "report.neckLow": "కనిపించే వాపు లేదు",
    "report.neckModerate": "సాధ్యమైన తేలిక వాపు గుర్తించబడింది",
    "report.neckHigh": "సాధ్యమైన వాపు గుర్తించబడింది",
    "report.viewDiet": "ఆహార మార్గదర్శకత్వం చూడండి",
    "report.findClinics": "సమీపంలోని క్లినిక్‌లను కనుగొనండి",
    "report.download": "నివేదిక డౌన్‌లోడ్ చేయండి",
    "report.retake": "మళ్ళీ పరీక్షించండి",
    
    // Diet
    "diet.title": "ఆహారం & జీవనశైలి సలహాలు",
    "diet.dos": "మంచి ఆహారాలు ✓",
    "diet.donts": "ఇవి తగ్గించండి ✗",
    "diet.tip": "సలహా",
    "diet.allergyPreferences": "అలర్జీ ప్రాధాన్యతలు ఏమైనా ఉన్నాయా?",
    "diet.noMatchingFoods": "ఎంచుకున్న అలర్జీ ప్రాధాన్యతలకు సరిపోలే ఆహారాలు లేవు.",
    
    // Processing
    "processing.neckResult": "మెడ స్కాన్ ఫలితం",
    "processing.neckScore": "మెడ స్కోర్",
    "processing.swellingLevel": "వాపు స్థాయి",
    
    // PHC
    "phc.title": "మీ సమీపంలోని ఆరోగ్య కేంద్రాలు",
    "phc.directions": "దిశలు పొందండి",
    "phc.call": "PHC కి కాల్ చేయండి",
    "phc.camps": "ఉచిత పరీక్ష శిబిరాలు",
    "phc.campInfo": "తదుపరి ఉచిత థైరాయిడ్ శిబిరం మార్చి 15, 2026న జిల్లా ఆసుపత్రిలో",

    // PHC Nearby
    "phcNearby.title": "సమీపంలోని ఆరోగ్య కేంద్రాలు",
    "phcNearby.alert": "⚠ అధిక థైరాయిడ్ ప్రమాదం గుర్తించబడింది",
    "phcNearby.alertMessage": "దయచేసి వెంటనే వైద్య నిపుణుడిని సంప్రదించండి.",
    "phcNearby.loading": "సమీపంలోని క్లినిక్‌లను కనుగొంటోంది...",
    "phcNearby.retry": "మళ్ళీ ప్రయత్నించండి",
    "phcNearby.noClinics": "సమీపంలో క్లినిక్‌లు కనుగొనబడలేదు",
    "phcNearby.found": "కనుగొనబడింది",
    "phcNearby.clinicsNear": "మీ సమీపంలో క్లినిక్‌లు",
    
    // Family Alert
    "family.title": "కుటుంబ హెచ్చరికలు",
    "family.enable": "కుటుంబ హెచ్చరికలను ప్రారంభించండి",
    "family.addContact": "అత్యవసర సంప్రదింపును జోడించండి",
    "family.name": "పేరు",
    "family.phone": "ఫోన్ నంబర్",
    "family.save": "సేవ్ చేయండి",
    "family.preview": "హెచ్చరిక ప్రివ్యూ",
    "family.sampleMsg": "THYRO_TRACK హెచ్చరిక: మీ కుటుంబ సభ్యుడు ఆరోగ్య పరీక్ష పూర్తి చేశారు. స్కోర్: {score}/100. దయచేసి సమీపంలోని PHC ని సందర్శించేలా చూడండి.",
    
    // History
    "history.title": "ఆరోగ్య చరిత్ర",
    "history.noData": "ఇంకా ఆరోగ్య పరీక్షలు లేవు",
    "history.recheck": "మళ్ళీ పరీక్షించండి",
    "history.improving": "మెరుగుపడుతోంది",
    "history.stable": "స్థిరంగా ఉంది",
    "history.declining": "శ్రద్ధ అవసరం",
    "history.clearHistory": "చరిత్ర తొలగించండి",
    "history.confirmClear": "మీరు మొత్తం చరిత్రను తొలగించాలనుకుంటున్నారా?",
    "history.risk.low": "తక్కువ ప్రమాదం",
    "history.risk.medium": "మధ్యస్థ ప్రమాదం",
    "history.risk.high": "అధిక ప్రమాదం",
    
    // Settings
    "settings.title": "సెట్టింగ్‌లు",
    "settings.language": "భాష",
    "settings.privacy": "గోప్యత & అనుమతి",
    "settings.privacyText": "మీ ఆరోగ్య డేటా ప్రైవేట్ మరియు సురక్షితం. మీ అనుమతి లేకుండా మేము మీ సమాచారాన్ని ఎప్పుడూ పంచుకోము.",
    "settings.help": "సహాయం & మద్దతు",
    "settings.faq1q": "ఈ యాప్ వైద్యునికి ప్రత్యామ్నాయమా?",
    "settings.faq1a": "కాదు. THYRO_TRACK ముందస్తు అవగాహనకు సహాయపడుతుంది. చికిత్స కోసం ఎల్లప్పుడూ వైద్యుడిని సంప్రదించండి.",
    "settings.faq2q": "నా డేటా సురక్షితమా?",
    "settings.faq2a": "అవును. మీ డేటా ఎన్‌క్రిప్ట్ చేయబడి సురక్షితంగా నిల్వ చేయబడుతుంది.",
    "settings.logout": "లాగ్ అవుట్",
    "settings.logoutConfirm": "మీరు ఖచ్చితంగా లాగ్ అవుట్ అవ్వాలనుకుంటున్నారా?",
    "settings.years": "సంవత్సరాలు",
    
    // Nav
    "nav.home": "హోమ్",
    "nav.history": "చరిత్ర",
    "nav.diet": "ఆహారం",
    "nav.settings": "సెట్టింగ్‌లు",

    // Common
    "common.back": "వెనుకకు",
    "common.resetScreening": "స్క్రీనింగ్ డేటా రీసెట్ చేయండి",
    
    // Index/Blank App
    "index.welcome": "మీ ఖాళీ యాప్‌కు స్వాగతం",
    "index.startBuilding": "మీ అద్భుతమైన ప్రాజెక్ట్‌ను ఇక్కడ నిర్మించడం ప్రారంభించండి!",
    
    // NotFound
    "notFound.title": "404",
    "notFound.message": "అయ్యో! పేజీ కనుగొనబడలేదు",
    "notFound.returnHome": "హోమ్‌కు తిరిగి వెళ్ళండి",
    
    // Home - Cold Warning
    "home.coldWarning": "మీ జలుబు లేదా దగ్గు తగ్గే వరకు స్క్రీనింగ్ తాత్కాలికంగా అందుబాటులో లేదు.",
    
    // NeckScan extra
    "neck.thyroidArea": "↓ థైరాయిడ్ ప్రాంతం ↓",
    "neck.needsHttps": "కెమెరాకు HTTPS లేదా localhost అవసరం. యాప్ localhost లో తెరవండి.",
    "neck.notSupported": "ఈ బ్రౌజర్‌లో కెమెరా API సపోర్ట్ చేయబడదు.",
    "neck.tapRetry": "ప్రివ్యూ ప్రారంభించడానికి కెమెరా మళ్ళీ ప్రయత్నించు నొక్కండి.",
    "neck.permissionDenied": "కెమెరా అనుమతి తిరస్కరించబడింది. దయచేసి కెమెరా యాక్సెస్ అనుమతించండి.",
    "neck.noDevice": "ఈ సిస్టమ్‌లో కెమెరా పరికరం కనుగొనబడలేదు.",
    "neck.unableToAccess": "కెమెరాను యాక్సెస్ చేయలేకపోయింది. దయచేసి బ్రౌజర్ కెమెరా సెట్టింగ్‌లు తనిఖీ చేయండి.",
    "neck.on": "ఆన్",
    "neck.off": "ఆఫ్",
    "neck.analyzing": "మెడ చిత్రాన్ని విశ్లేషిస్తోంది...",
    "neck.retryCamera": "కెమెరా మళ్ళీ ప్రయత్నించు",
    
    // PHC Support extra
    "phc.mapComingSoon": "మ్యాప్ వ్యూ త్వరలో వస్తుంది",
    "phc.clinicName": "జిల్లా PHC - వరంగల్",
    "phc.clinicAddress": "మెయిన్ రోడ్, బస్ స్టాండ్ సమీపంలో, వరంగల్ - 506002",
    
    // Risk Score extra
    "risk.completeAll": "తుది ఫలితాన్ని చూడటానికి అన్ని పరీక్షలు పూర్తి చేయండి",
    "risk.symptomsTest": "లక్షణాల పరీక్ష",
    "risk.voiceTestName": "గొంతు పరీక్ష",
    "risk.neckScanName": "మెడ స్కాన్",
    "risk.completeSymptoms": "లక్షణాల పరీక్ష పూర్తి చేయండి",
    "risk.completeVoice": "గొంతు పరీక్ష పూర్తి చేయండి",
    "risk.completeNeck": "మెడ స్కాన్ పూర్తి చేయండి",
    
    // Voice Test extra
    "voice.analysisTimeout": "విశ్లేషణ సమయం ముగిసింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    "voice.serverUnavailable": "విశ్లేషణ సర్వర్‌ను చేరుకోలేకపోయింది. బ్యాక్‌ఎండ్ రన్ అవుతుందని నిర్ధారించుకోండి.",
    "voice.analyzingVoice": "గొంతును విశ్లేషిస్తోంది... కొంత సమయం పట్టవచ్చు.",
    
    // PHC Nearby extra
    "phcNearby.distance": "దూరం",
    
    // Symptom Assistant
    "assistant.title": "లక్షణాల సహాయకుడు",
    "assistant.subtitle": "AI వాయిస్ ఆరోగ్య సహాయకుడు",
    "assistant.startConversation": "సంభాషణ ప్రారంభించండి",
    "assistant.tapToStart": "మీ ఆరోగ్య స్క్రీనింగ్ సంభాషణ ప్రారంభించడానికి క్రింది బటన్ నొక్కండి",
    "assistant.listening": "వింటోంది...",
    "assistant.speaking": "సహాయకుడు మాట్లాడుతున్నాడు...",
    "assistant.waiting": "ప్రారంభించడానికి నొక్కండి",
    "assistant.locked": "స్క్రీనింగ్ లాక్ చేయబడింది",
    "assistant.stopped": "సంభాషణ ఆపివేయబడింది",
    "assistant.returnHome": "హోమ్‌కు తిరిగి వెళ్ళండి",
    "assistant.tryAgain": "మళ్ళీ ప్రయత్నించండి",
    "assistant.recognized": "గుర్తించబడింది",
    "assistant.retry": "మళ్ళీ ప్రయత్నించు",
    "assistant.intro": "నమస్తే. థైరాయిడ్ స్క్రీనింగ్ ప్రారంభించే ముందు, నేను కొన్ని త్వరిత ఆరోగ్య ప్రశ్నలు అడగాలి.",
    "assistant.yesNoInstruction": "దయచేసి అవును లేదా కాదు అని మాత్రమే సమాధానం ఇవ్వండి.",
    "assistant.safetyQuestion": "మీకు ప్రస్తుతం జలుబు లేదా దగ్గు ఉందా?",
    "assistant.coldCoughWarning": "జలుబు లేదా దగ్గు సమయంలో వాయిస్-ఆధారిత థైరాయిడ్ స్క్రీనింగ్ ఖచ్చితంగా ఉండకపోవచ్చు. మీ లక్షణాలు తగ్గిన తర్వాత తిరిగి రండి.",
    "assistant.lockMessage": "మీ జలుబు లేదా దగ్గు తగ్గే వరకు స్క్రీనింగ్ తాత్కాలికంగా అందుబాటులో లేదు.",
    "assistant.fallbackMessage": "నేను అది అర్థం చేసుకోలేకపోయాను. దయచేసి అవును లేదా కాదు అని చెప్పండి.",
    "assistant.finalUnclearMessage": "మీ ప్రతిస్పందనను అర్థం చేసుకోలేకపోయాం. దయచేసి తర్వాత మళ్ళీ ప్రయత్నించండి.",
    "assistant.microphoneDenied": "మైక్రోఫోన్ అనుమతి తిరస్కరించబడింది. దయచేసి మైక్రోఫోన్ యాక్సెస్ అనుమతించండి.",
    "assistant.speechNotSupported": "ఈ బ్రౌజర్‌లో స్పీచ్ రికగ్నిషన్ సపోర్ట్ చేయబడదు.",
    "assistant.unableToRecognize": "స్పీచ్ గుర్తించలేకపోయింది. దయచేసి తర్వాత మళ్ళీ ప్రయత్నించండి.",
    "assistant.couldNotStart": "మైక్రోఫోన్ వినడం ప్రారంభించలేకపోయింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    "assistant.question.fatigue": "మీకు తరచుగా వివరించలేని అలసట అనిపిస్తుందా?",
    "assistant.question.weight_change": "మీరు అకస్మాత్తుగా బరువు పెరగడం లేదా తగ్గడం అనుభవించారా?",
    "assistant.question.hair_fall": "మీకు అసాధారణ జుట్టు రాలడం జరుగుతోందా?",
    "assistant.question.temperature_sensitivity": "మీకు చలి లేదా వేడికి అసాధారణంగా సున్నితంగా అనిపిస్తుందా?",
    "assistant.question.irregular_cycles": "మీకు క్రమరహిత రుతు చక్రాలు ఉన్నాయా?",
  },
};
