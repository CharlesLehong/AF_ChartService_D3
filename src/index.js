const express = require("express");
const app = express();
const drawChart = require("./helpers/drawChart");

app.use(express.json());
app.post("/api/chart", async (req, res) => {
    var data = req.body;
    const chart = await drawChart(data);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", "attachment; filename=chart.png");
    res.send(chart);
});

const port = 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
