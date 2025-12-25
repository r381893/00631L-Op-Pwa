@echo off
cd /d "c:\Users\jack\Desktop\Github_backup_test\00631L-Op-Pwa"
"C:\Program Files\Git\bin\git.exe" config user.email "r381893@github.com"
"C:\Program Files\Git\bin\git.exe" config user.name "r381893"
"C:\Program Files\Git\bin\git.exe" commit -m "Initial commit: 00631L Hedge Dashboard"
"C:\Program Files\Git\bin\git.exe" branch -M main
"C:\Program Files\Git\bin\git.exe" remote add origin https://github.com/r381893/00631L-Op-Pwa.git
"C:\Program Files\Git\bin\git.exe" push -u origin main
