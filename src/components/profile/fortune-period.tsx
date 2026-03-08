"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  ChevronRight,
  Clock,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

interface FortunePeriodProps {
  currentDaigen: {
    ageRange: string;
    theme: string;
    description: string;
    details: string[];
  };
  yearFortune: {
    year: number;
    highlights: string[];
    cautions: string[];
  };
}

export function FortunePeriod({
  currentDaigen,
  yearFortune,
}: FortunePeriodProps) {
  return (
    <div className="space-y-4">
      {/* Current Daigen (10-year period) */}
      <Card className="border-brand-gold/20 bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold/10">
              <Clock className="h-4 w-4 text-brand-gold" />
            </div>
            <div>
              <CardTitle className="font-heading text-base text-brand-gold">
                現在の大限
              </CardTitle>
              <p className="text-xs text-muted-foreground">10年周期の運勢</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Age range highlight */}
          <div className="flex items-center gap-2">
            <Badge className="bg-brand-gold text-brand-indigo font-bold">
              {currentDaigen.ageRange}
            </Badge>
            <span className="text-sm font-medium">{currentDaigen.theme}</span>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {currentDaigen.description}
          </p>

          {/* Details list */}
          <ul className="space-y-2">
            {currentDaigen.details.map((detail, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-gold/60" />
                <span className="text-muted-foreground">{detail}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Year Fortune */}
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold/10">
              <CalendarDays className="h-4 w-4 text-brand-gold" />
            </div>
            <div>
              <CardTitle className="font-heading text-base text-brand-gold">
                {yearFortune.year}年の年運
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Highlights */}
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3 text-brand-gold" />
              ハイライト
            </p>
            <ul className="space-y-2">
              {yearFortune.highlights.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-gold/60" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cautions */}
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <AlertTriangle className="h-3 w-3 text-brand-crimson" />
              注意ポイント
            </p>
            <ul className="space-y-2">
              {yearFortune.cautions.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-crimson/60" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
