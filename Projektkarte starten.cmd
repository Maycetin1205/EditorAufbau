@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
title Projektkarte - automatischer Aktualisierer
echo Die Projektkarte wird gestartet und im Browser geöffnet.
echo Dieses Fenster offen lassen, damit die Karte aktuell bleibt.
echo Zum Beenden dieses Fenster schließen oder Strg+C drücken.
echo.
npm run docs:map:open
if errorlevel 1 (
  echo.
  echo Die Projektkarte konnte nicht gestartet werden.
  pause
)
