import { useRoomsPage } from '@lib/queries/useRoomsPage'
import { pickApartment } from '@features/hotel/adapters'
import ApartmentStay from '@sections/stay/ApartmentStay'

export default function RoomsList() {
  const { data } = useRoomsPage()
  const apartment = pickApartment(data.rooms)

  return <ApartmentStay apartment={apartment} showHeader={false} />
}
