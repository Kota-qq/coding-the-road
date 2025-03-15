import { z } from 'zod'

export const PostIdSchema = z.string().min(1).max(100)

export const CommentSchema = z.object({
  content: z.string().min(1).max(1000),
  author: z.string().min(1).max(50),
  email: z.string().email(),
})

export function validatePostId(id: string) {
  return PostIdSchema.safeParse(id)
} 