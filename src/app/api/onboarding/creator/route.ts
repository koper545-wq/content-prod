import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";

const schema = z.object({
  city: z.string().min(1, "Miasto jest wymagane"),
  instagramUrl: z.string().url("Podaj prawidłowy URL Instagram"),
  tiktokUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  followerRange: z.enum(["UNDER_2K", "FROM_2K_TO_10K", "FROM_10K_TO_30K", "FROM_30K_TO_100K", "OVER_100K"]),
  niches: z.array(z.string()).min(1, "Wybierz min. 1 niszę"),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isDemoUser(session)) {
      return NextResponse.json({ success: true });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await prisma.creatorProfile.upsert({
      where: { userId: session.id },
      update: {
        city: parsed.data.city,
        instagramUrl: parsed.data.instagramUrl,
        tiktokUrl: parsed.data.tiktokUrl || null,
        portfolioUrl: parsed.data.portfolioUrl || null,
        followerRange: parsed.data.followerRange,
        niches: parsed.data.niches,
      },
      create: {
        userId: session.id,
        city: parsed.data.city,
        instagramUrl: parsed.data.instagramUrl,
        tiktokUrl: parsed.data.tiktokUrl || null,
        portfolioUrl: parsed.data.portfolioUrl || null,
        followerRange: parsed.data.followerRange,
        niches: parsed.data.niches,
        languages: ["pl"],
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("onboarding_complete", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
