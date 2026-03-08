'use client';

import { motion } from 'motion/react';
import { Briefcase, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BusinessCardProps {
  type: 'mcreate' | 'jybee';
  content: string;
}

const config = {
  mcreate: {
    label: 'エムクリエイト',
    icon: Briefcase,
  },
  jybee: {
    label: 'JYビー協会',
    icon: Heart,
  },
} as const;

export function BusinessCard({ type, content }: BusinessCardProps) {
  const { label, icon: Icon } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
        delay: type === 'mcreate' ? 0.05 : 0.1,
      }}
    >
      <Card size="sm" className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-sm">
            <Icon className="h-4 w-4 text-brand-gold" />
            <span>{label}</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm leading-relaxed text-foreground/80">
            {content}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
