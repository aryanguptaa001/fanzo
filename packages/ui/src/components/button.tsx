import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

const buttonVariants = cva('inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50', {
  variants: { variant: { default: 'bg-primary text-primary-foreground', outline: 'border border-input bg-background' }, size: { default: 'h-10 px-4 py-2', sm: 'h-9 px-3' } },
  defaultVariants: { variant: 'default', size: 'default' },
});

export function Button({ className, variant, size, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
