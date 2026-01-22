

export const Logo = ({ className = "h-8 w-auto" }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 200 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="Delegate Logo"
        >
            <defs>
                {/* Glossy Gradients */}
                <linearGradient id="gloss-red" x1="10" y1="15" x2="40" y2="45" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F43F5E" stopOpacity="0.9" />
                    <stop offset="1" stopColor="#9F1239" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="gloss-blue" x1="85" y1="15" x2="115" y2="45" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3B82F6" stopOpacity="0.9" />
                    <stop offset="1" stopColor="#1D4ED8" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="gloss-green" x1="155" y1="15" x2="185" y2="45" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#22C55E" stopOpacity="0.9" />
                    <stop offset="1" stopColor="#15803D" stopOpacity="0.8" />
                </linearGradient>

                {/* Glass Shine */}
                <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="white" stopOpacity="0.4" />
                    <stop offset="0.5" stopColor="white" stopOpacity="0.1" />
                    <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>

                {/* Soft Glow */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Connection Lines (Glowy) */}
            <path
                d="M45 30H85 M115 30H155"
                stroke="white"
                strokeOpacity="0.15"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="4 4"
            />

            {/* --- Nodes with Glassmorphic Style --- */}

            {/* 1. Trigger (Red) */}
            <g filter="url(#glow)">
                <rect x="10" y="15" width="30" height="30" rx="8" fill="url(#gloss-red)" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
                {/* Top Shine */}
                <path d="M12 17C12 15.8954 12.8954 15 14 15H36C37.1046 15 38 15.8954 38 17V25C38 25 30 30 12 25V17Z" fill="url(#shine)" fillOpacity="0.5" />
                <path d="M25 22L18 30L32 30L25 38" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
            </g>

            {/* 2. Action (Blue) */}
            <g filter="url(#glow)">
                <rect x="85" y="15" width="30" height="30" rx="8" fill="url(#gloss-blue)" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
                {/* Top Shine */}
                <path d="M87 17C87 15.8954 87.8954 15 89 15H111C112.105 15 113 15.8954 113 17V25C113 25 105 30 87 25V17Z" fill="url(#shine)" fillOpacity="0.5" />
                <circle cx="100" cy="30" r="6" stroke="white" strokeWidth="2" strokeOpacity="0.9" />
            </g>

            {/* 3. Output (Green) */}
            <g filter="url(#glow)">
                <rect x="155" y="15" width="30" height="30" rx="8" fill="url(#gloss-green)" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
                {/* Top Shine */}
                <path d="M157 17C157 15.8954 157.895 15 159 15H181C182.105 15 183 15.8954 183 17V25C183 25 175 30 157 25V17Z" fill="url(#shine)" fillOpacity="0.5" />
                <path d="M165 30L170 35L178 25" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
            </g>

            {/* Text Brand */}
            <text
                x="200"
                y="38"
                fontSize="28"
                fontWeight="700"
                fill="white"
                fontFamily="system-ui, -apple-system, sans-serif"
                style={{ letterSpacing: '0.05em' }}
            >
                Delegate
            </text>
        </svg>
    );
};
