@echo off
if not exist %windir%\..\"Program Files"\nodejs (
start NodeJS.bat
)else (
if not exist %windir%\..\"Program Files (x86)"\"Microsoft Visual Studio" (
start WiBuildTool.bat
)else npm run app
)