import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-(--z-bg) flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="font-mono text-6xl font-bold text-(--z-gold) tracking-tighter">
          404
        </div>
        <h1 className="font-mono text-xl font-bold text-(--z-text) tracking-tight">
          Page not found
        </h1>
        <p className="font-sans text-sm text-(--z-text-secondary) leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block font-mono text-xs font-semibold tracking-widest uppercase px-6 py-3 bg-(--z-gold) text-(--z-bg) hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
