export default function SettingsPage() {
  return (
    <div className="flex flex-col px-6 py-8 lg:py-12">
      <h1 className="text-2xl font-bold tracking-tight">設定</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        アプリの設定を管理します
      </p>

      <div className="mt-8 space-y-4">
        {/* Profile section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-medium">プロフィール</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            生年月日・出生時間・性別の設定
          </p>
        </div>

        {/* Theme section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-medium">テーマ</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            ダーク / ライトモードの切り替え
          </p>
        </div>

        {/* Data section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-medium">データ管理</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            データのエクスポート・インポート
          </p>
        </div>
      </div>
    </div>
  );
}
