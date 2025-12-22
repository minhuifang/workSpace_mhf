const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.join(__dirname, 'src');
const files = fs.readdirSync(srcDir).filter(file => file.endsWith('.js'));

console.log('========================================');
console.log('开始测试所有文件');
console.log('========================================\n');

files.forEach((file, index) => {
  const filePath = path.join(srcDir, file);
  console.log(`\n[${index + 1}/${files.length}] 测试文件: ${file}`);
  console.log('----------------------------------------');
  
  try {
    execSync(`node "${filePath}"`, { 
      stdio: 'inherit',
      encoding: 'utf-8'
    });
  } catch (error) {
    console.error(`❌ 执行出错: ${error.message}`);
  }
  
  console.log('----------------------------------------');
});

console.log('\n========================================');
console.log('所有测试完成！');
console.log('========================================');
