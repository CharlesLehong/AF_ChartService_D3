const puppeteer = require("puppeteer");
const drawSankey = require("./drawSankey");
const { htmlTemplate } = require("./templates");

module.exports = async function (payload) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.emulate({
        viewport: {
            width: 1920,
            height: 1080,
            isMobile: false,
            deviceScaleFactor: 1,
        },
        userAgent: "",
    });

    await page.setContent(htmlTemplate);
    await page.addScriptTag({ url: "https://cdnjs.cloudflare.com/ajax/libs/d3-sankey/0.7.1/d3-sankey.min.js" });
    await page.addScriptTag({ url: "https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js" });

    await page.evaluate(() => {
        document.documentElement.requestFullscreen();
    });

    switch (payload.type) {
        case "Sankey":
            await drawSankey(page, payload.data);
            break;
    }

    const chartDiv = await page.$(".container");
    const chart = await chartDiv.screenshot({
        encoding: "binary",
    });

    await browser.close();
    return chart;
};
