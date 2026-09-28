import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { staffClient, mediaId } from '../api/staffClient'
import { useStaffAuth } from '../auth/StaffAuthContext'
import MediaField from '../components/MediaField'
import { SOCIAL_PLATFORMS, emptySocials, normalizeSocials } from '@features/hotel/socials'
import '../staff.css'

const empty = {
  name: '',
  tagline: '',
  logo: '',
  icon: '',
  phone: '',
  whatsapp: '',
  email: '',
  phoneSecondary: '',
  roomCount: 20,
  guestsPerRoom: 2,
  address: '',
  distanceFromKigali: '',
  mapUrl: '',
  mapEmbed: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  socials: emptySocials(),
}

export default function StaffSettings() {
  const { user } = useStaffAuth()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(empty)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    staffClient
      .get('/api/globals/company?depth=1')
      .then((res) =>
        setForm({
          ...empty,
          ...res.data,
          socials: normalizeSocials(res.data.socials),
        }),
      )
      .catch(() => toast.error('Could not load site settings.'))
      .finally(() => setLoaded(true))
  }, [])

  async function save(event) {
    event.preventDefault()
    try {
      await staffClient.post('/api/globals/company', {
        ...form,
        logo: mediaId(form.logo) || undefined,
        icon: mediaId(form.icon) || undefined,
        socials: normalizeSocials(form.socials),
      })
      toast.success('Site settings saved.')
      queryClient.invalidateQueries({ queryKey: ['site-layout'] })
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message || 'Could not save settings.')
    }
  }

  if (user && user.role !== 'admin' && user.role !== 'superadmin') {
    return (
      <div className="staffPage">
        <h1>Site settings</h1>
        <p className="staffLead">Only an admin can change site settings.</p>
      </div>
    )
  }

  if (!loaded) return <p>Loading…</p>

  return (
    <div className="staffPage">
      <h1>Site settings</h1>
      <form onSubmit={save} className="staffCard" style={{ padding: '1.1rem' }}>
        <div className="formGrid">
          <label className="staffField col-3">
            Property name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="staffField col-6">
            Tagline
            <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
          </label>
          <label className="staffField col-3">
            Location note
            <input value={form.distanceFromKigali} onChange={(e) => setForm({ ...form, distanceFromKigali: e.target.value })} />
          </label>
          <label className="staffField col-3">
            Phone
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label className="staffField col-3">
            WhatsApp
            <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          </label>
          <label className="staffField col-3">
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="staffField col-3">
            Rooms in the house
            <input
              type="number"
              min="1"
              value={form.roomCount ?? 20}
              onChange={(e) => setForm({ ...form, roomCount: Number(e.target.value) })}
            />
          </label>
          <label className="staffField col-3">
            Guests per room
            <input
              type="number"
              min="1"
              value={form.guestsPerRoom ?? 2}
              onChange={(e) => setForm({ ...form, guestsPerRoom: Number(e.target.value) })}
            />
          </label>
          <label className="staffField col-3">
            Second phone
            <input value={form.phoneSecondary} onChange={(e) => setForm({ ...form, phoneSecondary: e.target.value })} />
          </label>
          <label className="staffField col-6">
            Address
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
          <label className="staffField col-6">
            Map URL
            <input
              value={form.mapUrl}
              onChange={(e) => setForm({ ...form, mapUrl: e.target.value })}
              placeholder="Used by Get directions on Home"
            />
          </label>
          <label className="staffField col-6">
            Map embed — shown on the Home location section
            <textarea
              value={form.mapEmbed}
              onChange={(e) => setForm({ ...form, mapEmbed: e.target.value })}
              placeholder="Google Maps → Share → Embed a map → paste the iframe"
            />
          </label>
          <label className="staffField col-3">
            SEO title
            <input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
          </label>
          <label className="staffField col-3">
            SEO keywords
            <input value={form.seoKeywords} onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })} />
          </label>
          <label className="staffField col-6">
            SEO description
            <textarea value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
          </label>
          <div className="mediaSlot">
            <MediaField label="Logo" value={form.logo} onChange={(logo) => setForm({ ...form, logo })} />
          </div>
          <div className="mediaSlot">
            <MediaField label="Icon" value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
          </div>
          <div className="full">
            <strong>Social profiles</strong>
            <p className="staffLead" style={{ margin: '0.35rem 0 0.6rem' }}>
              Paste a URL for each network. Blank or invalid links stay off the public site.
            </p>
            <div className="formGrid">
              {SOCIAL_PLATFORMS.map(({ name, label }) => (
                <label key={name} className="staffField col-3">
                  {label}
                  <input
                    placeholder="https://"
                    value={form.socials?.[name] || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        socials: { ...emptySocials(), ...form.socials, [name]: e.target.value },
                      })
                    }
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="formActions">
          <button type="submit" className="staffBtn">
            Save settings
          </button>
        </div>
      </form>
    </div>
  )
}
