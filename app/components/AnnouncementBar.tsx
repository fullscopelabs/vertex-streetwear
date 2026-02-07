import {useState} from 'react';

const MESSAGES = [
  'FREE SHIPPING ON ORDERS OVER $200',
  'NEW DROPS EVERY SEASON',
  'PREMIUM STREETWEAR ESSENTIALS',
];

interface AnnouncementBarProps {
  onDismiss?: () => void;
}

export function AnnouncementBar({onDismiss}: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Double the content so the marquee loops seamlessly
  const tickerContent = [...MESSAGES, ...MESSAGES]
    .map((msg) => `${msg}  \u2022  `)
    .join('');

  return (
    <div className="fixed top-0 left-0 right-0 bg-charcoal text-bone overflow-hidden z-[60]">
      <div className="flex items-center h-9">
        {/* Marquee track */}
        <div className="animate-marquee whitespace-nowrap flex-shrink-0">
          <span className="text-[10px] uppercase tracking-[0.25em] font-medium">
            {tickerContent}
          </span>
          <span className="text-[10px] uppercase tracking-[0.25em] font-medium">
            {tickerContent}
          </span>
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => {
          setDismissed(true);
          onDismiss?.();
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-bone/60 hover:text-bone transition-colors duration-200"
        aria-label="Dismiss announcement"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-3.5 h-3.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
