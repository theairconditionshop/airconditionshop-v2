import { redirect } from 'next/navigation'

// Customer registration is not available on this site.
// Trade professionals should apply via the trade registration form.
export default function RegisterPage() {
  redirect('/trade/register')
}
