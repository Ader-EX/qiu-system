"use client"

import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface InlineAlertProps {
  variant?: "default" | "success" | "warning" | "error"
  message: string
  className?: string
}

const variantConfig = {
  default: {
    icon: Info,
    className: "border-blue-200 bg-blue-50 text-blue-800",
    iconClassName: "text-blue-600",
  },
  success: {
    icon: CheckCircle,
    className: "border-green-200 bg-green-50 text-green-800",
    iconClassName: "text-green-600",
  },
  warning: {
    icon: AlertCircle,
    className: "border-yellow-200 bg-yellow-50 text-yellow-800",
    iconClassName: "text-yellow-600",
  },
  error: {
    icon: XCircle,
    className: "border-red-200 bg-red-50 text-red-800",
    iconClassName: "text-red-600",
  },
}

export function InlineAlert({ variant = "default", message, className }: InlineAlertProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <Alert className={cn(config.className, className)}>
      <Icon className={cn("h-4 w-4", config.iconClassName)} />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
