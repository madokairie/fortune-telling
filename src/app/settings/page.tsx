'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Trash2,
  Upload,
  FileText,
  Plus,
  Check,
  Database,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// ============================================================
// Knowledge file type
// ============================================================

interface KnowledgeFile {
  name: string;
  size: number;
  lineCount: number;
  updatedAt: string;
  isCore: boolean;
}

// ============================================================
// Settings Page
// ============================================================

export default function SettingsPage() {
  // --- Knowledge state ---
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [uploadMode, setUploadMode] = useState<'none' | 'file' | 'text'>('none');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  // --- Cache state ---
  const [cacheCount, setCacheCount] = useState(0);
  const [conversationCount, setConversationCount] = useState(0);
  const [isClearing, setIsClearing] = useState(false);
  const [clearMessage, setClearMessage] = useState('');

  // --- Fetch knowledge files ---
  const fetchKnowledgeFiles = useCallback(async () => {
    setIsLoadingFiles(true);
    try {
      const res = await fetch('/api/knowledge');
      if (res.ok) {
        const data = await res.json();
        setKnowledgeFiles(data.files);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  // --- Fetch cache counts ---
  const fetchCounts = useCallback(async () => {
    try {
      const [caches, convos] = await Promise.all([
        db.dailyAdviceCache.count(),
        db.conversations.count(),
      ]);
      setCacheCount(caches);
      setConversationCount(convos);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchKnowledgeFiles();
    fetchCounts();
  }, [fetchKnowledgeFiles, fetchCounts]);

  // --- Upload handler ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/knowledge', { method: 'POST', body: formData });
      const data = await res.json();

      if (res.ok) {
        setUploadMessage(data.message);
        setUploadMode('none');
        fetchKnowledgeFiles();
      } else {
        setUploadMessage(data.error || 'アップロード失敗');
      }
    } catch {
      setUploadMessage('アップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsUploading(true);
    setUploadMessage('');
    try {
      const formData = new FormData();
      formData.append('title', newTitle.trim());
      formData.append('content', newContent.trim());

      const res = await fetch('/api/knowledge', { method: 'POST', body: formData });
      const data = await res.json();

      if (res.ok) {
        setUploadMessage(data.message);
        setUploadMode('none');
        setNewTitle('');
        setNewContent('');
        fetchKnowledgeFiles();
      } else {
        setUploadMessage(data.error || '追加失敗');
      }
    } catch {
      setUploadMessage('追加に失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  // --- Clear cache ---
  const clearAdviceCache = async () => {
    setIsClearing(true);
    setClearMessage('');
    try {
      await db.dailyAdviceCache.clear();
      setCacheCount(0);
      setClearMessage('アドバイスキャッシュをクリアしました');
    } catch {
      setClearMessage('クリアに失敗しました');
    } finally {
      setIsClearing(false);
    }
  };

  const clearAllData = async () => {
    if (!confirm('すべての会話履歴とキャッシュを削除しますか？')) return;

    setIsClearing(true);
    setClearMessage('');
    try {
      await Promise.all([
        db.conversations.clear(),
        db.messages.clear(),
        db.dailyAdviceCache.clear(),
        db.bookmarks.clear(),
      ]);
      setCacheCount(0);
      setConversationCount(0);
      setClearMessage('すべてのデータを削除しました');
    } catch {
      setClearMessage('削除に失敗しました');
    } finally {
      setIsClearing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-8 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="font-heading text-2xl font-bold tracking-tight">設定</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ナレッジ管理・データ管理
        </p>
      </motion.div>

      <div className="mt-6 space-y-6">
        {/* ============================================================ */}
        {/* ナレッジ管理 */}
        {/* ============================================================ */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-heading text-sm font-medium text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              鑑定ナレッジ
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchKnowledgeFiles}
              className="h-7 gap-1 px-2 text-xs"
            >
              <RefreshCw className="h-3 w-3" />
              更新
            </Button>
          </div>

          {/* ファイル一覧 */}
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {isLoadingFiles ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  読み込み中...
                </div>
              ) : knowledgeFiles.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  ナレッジファイルがありません
                </div>
              ) : (
                knowledgeFiles.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {file.name}
                        {file.isCore && (
                          <span className="ml-2 rounded bg-brand-gold/20 px-1.5 py-0.5 text-[10px] text-brand-gold">
                            コア
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(file.size)} · {file.lineCount}行 ·{' '}
                        {new Date(file.updatedAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* 追加ボタン */}
          {uploadMode === 'none' && (
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUploadMode('file')}
                className="gap-1.5 text-xs"
              >
                <Upload className="h-3.5 w-3.5" />
                ファイルをアップロード
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUploadMode('text')}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                テキストで追加
              </Button>
            </div>
          )}

          {/* ファイルアップロードUI */}
          {uploadMode === 'file' && (
            <Card className="mt-3">
              <CardContent className="space-y-3 p-4">
                <p className="text-sm font-medium">ファイルアップロード</p>
                <p className="text-xs text-muted-foreground">
                  新しい鑑定結果やデータを .txt / .md 形式でアップロード
                </p>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-brand-gold/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-gold"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadMode('none')}
                  className="text-xs"
                >
                  キャンセル
                </Button>
              </CardContent>
            </Card>
          )}

          {/* テキスト入力UI */}
          {uploadMode === 'text' && (
            <Card className="mt-3">
              <CardContent className="space-y-3 p-4">
                <p className="text-sm font-medium">鑑定メモを追加</p>
                <p className="text-xs text-muted-foreground">
                  鑑定で言われた内容をそのままメモとして追加できます
                </p>
                <input
                  type="text"
                  placeholder="タイトル（例: 2026年3月 追加鑑定）"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
                />
                <textarea
                  placeholder="鑑定内容をここに入力..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={6}
                  className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleTextSubmit}
                    disabled={isUploading || !newTitle.trim() || !newContent.trim()}
                    className="gap-1.5 bg-brand-gold text-brand-indigo hover:bg-brand-gold/90"
                  >
                    <Check className="h-3.5 w-3.5" />
                    追加
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadMode('none');
                      setNewTitle('');
                      setNewContent('');
                    }}
                    className="text-xs"
                  >
                    キャンセル
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* アップロードメッセージ */}
          {uploadMessage && (
            <p className="mt-2 text-xs text-brand-gold">{uploadMessage}</p>
          )}
        </motion.section>

        {/* ============================================================ */}
        {/* データ管理 */}
        {/* ============================================================ */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <h2 className="mb-3 flex items-center gap-2 font-heading text-sm font-medium text-muted-foreground">
            <Database className="h-4 w-4" />
            データ管理
          </h2>

          <Card>
            <CardContent className="divide-y divide-border p-0">
              {/* キャッシュ情報 */}
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">アドバイスキャッシュ</p>
                  <p className="text-xs text-muted-foreground">
                    {cacheCount}日分のキャッシュ
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAdviceCache}
                  disabled={isClearing || cacheCount === 0}
                  className="gap-1.5 text-xs"
                >
                  <RefreshCw className="h-3 w-3" />
                  クリア
                </Button>
              </div>

              {/* 会話履歴 */}
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">会話履歴</p>
                  <p className="text-xs text-muted-foreground">
                    {conversationCount}件の会話
                  </p>
                </div>
              </div>

              {/* 全削除 */}
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-red-600">全データ削除</p>
                  <p className="text-xs text-muted-foreground">
                    会話履歴・キャッシュをすべて削除
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllData}
                  disabled={isClearing}
                  className="gap-1.5 border-red-200 text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                  削除
                </Button>
              </div>
            </CardContent>
          </Card>

          {clearMessage && (
            <p className="mt-2 text-xs text-brand-gold">{clearMessage}</p>
          )}
        </motion.section>

        {/* ============================================================ */}
        {/* アプリ情報 */}
        {/* ============================================================ */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
        >
          <Card>
            <CardContent className="px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Fortune Telling v0.1.0 · 紫微斗数パーソナルアプリ · 円香さん専用
              </p>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
