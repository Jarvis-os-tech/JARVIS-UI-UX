export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="hud-grid absolute inset-0 opacity-60" />
      <div className="animate-drift-a absolute -left-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--cyan-hud)_45%,transparent),transparent_70%)] blur-[90px] opacity-50" />
      <div className="animate-drift-b absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--violet-hud)_45%,transparent),transparent_70%)] blur-[90px] opacity-50" />
      <div className="animate-drift-c absolute left-[34%] top-[38%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--blue-hud)_40%,transparent),transparent_70%)] blur-[100px] opacity-40" />
      <div className="animate-drift-a absolute bottom-[6%] left-[4%] h-64 w-64 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--emerald-hud)_35%,transparent),transparent_70%)] blur-[90px] opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,var(--background)_100%)]" />
    </div>
  );
}
