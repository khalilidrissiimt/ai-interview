"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateQuestionsPage() {
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Get selected language from sessionStorage
  const language = typeof window !== "undefined" ? sessionStorage.getItem("interviewLanguage") || "en" : "en";
  const config = language === "ar"
    ? {
        model: "eleven_turbo_v2_5",
        language: "ar",
        voiceProvider: "11labs",
        voiceId: "vgsapVXnlLvlrWNbPs6y",
        transcriber: {
          model: "scribe_v1",
          language: "ar",
          provider: "11labs",
        },
      }
    : {
        model: "nova-2",
        language: "en",
        voiceProvider: "azure",
        voiceId: "en-US-AriaNeural",
      };

  useEffect(() => {
    const text = sessionStorage.getItem("resumeText");
    setResumeText(text);
    if (text) {
      generateQuestions(text, language);
    }
  }, []);

  async function generateQuestions(resume: string, language: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, language }),
      });
      if (!res.ok) throw new Error("Failed to generate questions.");
      const data = await res.json();
      setQuestions(data.questions || []);
      sessionStorage.setItem("interviewQuestions", JSON.stringify(data.questions || []));
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  const handleStartInterview = () => {
    router.push("/interview");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Generated Interview Questions</h1>
      {loading && <p>Generating questions from your resume...</p>}
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {!loading && questions.length > 0 && (
        <>
          <ul className="mb-6 list-disc list-inside max-w-2xl">
            {questions.map((q, i) => (
              <li key={i} className="mb-2">{q}</li>
            ))}
          </ul>
          <button className="btn btn-primary" onClick={handleStartInterview}>
            Start Interview
          </button>
        </>
      )}
    </div>
  );
} 