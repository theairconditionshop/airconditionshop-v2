'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FilterChips } from '@/components/products/products-filters'

interface Category { id: string; name: string }
interface Brand    { id: string; name: string }

interface Props {
  categories: Category[]
  brands: Brand[]
  activeCategory?: string
  activeBrand?: string
  activeSearch?: string
  activeAcType?: string
}

function Inner({ categories, brands, activeCategory, activeBrand, activeSearch, activeAcType }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function removeFilter(key: 'category' | 'brand' | 'ac_type' | 'search') {
    const sp = new URLSearchParams(searchParams.toString())
    sp.delete(key)
    router.replace(`/products${sp.toString() ? '?' + sp.toString() : ''}`, { scroll: false })
  }

  function clearAll() {
    router.replace('/products', { scroll: false })
  }

  return (
    <FilterChips
      categories={categories}
      brands={brands}
      activeCategory={activeCategory}
      activeBrand={activeBrand}
      activeSearch={activeSearch}
      activeAcType={activeAcType}
      onRemove={removeFilter}
      onClearAll={clearAll}
    />
  )
}

export default function FilterChipsWrapper(props: Props) {
  return (
    <Suspense fallback={null}>
      <Inner {...props} />
    </Suspense>
  )
}
