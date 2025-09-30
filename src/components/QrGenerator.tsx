"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { toast } from "sonner";

type QR = {
  id: string;
  label: string;
  slug: string;
  destination: string;
};

export default function QrGenerator() {
  const [label, setLabel] = useState("");
  const [destination, setDestination] = useState("");
  const [creating, setCreating] = useState(false);
  const [list, setList] = useState<QR[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/qrcodes");
    if (!res.ok) return;
    const data = await res.json();
    setList(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/qrcodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, destination }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Creation failed");
      }
      setLabel("");
      setDestination("");
      await load();
      toast.success("QR created");
    } catch (e: any) {
      setError(e.message || "Error");
      toast.error(e.message || "Error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Create QR Code</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          <Input placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Input placeholder="Destination URL" className="sm:col-span-2" value={destination} onChange={(e) => setDestination(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button onClick={create} disabled={creating || !label || !destination}>
          {creating ? "Creating..." : "Create"}
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Your QRs</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((qr) => (
            <QrCard key={qr.id} qr={qr} />
          ))}
        </div>
      </div>
    </div>
  );
}

function QrCard({ qr }: { qr: QR }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const url = typeof window !== "undefined" ? `${window.location.origin}/api/scan/${qr.slug}` : "";
  useEffect(() => {
    (async () => {
      const png = await QRCode.toDataURL(url, { margin: 1, width: 256 });
      setDataUrl(png);
    })();
  }, [url]);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{qr.label}</div>
            <div className="text-xs text-gray-500 break-all">{qr.destination}</div>
          </div>
          <a href={url} className="text-xs text-blue-700 underline" target="_blank">Open</a>
        </div>
      </CardHeader>
      <CardContent>
        {dataUrl && (
          <img src={dataUrl} alt={qr.label} className="w-full h-auto rounded" />
        )}
        <div className="text-xs text-gray-600 break-all mt-2">{url}</div>
        {dataUrl && (
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(url).then(() => toast.success("Link copied"))}>Copy link</Button>
            <Button variant="secondary" size="sm" onClick={() => downloadDataUrl(dataUrl, `${qr.slug}.png`)}>Download PNG</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}


