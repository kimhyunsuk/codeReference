@echo off
 echo ******************************************************
 echo QuickLoad-bin1.3beta-111.jar
 echo Usage - EXCEL2DB.CMD config.file data.file [logfile] *
 echo ******************************************************

SETLOCAL
set JDBC_DRIVER_LIB=
set APP_JAR=QuickLoad-bin1.3beta-111.jar

set ag3=%3

if NOT ""%ag3% == "" goto SETLOG
if ""%ag3%=="" goto RUN

:SETLOG
set ARG3=-log %ag3%
GOTO RUN

:RUN
JAVA -cp %APP_JAR%;"%JDBC_DRIVER_LIB%";"%CLASSPATH%" com.as.quickload.Main  -config %1 -data %2 %ARG3%
ENDLOCAL