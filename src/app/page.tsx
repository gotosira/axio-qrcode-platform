import Link from "next/link";
import QrGenerator from "@/components/QrGenerator";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">QR Generator</h1>
        <Link className="text-sm underline" href="/analytics">Analytics</Link>
      </div>
      {session?.user ? (
        <QrGenerator />
      ) : (
        <p className="text-sm">Please sign in to create QR codes.</p>
      )}
    </div>
  );
}
