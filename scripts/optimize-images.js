#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * 画像最適化スクリプト
 * PNG, JPG画像をWebP形式に変換し、ファイルサイズを削減
 */
async function optimizeImages() {
  const publicDir = path.join(__dirname, '../public');
  const files = await fs.readdir(publicDir);
  
  console.log('🎨 画像最適化を開始します...\n');
  
  for (const file of files) {
    const filePath = path.join(publicDir, file);
    const ext = path.extname(file).toLowerCase();
    
    // 画像ファイルのみ処理
    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      try {
        const stats = await fs.stat(filePath);
        const originalSize = stats.size;
        
        console.log(`📸 処理中: ${file} (${(originalSize / 1024).toFixed(1)}KB)`);
        
        // WebPファイル名を生成
        const webpFileName = file.replace(/\.(png|jpe?g)$/i, '.webp');
        const webpPath = path.join(publicDir, webpFileName);
        
        // WebP変換（高品質、80%品質）
        await sharp(filePath)
          .webp({ quality: 80, effort: 6 })
          .toFile(webpPath);
        
        const webpStats = await fs.stat(webpPath);
        const webpSize = webpStats.size;
        const reduction = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
        
        console.log(`  ✅ ${webpFileName} 作成完了 (${(webpSize / 1024).toFixed(1)}KB, ${reduction}% 削減)\n`);
        
        // 元のPNG/JPGを圧縮（品質を維持しつつサイズ削減）
        if (ext === '.png') {
          await sharp(filePath)
            .png({ quality: 85, compressionLevel: 8 })
            .toFile(filePath + '.tmp');
        } else {
          await sharp(filePath)
            .jpeg({ quality: 85, progressive: true })
            .toFile(filePath + '.tmp');
        }
        
        // 一時ファイルで元ファイルを置き換え
        await fs.rename(filePath + '.tmp', filePath);
        
        const compressedStats = await fs.stat(filePath);
        const compressedSize = compressedStats.size;
        const originalReduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        
        console.log(`  📦 ${file} 圧縮完了 (${(compressedSize / 1024).toFixed(1)}KB, ${originalReduction}% 削減)\n`);
        
      } catch (error) {
        console.error(`❌ ${file} の処理でエラー:`, error.message);
      }
    }
  }
  
  console.log('🎉 画像最適化が完了しました！');
  console.log('\n💡 Tips:');
  console.log('- 新しく生成されたWebPファイルを優先的に使用してください');
  console.log('- Next.jsのImageコンポーネントは自動的に最適な形式を選択します');
}

// スクリプト実行
if (require.main === module) {
  optimizeImages().catch(console.error);
}

module.exports = { optimizeImages }; 