"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Crown,
  Eye,
  Flame,
  Globe,
  Heart,
  Shield,
  TrendingUp,
  Users,
  Wind,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";

interface TraitCardProps {
  icon: string;
  title: string;
  description: string;
  relatedStar: string;
  quote?: string;
  className?: string;
}

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  Zap,
  Flame,
  Wind,
  Eye,
  Crown,
  TrendingUp,
  Briefcase,
  Users,
  Heart,
  Shield,
  Globe,
};

export function TraitCard({
  icon,
  title,
  description,
  relatedStar,
  quote,
  className,
}: TraitCardProps) {
  const IconComponent = ICON_MAP[icon] ?? Zap;

  return (
    <Card className={cn("border-border/50 bg-card", className)}>
      <CardContent className="space-y-3 pt-1">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
            <IconComponent className="h-4 w-4 text-brand-gold" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <h3 className="font-heading text-sm font-bold leading-snug">
              {title}
            </h3>
            <p className="text-xs text-brand-gold/70">{relatedStar}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {/* Quote block */}
        {quote && (
          <blockquote className="border-l-2 border-brand-gold/40 pl-3 text-xs italic leading-relaxed text-muted-foreground/80">
            {quote}
          </blockquote>
        )}
      </CardContent>
    </Card>
  );
}
