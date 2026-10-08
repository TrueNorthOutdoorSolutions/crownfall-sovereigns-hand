export function Crown({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 160 120" fill="none" aria-hidden="true">
    <defs><linearGradient id="crown-gold" x1="40" y1="15" x2="125" y2="110" gradientUnits="userSpaceOnUse"><stop stopColor="#ffe6a2" /><stop offset=".48" stopColor="#bf9852" /><stop offset="1" stopColor="#6b4f27" /></linearGradient></defs>
    <path d="M27 85 16 37 48 57 80 16 112 57 144 37 133 85Z" fill="url(#crown-gold)" stroke="#f4daa0" strokeWidth="2" />
    <path d="M32 82 27 53 50 68 80 34 110 68 133 53 128 82" stroke="#473a24" strokeWidth="3" />
    <path d="M29 88H131L126 105H34Z" fill="url(#crown-gold)" stroke="#f4daa0" strokeWidth="2" />
    <path d="m80 61 9 13-9 13-9-13Z" fill="#8ad4c6" stroke="#d5fff4" strokeWidth="2" />
    <circle cx="16" cy="33" r="5" fill="#f0d29a" /><circle cx="80" cy="12" r="5" fill="#f0d29a" /><circle cx="144" cy="33" r="5" fill="#f0d29a" />
    <path d="M41 97H63M97 97H119" stroke="#493721" strokeWidth="3" />
  </svg>;
}
