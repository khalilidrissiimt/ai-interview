import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

export async function POST(req: NextRequest) {
  try {
    const { transcript, feedback, candidateName, timestamp } = await req.json();
    
    // Create the directory path
    const baseDir = "C:\\Users\\monsi\\Desktop\\upwork\\interview_ai";
    const timestampStr = new Date(timestamp).toISOString().replace(/[:.]/g, '-');
    const safeCandidateName = candidateName.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Create files with timestamp and candidate name
    const transcriptFileName = `transcript_${safeCandidateName}_${timestampStr}.txt`;
    const feedbackFileName = `feedback_${safeCandidateName}_${timestampStr}.txt`;
    
    const transcriptPath = join(baseDir, transcriptFileName);
    const feedbackPath = join(baseDir, feedbackFileName);
    
    // Ensure directory exists
    try {
      mkdirSync(baseDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
    
    // Write transcript file
    writeFileSync(transcriptPath, transcript, 'utf8');
    
    // Write feedback file
    writeFileSync(feedbackPath, feedback, 'utf8');
    
    console.log(`✅ Files saved successfully:`);
    console.log(`📄 Transcript: ${transcriptPath}`);
    console.log(`📄 Feedback: ${feedbackPath}`);
    
    return NextResponse.json({ 
      success: true, 
      transcriptFile: transcriptFileName,
      feedbackFile: feedbackFileName
    });
    
  } catch (error) {
    console.error("❌ Error saving files:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
} 