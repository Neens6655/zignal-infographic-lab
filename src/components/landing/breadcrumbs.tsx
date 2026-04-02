import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex items-center gap-1.5 text-[10px] font-mono tracking-wide text-white/30">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-white/60 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-white/50">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
