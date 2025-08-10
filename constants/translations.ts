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
    analyzingInterview: string;
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
    termsAcceptText: string;
    termsLinkText: string;
    termsErrorText: string;
  };
}

export const translations: Record<string, Translations> = {
  en: {
    home: {
      title: "Begin a smarter journey to your next role.",
      subtitle: "Let the AI interview highlight your skills beyond a résumé, unlocking ideal, bias-free opportunities for you.",
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
      thankYouSubtitle: "Interview completed on",
      analyzingInterview: "Analyzing the interview..."
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
      ],
      termsAcceptText: "I accept the Terms and Conditions and agree to the processing of my data for interview purposes.",
      termsLinkText: "Terms and Conditions",
      termsErrorText: "Please accept the terms and conditions to continue."
    }
  },
  ar: {
    home: {
      title: "ابدأ الرحلة الذكية نحو وظيفتك القادمة",
      subtitle: "دع المقابلة الفورية مع الذكاء الصناعي تُظهر خبراتك ومهاراتك بدقة تتجاوز السيرة الذاتية، وتفتح لك باب الترشيح للفرص المثالية التي تناسبك تمامًا… بلا تحيز."
,
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
      thankYouSubtitle: "تم إكمال المقابلة في",
      analyzingInterview: "جاري تحليل المقابلة..."
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
      ],
      termsAcceptText: "أوافق على الشروط والأحكام وأوافق على معالجة بياناتي لأغراض المقابلة.",
      termsLinkText: "الشروط والأحكام",
      termsErrorText: "يرجى الموافقة على الشروط والأحكام للمتابعة."
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