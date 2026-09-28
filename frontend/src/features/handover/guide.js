export const DEVELOPER_EMAIL = 'useadmin@iremetech.com'

export const HANDOVER_TABS = [
  { id: 'overview', label: 'What is ready' },
  { id: 'bookings', label: 'How guests book' },
  { id: 'inbox', label: 'Your bookings' },
  { id: 'account', label: 'Your account' },
  { id: 'manual', label: 'How to update the site' },
  { id: 'upkeep', label: 'Keeping it online' },
  { id: 'feedback', label: 'Ask a question' },
]

export const HANDOVER_SECTIONS = {
  overview: {
    title: 'What is ready',
    lead: 'The BE Inn Villa website is built. Guests can look around and ask to stay. You can read those requests and update the site after your account is approved.',
    blocks: [
      {
        heading: 'What guests can do',
        body: 'They can look at the rooms and photos, read about the villa and facilities, and send a stay request from the website. Guests do not create an account and they do not pay online. They pay at the hotel when they arrive.',
      },
      {
        heading: 'What you can do',
        body: 'After you sign in, you can change room prices and photos, the phone and WhatsApp number, the hotel email, facilities, and the photo gallery. You can also open the list of stay requests at any time.',
      },
      {
        heading: 'What happens when someone books',
        body: 'The website saves the request, emails you, and emails the guest. If they choose WhatsApp, a message also opens to the WhatsApp number saved in your site settings.',
      },
    ],
  },
  bookings: {
    title: 'How a guest asks to stay',
    lead: 'The guest uses the booking form on the website. You do not need to be at a computer for this to work.',
    blocks: [
      {
        heading: 'What they fill in',
        steps: [
          'They choose the arrival date, the departure date, and how many people are coming.',
          'They type their name, mobile number, and email. The email has to be a real address, or the form will not send.',
          'They choose WhatsApp or email. That is how they want to reach the hotel.',
          'They press send. The request is saved straight away.',
        ],
      },
      {
        heading: 'They pay later',
        body: 'The website does not take a card payment. The note they receive says the stay is requested and payment is at the hotel.',
      },
    ],
  },
  inbox: {
    title: 'How a booking reaches you',
    lead: 'You are notified when a request comes in, and you can also open the full list whenever you want.',
    blocks: [
      {
        heading: 'You get an email',
        body: 'The website emails the guest and emails the hotel at the same time. The hotel copy goes to the email address saved under Site setting. A copy also goes to the desk inbox arranged with Ireme Tech.',
      },
      {
        heading: 'WhatsApp or email, their choice',
        body: 'If the guest chooses WhatsApp, their phone opens a message to the WhatsApp number you saved in Site setting. If they choose email, the same request is sent by email. Either way, you still receive the email notification.',
      },
      {
        heading: 'Those contacts come from your settings',
        body: 'Open Site setting and fill in the hotel email, phone, and WhatsApp number. Those are the contacts the guest writes to. If they are empty, the guest cannot be sent to the right person.',
      },
      {
        heading: 'See recent bookings any time',
        steps: [
          'Sign in to the staff pages.',
          'Open Bookings.',
          'The newest requests are listed there, with the guest’s name, dates, and contact details.',
          'Open one request when you want to reply on WhatsApp or by email.',
        ],
      },
    ],
  },
  account: {
    title: 'Create your admin account',
    lead: 'Use the button below to register. Then tell Ireme Tech which email you used. That account cannot open the admin pages until it is approved.',
    blocks: [
      {
        heading: 'What to do',
        steps: [
          'Press Create your admin account and enter your name, email, and a password you will remember.',
          'Send that same email address to Ireme Tech. We use it to turn the account on.',
          'Until a super admin approves it, signing in will not work. A new registration cannot manage the hotel by itself.',
          'After approval, open the staff pages and sign in with that email and password.',
        ],
      },
      {
        heading: 'If you forget the password',
        body: 'On the sign-in page, press Forgot password. A reset link is emailed to you. The password is never written on this page.',
      },
    ],
  },
  manual: {
    title: 'How to update the site',
    lead: 'After your account is approved, these are the only places you usually need. You do not need to know how the website was built.',
    blocks: [
      {
        heading: 'Day to day',
        steps: [
          'Site setting — the hotel name, logo, phone, WhatsApp, and email. Booking messages use these.',
          'Rooms — the price, the cover photo, and extra photos for each room. Size, view, and the other details can be left blank. If you leave bedrooms empty, it is saved as 1.',
          'Bookings — every stay request. Open one to see who is coming and how to reply.',
          'Facilities and Gallery — what guests read about the property, and the photos on the gallery page.',
        ],
      },
      {
        heading: 'Two ways in',
        body: 'The staff pages are the simple desk for everyday changes. The admin pages show the same information if you prefer that screen. Both use the account that was approved for you.',
      },
    ],
  },
  upkeep: {
    title: 'Keeping the website online',
    lead: 'The pages are finished. Guests can use the live address after the domain, the hosting, and the security certificate are in place.',
    spotlight: {
      label: 'Required before the site can go live',
      items: ['Register the domain name', 'Set up the hosting', 'Add SSL security so the address starts with https'],
      fee: '$80',
      feeNote: 'Paid every year to renew the domain, hosting, and SSL.',
    },
    blocks: [
      {
        heading: 'What still has to be set up',
        body: 'Register the domain name, set up the hosting, and add SSL security so the address starts with https. Until those are in place, the site is not on its public address.',
      },
      {
        heading: 'Once a year',
        body: 'The domain, hosting, and SSL are renewed every year. That renewal is $80.',
      },
      {
        heading: 'Help after handover',
        body: 'Ireme Tech remains available to help with the hosting renewal and with any technical problem. Write to the same address you use when you ask for your admin account to be approved.',
      },
    ],
  },
  feedback: {
    title: 'Ask a question',
    lead: 'If something is unclear or you want a change, send a note here. Ireme Tech can read it from the admin pages.',
    blocks: [],
  },
}
