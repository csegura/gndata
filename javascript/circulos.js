/**
 * Created by csegura on 02/01/14.
 */

$('input[name="years"]').change(function () {
    loadData($(this).val());
});

var margin = 10,
    outerDiameter = 960,
    innerDiameter = outerDiameter - margin - margin;

var x = d3.scale.linear()
    .range([0, innerDiameter]);

var y = d3.scale.linear()
    .range([0, innerDiameter]);

var color = d3.scale.linear()
    .domain([-1, 5])
    .range(["#708C6F", "#A3CCA2"])
    .interpolate(d3.interpolateHcl);

var pack = d3.layout.pack()
    .padding(2)
    .size([innerDiameter, innerDiameter])
    .value(function (d) {
        return d.size;
    });

var format = d3.format(",.2f");

function loadData(year) {

    d3.select(".ct-chart").remove();

    var svg = d3.select("#chart")
        .append("div")
        .attr("class", "ct-chart")
        .style("width", outerDiameter + "px")
        .style("height", outerDiameter + "px")
        .append("svg")
        .attr("width", outerDiameter)
        .attr("height", outerDiameter)
        .append("g")
        .attr("transform", "translate(" + margin + "," + margin + ")");

    d3.json("data/gndata-c-fn-" + year + ".json", function (error, root) {
        var focus = root,
            nodes = pack.nodes(root);

        svg.append("g").selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("class", function (d) {
                return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
            })
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .attr("r", function (d) {
                return d.r;
            })
            .style("fill", function (d) {
                return d.children ? color(d.depth) : null;
            })
            .on("click", function (d) {
                return zoom(focus == d ? root : d);
            });

        svg.append("g").selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("class", "zcp-label")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .style("fill-opacity", function (d) {
                return d.parent === root ? 1 : 0;
            })
            .style("display", function (d) {
                return d.parent === root ? null : "none";
            })
            .text(function (d) {
                return d.name + " (" + format(d.size) + "M)";
            });

        svg.selectAll(".zcp-label").call(wrap, 150);

        d3.select(window)
            .on("click", function () {
                zoom(root);
            });

        function zoom(d, i) {
            var focus0 = focus;
            focus = d;

            var k = innerDiameter / d.r / 2;
            x.domain([d.x - d.r, d.x + d.r]);
            y.domain([d.y - d.r, d.y + d.r]);
            d3.event.stopPropagation();

            var transition = d3.selectAll("text,circle").transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .attr("transform", function (d) {
                    return "translate(" + x(d.x) + "," + y(d.y) + ")";
                });

            transition.filter("circle")
                .attr("r", function (d) {
                    return k * d.r;
                });

            transition.filter("text")
                .filter(function (d) {
                    return d.parent === focus || d.parent === focus0;
                })
                .style("fill-opacity", function (d) {
                    return d.parent === focus ? 1 : 0;
                })
                .each("start", function (d) {
                    if (d.parent === focus) this.style.display = "inline";
                })
                .each("end", function (d) {
                    if (d.parent !== focus) this.style.display = "none";
                });

        }
    });

    d3.select(self.frameElement).style("height", outerDiameter + "px");

    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }
}