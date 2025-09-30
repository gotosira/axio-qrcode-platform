import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const qr = await prisma.qRCode.findUnique({ where: { slug } });
  if (!qr) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const headers = new Headers(req.headers);
  const ip = headers.get("x-forwarded-for") ?? headers.get("x-real-ip") ?? "";
  const userAgent = headers.get("user-agent") ?? undefined;
  const referer = headers.get("referer") ?? undefined;

  await prisma.scanEvent.create({
    data: {
      qrId: qr.id,
      ip: ip || undefined,
      userAgent,
      referer,
    },
  });

  return NextResponse.redirect(qr.destination, 302);
}


