import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseUser } from '@/lib/clerk-supabase';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return new Response(
        `data: ${JSON.stringify({ type: 'error', message: 'Query is required' })}\n\n`,
        {
          status: 400,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      );
    }

    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return new Response(
        `data: ${JSON.stringify({ type: 'error', message: 'Unauthorized' })}\n\n`,
        {
          status: 401,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      );
    }

    const user = await getSupabaseUser();
    if (!user) {
      return new Response(
        `data: ${JSON.stringify({ type: 'error', message: 'User not found' })}\n\n`,
        {
          status: 404,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      );
    }

    // Call the Python API streaming endpoint
    const pythonApiResponse = await fetch(`${PYTHON_API_URL}/api/execute-stream`, {
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
      return new Response(
        `data: ${JSON.stringify({ type: 'error', message: `Python API returned ${pythonApiResponse.status}` })}\n\n`,
        {
          status: pythonApiResponse.status,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      );
    }

    // Stream the response from Python API to client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = pythonApiResponse.body?.getReader();
        if (!reader) {
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ type: 'error', message: 'No response body from Python API' })}\n\n`
            )
          );
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ type: 'error', message: error instanceof Error ? error.message : 'Streaming error' })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (error) {
    console.error('Error in streaming endpoint:', error);

    return new Response(
      `data: ${JSON.stringify({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Make sure the Python API server is running on port 8000'
      })}\n\n`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    );
  }
}
