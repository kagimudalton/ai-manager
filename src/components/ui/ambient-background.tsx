export function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 20% 10%, var(--accent-soft), transparent 70%), radial-gradient(50% 50% at 90% 80%, var(--brass-soft), transparent 70%)",
        }}
      />
      <div
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full animate-driftA"
        style={{ backgroundColor: "var(--accent)", opacity: 0.22, filter: "blur(70px)", top: "-5%", left: "-10%" }}
      />
      <div
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full animate-driftB"
        style={{ backgroundColor: "var(--brass)", opacity: 0.22, filter: "blur(70px)", bottom: "5%", right: "-10%" }}
      />
      <div className="absolute text-2xl animate-flyAcross" style={{ top: "15%" }}>🦋</div>
      <div className="absolute text-xl animate-flyAcross" style={{ top: "70%", animationDelay: "5s" }}>🐝</div>
    </div>
  );
}