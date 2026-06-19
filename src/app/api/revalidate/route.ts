import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const secret = request.headers.get('x-revalidate-secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { path, tag } = body

  if (tag) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(revalidateTag as any)(tag as string, 'app')
    return NextResponse.json({ revalidated: true, tag })
  }

  if (path) {
    revalidatePath(path as string, 'page')
    return NextResponse.json({ revalidated: true, path })
  }

  // Revalidate all key pages
  revalidatePath('/', 'layout')
  return NextResponse.json({ revalidated: true, all: true })
}
