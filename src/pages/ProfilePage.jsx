import { useState, useEffect, useRef } from 'react'
import { User, Code, GraduationCap, Camera } from 'lucide-react'
import { compressImageToBase64 } from '../utils/imageHelper'

const AVATAR_STORAGE_KEY = 'mlbbpocket_profile_avatar'

export default function ProfilePage() {
  const [avatar, setAvatar] = useState(() => {
    try {
      return localStorage.getItem(AVATAR_STORAGE_KEY) || ''
    } catch {
      return ''
    }
  })
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    try {
      if (avatar) {
        localStorage.setItem(AVATAR_STORAGE_KEY, avatar)
      } else {
        localStorage.removeItem(AVATAR_STORAGE_KEY)
      }
    } catch {
      setError('Gagal menyimpan foto profil ke penyimpanan lokal.')
    }
  }, [avatar])

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    try {
      const compressed = await compressImageToBase64(file)
      setAvatar(compressed)
    } catch {
      setError('Gagal memproses gambar. Coba pilih file lain.')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Profile & About</h1>
        <p>Informasi Pengembang Aplikasi</p>
      </header>

      <div className="profile-card">
        <div className="avatar-wrapper">
          <div className="avatar">
            {avatar ? (
              <img src={avatar} alt="Foto Profil" className="avatar-img" />
            ) : (
              <User size={40} />
            )}
          </div>
          <button
            type="button"
            className="avatar-badge"
            onClick={() => fileInputRef.current?.click()}
            title="Ganti foto profil"
            aria-label="Ganti foto profil"
          >
            <Camera size={15} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            hidden
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <h2>Proplayer asli ini mah</h2>
        <p className="muted">NIM: -</p>

        <div className="profile-info">
          <div className="info-row">
            <GraduationCap size={18} />
            <span>Teknik Komputer, Universitas Diponegoro</span>
          </div>
          <div className="info-row">
            <Code size={18} />
            <span>Tugas Akhir Praktikum PPB 2026 (PWA)</span>
          </div>
        </div>

        <section className="about-box">
          <h4>Tentang MLBBPocket</h4>
          <p>
            MLBBPocket adalah Progressive Web App (PWA) katalog hero dan rekomendasi
            build item Mobile Legends yang terintegrasi dengan RESTful API buatan
            sendiri menggunakan Node.js, Express.js, dan Supabase.
          </p>
        </section>
      </div>
    </div>
  )
}
