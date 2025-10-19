import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseUser } from '@/lib/clerk-supabase';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getSupabaseUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Call the Python API with hardcoded parameters
    const pythonApiResponse = await fetch(`${PYTHON_API_URL}/api/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        env: 'browserbase',
        use_proxy: true,
        persist_context: true,
        initial_url: 'https://www.google.com',
        highlight_mouse: false,
        model: 'gemini-2.5-computer-use-preview-10-2025',
      }),
    });

    if (!pythonApiResponse.ok) {
      const errorData = await pythonApiResponse.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.error || 'Python API execution failed',
          details: errorData
        },
        { status: pythonApiResponse.status }
      );
    }

    const result = await pythonApiResponse.json();

    return NextResponse.json({
      status: result.status || 'success',
      message: result.message || 'Execution completed',
      session_url: result.session_url,
      error: result.error,
    });

  } catch (error) {
    console.error('Error executing skill:', error);

    // Handle connection errors specifically
    if (error instanceof Error && error.message.includes('fetch')) {
      return NextResponse.json(
        {
          error: 'Failed to connect to execution API',
          details: 'Make sure the Python API server is running on port 8000 (uvicorn api.api_server:app --reload)'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
