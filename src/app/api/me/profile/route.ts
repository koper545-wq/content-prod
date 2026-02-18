import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo-data";
import { z } from "zod";

const schema = z.object({
  city: z.string().min(1),
  instagramUrl: z.string().url(),
  tiktokUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  followerRange: z.enum(["UNDER_2K", "FROM_2K_TO_10K", "FROM_10K_TO_30K", "FROM_30K_TO_100K", "OVER_100K"]),
  niches: z.array(z.string()).min(1),
  languages: z.array(z.string()).min(1),
  fullName: z.string().min(2).optional().or(z.literal("")),
  pesel: z.string().regex(/^\d{11}$/, "PESEL musi mieć 11 cyfr").optional().or(z.literal("")),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDemoUser(session)) {
    return NextResponse.json({
      profile: {
        userId: session.id,
        city: "Warszawa",
        instagramUrl: "https://instagram.com/anna_foodie",
        tiktokUrl: "https://tiktok.com/@anna_foodie",
        portfolioUrl: null,
        followerRange: "FROM_10K_TO_30K",
        niches: ["food", "lifestyle"],
        languages: ["pl", "en"],
        strikesCount: 0,
        strikesLastAt: null,
        fullName: "Anna Maria Kowalska",
        pesel: "92010112345",
      },
    });
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.id },
  });

  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "CREATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const data = {
    city: parsed.data.city,
    instagramUrl: parsed.data.instagramUrl,
    tiktokUrl: parsed.data.tiktokUrl || null,
    portfolioUrl: parsed.data.portfolioUrl || null,
    followerRange: parsed.data.followerRange,
    niches: parsed.data.niches,
    languages: parsed.data.languages,
    fullName: parsed.data.fullName || null,
    pesel: parsed.data.pesel || null,
  };

  const profile = await prisma.creatorProfile.upsert({
    where: { userId: session.id },
    create: { userId: session.id, ...data },
    update: data,
  });

  return NextResponse.json({ profile });
}
