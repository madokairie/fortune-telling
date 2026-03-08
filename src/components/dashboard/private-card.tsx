'use client';

import { motion } from 'motion/react';
import { Users, HeartPulse, Gem } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PrivateCardProps {
  content: string;
}

export function PrivateCard({ content }: PrivateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            プライベート運
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Category icons row */}
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1 text-xs">
              <Users className="h-3.5 w-3.5" />
              人間関係
            </span>
            <span className="flex items-center gap-1 text-xs">
              <HeartPulse className="h-3.5 w-3.5" />
              健康
            </span>
            <span className="flex items-center gap-1 text-xs">
              <Gem className="h-3.5 w-3.5" />
              パートナーシップ
            </span>
          </div>

          <p className="text-sm leading-relaxed text-foreground/80">
            {content}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
