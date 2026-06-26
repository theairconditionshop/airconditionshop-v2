interface Column<T> {
  label:     string
  key?:      keyof T
  render?:   (row: T) => React.ReactNode
  className?: string
  /** Hide on mobile (below sm breakpoint) */
  hideMobile?: boolean
}

interface AdminTableProps<T extends { id: string | number }> {
  columns:       Column<T>[]
  rows:          T[]
  emptyMessage?: string
  /** When provided, renders stacked cards on mobile instead of a scrollable table */
  mobileRender?: (row: T) => React.ReactNode
}

export default function AdminTable<T extends { id: string | number }>({
  columns, rows, emptyMessage = 'No records found.', mobileRender,
}: AdminTableProps<T>) {
  return (
    <div className="w-full space-y-0">
      {/* ── Mobile card list (below sm) ── */}
      {mobileRender && (
        <div className="sm:hidden space-y-2">
          {rows.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 px-4 py-10 text-center text-slate-400 text-sm">
              {emptyMessage}
            </div>
          ) : (
            rows.map(row => (
              <div key={row.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                {mobileRender(row)}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Desktop table (always shown; hidden on mobile when mobileRender is set) ── */}
      <div className={mobileRender ? 'hidden sm:block' : undefined}>
        <div className="w-full overflow-hidden rounded-xl border border-slate-100 bg-white">
          <div className="overflow-x-auto overscroll-x-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full text-sm" style={{ minWidth: '480px' }}>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {columns.map(col => (
                    <th
                      key={col.label}
                      className={[
                        'text-left px-4 py-3 font-semibold text-slate-500 text-xs whitespace-nowrap',
                        col.hideMobile ? 'hidden sm:table-cell' : '',
                        col.className ?? '',
                      ].join(' ')}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-10 text-center text-slate-400 text-sm"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                )}
                {rows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    {columns.map(col => (
                      <td
                        key={col.label}
                        className={[
                          'px-4 py-3 text-slate-700 align-middle',
                          col.hideMobile ? 'hidden sm:table-cell' : '',
                          col.className ?? '',
                        ].join(' ')}
                      >
                        {col.render
                          ? col.render(row)
                          : col.key
                            ? String(row[col.key] ?? '')
                            : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
