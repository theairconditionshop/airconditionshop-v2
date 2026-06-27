'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { PhoneInput } from '@/components/ui/phone-input'
import { Button } from '@/components/ui/button'
import PasswordField, { RequirementsList } from '@/components/auth/PasswordField'
import { passwordSchema } from '@/lib/auth/password'
import { phoneZodField } from '@/lib/phone'
import { Pencil, X, CheckCircle2 } from 'lucide-react'

// ── Phone form ────────────────────────────────────────────────────────────────

const phoneSchema = z.object({ phone: phoneZodField })
type PhoneFormData = z.infer<typeof phoneSchema>

export function PhoneEditForm({ currentPhone }: { currentPhone: string | null }) {
  const [editing, setEditing] = useState(false)
  const [saved, setSaved]     = useState(currentPhone)

  const { control, handleSubmit, formState: { isSubmitting, isValid }, reset } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    mode: 'onChange',
    defaultValues: { phone: saved ?? '' },
  })

  async function onSubmit(data: PhoneFormData) {
    const res = await fetch('/api/trade/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: data.phone }),
    })
    if (res.ok) {
      toast.success('Phone number updated.')
      setSaved(data.phone)
      setEditing(false)
    } else {
      const body = await res.json().catch(() => ({}))
      toast.error(body?.error || 'Failed to update phone number.')
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between py-1">
        <span className="text-sm font-medium text-slate-900">{saved || '—'}</span>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer transition-colors"
        >
          <Pencil className="w-3 h-3" aria-hidden="true" /> Edit
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-1">
      <Controller
        name="phone"
        control={control}
        render={({ field, fieldState }) => (
          <PhoneInput
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={!isValid || isSubmitting} loading={isSubmitting}>
          Save changes
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => { setEditing(false); reset({ phone: saved ?? '' }) }}
          className="text-slate-500"
        >
          <X className="w-3.5 h-3.5 mr-1" aria-hidden="true" /> Cancel
        </Button>
      </div>
    </form>
  )
}

// ── Password change form ──────────────────────────────────────────────────────

const passwordFormSchema = z.object({
  password: passwordSchema,
  confirm:  z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})
type PasswordFormData = z.infer<typeof passwordFormSchema>

export function PasswordChangeForm() {
  const [open, setOpen]   = useState(false)
  const [done, setDone]   = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, isValid },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    mode: 'onChange',
  })

  const passwordValue = watch('password', '')
  const confirmValue  = watch('confirm',  '')
  const confirmMatch  = confirmValue.length > 0 && passwordValue === confirmValue

  async function onSubmit(data: PasswordFormData) {
    const res = await fetch('/api/trade/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: data.password }),
    })
    if (res.ok) {
      toast.success('Password updated successfully.')
      setDone(true)
      setOpen(false)
      reset()
    } else {
      const body = await res.json().catch(() => ({}))
      toast.error(body?.error || 'Failed to update password.')
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 py-1 text-green-600">
        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
        <span className="text-sm font-medium">Password changed successfully</span>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer transition-colors py-1"
      >
        <Pencil className="w-3 h-3" aria-hidden="true" /> Change password
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      <div>
        <PasswordField
          label="New password"
          required
          autoComplete="new-password"
          placeholder="Create a new password"
          value={passwordValue}
          {...register('password')}
        />
        <RequirementsList value={passwordValue} />
      </div>

      <div className="flex flex-col gap-1.5">
        <PasswordField
          label="Confirm new password"
          required
          autoComplete="new-password"
          placeholder="Repeat new password"
          value={confirmValue}
          {...register('confirm')}
        />
        {confirmMatch && (
          <p className="flex items-center gap-1 text-xs text-green-600 mt-1" aria-live="polite">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> Passwords match
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" size="sm" disabled={!isValid || isSubmitting} loading={isSubmitting}>
          Update password
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => { setOpen(false); reset() }}
          className="text-slate-500"
        >
          <X className="w-3.5 h-3.5 mr-1" aria-hidden="true" /> Cancel
        </Button>
      </div>
    </form>
  )
}
