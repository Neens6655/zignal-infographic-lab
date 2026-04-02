import { CheckCircle2 } from 'lucide-react'

interface FeatureGridProps {
  title: string
  features: string[]
  accent?: string
}

export function FeatureGrid({ title, features, accent }: FeatureGridProps) {
  return (
    <section className="mb-16">
      <h2 className="text-sm font-mono font-bold text-white mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex items-start gap-3 p-4 border border-white/[0.06] bg-white/[0.01]"
          >
            <CheckCircle2
              className="h-4 w-4 mt-0.5 shrink-0"
              style={{ color: accent ?? '#D4A84B' }}
            />
            <span className="text-sm text-white/60">{feature}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
