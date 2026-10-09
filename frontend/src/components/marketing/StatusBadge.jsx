const STYLES = {
  Active: 'dm-badge active',
  Completed: 'dm-badge info',
  Scheduled: 'dm-badge pending',
  Draft: 'dm-badge neutral',
  Paused: 'dm-badge pending',
  Expired: 'dm-badge blocked',
  Available: 'dm-badge neutral',
  'Ready for Analysis': 'dm-badge active',
  Processing: 'dm-badge pending',
  Delivered: 'dm-badge active',
  Shipped: 'dm-badge info',
  Pending: 'dm-badge pending',
  Cancelled: 'dm-badge blocked',
  Returned: 'dm-badge blocked',
  Refunded: 'dm-badge neutral',
  Approved: 'dm-badge active',
  Rejected: 'dm-badge blocked',
  Premium: 'dm-badge active',
  Loyal: 'dm-badge info',
  Inactive: 'dm-badge blocked',
  Regular: 'dm-badge neutral',
}

export default function StatusBadge({ status }) {
  return (
    <span className={STYLES[status] || 'dm-badge neutral'}>
      {status}
    </span>
  )
}
