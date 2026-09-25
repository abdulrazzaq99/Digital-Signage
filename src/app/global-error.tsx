"use client";
/**
 * Last-resort boundary for errors in the root layout itself. It replaces the whole document, so it
 * renders its own <html>/<body> with inline styles (global CSS isn't loaded here).
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f8fafc", color: "#0f172a", display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <div role="alert" style={{ maxWidth: 420, padding: 32, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, textAlign: "center" }}>
          <h1 style={{ fontSize: 16, margin: 0 }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: "#64748b" }}>The page couldn&apos;t load. Please try again.</p>
          {error.digest && <p style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>Reference: {error.digest}</p>}
          <button onClick={retry} style={{ marginTop: 12, padding: "8px 16px", background: "#2563eb", color: "#fff", border: 0, borderRadius: 8, fontSize: 14, cursor: "pointer" }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
