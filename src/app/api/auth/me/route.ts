import { NextResponse } from "next/server";
import { getSession, getFullUser } from "@/lib/session";
import { isDemoUser, getDemoRestaurants } from "@/lib/demo-data";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDemoUser(session)) {
    const restaurants = session.role === "RESTAURANT_OWNER"
      ? getDemoRestaurants().map((r) => ({ id: r.id, name: r.name }))
      : [];
    return NextResponse.json({
      id: session.id,
      email: session.email,
      role: session.role,
      nameDisplay: session.nameDisplay,
      status: "ACTIVE",
      creatorProfile: session.role === "CREATOR" ? {
        userId: session.id,
        city: "Warszawa",
        instagramUrl: "https://instagram.com/anna_foodie",
        followerRange: "FROM_10K_TO_30K",
        niches: ["food", "lifestyle"],
        languages: ["pl", "en"],
        strikesCount: 0,
      } : null,
      restaurants,
    });
  }

  const user = await getFullUser(session);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    role: user.role,
    nameDisplay: user.nameDisplay,
    status: user.status,
    creatorProfile: user.creatorProfile,
    restaurants: user.restaurants.map((r) => ({ id: r.id, name: r.name })),
  });
}
