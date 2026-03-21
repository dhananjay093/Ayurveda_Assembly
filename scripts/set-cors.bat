@echo off
set GCLOUD="C:\Users\dhana\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
echo Applying CORS to Firebase Storage bucket...
%GCLOUD% storage buckets update gs://ayurveda-assembly.appspot.com --cors-file=scripts\cors.json
echo Exit code: %ERRORLEVEL%
