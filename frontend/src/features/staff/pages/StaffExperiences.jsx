import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { asHtml, htmlToLexical } from '@lib/richText'
import { mediaUrl } from '@features/hotel/adapters'
import { staffClient, mediaId } from '../api/staffClient'
import { slugify } from '../lib/slugify'
import MediaField from '../components/MediaField'
import StaffModal from '../components/StaffModal'
import SummernoteField from '../components/SummernoteField'
import '../staff.css'

const empty = { name: '', slug: '', price: '', description: '', image: '' }

export default function StaffExperiences() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(null)

  async function load() {
    const { data } = await staffClient.get('/api/experiences?limit=100&depth=1')
    setRows(data.docs || [])
  }

  useEffect(() => {
    load().catch(() => toast.error('Could not load activities.'))
  }, [])

  function openEdit(row) {
    setForm({
      id: row.id,
      name: row.name || '',
      slug: row.slug || '',
      price: row.price || '',
      description: asHtml(row.description),
      image: row.image || '',
    })
  }

  async function save(event) {
    event.preventDefault()
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      price: Number(form.price),
      description: htmlToLexical(form.description),
      image: mediaId(form.image) || undefined,
    }
    try {
      if (form.id) await staffClient.patch(`/api/experiences/${form.id}`, payload)
      else await staffClient.post('/api/experiences', payload)
      toast.success('Activity saved.')
      setForm(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message || 'Could not save.')
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this activity?')) return
    try {
      await staffClient.delete(`/api/experiences/${id}`)
      toast.success('Deleted.')
      load()
    } catch {
      toast.error('Could not delete.')
    }
  }

  return (
    <div className="staffPage">
      <h1>Things to do</h1>
      <p className="staffLead">Add activities in a modal. The URL is created from the name.</p>
      <div className="staffToolbar">
        <button type="button" className="staffBtn" onClick={() => setForm({ ...empty })}>
          Add activity
        </button>
      </div>
      <div className="staffCard">
        <table className="staffTable">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  {mediaUrl(row.image) ? (
                    <img src={mediaUrl(row.image)} alt="" className="staffThumb" />
                  ) : (
                    <span className="staffThumbEmpty" />
                  )}
                </td>
                <td>{row.name}</td>
                <td>${row.price}</td>
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
        <StaffModal title={form.id ? 'Edit activity' : 'Add activity'} wide onClose={() => setForm(null)}>
          <form onSubmit={save} className="formGrid">
            <label className="staffField col-3">
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="staffField col-3">
              Price
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </label>
            <SummernoteField
              key={form.id || 'new-activity'}
              className="col-8"
              label="Description"
              value={form.description}
              onChange={(description) => setForm((current) => ({ ...current, description }))}
            />
            <div className="mediaSlot">
              <MediaField label="Photo" value={form.image} onChange={(image) => setForm({ ...form, image })} />
            </div>
            <div className="formActions full">
              <button type="button" className="staffBtn staffBtnGhost" onClick={() => setForm(null)}>
                Cancel
              </button>
              <button type="submit" className="staffBtn">
                Save
              </button>
            </div>
          </form>
        </StaffModal>
      )}
    </div>
  )
}
