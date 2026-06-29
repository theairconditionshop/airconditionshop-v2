'use client'

import { motion } from 'framer-motion'
import { fadeUp, stagger } from '@/lib/motion'

interface Props {
  children: React.ReactNode
  className?: string
  delay?: number
  staggerChildren?: number
}

export function AnimatedSection({ children, className, delay = 0, staggerChildren = 0.1 }: Props) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={stagger(delay, staggerChildren)}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function FadeUp({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  )
}

export function FadeUpSection({ children, className, delay = 0 }: Props) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={fadeUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
