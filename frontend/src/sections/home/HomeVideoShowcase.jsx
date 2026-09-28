import VideoShowcase from '@sections/shared/VideoShowcase';
import { useHomePage } from '@lib/queries/useHomePage';

export default function HomeVideoShowcase() {
  const { data } = useHomePage();
  return <VideoShowcase data={data.videoShowcase} />;
}
