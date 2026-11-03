"use client";
import { Card } from "@/components/ui/card";
import { useUploadOfferImage } from "@/lib/api/hooks/offers";
import { errorMessage } from "@/lib/format";
import { ImagePlus, Trash2 } from "lucide-react";
import { useState } from "react";

const TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

/** The offer's cover: upload, replace or remove. `onChange` gets the new storage key (null removes it) and a preview URL. */
export function OfferImageField({ previewUrl, onChange, error }: { previewUrl: string | null; onChange: (key: string | null, previewUrl: string | null) => void; error?: string }) {
  const upload = useUploadOfferImage();
  const [uploadError, setUploadError] = useState("");
  const shown = uploadError || error;

  const pick = (file: File | undefined) => {
    if (!file) return;
    setUploadError("");
    if (!TYPES.includes(file.type)) { setUploadError("Choose a PNG, JPG or WebP image"); return; }
    if (file.size > MAX_BYTES) { setUploadError("The image must be 10 MB or smaller"); return; }
    upload.mutate(file, { onSuccess: ({ key, previewUrl: url }) => onChange(key, url), onError: (e) => setUploadError(errorMessage(e)) });
  };

  const button = (label: string) => (
    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 has-[:disabled]:cursor-wait has-[:disabled]:opacity-60">
      <ImagePlus className="h-3.5 w-3.5" /> {upload.isPending ? "Uploading…" : label}
      <input type="file" accept={TYPES.join(",")} className="sr-only" disabled={upload.isPending} onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
    </label>
  );

  return (
    <Card className="px-4 py-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">Cover image <span className="text-[10px] font-normal text-slate-400">(optional)</span></div>
      {previewUrl ? (
        <>
          <img src={previewUrl} alt="Offer cover" className="mt-3 aspect-video w-full rounded-lg border border-slate-200 object-cover" />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {button("Replace")}
            <button type="button" disabled={upload.isPending} onClick={() => { setUploadError(""); onChange(null, null); }} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
          </div>
        </>
      ) : (
        <div className="mt-3">{button("Upload image")}</div>
      )}
      <p className="mt-3 text-[10px] leading-4 text-slate-400">PNG, JPG or WebP, up to 10 MB. A wide picture works best (about 1200 × 675); it is cropped to fit. Without one, the offer shows a category-coloured cover.</p>
      {shown && <p role="alert" className="mt-2 text-[11px] text-red-600">{shown}</p>}
    </Card>
  );
}
