import { useState } from 'react'
import { ArrowLeft, Coins, Zap, Info, Pencil, Trash2 } from 'lucide-react'
import apiClient from '../config/api'

export default function ItemDetailPage({ item, onBack, onEdit, onDeleted }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm(`Yakin ingin memindahkan item "${item.name}" ke Trash?`)) return
    setDeleting(true)
    try {
      await apiClient.put(`/items/${item.id}`, { ...item, is_deleted: true })
      onDeleted()
    } catch (err) {
      alert('Gagal menghapus item.')
      setDeleting(false)
    }
  }

  return (
    <div className="page">
      <div className="detail-top-bar">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> Kembali
        </button>
        <div className="action-group">
          <button className="btn-edit" onClick={() => onEdit(item)}>
            <Pencil size={15} /> Edit
          </button>
          <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
            <Trash2 size={15} /> {deleting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>

      <div className="detail-card">
        <img src={item.image_url} alt={item.name} className="detail-banner" />
        <div className="detail-content">
          <span className="badge">{item.category}</span>
          <h2>{item.name}</h2>
          <p className="price"><Coins size={16} /> {item.price} Gold</p>

          <section className="detail-section">
            <h4>Atribut / Statistik</h4>
            <p>{item.stats}</p>
          </section>

          <section className="detail-section">
            <h4><Zap size={16} /> Efek Pasif Unik</h4>
            <p>{item.passive_effect}</p>
          </section>

          <section className="detail-section">
            <h4><Info size={16} /> Deskripsi</h4>
            <p>{item.description}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
