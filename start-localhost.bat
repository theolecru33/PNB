@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo  Pin Bouteille - Serveur local
echo ========================================
echo.
echo Site dispo sur : http://localhost:8261
echo.
echo (Ctrl+C pour arreter)
echo.
start "" http://localhost:8261
php -S localhost:8261
