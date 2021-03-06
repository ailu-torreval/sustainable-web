"use strict";
import "./sass/style.scss";

document.querySelector(".submit-btn").addEventListener("click", checkSubmit);
const form = document.querySelector("form");
form.setAttribute("novalidate", true);

let testUrl;
let dataArr = [];
let resultsArr = [];
let improvNr = 0;
let newBytes = 0;

// FAKE RESULTS FOR TESTING
// let fixedResults = {
//   company: "infobae",
//   mail: "s@s.com",
//   companyUrl: "https://www.infobae.com/america/",
//   bytes: 2647717,
//   cleanerThan: 34,
//   gridCo2: 1.5962,
//   renewCo2: 1.4466,
//   lazyImg: 814699,
//   respImg: 206178,
//   optImg: 734825,
//   optCode: 298160,
//   lazyLoading: true,
//   greenHost: true,
//   try: 593851.9572000001,
// };

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
  hostNr: "",
  greenHost: false,
  lazyLoading: false,
};

function checkSubmit() {
  let urlField = document.querySelector('input[name="url"]');
  let emailField = document.querySelector('input[name="email"]');
  urlField.classList.remove("border-invalid");
  emailField.classList.remove("border-invalid");
  document.documentElement.style.setProperty(
    "--focus-invalid",
    "1.5px solid hotpink"
  );
  if (urlField.checkValidity()) {
    if (emailField.checkValidity()) {
      submitUrl();
    } else {
      document.querySelector(".email-invalid").animate(fadingIn, 200);
      document.querySelector(".url-invalid").classList.add("hidden");
      document.querySelector(".email-invalid").classList.remove("hidden");
      emailField.classList.add("border-invalid");
    }
  } else {
    if (emailField.checkValidity()) {
      document.querySelector(".url-invalid").animate(fadingIn, 200);
      document.querySelector(".url-invalid").classList.remove("hidden");
      document.querySelector(".email-invalid").classList.add("hidden");
      urlField.classList.add("border-invalid");
    } else {
      document.querySelector(".email-invalid").animate(fadingIn, 200);
      document.querySelector(".url-invalid").animate(fadingIn, 200);
      document.querySelector(".url-invalid").classList.remove("hidden");
      document.querySelector(".email-invalid").classList.remove("hidden");
      emailField.classList.add("border-invalid");
      urlField.classList.add("border-invalid");
    }
  }
}

function submitUrl() {
  console.log(form.elements.url.value);
  testUrl = form.elements.url.value;
  document.querySelector("#form").classList.add("hidden");
  document.querySelector("#form-container").classList.add("hidden");
  document.querySelector("#loading-wrapper").classList.remove("hidden");
  showLoadingText();
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
    results.hostNr = 1;
  } else {
    results.greenHost = false;
    results.hostNr = 0;
  }

  console.log(results);
  resultsArr.push(results);
  resultsReady(results);
  return results;
}

function resultsReady(results) {
  document.querySelector("#page1").classList.add("hidden");
  document.querySelector("#page2").classList.remove("hidden");
  document.querySelector(".header-link").classList.remove("hidden");
  showResults(results);
}

function showResults(results) {
  console.log("res", results);

  let GraphNr = (results.cleanerThan - 50) * 1.8;
  document.documentElement.style.setProperty(
    "--needle-position",
    `rotate(${GraphNr}deg)`
  );
  console.log(GraphNr);
  document.querySelector("#tick").classList.add("tick-animate");
  document.querySelector("#url-name").textContent = results.company;
  if (results.cleanerThan >= 50) {
    document.querySelector("#cleaner-txt").classList.remove("hidden");
    document.querySelector("#dirtier-txt").classList.add("hidden");
    document.querySelector(
      "#cleaner-nr"
    ).textContent = `${results.cleanerThan}%`;
  } else {
    document.querySelector("#dirtier-txt").classList.remove("hidden");
    document.querySelector("#cleaner-txt").classList.add("hidden");
    document.querySelector("#dirtier-nr").textContent = `${
      100 - results.cleanerThan
    }%`;
  }
  document.querySelector("#co2-nr").textContent = numeral(
    results.gridCo2
  ).format("0,0.000");

  if (results.greenHost) {
    document.querySelector("#green-host-container").classList.remove("hidden");
    document.querySelector("#red-host-container").classList.add("hidden");
  } else {
    document.querySelector("#green-host-container").classList.add("hidden");
    document.querySelector("#red-host-container").classList.remove("hidden");
  }
  document.querySelector("#weight-nr").textContent = numeral(
    results.bytes
  ).format("0,0");
  displayParamsData(results);
}

