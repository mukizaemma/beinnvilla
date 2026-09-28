function walkPlain(node) {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  const children = (node.children || []).map(walkPlain).join('')
  if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'listitem') {
    return children ? `${children}\n` : ''
  }
  return children
}

export function asPlain(value, fallback = '') {
  if (value == null || value === '') return fallback
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value.root) {
    return walkPlain(value.root).replace(/\n+$/, '').trim() || fallback
  }
  return fallback
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function formatInline(node) {
  if (!node) return ''
  if (typeof node.text === 'string') {
    let html = escapeHtml(node.text)
    if (node.bold) html = `<strong>${html}</strong>`
    if (node.italic) html = `<em>${html}</em>`
    if (node.underline) html = `<u>${html}</u>`
    return html
  }
  const inner = (node.children || []).map(formatInline).join('')
  if (node.type === 'link' && node.fields?.url) {
    const href = escapeHtml(node.fields.url)
    return `<a href="${href}" rel="noopener noreferrer">${inner}</a>`
  }
  return inner
}

function walkHtml(node) {
  if (!node) return ''
  const children = node.children || []
  if (node.type === 'text' || node.type === 'link') return formatInline(node)
  if (node.type === 'paragraph') return `<p>${children.map(walkHtml).join('')}</p>`
  if (node.type === 'heading') {
    const tag = ['h1', 'h2', 'h3', 'h4'].includes(node.tag) ? node.tag : 'h2'
    return `<${tag}>${children.map(walkHtml).join('')}</${tag}>`
  }
  if (node.type === 'list') {
    const tag = node.listType === 'number' ? 'ol' : 'ul'
    return `<${tag}>${children.map(walkHtml).join('')}</${tag}>`
  }
  if (node.type === 'listitem') return `<li>${children.map(walkHtml).join('')}</li>`
  if (node.type === 'linebreak') return '<br />'
  return children.map(walkHtml).join('')
}

export function asHtml(value) {
  if (!value) return ''
  if (typeof value === 'string') {
    if (/<[a-z][\s\S]*>/i.test(value)) return value
    return value
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => `<p>${escapeHtml(line)}</p>`)
      .join('')
  }
  if (typeof value === 'object' && value.root) {
    return walkHtml(value.root)
  }
  return ''
}

export function isBlankHtml(html) {
  return !String(html || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function textLeaf(text, marks = {}) {
  return { type: 'text', text, version: 1, ...marks }
}

function applyMark(nodes, mark) {
  return nodes.map((node) => {
    if (node.type === 'text') return { ...node, [mark]: true }
    if (node.children) return { ...node, children: applyMark(node.children, mark) }
    return node
  })
}

function inlineNodes(el) {
  const out = []
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent) out.push(textLeaf(node.textContent))
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const tag = node.nodeName.toLowerCase()
    if (tag === 'br') {
      out.push({ type: 'linebreak', version: 1 })
      return
    }
    const inner = inlineNodes(node)
    if (tag === 'strong' || tag === 'b') return void out.push(...applyMark(inner, 'bold'))
    if (tag === 'em' || tag === 'i') return void out.push(...applyMark(inner, 'italic'))
    if (tag === 'u') return void out.push(...applyMark(inner, 'underline'))
    if (tag === 'a') {
      out.push({
        type: 'link',
        version: 1,
        fields: { url: node.getAttribute('href') || '', newTab: false, linkType: 'custom' },
        children: inner.length ? inner : [textLeaf(node.textContent || '')],
        direction: 'ltr',
        format: '',
        indent: 0,
      })
      return
    }
    out.push(...inner)
  })
  return out
}

function paragraphFrom(el) {
  const children = inlineNodes(el)
  return {
    type: 'paragraph',
    children: children.length ? children : [textLeaf('')],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

export function htmlToLexical(html) {
  if (isBlankHtml(html) || typeof document === 'undefined') {
    return {
      root: {
        type: 'root',
        children: [paragraphFrom({ childNodes: [] })],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    }
  }

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const children = []
  const blocks = [...doc.body.children]

  if (!blocks.length) {
    children.push(paragraphFrom(doc.body))
  } else {
    blocks.forEach((el) => {
      const tag = el.nodeName.toLowerCase()
      if (tag === 'ul' || tag === 'ol') {
        children.push({
          type: 'list',
          listType: tag === 'ol' ? 'number' : 'bullet',
          tag,
          children: [...el.children]
            .filter((item) => item.nodeName === 'LI')
            .map((item) => ({
              type: 'listitem',
              value: 1,
              children: inlineNodes(item).length ? inlineNodes(item) : [textLeaf('')],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            })),
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        })
        return
      }
      children.push(paragraphFrom(el))
    })
  }

  return {
    root: {
      type: 'root',
      children: children.length ? children : [paragraphFrom({ childNodes: [] })],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

export function safeMapEmbed(html) {
  if (!html || typeof html !== 'string') return ''
  const trimmed = html.trim()
  if (!trimmed.startsWith('<iframe')) return ''
  if (!/google\.com\/maps|maps\.google\./i.test(trimmed)) return ''
  if (/<script/i.test(trimmed)) return ''
  return trimmed
}
