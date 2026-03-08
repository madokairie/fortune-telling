"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sparkles, Star } from "lucide-react";

interface MeibanSummaryProps {
  basicInfo: {
    name: string;
    birthDate: string;
    lunarDate: string;
    gender: string;
    yinYang: string;
    fiveElementBureau: string;
    meiShu: string;
    shinShu: string;
    meiKyu: {
      palace: string;
      stars: string[];
    };
    age: number;
    family: string;
  };
  mainStars: Array<{
    name: string;
    relatedStar: string;
  }>;
}

export function MeibanSummary({ basicInfo, mainStars }: MeibanSummaryProps) {
  return (
    <Card className="border-brand-gold/20 bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold/10">
            <Star className="h-4 w-4 text-brand-gold" />
          </div>
          <CardTitle className="font-heading text-lg text-brand-gold">
            命盤サマリー
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name & Birth */}
        <div className="space-y-1.5">
          <p className="font-heading text-xl font-bold tracking-tight">
            {basicInfo.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {basicInfo.birthDate}
          </p>
          <p className="text-xs text-muted-foreground">
            {basicInfo.lunarDate}
          </p>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <InfoItem label="五行局" value={basicInfo.fiveElementBureau} />
          <InfoItem label="命主" value={basicInfo.meiShu} />
          <InfoItem label="身主" value={basicInfo.shinShu} />
          <InfoItem
            label="命宮"
            value={`${basicInfo.meiKyu.palace}（${basicInfo.meiKyu.stars.join("・")}）`}
          />
        </div>

        {/* Main Stars */}
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            主星
          </p>
          <div className="flex flex-wrap gap-1.5">
            {mainStars.map((star) => (
              <Badge
                key={star.name}
                className="bg-brand-gold/15 text-brand-gold border-brand-gold/30"
              >
                {star.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-medium")}>{value}</p>
    </div>
  );
}
