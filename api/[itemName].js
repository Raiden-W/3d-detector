const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const app = express();

app.get("/api/:itemName", async (req, res) => {
	console.log(req.params.itemName);
	const imgUrls = await getImagesUrls(req.params.itemName);
	res.json(imgUrls);
});

const portUrl = process.env.PORT || 3000;
app.listen(portUrl, () => {
	console.log("yes I am listening at " + portUrl);
});

async function getImagesUrls(itemName) {
	const searchPageUrl =
		"https://www.bing.com/images/async?q=" +
		itemName +
		"&first=3&count=100&cw=1177&ch=743&relp=35&tsc=ImageHoverTitle&datsrc=I&layout=RowBased&sbop=1&relo=1&relr=4&rely=581&relex=1&mmasync=1&dgState=x*0_y*0_h*0_c*6_i*36_r*6&IG=E48BFC611D094104ABAA19DF361B2AF7&SFX=2&iid=images.6726";
	// console.log(searchPageUrl);
	const { data } = await axios.get(searchPageUrl);
	const $ = cheerio.load(data);
	const imgEles = $(".mimg");
	const imgUrls = [];
	imgEles.each((i) => {
		imgUrls[i] = imgEles[i].attribs.src;
	});
	const selectedUrls = pickRandom(imgUrls, 10);
	// console.log(selectedUrls);
	return selectedUrls;
}

const pickRandom = (arr, n) => {
	let result = [n],
		len = arr.length,
		taken = [len];
	if (n > len)
		// throw new RangeError("pickRandom: more elements taken than available");
		return arr;
	while (n--) {
		let x = Math.floor(Math.random() * len);
		result[n] = arr[x in taken ? taken[x] : x];
		taken[x] = --len in taken ? taken[len] : len;
	}
	return result;
};

module.exports = app;
