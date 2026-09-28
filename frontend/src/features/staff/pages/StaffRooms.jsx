import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FEATURE_LIBRARY } from '@features/hotel/rooms/featureLibrary'
import { mediaUrl } from '@features/hotel/adapters'
import { asHtml, htmlToLexical, isBlankHtml } from '@lib/richText'
import { staffClient, mediaId } from '../api/staffClient'
import { slugify } from '../lib/slugify'
import MediaField from '../components/MediaField'
import MediaGalleryField from '../components/MediaGalleryField'
import StaffModal from '../components/StaffModal'
import SummernoteField from '../components/SummernoteField'
import '../staff.css'

function picture(field) {
  if (!field) return ''
  if (typeof field === 'string') {
    return field.startsWith('http') || field.startsWith('/') ? mediaUrl(field) : ''
  }
  return mediaUrl(field)
}

function CoverThumb({ row }) {
  const [failed, setFailed] = useState(false)
  const src = picture(row.image) || picture(row.gallery?.[0]?.photo)
  if (!src || failed) return <span className="staffThumbEmpty">No cover</span>
  return <img src={src} alt={`${row.name || 'Room'} cover`} className="staffThumb" onError={() => setFailed(true)} />
}

const empty = {
  name: '',
  slug: '',
  pricePerNight: 150,
  priceWithBreakfast: 200,
  monthlyRate: 2500,
  units: 1,
  description: '',
  specs: { size: '', bedrooms: 1, bed: '', occupancy: '', view: '', smoking: '', breakfast: '' },
  features: [],
  customFeatures: [],
  image: null,
  gallery: [],
}

const SPEC_FIELDS = [
  { key: 'size', label: 'Size', hint: '32 m²' },
  { key: 'bed', label: 'Bed type', hint: 'King, or two singles' },
  { key: 'occupancy', label: 'Group size', hint: 'One group / the villa' },
  { key: 'view', label: 'View', hint: 'Lake Kivu' },
  { key: 'smoking', label: 'Smoking', hint: 'No' },
  { key: 'breakfast', label: 'Breakfast', hint: '$150 without / $200 with' },
]

