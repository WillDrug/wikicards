npm run build --prefix wikiweb
del /s /f /q .\src\cardsweb\static\
rmdir /Q /S .\src\cardsweb\static\
mkdir .\src\cardsweb\static\
XCOPY /E /H /Y /C .\wikiweb\build\* .\src\cardsweb\static
rmdir /Q /S .\wikiweb\build
mkdir .\wikiweb\build
XCOPY /E /H /Y /C .\src\cardsweb\static\static .\src\cardsweb\static
rmdir /Q /S .\src\cardsweb\static\static