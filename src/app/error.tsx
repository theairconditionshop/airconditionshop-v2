'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log to monitoring in production; avoid console exposure of stack traces
    if (process.env.NODE_ENV === 'development') {
      console.error(error)
    }
  }, [error])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Something went wrong — THE AIRCONDITION SHOP</title>
        <style>{`
          *,*::before,*::after{box-sizing:border-box}
          body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;color:#0f172a;-webkit-font-smoothing:antialiased}
          .center{min-height:100svh;display:flex;align-items:center;justify-content:center;padding:1rem}
          .card{background:#fff;border:1px solid #e2e8f0;border-radius:1rem;padding:2.5rem 2rem;max-width:26rem;width:100%;text-align:center;box-shadow:0 4px 24px -4px rgba(0,0,0,0.08)}
          .icon-wrap{width:3.5rem;height:3.5rem;border-radius:.875rem;background:#fef2f2;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem}
          h1{font-size:1.25rem;font-weight:700;margin:0 0 .5rem}
          p{font-size:.875rem;color:#64748b;margin:0 0 1.5rem;line-height:1.6}
          .digest{font-size:.7rem;color:#94a3b8;margin:1rem 0 0;font-family:monospace}
          .btn-row{display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap}
          button,a.btn{display:inline-flex;align-items:center;gap:.5rem;padding:.625rem 1.25rem;border-radius:.625rem;font-size:.875rem;font-weight:600;cursor:pointer;text-decoration:none;transition:background .15s}
          button{background:#2563eb;color:#fff;border:none}
          button:hover{background:#1d4ed8}
          a.btn{background:#f1f5f9;color:#334155;border:1px solid #e2e8f0}
          a.btn:hover{background:#e2e8f0}
        `}</style>
      </head>
      <body>
        <div className="center">
          <div className="card">
            <div className="icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>
              </svg>
            </div>
            <h1>Something went wrong</h1>
            <p>An unexpected error occurred. Try refreshing the page — if the problem persists, please contact our team.</p>
            <div className="btn-row">
              <button onClick={reset} type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                Try Again
              </button>
              <a href="/" className="btn">Go to Homepage</a>
            </div>
            {error.digest && (
              <p className="digest">Error ID: {error.digest}</p>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
