'use client'

/**
 * Shared motion primitives for the marketing site.
 * All primitives respect prefers-reduced-motion and target transform/opacity
 * (GPU-friendly) for 60fps. Presentation only — no data or business logic here.
 */
import {
  motion, useInView, useReducedMotion, useMotionValue, useSpring,
  animate, type Variants,
} from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode, type ElementType } from 'react'

const EASE = [0.22, 1, 0.36, 1] as const

type RevealMode = 'up' | 'blur' | 'fade' | 'right' | 'left' | 'scale'

function variantFor(mode: RevealMode, distance: number): Variants {
  const hidden: Record<string, number | string> = { opacity: 0 }
  const show: Record<string, number | string> = { opacity: 1 }
  if (mode === 'up')    { hidden.y = distance;  show.y = 0 }
  if (mode === 'right') { hidden.x = -distance; show.x = 0 }
  if (mode === 'left')  { hidden.x = distance;  show.x = 0 }
  if (mode === 'scale') { hidden.scale = 0.94;  show.scale = 1 }
  if (mode === 'blur')  { hidden.y = distance * 0.6; hidden.filter = 'blur(12px)'; show.y = 0; show.filter = 'blur(0px)' }
  return { hidden, show }
}

interface RevealProps {
  children: ReactNode
  className?: string
  mode?: RevealMode
  delay?: number
  duration?: number
  distance?: number
  once?: boolean
  as?: ElementType
  amount?: number
}

/** Scroll-reveal a block. Renders instantly (no motion) when reduced-motion is on. */
export function Reveal({
  children, className, mode = 'up', delay = 0, duration = 0.7,
  distance = 28, once = true, as = 'div', amount = 0.3,
}: RevealProps) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref, { once, amount, margin: '-10% 0px -10% 0px' })
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div

  if (reduce) {
    const Tag = as as ElementType
    return <Tag className={className}>{children}</Tag>
  }

  const v = variantFor(mode, distance)
  return (
    <MotionTag
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={v}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </MotionTag>
  )
}

interface StaggerProps {
  children: ReactNode
  className?: string
  gap?: number
  delay?: number
  once?: boolean
  amount?: number
}

/** Wrap children in <Stagger>…<StaggerItem/>…</Stagger> for a cascading reveal. */
export function Stagger({ children, className, gap = 0.09, delay = 0.05, once = true, amount = 0.25 }: StaggerProps) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref, { once, amount, margin: '-8% 0px' })

  if (reduce) return <div className={className}>{children}</div>

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className, mode = 'up', distance = 24 }: { children: ReactNode; className?: string; mode?: RevealMode; distance?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  const v = variantFor(mode, distance)
  return (
    <motion.div className={className} variants={{ hidden: v.hidden, show: { ...v.show, transition: { duration: 0.65, ease: EASE } } }}>
      {children}
    </motion.div>
  )
}

/** Word-by-word headline reveal with optional blur. */
export function SplitText({ text, className, wordClassName, delay = 0, gap = 0.08 }: { text: string; className?: string; wordClassName?: string; delay?: number; gap?: number }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const words = text.split(' ')

  if (reduce) return <span className={className}>{text}</span>

  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom" aria-hidden="true">
          <motion.span
            className={`inline-block ${wordClassName ?? ''}`}
            initial={{ y: '110%', opacity: 0 }}
            animate={inView ? { y: '0%', opacity: 1 } : { y: '110%', opacity: 0 }}
            transition={{ duration: 0.75, ease: EASE, delay: delay + i * gap }}
          >
            {word}{i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

/** Count-up number that fires when scrolled into view. */
export function CountUp({ to, from = 0, duration = 1.8, suffix = '', prefix = '', decimals = 0, className }: { to: number; from?: number; duration?: number; suffix?: string; prefix?: string; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [val, setVal] = useState(from)

  useEffect(() => {
    if (!inView) return
    if (reduce) { setVal(to); return }
    const controls = animate(from, to, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: v => setVal(v) })
    return () => controls.stop()
  }, [inView, reduce, from, to, duration])

  return <span ref={ref} className={className}>{prefix}{val.toLocaleString('en-MT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>
}

/** Magnetic hover — element eases toward the cursor. Disabled for reduced-motion & touch. */
export function Magnetic({ children, className, strength = 0.35, as = 'div' }: { children: ReactNode; className?: string; strength?: number; as?: ElementType }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 })
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div

  if (reduce) {
    const Tag = as as ElementType
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <MotionTag
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onMouseMove={e => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
      }}
      onMouseLeave={() => { x.set(0); y.set(0) }}
    >
      {children}
    </MotionTag>
  )
}
