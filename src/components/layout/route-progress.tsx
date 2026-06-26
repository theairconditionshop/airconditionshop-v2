'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function RouteProgressInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const key = pathname + '?' + searchParams.toString()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible]   = useState(false)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevKey = useRef(key)

  useEffect(() => {
    if (key === prevKey.current) return
    prevKey.current = key

    // Reset
    if (timerRef.current) clearTimeout(timerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setProgress(0)
    setVisible(true)

    // Fake-progress: quickly get to ~80%, then crawl
    let p = 0
    intervalRef.current = setInterval(() => {
      p += p < 40 ? 10 : p < 70 ? 4 : p < 85 ? 1 : 0.3
      setProgress(Math.min(p, 90))
      if (p >= 90) clearInterval(intervalRef.current!)
    }, 80)

    // Complete on next tick after path changes (route is done)
    timerRef.current = setTimeout(() => {
      clearInterval(intervalRef.current!)
      setProgress(100)
      timerRef.current = setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 400)
    }, 300)

    return () => {
      clearTimeout(timerRef.current!)
      clearInterval(intervalRef.current!)
    }
  }, [key])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 pointer-events-none">
      <div
        className="h-full bg-blue-500 transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '200ms' : '400ms',
          boxShadow: '0 0 8px 0 rgba(59,130,246,0.6)',
        }}
      />
    </div>
  )
}

export default function RouteProgress() {
  return (
    <Suspense fallback={null}>
      <RouteProgressInner />
    </Suspense>
  )
}
