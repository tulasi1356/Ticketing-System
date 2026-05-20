import * as React from "react"
import * as RadixPopover from "@radix-ui/react-popover"
import { cn } from "../../lib/utils"

type PopoverSize = "sm" | "md" | "lg"

const sizeClasses: Record<PopoverSize, string> = {
  sm: "w-48",
  md: "w-64",
  lg: "w-80",
}

/* ================= ROOT ================= */

export const Popover = RadixPopover.Root

/* ================= TRIGGER ================= */

export const PopoverTrigger = RadixPopover.Trigger

/* ================= CONTENT ================= */

interface PopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof RadixPopover.Content> {
  size?: PopoverSize
}

export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof RadixPopover.Content>,
  PopoverContentProps
>(
  (
    {
      size = "md",
      className,
      sideOffset = 8,
      collisionPadding = 16,
      avoidCollisions = true,
      ...props
    },
    ref,
  ) => (
    <RadixPopover.Portal>
      <RadixPopover.Content
        ref={ref}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        avoidCollisions={avoidCollisions}
        className={cn(
          "z-50 max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-md border bg-white p-4 shadow-md outline-none",
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    </RadixPopover.Portal>
  ),
)

PopoverContent.displayName = "PopoverContent"