"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import { map } from "zod";
import dayjs from "dayjs";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
  words?: Array<{ word: string; start: number; end: number }>;
  timestamp?: string; // Added timestamp for duration calculation
}

// Add language to AgentProps
type AgentProps = {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: string;
  questions?: string[];
  language?: string;
  interviewerConfig?: CreateAssistantDTO;
};

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
  language: propLanguage,
  interviewerConfig,
}: AgentProps & { language?: string; interviewerConfig: CreateAssistantDTO }) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [pauseAnalysis, setPauseAnalysis] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [tone, setTone] = useState<any>("");
  const [feedback, setFeedback] = useState<any>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [showAnalysisSpinner, setShowAnalysisSpinner] = useState(false);
  const [showFeedbackCard, setShowFeedbackCard] = useState(false);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [interviewStartTime, setInterviewStartTime] = useState<number | null>(null);
  const [loadingReturnDashboard, setLoadingReturnDashboard] = useState(false);
  const [loadingCall, setLoadingCall] = useState(false);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        // Save words array if available
        const newMessage: SavedMessage = {
          role: message.role,
          content: message.transcript,
          words: message.words || [],
          timestamp: message.timestamp, // Store timestamp
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      // Only save feedback if interviewId and userId are present
      if (interviewId && userId) {
        const { success, feedbackId: id } = await createFeedback({
          interviewId,
          userId,
          transcript: messages,
          feedbackId,
        });

        console.log("Feedback creation result:", { success, id, interviewId });

        if (success && id) {
          console.log("Redirecting to feedback page for interviewId:", interviewId);
          router.push(`/interview/${interviewId}/feedback`);
          return;
        } else {
          console.log("Error saving feedback");
        }
      } else {
        console.log("Missing interviewId or userId", { interviewId, userId });
      }
      // Do not redirect to home automatically; let user view analysis first
    };

    if (callStatus === CallStatus.FINISHED) {
      setShowAnalysisSpinner(true);
      const doAnalysisAndShowFeedback = async () => {
        await analyzePausesAndTone(messages);
        if (type === "generate") {
          router.push("/");
        } else {
          await generateFeedback(messages);
          setShowAnalysisSpinner(false);
          setShowFeedbackCard(true);
        }
      };
      doAnalysisAndShowFeedback();
    }
    if (callStatus === CallStatus.ACTIVE) {
      setLoadingCall(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  // Analyze pauses and tone
  async function analyzePausesAndTone(messages: SavedMessage[]) {
    setAnalyzing(true);
    // Gather all user messages with word-level timestamps
    const userWords = messages
      .filter((msg) => msg.role === "user" && msg.words && msg.words.length > 1)
      .map((msg) => msg.words!);
    // Analyze pauses for each answer
    let allPauses: any[] = [];
    userWords.forEach((words, idx) => {
      const pauses = analyzePauses(words);
      allPauses.push({ answer: idx + 1, pauses });
    });
    setPauseAnalysis(allPauses);
    // Analyze tone for all user answers (concatenated)
    const allText = messages.filter((msg) => msg.role === "user").map((msg) => msg.content).join("\n");
    const toneResult = await analyzeTone(allText);
    setTone(toneResult);
    setAnalyzing(false);
  }

  // Pause analysis function
  function analyzePauses(words: { word: string; start: number; end: number }[], threshold = 1.5) {
    let pauses = [];
    for (let i = 1; i < words.length; i++) {
      const gap = words[i].start - words[i - 1].end;
      if (gap > threshold) {
        pauses.push({ from: words[i - 1].word, to: words[i].word, gap });
      }
    }
    return pauses;
  }

  // Tone analysis using Gemini/OpenAI
  async function analyzeTone(text: string): Promise<any> {
    try {
      const res = await fetch("/api/analyze-tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return "Could not analyze tone.";
      const data = await res.json();
      if (typeof data.tone === 'object') return data.tone;
      if (typeof data.tone === 'string') {
        // Try to extract JSON from code block or 'json' prefix
        let str = data.tone.trim();
        // Remove code block markers and 'json' prefix
        if (str.startsWith('```')) {
          str = str.replace(/^```json|^```/i, '').replace(/```$/, '').trim();
        }
        if (str.toLowerCase().startsWith('json')) {
          str = str.replace(/^json/i, '').trim();
        }
        // Try to parse as JSON, otherwise return as string
        try {
          const parsed = JSON.parse(str);
          if (typeof parsed === 'object' && parsed !== null) return parsed;
          return str;
        } catch {
          return str;
        }
      }
      return "No tone detected.";
    } catch {
      return "Could not analyze tone.";
    }
  }

  async function generateFeedback(messages: SavedMessage[]) {
    setLoadingFeedback(true);
    const MAX_CHARS = 8000;
    const transcriptText = messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n").slice(0, MAX_CHARS);
    const res = await fetch("/api/interview-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: transcriptText }),
    });
    if (res.ok) {
      const data = await res.json();
      try {
        setFeedback(typeof data.feedback === 'string' ? JSON.parse(data.feedback) : data.feedback);
      } catch {
        setFeedback({ raw: data.feedback });
      }
    } else {
      setFeedback({ raw: "Could not generate feedback." });
    }
    setLoadingFeedback(false);
  }

  // Calculate interview duration
  let interviewDuration = null;
  if (interviewStartTime) {
    let endTime = null;
    if (messages.length > 0 && messages[messages.length - 1].timestamp) {
      endTime = dayjs(messages[messages.length - 1].timestamp).valueOf();
    } else if (feedback?.createdAt) {
      endTime = dayjs(feedback.createdAt).valueOf();
    } else {
      endTime = Date.now();
    }
    const diff = dayjs(endTime).diff(dayjs(interviewStartTime), 'minute');
    const seconds = dayjs(endTime).diff(dayjs(interviewStartTime), 'second') % 60;
    interviewDuration = `${diff}m ${seconds}s`;
  }

  // Detect language from prop or sessionStorage (default to 'en')
  let language = propLanguage || 'en';
  if (!propLanguage && typeof window !== 'undefined') {
    language = sessionStorage.getItem('interviewLanguage') || 'en';
  }

  // Use interviewerConfig for voice/transcriber/model
  const config = interviewerConfig;

  const handleCall = async () => {
    setInterviewStartTime(Date.now());
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(
        undefined,
        undefined,
        undefined,
        process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,
        {
          variableValues: {
            username: userName,
            userid: userId,
            ...config,
          },
        }
      );
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(config, {
        variableValues: {
          questions: formattedQuestions,
          ...config,
        },
      });
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    setShowAnalysisSpinner(true);
    vapi.stop();
  };

  return (
    <>
      <div className="call-view" style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"' }}>
        {/* AI Interviewer Card */}
        <div className="card-interviewer bg-black">
          <div className="avatar bg-black">
            <Image
              src="/logo.svg"
              alt="AI Interviewer Logo"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png" // Replace with your own image path if you want a personal photo
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {/* After interview, show pause and tone analysis and feedback */}
      {showAnalysisSpinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 rounded-2xl p-8 flex flex-col items-center gap-4 min-w-[320px] relative shadow-xl">
            <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600 mb-4" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span className="text-lg font-medium text-white">Analyzing the interview...</span>
          </div>
        </div>
      )}

      {/* Feedback Card Modal */}
      {showFeedbackCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 rounded-2xl p-6 flex flex-col gap-4 min-w-[440px] w-full relative shadow-xl animate-fade-in" style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"', maxWidth: '880px' }}>
            <div className="text-center mb-0.5">
              <span className="text-2xl font-bold mb-0.5 block" style={{ color: '#a78bfa' }}>Interview Feedback</span>
            </div>
            <div className="text-center mb-0.5">
              <span className="text-base text-light-200 mb-2 block">
                Interview conducted on: {dayjs(feedback?.createdAt || Date.now()).format('MMMM D, YYYY h:mm A')}
              </span>
              {interviewDuration && (
                <span className="text-base text-light-200 mb-2 block">
                  Duration: {interviewDuration}
                </span>
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-6 w-full">
              {/* Tone Analysis (left column) */}
              <div className="md:w-1/3 w-full">
                {tone && (() => {
                  // Tone rendering logic (reuse existing)
                  if (typeof tone === 'string') {
                    let str = tone.trim();
                    if (str.startsWith('```')) {
                      str = str.replace(/^```json|^```/i, '').replace(/```$/, '').trim();
                    }
                    if (str.toLowerCase().startsWith('json')) {
                      str = str.replace(/^json/i, '').trim();
                    }
                    if (str.startsWith('{') && str.endsWith('}')) {
                      try {
                        const parsed = JSON.parse(str);
                        return (
                          <div className="w-full bg-zinc-800 rounded-xl p-6 mb-6 mt-2 flex flex-col gap-3 border border-zinc-700 shadow-sm">
                            <div className="flex flex-col gap-2 mb-1 w-full">
                              {parsed.confidence && <div className="text-blue-200 text-sm font-semibold">Confidence: <span className="text-white">{parsed.confidence}</span></div>}
                              {parsed.tone && <div className="text-purple-200 text-sm font-semibold">Tone: <span className="text-white">{parsed.tone}</span></div>}
                              {parsed.energy && <div className="text-yellow-200 text-sm font-semibold">Energy: <span className="text-white">{parsed.energy}</span></div>}
                            </div>
                            {parsed.summary && <div className="text-light-100 text-base italic mt-1">{parsed.summary}</div>}
                          </div>
                        );
                      } catch {}
                    }
                    // Fallback: show as string
                    return (
                      <div className="w-full bg-zinc-800 rounded-xl p-5 mb-4 border border-zinc-700 shadow-sm">
                        <span className="text-light-100 text-base italic">{tone}</span>
                      </div>
                    );
                  }
                  if (typeof tone === 'object' && !Array.isArray(tone) && (tone.confidence || tone.tone || tone.energy || tone.summary)) {
                    return (
                      <div className="w-full bg-zinc-800 rounded-xl p-6 mb-6 mt-2 flex flex-col gap-3 border border-zinc-700 shadow-sm">
                        <div className="flex flex-col gap-2 mb-1 w-full">
                          {tone.confidence && <div className="text-blue-200 text-sm font-semibold">Confidence: <span className="text-white">{tone.confidence}</span></div>}
                          {tone.tone && <div className="text-purple-200 text-sm font-semibold">Tone: <span className="text-white">{tone.tone}</span></div>}
                          {tone.energy && <div className="text-yellow-200 text-sm font-semibold">Energy: <span className="text-white">{tone.energy}</span></div>}
                        </div>
                        {tone.summary && <div className="text-light-100 text-base italic mt-1">{tone.summary}</div>}
                      </div>
                    );
                  }
                  // Fallback: show as string
                  return (
                    <div className="w-full bg-zinc-800 rounded-xl p-5 mb-4 border border-zinc-700 shadow-sm">
                      <span className="text-light-100 text-base italic">{String(tone)}</span>
                    </div>
                  );
                })()}
              </div>
              {/* Feedback (right column) */}
              <div className="md:w-2/3 w-full">
                {/* Existing feedback rendering logic (reuse existing) */}
                <div className="w-full flex-1 px-1 max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500" style={{lineHeight: '1.7', wordBreak: 'break-word'}}>
                  {/* New feedback structure rendering */}
                  {feedback && !feedback.raw && typeof feedback === 'object' && feedback.final_assessment ? (
                    (() => {
                      const sectionOrder = [
                        { key: 'communication', label: 'Communication' },
                        { key: 'analytical_thinking_problem_solving', label: 'Analytical Thinking & Problem Solving' },
                        { key: 'technical_depth_accuracy', label: 'Technical Depth & Accuracy' },
                        { key: 'adaptability_learning_mindset', label: 'Adaptability & Learning Mindset' },
                        { key: 'motivation', label: 'Motivation' },
                        { key: 'confidence', label: 'Confidence' },
                        { key: 'collaboration_teamwork', label: 'Collaboration & Teamwork' },
                        { key: 'accountability_ownership', label: 'Accountability & Ownership' },
                        { key: 'cultural_fit_values_alignment', label: 'Cultural Fit & Values Alignment' },
                        { key: 'leadership_influence', label: 'Leadership & Influence' },
                        { key: 'decision_making_quality', label: 'Decision Making Quality' },
                        { key: 'time_management_prioritization', label: 'Time Management & Prioritization' },
                        { key: 'emotional_intelligence', label: 'Emotional Intelligence' },
                      ];
                      return (
                        <>
                          {sectionOrder.map(({ key, label }) =>
                            feedback[key] ? (
                              <section key={key} className="mb-6">
                                <span className="block font-bold text-primary-200 mb-1 text-lg">{label}</span>
                                <span className="text-light-100 whitespace-pre-line">{feedback[key]}</span>
                                <hr className="my-6 border-zinc-700" />
                              </section>
                            ) : null
                          )}
                          <section className="mb-6">
                            <span className="block font-bold text-primary-200 mb-1 text-lg">Final Assessment</span>
                            <span className="text-light-100 whitespace-pre-line">{feedback.final_assessment}</span>
                          </section>
                        </>
                      );
                    })()
                  ) : feedback && !feedback.raw && (
                    <>
                      {/* Communication Skills */}
                      {feedback.communication_summary && (
                        <div className="mb-4">
                          <h4
                            className="text-lg font-semibold mb-1 border-b pb-1"
                            style={{ color: '#a78bfa', borderColor: '#a78bfa' }}
                          >
                            Communication Skills
                          </h4>
                          <div
                            className="whitespace-pre-line"
                            style={{ color: '#ddd6fe' }}
                          >
                            {feedback.communication_summary}
                          </div>
                        </div>
                      )}
                      {/* Technical Knowledge */}
                      {feedback.technical_summary && (
                        <div className="mb-4">
                          <h4
                            className="text-lg font-semibold mb-1 border-b pb-1"
                            style={{ color: '#a78bfa', borderColor: '#a78bfa' }}
                          >
                            Technical Knowledge
                          </h4>
                          <div
                            className="whitespace-pre-line"
                            style={{ color: '#ddd6fe' }}
                          >
                            {feedback.technical_summary}
                          </div>
                        </div>
                      )}
                      {/* Problem-Solving */}
                      {feedback.problem_solving_summary && (
                        <div className="mb-4">
                          <h4
                            className="text-lg font-semibold mb-1 border-b pb-1"
                            style={{ color: '#a78bfa', borderColor: '#a78bfa' }}
                          >
                            Problem-Solving
                          </h4>
                          <div
                            className="whitespace-pre-line"
                            style={{ color: '#ddd6fe' }}
                          >
                            {feedback.problem_solving_summary}
                          </div>
                        </div>
                      )}
                      {/* Cultural Fit */}
                      {feedback.culture_fit_summary && (
                        <div className="mb-4">
                          <h4
                            className="text-lg font-semibold mb-1 border-b pb-1"
                            style={{ color: '#a78bfa', borderColor: '#a78bfa' }}
                          >
                            Cultural & Role Fit
                          </h4>
                          <div
                            className="whitespace-pre-line"
                            style={{ color: '#ddd6fe' }}
                          >
                            {feedback.culture_fit_summary}
                          </div>
                        </div>
                      )}
                      {/* Confidence & Clarity */}
                      {feedback.confidence_summary && (
                        <div className="mb-4">
                          <h4
                            className="text-lg font-semibold mb-1 border-b pb-1"
                            style={{ color: '#a78bfa', borderColor: '#a78bfa' }}
                          >
                            Confidence & Clarity
                          </h4>
                          <div
                            className="whitespace-pre-line"
                            style={{ color: '#ddd6fe' }}
                          >
                            {feedback.confidence_summary}
                          </div>
                        </div>
                      )}

                      {/* Final Assessment */}
                      {feedback.finalAssessment && (
                        <div className="mb-4">
                          <h4
                            className="text-lg font-semibold mb-1 border-b pb-1"
                            style={{ color: '#a78bfa', borderColor: '#a78bfa' }}
                          >
                            Final Assessment
                          </h4>
                          <div
                            className="whitespace-pre-line"
                            style={{ color: '#ddd6fe' }}
                          >
                            {feedback.finalAssessment}
                          </div>
                        </div>
                      )}
                      {/* Category Breakdown */}
                      {feedback.categoryScores && feedback.categoryScores.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-lg font-semibold text-primary-200 mb-2 border-b border-primary-900 pb-1">Breakdown by Category</h4>
                    <ul className="space-y-2">
                            {feedback.categoryScores.map((cat: any, idx: number) => (
                              <li key={idx} className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-2">
                          <span className="font-bold text-light-100">{cat.name}:</span>
                          <span className="text-green-400 font-semibold">{cat.score}/100</span>
                          <span className="text-light-100">{cat.comment}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Strengths */}
                      {feedback.strengths && feedback.strengths.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-lg font-semibold text-green-400 mb-1 border-b border-green-900 pb-1">Strengths</h4>
                    <ul className="list-disc ml-6 text-light-100">
                            {feedback.strengths.map((s: string, i: number) => <li key={i} className="mb-2">{s}</li>)}
                    </ul>
                  </div>
                )}
                {/* Areas for Improvement */}
                      {feedback.areasForImprovement && feedback.areasForImprovement.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-lg font-semibold text-red-400 mb-1 border-b border-red-900 pb-1">Areas for Improvement</h4>
                    <ul className="list-disc ml-6 text-light-100">
                            {feedback.areasForImprovement.map((a: string, i: number) => <li key={i} className="mb-2">{a}</li>)}
                    </ul>
                  </div>
                )}
                {/* Communication Analysis as bullet points */}
                {pauseAnalysis && pauseAnalysis.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-lg font-semibold text-primary-200 mb-1 border-b border-primary-900 pb-1">Communication Analysis</h4>
                    <ul className="list-disc ml-6 text-light-100">
                      {pauseAnalysis.map((ans, idx) => (
                              <li key={idx} className="mb-2">
                          Answer {ans.answer}: {ans.pauses.length} pause(s)
                          {ans.pauses.length > 0 && (
                            <ul className="list-disc ml-6">
                                    {ans.pauses.map((p: any, i: number) => (
                                      <li key={i} className="mb-1">
                                  Pause of {p.gap.toFixed(2)}s between "{p.from}" and "{p.to}"
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* Action Buttons - sticky/fixed at bottom */}
            <div className="flex gap-4 w-full justify-center mt-2 sticky bottom-0 bg-zinc-900 pt-4 pb-2 z-10 rounded-b-2xl">
              <button
                className="max-w-xs mx-auto text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
                onClick={() => {
                  setLoadingReturnDashboard(true);
                  router.push("/");
                }}
                disabled={loadingReturnDashboard}
              >
                {loadingReturnDashboard ? (
                  <svg aria-hidden="true" className="inline w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600 mr-2" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                  </svg>
                ) : "Return to Dashboard"}
              </button>
              {interviewId && (
                <button className="btn btn-secondary px-6 py-2 rounded-full text-base font-semibold" onClick={() => router.push(`/interview/${interviewId}`)}>Retake Interview</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center mt-8">
        {callStatus !== "ACTIVE" ? (
          <button
            className="relative btn-call"
            onClick={() => {
              setLoadingCall(true);
              handleCall();
            }}
            disabled={loadingCall}
          >
            {loadingCall ? (
              <svg aria-hidden="true" className="inline w-5 h-5 text-white animate-spin mr-2" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
            ) : (
              <span className="relative">
                {callStatus === "INACTIVE" || callStatus === "FINISHED"
                  ? "Call"
                  : ". . ."}
              </span>
            )}
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