export default function StaffRooms() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(null)
  const [extraAmenity, setExtraAmenity] = useState('')
  const [galleryPending, setGalleryPending] = useState(false)

  async function load() {
    const { data } = await staffClient.get('/api/rooms?limit=100&depth=1')
    setRows(data.docs || [])
  }

  useEffect(() => {
    load().catch(() => toast.error('Could not load rooms.'))
  }, [])

  function openCreate() {
    setExtraAmenity('')
    setGalleryPending(false)
    setForm({ ...empty, specs: { ...empty.specs }, features: [], customFeatures: [] })
  }

  function addAmenity() {
    const label = extraAmenity.trim()
    if (!label) return
    const known = form.customFeatures.some((item) => item.toLowerCase() === label.toLowerCase())
    if (!known) setForm({ ...form, customFeatures: [...form.customFeatures, label] })
    setExtraAmenity('')
  }

  function openEdit(row) {
    setForm({
      id: row.id,
      name: row.name || '',
      slug: row.slug || '',
      pricePerNight: row.pricePerNight || '',
      priceWithBreakfast: row.priceWithBreakfast || '',
      monthlyRate: row.monthlyRate || '',
      units: row.units || 1,
      description: asHtml(row.description),
      specs: {
        ...empty.specs,
        ...row.specs,
        bedrooms: row.specs?.bedrooms == null || row.specs?.bedrooms === '' ? 1 : row.specs.bedrooms,
      },
      features: row.features || [],
      customFeatures: (row.customFeatures || []).map((item) => item.label).filter(Boolean),
      image: row.image || null,
      gallery: (row.gallery || []).map((item) => item.photo).filter(Boolean),
    })
    setExtraAmenity('')
  }

  async function save(event) {
    event.preventDefault()
    if (galleryPending) {
      toast.error('Wait until the gallery photos finish uploading.')
      return
    }
    if (isBlankHtml(form.description)) {
      toast.error('Add a short description of the apartment.')
      return
    }
    const gallery = (form.gallery || []).map((item) => mediaId(item)).filter(Boolean)
    const cover = mediaId(form.image)
    const bedrooms =
      form.specs.bedrooms === '' || form.specs.bedrooms == null || Number.isNaN(Number(form.specs.bedrooms))
        ? 1
        : Number(form.specs.bedrooms)
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      pricePerNight: Number(form.pricePerNight),
      priceWithBreakfast: form.priceWithBreakfast === '' ? undefined : Number(form.priceWithBreakfast),
      monthlyRate: form.monthlyRate === '' ? undefined : Number(form.monthlyRate),
      units: Math.max(1, Number(form.units) || 1),
      description: htmlToLexical(form.description),
      specs: { ...form.specs, bedrooms },
      features: form.features,
      customFeatures: form.customFeatures.map((label) => ({ label })),
      image: cover || gallery[0] || undefined,
      gallery: gallery.map((photo) => ({ photo })),
    }
    try {
      if (form.id) await staffClient.patch(`/api/rooms/${form.id}`, payload)
      else await staffClient.post('/api/rooms', payload)
      toast.success('Room saved.')
      setForm(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message || 'Could not save the apartment.')
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this room?')) return
    try {
      await staffClient.delete(`/api/rooms/${id}`)
      toast.success('Listing deleted.')
      load()
    } catch {
      toast.error('Could not delete this room.')
    }
  }

  return (
    <div className="staffPage">
      <h1>Rooms</h1>
      <p className="staffLead">
        Each room or apartment has its own cover photo, gallery, amenities, and bedroom count.
        Nightly rates: without breakfast, with breakfast, and a monthly rate.
      </p>
      <div className="staffToolbar">
        <button type="button" className="staffBtn" onClick={openCreate}>
          Add listing
        </button>
      </div>
      <div className="staffCard">
        <table className="staffTable">
          <thead>
            <tr>
              <th>Cover</th>
              <th>Name</th>
              <th>Price / night</th>
              <th>With breakfast</th>
              <th>Monthly</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <CoverThumb row={row} />
                </td>
                <td>{row.name}</td>
                <td>${row.pricePerNight}</td>
                <td>{row.priceWithBreakfast ? `$${row.priceWithBreakfast}` : '—'}</td>
                <td>{row.monthlyRate ? `$${row.monthlyRate}` : '—'}</td>
                <td>
                  <div className="rowActions">
                    <button type="button" className="staffBtn" onClick={() => openEdit(row)}>
                      Edit
                    </button>
                    <button type="button" className="staffBtn staffBtnDanger" onClick={() => remove(row.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <StaffModal title={form.id ? 'Edit room' : 'Add room'} wide onClose={() => setForm(null)}>
          <form onSubmit={save} className="formGrid">
            <label className="staffField col-3">
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="staffField col-3">
              Nightly (no breakfast)
              <input
                type="number"
                value={form.pricePerNight}
                onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
                required
              />
            </label>
            <label className="staffField col-3">
              Nightly with breakfast
              <input
                type="number"
                value={form.priceWithBreakfast}
                onChange={(e) => setForm({ ...form, priceWithBreakfast: e.target.value })}
              />
            </label>
            <label className="staffField col-3">
              Monthly rate
              <input
                type="number"
                value={form.monthlyRate}
                onChange={(e) => setForm({ ...form, monthlyRate: e.target.value })}
              />
            </label>
            <SummernoteField
              key={form.id || 'new-room'}
              className="col-8"
              label="Description"
              value={form.description}
              onChange={(description) => setForm((current) => ({ ...current, description }))}
            />
            <MediaField
              label="Cover image"
              value={form.image}
              onChange={(image) => setForm({ ...form, image })}
            />
            <MediaGalleryField
              label="Room gallery"
              hint="Choose several photos at once. Each one shows here as soon as it is chosen."
              values={form.gallery}
              onChange={(gallery) => setForm((current) => (current ? { ...current, gallery } : current))}
              onPendingChange={setGalleryPending}
              max={24}
            />
            <label className="staffField col-3">
              Bedrooms
              <input
                type="number"
                min="0"
                placeholder="1"
                value={form.specs.bedrooms}
                onChange={(e) => setForm({ ...form, specs: { ...form.specs, bedrooms: e.target.value } })}
              />
            </label>
            {SPEC_FIELDS.map(({ key, label, hint }) => (
              <label key={key} className="staffField col-3">
                {label}
                <input
                  placeholder={hint}
                  value={form.specs[key]}
                  onChange={(e) => setForm({ ...form, specs: { ...form.specs, [key]: e.target.value } })}
                />
              </label>
            ))}
            <div className="staffField col-8">
              Features
              <div className="featureGrid">
                {Object.entries(FEATURE_LIBRARY).map(([key, label]) => (
                  <label key={key}>
                    <input
                      type="checkbox"
                      checked={form.features.includes(key)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...form.features, key]
                          : form.features.filter((item) => item !== key)
                        setForm({ ...form, features: next })
                      }}
                    />{' '}
                    {label}
                  </label>
                ))}
              </div>
              <div className="featureExtras">
                {form.customFeatures.map((label) => (
                  <span key={label}>
                    {label}
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          customFeatures: form.customFeatures.filter((item) => item !== label),
                        })
                      }
                    >
                      Remove
                    </button>
                  </span>
                ))}
              </div>
              <div className="featureAdd">
                <input
                  value={extraAmenity}
                  placeholder="Add another amenity"
                  onChange={(e) => setExtraAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addAmenity()
                    }
                  }}
                />
                <button type="button" className="staffBtn" onClick={addAmenity}>
                  Add
                </button>
              </div>
            </div>
            <div className="formActions full">
              <button type="button" className="staffBtn staffBtnGhost" onClick={() => setForm(null)}>
                Cancel
              </button>
              <button type="submit" className="staffBtn" disabled={galleryPending}>
                {galleryPending ? 'Wait for photos' : 'Save'}
              </button>
            </div>
          </form>
        </StaffModal>
      )}
    </div>
  )
}
