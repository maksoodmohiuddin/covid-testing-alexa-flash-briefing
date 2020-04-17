
const axios = require("axios");
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
    currentTotalTestResults = currentData.data[0].totalTestResults;
    currentNegative = currentData.data[0].negative;
    currentPositive = currentData.data[0].positive;

    previousTotalTestResults = previousData.totalTestResults;
    previousNegative = previousData.negative;
    previousPositive = previousData.positive;

    let jsonObj = {};
    jsonObj.uid = '066dc92b-fcf3-4c05-9f25-498b1eb93d45';
    const formattedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    jsonObj.updateDate = new Date().toUTCString();
    jsonObj.titleText = 'Summary of US Covid-19 testing data as of ' + formattedDate;
    let dataText = 'In US, based on Covid-19 testing data from ' + formattedDate + ' '; 
    dataText += currentTotalTestResults + ' total test were conducted.'
    jsonObj.mainText = dataText;

    console.log(jsonObj);
      //"updateDate": "2020-04-16T00:00:00.0Z",
      //"titleText": 
      //"mainText": "In US, based on Covid-19 testing data from April 16, 2020, 34230341 total test were conducted. 2756461 tests were negative and 666573 tests were positive.  Total testing has been increased by 4.6% from the day before. Negative cases rose by 4.8% and positive cases increased by 4.8%."
    //}



  }));


