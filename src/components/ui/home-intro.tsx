export function HomeIntro() {
  return (
    <>
      <div id="aim-intro" className="fixed inset-0 z-[100] pointer-events-none intro-fadeout" aria-hidden="true">
        <div className="absolute inset-0 intro-cover" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[3px] intro-bolt"
          style={{ background: "linear-gradient(180deg, transparent, var(--accent) 30%, #ffffff 100%)", boxShadow: "0 0 20px 4px var(--accent)" }}
        />
        <div className="absolute inset-0 bg-white intro-flash" />
        <div
          className="absolute rounded-full intro-ring"
          style={{ left: "50%", top: "82%", transform: "translate(-50%, -50%)", borderStyle: "solid", borderColor: "var(--accent)", boxShadow: "0 0 40px 10px var(--accent)" }}
        />
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
              setTimeout(function() { el.style.display = "none"; }, 5200);
            })();
          `,
        }}
      />
    </>
  );
}