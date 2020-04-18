
// npm packages 
const axios = require("axios");
const uuidv4 = require("uuid");

// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});
// set the profile 
AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: 'magnolia'});

// API Endpoints from The COVID Tracking Project https://covidtracking.com/api
const currentDataAPI = "https://covidtracking.com/api/v1/us/current.json";
const previousDataAPI = 'https://covidtracking.com/api/us/daily?date=' + apiFormattedPreviouDate();

function apiFormattedPreviouDate() {
  // Format previous date as per API Specifications from https://covidtracking.com/api
  let previousDateObject = new Date();
  previousDateObject.setDate(previousDateObject.getDate() - 1);
  // previous date, adjust 0 before single digit date
  let previouDateDay = ("0" + previousDateObject.getDate()).slice(-2);
  // previous month, adjust 0 before single digit month
  let previousDateMonth = ("0" + (previousDateObject.getMonth() + 1)).slice(-2);
  // previous year
  let previousDateYear = previousDateObject.getFullYear();
  // compile previous date
  return  previousDateYear + previousDateMonth + previouDateDay;
}

function getCurrentData() {
  return axios.get(currentDataAPI);
}

function getPreviousData() {
  return axios.get(previousDataAPI);
}

axios.all([getCurrentData(), getPreviousData()])
  .then(axios.spread(function (currentData, previousData) {
    // Both requests are now complete    
  
    // current data
    const currentTotalTestResults = currentData.data[0].totalTestResults;
    const currentNegative = currentData.data[0].negative;
    const currentPositive = currentData.data[0].positive;

    // previous date date 
    const previousTotalTestResults = previousData.data.totalTestResults;
    const previousNegative = previousData.data.negative;
    const previousPositive = previousData.data.positive;

    // calculations 
    const usPopulation = 330000000;
    const percentageTest = parseFloat((currentTotalTestResults / usPopulation) * 100).toFixed(2);
    const testIncreasePercentage = parseFloat(((currentTotalTestResults - previousTotalTestResults) / previousTotalTestResults) * 100).toFixed(2);
    const negativeIncreasePercentage = parseFloat(((currentNegative - previousNegative) / previousNegative) * 100).toFixed(2);
    const positiveIncreasePercentage = parseFloat(((currentPositive - previousPositive) / previousPositive) * 100).toFixed(2);

    // compile JSON object for S3
    let jsonObj = {};
    jsonObj.uid = uuidv4.v4();
    jsonObj.updateDate = new Date().toUTCString();
    const formattedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    jsonObj.titleText = 'Summary of US Covid-19 testing data as of ' + formattedDate;
    let dataText = 'In US, based on Covid-19 testing data from ' + formattedDate + ', '; 
    dataText += currentTotalTestResults + ' total test were conducted which represent '; 
    dataText += percentageTest + '% of estimated 330 million US population. '
    dataText += currentNegative + ' test were negative and ' + currentPositive + ' teste were postive. '; 
    dataText += 'Total testing has been increased by ' + testIncreasePercentage  + '% from the day before. ';
    dataText += 'Negative cases rose by ' + negativeIncreasePercentage; 
    dataText += '% and positive cases increased by ' + positiveIncreasePercentage + '%';
    jsonObj.mainText = dataText;

    console.log(jsonObj);    
    
    // Upload updated JSON file to S3  
    // Create S3 service object
    s3 = new AWS.S3({apiVersion: '2006-03-01'});
    s3.putObject({
      Bucket: 'magnolia-alexa-skills',
      Key: 'magnoliaflashbriefing.json',
      Body: JSON.stringify(jsonObj),      
      ContentType: "application/json",
      ACL: 'public-read'
    }, function(err, data) {
    if (err) {
      console.log(err);
    }
    console.log(data)
    });

  }));


