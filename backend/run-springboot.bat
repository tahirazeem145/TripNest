@ECHO OFF
SET JAVA_HOME=C:\Program Files\Java\jdk-17
SET PATH=%JAVA_HOME%\bin;%PATH%
SET MVN_CMD=C:\Users\tahir\.m2\wrapper\dists\apache-maven-3.6.3-bin\1iopthnavndlasol9gbrbg6bf2\apache-maven-3.6.3\bin\mvn.cmd
ECHO Using Java: %JAVA_HOME%
ECHO Using Maven: %MVN_CMD%
ECHO.
CALL "%MVN_CMD%" spring-boot:run
