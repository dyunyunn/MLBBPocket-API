import { useState, useEffect } from 'react'
import { User, Code, GraduationCap } from 'lucide-react'

const DEFAULT_PROFILE = {
  name: 'Yunita Dwi Ardilasari',
  subtitle: 'NIM: 21120124120001',
  bio: 'MLBBPocket adalah Progressive Web App (PWA) katalog hero dan rekomendasi build item Mobile Legends yang terintegrasi dengan RESTful API buatan sendiri menggunakan Node.js, Express.js, dan Supabase.',
  avatar_url: '',
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) return

      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/profiles?id=eq.1&select=*`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          }
        )
        if (res.ok) {
          const rows = await res.json()
          if (Array.isArray(rows) && rows.length > 0) {
            const row = rows[0]
            setProfile({
              name: row.name || DEFAULT_PROFILE.name,
              subtitle: row.subtitle || DEFAULT_PROFILE.subtitle,
              bio: row.bio || DEFAULT_PROFILE.bio,
              avatar_url: row.avatar_url || '',
            })
          }
        }
      } catch (err) {
        console.error('Gagal memuat profil dari Supabase:', err)
      }
    }

    fetchProfile()
  }, [])

  return (
    <div className="page">
      <header className="page-header">
        <h1>Profile & About</h1>
        <p>Informasi Pengembang Aplikasi</p>
      </header>

      <div className="profile-card">
        <div className="avatar-wrapper">
          <div className="avatar">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="avatar-img"
              />
            ) : (
              <User size={40} />
            )}
          </div>
        </div>

        <h2>{profile.name}</h2>
        <p className="muted">{profile.subtitle}</p>

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
          <p>{profile.bio}</p>
        </section>
      </div>
    </div>
  )
}