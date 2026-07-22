// 시안 하단의 "FRAGILE / STILL LOVED", "HANDLE WITH GRACE" 스탬프 장식.
export function StampBadge() {
  return (
    <div className="flex items-center justify-center gap-2 font-accent text-[8px] uppercase leading-tight tracking-wide text-text-muted sm:text-[9px]">
      <span className="rounded border border-border px-1.5 py-1 text-center">
        Fragile
        <br />
        Still loved
      </span>
      <span className="rounded border border-border px-1.5 py-1 text-center">
        Handle
        <br />
        With grace
      </span>
    </div>
  );
}
