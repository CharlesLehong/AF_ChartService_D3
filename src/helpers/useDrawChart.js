const puppeteer = require("puppeteer");
const drawSankey = require("./useDrawSankey");

module.exports = async function (payload) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const html = require("fs").readFileSync(`${__dirname}/../public/index.html`, "utf8");

    await page.setContent(html);

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
