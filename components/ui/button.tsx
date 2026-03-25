import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "amber"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
}

const variantStyles: Record<string, string> = {
  default: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700",
  ghost: "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100",
  outline: "border border-zinc-700 hover:bg-zinc-800 text-zinc-300",
  amber: "bg-amber-500 hover:bg-amber-600 text-black font-semibold",
}

const sizeStyles: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-5 py-2.5 text-sm rounded-xl",
}

export function Button({ variant = "default", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
