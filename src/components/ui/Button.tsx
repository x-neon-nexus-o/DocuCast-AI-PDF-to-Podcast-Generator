import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-400 active:bg-brand-600 shadow-[0_2px_12px_rgba(27,123,246,0.25)] hover:shadow-[0_4px_18px_rgba(27,123,246,0.35)]',
  secondary:
    'bg-ink-700 text-slate-100 hover:bg-ink-600 border border-white/5',
  ghost: 'text-slate-300 hover:text-white hover:bg-white/5',
  danger: 'bg-bad-500/10 text-bad-400 hover:bg-bad-500/20 border border-bad-500/30',
  success: 'bg-good-500/10 text-good-400 hover:bg-good-500/20 border border-good-500/30',
  outline:
    'border border-brand-500/40 text-brand-300 hover:bg-brand-500/10 hover:border-brand-400/60',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2.5 rounded-xl',
  icon: 'h-10 w-10 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const cls = `inline-flex items-center justify-center font-medium transition-all duration-200 focus-ring select-none disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`;
    return (
      <button
        ref={ref}
        className={cls}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <span className="inline-block h-4 w-4 animate-spin-slow rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';
