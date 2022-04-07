"use strict";
import "./sass/style.scss";
document.querySelector(".submit-btn").addEventListener("click", checkSubmit);

const form = document.querySelector("form");
form.setAttribute("novalidate", true);

let testUrl;
let dataArr = [];
let improvNr = [];
let resultsArr = [];
let fixedResults = {
  company: "infobae",
  mail: "s@s.com",
  companyUrl: "https://www.infobae.com/america/",
  bytes: 2647717,
  cleanerThan: 34,
  gridCo2: 1.5962,
  renewCo2: 1.4466,
  lazyImg: 814699,
  respImg: 206178,
  optImg: 734825,
  optCode: 298160,
  lazyLoading: true,
  greenHost: true,
  try: 593851.9572000001,
};

const Results = {
  companyUrl: "",
  company: "",
  mail: "",
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

// resultsReady();

function checkSubmit() {
  if (form.checkValidity()) {
    submitUrl();
  } else {
    console.log("please fill fields correctly");
  }
}

function submitUrl() {
  console.log(form.elements.url.value);
  testUrl = form.elements.url.value;
  document.querySelector("#form").classList.add("hidden");
  document.querySelector("#form-container").classList.add("hidden");
  document.querySelector("#loading-wrapper").classList.remove("hidden");
  loadJSON();
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

  results.company = form.elements.companyName.value;
  results.mail = form.elements.email.value;
  results.companyUrl = testUrl;

  results.bytes = dataArr[0].bytes;

  let percentage = dataArr[0].cleanerThan;
  results.cleanerThan = percentage * 100;

  let coGrid = parseFloat(dataArr[0].statistics.co2.grid.grams).toFixed(4);
  results.gridCo2 = Number(coGrid);

  let coRen = parseFloat(dataArr[0].statistics.co2.renewable.grams).toFixed(4);
  results.renewCo2 = Number(coRen);
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
  if (!isLazy.includes("not")) {
    results.lazyLoading = true;
  } else {
    results.lazyLoading = false;
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
  resultsArr.push(results);
  resultsReady(results);
  return results;
}

// function resultsReady(results) {
//   document.querySelector("#page1").classList.add("hidden");
//   document.querySelector("#page2").classList.remove("hidden");
//   showResults(results);
// }

// function showResults() {
//   console.log("res", fixedResults);
//   document.querySelector("#url-name").textContent = fixedResults.company;
//   if (fixedResults.cleanerThan > 50) {
//     document.querySelector("#cleaner-txt").classList.remove("hidden");
//     document.querySelector("#dirtier-txt").classList.add("hidden");
//     document.querySelector("#cleaner-nr").textContent =
//       fixedResults.cleanerThan;
//   } else {
//     document.querySelector("#dirtier-txt").classList.remove("hidden");
//     document.querySelector("#cleaner-txt").classList.add("hidden");
//     document.querySelector("#dirtier-nr").textContent =
//       fixedResults.cleanerThan;
//   }
//   document.querySelector("#co2-nr").textContent = fixedResults.gridCo2;

//   if (fixedResults.greenHost) {
//     document.querySelector("#green-host-container").classList.remove("hidden");
//     document.querySelector("#red-host-container").classList.add("hidden");
//   } else {
//     document.querySelector("#green-host-container").classList.add("hidden");
//     document.querySelector("#red-host-container").classList.remove("hidden");
//   }
//   document.querySelector("#weight-nr").textContent = fixedResults.bytes;
//   displayParamsData();
// }

// function displayParamsData() {
//   if (fixedResults.greenHost) {
//     document.querySelector("#green-host").setAttribute("checked", true);
//     document.querySelector("#host-txt").classList.add("hidden");
//   } else {
//     document.querySelector("#host-txt").classList.remove("hidden");
//   }
// }

// // dataArr[1]["unminified-javascript"];

// document.querySelector("#green-host").addEventListener("change", (e) => {
//   if (e.target.checked) {
//     console.log("is checked");
//     fixedResults.lazyLoading = true;
//     getNewRes();
//   } else {
//     console.log("is not checked");
//     fixedResults.lazyLoading = false;
//     getNewRes();
//   }
// });
// document.querySelector("#lazy-loading").addEventListener("change", (e) => {
//   if (e.target.checked) {
//     console.log("is checked");
//     getNewRes();
//   } else {
//     console.log("is not checked");
//     getNewRes();
//   }
// });
// document
//   .querySelector("#opt-lazy-loading")
//   .addEventListener("change", (e) => {
//     if (e.target.checked) {
//       console.log("is checked");
//       getNewRes();
//     } else {
//       console.log("is not checked");
//       getNewRes();
//     }
//   });

// document.querySelector("#resp-img-opt").addEventListener("change", (e) => {
//   if (e.target.checked) {
//     console.log("is checked");
//     getNewRes();
//   } else {
//     console.log("is not checked");
//     getNewRes();
//   }
// });

// document.querySelector("#code-opt").addEventListener("change", (e) => {
//   if (e.target.checked) {
//     console.log("is checked");
//     getNewRes();
//   } else {
//     console.log("is not checked");
//     getNewRes();
//   }
// });

// // document
// //   .querySelector("#opt-lazy-loading")
// //   .addEventListener("chenge", changeOptLazy);
// // document
// //   .querySelector("#resp-img-opt")
// //   .addEventListener("chenge", changeRespImg);
// // document.querySelector("#code-opt").addEventListener("chenge", changeCode);

// function getNewRes() {
// console.log("new results");
// }

// dataArr[1]["unminified-javascript"];

// loading text

document
  .querySelector(".submit-btn")
  .addEventListener("click", showLoadingText);

function showLoadingText() {
  setTimeout(showText, 1000);
  setTimeout(showSecText, 2000);
  setTimeout(showThirdText, 3000);
  console.log("now text appears");
}

function showText() {
  document.querySelector(".first-h3").classList.remove("hidden");
}

function showSecText() {
  document.querySelector(".sec-h3").classList.remove("hidden");
  document.querySelector(".first-h3").classList.add("hidden");
}

function showThirdText() {
  document.querySelector(".third-h3").classList.remove("hidden");
  document.querySelector(".first-h3").classList.add("hidden");
  document.querySelector(".sec-h3").classList.add("hidden");
}
