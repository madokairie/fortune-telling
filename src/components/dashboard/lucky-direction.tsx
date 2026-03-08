'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface LuckyDirectionProps {
  direction: string;
}

/** 八方位の定義（12時方向=北 から時計回り） */
const DIRECTIONS = [
  { label: '北', key: '北', angle: 0 },
  { label: '北東', key: '北東', angle: 45 },
  { label: '東', key: '東', angle: 90 },
  { label: '南東', key: '南東', angle: 135 },
  { label: '南', key: '南', angle: 180 },
  { label: '南西', key: '南西', angle: 225 },
  { label: '西', key: '西', angle: 270 },
  { label: '北西', key: '北西', angle: 315 },
] as const;

export function LuckyDirection({ direction }: LuckyDirectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
      className="flex flex-col items-center gap-3"
    >
      <p className="text-xs font-medium text-muted-foreground">吉方位</p>

      {/* Compass SVG */}
      <div className="relative h-28 w-28">
        <svg
          viewBox="0 0 120 120"
          className="h-full w-full"
          aria-label={`吉方位: ${direction}`}
        >
          {/* Outer circle */}
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-border"
          />

          {/* Inner circle */}
          <circle
            cx="60"
            cy="60"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-border"
          />

          {/* Direction lines and labels */}
          {DIRECTIONS.map((d) => {
            const rad = ((d.angle - 90) * Math.PI) / 180;
            const isLucky = direction.includes(d.key);

            // Line endpoints
            const innerR = 22;
            const outerR = 42;
            const x1 = 60 + innerR * Math.cos(rad);
            const y1 = 60 + innerR * Math.sin(rad);
            const x2 = 60 + outerR * Math.cos(rad);
            const y2 = 60 + outerR * Math.sin(rad);

            // Label position
            const labelR = 50;
            const lx = 60 + labelR * Math.cos(rad);
            const ly = 60 + labelR * Math.sin(rad);

            return (
              <g key={d.key}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isLucky ? '#c9a96e' : 'currentColor'}
                  strokeWidth={isLucky ? 2 : 0.5}
                  className={isLucky ? '' : 'text-muted-foreground/40'}
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={cn(
                    'text-[9px]',
                    isLucky
                      ? 'fill-brand-gold font-bold'
                      : 'fill-muted-foreground'
                  )}
                >
                  {d.label}
                </text>

                {/* Highlight dot for lucky direction */}
                {isLucky && (
                  <circle
                    cx={60 + 32 * Math.cos(rad)}
                    cy={60 + 32 * Math.sin(rad)}
                    r="4"
                    className="fill-brand-gold/30"
                  />
                )}
              </g>
            );
          })}

          {/* Center dot */}
          <circle cx="60" cy="60" r="3" className="fill-brand-gold" />
        </svg>
      </div>

      <p className="text-sm font-medium text-brand-gold">{direction}</p>
    </motion.div>
  );
}
