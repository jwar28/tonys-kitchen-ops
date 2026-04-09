"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      position="top-center"
      expand={false}
      richColors
      visibleToasts={1}
      offset={20}
      mobileOffset={20}
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast w-[calc(100vw-2rem)] max-w-sm rounded-[1.35rem] border border-white/40 bg-[linear-gradient(180deg,rgba(255,252,248,0.98),rgba(245,237,228,0.96))] text-foreground shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)]",
          title: "text-sm font-semibold tracking-tight text-foreground",
          description: "text-sm text-foreground/75",
          actionButton:
            "!bg-primary !text-primary-foreground !rounded-full !px-3 !py-2 !text-xs !font-semibold",
          cancelButton:
            "!bg-secondary !text-secondary-foreground !rounded-full !px-3 !py-2 !text-xs !font-semibold",
          success: "!border-emerald-300/60 !bg-[linear-gradient(180deg,rgba(236,253,245,0.98),rgba(220,252,231,0.96))]",
          error: "!border-destructive/25 !bg-[linear-gradient(180deg,rgba(254,242,242,0.98),rgba(254,226,226,0.96))]",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
