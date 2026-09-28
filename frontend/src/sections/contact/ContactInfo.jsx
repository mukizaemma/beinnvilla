import { MapPin, Phone, Mail, MessageCircle, Clock, Navigation } from 'lucide-react'
import { useSiteLayout } from '@lib/queries/useSiteLayout'
import { useContactPage } from '@lib/queries/useContactPage'
import { safeMapEmbed } from '@lib/richText'
import styles from './ContactInfo.module.css'

export default function ContactInfo() {
  const { data: layout } = useSiteLayout()
  const { data: page } = useContactPage()
  const company = layout.company
  const whatsappNumber = (company.whatsapp || company.phone || '').replace(/[^\d]/g, '')
  const mapEmbed = safeMapEmbed(company.mapEmbed)

  return (
    <div className={styles.info}>
      {company.address && (
        <div className={styles.card}>
          <MapPin size={18} className={styles.icon} />
          <div>
            <h3 className={styles.cardTitle}>Address</h3>
            <p className={styles.cardText}>{company.address}</p>
            {company.mapUrl && (
              <a
                href={company.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                <Navigation size={13} />
                Get Directions
              </a>
            )}
          </div>
        </div>
      )}

      {company.phone && (
        <div className={styles.card}>
          <Phone size={18} className={styles.icon} />
          <div>
            <h3 className={styles.cardTitle}>Phone</h3>
            <a href={`tel:${company.phone.replace(/\s/g, '')}`} className={styles.cardLink}>
              {company.phone}
            </a>
          </div>
        </div>
      )}

      {company.email && (
        <div className={styles.card}>
          <Mail size={18} className={styles.icon} />
          <div>
            <h3 className={styles.cardTitle}>Email</h3>
            <a href={`mailto:${company.email}`} className={styles.cardLink}>
              {company.email}
            </a>
          </div>
        </div>
      )}

      {whatsappNumber && (
        <div className={styles.card}>
          <MessageCircle size={18} className={styles.icon} />
          <div>
            <h3 className={styles.cardTitle}>WhatsApp</h3>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cardLink}
            >
              Chat with us
            </a>
          </div>
        </div>
      )}

      {page.frontDeskNote && (
        <div className={styles.noteBlock}>
          <Clock size={15} className={styles.noteIcon} />
          <span>{page.frontDeskNote}</span>
        </div>
      )}
      {page.responseNote && <p className={styles.responseNote}>{page.responseNote}</p>}

      {mapEmbed && (
        <div className={styles.map} dangerouslySetInnerHTML={{ __html: mapEmbed }} />
      )}
    </div>
  )
}
