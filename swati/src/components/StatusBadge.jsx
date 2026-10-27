// StatusBadge: coloured pill for a TABLE BOOKING status (pending / confirmed / cancelled).
// Prop: status. (Food orders use OrderStatusBadge instead.)

const styles = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-200 text-gray-600',
}

const StatusBadge = ({ status }) => (
  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[status] || styles.pending}`}>
    {status}
  </span>
)

export default StatusBadge
