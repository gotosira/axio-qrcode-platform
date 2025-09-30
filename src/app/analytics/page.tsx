import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type QRWithScans = {
  id: string;
  label: string;
  slug: string;
  scans: { id: string; createdAt: Date; ip: string | null }[];
};

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return (
      <div className="p-6">
        <p className="text-sm">Please sign in to view analytics.</p>
      </div>
    );
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return <div className="p-6">Unauthorized</div>;

  const qrs: QRWithScans[] = await prisma.qRCode.findMany({
    where: { ownerId: user.id },
    include: { scans: { orderBy: { createdAt: "desc" }, take: 10 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {qrs.map((qr) => (
          <Card key={qr.id}>
            <CardHeader>
              <div className="font-medium">{qr.label}</div>
              <div className="text-xs text-gray-600">Slug: {qr.slug}</div>
            </CardHeader>
            <CardContent>
              <div className="text-sm">Recent 10 scans ({qr.scans.length}):</div>
              <ul className="text-xs space-y-1 max-h-40 overflow-auto mt-1">
                {qr.scans.map((s) => (
                  <li key={s.id} className="flex justify-between gap-2">
                    <span className="truncate">{s.ip || "ip?"}</span>
                    <span>{new Date(s.createdAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <Link className="text-xs text-blue-700 underline" href="/">
                Generate more →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


