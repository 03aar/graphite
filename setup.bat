@echo off
echo.
echo ========================================
echo   LeafIt Setup - Windows
echo ========================================
echo.

echo [1/5] Installing dependencies...
call pnpm install
if errorlevel 1 goto error

echo.
echo [2/5] Building shared packages...
cd packages\shared
call pnpm build
cd ..\..

cd packages\ui
call pnpm build
cd ..\..

echo.
echo [3/5] Generating Prisma client...
cd apps\web
call pnpm prisma generate

echo.
echo [4/5] Creating database...
call pnpm prisma db push

echo.
echo [5/5] Seeding database with demo data...
call pnpm prisma db seed

cd ..\..

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To start the app, run:
echo   pnpm dev
echo.
echo Then open: http://localhost:3000
echo.
pause
goto end

:error
echo.
echo ========================================
echo   Setup Failed!
echo ========================================
echo.
echo Please check the error above.
pause

:end
