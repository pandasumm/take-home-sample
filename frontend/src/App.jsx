import { useQuery, useMutation } from '@tanstack/react-query'
import './App.css'

function App() {
  const { data: backendStatus, error: backendError } = useQuery({
    queryKey: ['hello'],
    queryFn: async () => {
      const response = await fetch('http://localhost:4000/api/hello')
      return response.json()
    }
  })

  const {
    data: tickets,
    isLoading: ticketsLoading,
    error: ticketsError,
    refetch: refetchTickets
  } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await fetch('http://localhost:4000/api/tickets')
      return response.json()
    }
  })

  const buyMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`http://localhost:4000/api/tickets/${id}/buy`, {
        method: 'POST'
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Buy failed')
      }
      return res.json()
    },
    onSuccess: () => {
      refetchTickets()
    }
  })

  const handleBuy = (id) => {
    buyMutation.mutate(id)
  }

  const grouped = (tickets || []).reduce((acc, t) => {
    const key = `${t.show_name}__${t.date}`
    acc[key] = acc[key] || { show_name: t.show_name, date: t.date, rows: [] }
    acc[key].rows.push(t)
    return acc
  }, {})

  return (
    <>
      <div className="status-bar">
        <p className="status-bar__title">Jerry</p>
        <p className="status-bar__msg">
          {backendStatus?.message || backendError?.message || '...'}
        </p>
      </div>

      <div className="card">
        <h3>Tickets</h3>
        {ticketsLoading && <p>Loading...</p>}
        {ticketsError && <p style={{ color: 'red' }}>Error loading tickets</p>}
        {!ticketsLoading && !ticketsError && tickets?.length === 0 && <p>No tickets</p>}

        {Object.values(grouped).map(group => (
          <div key={group.show_name + group.date} className="ticket-group">
            <h4>{group.show_name} — {group.date}</h4>
            <ul className="ticket-list">
              {group.rows.map(t => (
                <li key={t.id}>
                  Section: {t.section} | Price: ${t.price} | Count: {t.count}
                  <button
                    style={{ marginLeft: 8 }}
                    disabled={t.count < 0}
                    onClick={() => handleBuy(t.id)}
                  >
                    {t.count > 0 ? 'Buy' : 'Sold Out?'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {buyMutation.isError && (
          <p style={{ color: 'red' }}>Buy error: {buyMutation.error.message}</p>
        )}
      </div>
    </>
  )
}

export default App
