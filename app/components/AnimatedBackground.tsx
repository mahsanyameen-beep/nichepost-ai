interface AnimatedBackgroundProps {
  variant?: "default" | "auth";
}

export default function AnimatedBackground({
  variant = "default",
}: AnimatedBackgroundProps) {
  const auth = variant === "auth";
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      data-testid="animated-bg"
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 75%)",
        }}
      />

      <div
        className="np-blob np-blob-a"
        style={{
          top: auth ? "-12%" : "-18%",
          left: "-10%",
          width: "640px",
          height: "640px",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.45) 0%, rgba(124,58,237,0.12) 45%, transparent 75%)",
        }}
      />
      <div
        className="np-blob np-blob-b"
        style={{
          bottom: "-20%",
          right: "-12%",
          width: "720px",
          height: "720px",
          background:
            "radial-gradient(circle, rgba(255,163,77,0.32) 0%, rgba(255,163,77,0.10) 45%, transparent 75%)",
        }}
      />
      <div
        className="np-blob np-blob-c"
        style={{
          top: "30%",
          left: "40%",
          width: "520px",
          height: "520px",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.28) 0%, rgba(168,85,247,0.08) 50%, transparent 78%)",
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
    </div>
  );
}
