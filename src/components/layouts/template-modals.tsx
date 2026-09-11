"use client";
import { Button } from "@/components/ui/button";
import { Input, Label, RadioCard, Select } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Stepper } from "@/components/ui/misc";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateTemplateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [orientation, setOrientation] = useState<"Landscape" | "Portrait">("Landscape");
  return (
    <Modal open={open} onClose={onClose} width="max-w-[480px]">
      <ModalHeader title="Create New Template" onClose={onClose} />
      <div className="px-6 pt-4"><Stepper steps={["Basic Info", "Configure", "Preview"]} current={1} compact /></div>
      <form onSubmit={(e) => { e.preventDefault(); router.push(`/layouts/new/configure?name=${encodeURIComponent(name)}&o=${orientation}`); onClose(); }} className="space-y-4 px-6 py-5">
        <div><Label required>Template Name</Label><Input placeholder="e.g. Summer Sale 2025" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label>Category</Label><Select defaultValue="Retail"><option>Retail</option><option>Event</option><option>Corporate</option><option>Restaurant</option><option>Hotel</option><option>Announcement</option><option>Travel</option><option>Promotional</option></Select></div>
        <div><Label>Orientation</Label><div className="grid grid-cols-2 gap-2"><RadioCard checked={orientation === "Landscape"} onSelect={() => setOrientation("Landscape")} title="Landscape" sub="16:9 · 1920×1080" /><RadioCard checked={orientation === "Portrait"} onSelect={() => setOrientation("Portrait")} title="Portrait" sub="9:16 · 1080×1920" /></div></div>
        <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={!name}>Next ›</Button></div>
      </form>
    </Modal>
  );
}
