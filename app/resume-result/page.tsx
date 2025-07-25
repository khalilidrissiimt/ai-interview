"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ResumeResultPage() {
  const [text, setText] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setText(sessionStorage.getItem("resumeText"));
    setEmail(sessionStorage.getItem("resumeEmail"));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Resume Extraction Result</h1>
      {email && (
        <div className="mb-4">
          <span className="font-semibold">Email:</span> <span className="font-mono">{email}</span>
        </div>
      )}
      {text ? (
        <pre className="bg-gray-100 p-4 rounded w-full max-w-2xl overflow-auto whitespace-pre-wrap mb-4">{text}</pre>
      ) : (
        <p>No resume text found. Please upload your resume again.</p>
      )}
      <Link href="/" className="btn btn-primary mt-4">Continue</Link>
    </div>
  );
} 