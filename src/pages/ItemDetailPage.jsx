import { ArrowLeft, Coins, Zap, Info } from 'lucide-react'

export default function ItemDetailPage({ item, onBack }) {
  return (
    <div className="page">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={18} /> Kembali ke Daftar Item
      </button>

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
