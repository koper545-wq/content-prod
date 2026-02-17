import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Nazwa restauracji jest wymagana"),
  addressLine: z.string().min(1, "Adres jest wymagany"),
  city: z.string().min(1, "Miasto jest wymagane"),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "RESTAURANT_OWNER") {
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

    await prisma.restaurant.create({
      data: {
        ownerUserId: session.id,
        name: parsed.data.name,
        addressLine: parsed.data.addressLine,
        city: parsed.data.city,
        instagramUrl: parsed.data.instagramUrl || null,
        websiteUrl: parsed.data.websiteUrl || null,
        phone: parsed.data.phone || null,
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
