"use client";

import { RestaurantLayout } from "@/components/layout/restaurant-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RestaurantLayout>{children}</RestaurantLayout>;
}
