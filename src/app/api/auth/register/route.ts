import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email("Nieprawidłowy email"),
  name: z.string().min(2, "Imię musi mieć min. 2 znaki"),
  role: z.enum(["CREATOR", "RESTAURANT_OWNER"]),
  password: z.string().min(10, "Hasło musi mieć min. 10 znaków"),
});

export async function POST(request: Request) {
  // Rate limit: 5 registrations per IP per 15 minutes
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(`register:${ip}`, 5, 15 * 60_000)) {
    return NextResponse.json({ error: "Zbyt wiele prób rejestracji. Spróbuj później." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const result = await registerUser(parsed.data);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    // Don't create session — user must wait for admin verification
    return NextResponse.json({
      success: true,
      status: "PENDING_VERIFICATION",
    });
  } catch {
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
