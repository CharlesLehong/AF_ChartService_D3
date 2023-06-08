module.exports = {
    htmlTemplate: `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                </head>
                <body>
                    <div class="container"></div>
                </body>
            </html>`,
    sankeyCssTemplate: `* {
                font-family: sans-serif;
            }
            .link {
                fill: none;
                stroke: #000;
                stroke-opacity: 0.2;
            }
            .link:hover {
                stroke-opacity: 0.5;
            }
            .labelText {
                font-size: 8px;
                font-family: sans-serif;
            }`,
};
