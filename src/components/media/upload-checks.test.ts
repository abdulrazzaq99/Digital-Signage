import { describe, expect, it } from "vitest";
import { MAX_UPLOAD_BYTES } from "@/lib/upload";
import { fileProblem, MAX_BATCH_FILES, planAdd, uploadTagsSchema } from "./upload-checks";

const f = (name: string, type: string, size = 1024) => ({ name, type, size });

describe("upload file checks", () => {
  it("accepts JPG, PNG, MP4 and PDF", () => {
    for (const t of ["image/jpeg", "image/png", "video/mp4", "application/pdf"]) expect(fileProblem(f("a", t))).toBeNull();
  });

  it("rejects other types, empty files and files over the size limit with a reason", () => {
    expect(fileProblem(f("notes.txt", "text/plain"))).toMatch(/text\/plain files aren't supported/);
    expect(fileProblem(f("mystery", ""))).toMatch(/This file type isn't supported/);
    expect(fileProblem(f("empty.png", "image/png", 0))).toMatch(/empty/);
    expect(fileProblem(f("huge.mp4", "video/mp4", MAX_UPLOAD_BYTES + 1))).toMatch(/or smaller/);
    expect(fileProblem(f(`${"x".repeat(201)}.png`, "image/png"))).toMatch(/200 characters/);
  });

  it("skips duplicates (already queued or twice in the same drop)", () => {
    const a = f("a.png", "image/png");
    const { add, skipped } = planAdd([a], [f("a.png", "image/png"), f("b.png", "image/png"), f("b.png", "image/png")]);
    expect(add.map((x) => x.file.name)).toEqual(["b.png"]);
    expect(skipped).toMatch(/2 duplicate files were skipped/);
  });

  it("caps a batch and flags bad files on their own row", () => {
    const queued = Array.from({ length: MAX_BATCH_FILES - 1 }, (_, i) => f(`q${i}.png`, "image/png"));
    const { add, skipped } = planAdd(queued, [f("bad.txt", "text/plain"), f("late.png", "image/png")]);
    expect(add).toHaveLength(1);
    expect(add[0].problem).toMatch(/supported/);
    expect(skipped).toMatch(/1 file was left out: upload at most 20 files/);
  });

  it("validates tags: at most 20, each at most 40 characters", () => {
    expect(uploadTagsSchema.safeParse({ tags: "lobby, summer" }).success).toBe(true);
    expect(uploadTagsSchema.safeParse({ tags: "x".repeat(41) }).success).toBe(false);
    expect(uploadTagsSchema.safeParse({ tags: Array.from({ length: 21 }, (_, i) => `t${i}`).join(",") }).success).toBe(false);
  });
});
