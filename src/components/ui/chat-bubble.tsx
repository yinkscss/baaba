import * as React from "react"
import { cn } from "../../lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import Button from "./Button"
import { MessageLoading } from "./message-loading"

interface ChatBubbleProps {
  variant?: "sent" | "received"
  layout?: "default" | "ai"
  className?: string
  children: React.ReactNode
}

export function ChatBubble({
  variant = "received",
  layout = "default",
  className,
  children,
}: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 mb-6",
        variant === "sent" && "flex-row-reverse",
        className,
      )}
    >
      {children}
    </div>
  )
}

interface ChatBubbleMessageProps {
  variant?: "sent" | "received"
  isLoading?: boolean
  className?: string
  children?: React.ReactNode
}

export function ChatBubbleMessage({
  variant = "received",
  isLoading,
  className,
  children,
}: ChatBubbleMessageProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl px-4 py-3 shadow-lg transition-all duration-200",
        variant === "sent" 
          ? "bg-gradient-to-br from-accent-blue to-accent-blue/90 text-background" 
          : "bg-gradient-to-br from-nav/90 to-nav backdrop-blur-sm",
        "after:absolute after:bottom-0 after:h-4 after:w-4",
        variant === "sent"
          ? "after:right-[-8px] after:rounded-bl-xl after:bg-accent-blue"
          : "after:left-[-8px] after:rounded-br-xl after:bg-nav",
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <MessageLoading />
        </div>
      ) : (
        children
      )}
    </div>
  )
}

interface ChatBubbleAvatarProps {
  src?: string
  fallback?: string
  className?: string
}

export function ChatBubbleAvatar({
  src,
  fallback = "AI",
  className,
}: ChatBubbleAvatarProps) {
  return (
    <Avatar className={cn("h-8 w-8 ring-2 ring-nav ring-offset-2 ring-offset-background", className)}>
      {src && <AvatarImage src={src} />}
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  )
}

interface ChatBubbleActionProps {
  icon?: React.ReactNode
  onClick?: () => void
  className?: string
}

export function ChatBubbleAction({
  icon,
  onClick,
  className,
}: ChatBubbleActionProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-6 w-6 p-0 opacity-70 hover:opacity-100 transition-opacity",
        className
      )}
      onClick={onClick}
    >
      {icon}
    </Button>
  )
}

export function ChatBubbleActionWrapper({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex items-center gap-1 mt-2 pl-1", className)}>
      {children}
    </div>
  )
}