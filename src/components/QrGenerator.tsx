"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

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
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Create QR Code</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            placeholder="Label"
            className="border rounded px-3 py-2"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <input
            placeholder="Destination URL"
            className="border rounded px-3 py-2 sm:col-span-2"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={create}
          disabled={creating || !label || !destination}
          className="bg-black text-white rounded px-4 py-2"
        >
          {creating ? "Creating..." : "Create"}
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Your QRs</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((qr) => (
            <Card key={qr.id} qr={qr} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ qr }: { qr: QR }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const url = typeof window !== "undefined" ? `${window.location.origin}/api/scan/${qr.slug}` : "";
  useEffect(() => {
    (async () => {
      const png = await QRCode.toDataURL(url, { margin: 1, width: 256 });
      setDataUrl(png);
    })();
  }, [url]);
  return (
    <div className="border rounded p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{qr.label}</div>
          <div className="text-xs text-gray-500 break-all">{qr.destination}</div>
        </div>
        <a
          href={url}
          className="text-xs text-blue-700 underline"
          target="_blank"
        >
          Open
        </a>
      </div>
      {dataUrl && (
        <img src={dataUrl} alt={qr.label} className="w-full h-auto" />
      )}
      <div className="text-xs text-gray-600 break-all">{url}</div>
    </div>
  );
}


