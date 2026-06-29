'use client'

import { useEffect } from 'react'
import { recordView, type RecentItem } from './recently-viewed'

export default function ViewTracker({ item }: { item: RecentItem }) {
  useEffect(() => {
    recordView(item)
  }, [item])

  return null
}
