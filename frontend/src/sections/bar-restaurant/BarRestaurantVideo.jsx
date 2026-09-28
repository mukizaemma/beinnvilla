import VideoShowcase from '@sections/shared/VideoShowcase';
import { useBarRestaurantPage } from '@lib/queries/useBarRestaurantPage';

export default function BarRestaurantVideo() {
  const { data } = useBarRestaurantPage();
  return <VideoShowcase data={data.video} />;
}
