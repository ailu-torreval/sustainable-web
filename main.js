import "./sass/style.scss";

const key = "AIzaSyCv8E4cyKmeVNQtrLEnzrIMh9QnnOaKkT4";
const url = encodeURIComponent("https://www.infobae.com/america/");
async function getSpeedData() {
  const result = await fetch(
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&key=${key}`
  );
  const data = await result.json();
  console.log("lighthouse", data);
}
getSpeedData();

const url1 =
  "https://kea-alt-del.dk/websitecarbon/site/?url=https://www.infobae.com/america/";

function getGreenData() {
  fetch(url1)
    .then((res) => res.json())

    .then(gotGreenData);
}
function gotGreenData(data) {
  console.log("green", data);
}
getGreenData();


//dataArr[1]["unminified-javascript"];