@echo off
echo ========================================
echo   Password Hashing Migration
echo ========================================
echo.
echo This will hash all existing plain text passwords in the database.
echo.
pause

cd backend
echo Running password migration...
npm run hash-passwords

echo.
echo Migration completed!
pause