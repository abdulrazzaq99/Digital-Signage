"use client";
import { useCompanyScope } from "@/components/admin/company-scope";
import { PlaylistEditor as CompanyEditor } from "@/components/portal/playlist-editor";
import { PlaylistPreview as CompanyPreview } from "@/components/portal/playlist-preview";
import { PlaylistPublish as CompanyPublish } from "@/components/portal/playlist-publish";
import { CompanyGate, CompanySelect } from "@/components/screens/query-guards";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { applyApiError, Field, fieldError, FormError, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input, Label } from "@/components/ui/input";
import { BackLink } from "@/components/ui/misc";
import { Skeleton } from "@/components/ui/query-state";
import { useCreatePlaylist } from "@/lib/api/hooks/playlists";
import { maskName } from "@/lib/validation/masks";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { PLAYLIST_NAME_MAX, playlistNameSchema } from "./playlist-schema";

/** Admin "new playlist": choose the company and a name, then continue in the shared editor. */
export function CreatePlaylist() {
  const router = useRouter();
  const scope = useCompanyScope();
  const create = useCreatePlaylist(scope.companyId);
  const form = useZodForm(playlistNameSchema, { defaultValues: { name: "" } });
  const submit = form.handleSubmit(async (v) => {
    if (!scope.companyId) { form.setError("root.server", { type: "manual", message: "Choose the company this playlist belongs to." }); return; }
    try {
      const p = await create.mutateAsync({ name: v.name, items: [] });
      router.replace(`/playlists/${p.id}/edit?company=${scope.companyId}`);
    } catch (e) { applyApiError(form, e); }
  });
  return (
    <div className="space-y-5">
      <BackLink href={scope.withCompany("/playlists")} label="Playlists" current="Create Playlist" />
      <div><h1 className="text-xl font-bold tracking-tight text-slate-900">Create Playlist</h1><p className="mt-1 text-sm text-slate-400">Build a playlist from the company&apos;s media library.</p></div>
      <Card className="max-w-xl">
        <form onSubmit={submit} noValidate className="space-y-4 px-5 py-4">
          <FormError form={form} />
          <div><Label htmlFor="new-playlist-company" required>Company</Label><CompanySelect id="new-playlist-company" value={scope.companyId} onChange={scope.setCompanyId} /></div>
          <Field label="Playlist Name" required error={fieldError(form, "name")}><Input placeholder="e.g. Weekend Promotion" maxLength={PLAYLIST_NAME_MAX} autoFocus {...maskedRegister(form, "name", maskName)} /></Field>
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" href={scope.withCompany("/playlists")}>Cancel</Button><SubmitButton form={form} pendingText="Creating…"><Save className="h-3.5 w-3.5" /> Create &amp; Add Media</SubmitButton></div>
        </form>
      </Card>
    </div>
  );
}

/** Admin editor/preview/publish reuse the customer components, scoped to the company in `?company=`. */
export function AdminPlaylistEditor({ id, view }: { id: string; view: "edit" | "preview" | "publish" }) {
  const scope = useCompanyScope();
  const props = { id, companyId: scope.companyId, basePath: "/playlists", query: `company=${scope.companyId}` };
  // Without a company there is nothing to load; the gate shows loading / error / "choose a company" instead of an endless spinner.
  return (
    <CompanyGate companyId={scope.companyId} skeleton={<Skeleton className="h-96" />} what="this playlist">
      {view === "edit" ? <CompanyEditor {...props} /> : view === "preview" ? <CompanyPreview {...props} /> : <CompanyPublish {...props} />}
    </CompanyGate>
  );
}
