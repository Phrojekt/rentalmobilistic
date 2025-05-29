import { NextRequest, NextResponse } from 'next/server';

// Função para tentar fazer o upload com retry
async function uploadWithRetry(image: string, retries = 3, timeout = 30000): Promise<Response> {
  let lastError: Error | null = null;
  
  const clientId = process.env.IMGUR_CLIENT_ID || process.env.NEXT_PUBLIC_IMGUR_CLIENT_ID;
  if (!clientId) {
    throw new Error('Imgur Client ID is not configured');
  }

  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${clientId}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image,
          type: 'base64',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${i + 1} failed:`, error);
      // Espera um pouco antes de tentar novamente (exponential backoff)
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
  
  throw lastError || new Error('Upload failed after retries');
}

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    const response = await uploadWithRetry(image);

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.data?.error || 'Failed to upload to Imgur');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in upload route:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}