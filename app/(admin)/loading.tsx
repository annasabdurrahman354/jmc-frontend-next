export default function AdminLoading() {
  return (
    <div className="space-y-4">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <div className="bg-muted h-7 w-48 animate-pulse rounded-md" />
        <div className="bg-muted h-9 w-24 animate-pulse rounded-md" />
      </div>

      {/* Card skeleton */}
      <div className="bg-card rounded-xl border shadow-sm">
        <div className="border-b p-4">
          <div className="bg-muted h-9 w-64 animate-pulse rounded-md ml-auto" />
        </div>
        <div className="p-0">
          {/* Table skeleton */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {[12, 20, 25, 20, 15, 8].map((w, i) => (
                  <th key={i} className="p-3 text-left">
                    <div className={`bg-muted h-4 w-${w} animate-pulse rounded`} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b">
                  {[12, 20, 25, 20, 15, 8].map((w, j) => (
                    <td key={j} className="p-3">
                      <div
                        className={`bg-muted h-4 animate-pulse rounded`}
                        style={{ width: `${w * 5}px` }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