function displayParamsData(results) {
  let range = document.querySelector('input[type="range"]');
  range.max = results.optImg;
  range.value = results.optImg;
  document.querySelector("#max-value").textContent = `${numeral(
    results.optImg
  ).format("0,0")} bytes`;

  if (results.greenHost) {
    document.querySelector("#green-host").setAttribute("checked", true);
  }
  if (results.lazyLoading) {
    document.querySelector("#lazy-load-container").classList.add("hidden");
    document.querySelector("#opt-lazy-loading").classList.remove("hidden");
    document.querySelector("#opt-lazy-nr").textContent = numeral(
      results.lazyImg
    ).format("0,0");
  } else {
    document.querySelector("#lazy-load-container").classList.remove("hidden");
    document.querySelector("#opt-lazy-loading").classList.add("hidden");
    document.querySelector("#lazy-nr").textContent = numeral(
      results.lazyImg
    ).format("0,0");
  }
  document.querySelector("#resp-nr").textContent = numeral(
    results.respImg
  ).format("0,0");
  document.querySelector("#code-nr").textContent = numeral(
    results.optCode
  ).format("0,0");

  document.querySelector("#green-host").addEventListener("change", (e) => {
    if (e.target.checked) {
      console.log("is checked");
      results.greenHost = true;
      getNewRes(results);
    } else {
      console.log("is not checked");
      results.greenHost = false;
      getNewRes(results);
    }
  });
  document.querySelector("#lazy-loading").addEventListener("change", (e) => {
    if (e.target.checked) {
      console.log("is checked");
      improvNr = improvNr++ + results.lazyImg;
      getNewRes(results);
    } else {
      console.log("is not checked");
      improvNr = improvNr-- - results.lazyImg;
      getNewRes(results);
    }
  });
  document
    .querySelector("#opt-lazy-loading")
    .addEventListener("change", (e) => {
      if (e.target.checked) {
        improvNr = improvNr++ + results.lazyImg;
        console.log(improvNr);
        getNewRes(results);
      } else {
        console.log("is not checked");
        improvNr = improvNr-- - results.lazyImg;
        getNewRes(results);
      }
    });

  document.querySelector("#resp-img-opt").addEventListener("change", (e) => {
    if (e.target.checked) {
      console.log("is checked");
      improvNr = improvNr++ + results.respImg;
      getNewRes(results);
      console.log(improvNr);
    } else {
      improvNr = improvNr-- - results.respImg;
      console.log("is not checked");
      getNewRes(results);
    }
  });

  document.querySelector("#code-opt").addEventListener("change", (e) => {
    if (e.target.checked) {
      console.log("is checked");
      improvNr = improvNr++ + results.optCode;
      getNewRes(results);
    } else {
      console.log("is not checked");
      improvNr = improvNr-- - results.optCode;

      getNewRes(results);
    }
  });

  document
    .querySelector('input[type="range"]')
    .addEventListener("change", (e) => {
      let rangeInput = results.optImg - e.target.value;
      console.log("range input", rangeInput);
      const newNr = improvNr++ + rangeInput;
      console.log("newNr", newNr);
      getRangeResults(results, newNr);
    });
}

