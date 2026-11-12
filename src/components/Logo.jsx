import React from 'react';
import { Shield } from 'lucide-react';

export default function Logo({ size = 40, className = '' }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        {/* Police cap */}
        <ellipse cx="50" cy="32" rx="36" ry="14" fill="#0033B8" />
        <rect x="20" y="24" width="60" height="12" rx="4" fill="#002080" />
        <ellipse cx="50" cy="24" rx="28" ry="10" fill="#0A7BFF" />
        <rect x="44" y="16" width="12" height="6" rx="2" fill="#FFD700" />
        {/* Badge on cap */}
        <circle cx="50" cy="28" r="5" fill="#FFD700" />
        <circle cx="50" cy="28" r="3" fill="#0033B8" />
        {/* Letter B */}
        <text
          x="50"
          y="78"
          textAnchor="middle"
          fontSize="48"
          fontWeight="800"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fill="#0033B8"
        >
          B
        </text>
      </svg>
    </div>
  );
}
