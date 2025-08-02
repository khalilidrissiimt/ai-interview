import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get('file');
    
    console.log("🔍 Dashboard resume URL request:", {
      url: req.url,
      filePath: filePath,
      hasFilePath: !!filePath
    });
    
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
    
    // Generate signed URL for the file (valid for 24 hours for better UX)
    console.log("📁 Attempting to create signed URL for file:", filePath);
    
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('cvs')
      .createSignedUrl(filePath, 86400); // 24 hours expiry
    
    if (signedUrlError) {
      console.error("❌ Error generating signed URL:", signedUrlError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to generate signed URL: ${signedUrlError.message}` 
      }, { status: 500 });
    }
    
    console.log("✅ Dashboard signed URL generated for file:", filePath);
    
    // Redirect to the signed URL
    return NextResponse.redirect(signedUrlData.signedUrl);
    
  } catch (error) {
    console.error("❌ Error generating dashboard resume URL:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
} 