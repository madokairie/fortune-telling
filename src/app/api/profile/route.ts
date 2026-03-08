/**
 * GET /api/profile
 *
 * 基本性質データ取得エンドポイント
 * 命盤データから構造化された静的データを返す（AI呼び出し不要）
 */

import { NextResponse } from 'next/server';

/** プロフィールレスポンスの型 */
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
    meiKyu: {
      palace: string;
      stars: string[];
    };
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

/**
 * 命盤データに基づく静的プロフィールデータ
 * meiban-core.md の内容を構造化
 */
const PROFILE_DATA: ProfileResponse = {
  basicInfo: {
    name: '入江 円香（いりえ まどか）',
    birthDate: '1981年10月19日 23:45',
    lunarDate: '辛酉年九月廿三日 子時',
    gender: '女',
    yinYang: '陰女',
    fiveElementBureau: '木三局',
    meiShu: '禄存',
    shinShu: '天同',
    meiKyu: {
      palace: '戌',
      stars: ['文曲', '天機'],
    },
    age: 44,
    family: 'バツイチ独身、子供なし',
  },
  businesses: [
    {
      name: '株式会社エムクリエイト',
      description: 'SNSオンラインコンテンツ販売支援コンサル・講座運営',
      role: '代表',
    },
    {
      name: 'JYビー協会',
      description: '陰陽五行美容ベースの体質改善サポート',
      role: '代表',
    },
  ],
  traits: [
    {
      icon: 'Zap',
      title: 'プロフェッショナル気質',
      description:
        '曖昧にしない。確実にやりこなす。七殺星の影響で、仕事においては徹底的に追求するタイプです。1匹狼型で、なんとなく曖昧な環境には耐えられません。',
      relatedStar: '七殺（七さん）',
    },
    {
      icon: 'Flame',
      title: '精神力の強さ',
      description:
        'ボクシング・格闘技の星を持ち、何があっても立ち上がる力がある。男性性8〜9割の命盤で、基本が極めて強い。問題があった時に立ち上がる力が際立っています。',
      relatedStar: '形容',
    },
    {
      icon: 'Wind',
      title: '自由な魂',
      description:
        '貪狼星の影響で変化を求める。縛られるのが苦手。波乱万丈が活きる命盤で、変化がない人生では生きていけないタイプです。何でもできる超モテ星でもあります。',
      relatedStar: '貪狼（ドロさん）',
    },
    {
      icon: 'Eye',
      title: '直感力',
      description:
        'センサーが鋭い。やばい人を見抜く力を持つ。スピリチュアル能力もあり、接していく中で「なんか変だな」と感じた人は本当に問題を起こすことが多い。',
      relatedStar: '貪狼（ドロさん）',
    },
    {
      icon: 'Crown',
      title: '上品な外見と内なる強さ',
      description:
        '外に出た姿は紫微府の影響で優しく穏やかで上品。一見綺麗で美しい人に見られるが、実際はめちゃくちゃ強い。ずっと付き合うと「この人強い」と気づかれるタイプ。',
      relatedStar: '紫微府（しびてんぷ）',
    },
    {
      icon: 'TrendingUp',
      title: '仕事が財をもたらす',
      description:
        '破軍星の影響で、仕事をすればするほど財がもたらされる命盤。喋れば喋るほど財が入る性質も持っています。',
      relatedStar: '破軍（はぐんさん）',
    },
  ],
  currentDaigen: {
    ageRange: '42〜51歳',
    theme: '飛躍と拡大',
    description:
      '仲間と力のある人たちがわっと集まり、そこから飛躍していく時期。新しいことを始めることで仕事が拡大する展開点入り。',
    details: [
      '仲間と力のある人たちが集まってくる',
      '新しいことを始めることで仕事が拡大',
      '特に42〜46歳まで天閲（展開点）が入っている',
      '財運: 入ってくるが契約書・書類関係に要注意',
      '人間関係: 足を引っ張られる可能性あり → 直感を信じて距離を置く',
      '弁護士など書類関係の専門家を味方につけると安心',
    ],
  },
  yearFortune: {
    year: 2026,
    highlights: [
      '結婚の星が入る＋超モテる星も入る',
      'パートナー候補: 仕事する人、海外関係、お金持ち',
      'プライベート運がすごくいい → プライベートに力を入れると運が開く',
      '長期の星入り → 頑張り時',
      '体力もある、人から助けられる、自分も頑張れる',
      '新しい何かが始まる可能性（会社設立、海外展開など）',
      '2024〜2026年がすごく強い3年間 — 形を作る時期',
    ],
    cautions: [
      '契約書関係に要注意（2025年からの流れ）',
      '人間関係の足引っ張りに注意',
      '卯の月日が注意日（特に2月は辛卯月）',
    ],
  },
  partnership: {
    overview:
      '51歳までに結婚したいと思う人が近づいてくる可能性が高い。いい人と結婚する星で、お金持ちの人と縁がある。',
    details: [
      '結婚相手: 会社をやっている or 企業に勤めている人',
      'お金持ちの人と結婚するとなっている',
      '課題: 外に出ないとモテ星が活きない',
      '4割の女性性を出すことが大切',
      '母性の高い女性のそばにいること',
      '男性がキーパーソン（仕事でもプライベートでも）',
      '年上（5歳以上）の人、先生・師匠から助けられる',
      'アガスティアの葉: 46で再婚',
    ],
  },
  health: {
    overview: '基本は強い。無理してもかなり大丈夫な命盤。',
    cautions: [
      '腎臓に注意（神様からのメッセージ）',
      '癌の可能性の星あり（家系的にもあり）→ 食事に気をつけていれば問題なし',
      '外食・飲み会が増えると体調崩しやすい',
      'お酒飲んだらダメな星（飲めなくて正解）',
      '熱中すると食事を忘れる傾向 → 規則的な食事を心がける',
    ],
  },
  overseas: {
    overview: '海外との縁が強く、外に出れば出るほど吉。',
    details: [
      '住む: フランス方面が向いている',
      'ビジネス: アジアが向いている',
      'アメリカも悪くないがフランス系（イギリスなど）のほうが合う',
    ],
  },
  actionGuidelines: [
    '前に前に進む → 道がどんどん開ける',
    '手を伸ばされたら確実に掴み取る → 上に上がっていく',
    '人を頼る → 特に大変な時は頼ること。滅多に頼らないから、その時すごい勢いで助けてもらえる',
    '直感を信じる → やばいと思った人は本当にやばい',
    '火の玉は体内に → 嫌いな人に投げつけず、情熱として変換する',
    '外に出る → モテ星が活きる。止まると自分を見失う',
    '4割の女性性を出す → 母性の高い女性のそばにいる。鎧を半分脱ぐ',
    '契約書を徹底する → 弁護士等の専門家を味方に',
    'プライベートにも力を入れる → 2026年はプライベート運がいい',
    '信頼できる右腕を育てる → 自分のためにもなる',
  ],
};

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(PROFILE_DATA, {
    headers: {
      // 静的データなので長期キャッシュ
      'Cache-Control': 'public, s-maxage=2592000, max-age=86400, stale-while-revalidate=2592000',
    },
  });
}
