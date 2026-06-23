import StickyMobileCta from '@/components/layout/sticky-mobile-cta'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <StickyMobileCta />
    </>
  )
}
