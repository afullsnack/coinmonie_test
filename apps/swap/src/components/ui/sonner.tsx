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
      theme={theme as ToasterProps["theme"]}
      className="toaster group text-primary!"
      icons={{
        success: <CircleCheckIcon className="size-4 text-muted-foreground" />,
        info: <InfoIcon className="size-4 text-muted-foreground" />,
        warning: <TriangleAlertIcon className="size-4 text-muted-foreground" />,
        error: <OctagonXIcon className="size-4 text-muted-foreground" />,
        loading: <Loader2Icon className="size-4 animate-spin text-muted-foreground" />,
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "bg-popover! text-popover-foreground! border! border-border! shadow-none! rounded-xl!",
          title: "text-sm! font-medium!",
          description: "text-muted-foreground!",
          closeButton:
            "bg-popover! border-border! text-muted-foreground!",
        },
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
