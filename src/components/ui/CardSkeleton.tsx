// Placeholder card shown while a page of projects loads, shaped like the real card so the grid
// does not jump when the data arrives.

export function CardSkeleton() {
  return (
    <div className="border-line bg-surface animate-pulse overflow-hidden rounded-2xl border">
      <div className="bg-surface-raised aspect-video w-full" aria-hidden="true" />
      <div className="space-y-3 p-5" aria-hidden="true">
        <div className="bg-surface-raised h-4 w-2/3 rounded" />
        <div className="bg-surface-raised h-3 w-full rounded" />
        <div className="bg-surface-raised h-3 w-4/5 rounded" />
        <div className="flex gap-1.5 pt-2">
          <div className="bg-surface-raised h-5 w-14 rounded-md" />
          <div className="bg-surface-raised h-5 w-16 rounded-md" />
        </div>
        <div className="border-line flex items-center justify-between border-t pt-3.5">
          <div className="bg-surface-raised h-7 w-24 rounded-full" />
          <div className="bg-surface-raised h-7 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}
