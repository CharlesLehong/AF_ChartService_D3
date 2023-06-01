const fs = require("fs");

module.exports = async function (page, data) {
    const style = fs.readFileSync(`${__dirname}/../public/sankey.css`, "utf8");
    await page.addStyleTag({ content: style });

    await page.evaluate((data) => {
        function d3Sankey() {
            var sankey = {},
                nodeWidth = 24,
                nodePadding = 8,
                size = [1, 1],
                nodes = [],
                links = [];

            sankey.nodeWidth = function (_) {
                if (!arguments.length) return nodeWidth;
                nodeWidth = +_;
                return sankey;
            };

            sankey.nodePadding = function (_) {
                if (!arguments.length) return nodePadding;
                nodePadding = +_;
                return sankey;
            };

            sankey.nodes = function (_) {
                if (!arguments.length) return nodes;
                nodes = _;
                return sankey;
            };

            sankey.links = function (_) {
                if (!arguments.length) return links;
                links = _;
                return sankey;
            };

            sankey.size = function (_) {
                if (!arguments.length) return size;
                size = _;
                return sankey;
            };

            sankey.layout = function (iterations) {
                computeNodeLinks();
                computeNodeValues();
                computeNodeBreadths();
                computeNodeDepths(iterations);
                computeLinkDepths();
                return sankey;
            };

            sankey.relayout = function () {
                computeLinkDepths();
                return sankey;
            };

            sankey.link = function () {
                var curvature = 0.5;
                function link(d) {
                    var x0 = d.source.x + d.source.dx,
                        x1 = d.target.x,
                        xi = d3.interpolateNumber(x0, x1),
                        x2 = xi(curvature),
                        x3 = xi(1 - curvature),
                        y0 = d.source.y + d.sy + d.dy / 2,
                        y1 = d.target.y + d.ty + d.dy / 2;
                    return (
                        "M" +
                        x0 +
                        "," +
                        y0 +
                        "C" +
                        x2 +
                        "," +
                        y0 +
                        " " +
                        x3 +
                        "," +
                        y1 +
                        " " +
                        x1 +
                        "," +
                        y1
                    );
                }

                link.curvature = function (_) {
                    if (!arguments.length) return curvature;
                    curvature = +_;
                    return link;
                };

                return link;
            };

            function computeNodeLinks() {
                nodes.forEach(function (node) {
                    node.sourceLinks = [];
                    node.targetLinks = [];
                });
                links.forEach(function (link) {
                    var source = link.source,
                        target = link.target;
                    if (typeof source === "number") source = link.source = nodes[link.source];
                    if (typeof target === "number") target = link.target = nodes[link.target];
                    source.sourceLinks.push(link);
                    target.targetLinks.push(link);
                });
            }

            function computeNodeValues() {
                nodes.forEach(function (node) {
                    node.value = Math.max(
                        d3.sum(node.sourceLinks, value),
                        d3.sum(node.targetLinks, value)
                    );
                });
            }

            function computeNodeBreadths() {
                var remainingNodes = nodes,
                    nextNodes,
                    x = 0;

                while (remainingNodes.length) {
                    nextNodes = [];
                    remainingNodes.forEach(function (node) {
                        node.x = x;
                        node.dx = nodeWidth;
                        node.sourceLinks.forEach(function (link) {
                            if (nextNodes.indexOf(link.target) < 0) {
                                nextNodes.push(link.target);
                            }
                        });
                    });
                    remainingNodes = nextNodes;
                    ++x;
                }

                moveSinksRight(x);
                scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
            }

            function moveSourcesRight() {
                nodes.forEach(function (node) {
                    if (!node.targetLinks.length) {
                        node.x =
                            d3.min(node.sourceLinks, function (d) {
                                return d.target.x;
                            }) - 1;
                    }
                });
            }

            function moveSinksRight(x) {
                nodes.forEach(function (node) {
                    if (!node.sourceLinks.length) {
                        node.x = x - 1;
                    }
                });
            }

            function scaleNodeBreadths(kx) {
                nodes.forEach(function (node) {
                    node.x *= kx;
                });
            }

            function computeNodeDepths(iterations) {
                var nodesByBreadth = d3
                    .nest()
                    .key(function (d) {
                        return d.x;
                    })
                    .sortKeys(d3.ascending)
                    .entries(nodes)
                    .map(function (d) {
                        return d.values;
                    });

                //
                initializeNodeDepth();
                resolveCollisions();
                for (var alpha = 1; iterations > 0; --iterations) {
                    relaxRightToLeft((alpha *= 0.99));
                    resolveCollisions();
                    relaxLeftToRight(alpha);
                    resolveCollisions();
                }

                function initializeNodeDepth() {
                    var ky = d3.min(nodesByBreadth, function (nodes) {
                        return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
                    });

                    nodesByBreadth.forEach(function (nodes) {
                        nodes.forEach(function (node, i) {
                            node.y = i;
                            node.dy = node.value * ky;
                        });
                    });

                    links.forEach(function (link) {
                        link.dy = link.value * ky;
                    });
                }

                function relaxLeftToRight(alpha) {
                    nodesByBreadth.forEach(function (nodes, breadth) {
                        nodes.forEach(function (node) {
                            if (node.targetLinks.length) {
                                var y =
                                    d3.sum(node.targetLinks, weightedSource) /
                                    d3.sum(node.targetLinks, value);
                                node.y += (y - center(node)) * alpha;
                            }
                        });
                    });

                    function weightedSource(link) {
                        return center(link.source) * link.value;
                    }
                }

                function relaxRightToLeft(alpha) {
                    nodesByBreadth
                        .slice()
                        .reverse()
                        .forEach(function (nodes) {
                            nodes.forEach(function (node) {
                                if (node.sourceLinks.length) {
                                    var y =
                                        d3.sum(node.sourceLinks, weightedTarget) /
                                        d3.sum(node.sourceLinks, value);
                                    node.y += (y - center(node)) * alpha;
                                }
                            });
                        });

                    function weightedTarget(link) {
                        return center(link.target) * link.value;
                    }
                }

                function resolveCollisions() {
                    nodesByBreadth.forEach(function (nodes) {
                        var node,
                            dy,
                            y0 = 0,
                            n = nodes.length,
                            i;

                        nodes.sort(ascendingDepth);
                        for (i = 0; i < n; ++i) {
                            node = nodes[i];
                            dy = y0 - node.y;
                            if (dy > 0) node.y += dy;
                            y0 = node.y + node.dy + nodePadding;
                        }

                        dy = y0 - nodePadding - size[1];
                        if (dy > 0) {
                            y0 = node.y -= dy;

                            for (i = n - 2; i >= 0; --i) {
                                node = nodes[i];
                                dy = node.y + node.dy + nodePadding - y0;
                                if (dy > 0) node.y -= dy;
                                y0 = node.y;
                            }
                        }
                    });
                }

                function ascendingDepth(a, b) {
                    return a.y - b.y;
                }
            }

            function computeLinkDepths() {
                nodes.forEach(function (node) {
                    node.sourceLinks.sort(ascendingTargetDepth);
                    node.targetLinks.sort(ascendingSourceDepth);
                });
                nodes.forEach(function (node) {
                    var sy = 0,
                        ty = 0;
                    node.sourceLinks.forEach(function (link) {
                        link.sy = sy;
                        sy += link.dy;
                    });
                    node.targetLinks.forEach(function (link) {
                        link.ty = ty;
                        ty += link.dy;
                    });
                });

                function ascendingSourceDepth(a, b) {
                    return a.source.y - b.source.y;
                }

                function ascendingTargetDepth(a, b) {
                    return a.target.y - b.target.y;
                }
            }

            function center(node) {
                return node.y + node.dy / 2;
            }

            function value(link) {
                return link.value;
            }

            return sankey;
        }

        function drawChart(data) {
            d3.sankey = d3Sankey;
            var units = "Widgets";
            var margin = { top: 10, right: 10, bottom: 10, left: 10 },
                width = 700 - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

            var formatNumber = d3.format(",.0f"),
                format = function (d) {
                    return formatNumber(d) + " " + units;
                },
                color = d3.scaleOrdinal(d3.schemeCategory10);

            var svg = d3
                .select("#chart")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var sankey = d3.sankey().nodeWidth(36).nodePadding(40).size([width, height]);
            var path = sankey.link();

            graph = { nodes: [], links: [] };

            data.forEach(function (d) {
                graph.nodes.push({ name: d.source });
                graph.nodes.push({ name: d.target });
                graph.links.push({ source: d.source, target: d.target, value: +d.value });
            });

            graph.nodes = d3.keys(
                d3
                    .nest()
                    .key(function (d) {
                        return d.name;
                    })
                    .object(graph.nodes)
            );

            graph.links.forEach(function (d, i) {
                graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
                graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
            });

            graph.nodes.forEach(function (d, i) {
                graph.nodes[i] = { name: d };
            });

            sankey.nodes(graph.nodes).links(graph.links).layout(32);

            var link = svg
                .append("g")
                .selectAll(".link")
                .data(graph.links)
                .enter()
                .append("path")
                .attr("class", "link")
                .attr("id", function (d, i) {
                    return "linkLabel" + i;
                })
                .attr("d", path)
                .style("stroke-width", function (d) {
                    return Math.max(1, d.dy);
                })
                .sort(function (a, b) {
                    return b.dy - a.dy;
                });

            link.append("title").text(function (d) {
                return d.source.name + " → " + d.target.name + "\n" + format(d.value);
            });

            var node = svg
                .append("g")
                .selectAll(".node")
                .data(graph.nodes)
                .enter()
                .append("g")
                .attr("class", "node")
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                })
                .call(
                    d3
                        .drag()
                        .subject(function (d) {
                            return d;
                        })
                        .on("start", function () {
                            this.parentNode.appendChild(this);
                        })
                        .on("drag", dragmove)
                );

            node.append("rect")
                .attr("height", function (d) {
                    return d.dy;
                })
                .attr("width", sankey.nodeWidth())
                .style("fill", function (d) {
                    return (d.color = color(d.name.replace(/ .*/, "")));
                })
                .style("stroke", function (d) {
                    return d3.rgb(d.color).darker(2);
                })
                .append("title")
                .text(function (d) {
                    return d.name + "\n" + format(d.value);
                });

            node.append("text")
                .attr("x", -6)
                .attr("y", function (d) {
                    return d.dy / 2;
                })
                .attr("dy", ".35em")
                .attr("text-anchor", "end")
                .attr("transform", null)
                .text(function (d) {
                    return d.name;
                })
                .filter(function (d) {
                    return d.x < width / 2;
                })
                .attr("x", 6 + sankey.nodeWidth())
                .attr("text-anchor", "start");

            var labelText = svg
                .selectAll(".labelText")
                .data(graph.links)
                .enter()
                .append("text")
                .attr("class", "labelText")
                .attr("dx", 113)
                .attr("dy", 0)
                .append("textPath")
                .attr("xlink:href", function (d, i) {
                    return "#linkLabel" + i;
                })
                .text(function (d, i) {
                    return "R" + d.value;
                });

            function dragmove(d) {
                d3.select(this).attr(
                    "transform",
                    "translate(" +
                        d.x +
                        "," +
                        (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) +
                        ")"
                );
                sankey.relayout();
                link.attr("d", path);
            }
        }
        drawChart(data);
    }, data);
};
