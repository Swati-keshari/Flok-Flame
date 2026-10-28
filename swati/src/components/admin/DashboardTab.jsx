// Admin → Dashboard tab (the first tab of the admin panel).
// Shows numbers from GET /api/stats: today's sales, all-time totals, things that need
// attention, a 7-day sales bar chart, top dishes and top restaurants.
// Refreshes every 30 seconds. Prop: onUnauthorized (log out if the session expired).
// Sales leave out cancelled orders and unpaid online orders (the server decides this).

import { useEffect } from 'react'
import { useAdminFetch } from '../../hooks/useFetch'

const REFRESH_MS = 30000
const rupees = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`
const dayName = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short' })
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
const fullDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })

// One number with a label (a "stat tile")
const Stat = ({ label, value, hint }) => (
  <div className='rounded-lg bg-white p-5 shadow'>
    <p className='text-sm text-gray-600'>{label}</p>
    <p className='mt-1 text-2xl font-bold text-dark'>{value}</p>
    {hint && <p className='mt-1 text-xs text-gray-500'>{hint}</p>}
  </div>
)

// "Needs attention" tile: highlighted only when the count is above zero
const Alert = ({ label, count, onClick }) => (
  <button
    type='button'
    onClick={onClick}
    className={`rounded-lg p-4 text-left shadow transition ${count > 0 ? 'bg-blue-50 ring-2 ring-blue-200 hover:ring-blue-300' : 'bg-white'}`}
  >
    <p className={`text-2xl font-bold ${count > 0 ? 'text-blue-800' : 'text-gray-400'}`}>{count}</p>
    <p className='text-sm font-semibold text-dark'>{label}</p>
  </button>
)

// Sales of the last 7 days as vertical bars (one series → no legend; the title names it).
// Hover a bar for the exact numbers; the same numbers are in the table below.
const SalesChart = ({ days }) => {
  const max = Math.max(...days.map((d) => d.revenue), 1)
  const best = days.reduce((a, b) => (b.revenue > a.revenue ? b : a), days[0])
  return (
    <div>
      <div className='flex h-48 items-end gap-[2px] border-b border-gray-300'>
        {days.map((d, i) => {
          const isToday = i === days.length - 1
          return (
            // tabIndex: the tooltip also opens on tap / keyboard focus (phones have no hover)
            <div key={d.date} tabIndex={0} className='group relative flex h-full flex-1 items-end justify-center rounded outline-none focus-visible:ring-2 focus-visible:ring-primary'>
              {/* the bar: rounded top, anchored to the baseline; a 2px line marks empty days */}
              <div
                className='w-3/5 max-w-12 rounded-t-[4px] bg-primary transition-opacity group-hover:opacity-80'
                style={{ height: d.revenue ? `${(d.revenue / max) * 100}%` : '2px', opacity: d.revenue ? 1 : 0.25 }}
                role='img'
                aria-label={`${fullDate(d.date)}: ${rupees(d.revenue)} from ${plural(d.orders, 'order')}`}
              />
              {/* direct label only on the best day, so the chart stays clean */}
              {d === best && d.revenue > 0 && (
                <span className='pointer-events-none absolute text-xs font-semibold text-dark' style={{ bottom: `calc(${(d.revenue / max) * 100}% + 4px)` }}>
                  {rupees(d.revenue)}
                </span>
              )}
              {/* tooltip: just above the bar, on hover, tap or keyboard focus */}
              <div
                className={`pointer-events-none absolute z-10 hidden whitespace-nowrap rounded bg-dark px-3 py-2 text-xs text-white shadow-lg group-hover:block group-focus:block ${i < 2 ? 'left-0' : i > days.length - 3 ? 'right-0' : ''}`}
                style={{ bottom: `calc(${d.revenue ? (d.revenue / max) * 100 : 0}% + 24px)` }}
              >
                <p className='font-semibold'>{fullDate(d.date)}{isToday && ' (today)'}</p>
                <p>{rupees(d.revenue)} · {plural(d.orders, 'order')}</p>
              </div>
            </div>
          )
        })}
      </div>
      <div className='mt-2 flex gap-[2px]'>
        {days.map((d, i) => (
          <span key={d.date} className={`flex-1 text-center text-xs ${i === days.length - 1 ? 'font-bold text-dark' : 'text-gray-500'}`}>
            {i === days.length - 1 ? 'Today' : dayName(d.date)}
          </span>
        ))}
      </div>
      <details className='mt-4 text-sm'>
        <summary className='cursor-pointer font-semibold text-gray-600'>Show as table</summary>
        <table className='mt-2 w-full text-left'>
          <thead className='text-gray-600'><tr><th className='py-1'>Day</th><th>Orders</th><th className='text-right'>Sales</th></tr></thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.date} className='border-t'><td className='py-1'>{fullDate(d.date)}</td><td>{d.orders}</td><td className='text-right'>{rupees(d.revenue)}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}

// A ranked list (top dishes / top restaurants) with a thin bar showing the share
const RankList = ({ title, rows, valueOf, labelOf, empty }) => {
  const max = Math.max(...rows.map(valueOf), 1)
  return (
    <div className='rounded-lg bg-white p-5 shadow'>
      <h3 className='mb-4 font-bold text-dark'>{title}</h3>
      {rows.length === 0 ? (
        <p className='text-sm text-gray-500'>{empty}</p>
      ) : (
        <ol className='space-y-3'>
          {rows.map((row, i) => (
            <li key={row.name}>
              <div className='flex justify-between gap-3 text-sm'>
                <span className='truncate text-dark'><span className='mr-2 text-gray-400'>{i + 1}.</span>{row.name}</span>
                <span className='shrink-0 font-semibold text-dark'>{labelOf(row)}</span>
              </div>
              <div className='mt-1 h-1.5 rounded-full bg-gray-100'>
                <div className='h-1.5 rounded-full bg-primary' style={{ width: `${(valueOf(row) / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

const DashboardTab = ({ onUnauthorized, onOpenTab }) => {
  const { data: stats, error, isLoading, reload } = useAdminFetch('/api/stats', undefined, onUnauthorized)

  useEffect(() => {
    const timer = setInterval(reload, REFRESH_MS)
    return () => clearInterval(timer)
  }, [reload])

  if (isLoading && !stats) return <p className='text-gray-700'>Loading dashboard...</p>
  if (error && !stats) return <p className='text-red-600'>{error.message}</p>

  const { today, allTime, needsAttention, last7Days, topDishes, topRestaurants } = stats
  const weekRevenue = last7Days.reduce((s, d) => s + d.revenue, 0)
  const weekOrders = last7Days.reduce((s, d) => s + d.orders, 0)

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='mb-3 text-lg font-bold text-dark'>Today</h2>
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          <Stat label='Sales today' value={rupees(today.revenue)} />
          <Stat label='Orders today' value={today.orders} />
          <Stat label='Average order' value={rupees(today.averageOrder)} />
          <Stat label='Table bookings today' value={today.bookings} />
        </div>
      </div>

      <div>
        <h2 className='mb-3 text-lg font-bold text-dark'>Needs attention</h2>
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          <Alert label='New orders to accept' count={needsAttention.newOrders} onClick={() => onOpenTab?.('orders')} />
          <Alert label='In the kitchen' count={needsAttention.inKitchen} onClick={() => onOpenTab?.('orders')} />
          <Alert label='Out for delivery' count={needsAttention.outForDelivery} onClick={() => onOpenTab?.('orders')} />
          <Alert label='Bookings to confirm' count={needsAttention.pendingBookings} onClick={() => onOpenTab?.('bookings')} />
        </div>
      </div>

      <div className='rounded-lg bg-white p-5 shadow'>
        <div className='mb-6 flex flex-wrap items-baseline justify-between gap-2'>
          <h2 className='text-lg font-bold text-dark'>Sales, last 7 days</h2>
          <p className='text-sm text-gray-600'>{rupees(weekRevenue)} from {plural(weekOrders, 'order')} · tap a bar for details</p>
        </div>
        <SalesChart days={last7Days} />
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <RankList
          title='Top dishes'
          rows={topDishes}
          valueOf={(d) => d.quantity}
          labelOf={(d) => `${d.quantity} sold · ${rupees(d.revenue)}`}
          empty='No orders yet.'
        />
        <RankList
          title='Top restaurants'
          rows={topRestaurants}
          valueOf={(r) => r.revenue}
          labelOf={(r) => `${rupees(r.revenue)} · ${plural(r.orders, 'order')}`}
          empty='No orders yet.'
        />
      </div>

      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <Stat label='All-time sales' value={rupees(allTime.revenue)} />
        <Stat label='All-time orders' value={allTime.orders} />
        <Stat label='Customer accounts' value={allTime.customers} />
        <Stat label='Messages received' value={allTime.messages} />
      </div>

      <p className='text-xs text-gray-500'>This page refreshes every {REFRESH_MS / 1000} seconds.</p>
    </div>
  )
}

export default DashboardTab
