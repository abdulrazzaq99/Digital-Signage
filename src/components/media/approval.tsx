"use client";
/** Shared pieces for upload approval: status badge, notice, and the Super Admin's approve/reject controls. */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { applyApiError, Field, fieldError, FormError, SubmitButton, useZodForm } from "@/components/ui/form";
import { Textarea } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useReviewMedia } from "@/lib/api/hooks/media";
import type { Media } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";
import { text } from "@/lib/validation/fields";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

export const REJECT_REASON_MAX = 500;

export function approvalLabel(a: Media["approval"]) {
  return a === "PENDING" ? "Waiting for approval" : a === "REJECTED" ? "Not approved" : "Approved";
}

/** Shown only when it matters: approved files carry no badge in lists unless `showApproved`. */
export function ApprovalBadge({ item, showApproved, className }: { item: Pick<Media, "approval">; showApproved?: boolean; className?: string }) {
  if (item.approval === "APPROVED" && !showApproved) return null;
  return <Badge tone={item.approval === "PENDING" ? "amber" : item.approval === "REJECTED" ? "red" : "green"} dot className={className}>{approvalLabel(item.approval)}</Badge>;
}

/** Plain-words explanation of where a file stands, for detail views. */
export function ApprovalNotice({ item }: { item: Media }) {
  if (item.approval === "PENDING") return <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800"><div className="font-semibold">Waiting for approval</div>This file won&apos;t be shown on any screen until the platform administrator approves it.</div>;
  if (item.approval === "REJECTED") return <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700"><div className="font-semibold">Not approved</div>{item.rejectionReason ? <>Reason: {item.rejectionReason}<br /></> : null}It won&apos;t be shown on your screens. Upload a corrected version to replace it.</div>;
  return null;
}

const rejectSchema = z.object({ reason: text(REJECT_REASON_MAX, 3) });

function RejectModal({ item, onClose, onDone }: { item: Media; onClose: () => void; onDone?: () => void }) {
  const review = useReviewMedia();
  const toast = useToast();
  const form = useZodForm(rejectSchema, { defaultValues: { reason: "" } });
  const close = () => { if (!form.formState.isSubmitting) onClose(); };
  const submit = form.handleSubmit(async (v) => {
    try {
      await review.mutateAsync({ id: item.id, approve: false, reason: v.reason });
      toast.success("File not approved", `${item.company.name} has been told why.`);
      onClose(); onDone?.();
    } catch (e) { applyApiError(form, e); }
  });
  return (
    <Modal open onClose={close} width="max-w-[440px]">
      <ModalHeader title="Don't approve this file" subtitle={item.name} onClose={close} />
      <form onSubmit={submit} noValidate>
        <div className="space-y-3 px-6 py-5">
          <FormError form={form} />
          <Field label="Reason" required hint="The company sees this in the portal and in an email." error={fieldError(form, "reason")}>
            <Textarea rows={4} maxLength={REJECT_REASON_MAX} autoFocus placeholder="For example: the prices are out of date" {...form.register("reason")} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
          <SubmitButton form={form} variant="danger" pendingText="Saving…">Don&apos;t approve</SubmitButton>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Approve / Don't approve buttons. A file can be approved once it has finished processing; an
 * approved file can still be withdrawn later with a reason.
 */
export function ReviewActions({ item, size, onDone, className }: { item: Media; size?: "sm"; onDone?: () => void; className?: string }) {
  const review = useReviewMedia();
  const toast = useToast();
  const [rejecting, setRejecting] = useState(false);
  const ready = item.status === "READY";
  const approve = () => !review.isPending && review.mutate({ id: item.id, approve: true }, { onSuccess: () => { toast.success("Approved", `${item.name} can now play on ${item.company.name}'s screens.`); onDone?.(); }, onError: (e) => toast.error(e) });
  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {item.approval !== "APPROVED" && <Button size={size} onClick={approve} disabled={!ready || review.isPending} title={ready ? undefined : "Approve once the file has finished processing"}><Check className="h-3.5 w-3.5" /> Approve</Button>}
        {item.approval !== "REJECTED" && <Button size={size} variant="danger-outline" onClick={() => setRejecting(true)} disabled={review.isPending}><X className="h-3.5 w-3.5" /> {item.approval === "APPROVED" ? "Withdraw approval" : "Don't approve"}</Button>}
      </div>
      {!ready && item.approval === "PENDING" && <p className="mt-1.5 text-[11px] text-slate-400">Still processing. You can approve it when it&apos;s ready.</p>}
      {item.reviewedAt && <p className="mt-1.5 text-[11px] text-slate-400">{approvalLabel(item.approval)} {item.reviewedBy ? `by ${item.reviewedBy} ` : ""}on {formatDateTime(item.reviewedAt)}</p>}
      {rejecting && <RejectModal item={item} onClose={() => setRejecting(false)} onDone={onDone} />}
    </div>
  );
}
