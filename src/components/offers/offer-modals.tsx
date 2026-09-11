"use client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import type { Offer } from "@/lib/data";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";

export function UnpublishOfferModal({ offer, onClose }: { offer: Offer | null; onClose: () => void }) {
  return (
    <Modal open={!!offer} onClose={onClose} width="max-w-[420px]">
      {offer && (
        <div className="p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600"><AlertTriangle className="h-4 w-4" /></div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">Unpublish Offer</h2>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">Are you sure you want to unpublish <span className="font-semibold text-slate-800">&quot;{offer.title}&quot;</span>? It will immediately become unavailable to customers in the Marketplace. You can republish it at any time.</p>
          <div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button className="bg-amber-500 hover:bg-amber-600" onClick={onClose}>Unpublish</Button></div>
        </div>
      )}
    </Modal>
  );
}

export function DeleteOfferModal({ offer, onClose }: { offer: Offer | null; onClose: () => void }) {
  const [txt, setTxt] = useState("");
  return (
    <Modal open={!!offer} onClose={() => { onClose(); setTxt(""); }} width="max-w-[440px]">
      {offer && (
        <div className="p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">Delete Offer</h2>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">This will permanently delete <span className="font-semibold text-slate-800">&quot;{offer.title}&quot;</span>. View statistics and all offer data will be lost. This action cannot be undone.</p>
          <div className="mt-4"><Label>Type <span className="font-mono">DELETE</span> to confirm</Label><Input placeholder="DELETE" value={txt} onChange={(e) => setTxt(e.target.value)} className="font-mono" /></div>
          <div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={() => { onClose(); setTxt(""); }}>Cancel</Button><Button variant="danger" disabled={txt !== "DELETE"} onClick={() => { onClose(); setTxt(""); }}>Delete Permanently</Button></div>
        </div>
      )}
    </Modal>
  );
}
