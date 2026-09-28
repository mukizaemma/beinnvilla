function Icon({ children, title }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <title>{title}</title>
      {children}
    </svg>
  )
}

export const SOCIAL_ICONS = {
  instagram: (
    <Icon title="Instagram">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </Icon>
  ),
  facebook: (
    <Icon title="Facebook">
      <path
        fill="currentColor"
        d="M14.5 8.5V6.8c0-.7.5-1 1.2-1H17V3h-2.4C12 3 11 4.5 11 6.6v1.9H9v2.7h2V21h3.2v-9.8h2.4l.4-2.7h-2.5z"
      />
    </Icon>
  ),
  tripadvisor: (
    <Icon title="TripAdvisor">
      <circle cx="8" cy="13" r="3.1" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="16" cy="13" r="3.1" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="8" cy="13" r="1.1" fill="currentColor" />
      <circle cx="16" cy="13" r="1.1" fill="currentColor" />
      <path d="M8 6.2 12 10l4-3.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </Icon>
  ),
  tiktok: (
    <Icon title="TikTok">
      <path
        fill="currentColor"
        d="M14.2 3v11.1a3.2 3.2 0 1 1-2.7-3.16V8.2a6.1 6.1 0 0 0 3.6 1.18V6.4A6.7 6.7 0 0 0 19 7.7V4.8A6.6 6.6 0 0 1 14.2 3z"
      />
    </Icon>
  ),
  youtube: (
    <Icon title="YouTube">
      <path
        fill="currentColor"
        d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3A2.7 2.7 0 0 0 2.4 7.2 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8zM10 15.2V8.8L15.5 12 10 15.2z"
      />
    </Icon>
  ),
  x: (
    <Icon title="X">
      <path
        fill="currentColor"
        d="M17.8 3H20l-5.7 6.5L21 21h-5.3l-4.2-5.5L6.7 21H4.5l6.1-7L3.2 3h5.4l3.8 5.1L17.8 3zm-1 16.2h1.5L7.3 4.7H5.7l11.1 14.5z"
      />
    </Icon>
  ),
  linkedin: (
    <Icon title="LinkedIn">
      <path
        fill="currentColor"
        d="M6.5 9.2H3.7V21h2.8V9.2zM5.1 3.5A1.7 1.7 0 1 0 5.1 7a1.7 1.7 0 0 0 0-3.5zM20.3 21h-2.8v-5.7c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3v5.8H10.6V9.2h2.7v1.6h.1c.4-.7 1.3-1.9 3.1-1.9 3.3 0 3.9 2.2 3.9 5V21z"
      />
    </Icon>
  ),
}
