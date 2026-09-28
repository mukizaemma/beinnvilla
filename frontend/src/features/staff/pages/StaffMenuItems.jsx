import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { asHtml, htmlToLexical } from '@lib/richText'
import { mediaUrl } from '@features/hotel/adapters'
import { MENU_CATEGORIES, MENU_DIETARY, formatMoney } from '@features/hotel/menu'
import { staffClient, mediaId } from '../api/staffClient'
import { slugify } from '../lib/slugify'
import MediaField from '../components/MediaField'
import StaffModal from '../components/StaffModal'
import SummernoteField from '../components/SummernoteField'
import '../staff.css'

const empty = {
  name: '',
  slug: '',
  price: '',
  category: 'Main',
  sort: 0,
  available: true,
  description: '',
  ingredients: '',
  allergens: '',
  portion: '',
  notes: '',
  dietary: [],
  image: '',
}

export default function StaffMenuItems() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(null)

  async function load() {
    const { data } = await staffClient.get('/api/menu-items?limit=200&sort=sort&depth=1')
    setRows(data.docs || [])
  }

  useEffect(() => {
    load().catch(() => toast.error('Could not load menu items.'))
  }, [])

  function openEdit(row) {
    setForm({
      id: row.id,
      name: row.name || '',
      slug: row.slug || '',
      price: row.price ?? '',
      category: row.category || 'Main',
      sort: row.sort ?? 0,
      available: row.available !== false,
      description: asHtml(row.description),
      ingredients: row.ingredients || '',
      allergens: row.allergens || '',
      portion: row.portion || '',
      notes: row.notes || '',
      dietary: row.dietary || [],
      image: row.image || '',
    })
  }

  function toggleDietary(value) {
    setForm((current) => {
      const next = current.dietary.includes(value)
        ? current.dietary.filter((item) => item !== value)
        : [...current.dietary, value]
      return { ...current, dietary: next }
    })
  }

  async function save(event) {
    event.preventDefault()
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      price: Number(form.price),
      category: form.category,
      sort: Number(form.sort) || 0,
      available: Boolean(form.available),
      description: htmlToLexical(form.description),
      ingredients: form.ingredients,
      allergens: form.allergens,
      portion: form.portion,
      notes: form.notes,
      dietary: form.dietary,
      image: mediaId(form.image) || undefined,
    }
    try {
      if (form.id) await staffClient.patch(`/api/menu-items/${form.id}`, payload)
      else await staffClient.post('/api/menu-items', payload)
      toast.success('Menu item saved.')
      setForm(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message || 'Could not save.')
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this menu item?')) return
    try {
      await staffClient.delete(`/api/menu-items/${id}`)
      toast.success('Deleted.')
      load()
    } catch {
      toast.error('Could not delete.')
    }
  }

  return (
    <div className="staffPage">
      <h1>Menu items</h1>
      <p className="staffLead">
        Dishes and drinks shown on the public restaurant page. Guests can add items and send the order
        on WhatsApp.
      </p>
      <div className="staffToolbar">
        <button type="button" className="staffBtn" onClick={() => setForm({ ...empty, dietary: [] })}>
          Add menu item
        </button>
      </div>
      <div className="staffCard">
        <table className="staffTable">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>On menu</th>
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
                <td>{row.category}</td>
                <td>{formatMoney(row.price)}</td>
                <td>{row.available === false ? 'Hidden' : 'Yes'}</td>
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
            {rows.length === 0 && (
              <tr>
                <td colSpan={6}>No menu items yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {form && (
        <StaffModal title={form.id ? 'Edit menu item' : 'Add menu item'} wide onClose={() => setForm(null)}>
          <form onSubmit={save} className="formGrid">
            <label className="staffField col-3">
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="staffField col-3">
              Price
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </label>
            <label className="staffField col-3">
              Category
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {MENU_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="staffField col-3">
              Sort
              <input
                type="number"
                value={form.sort}
                onChange={(e) => setForm({ ...form, sort: e.target.value })}
              />
            </label>
            <label className="staffCheck full">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
              />
              Show on the restaurant page
            </label>
            <SummernoteField
              key={form.id || 'new-menu-item'}
              className="col-8"
              label="Description"
              value={form.description}
              onChange={(description) => setForm((current) => ({ ...current, description }))}
            />
            <div className="mediaSlot">
              <MediaField label="Photo" value={form.image} onChange={(image) => setForm({ ...form, image })} />
            </div>
            <label className="staffField full">
              Ingredients
              <textarea
                rows={4}
                value={form.ingredients}
                onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                placeholder="One ingredient per line"
              />
            </label>
            <label className="staffField col-3">
              Allergens
              <input
                value={form.allergens}
                onChange={(e) => setForm({ ...form, allergens: e.target.value })}
                placeholder="peanuts, dairy"
              />
            </label>
            <label className="staffField col-3">
              Portion
              <input
                value={form.portion}
                onChange={(e) => setForm({ ...form, portion: e.target.value })}
                placeholder="Serves 2"
              />
            </label>
            <label className="staffField full">
              Serving notes
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Best shared, ask for extra sauce…"
              />
            </label>
            <fieldset className="staffField full">
              <legend>Dietary tags</legend>
              <div className="staffCheckRow">
                {MENU_DIETARY.map((item) => (
                  <label key={item.value} className="staffCheck">
                    <input
                      type="checkbox"
                      checked={form.dietary.includes(item.value)}
                      onChange={() => toggleDietary(item.value)}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </fieldset>
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
