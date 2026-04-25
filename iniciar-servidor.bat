@echo off
title InvGas - Servidor
echo.
echo  ==========================================
echo   InvGas - Inventario Gasolinera
echo  ==========================================
echo.
echo  Iniciando servidor en http://localhost:3000
echo  Presiona Ctrl+C para detener.
echo.

set PATH=C:\Program Files\nodejs\;%PATH%
cd /d "%~dp0"
node node_modules\next\dist\bin\next dev

pause
