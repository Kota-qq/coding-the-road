import { MetadataRoute } from 'next'
import { getPosts } from '@/lib/notion'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts()
  
  const postsUrls = posts.map((post) => ({
    url: `https://codingtheroad.com/posts/${post.id}`,
    lastModified: post.last_edited_time,
  }))

  return [
    {
      url: 'https://codingtheroad.com',
      lastModified: new Date(),
    },
    {
      url: 'https://codingtheroad.com/about',
      lastModified: new Date(),
    },
    {
      url: 'https://codingtheroad.com/articles',
      lastModified: new Date(),
    },
    ...postsUrls,
  ]
} 