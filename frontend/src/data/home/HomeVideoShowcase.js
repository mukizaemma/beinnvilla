/**
 * HOME VIDEO SHOWCASE DATA
 * ─────────────────────────────────────────────────────────────
 * videoUrl is intentionally empty — no property video exists yet.
 * The section handles that gracefully (see HomeVideoShowcase.jsx):
 * clicking play shows a "coming soon" state instead of trying to load
 * a broken video. Once you have a real video (hosted file or YouTube/
 * Vimeo embed URL), just fill this in.
 * ─────────────────────────────────────────────────────────────
 */

export const homeVideoShowcase = {
  eyebrow: 'Property Video',
  headline: 'Explore Grand Villa Apartment',
  // TODO: replace with a real property photo/still
  backgroundImage: '/images/home/videoframe.png',
  // TODO: add a real hosted video file or embed URL (YouTube/Vimeo) once filmed
  videoUrl: 'https://v.ftcdn.net/04/10/68/76/240_F_410687666_1pea6WxythWibvXu04PPmQHlwn1rHD29_ST.mp4',
};