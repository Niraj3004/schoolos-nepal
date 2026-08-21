import * as React from "react"
import { cn } from "../../lib/utils"
import { CheckCircle2, XCircle, Info, X } from "lucide-react"

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  variant?: "default" | "success" | "error" | "info"
  onClose?: () => void
}

export function Toast({ className, title, description, variant = "default", onClose, ...props }: ToastProps) {
  
  const variants = {
    default: "bg-white border-gray-200 text-gray-900",
    success: "bg-success/10 border-success/20 text-success",
    error: "bg-danger/10 border-danger/20 text-danger",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  }

  const icons = {
    default: null,
    success: <CheckCircle2 className="h-5 w-5 text-success" />,
    error: <XCircle className="h-5 w-5 text-danger" />,
    info: <Info className="h-5 w-5 text-blue-600" />,
  }

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all",
        variants[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3 w-full">
        {icons[variant] && <div className="mt-0.5 shrink-0">{icons[variant]}</div>}
        <div className="flex-1">
          <div className="text-sm font-semibold">{title}</div>
          {description && <div className="mt-1 text-sm opacity-90">{description}</div>}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
