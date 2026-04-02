export function AnswerBlock({ text }: { text: string }) {
  return (
    <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl">
      {text}
    </p>
  )
}
