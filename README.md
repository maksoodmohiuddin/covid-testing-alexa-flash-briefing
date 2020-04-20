# Desceiption 
This is a open source contribution project that serves a Amazon Alexa Flash Briefing based on data retrieve from The COVID Tracking Project (https://covidtracking.com)) 

# Run Locally
npm run local

# Deploy Manually 
zip -r alexaskillupdate.zip .

aws lambda create-function --profile magnolia --function-name alexa-covid-flash-briefing-update-fn --zip-file fileb://alexaskillupdate.zip --handler index.handler --runtime nodejs12.x --timeout 10 --memory-size 1024 --role arn:aws:iam::xxxx:role/lambda-s3-cloudwatch