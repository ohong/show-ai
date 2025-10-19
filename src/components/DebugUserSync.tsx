'use client'

import { useSupabaseUser } from '@/hooks/useSupabaseUser'
import { useState } from 'react'

export function DebugUserSync() {
  const { supabaseUser, clerkUser, loading, error } = useSupabaseUser()
  const [testResult, setTestResult] = useState<Record<string, unknown> | null>(null)
  const [testing, setTesting] = useState(false)

  const testSupabaseConnection = async () => {
    setTesting(true)
    try {
      const response = await fetch('/api/test-supabase')
      const result = await response.json()
      setTestResult(result)
    } catch {
      setTestResult({ error: 'Failed to test connection' })
    } finally {
      setTesting(false)
    }
  }

  const testUserSync = async () => {
    setTesting(true)
    try {
      const response = await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const result = await response.json()
      setTestResult(result)
    } catch {
      setTestResult({ error: 'Failed to sync user' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">Debug User Sync</h3>
      
      <div className="space-y-2">
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Error:</strong> {error || 'None'}</p>
        <p><strong>Clerk User:</strong> {clerkUser ? 'Signed In' : 'Not Signed In'}</p>
        <p><strong>Supabase User:</strong> {supabaseUser ? 'Found' : 'Not Found'}</p>
      </div>

      <div className="space-x-2">
        <button
          onClick={testSupabaseConnection}
          disabled={testing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Test Supabase Connection'}
        </button>
        
        <button
          onClick={testUserSync}
          disabled={testing || !clerkUser}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {testing ? 'Syncing...' : 'Test User Sync'}
        </button>
      </div>

      {testResult && (
        <div className="p-4 bg-white rounded border">
          <h4 className="font-semibold mb-2">Test Result:</h4>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      {supabaseUser && (
        <div className="p-4 bg-green-50 rounded border">
          <h4 className="font-semibold mb-2">Supabase User Data:</h4>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(supabaseUser, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
