export default function DataTable({ columns, rows, renderRow, emptyMessage = 'No records found' }) {
  return (
    <div className="dashboard-table-wrap overflow-x-auto">
      <table className="dashboard-table w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            {columns.map((col) => (
              <th key={col.key} className={`whitespace-nowrap px-5 py-3.5 font-semibold ${col.className || ''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-5 py-10 text-center text-sm text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          )}
          {rows.map((row, i) =>
            renderRow ? (
              renderRow(row, i)
            ) : (
              <tr key={i} className="transition hover:bg-slate-50">
                {columns.map((col) => (
                  <td key={col.key} className={`whitespace-nowrap px-5 py-4 text-slate-700 ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  )
}
