@echo off
echo ========================================
echo   東京語文学院 - Setup Script
echo ========================================
echo.

echo [1/4] Checking XAMPP installation...
if not exist "C:\xampp\xampp-control.exe" (
    echo ERROR: XAMPP not found in C:\xampp\
    echo Please install XAMPP first: https://www.apachefriends.org/
    pause
    exit /b 1
)

echo [2/4] Copying project to htdocs...
if not exist "C:\xampp\htdocs\tttn" (
    mkdir "C:\xampp\htdocs\tttn"
)
xcopy /E /I /Y "%~dp0*" "C:\xampp\htdocs\tttn\"

echo [3/4] Starting XAMPP services...
cd /d "C:\xampp"
xampp-control.exe

echo [4/4] Opening website...
timeout /t 5 /nobreak >nul
start http://localhost/tttn/frontend/

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. In XAMPP Control Panel, start Apache and MySQL
echo 2. Open phpMyAdmin: http://localhost/phpmyadmin
echo 3. Create database 'japanese_school'
echo 4. Import backend/sql/database.sql
echo 5. Website will be available at: http://localhost/tttn/frontend/
echo.
pause 