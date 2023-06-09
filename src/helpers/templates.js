module.exports = {
    htmlTemplate: `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        </head>
        <body>
            <div id="chart">
                <div class="legend">
                    <div class="item compulsory">
                        <div class="dot compulsory-dot"></div>
                        <div class="text">Compulsory investments</div>
                        <div class="amount">R0</div>
                    </div>
                    <div class="item discretionary">
                        <div class="dot discretionary-dot"></div>
                        <div class="text">Discretionary investments</div>
                        <div class="amount">R0</div>
                    </div>
                </div>
                <div class="sub-legend">
                    <div>Current</div>
                    <div>Recommended</div>
                    <div>Goals</div>
                </div>
                <div class="container"></div>
            </div>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/d3-sankey/0.7.1/d3-sankey.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js"></script>
        </body>
    </html>`,
    sankeyCssTemplate: `
    * {
      font-family: sans-serif;
    }
    .link:hover {
        stroke-opacity: 0.5;
    }
    .legend {
        width: 1530px;
        background-color: #fff;
        margin: auto;
        display: flex;
        border-top: 1px solid rgba(0, 0, 0, 0.15);
        border-bottom: 1px solid rgba(0, 0, 0, 0.15);
        padding-top: 30px;
        padding-bottom: 30px;
    }
    .legend .item {
        width: 387px;
        height: 56px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        padding: 0 15px;
        font-family: "Hero New";
        font-style: normal;
        font-weight: 600;
        font-size: 14px;
        line-height: 24px;
        letter-spacing: 0.15px;
        margin-right: 15px;
    }
    .legend .item .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 15px;
    }
    .legend .item .amount {
        margin-left: auto;
    }
    .compulsory {
        background: rgba(21, 128, 141, 0.15);
        color: #124e57;
    }
    .compulsory-dot {
        background: #15808d;
    }
    .discretionary {
        background-color: #f6952126;
        color: #4e4e4e;
    }
    .discretionary-dot {
        background: #f69521;
    }
    .sub-legend {
        display: flex;
        justify-content: space-between;
        width: 1530px;
        margin: auto;
        font-family: "Hero New";
        font-style: normal;
        font-weight: 600;
        font-size: 14px;
        line-height: 24px;
        text-align: center;
        letter-spacing: 0.15px;
        color: rgba(0, 0, 0, 0.5);
        padding-top: 20px;
        padding-bottom: 20px;
    }
    `,
};
