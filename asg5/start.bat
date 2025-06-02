@echo off
echo 正在启动 Three.js 3D 场景项目...
echo 请确保已经安装了 Node.js 和 npm

:: 检查是否安装了依赖
if not exist "node_modules" (
    echo 正在安装项目依赖...
    call npm install
)

:: 启动开发服务器
echo 正在启动开发服务器...
call npm run dev

:: 如果服务器意外关闭，等待用户按键
pause 