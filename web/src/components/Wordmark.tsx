export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold tracking-tight ${className}`}>
      yapped<span className="text-tangerine">.</span>
    </span>
  )
}
