import { applyAutoSlug } from '../../../core/fields/slug.js'
import { previewUpload } from '../../../core/fields/pageHero.js'

export const MENU_CATEGORIES = ['Starter', 'Main', 'Drink', 'Dessert', 'Breakfast']

export const MENU_DIETARY = [
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Gluten-free', value: 'gluten-free' },
  { label: 'Spicy', value: 'spicy' },
  { label: 'Contains nuts', value: 'contains-nuts' },
  { label: 'Halal', value: 'halal' },
]

export const MenuItems = {
  slug: 'menu-items',
  labels: {
    singular: 'Menu item',
    plural: 'Menu items',
  },
  access: {
    read: () => true,
  },
  admin: {
    group: false,
    useAsTitle: 'name',
    defaultColumns: ['image', 'name', 'category', 'price', 'available'],
    description: 'Dishes and drinks on the Bar & Restaurant page. Guests can send an order on WhatsApp.',
  },
  hooks: {
    beforeValidate: [applyAutoSlug],
  },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { width: '25%' } },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      admin: { width: '25%', description: 'Shown on the public menu and in WhatsApp orders.' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'Main',
      admin: { width: '25%' },
      options: MENU_CATEGORIES.map((value) => ({ label: value, value })),
    },
    {
      name: 'sort',
      type: 'number',
      defaultValue: 0,
      admin: { width: '25%', description: 'Lower numbers appear first within a category.' },
    },
    {
      name: 'available',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show on the restaurant page',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { hidden: true, readOnly: true },
    },
    {
      name: 'description',
      type: 'richText',
      admin: { description: 'Short card copy guests see on the menu.' },
    },
    {
      name: 'ingredients',
      type: 'textarea',
      admin: { description: 'One ingredient per line. Shown when a guest opens Details.' },
    },
    { name: 'allergens', type: 'text', admin: { width: '50%', description: 'e.g. peanuts, shellfish, dairy' } },
    { name: 'portion', type: 'text', admin: { width: '50%', description: 'e.g. Serves 2, 330 ml' } },
    {
      name: 'dietary',
      type: 'select',
      hasMany: true,
      options: MENU_DIETARY,
      admin: { description: 'Badges on the card and in Details.' },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: { description: 'Serving notes or chef recommendations shown in Details.' },
    },
    previewUpload('image', { admin: { width: '25%' } }),
  ],
}
