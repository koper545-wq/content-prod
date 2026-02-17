"use client";

import { CreatorLayout } from "@/components/layout/creator-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CreatorLayout>{children}</CreatorLayout>;
}
