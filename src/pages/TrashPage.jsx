import { useState, useEffect } from 'react'
import { Trash2, RotateCcw, Loader, Filter } from 'lucide-react'
import apiClient from '../config/api'

export default function TrashPage() {
  const [heroes, setHeroes] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [filter, setFilter] = useState('all') // 'all' | 'heroes' | 'items'
  const [subFilter, setSubFilter] = useState('all')

  const fetchTrash = async () => {
    setLoading(true)
    try {
      const [hRes, iRes] = await Promise.all([
        apiClient.get('/heroes'),
        apiClient.get('/items'),
      ])
      setHeroes(hRes.data.filter((h) => h.is_deleted))
      setItems(iRes.data.filter((i) => i.is_deleted))
    } catch (err) {
      console.error('Gagal memuat data sampah:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrash()
  }, [])

  const handleRestore = async (type, id) => {
    setBusyId(`${type}-${id}`)
    try {
      await apiClient.put(`/${type}/${id}`, { is_deleted: false })
      if (type === 'heroes') {
        setHeroes((prev) => prev.filter((h) => h.id !== id))
      } else {
        setItems((prev) => prev.filter((i) => i.id !== id))
      }
    } catch {
      alert('Gagal memulihkan data.')
    } finally {
      setBusyId(null)
    }
  }

  const handlePermanentDelete = async (type, id, name) => {
    const ok = window.confirm(`Hapus permanen "${name}"? Data tidak bisa dikembalikan.`)
    if (!ok) return

    setBusyId(`${type}-${id}`)
    try {
      await apiClient.delete(`/${type}/${id}`)
      if (type === 'heroes') {
        setHeroes((prev) => prev.filter((h) => h.id !== id))
      } else {
        setItems((prev) => prev.filter((i) => i.id !== id))
      }
    } catch {
      alert('Gagal menghapus permanen.')
    } finally {
      setBusyId(null)
    }
  }

  const subOptions =
    filter === 'heroes'
      ? ['all', ...new Set(heroes.map((h) => h.role).filter(Boolean))]
      : filter === 'items'
      ? ['all', ...new Set(items.map((i) => i.category).filter(Boolean))]
      : [
          'all',
          ...new Set([
            ...heroes.map((h) => h.role).filter(Boolean),
            ...items.map((i) => i.category).filter(Boolean),
          ]),
        ]

  const filteredHeroes = heroes.filter(
    (h) => subFilter === 'all' || h.role === subFilter
  )
  const filteredItems = items.filter(
    (i) => subFilter === 'all' || i.category === subFilter
  )

  const totalTrash = heroes.length + items.length
  const showHeroes =
    (filter === 'all' || filter === 'heroes') && filteredHeroes.length > 0
  const showItems =
    (filter === 'all' || filter === 'items') && filteredItems.length > 0

  const isFilteredEmpty =
    (filter === 'all' && filteredHeroes.length === 0 && filteredItems.length === 0) ||
    (filter === 'heroes' && filteredHeroes.length === 0) ||
    (filter === 'items' && filteredItems.length === 0)

  const handleSelectMainFilter = (nextFilter) => {
    setFilter(nextFilter)
    setSubFilter('all')
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Trash / Sampah</h1>
        <p>Pulihkan data terhapus atau hapus permanen</p>
      </header>

      <div className="filter-toolbar">
        <div className="pills">
          <button
            type="button"
            className={`pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleSelectMainFilter('all')}
          >
            All ({totalTrash})
          </button>
          <button
            type="button"
            className={`pill ${filter === 'heroes' ? 'active' : ''}`}
            onClick={() => handleSelectMainFilter('heroes')}
          >
            Heroes ({heroes.length})
          </button>
          <button
            type="button"
            className={`pill ${filter === 'items' ? 'active' : ''}`}
            onClick={() => handleSelectMainFilter('items')}
          >
            Items ({items.length})
          </button>
        </div>

        <label className="filter-select-wrap">
          <Filter size={15} />
          <select
            className="filter-select"
            value={subFilter}
            onChange={(e) => setSubFilter(e.target.value)}
            aria-label="Filter Role atau Kategori Sampah"
          >
            {subOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === 'all' ? 'Semua Role/Kategori' : opt}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && (
        <div className="center-state">
          <Loader className="spin" size={28} />
          <p>Memuat data sampah...</p>
        </div>
      )}

      {!loading && isFilteredEmpty && (
        <div className="center-state">
          <Trash2 size={36} style={{ marginBottom: 8, opacity: 0.4 }} />
          <p>
            {filter === 'heroes'
              ? 'Tidak ada Hero di sampah yang cocok.'
              : filter === 'items'
              ? 'Tidak ada Item di sampah yang cocok.'
              : 'Tempat sampah kosong.'}
          </p>
          <p className="muted">Hero atau Item yang dihapus akan muncul di sini.</p>
        </div>
      )}

      {!loading && showHeroes && (
        <section className="trash-section">
          {filter === 'all' && (
            <h3 className="trash-title">Heroes ({filteredHeroes.length})</h3>
          )}
          <div className="trash-list">
            {filteredHeroes.map((hero) => {
              const isBusy = busyId === `heroes-${hero.id}`
              return (
                <div key={hero.id} className="trash-item">
                  <div className="trash-left">
                    <img
                      src={hero.image_url}
                      alt={hero.name}
                      className="trash-thumb"
                    />
                    <div className="trash-info">
                      <h4>{hero.name}</h4>
                      <p className="muted">
                        {hero.role} • {hero.lane}
                      </p>
                    </div>
                  </div>
                  <div className="action-group">
                    <button
                      className="btn-restore"
                      disabled={isBusy}
                      onClick={() => handleRestore('heroes', hero.id)}
                    >
                      <RotateCcw size={15} /> Restore
                    </button>
                    <button
                      className="btn-danger"
                      disabled={isBusy}
                      onClick={() => handlePermanentDelete('heroes', hero.id, hero.name)}
                      title="Hapus Permanen"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {!loading && showItems && (
        <section className="trash-section">
          {filter === 'all' && (
            <h3 className="trash-title">Items ({filteredItems.length})</h3>
          )}
          <div className="trash-list">
            {filteredItems.map((item) => {
              const isBusy = busyId === `items-${item.id}`
              return (
                <div key={item.id} className="trash-item">
                  <div className="trash-left">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="trash-thumb item-thumb"
                    />
                    <div className="trash-info">
                      <h4>{item.name}</h4>
                      <p className="muted">
                        {item.category} • {item.price} Gold
                      </p>
                    </div>
                  </div>
                  <div className="action-group">
                    <button
                      className="btn-restore"
                      disabled={isBusy}
                      onClick={() => handleRestore('items', item.id)}
                    >
                      <RotateCcw size={15} /> Restore
                    </button>
                    <button
                      className="btn-danger"
                      disabled={isBusy}
                      onClick={() => handlePermanentDelete('items', item.id, item.name)}
                      title="Hapus Permanen"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
