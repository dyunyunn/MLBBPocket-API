import { useState } from 'react'
import { ArrowLeft, Coins, Zap, Edit3, Trash2 } from 'lucide-react'
import apiClient from '../config/api'

export default function ItemDetailPage({ item, onBack, onEdit, onDeleted }) {
  const [deleting, setDeleting] = useState(false)

  const handleSoftDelete = async () => {
    const ok = window.confirm(`Pindahkan "${item.name}" ke Trash?`)
    if (!ok) return

    setDeleting(true)
    try {
      await apiClient.put(`/items/${item.id}`, { is_deleted: true })
      onDeleted()
    } catch {
      alert('Gagal memindahkan item ke Trash.')
      setDeleting(false)
    }
  }

  return (
    <div className="page">
      <div className="detail-top-bar">
        <button type="button" className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> Kembali
        </button>
        <div className="action-group">
          <button type="button" className="btn-edit" onClick={() => onEdit(item)}>
            <Edit3 size={16} /> Edit
          </button>
          <button
            type="button"
            className="btn-danger"
            disabled={deleting}
            onClick={handleSoftDelete}
          >
            <Trash2 size={16} /> {deleting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>

      <div className="detail-card">
        <img src={item.image_url} alt={item.name} className="detail-banner" />
        <div className="detail-content">
          <div className="detail-badges">
            <span className="badge">{item.category}</span>
            <span className="badge secondary">
              <Coins size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {item.price} Gold
            </span>
          </div>
          <h2>{item.name}</h2>
          {item.stats && <p className="muted">{item.stats}</p>}

          {item.passive_effect && (
            <div className="detail-section">
              <h4>
                <Zap size={16} /> Efek Pasif Unik
              </h4>
              <p>{item.passive_effect}</p>
            </div>
          )}

          {item.description && (
            <div className="detail-section">
              <h4>Deskripsi</h4>
              <p>{item.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
