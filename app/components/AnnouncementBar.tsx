import {useState} from 'react';

interface AnnouncementBarProps {
  onDismiss?: () => void;
}

export function AnnouncementBar({onDismiss}: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const text = 'IF YOU KNOW  •  ANTI-ALGORITHM  •  FORM OVER FAME  •  CRAFT OBSESSION  •  QUIET POWER  •  MADE IN MARGINS  •  WORN BY MAKERS  •  DETAILS MATTER  •  FUNCTION FIRST  •  NO SHORTCUTS  •  INTENTIONAL ALWAYS  •  PRECISION CULTURE  •  SUBSTANCE ONLY  •  BUILT TO LAST  •  DESIGNED TO ENDURE  •  NOT FOR EVERYONE  •  ';
  const repeated = text.repeat(3);

  return (
    <div className="fixed top-0 left-0 right-0 bg-charcoal text-bone overflow-hidden z-[60]">
      <div className="flex items-center h-9">
        {/* Marquee track - slower speed to prevent blur */}
        <div className="animate-marquee-slow whitespace-nowrap flex-shrink-0">
          <span className="text-[11px] uppercase tracking-[0.3em] font-medium">
            {repeated}
          </span>
          <span className="text-[11px] uppercase tracking-[0.3em] font-medium">
            {repeated}
          </span>
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => {
          setDismissed(true);
          onDismiss?.();
        }}
        className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-bone/60 hover:text-bone transition-colors duration-200"
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
