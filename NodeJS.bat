@echo off
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1')); choco upgrade -y nodejs-lts
cls
if not exist %windir%\..\"Program Files (x86)"\"Microsoft Visual Studio" (
start WiBuildTool.bat
)else start VBLN.exe