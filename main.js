"use strict";
import "./sass/style.scss";
// document.querySelector("#url-input").addEventListener("input", getUrl);

let testUrl;
let dataArr = [];
const Results = {
  company: "",
  // companyUrl: "",
  bytes: "",
  cleanerThan: "",
  gridCo2: "",
  renewCo2: "",
  lazyImg: "",
  respImg: "",
  optImg: "",
  optCode: "",
  try: [],
  greenHost: false,
  lazyLoading: false,
};

function getUrl(e) {
  // if (e.includes("https://")) {
  //   if (e.includes("wwww.")) {

  //   }
  // }
  console.log("getUrl");
  testUrl = e.target.value;
  console.log("url is", testUrl);
  // getAllData();
  loadJSON();
  return testUrl;
}

async function loadJSON() {
  const key = "AIzaSyCv8E4cyKmeVNQtrLEnzrIMh9QnnOaKkT4";
  const url = encodeURIComponent(testUrl);
  const url1 = `https://kea-alt-del.dk/websitecarbon/site/?url=${testUrl}`;

  const speedData1 = await fetch(
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&key=${key}`
  );
  const speedData = await speedData1.json();

  const carbonData1 = await fetch(url1);
  const carbonData = await carbonData1.json();
  // when loaded, prepare data objects
  prepareObjects(speedData, carbonData);
}

function prepareObjects(speedData, carbonData) {
  dataArr.push(carbonData);
  dataArr.push(speedData.lighthouseResult.audits);
  console.log(dataArr);
  prepareObject(dataArr);
}

function prepareObject(dataArr) {
  const results = Object.create(Results);

  results.url = dataArr[0].url;

  results.bytes = dataArr[0].bytes;

  let percentage = dataArr[0].cleanerThan;
  results.cleanerThan = percentage * 100;

  let coGrid = parseFloat(dataArr[0].statistics.co2.grid.grams).toFixed(4);
  results.gridCo2 = Number(coGrid);

  let coRen = parseFloat(dataArr[0].statistics.co2.renewable.grams).toFixed(4);
  results.renewCo2 = Number(coRen);
  // results.gridCo2 = dataArr[0].statistics.co2.grid.grams;
  // results.renewCo2 = dataArr[0].statistics.co2.renewable.grams;
  results.lazyImg = dataArr[1]["offscreen-images"].details.overallSavingsBytes;
  results.respImg =
    dataArr[1]["uses-responsive-images"].details.overallSavingsBytes;

  // img optimizations
  let imgData1 = dataArr[1]["modern-image-formats"].details.overallSavingsBytes;
  let imgData2 =
    dataArr[1]["uses-optimized-images"].details.overallSavingsBytes;

  results.optImg = Math.round(imgData1 + imgData2);

  // code optimizations
  let codeData1 = dataArr[1]["unminified-css"].details.overallSavingsBytes;
  let codeData2 =
    dataArr[1]["unminified-javascript"].details.overallSavingsBytes;
  let codeData3 = dataArr[1]["unused-css-rules"].details.overallSavingsBytes;
  let codeData4 = dataArr[1]["unused-javascript"].details.overallSavingsBytes;
  results.optCode = codeData1 + codeData2 + codeData3 + codeData4;

  let isLazy = dataArr[1]["lcp-lazy-loaded"].title;
  if (isLazy.includes("not")) {
    results.lazyLoading = false;
  } else {
    results.lazyLoading = true;
  }
  if (dataArr[0].green) {
    results.greenHost = true;
  } else {
    results.greenHost = false;
  }
  let totalSum =
    results.gridCo2 +
    results.renewCo2 +
    results.lazyImg +
    results.respImg +
    results.optImg +
    results.optCode;
  results.try = results.bytes - totalSum;

  console.log(results);
}

// function displayResults(dataArr) {
//   document.querySelector("#co2-nr").textContent = dataArr[0].statistics.co2.grid.grams;
// }

//dataArr[1]["unminified-javascript"];

//loading animation

