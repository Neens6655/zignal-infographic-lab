import { z } from 'zod'

export const StyleSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(3).max(50),
  description: z.string().min(50).max(300),
  longDescription: z.string().min(200),
  answerBlock: z.string().min(20).max(300),
  category: z.string(),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  icon: z.string().max(4),
  bestFor: z.array(z.string()).min(2).max(8),
  keywords: z.array(z.string()).min(3).max(15),
  relatedLayouts: z.array(z.string()).min(1).max(5),
})

export const LayoutSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(3).max(50),
  description: z.string().min(50).max(300),
  longDescription: z.string().min(200),
  answerBlock: z.string().min(20).max(300),
  category: z.string(),
  bestFor: z.array(z.string()).min(2).max(8),
  keywords: z.array(z.string()).min(3).max(15),
  relatedStyles: z.array(z.string()).min(1).max(5),
})

export type Style = z.infer<typeof StyleSchema>
export type Layout = z.infer<typeof LayoutSchema>

export const StylesFileSchema = z.array(StyleSchema).length(20)
export const LayoutsFileSchema = z.array(LayoutSchema).length(20)
