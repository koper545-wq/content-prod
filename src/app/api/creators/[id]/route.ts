import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isDemoUser, getDemoCreatorProfile } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Demo mode
    if (isDemoUser(session)) {
      const profile = getDemoCreatorProfile(id);
      if (!profile) {
        return NextResponse.json({ error: "Profil nie znaleziony" }, { status: 404 });
      }
      return NextResponse.json(profile);
    }

    // Real DB
    const user = await prisma.user.findUnique({
      where: { id, role: "CREATOR" },
      select: {
        id: true,
        nameDisplay: true,
        createdAt: true,
        creatorProfile: {
          select: {
            city: true,
            instagramUrl: true,
            tiktokUrl: true,
            portfolioUrl: true,
            followerRange: true,
            niches: true,
            languages: true,
            strikesCount: true,
          },
        },
      },
    });

    if (!user || !user.creatorProfile) {
      return NextResponse.json({ error: "Profil nie znaleziony" }, { status: 404 });
    }

    const completedBookings = await prisma.booking.count({
      where: {
        creatorUserId: id,
        status: { in: ["VISITED", "COMPLETED", "CONTENT_SUBMITTED"] },
      },
    });

    const contentSubmitted = await prisma.booking.count({
      where: {
        creatorUserId: id,
        contentSubmission: { isNot: null },
      },
    });

    // Fetch approved content submissions for portfolio
    const approvedBookings = await prisma.booking.findMany({
      where: {
        creatorUserId: id,
        contentSubmission: { status: "APPROVED" },
      },
      select: {
        restaurantId: true,
        campaign: { select: { title: true } },
        contentSubmission: { select: { linksJson: true, submittedAt: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Look up restaurant names
    const restaurantIds = [...new Set(approvedBookings.map((b) => b.restaurantId))];
    const restaurants = await prisma.restaurant.findMany({
      where: { id: { in: restaurantIds } },
      select: { id: true, name: true },
    });
    const restaurantMap = Object.fromEntries(restaurants.map((r) => [r.id, r.name]));

    const portfolio = approvedBookings.flatMap((b) => {
      const links = b.contentSubmission?.linksJson as { type: string; url: string; description?: string; thumbnailUrl?: string }[] || [];
      return links.map((link) => ({
        type: link.type,
        url: link.url,
        description: link.description || null,
        thumbnailUrl: link.thumbnailUrl || null,
        campaignTitle: b.campaign.title,
        restaurantName: restaurantMap[b.restaurantId] || "",
        submittedAt: b.contentSubmission?.submittedAt,
      }));
    });

    return NextResponse.json({
      user: {
        id: user.id,
        nameDisplay: user.nameDisplay,
        createdAt: user.createdAt,
      },
      profile: user.creatorProfile,
      stats: {
        completedCollabs: completedBookings,
        contentSubmitted,
      },
      portfolio,
    });
  } catch {
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
