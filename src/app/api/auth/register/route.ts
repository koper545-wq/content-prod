import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Nieprawidłowy email"),
  name: z.string().min(2, "Imię musi mieć min. 2 znaki"),
  role: z.enum(["CREATOR", "RESTAURANT_OWNER"]),
  password: z.string().min(6, "Hasło musi mieć min. 6 znaków"),
});

export async function POST(request: Request) {
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
