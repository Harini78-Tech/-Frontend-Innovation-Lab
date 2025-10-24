@echo off
echo Starting MySQL without admin rights...
cd /d %~dp0..\mysql

if not exist "data" mkdir data

echo Initializing MySQL database...
bin\mysqld.exe --initialize-insecure --datadir=./data --basedir=.

echo Starting MySQL server on port 3306...
bin\mysqld.exe --port=3306 --datadir=./data --basedir=. --console 
