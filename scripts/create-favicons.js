#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs').promises;

async function createFavicons() {
  const inputPath = './public/coading_the_road_logo.png';
  
  console.log('🎨 ロゴをWebPに変換とfavicon生成中...');
  
  try {
    // WebP版の作成（高品質）
    await sharp(inputPath)
      .webp({ quality: 90, effort: 6 })
      .toFile('./public/logo.webp');
    
    console.log('✅ logo.webp 作成完了');
    
    // favicon.ico (32x32) の作成
    await sharp(inputPath)
      .resize(32, 32, { 
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile('./public/favicon.ico');
    
    console.log('✅ favicon.ico 作成完了');
    
    // apple-touch-icon.png (180x180) の作成
    await sharp(inputPath)
      .resize(180, 180, { 
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile('./public/apple-touch-icon.png');
    
    console.log('✅ apple-touch-icon.png 作成完了');
    
    // icon.png (192x192) PWA用
    await sharp(inputPath)
      .resize(192, 192, { 
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile('./public/icon-192.png');
    
    console.log('✅ icon-192.png 作成完了');
    
    // icon.png (512x512) PWA用
    await sharp(inputPath)
      .resize(512, 512, { 
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile('./public/icon-512.png');
    
    console.log('✅ icon-512.png 作成完了');
    
    // 統計情報を表示
    const originalStats = await fs.stat(inputPath);
    const webpStats = await fs.stat('./public/logo.webp');
    
    console.log('\n📊 結果:');
    console.log(`元ファイル: ${(originalStats.size / 1024).toFixed(1)}KB`);
    console.log(`WebP版: ${(webpStats.size / 1024).toFixed(1)}KB`);
    console.log(`削減率: ${((originalStats.size - webpStats.size) / originalStats.size * 100).toFixed(1)}%`);
    
    console.log('\n🎉 favicon生成完了！');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

// スクリプト実行
if (require.main === module) {
  createFavicons().catch(console.error);
}

module.exports = { createFavicons }; 