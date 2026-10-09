export default function DataTable({ columns, rows, renderRow, emptyMessage = 'No records found' }) {
  return (
    <div className="dm-table-wrap">
      <table className="dm-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.className ? { className: col.className } : {}}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                {emptyMessage}
              </td>
            </tr>
          )}
          {rows.map((row, i) =>
            renderRow ? (
              renderRow(row, i)
            ) : (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className={col.cellClassName || ''}>
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
