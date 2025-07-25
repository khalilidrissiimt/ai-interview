import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ tone: "No text provided." }, { status: 400 });
    }

    const { text: tone } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `
    You are an AI communication analyst.
    
    Analyze the tone, confidence, and energy of the candidate's responses. Focus on verbal cues such as filler words ("um", "uh"), hesitations, vocal tone, emotional expressiveness, pace, and overall delivery.
    
    Return your response strictly in the following JSON format:
    
    {
      "confidence": "<low | medium | high>",
      "tone": "<professional | informal | nervous | enthusiastic | monotone | etc.>",
      "energy": "<low | medium | high>",
      "summary": "<2-3 sentence narrative on overall impression>"
    }
    
    Answers:
    ${text}
    `,
    });
    

    return NextResponse.json({ tone });
  } catch (error: any) {
    return NextResponse.json({ tone: "Could not analyze tone." }, { status: 500 });
  }
} 