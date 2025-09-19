import Image from 'next/image';
import Link from 'next/link';

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
}

const VideoCard = ({ id, title, thumbnail, duration }: VideoCardProps) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Link href={`/video/${id}`} className="group">
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 text-sm rounded">
          {formatDuration(duration)}
        </div>
      </div>
      <h3 className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-orange-500">
        {title}
      </h3>
    </Link>
  );
};

export default VideoCard;
