'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function RouteProgress() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible]   = useState(false)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevPath = useRef(pathname)

  useEffect(() => {
    if (pathname === prevPath.current) return
    prevPath.current = pathname

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
  }, [pathname])

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
