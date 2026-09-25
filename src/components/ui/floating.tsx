"use client";
/**
 * Floating panels (menus, pickers) rendered in a portal on <body> with fixed positioning, so no
 * table, card or scrolling dialog with `overflow` can clip them. The panel is placed next to its
 * anchor, flips above/below (or left/right) when there isn't room, is kept inside the viewport,
 * and follows the anchor on scroll and resize.
 */
import { useEffect, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type Placement = "bottom-start" | "bottom-end" | "top-start" | "right-end";

const GAP = 4;
const MARGIN = 8;

function place(anchor: HTMLElement, panel: HTMLElement, placement: Placement) {
  const a = anchor.getBoundingClientRect();
  const w = panel.offsetWidth;
  const h = panel.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let top: number;
  let left: number;

  if (placement === "right-end") {
    left = a.right + GAP * 2;
    if (left + w > vw - MARGIN) left = a.left - w - GAP * 2; // no room on the right: open to the left
    top = a.bottom - h;
  } else {
    const below = vh - a.bottom - GAP - MARGIN;
    const above = a.top - GAP - MARGIN;
    const wantsAbove = placement === "top-start";
    // Prefer the requested side; flip when it doesn't fit and the other side has more room.
    const useAbove = wantsAbove ? !(h > above && below > above) : h > below && above > below;
    top = useAbove ? a.top - GAP - h : a.bottom + GAP;
    left = placement === "bottom-end" ? a.right - w : a.left;
  }

  left = Math.min(Math.max(MARGIN, left), vw - w - MARGIN);
  top = Math.min(Math.max(MARGIN, top), vh - h - MARGIN);
  panel.style.top = `${Math.round(top)}px`;
  panel.style.left = `${Math.round(left)}px`;
  panel.style.visibility = "visible";
}

/**
 * The panel itself. `anchor` is the element it attaches to (usually the trigger button); `panelRef`
 * lets the owner treat clicks inside the panel as "inside" for outside-click handling.
 */
export function Floating({ anchor, open, placement = "bottom-start", panelRef, className, children, ...rest }: {
  anchor: RefObject<HTMLElement | null>;
  open: boolean;
  placement?: Placement;
  panelRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  children: ReactNode;
  role?: string;
  "aria-label"?: string;
  id?: string;
}) {
  const own = useRef<HTMLDivElement>(null);
  const ref = panelRef ?? own;

  useLayoutEffect(() => {
    if (!open || !anchor.current || !ref.current) return;
    const update = () => anchor.current && ref.current && place(anchor.current, ref.current, placement);
    update();
    // Content can change size after opening (search filtering, async items).
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(update) : null;
    ro?.observe(ref.current);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchor, ref, placement]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div ref={ref} style={{ position: "fixed", top: 0, left: 0, visibility: "hidden" }} className={cn("z-[60]", className)} {...rest}>
      {children}
    </div>,
    document.body,
  );
}

/** Closes on a click/touch outside both the anchor and the panel, and on Escape. */
export function useDismiss(open: boolean, close: () => void, refs: RefObject<HTMLElement | null>[]) {
  const latest = useRef({ close, refs });
  useEffect(() => {
    latest.current = { close, refs };
  });
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (!latest.current.refs.some((r) => r.current?.contains(target))) latest.current.close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Close just this panel, not the dialog it sits in (dialogs listen for Escape on window).
      e.stopPropagation();
      latest.current.close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
}
