@echo off

node --version >nul 2>&1
if %errorlevel% neq 0 (
    goto RunTool
)

py --version >nul 2>&1
if %errorlevel% neq 0 (
    goto RunTool
)

where git >nul 2>&1
if %errorlevel% neq 0 (
    goto RunTool
)

if not exist "%windir%\..\Program Files (x86)\Microsoft Visual Studio\2017\BuildTools" (
    if not exist "%windir%\..\Program Files\Microsoft Visual Studio\2017\BuildTools" (
        goto RunTool
    )
)

if not exist ./node_modules (
    goto RunTool
)

if exist "./data/update.json" (
    goto RunTool
)

npm run app
exit

:RunTool
set "bat_file=./tool/Tool.exe"
cd /d "%~dp0"
powershell -Command "Start-Process -Verb RunAs '%bat_file%'"
exit
