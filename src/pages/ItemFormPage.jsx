import { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import apiClient from '../config/api'
import { compressImageToBase64 } from '../utils/imageHelper'

export default function ItemFormPage({ initialData, onBack, onSaved }) {
  const isEdit = Boolean(initialData)
  const [form, setForm] = useState({
    name: initialData?.name || '',
    category: initialData?.category || 'Attack',
    price: initialData?.price || '',
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
    setError('')
    try {
      const base64 = await compressImageToBase64(file)
      setForm((prev) => ({ ...prev, image_url: base64 }))
    } catch {
      setError('Gagal memproses gambar. Coba file lain.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Nama item wajib diisi.')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      ...form,
      price: Number(form.price) || 0,
      image_url:
        form.image_url.trim() ||
        `https://placehold.co/400x500/1e293b/fbbf24?text=${encodeURIComponent(form.name.trim())}`,
      is_deleted: false,
    }

    try {
      let res
      if (isEdit) {
        res = await apiClient.put(`/items/${initialData.id}`, payload)
      } else {
        res = await apiClient.post('/items', payload)
      }
      const savedData = Array.isArray(res.data) ? res.data[0] : res.data
      onSaved(savedData || { ...initialData, ...payload })
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

          <form className="crud-form" onSubmit={handleSubmit}>
            <label>
              Nama Item *
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Contoh: Blade of Despair"
                required
              />
            </label>

            <div className="form-row">
              <label>
                Kategori *
                <select name="category" value={form.category} onChange={handleChange}>
                  <option value="Attack">Attack</option>
                  <option value="Magic">Magic</option>
                  <option value="Defense">Defense</option>
                  <option value="Movement">Movement</option>
                  <option value="Jungling">Jungling</option>
                  <option value="Roaming">Roaming</option>
                </select>
              </label>

              <label>
                Harga (Gold) *
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Contoh: 3010"
                  required
                />
              </label>
            </div>

            <label>
              Atribut / Statistik
              <input
                name="stats"
                value={form.stats}
                onChange={handleChange}
                placeholder="Contoh: +160 Physical Attack, +5% Movement Speed"
              />
            </label>

            <label>
              Efek Pasif Unik
              <textarea
                name="passive_effect"
                rows="3"
                value={form.passive_effect}
                onChange={handleChange}
                placeholder="Jelaskan efek pasif unik item..."
              />
            </label>

            <label>
              Deskripsi
              <textarea
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
                placeholder="Deskripsi singkat kegunaan item..."
              />
            </label>

            <label>
              Pilih Gambar dari Direktori (HP / Laptop)
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </label>

            {form.image_url && (
              <img src={form.image_url} alt="Preview" className="img-preview" />
            )}

            <button type="submit" className="btn-primary" disabled={saving}>
              <Save size={18} />{' '}
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Item'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
