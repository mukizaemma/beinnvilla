import { useHomePage } from '@lib/queries/useHomePage'
import { pickApartment } from '@features/hotel/adapters'
import ApartmentStay from '@sections/stay/ApartmentStay'

export default function HomeRooms() {
  const { data } = useHomePage()
  const apartment = pickApartment(data.rooms)
  const section = data.roomsSection || {}

  return <ApartmentStay apartment={apartment} section={section} compact />
}
