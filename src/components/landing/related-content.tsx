import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface RelatedItem {
  slug: string
  name: string
  description: string
  category: string
}

interface RelatedContentProps {
  title: string
  items: RelatedItem[]
  basePath: string
  accent?: string
}

export function RelatedContent({ title, items, basePath, accent }: RelatedContentProps) {
  if (items.length === 0) return null

  return (
    <section className="mb-16">
      <h2 className="text-sm font-mono font-bold text-white mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`${basePath}/${item.slug}`}
            className="group block p-5 border border-white/[0.06] bg-white/[0.01] hover:border-white/[0.12] transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono tracking-widest uppercase text-white/30">
                {item.category}
              </span>
              <ArrowRight
                className="h-3 w-3 text-white/20 group-hover:text-white/50 transition-colors"
              />
            </div>
            <h3 className="text-sm font-mono font-bold text-white mb-1">{item.name}</h3>
            <p className="text-xs text-white/40 line-clamp-2">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
