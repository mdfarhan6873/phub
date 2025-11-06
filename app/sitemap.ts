import { MetadataRoute } from 'next'
import dbConnect from '@/lib/db'
import Video from '@/lib/modals/vedios'
import Category from '@/lib/modals/categories'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await dbConnect()

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/videoplay`,
      lastModified: new Date(),
    },
  ]

  // Dynamic video pages
  const videos = await Video.find().select('_id updatedAt').lean()
  const videoPages = videos.map((video) => ({
    url: `${baseUrl}/videoplay/${video._id}`,
    lastModified: (video as any).updatedAt || new Date(),
  }))

  return [...staticPages, ...videoPages]
}
