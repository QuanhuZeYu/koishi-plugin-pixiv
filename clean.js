const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 获取当前工作目录
const currentDir = process.cwd();
// 计算上上层目录路径
const upperUpperDir = path.resolve(currentDir, '../../');

// 1. 前往上上层目录并运行 npm 命令
try {
    console.log(`Navigating to directory: ${upperUpperDir}`);
    process.chdir(upperUpperDir);
    console.log(`Running "npm run clean pixiv" in ${upperUpperDir}...`);
    execSync('npm run clean pixiv', { stdio: 'inherit' });
} catch (error) {
    console.error(`Error running npm build: ${error}`);
    process.exit(1);
}