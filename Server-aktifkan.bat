@echo off
cd /d "%~dp0"
echo Server berjalan di http://localhost:8000/ (tutup jendela ini untuk berhenti)
start "" http://localhost:8000/
python -m http.server 8000 || npx --yes serve -l 8000 .
