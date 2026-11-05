@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo 没找到 Node.js。请先安装 https://nodejs.org 的 LTS 版本，再双击这个文件。
  pause
  exit /b
)
node serve.js
pause
