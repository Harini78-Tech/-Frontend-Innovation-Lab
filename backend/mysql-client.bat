@echo off
cd /d %~dp0..\mysql
bin\mysql.exe -u root -h localhost -P 3306 %* 

