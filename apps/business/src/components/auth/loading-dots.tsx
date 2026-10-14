/**
 * The `· ● ·` indicator shown inside a primary button while a mutation is
 * pending (see the loading designs).
 */
export function LoadingDots() {
  return (
    <span data-slot="loading-dots" className="flex items-center gap-[10px]">
      <span className="size-[5px] rounded-full bg-[#7a7a7a]" />
      <span className="size-[9px] rounded-full bg-[#1a1a1a]" />
      <span className="size-[5px] rounded-full bg-[#7a7a7a]" />
    </span>
  )
}
