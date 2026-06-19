interface Column<T> {
  label: string
  key?: keyof T
  render?: (row: T) => React.ReactNode
  className?: string
}

interface AdminTableProps<T extends { id: string | number }> {
  columns: Column<T>[]
  rows: T[]
  emptyMessage?: string
}

export default function AdminTable<T extends { id: string | number }>({
  columns, rows, emptyMessage = 'No records found.',
}: AdminTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {columns.map(col => (
              <th key={col.label} className={`text-left px-4 py-3 font-medium text-slate-600 text-xs ${col.className ?? ''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400 text-sm">
                {emptyMessage}
              </td>
            </tr>
          )}
          {rows.map(row => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              {columns.map(col => (
                <td key={col.label} className={`px-4 py-3 text-slate-700 ${col.className ?? ''}`}>
                  {col.render ? col.render(row) : col.key ? String(row[col.key] ?? '') : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
