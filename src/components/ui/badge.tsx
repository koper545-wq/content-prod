import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const VARIANT_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-gray-100 text-gray-600",
  paused: "bg-yellow-100 text-yellow-700",
  archived: "bg-gray-100 text-gray-500",
  applied: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-gray-100 text-gray-500",
  booked: "bg-blue-100 text-blue-700",
  confirmation_pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled_by_creator: "bg-red-100 text-red-600",
  cancelled_by_restaurant: "bg-red-100 text-red-600",
  no_show: "bg-red-100 text-red-700",
  visited: "bg-purple-100 text-purple-700",
  content_pending: "bg-orange-100 text-orange-700",
  content_submitted: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  disputed: "bg-red-100 text-red-700",
  open: "bg-green-100 text-green-700",
  full: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600",
  submitted: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  changes_requested: "bg-yellow-100 text-yellow-700",
  creator: "bg-purple-100 text-purple-700",
  restaurant_owner: "bg-blue-100 text-blue-700",
  admin: "bg-red-100 text-red-700",
  suspended: "bg-yellow-100 text-yellow-700",
  banned: "bg-red-100 text-red-700",
  pending_verification: "bg-orange-100 text-orange-700",
  no_content: "bg-orange-100 text-orange-700",
  bad_behavior: "bg-red-100 text-red-700",
  other: "bg-gray-100 text-gray-600",
};

export interface BadgeProps {
  variant?: string;
  children?: ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
        VARIANT_STYLES[variant.toLowerCase()] || "bg-gray-100 text-gray-600",
        className
      )}
    >
      {children || variant}
    </span>
  );
}
