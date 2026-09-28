export function pageNavField() {
  return {
    name: 'pageNav',
    type: 'ui',
    label: false,
    admin: {
      components: {
        Field: './src/components/payload/PageSwitcher/index.jsx#PageSwitcher',
      },
    },
  }
}

export function withPageNav(global) {
  return {
    ...global,
    fields: [pageNavField(), ...(global.fields || [])],
  }
}
