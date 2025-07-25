"use client";
import { useEffect, useState } from "react";

export default function InterviewAnalysisPage() {
  const [pauses, setPauses] = useState<any[]>([]);
  const [tone, setTone] = useState("");
  const [transcript, setTranscript] = useState<any[]>([]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    setPauses(JSON.parse(sessionStorage.getItem("interviewPauses") || "[]"));
    setTone(sessionStorage.getItem("interviewTone") || "");
    setTranscript(JSON.parse(sessionStorage.getItem("interviewTranscript") || "[]"));
  }, []);

  useEffect(() => {
    if (transcript.length > 0 && !hasGenerated) {
      setHasGenerated(true);
      generateFeedback(transcript);
    }
    // eslint-disable-next-line
  }, [transcript, hasGenerated]);

  async function generateFeedback(transcript: any[]) {
    setLoading(true);
    const transcriptText = transcript.map((msg) => `${msg.role}: ${msg.content}`).join("\n");
    const res = await fetch("/api/interview-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: transcriptText }),
    });
    if (res.ok) {
      const data = await res.json();
      setFeedback(data.feedback);
    } else {
      setFeedback("Could not generate feedback.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Interview Analysis</h2>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Communication Analysis</h3>
        <div className="mb-2">
          <strong>Pauses Detected:</strong>
          <ul className="list-disc ml-6">
            {pauses.map((ans, idx) => (
              <li key={idx}>
                Answer {ans.answer}: {ans.pauses.length} pause(s)
                {ans.pauses.length > 0 && (
                  <ul className="list-disc ml-6">
                    {ans.pauses.map((p: any, i: number) => (
                      <li key={i}>
                        Pause of {p.gap.toFixed(2)}s between "{p.from}" and "{p.to}"
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <strong>Tone Analysis:</strong> {tone}
        </div>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Interview Feedback</h3>
        {loading ? <p>Generating feedback...</p> : <p>{feedback}</p>}
      </div>
      <div className="flex justify-end">
        <button className="btn btn-primary" onClick={() => window.location.href = "/"}>Return to Home</button>
      </div>
    </div>
  );
} 