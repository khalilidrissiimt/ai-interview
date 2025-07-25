import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: NextRequest) {
  try {
    const { resume, language } = await req.json();
    if (!resume) {
      return NextResponse.json({ error: "No resume text provided." }, { status: 400 });
    }

    // Set prompt language
    let prompt = "";
    if (language === "ar") {
      prompt = `قم بإعداد أسئلة لمقابلة عمل بناءً على السيرة الذاتية التالية. يجب أن تكون الأسئلة ذات صلة بخبرة ومهارات وخلفية المرشح. يرجى إرجاع الأسئلة فقط، بدون أي نص إضافي. صِغها كمصفوفة JSON من السلاسل النصية.\nالسيرة الذاتية:\n${resume}`;
    } else {
      prompt = `Prepare questions for a job interview based on the following resume. The questions should be relevant to the candidate's experience, skills, and background. Please return only the questions, without any additional text. Format as a JSON array of strings.\nResume:\n${resume}`;
    }

    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt,
    });

    let parsedQuestions: string[] = [];
    try {
      parsedQuestions = JSON.parse(questions);
    } catch {
      // fallback: try to split by newlines if not valid JSON
      parsedQuestions = questions.split("\n").filter(Boolean);
    }

    return NextResponse.json({ questions: parsedQuestions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate questions." }, { status: 500 });
  }
} 