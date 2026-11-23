import { useState, useEffect } from 'react'
import { RotateCcw, Trash2, Loader } from 'lucide-react'
import apiClient from '../config/api'

export default function TrashPage() {
  const [deletedHeroes, setDeletedHeroes] = useState([])
  const [deletedItems, setDeletedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const fetchTrash = async () => {
    setLoading(true)
    try {
      const [hRes, iRes] = await Promise.all([
        apiClient.get('/heroes'),
        apiClient.get('/items'),
      ])
      setDeletedHeroes(hRes.data.filter((h) => h.is_deleted))
      setDeletedItems(iRes.data.filter((i) => i.is_deleted))
    } catch (err) {
      alert('Gagal memuat data sampah.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrash()
  }, [])

  const handleRestore = async (type, data) => {
    setBusyId(`${type}-${data.id}`)
    try {
      await apiClient.put(`/${type}/${data.id}`, { ...data, is_deleted: false })
      await fetchTrash()
    } catch (err) {
      alert('Gagal me-restore data.')
    } finally {
      setBusyId(null)
    }
  }

  const handlePermanentDelete = async (type, data) => {
    if (!window.confirm(`Hapus permanen "${data.name}"? Data tidak bisa dikembalikan.`)) return
    setBusyId(`${type}-${data.id}`)
    try {
      await apiClient.delete(`/${type}/${data.id}`)
      await fetchTrash()
    } catch (err) {
      alert('Gagal menghapus permanen.')
    } finally {
      setBusyId(null)
    }
  }

  const isEmpty = deletedHeroes.length === 0 && deletedItems.length === 0

  return (
    <div className="page">
      <header className="page-header">
        <h1>Trash / Sampah</h1>
        <p>Pulihkan data terhapus atau hapus permanen</p>
      </header>

      {loading && (
        <div className="center-state">
          <Loader className="spin" size={28} />
          <p>Memuat sampah...</p>
        </div>
      )}

      {!loading && isEmpty && (
        <div className="center-state">
          <p>Tempat sampah kosong.</p>
        </div>
      )}

      {!loading && deletedHeroes.length > 0 && (
        <section className="trash-section">
          <h3 className="trash-title">Heroes ({deletedHeroes.length})</h3>
          <div className="trash-list">
            {deletedHeroes.map((hero) => (
              <div key={hero.id} className="trash-item">
                <div>
                  <strong>{hero.name}</strong>
                  <p className="muted">{hero.role} • {hero.lane}</p>
                </div>
                <div className="action-group">
                  <button
                    className="btn-restore"
                    disabled={busyId === `heroes-${hero.id}`}
                    onClick={() => handleRestore('heroes', hero)}
                  >
                    <RotateCcw size={14} /> Restore
                  </button>
                  <button
                    className="btn-danger"
                    disabled={busyId === `heroes-${hero.id}`}
                    onClick={() => handlePermanentDelete('heroes', hero)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && deletedItems.length > 0 && (
        <section className="trash-section">
          <h3 className="trash-title">Items ({deletedItems.length})</h3>
          <div className="trash-list">
            {deletedItems.map((item) => (
              <div key={item.id} className="trash-item">
                <div>
                  <strong>{item.name}</strong>
                  <p className="muted">{item.category} • {item.price} Gold</p>
                </div>
                <div className="action-group">
                  <button
                    className="btn-restore"
                    disabled={busyId === `items-${item.id}`}
                    onClick={() => handleRestore('items', item)}
                  >
                    <RotateCcw size={14} /> Restore
                  </button>
                  <button
                    className="btn-danger"
                    disabled={busyId === `items-${item.id}`}
                    onClick={() => handlePermanentDelete('items', item)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}