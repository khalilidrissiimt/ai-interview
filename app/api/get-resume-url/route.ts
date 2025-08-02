import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { filePath } = await req.json();
    
    if (!filePath) {
      return NextResponse.json({ 
        success: false, 
        error: "File path is required" 
      }, { status: 400 });
    }
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Generate signed URL for the file (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('cvs')
      .createSignedUrl(filePath, 3600); // 1 hour expiry
    
    if (signedUrlError) {
      console.error("❌ Error generating signed URL:", signedUrlError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to generate signed URL: ${signedUrlError.message}` 
      }, { status: 500 });
    }
    
    console.log("✅ Signed URL generated for file:", filePath);
    
    return NextResponse.json({ 
      success: true, 
      signedUrl: signedUrlData.signedUrl 
    });
    
  } catch (error) {
    console.error("❌ Error generating resume URL:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
} 