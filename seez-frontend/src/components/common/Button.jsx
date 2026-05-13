import { cn } from '../../lib/utils'

export function Button({ children, variant = 'primary', size = 'md', className, disabled, loading, onClick, type = 'button', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed label-caps'

  const variants = {
    primary: 'bg-[#dcc662] text-[#393000] hover:bg-[#c9b452] active:scale-[0.98]',
    secondary: 'bg-transparent text-[#dcc662] border border-[#dcc662] hover:bg-[#dcc662]/10 active:scale-[0.98]',
    danger: 'bg-[#8B2222]/10 text-[#8B2222] border border-[#8B2222]/30 hover:bg-[#8B2222]/20 active:scale-[0.98]',
    ghost: 'text-[#8e9192] hover:bg-[#1e2020] hover:text-[#e2e2e2]',
    outline: 'border border-[#444748]/50 text-[#e2e2e2] hover:bg-[#1e2020]',
  }

  const sizes = {
    sm: 'px-3 py-1.5 h-8 text-[10px]',
    md: 'px-4 py-2.5 h-10',
    lg: 'px-6 py-3 h-12',
    xl: 'px-8 py-4 h-14',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
