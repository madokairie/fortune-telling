/**
 * POST /api/knowledge
 * 新しい鑑定データをナレッジに追加する
 *
 * GET /api/knowledge
 * 現在のナレッジファイル一覧を返す
 */

import { NextRequest, NextResponse } from 'next/server';
import { readdir, writeFile, readFile, stat } from 'fs/promises';
import { join } from 'path';

const KNOWLEDGE_DIR = join(process.cwd(), 'data', 'knowledge');

export async function GET(): Promise<NextResponse> {
  try {
    const files = await readdir(KNOWLEDGE_DIR);
    const knowledgeFiles = [];

    for (const file of files) {
      if (file.startsWith('.')) continue;
      const filePath = join(KNOWLEDGE_DIR, file);
      const fileStat = await stat(filePath);
      const content = await readFile(filePath, 'utf-8').catch(() => '');
      const lineCount = content.split('\n').length;

      knowledgeFiles.push({
        name: file,
        size: fileStat.size,
        lineCount,
        updatedAt: fileStat.mtime.toISOString(),
        isCore: file === 'meiban-core.md',
      });
    }

    return NextResponse.json({ files: knowledgeFiles });
  } catch (error) {
    console.error('[knowledge] Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list knowledge files' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const content = formData.get('content') as string | null;

    // テキスト直接入力の場合
    if (content && title) {
      const filename = `${title.replace(/[^\w\u3000-\u9fff-]/g, '_')}.md`;
      const filePath = join(KNOWLEDGE_DIR, filename);

      const header = `# ${title}\n\n> 追加日: ${new Date().toISOString()}\n\n`;
      await writeFile(filePath, header + content, 'utf-8');

      return NextResponse.json({
        success: true,
        filename,
        message: `ナレッジ「${title}」を追加しました`,
      });
    }

    // ファイルアップロードの場合
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      let textContent: string;

      if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        textContent = buffer.toString('utf-8');
      } else {
        return NextResponse.json(
          { error: '対応形式: .txt, .md のみ' },
          { status: 400 }
        );
      }

      const filename = file.name.replace(/[^\w\u3000-\u9fff.-]/g, '_');
      const filePath = join(KNOWLEDGE_DIR, filename);
      await writeFile(filePath, textContent, 'utf-8');

      return NextResponse.json({
        success: true,
        filename,
        message: `ファイル「${filename}」をアップロードしました`,
      });
    }

    return NextResponse.json(
      { error: 'ファイルまたはテキストが必要です' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[knowledge] Upload error:', error);
    return NextResponse.json(
      { error: 'ナレッジの追加に失敗しました' },
      { status: 500 }
    );
  }
}
