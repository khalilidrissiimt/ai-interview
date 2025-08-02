import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

// Function to flatten feedback JSON into plain text
function flattenFeedback(feedback: any): string {
  if (!feedback) return "";
  
  let text = "";
  
  // Handle different feedback structures
  if (typeof feedback === 'string') {
    return feedback;
  }
  
  if (typeof feedback === 'object') {
    // Handle structured feedback with sections
    if (feedback.final_assessment) {
      text += `Final Assessment: ${feedback.final_assessment}\n`;
    }
    
    // Add individual section scores and comments
    const sections = [
      'communication', 'analytical_thinking_problem_solving', 'technical_depth_accuracy',
      'adaptability_learning_mindset', 'motivation', 'confidence', 'collaboration_teamwork',
      'accountability_ownership', 'cultural_fit_values_alignment', 'leadership_influence',
      'decision_making_quality', 'time_management_prioritization', 'emotional_intelligence'
    ];
    
    sections.forEach(section => {
      if (feedback[section]) {
        const sectionData = feedback[section];
        if (typeof sectionData === 'object') {
          text += `${section.replace(/_/g, ' ').toUpperCase()}: `;
          if (sectionData.score) text += `Score: ${sectionData.score}/10. `;
          if (sectionData.comments) text += `Comments: ${sectionData.comments}. `;
          if (sectionData.strengths && Array.isArray(sectionData.strengths)) {
            text += `Strengths: ${sectionData.strengths.join(', ')}. `;
          }
          if (sectionData.areas_for_improvement && Array.isArray(sectionData.areas_for_improvement)) {
            text += `Areas for improvement: ${sectionData.areas_for_improvement.join(', ')}. `;
          }
          text += '\n';
        } else if (typeof sectionData === 'string') {
          text += `${section.replace(/_/g, ' ').toUpperCase()}: ${sectionData}\n`;
        }
      }
    });
    
    // Handle legacy feedback structure
    if (feedback.strengths && Array.isArray(feedback.strengths)) {
      text += `Strengths: ${feedback.strengths.join(', ')}\n`;
    }
    if (feedback.areasForImprovement && Array.isArray(feedback.areasForImprovement)) {
      text += `Areas for improvement: ${feedback.areasForImprovement.join(', ')}\n`;
    }
    if (feedback.raw) {
      text += `Raw feedback: ${feedback.raw}\n`;
    }
  }
  
  return text.trim();
}

