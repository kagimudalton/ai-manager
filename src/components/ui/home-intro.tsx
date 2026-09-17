export function HomeIntro() {
  return (
    <>
      <div id="aim-intro" className="fixed inset-0 z-[100] pointer-events-none intro-aperture" aria-hidden="true">
        <div className="absolute inset-0 flex items-center justify-center intro-logo">
          <span className="text-white text-lg font-mono uppercase tracking-widest">AI Manager</span>
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var el = document.getElementById("aim-intro");
              if (!el) return;
              var seen = sessionStorage.getItem("aim_intro_played");
              var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              if (seen || reduced) {
                el.style.display = "none";
                return;
              }
              sessionStorage.setItem("aim_intro_played", "true");
              setTimeout(function() { el.style.display = "none"; }, 3300);
            })();
          `,
        }}
      />
    </>
  );
}