import Link from 'next/link';

interface BlogCardProps {
  post: {
    id: string;
    properties: {
      Title?: {
        title?: Array<{
          plain_text?: string;
        }>;
      };
      Date?: {
        date?: {
          start?: string;
        };
      };
    };
  };
}

export default function BlogCard({ post }: BlogCardProps) {
  const title = post.properties.Title?.title?.[0]?.plain_text || 'Untitled';
  const date = post.properties.Date?.date?.start || '';

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <Link href={`/posts/${post.id}`} className="block p-6">
        <h3 className="font-bold text-xl text-zinc-900 mb-4 line-clamp-2">
          {title}
        </h3>
        <time className="font-mono text-sm text-zinc-500">
          {new Date(date).toLocaleDateString()}
        </time>
      </Link>
    </div>
  );
} 