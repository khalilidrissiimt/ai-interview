"use client";
import Agent from "@/components/Agent";
import { useEffect, useState } from "react";
import { getInterviewerConfig } from "@/constants";
import Cookies from "js-cookie";

export default function InterviewPage() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [language, setLanguage] = useState("en");
  const [showWarning, setShowWarning] = useState(false);
  const [interviewerConfig, setInterviewerConfig] = useState(getInterviewerConfig("en"));
  const [candidateName, setCandidateName] = useState("Candidate");

  useEffect(() => {
    const stored = sessionStorage.getItem("interviewQuestions");
    if (stored) {
      setQuestions(JSON.parse(stored));
    }
    const lang = sessionStorage.getItem("interviewLanguage") || "en";
    const name = sessionStorage.getItem("candidateName") || "Candidate";
    setLanguage(lang);
    setCandidateName(name);
    setInterviewerConfig(getInterviewerConfig(lang, name));
  }, []);

  useEffect(() => {
    // Clear the interviewToken cookie on mount so user cannot revisit
    Cookies.remove("interviewToken");
  }, []);

  useEffect(() => {
    // Consistency check: if questions exist, check if they match the selected language
    if (questions.length > 0 && language) {
      // Simple heuristic: check if first question contains Arabic characters if language is ar
      const isArabic = /[\u0600-\u06FF]/.test(questions[0]);
      if ((language === "ar" && !isArabic) || (language !== "ar" && isArabic)) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    }
  }, [questions, language]);

  return (
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Interview</h3>
      <Agent questions={questions} type="interview" userName={candidateName} interviewerConfig={interviewerConfig} />
    </div>
  );
}