// Function to extract skills from resume text using Gemini
async function extractSkillsFromResume(resumeText: string): Promise<string | null> {
  try {
    const prompt = `Extract all technical skills, programming languages, tools, frameworks, and technologies from this resume text. 
    
    Return ONLY a comma-separated list of skills without any additional text, formatting, or explanations.
    
    Examples of expected output:
    - python, sql, javascript, react, docker, aws
    - java, spring boot, mysql, git, kubernetes, jenkins
    - c++, matlab, arduino, mechatronics, robotics, python
    
    Resume text:
    ${resumeText}
    
    Skills:`;

    const { text: skills } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt,
    });
    
    console.log("✅ Skills extracted:", skills);
    return skills.trim();
  } catch (error) {
    console.error('❌ Error extracting skills:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { 
      transcript, 
      feedback, 
      candidateName, 
      duration, 
      tone, 
      language, 
      userId, 
      interviewId,
      email,
      resumeFile,
      resumeFileName,
      resumeFileType,
      resumeText
    } = await req.json();
    
    console.log("📊 Received data for Supabase:", {
      candidateName,
      duration,
      tone: tone ? "Present" : "Missing",
      toneType: typeof tone,
      toneData: tone,
      email: email ? "Present" : "Missing",
      hasResume: !!resumeFile,
      fileName: resumeFileName,
      fileType: resumeFileType,
      fileSize: resumeFile ? Math.round(resumeFile.length * 0.75) : 0, // Approximate size in bytes
      hasResumeText: !!resumeText
    });
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Upload resume file to Supabase storage bucket
    let resumeFilePath = null;
    let signedUrl = null;
    if (resumeFile) {
      try {
        // Validate base64 string
        if (typeof resumeFile !== 'string' || resumeFile.length < 100) {
          throw new Error("Invalid or too small base64 file data");
        }
        
        // Convert base64 string to buffer
        const buffer = Buffer.from(resumeFile, 'base64');
        
        // Validate buffer size (should be at least 1KB for a resume)
        if (buffer.length < 1024) {
          throw new Error(`File too small: ${buffer.length} bytes`);
        }
        
        console.log("📁 File upload details:", {
          originalName: resumeFileName,
          contentType: resumeFileType,
          bufferSize: buffer.length,
          base64Length: resumeFile.length
        });
        
        // Generate unique filename with original extension
        const fileExtension = resumeFileName ? resumeFileName.split('.').pop() : 'pdf';
        const uniqueFileName = `resume_${interviewId}_${Date.now()}.${fileExtension}`;

        // Upload to Supabase storage
        const { error: uploadError } = await supabase
          .storage
          .from('cvs')
          .upload(uniqueFileName, buffer, {
            contentType: resumeFileType || 'application/pdf',
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        // Store the file path and generate direct signed URL
        resumeFilePath = uniqueFileName;
        
        // Generate a direct signed URL for immediate access
        const { data: signedUrlData, error: signedUrlError } = await supabase
          .storage
          .from('cvs')
          .createSignedUrl(uniqueFileName, 3600); // 1 hour expiry
        
        if (signedUrlError) {
          console.error("❌ Error generating initial signed URL:", signedUrlError);
        } else {
          console.log("✅ Initial signed URL generated:", signedUrlData.signedUrl);
          signedUrl = signedUrlData.signedUrl;
        }
        
        console.log("✅ Resume file uploaded successfully:", {
          fileName: uniqueFileName,
          size: buffer.length,
          path: resumeFilePath,
          signedUrl: signedUrl || "Failed to generate",
          note: "Direct signed URL generated for immediate access"
        });
      } catch (uploadError) {
        console.error("❌ Error uploading resume file:", uploadError);
      }
    }
    
    // Extract skills from resume text
    let extractedSkills = null;
    if (resumeText) {
      try {
        // Extract skills as comma-separated list
        extractedSkills = await extractSkillsFromResume(resumeText);
        console.log("✅ Skills extracted from resume:", extractedSkills);
      } catch (skillsError) {
        console.error("❌ Error extracting skills:", skillsError);
      }
    }
    

    
    // Make request to Supabase using fetch (Edge-safe approach)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    console.log("📊 Tone data being sent to Supabase:", {
      toneType: typeof tone,
      toneValue: tone,
      toneStringified: JSON.stringify(tone)
    });
    
    // Prepare the data for Supabase insertion
    // For now, use localhost for development. In production, set NEXT_PUBLIC_APP_URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const supabaseData: any = {
      interview_id: interviewId,
      user_id: userId,
      candidate_name: candidateName,
      duration: duration,
      language: language || 'en',
      transcript: transcript,
      feedback: feedback,
      tone: tone,
      "Email": email, // Correct column name
      "CV/Resume": resumeFilePath ? `${appUrl}/api/dashboard-resume-url?file=${encodeURIComponent(resumeFilePath)}` : null, // API URL that generates fresh signed URLs
    };
    
    // Add skills as text
    if (extractedSkills) {
      supabaseData.skills = extractedSkills;
      console.log("✅ Skills text added to Supabase data");
    }
    
    console.log("📊 Final Supabase data structure:", {
      hasSkillsText: !!supabaseData.skills,
      skillsTextType: typeof supabaseData.skills,
      resumeUrl: supabaseData["CV/Resume"] || "None",
      note: "Resume stored as clickable URL for dashboard access - generates signed URL on-demand"
    });
    
    // Log the exact data being sent
    console.log("📤 Sending to Supabase:", JSON.stringify(supabaseData, null, 2));
    
    const response = await fetch(`${supabaseUrl}/rest/v1/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(supabaseData)
    });
    
    if (response.ok) {
      console.log("✅ Interview data saved to Supabase successfully");
      return NextResponse.json({ success: true });
    } else {
      let errorData = "Unknown error";
      try {
        errorData = await response.text();
        console.error("❌ Supabase error response:", errorData);
      } catch (parseError) {
        console.error("❌ Could not parse error response:", parseError);
        errorData = `Status: ${response.status}, StatusText: ${response.statusText}`;
      }
      
      return NextResponse.json({ 
        success: false, 
        error: `Supabase error: ${response.status} - ${errorData}` 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("❌ Error saving interview data:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
} 