import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { asHtml, htmlToLexical } from '@lib/richText'
import { mediaUrl, publicExcerpt } from '@features/hotel/adapters'
import { staffClient, mediaId } from '../api/staffClient'
import { slugify } from '../lib/slugify'
import MediaGalleryField from '../components/MediaGalleryField'
import StaffModal from '../components/StaffModal'
import SummernoteField from '../components/SummernoteField'
import '../staff.css'

const empty = {
  name: '',
  slug: '',
  audience: 'visitors',
  available: true,
  summary: '',
  description: '',
  sort: 0,
  gallery: [],
}

export default function StaffFacilities() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(null)
  const [photosPending, setPhotosPending] = useState(false)

  async function load() {
    const { data } = await staffClient.get('/api/facilities?limit=100&sort=sort&depth=1')
    setRows(data.docs || [])
  }

  useEffect(() => {
    load().catch(() => toast.error('Could not load facilities.'))
  }, [])

  async function save(event) {
    event.preventDefault()
    const gallery = (form.gallery || []).map((item) => mediaId(item)).filter(Boolean)
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      audience: form.audience,
      available: Boolean(form.available),
      summary: publicExcerpt(form.description),
      sort: Number(form.sort) || 0,
      description: htmlToLexical(form.description),
      image: gallery[0] || undefined,
      gallery: gallery.map((photo) => ({ photo })),
    }
    try {
      if (form.id) await staffClient.patch(`/api/facilities/${form.id}`, payload)
      else await staffClient.post('/api/facilities', payload)
      toast.success('Facility saved.')
      setForm(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message || 'Could not save.')
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this facility?')) return
    try {
      await staffClient.delete(`/api/facilities/${id}`)
      load()
    } catch {
      toast.error('Could not delete.')
    }
  }

  return (
    <div className="staffPage">
      <h1>Facilities</h1>
      <p className="staffLead">
        Jacuzzi and meetings are held with a stay until checkout. Sauna, bar, and restaurant can also be open to friends and visitors.
      </p>
      <div className="staffToolbar">
        <button type="button" className="staffBtn" onClick={() => { setPhotosPending(false); setForm({ ...empty }) }}>
          Add facility
        </button>
      </div>
      <div className="staffCard">
        <table className="staffTable">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Who can use it</th>
              <th>Open</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{mediaUrl(row.image) ? <img src={mediaUrl(row.image)} alt="" width="56" height="40" /> : null}</td>
                <td>{row.name}</td>
                <td>{row.audience === 'exclusive' ? 'Held with a stay' : 'Visitors welcome'}</td>
                <td>{row.available === false ? 'No' : 'Yes'}</td>
                <td>
                  <div className="rowActions">
                    <button
                      type="button"
                      className="staffBtn staffBtnGhost"
                      onClick={() => {
                        setPhotosPending(false)
                        setForm({
                          ...row,
                          description: asHtml(row.description),
                          gallery: (row.gallery || []).map((item) => item.photo).filter(Boolean),
                        })
                      }}
                    >
                      Edit
                    </button>
                    <button type="button" className="staffBtn staffBtnDanger" onClick={() => remove(row.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5}>No facilities yet. The public site shows Jacuzzi, meetings, sauna, and the bar until you add your own.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {form && (
        <StaffModal title={form.id ? 'Edit facility' : 'Add facility'} wide onClose={() => setForm(null)}>
          <form onSubmit={save} className="formGrid">
            <label className="staffField col-6">
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="staffField col-3">
              Who can use it
              <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                <option value="exclusive">Held with a stay</option>
                <option value="visitors">Also open to visitors</option>
              </select>
            </label>
            <label className="staffField col-3">
              Sort
              <input type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: e.target.value })} />
            </label>
            <label className="staffCheck col-6">
              <input
                type="checkbox"
                checked={form.available !== false}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
              />
              Available to request
            </label>
            <div className="full">
              <SummernoteField
                key={form.id || 'new-facility'}
                label="Description"
                value={form.description}
                onChange={(description) => setForm((current) => ({ ...current, description }))}
              />
              <p className="staffLead">
                Write this once. The facilities list shows the first 160 characters. The facility page shows the full text.
              </p>
            </div>
            <MediaGalleryField
              label="Gallery"
              hint="The first photo is the cover. Add more photos and they appear in the gallery on this facility’s page."
              values={form.gallery}
              max={24}
              onPendingChange={setPhotosPending}
              onChange={(gallery) => setForm((current) => ({ ...current, gallery }))}
            />
            <div className="formActions full">
              <button type="button" className="staffBtn staffBtnGhost" onClick={() => setForm(null)}>
                Cancel
              </button>
              <button type="submit" className="staffBtn" disabled={photosPending}>
                {photosPending ? 'Wait for photos' : 'Save'}
              </button>
            </div>
          </form>
        </StaffModal>
      )}
    </div>
  )
}
