@echo off
:: Pide la descripción del commit
set /p commitMessage=Ingrese la descripción del commit:

:: Mostrar lo que se hará
echo.
echo ------------------------------
echo Agregando archivos...
echo ------------------------------
git add .

echo.
echo ------------------------------
echo Creando commit...
echo ------------------------------
git commit -m "%commitMessage%"

echo.
echo ------------------------------
echo Haciendo push a GitHub...
echo ------------------------------
git push origin main

pause
