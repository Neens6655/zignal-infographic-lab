import { AnswerBlock } from './answer-block'

interface PageHeroProps {
  label: string
  title: string
  category: string
  accent?: string
  answerBlock: string
}

export function PageHero({ label, title, category, accent, answerBlock }: PageHeroProps) {
  return (
    <section className="mb-16">
      <p
        className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase mb-4"
        style={{ color: accent ?? '#D4A84B' }}
      >
        {label}
      </p>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold text-white leading-tight mb-3">
        {title}
      </h1>
      <p className="text-xs font-mono tracking-widest uppercase text-white/30 mb-6">
        {category}
      </p>
      <AnswerBlock text={answerBlock} />
    </section>
  )
}
