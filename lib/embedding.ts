import { pipeline } from '@xenova/transformers';

// Global cache so the model loads only once
let embedder: any = null;

export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    if (!embedder) {
      console.log("🔄 Loading embedding model...");
      
      // Configure for serverless environment
      embedder = await pipeline('feature-extraction', 'Xenova/e5-large-v2', {
        cache_dir: '/tmp/transformers-cache', // Use /tmp for Vercel
        quantized: false, // Disable quantization for better compatibility
      });
    }

    // Add "query: " prefix for correct behavior of e5 models
    const processed = await embedder(`query: ${text}`, {
      pooling: 'mean',
      normalize: true,
    });

    return Array.from(processed.data);
  } catch (error) {
    console.error("❌ Error generating embedding:", error);
    // Return a fallback embedding or null
    return null;
  }
} 