"use client";
import { useCompanyScope } from "@/components/admin/company-scope";
import { PlaylistEditor as CompanyEditor } from "@/components/portal/playlist-editor";
import { PlaylistPreview as CompanyPreview } from "@/components/portal/playlist-preview";
import { PlaylistPublish as CompanyPublish } from "@/components/portal/playlist-publish";
import { Button } from "@/components/ui/button";
import { Card, SectionLabel } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { BackLink } from "@/components/ui/misc";
import { FullPageSpinner } from "@/components/auth/require-session";
import { useToast } from "@/components/ui/toast";
import { useCreatePlaylist } from "@/lib/api/hooks/playlists";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Admin "new playlist": choose the company and a name, then continue in the shared editor. */
export function CreatePlaylist() {
  const router = useRouter();
  const toast = useToast();
  const scope = useCompanyScope();
  const [name, setName] = useState("");
  const create = useCreatePlaylist(scope.companyId);
  const submit = () => create.mutate({ name: name.trim(), items: [] }, { onSuccess: (p) => router.replace(`/playlists/${p.id}/edit?company=${scope.companyId}`), onError: (e) => toast.error(e, "Couldn't create playlist") });
  return (
    <div className="space-y-5">
      <BackLink href={scope.withCompany("/playlists")} label="Playlists" current="Create Playlist" />
      <div><h1 className="text-xl font-bold tracking-tight text-slate-900">Create Playlist</h1><p className="mt-1 text-sm text-slate-400">Build a playlist from the company&apos;s media library.</p></div>
      <Card className="max-w-xl space-y-4 px-5 py-4">
        <div><SectionLabel>Company <span className="text-red-500">*</span></SectionLabel><Select className="mt-2" value={scope.companyId} onChange={(e) => scope.setCompanyId(e.target.value)}>{scope.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></div>
        <div><SectionLabel>Playlist Name <span className="text-red-500">*</span></SectionLabel><Input className="mt-2" placeholder="e.g. Weekend Promotion" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div>
        <div className="flex justify-end gap-2"><Button variant="secondary" href={scope.withCompany("/playlists")}>Cancel</Button><Button disabled={!name.trim() || !scope.companyId || create.isPending} onClick={submit}><Save className="h-3.5 w-3.5" /> {create.isPending ? "Creating…" : "Create & Add Media"}</Button></div>
      </Card>
    </div>
  );
}

/** Admin editor/preview/publish reuse the customer components, scoped to the company in `?company=`. */
export function AdminPlaylistEditor({ id, view }: { id: string; view: "edit" | "preview" | "publish" }) {
  const scope = useCompanyScope();
  if (!scope.companyId) return <FullPageSpinner />;
  const props = { id, companyId: scope.companyId, basePath: "/playlists", query: `company=${scope.companyId}` };
  return view === "edit" ? <CompanyEditor {...props} /> : view === "preview" ? <CompanyPreview {...props} /> : <CompanyPublish {...props} />;
}
