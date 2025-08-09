@echo off
echo Building frontend for production...
echo.

REM Set production environment variables for the build
set VITE_API_URL=https://incentum.ai
set NODE_ENV=production

echo Environment variables set:
echo VITE_API_URL=%VITE_API_URL%
echo NODE_ENV=%NODE_ENV%
echo.

REM Clean previous build
if exist dist rmdir /s /q dist

REM Build the frontend
echo Running npm build...
npm run build

echo.
echo Build complete! The dist folder is ready for deployment.
echo.
echo IMPORTANT: Deploy the dist folder to your VPS at https://incentum.ai
echo Make sure your backend is running at https://incentum.ai:8080
echo.
pause
