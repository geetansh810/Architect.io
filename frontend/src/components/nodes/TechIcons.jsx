/**
 * TechIcons.jsx — Inline SVG technology icons
 * Used inside nodes and the sidebar palette.
 */

const icons = {
  mongodb: (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2C16 2 9 10.5 9 17.5C9 21.64 12.13 25 16 25C19.87 25 23 21.64 23 17.5C23 10.5 16 2 16 2Z" fill="#4FAA41"/>
      <path d="M16 25V30" stroke="#4FAA41" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 2C16 2 16 14 16 25" stroke="#3D8B36" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  postgresql: (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="16" cy="10" rx="10" ry="5" fill="#336791"/>
      <rect x="6" y="10" width="20" height="14" fill="#336791"/>
      <ellipse cx="16" cy="24" rx="10" ry="5" fill="#336791"/>
      <ellipse cx="16" cy="10" rx="10" ry="5" fill="none" stroke="#5E9DC8" strokeWidth="1"/>
      <text x="16" y="19" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">PG</text>
    </svg>
  ),
  mysql: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M4 8h24v16H4z" fill="#00618A" rx="3"/>
      <text x="16" y="20" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">MySQL</text>
    </svg>
  ),
  redis: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M3 20.5l13 5.5 13-5.5-13-5.5z" fill="#D82C20"/>
      <path d="M3 16l13 5.5 13-5.5-13-5.5z" fill="#FF4438"/>
      <path d="M3 11.5l13 5.5 13-5.5L16 6z" fill="#FF6B6B"/>
    </svg>
  ),
  kafka: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" fill="#231F20"/>
      <circle cx="16" cy="10" r="2.5" fill="white"/>
      <circle cx="10" cy="20" r="2.5" fill="white"/>
      <circle cx="22" cy="20" r="2.5" fill="white"/>
      <line x1="16" y1="12.5" x2="11.5" y2="17.5" stroke="white" strokeWidth="1.5"/>
      <line x1="16" y1="12.5" x2="20.5" y2="17.5" stroke="white" strokeWidth="1.5"/>
      <line x1="12.5" y1="20" x2="19.5" y2="20" stroke="white" strokeWidth="1.5"/>
    </svg>
  ),
  rabbitmq: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="4" y="4" width="24" height="24" rx="4" fill="#FF6600"/>
      <text x="16" y="21" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">MQ</text>
    </svg>
  ),
  nginx: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M16 3L29 10V22L16 29L3 22V10L16 3Z" fill="#009900"/>
      <path d="M11 22V10l5-3 5 3v12l-5-3-5 3z" fill="white"/>
    </svg>
  ),
  cloudflare: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M20.8 19.4c0.4-1.4 0.2-2.7-0.6-3.7-0.7-0.9-1.8-1.4-3-1.4h-0.3c-0.3-1.6-1.5-2.9-3.1-3.3-1.6-0.4-3.2 0.2-4.2 1.4-0.5-0.2-1-0.3-1.5-0.3-2.3 0-4.1 1.8-4.1 4.1 0 0.2 0 0.4 0.1 0.6-1.3 0.5-2.1 1.7-2.1 3.1 0 1.8 1.5 3.3 3.3 3.3h14.5c1.6 0 2.9-1.3 2.9-2.9 0-0.4-0.1-0.7-0.2-1h-1.7z" fill="#F48120"/>
      <path d="M26 17.5c-0.1-0.4-0.4-0.7-0.8-0.8 0-0.1 0-0.2 0-0.3 0-1.9-1.5-3.4-3.4-3.4-0.4 0-0.8 0.1-1.2 0.2-0.6-1.1-1.8-1.9-3.1-1.9-2 0-3.6 1.6-3.6 3.6v0.1h0.4c1 0 1.9 0.4 2.6 1.1 0.6 0.7 0.9 1.7 0.8 2.7h4.4c0.7 0 1.2 0.5 1.2 1.2v0.1h1.5c0.9 0 1.6-0.7 1.6-1.6 0-0.4-0.1-0.7-0.4-1z" fill="#FBAD41"/>
    </svg>
  ),
  awss3: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M16 4L6 9v14l10 5 10-5V9z" fill="#7AA116"/>
      <path d="M16 4v19" stroke="#3A6B04" strokeWidth="1"/>
      <path d="M6 9l10 5 10-5" stroke="#3A6B04" strokeWidth="1"/>
    </svg>
  ),
  stripe: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#635BFF"/>
      <path d="M14.5 13.5c0-0.8 0.7-1.2 1.8-1.2 1.6 0 3.3 0.5 4.4 1.2v-4c-1.1-0.4-2.8-0.8-4.4-0.8-3.6 0-6 1.9-6 5 0 4.9 6.7 4.1 6.7 6.2 0 0.9-0.8 1.2-2 1.2-1.7 0-3.9-0.7-5.6-1.7v4.1c1.5 0.6 3.9 1.1 5.6 1.1 3.7 0 6.3-1.8 6.3-5 0-5.3-6.8-4.3-6.8-6.1z" fill="white"/>
    </svg>
  ),
  github: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#24292e"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M16 5C10.477 5 6 9.477 6 15c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0116 10.84c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C23.137 23.163 26 19.418 26 15c0-5.523-4.477-10-10-10z" fill="white"/>
    </svg>
  ),
  react: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="3" fill="#61DAFB"/>
      <ellipse cx="16" cy="16" rx="13" ry="5" stroke="#61DAFB" strokeWidth="1.5" fill="none"/>
      <ellipse cx="16" cy="16" rx="13" ry="5" stroke="#61DAFB" strokeWidth="1.5" fill="none" transform="rotate(60 16 16)"/>
      <ellipse cx="16" cy="16" rx="13" ry="5" stroke="#61DAFB" strokeWidth="1.5" fill="none" transform="rotate(120 16 16)"/>
    </svg>
  ),
  nextjs: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="black"/>
      <path d="M10 22V10l14 14h-4L10 14v8z" fill="white"/>
      <path d="M20 10h2v7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  mobile: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="8" y="3" width="16" height="26" rx="3" fill="#475569"/>
      <rect x="10" y="7" width="12" height="17" rx="1" fill="#0EA5E9"/>
      <circle cx="16" cy="26.5" r="1.5" fill="#94A3B8"/>
    </svg>
  ),
  browser: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="2" y="5" width="28" height="22" rx="3" fill="#475569"/>
      <rect x="2" y="5" width="28" height="7" rx="3" fill="#334155"/>
      <circle cx="7" cy="8.5" r="1.5" fill="#EF4444"/>
      <circle cx="12" cy="8.5" r="1.5" fill="#F59E0B"/>
      <circle cx="17" cy="8.5" r="1.5" fill="#10B981"/>
      <rect x="4" y="14" width="24" height="11" rx="1" fill="#1E293B"/>
    </svg>
  ),
  jwt: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#000"/>
      <text x="16" y="20" textAnchor="middle" fill="#FB015B" fontSize="8" fontWeight="bold">JWT</text>
    </svg>
  ),
  smtp: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="3" y="8" width="26" height="18" rx="3" fill="#4F46E5"/>
      <path d="M3 11l13 9 13-9" stroke="white" strokeWidth="2"/>
    </svg>
  ),
  sendgrid: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="2" y="8" width="28" height="18" rx="3" fill="#1A82E2"/>
      <path d="M3 11l13 9 13-9" stroke="white" strokeWidth="2"/>
    </svg>
  ),
  multer: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="4" y="6" width="24" height="20" rx="3" fill="#F97316"/>
      <path d="M16 11v10M11 16h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  cron: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#7C3AED"/>
      <circle cx="16" cy="16" r="1.5" fill="white"/>
      <line x1="16" y1="16" x2="16" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="16" y1="16" x2="22" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  webhook: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" stroke="#D946EF" strokeWidth="2"/>
      <path d="M20 16a4 4 0 100 8 4 4 0 000-8z" stroke="#D946EF" strokeWidth="2"/>
      <path d="M14 12h4a4 4 0 010 8" stroke="#D946EF" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  rest: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="2" y="10" width="28" height="12" rx="6" fill="#3B82F6"/>
      <text x="16" y="19" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">REST</text>
    </svg>
  ),
  express: (
    <svg viewBox="0 0 32 32" fill="none">
      <text x="4" y="20" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">ex</text>
      <circle cx="20" cy="16" r="8" fill="#68A063" opacity="0.8"/>
    </svg>
  ),
  schema: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="4" y="4" width="24" height="24" rx="4" fill="#10B981" opacity="0.15"/>
      <rect x="4" y="4" width="24" height="8" rx="4" fill="#10B981"/>
      <rect x="7" y="15" width="18" height="2" rx="1" fill="#10B981"/>
      <rect x="7" y="20" width="12" height="2" rx="1" fill="#10B981" opacity="0.6"/>
    </svg>
  ),
  sqs: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="3" y="8" width="26" height="16" rx="3" fill="#FF9900"/>
      <text x="16" y="19" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">SQS</text>
    </svg>
  ),
  generic: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" fill="#64748B" opacity="0.3"/>
      <circle cx="16" cy="16" r="6" fill="#64748B"/>
    </svg>
  ),
};

export default function TechIcon({ name, size = 20, className = '' }) {
  const icon = icons[name?.toLowerCase()] || icons.generic;
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {icon}
    </span>
  );
}

export { icons };
