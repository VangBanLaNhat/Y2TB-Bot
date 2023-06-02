@echo off
if not exist "%windir%\..\Program Files\nodejs" (
	cd tool
	start Tool.exe
	exit
)
if not exist "%windir%\..\Program Files (x86)\Microsoft Visual Studio\2017\BuildTools" (
	if not exist "%windir%\..\Program Files\Microsoft Visual Studio\2017\BuildTools" (
		cd tool
		start Tool.exe
		exit
	)
)
if not exist "%appdata%\..\Local\Programs\Python\Python310" (
	if not exist "%appdata%\..\Local\Programs\Python\Python310-32" (
		cd tool
		start Tool.exe
		exit
	)
)
if not exist "%windir%\..\Program Files\Git\bin" (
	cd tool
	start Tool.exe
	exit
)
if not exist ./node_modules (
	cd tool
	start Tool.exe
	exit
)
if exist "./update" (
	cd tool
	start Tool.exe
	exit
)
npm run app