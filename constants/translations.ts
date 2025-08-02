export interface Translations {
  home: {
    title: string;
    subtitle: string;
    uploadButton: string;
    redirectingText: string;
  };
  navigation: {
    home: string;
    aboutUs: string;
    language: string;
  };
  interview: {
    title: string;
    returnToDashboard: string;
    callButton: string;
    endButton: string;
    retakeInterview: string;
    thankYouTitle: string;
    thankYouMessage: string;
    thankYouSubtitle: string;
  };
  upload: {
    title: string;
    subtitle: string;
    uploadButton: string;
    dragDropText: string;
    emailPlaceholder: string;
    extractingText: string;
    startInterviewText: string;
    readyToStartText: string;
    progressSteps: string[];
  };
}

export const translations: Record<string, Translations> = {
  en: {
    home: {
      title: "AI-Powered Interview Practice",
      subtitle: "Want Interview Questions That Actually Match Your Resume?",
      uploadButton: "Upload Resume & Start",
      redirectingText: "Redirecting to resume upload..."
    },
    navigation: {
      home: "Home",
      aboutUs: "About Us",
      language: "Language"
    },
    interview: {
      title: "Interview",
      returnToDashboard: "Return to Dashboard",
      callButton: "Call",
      endButton: "End",
      retakeInterview: "Retake Interview",
      thankYouTitle: "Thank You!",
      thankYouMessage: "Your interview has been completed successfully. We've saved your responses and will provide you with detailed feedback shortly.",
      thankYouSubtitle: "Interview completed on"
    },
    upload: {
      title: "Upload Resume",
      subtitle: "Upload your resume to get personalized interview questions",
      uploadButton: "Upload Resume",
      dragDropText: "Click to upload or drag and drop",
      emailPlaceholder: "Enter your email",
      extractingText: "Extracting...",
      startInterviewText: "Start Interview",
      readyToStartText: "Ready to start your interview!",
      progressSteps: [
        "Analyzing your CV…",
        "Analyzing your skills…",
        "Generating questions…"
      ]
    }
  },
  ar: {
    home: {
      title: "تدريب المقابلات بالذكاء الاصطناعي",
      subtitle: "هل تريد أسئلة مقابلة تتطابق فعلاً مع سيرتك الذاتية؟",
      uploadButton: "رفع السيرة الذاتية والبدء",
      redirectingText: "إعادة التوجيه لرفع السيرة الذاتية..."
    },
    navigation: {
      home: "الرئيسية",
      aboutUs: "من نحن",
      language: "اللغة"
    },
    interview: {
      title: "المقابلة",
      returnToDashboard: "العودة إلى لوحة التحكم",
      callButton: "اتصال",
      endButton: "إنهاء",
      retakeInterview: "إعادة المقابلة",
      thankYouTitle: "شكراً لك!",
      thankYouMessage: "تم إكمال مقابلتك بنجاح. لقد حفظنا ردودك وسنقدم لك تقييماً مفصلاً قريباً.",
      thankYouSubtitle: "تم إكمال المقابلة في"
    },
    upload: {
      title: "رفع السيرة الذاتية",
      subtitle: "ارفع سيرتك الذاتية للحصول على أسئلة مقابلة مخصصة",
      uploadButton: "رفع السيرة الذاتية",
      dragDropText: "انقر للرفع أو اسحب وأفلت",
      emailPlaceholder: "أدخل بريدك الإلكتروني",
      extractingText: "جاري الاستخراج...",
      startInterviewText: "ابدأ المقابلة",
      readyToStartText: "جاهز لبدء مقابلتك!",
      progressSteps: [
        "جاري تحليل سيرتك الذاتية…",
        "جاري تحليل مهاراتك…",
        "جاري إنشاء الأسئلة…"
      ]
    }
  }
};

export const getTranslation = (lang: string, key: string): string => {
  const langTranslations = translations[lang] || translations.en;
  const keys = key.split('.');
  let value: any = langTranslations;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }
  
  return value || key;
}; 