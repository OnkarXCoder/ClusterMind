import { CalendarDays, TrendingUp, Eye, Trash2 } from 'lucide-react'
import StatusBadge from './StatusBadge'
import Button from './Button'

const COLUMNS = [
  { key: 'name', label: 'Campaign Name' },
  { key: 'segment', label: 'Target Segment' },
  { key: 'channel', label: 'Channel' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'endDate', label: 'End Date' },
  { key: 'status', label: 'Status' },
  { key: 'performance', label: 'Performance' },
]

export default function CampaignTable({ campaigns, onView, onDelete }) {
  return (
    <div className="dm-table-wrap">
      <table className="dm-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length + 1} style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                No campaigns found
              </td>
            </tr>
          )}
          {campaigns.map((c) => (
            <tr key={c.id}>
              <td style={{ fontWeight: 700, color: '#1E293B' }}>{c.name}</td>
              <td>{c.segment}</td>
              <td>{c.channel}</td>
              <td>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <CalendarDays size={13} style={{ color: '#94A3B8' }} />
                  {c.startDate}
                </span>
              </td>
              <td>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <CalendarDays size={13} style={{ color: '#94A3B8' }} />
                  {c.endDate}
                </span>
              </td>
              <td><StatusBadge status={c.status} /></td>
              <td>
                {c.performance ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 700, color: '#16A34A' }}>
                    <TrendingUp size={14} />
                    {c.performance}%
                  </span>
                ) : (
                  <span style={{ color: '#94A3B8' }}>—</span>
                )}
              </td>
              <td>
                <div style={{ display: 'flex', gap: 4 }}>
                  <Button variant="ghost" size="sm" icon={Eye} onClick={() => onView?.(c)}>View</Button>
                  <button onClick={() => onDelete?.(c)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
