"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass } from "lucide-react";
import * as motion from "motion/react-client";

interface ActionGuidelinesProps {
  guidelines: string[];
}

export function ActionGuidelines({ guidelines }: ActionGuidelinesProps) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold/10">
            <Compass className="h-4 w-4 text-brand-gold" />
          </div>
          <CardTitle className="font-heading text-base text-brand-gold">
            行動指針
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {guidelines.map((guideline, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.2,
                delay: i * 0.05,
              }}
              className="flex items-start gap-3"
            >
              {/* Number indicator */}
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-xs font-bold text-brand-gold">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground pt-0.5">
                {guideline}
              </span>
            </motion.li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
