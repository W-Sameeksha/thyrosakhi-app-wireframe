export type Language = "en" | "te";

export const translations: Record<Language, Record<string, string>> = {
  en: {
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
    "family.sampleMsg": "ThyroSakhi Alert: Your family member completed a health check. Score: {score}/100. Please ensure they visit a nearby PHC.",
    
    // History
    "history.title": "Health History",
    "history.noData": "No health checks yet",
    "history.recheck": "Recheck Now",
    "history.improving": "Improving",
    "history.stable": "Stable",
    "history.declining": "Needs attention",
    
    // Settings
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.privacy": "Privacy & Consent",
    "settings.privacyText": "Your health data is private and secure. We never share your information without your consent.",
    "settings.help": "Help & Support",
    "settings.faq1q": "Is this app a replacement for a doctor?",
    "settings.faq1a": "No. ThyroSakhi helps with early awareness. Always consult a doctor for treatment.",
    "settings.faq2q": "Is my data safe?",
    "settings.faq2a": "Yes. Your data is encrypted and stored securely.",
    "settings.logout": "Logout",
    
    // Nav
    "nav.home": "Home",
    "nav.history": "History",
    "nav.diet": "Diet",
    "nav.settings": "Settings",

    // Common
    "common.back": "Back",
  },
  te: {
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
    "family.sampleMsg": "ThyroSakhi హెచ్చరిక: మీ కుటుంబ సభ్యుడు ఆరోగ్య పరీక్ష పూర్తి చేశారు. స్కోర్: {score}/100. దయచేసి సమీపంలోని PHC ని సందర్శించేలా చూడండి.",
    
    // History
    "history.title": "ఆరోగ్య చరిత్ర",
    "history.noData": "ఇంకా ఆరోగ్య పరీక్షలు లేవు",
    "history.recheck": "మళ్ళీ పరీక్షించండి",
    "history.improving": "మెరుగుపడుతోంది",
    "history.stable": "స్థిరంగా ఉంది",
    "history.declining": "శ్రద్ధ అవసరం",
    
    // Settings
    "settings.title": "సెట్టింగ్‌లు",
    "settings.language": "భాష",
    "settings.privacy": "గోప్యత & అనుమతి",
    "settings.privacyText": "మీ ఆరోగ్య డేటా ప్రైవేట్ మరియు సురక్షితం. మీ అనుమతి లేకుండా మేము మీ సమాచారాన్ని ఎప్పుడూ పంచుకోము.",
    "settings.help": "సహాయం & మద్దతు",
    "settings.faq1q": "ఈ యాప్ వైద్యునికి ప్రత్యామ్నాయమా?",
    "settings.faq1a": "కాదు. ThyroSakhi ముందస్తు అవగాహనకు సహాయపడుతుంది. చికిత్స కోసం ఎల్లప్పుడూ వైద్యుడిని సంప్రదించండి.",
    "settings.faq2q": "నా డేటా సురక్షితమా?",
    "settings.faq2a": "అవును. మీ డేటా ఎన్‌క్రిప్ట్ చేయబడి సురక్షితంగా నిల్వ చేయబడుతుంది.",
    "settings.logout": "లాగ్ అవుట్",
    
    // Nav
    "nav.home": "హోమ్",
    "nav.history": "చరిత్ర",
    "nav.diet": "ఆహారం",
    "nav.settings": "సెట్టింగ్‌లు",

    // Common
    "common.back": "వెనుకకు",
  },
};