function getRangeResults(results, newNr) {
  newBytes = results.bytes - newNr;
  fetch(
    `https://kea-alt-del.dk/websitecarbon/data/?bytes=${newBytes}&green=${results.hostNr}`
  )
    .then((res) => res.json())

    .then(prepareRangeData);

  function prepareRangeData(newData) {
    displayNewData(results, newData);
  }
}

function getNewRes(results) {
  if (improvNr > results.bytes) {
    newBytes = results.bytes;
  } else {
    newBytes = results.bytes - improvNr;
  }
  console.log(newBytes);
  fetch(
    `https://kea-alt-del.dk/websitecarbon/data/?bytes=${newBytes}&green=${results.hostNr}`
  )
    .then((res) => res.json())

    .then(prepareNewData);

  function prepareNewData(newData) {
    displayNewData(results, newData);
  }
}
function displayNewData(results, newData) {
  console.log(newData);
  // barometer animation calculations
  let newPercentage = newData.cleanerThan * 100;
  let newGraphNr = (newPercentage - 50) * 1.8;
  document.documentElement.style.setProperty(
    "--needle-position",
    `rotate(${newGraphNr}deg)`
  );
  console.log("newGraph Nr", newGraphNr);
  document.querySelector("#tick").classList.add("tick-animate");



  if (newPercentage > 50) {
    document.querySelector("#cleaner-txt").animate(fadingIn, 1000);
    document.querySelector("#cleaner-txt").classList.remove("hidden");
    document.querySelector("#dirtier-txt").classList.add("hidden");
    document.querySelector("#cleaner-nr").textContent = `${numeral(
      newPercentage
    ).format("0,0")}%`;
  } else {
    document.querySelector("#dirtier-txt").animate(fadingIn, 1000);
    document.querySelector("#dirtier-txt").classList.remove("hidden");
    document.querySelector("#cleaner-txt").classList.add("hidden");
    document.querySelector("#dirtier-nr").textContent = `${
      100 - numeral(newPercentage).format("0,0")
    }%`;
  }
  document.querySelector("#co2-nr").animate(fadingIn, 1000);
  document.querySelector("#co2-nr").textContent = numeral(
    newData.statistics.co2.grid.grams
  ).format("0,0.000");

  if (results.greenHost) {
    console.log("is green", results.greenHost);
    document.querySelector("#green-container").animate(fadingIn, 1000);
    document.querySelector("#green-container").classList.remove("hidden");
    document.querySelector("#red-host-container").classList.add("hidden");
  } else {
    console.log("is not", results.greenHost);
    document.querySelector("#red-host-container").animate(fadingIn, 1000);
    document.querySelector("#green-container").classList.add("hidden");
    document.querySelector("#red-host-container").classList.remove("hidden");
  }
  document.querySelector("#weight-nr").animate(fadingIn, 1000);
  document.querySelector("#weight-nr").textContent =
    numeral(newBytes).format("0,0");
}

// LOADING ANIMATIONS

function showLoadingText() {
  setTimeout(showText, 1000);
  setTimeout(showSecText, 4000);
  setTimeout(showThirdText, 8000);
  console.log("now text appears");
}

function loop() {
  showLoadingText();
}

function showText() {
  document.querySelector(".first-h3").classList.remove("hidden");
  document.querySelector(".third-h3").classList.add("hidden");
}

function showSecText() {
  document.querySelector(".sec-h3").classList.remove("hidden");
  document.querySelector(".first-h3").classList.add("hidden");
}

function showThirdText() {
  document.querySelector(".third-h3").classList.remove("hidden");
  document.querySelector(".first-h3").classList.add("hidden");
  document.querySelector(".sec-h3").classList.add("hidden");
  setTimeout(loop, 2000);
}


// FADE IN ANIMATIONS

const fadingIn = [{ opacity: 0 }, { opacity: 1 }];
let element = document.querySelector("#page1");
element.animate(fadingIn, 1000);


