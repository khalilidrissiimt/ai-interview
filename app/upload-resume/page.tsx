"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import { useEffect } from "react";
import Cookies from "js-cookie";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "Arabic" },
];

export default function UploadResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [showStartCard, setShowStartCard] = useState(false);
  const progressSteps = [
    "Analyzing your CV…",
    "Analyzing your skills…",
    "Generating questions…"
  ];
  const [loadingStartInterview, setLoadingStartInterview] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
      setShowModal(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError("");
      setShowModal(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setShowProgress(true);
    setProgressStep(0);
    setError("");
    // Animate progress steps
    for (let i = 0; i < progressSteps.length; i++) {
      setProgressStep(i);
      // eslint-disable-next-line no-await-in-loop
      await new Promise(res => setTimeout(res, 1200));
    }
    // Actually extract resume text
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);
    let resumeText = "";
    try {
      const res = await fetch("/api/extract-resume", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to extract resume text.");
      const data = await res.json();
      console.log("API extract-resume response:", data);
      if (data.text) {
        resumeText = data.text;
        // Clear old session data before saving new
        sessionStorage.removeItem("interviewQuestions");
        sessionStorage.removeItem("interviewLanguage");
        sessionStorage.setItem("resumeText", data.text);
        sessionStorage.setItem("resumeEmail", email);
        sessionStorage.setItem("interviewLanguage", language);
        if (data.name) {
          console.log("Extracted name from API:", data.name);
          sessionStorage.setItem("candidateName", data.name);
        }
      } else {
        setError("No text extracted from PDF.");
        setShowProgress(false);
        return;
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      setShowProgress(false);
      return;
    }
    // Generate questions in the background
    try {
      console.log("Sending language to API:", language);
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeText, language }),
      });
      if (!res.ok) throw new Error("Failed to generate questions.");
      const data = await res.json();
      console.log("Questions received:", data.questions);
      if (data.questions) {
        sessionStorage.setItem("interviewQuestions", JSON.stringify(data.questions));
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while generating questions.");
      setShowProgress(false);
      return;
    }
    setShowProgress(false);
    setShowStartCard(true);
  };

  const handleStartInterview = () => {
    setLoadingStartInterview(true);
    const token = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    sessionStorage.setItem("interviewToken", token);
    Cookies.set("interviewToken", token, { path: "/", sameSite: "strict" });
    setTimeout(() => {
      router.push(`/interview?token=${token}`);
    }, 100);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent p-4">
      <div className="w-full max-w-md p-4 border border-zinc-700 rounded-lg shadow-sm sm:p-6 md:p-8 bg-zinc-900" style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"' }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-xl font-medium text-white text-center">Upload Your Resume</h1>
          <p className="text-zinc-400 text-center">Upload your PDF resume and select your language to get personalized interview questions.</p>
          {/* Drag and drop or browse area always visible */}
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="resume-upload"
              className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-lg cursor-pointer bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              onDrop={(e) => handleDrop(e)}
              onDragOver={(e) => handleDragOver(e)}
            >
              <div className="flex flex-col items-center justify-center pt-4 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                {file ? (
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{file.name}</span>
                ) : (
                  <>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF only (max 10MB)</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                id="resume-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
              />
            </label>
          </div>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            className="block w-full p-2.5 text-sm rounded-lg border border-zinc-700 bg-zinc-800 text-white placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            disabled={loading}
            className="block w-full p-2.5 text-sm rounded-lg border border-zinc-700 bg-zinc-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
            disabled={loading}
          >
            {loading ? "Extracting..." : "Upload & Continue"}
          </button>
        </form>
      </div>
      {/* Progress Modal */}
      {showProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 rounded-2xl p-8 flex flex-col items-center gap-4 min-w-[320px] relative shadow-xl">
            <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600 mb-4" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span className="text-lg font-medium text-white">{progressSteps[progressStep]}</span>
          </div>
        </div>
      )}
      {/* Start Interview Card */}
      {showStartCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 rounded-2xl p-8 flex flex-col items-center gap-6 min-w-[320px] relative shadow-xl">
            <span className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"' }}>Ready to start your interview!</span>
            <button
              className="w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
              onClick={handleStartInterview}
              disabled={loadingStartInterview}
            >
              {loadingStartInterview ? (
                <svg aria-hidden="true" className="inline w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600 mr-2" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
              ) : "Start Interview"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 