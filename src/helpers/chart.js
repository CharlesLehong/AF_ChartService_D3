const puppeteer = require("puppeteer");
const drawSankey = require("./sankey");

module.exports = async function (payload) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(`<html><body><div id="chart"></div></body></html>`);
    await page.addScriptTag({ url: "https://d3js.org/d3.v4.min.js" });

    switch (payload.type) {
        case "Sankey":
            await drawSankey(page, payload.data);
            break;
    }

    const chartDiv = await page.$("#chart");
    const chart = await chartDiv.screenshot({
        encoding: "binary",
    });

    await browser.close();
    return chart;
};
