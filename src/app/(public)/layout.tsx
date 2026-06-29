import StickyMobileCta from '@/components/layout/sticky-mobile-cta'
import StickyContactWidget from '@/components/shared/sticky-contact-widget'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <StickyMobileCta />
      <StickyContactWidget />
    </>
  )
}
