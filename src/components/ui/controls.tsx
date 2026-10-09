// Controles locais baseados no padrão shadcn/ui (CVA + Tailwind), sem asChild.
import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...values: ClassValue[]) { return twMerge(clsx(values)) }
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:pointer-events-none disabled:opacity-50 px-4 py-2.5 cursor-pointer', {
    variants: { variant: {
      default: 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700',
      outline: 'bg-white text-blue-700 border border-blue-600 hover:bg-slate-50',
      link: 'bg-transparent text-blue-700 border-0 underline underline-offset-4',
    } }, defaultVariants: { variant: 'default' },
  })

export function Button({ className, variant, type = 'button', ...props }: ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return <button data-slot="button" type={type} className={cn(buttonVariants({ variant }), className)} {...props} />
}
export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea data-slot="textarea" className={cn('w-full rounded-md border border-slate-400 bg-white px-3 py-3 text-base leading-relaxed text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 aria-invalid:border-red-700 disabled:opacity-50', className)} {...props} />
}
