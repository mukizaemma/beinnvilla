import { Link } from 'react-router-dom'
import { useFacilities } from '@features/hotel/queries/useFacilities'
import { usePageHeader } from '@features/hotel/queries/usePageHeader'
import PageLoader from '@components/ui/PageLoader'
import ScreenHeader from '@components/ui/ScreenHeader'
import Reveal from '@components/ui/Reveal'
import styles from './Catalog.module.css'

export default function FacilitiesPage() {
  const { data, isLoading } = useFacilities()
  const headerQuery = usePageHeader('bar-restaurant-page')
  if (isLoading) return <PageLoader />
  const facilities = data || []
  const header = headerQuery.data || facilities.find((item) => item.image)?.image || ''

  return (
    <>
    <ScreenHeader image={header} title="Facilities" />
    <div className={styles.page}>
      <div className="container">
        <Reveal>
          <p className={styles.kicker}>Facilities</p>
          <h1>With the stay, or for a visit.</h1>
          <p className={styles.intro}>
            Jacuzzi and meeting space are held with a group until they check out. The sauna, bar, and restaurant
            can also welcome friends and visitors.
          </p>
        </Reveal>
        <div className={styles.grid}>
          {facilities.map((item, index) => (
            <Reveal key={item.id} as={Link} to={`/facilities/${item.id}`} className={styles.card} delay={index * 70}>
              {item.image ? <img src={item.image} alt="" /> : <div className={styles.fill} />}
              <div>
                <strong>{item.name}</strong>
                <span>{item.audience === 'exclusive' ? 'Held with a stay' : 'Also open to visitors'}</span>
                <p>{item.summary}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}
