@echo off
echo ========================================
echo   Remove Demo Users
echo ========================================
echo.
echo This will permanently remove all demo users from the database.
echo.
echo WARNING: This action cannot be undone!
echo.
pause

cd backend
echo Removing demo users...
npm run remove-demo-users

echo.
echo Demo users removed!
pause