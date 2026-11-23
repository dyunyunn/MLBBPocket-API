import { useState } from 'react'
import { ArrowLeft, Save, Loader } from 'lucide-react'
import apiClient from '../config/api'
import { compressImageToBase64 } from '../utils/imageHelper'

export default function ItemFormPage({ initialData, onBack, onSaved }) {
  const isEdit = Boolean(initialData)
  const [form, setForm] = useState({
    name: initialData?.name || '',
    category: initialData?.category || 'Attack',
    price: initialData?.price ?? 2000,
    stats: initialData?.stats || '',
    passive_effect: initialData?.passive_effect || '',
    description: initialData?.description || '',
    image_url: initialData?.image_url || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const base64 = await compressImageToBase64(file)
      setForm((prev) => ({ ...prev, image_url: base64 }))
    } catch {
      setError('Gagal memproses gambar. Coba file lain.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      price: Number(form.price) || 0,
      image_url:
        form.image_url.trim() ||
        `https://placehold.co/400x400/7f1d1d/fca5a5?text=${encodeURIComponent(form.name)}`,
    }

    try {
      const res = isEdit
        ? await apiClient.put(`/items/${initialData.id}`, payload)
        : await apiClient.post('/items', payload)
      onSaved(res.data)
    } catch (err) {
      setError('Gagal menyimpan data item. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={18} /> Kembali
      </button>

      <div className="detail-card">
        <div className="detail-content">
          <h2>{isEdit ? `Edit Item: ${initialData.name}` : 'Tambah Item Baru'}</h2>
          {error && <p className="error-text">{error}</p>}

          <form onSubmit={handleSubmit} className="crud-form">
            <label>
              Nama Item *
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Contoh: Immortality" />
            </label>

            <div className="form-row">
              <label>
                Kategori *
                <select name="category" value={form.category} onChange={handleChange}>
                  <option value="Attack">Attack</option>
                  <option value="Magic">Magic</option>
                  <option value="Defense">Defense</option>
                  <option value="Movement">Movement</option>
                </select>
              </label>

              <label>
                Harga (Gold) *
                <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" />
              </label>
            </div>

            <label>
              Atribut / Statistik
              <input name="stats" value={form.stats} onChange={handleChange} placeholder="Contoh: +800 HP, +20 Physical Defense" />
            </label>

            <label>
              Efek Pasif Unik
              <textarea name="passive_effect" rows="3" value={form.passive_effect} onChange={handleChange} placeholder="Penjelasan efek pasif item..." />
            </label>

            <label>
              Deskripsi
              <textarea name="description" rows="2" value={form.description} onChange={handleChange} placeholder="Kegunaan singkat item..." />
            </label>

            <label>
              opsional
              <input name="image_url" value={form.image_url} onChange={handleChange} placeholder="Kosongkan untuk gambar otomatis" />
            </label>

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader size={16} className="spin" /> : <Save size={16} />}
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Item'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
