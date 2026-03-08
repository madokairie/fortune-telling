'use client';

import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DailyAdviceCardProps {
  overallFortune: string;
}

export function DailyAdviceCard({ overallFortune }: DailyAdviceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <Card className="relative overflow-hidden">
        {/* Soft Gold accent line at top */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-brand-gold" />

        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-lg">
            <Sparkles className="h-5 w-5 text-brand-gold" />
            <span>総合運</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="leading-relaxed text-foreground/90">
            {overallFortune}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
