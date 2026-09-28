import { normalizeSocials, SOCIAL_PLATFORMS } from './socials.js'
import { previewUpload } from '../fields/pageHero.js'
import { isAdmin } from '../users/access.js'

export const Company = {
  slug: 'company',
  label: 'Site setting',
  admin: {
    group: false,
    description: 'Property name, contacts, SEO, and map.',
  },
  access: {
    read: () => true,
    update: ({ req }) => isAdmin(req.user),
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data) return data
        data.socials = normalizeSocials(data.socials)
        return data
      },
    ],
    afterRead: [
      ({ doc }) => {
        if (!doc) return doc
        doc.socials = normalizeSocials(doc.socials)
        return doc
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Company',
          fields: [
            { name: 'name', type: 'text', label: 'Property name', required: true, admin: { width: '25%' } },
            { name: 'tagline', type: 'text', admin: { width: '50%' } },
            { name: 'distanceFromKigali', type: 'text', admin: { width: '25%' } },
            previewUpload('logo', {
              admin: { width: '25%', description: 'Shown in the header and footer.' },
            }),
            previewUpload('icon', {
              admin: { width: '25%', description: 'Browser tab icon. Square or round works best.' },
            }),
            {
              name: 'roomCount',
              type: 'number',
              defaultValue: 20,
              min: 1,
              admin: {
                width: '25%',
                description: 'Rooms in the house. A booking uses as many as the guest count needs.',
              },
            },
            {
              name: 'guestsPerRoom',
              type: 'number',
              defaultValue: 2,
              min: 1,
              admin: {
                width: '25%',
                description: 'Each room holds a couple or a single guest. Capacity is rooms × this number.',
              },
            },
          ],
        },
        {
          label: 'Contacts',
          fields: [
            { name: 'phone', type: 'text', admin: { width: '25%' } },
            {
              name: 'whatsapp',
              type: 'text',
              admin: { width: '25%', description: 'WhatsApp number with country code, e.g. 2507…' },
            },
            { name: 'email', type: 'text', admin: { width: '25%' } },
            {
              name: 'phoneSecondary',
              type: 'text',
              admin: { width: '25%', description: 'Optional second line' },
            },
          ],
        },
        {
          label: 'Social media',
          fields: [
            {
              name: 'socials',
              type: 'group',
              admin: {
                description:
                  'Paste a profile URL for each network. Leave a field blank to hide that icon on the website.',
              },
              fields: SOCIAL_PLATFORMS.map(({ name, label }) => ({
                name,
                type: 'text',
                label,
                admin: {
                  width: '25%',
                  description: 'Shown on the site only if this is a valid http(s) link.',
                },
              })),
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seoTitle',
              type: 'text',
              admin: {
                width: '25%',
                description: 'Browser tab title for the homepage. Other pages append the company name.',
              },
            },
            {
              name: 'seoKeywords',
              type: 'text',
              admin: { width: '25%', description: 'Comma-separated keywords, e.g. Karongi apartment, Lake Kivu stay' },
            },
            {
              name: 'seoDescription',
              type: 'textarea',
              admin: { width: '50%', description: 'Meta description for search engines and social previews.' },
            },
          ],
        },
        {
          label: 'Address & map',
          fields: [
            { name: 'address', type: 'textarea', admin: { width: '50%' } },
            {
              name: 'mapUrl',
              type: 'text',
              admin: { width: '50%', description: 'Google Maps link for “Get directions” on Home and Contact.' },
            },
            {
              name: 'mapEmbed',
              type: 'textarea',
              admin: {
                width: '50%',
                description:
                  'This is the map on the Home location section (and Contact). Google Maps → Share → Embed a map, then paste the iframe here.',
              },
            },
          ],
        },
        {
          label: 'Admin accounts',
          fields: [
            {
              name: 'adminAccountsNote',
              type: 'ui',
              admin: {
                components: {
                  Field: './src/components/payload/AdminAccountsNote/index.jsx#AdminAccountsNote',
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
