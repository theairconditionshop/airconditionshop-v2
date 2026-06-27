'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Button } from '@/components/ui/button'
import type { Profile } from '@/types/database'
import { optionalPhoneZodField } from '@/lib/phone'

const schema = z.object({
  full_name: z.string().min(2),
  phone:     optionalPhoneZodField,
  company:   z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function AccountForm({ profile }: { profile: Profile | null }) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      full_name: profile?.full_name || '',
      phone:     profile?.phone    || '',
      company:   profile?.company  || '',
    },
  })

  async function onSubmit(data: FormData) {
    const res = await fetch('/api/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) toast.success('Profile updated')
    else        toast.error('Update failed')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input label="Full name" {...register('full_name')} error={errors.full_name?.message} required />
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <PhoneInput
            label="Phone"
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.phone?.message}
          />
        )}
      />
      <Input label="Company" {...register('company')} />
      <Button type="submit" variant="brand" loading={isSubmitting}>Save Changes</Button>
    </form>
  )
}
