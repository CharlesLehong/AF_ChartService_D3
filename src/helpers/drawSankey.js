// visualization based on the example at the provided url
const source = "https://beta.observablehq.com/@mbostock/d3-sankey-diagram";

const { sankeyCssTemplate } = require("./templates");

module.exports = async function (page, data) {
    await page.addStyleTag({ content: sankeyCssTemplate });

    await page.evaluate((data) => {
        const container = d3.select(".container");
        const margin = {
            top: 20,
            right: 120,
            bottom: 20,
            left: 120,
        };

        const width = 1000 + (margin.left + margin.right);
        const height = 1000 + (margin.top + margin.bottom);

        const containerFrame = container
            .append("svg")
            .attr("viewBox", `0 0 ${width + (margin.left + margin.right)} ${height + (margin.top + margin.bottom)}`)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        containerFrame
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "transparent");

        function createSankeyDiagram(data, frame) {
            const color = d3.scaleOrdinal(d3.schemeSet3);
            const sankey = d3.sankey().extent([
                [0, 0],
                [width, height],
            ]);

            const { nodes, links } = sankey(data);
            const defs = frame.append("defs");

            const linearGradients = defs
                .selectAll("linearGradient")
                .data(links)
                .enter()
                .append("linearGradient")
                .attr("id", (d) => `gradient${d.index}`)
                .attr("x1", "0%")
                .attr("y1", "50%")
                .attr("x2", "100%")
                .attr("y2", "50%");

            linearGradients
                .append("stop")
                .attr("offset", "0%")
                .attr("stop-color", (d) => color(d.source.index));

            linearGradients
                .append("stop")
                .attr("offset", "100%")
                .attr("stop-color", (d) => color(d.target.index));

            const sankeyLinks = d3.sankeyLinkHorizontal();

            frame
                .selectAll("path.link")
                .data(links)
                .enter()
                .append("path")
                .attr("class", "link")
                .attr("id", function (d, i) {
                    return "linkLabel" + i;
                })
                .attr("d", sankeyLinks)
                .attr("fill", "none")
                .attr("stroke", (d) => `url(#gradient${d.index})`)
                .attr("stroke-width", (d) => d.width)
                .attr("opacity", 0.5);

            frame
                .selectAll("rect.node")
                .data(nodes)
                .enter()
                .append("rect")
                .attr("class", "node")
                .attr("x", (d) => d.x0)
                .attr("y", (d) => d.y0)
                .attr("width", (d) => d.x1 - d.x0)
                .attr("height", (d) => d.y1 - d.y0)
                .attr("pointer-events", "none")
                .attr("stroke", "#555")
                .attr("stroke-width", "1px")
                .attr("fill", (d) => color(d.index));

            frame
                .selectAll("text.node")
                .data(nodes)
                .enter()
                .append("text")
                .text((d) => d.name)
                .attr("font-size", "9px")
                .attr("font-weight", "bold")
                .attr("fill", "#111")
                .attr("x", (d) => {
                    if (d.sourceLinks.length > 0) {
                        return d.x0 - sankey.nodeWidth() + 15;
                    }
                    return d.x0 + sankey.nodeWidth() + 10;
                })
                .attr("y", (d) => (d.y1 + d.y0) / 2)
                .attr("pointer-events", "none")
                .attr("alignment-baseline", "middle")
                .attr("text-anchor", (d) => (d.sourceLinks.length > 0 ? "end" : "start"));

            frame
                .selectAll(".labelText")
                .data(links)
                .enter()
                .append("text")
                .attr("class", "labelText")
                .attr("dx", 5)
                .attr("dy", 0)
                .append("textPath")
                .attr("xlink:href", function (d, i) {
                    return "#linkLabel" + i;
                })
                .text(function (d, i) {
                    return "R" + d.value;
                });
        }

        createSankeyDiagram(data, containerFrame);
    }, data);
};
