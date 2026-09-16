"use client";
import { Button } from "@/components/ui/button";
import { Input, Label, RadioCard, Select } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Stepper } from "@/components/ui/misc";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIES = ["Retail", "Corporate", "Food & Beverage", "Event", "Hotel", "Announcement", "Travel", "Promotional"];

/** Step 1 of defining a template: basics here, fields on the configure page. */
export function CreateTemplateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [orientation, setOrientation] = useState<"LANDSCAPE" | "PORTRAIT">("LANDSCAPE");
  return (
    <Modal open={open} onClose={onClose} width="max-w-[480px]">
      <ModalHeader title="Create New Template" onClose={onClose} />
      <div className="px-6 pt-4"><Stepper steps={["Basic Info", "Fields", "Review"]} current={1} compact /></div>
      <form onSubmit={(e) => { e.preventDefault(); router.push(`/layouts/new/configure?name=${encodeURIComponent(name.trim())}&category=${encodeURIComponent(category)}&o=${orientation}`); onClose(); }} className="space-y-4 px-6 py-5">
        <div><Label required>Template Name</Label><Input placeholder="e.g. Summer Sale 2026" value={name} onChange={(e) => setName(e.target.value)} minLength={2} /></div>
        <div><Label>Category</Label><Select value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></div>
        <div><Label>Orientation</Label><div className="grid grid-cols-2 gap-2"><RadioCard checked={orientation === "LANDSCAPE"} onSelect={() => setOrientation("LANDSCAPE")} title="Landscape" sub="16:9 · 1920×1080" /><RadioCard checked={orientation === "PORTRAIT"} onSelect={() => setOrientation("PORTRAIT")} title="Portrait" sub="9:16 · 1080×1920" /></div></div>
        <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={name.trim().length < 2}>Next ›</Button></div>
      </form>
    </Modal>
  );
}
