"use client";

import { useEffect, useState } from "react";
import { MeibanSummary } from "@/components/profile/meiban-summary";
import { TraitCard } from "@/components/profile/trait-card";
import { FortunePeriod } from "@/components/profile/fortune-period";
import { ActionGuidelines } from "@/components/profile/action-guidelines";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

interface ProfileResponse {
  basicInfo: {
    name: string;
    birthDate: string;
    lunarDate: string;
    gender: string;
    yinYang: string;
    fiveElementBureau: string;
    meiShu: string;
    shinShu: string;
    meiKyu: { palace: string; stars: string[] };
    age: number;
    family: string;
  };
  businesses: Array<{
    name: string;
    description: string;
    role: string;
  }>;
  traits: Array<{
    icon: string;
    title: string;
    description: string;
    relatedStar: string;
  }>;
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
  partnership: {
    overview: string;
    details: string[];
  };
  health: {
    overview: string;
    cautions: string[];
  };
  overseas: {
    overview: string;
    details: string[];
  };
  actionGuidelines: string[];
}

/** Category trait cards derived from API data beyond the base traits */
const CATEGORY_TRAITS = [
  {
    icon: "Briefcase",
    title: "事業適性",
    description:
      "プロフェッショナル気質で1匹狼型。曖昧にせず確実にやりこなす。喋れば喋るほど財が入る性質を持ち、仕事をすればするほど財がもたらされる命盤。",
    relatedStar: "七殺・破軍",
    quote:
      "仕事においては徹底的に追求するタイプ。なんとなく曖昧な環境には耐えられません。",
  },
  {
    icon: "Users",
    title: "対人関係",
    description:
      "直感・センサーが鋭く、やばい人を見抜く力を持つ。外に出た姿は上品で穏やか。ずっと付き合うと「この人強い」と気づかれるギャップが特徴。",
    relatedStar: "紫微府・貪狼",
    quote:
      "8割自分でなんとかしなければと思う命盤。でも2割は甘えることができる。",
  },
  {
    icon: "Heart",
    title: "パートナーシップ",
    description:
      "超モテ星ナンバーワンの貪狼星を持つ。自由な星で、外に出ることがモテ星を活かす鍵。51歳までに結婚したいと思う人が近づいてくる可能性が高い。",
    relatedStar: "貪狼（ドロさん）",
    quote:
      "4割の女性性を出すことが大切。母性の高い女性のそばにいること。鎧を半分脱ぐ。",
  },
  {
    icon: "Shield",
    title: "健康",
    description:
      "基本は強く、無理してもかなり大丈夫な命盤。ただし腎臓に注意が必要。外食・飲み会が増えると体調を崩しやすく、規則的な食事を心がけること。",
    relatedStar: "命盤全体",
    quote: "腎臓に注意（神様からのメッセージ）。お酒飲んだらダメな星。",
  },
  {
    icon: "Globe",
    title: "海外運",
    description:
      "海外との縁が強く、外に出れば出るほど吉。住むならフランス方面、ビジネスならアジアが向いている。止まると自分を見失うので、海外に行くと元に戻る。",
    relatedStar: "命盤全体",
    quote:
      "アメリカも悪くないがフランス系（イギリスなど）のほうが合う。",
  },
];

export default function ProfilePage() {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to fetch profile data");
        const json: ProfileResponse = await res.json();
        setData(json);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "データの取得に失敗しました"
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col px-4 py-8 lg:px-6 lg:py-12">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          基本性質
        </h1>
        <div className="mt-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col px-4 py-8 lg:px-6 lg:py-12">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          基本性質
        </h1>
        <div className="mt-6 rounded-xl border border-destructive/30 bg-card p-6">
          <p className="text-sm text-destructive">
            {error ?? "データの取得に失敗しました"}
          </p>
        </div>
      </div>
    );
  }

  const mainStars = [
    { name: "貪狼", relatedStar: "貪狼（ドロさん）" },
    { name: "七殺", relatedStar: "七殺（七さん）" },
    { name: "紫微府", relatedStar: "紫微府（しびてんぷ）" },
    { name: "破軍", relatedStar: "破軍（はぐんさん）" },
    { name: "形容", relatedStar: "形容" },
  ];

  return (
    <div className="flex flex-col px-4 py-8 pb-24 lg:px-6 lg:py-12">
      {/* Header */}
      <h1 className="font-heading text-2xl font-bold tracking-tight lg:text-3xl">
        基本性質
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        紫微斗数に基づく命盤と性質
      </p>

      {/* Content */}
      <div className="mt-6 space-y-6">
        {/* Section 1: Meiban Summary */}
        <MeibanSummary basicInfo={data.basicInfo} mainStars={mainStars} />

        {/* Section 2: Character Traits from API */}
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-brand-gold">
            性格特性
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {data.traits.map((trait) => (
              <TraitCard
                key={trait.title}
                icon={trait.icon}
                title={trait.title}
                description={trait.description}
                relatedStar={trait.relatedStar}
              />
            ))}
          </div>
        </section>

        {/* Section 3: Category Traits (Business, Relationships, etc.) */}
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-brand-gold">
            性質カテゴリ
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {CATEGORY_TRAITS.map((trait) => (
              <TraitCard
                key={trait.title}
                icon={trait.icon}
                title={trait.title}
                description={trait.description}
                relatedStar={trait.relatedStar}
                quote={trait.quote}
              />
            ))}
          </div>
        </section>

        {/* Section 4: Current Daigen & Year Fortune */}
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-brand-gold">
            運勢の流れ
          </h2>
          <FortunePeriod
            currentDaigen={data.currentDaigen}
            yearFortune={data.yearFortune}
          />
        </section>

        {/* Section 5: Action Guidelines */}
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-brand-gold">
            プロ鑑定からの行動指針
          </h2>
          <ActionGuidelines guidelines={data.actionGuidelines} />
        </section>

        {/* CTA: Consult AI */}
        <Link
          href="/chat"
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-6 py-3.5 text-sm font-bold text-brand-indigo transition-opacity hover:opacity-90 active:opacity-80"
        >
          <MessageCircle className="h-4 w-4" />
          この性質についてAIに相談する
        </Link>
      </div>
    </div>
  );
}
