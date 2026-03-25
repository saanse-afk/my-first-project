import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-2 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50",
        className
      )}
      {...props}
    />
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-2 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 resize-none",
        className
      )}
      {...props}
    />
  )
}
