import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomBytes } from "crypto";
import { z } from "zod";

const createSchema = z.object({
  label: z.string().min(1),
  destination: z.string().url(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const list = await prisma.qRCode.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { label, destination } = parsed.data;

  let slug = randomBytes(4).toString("hex");
  // retry if collision
  // eslint-disable-next-line no-constant-condition
  for (let i = 0; i < 3; i++) {
    const existing = await prisma.qRCode.findUnique({ where: { slug } });
    if (!existing) break;
    slug = randomBytes(4).toString("hex");
  }

  const created = await prisma.qRCode.create({
    data: { label, destination, slug, ownerId: user.id },
  });
  return NextResponse.json(created, { status: 201 });
}


