/**
 * Created by csegura on 03/01/14.
 */

$('input[name="years"]').change(function () {
    //alert($(this).val())
    loadData($(this).val());
});

var w = 960,
    h = 900,
    x = d3.scale.linear().range([0, w]),
    y = d3.scale.linear().range([0, h]);

var partition = d3.layout.partition()
    .value(function (d) {
        return d.size;
    });

var format = d3.format(",.2f");

function loadData(year) {

    d3.select(".ct-chart").remove();

    var vis = d3.select("#chart").append("div")
        .attr("class", "ct-chart")
        .style("width", w + "px")
        .style("height", h + "px")
        .append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    d3.json("data/gndata-c-fn-" + year + ".json", function (root) {
        var g = vis.selectAll("g")
            .data(partition.nodes(root))
            .enter().append("svg:g")
            .attr("transform", function (d) {
                return "translate(" + x(d.y) + "," + y(d.x) + ")";
            })
            .on("click", click);

        var kx = w / root.dx,
            ky = h / 1;

        g.append("svg:rect")
            .attr("width", root.dy * kx)
            .attr("height", function (d) {
                return d.dx * ky;
            })
            .attr("class", function (d) {
                return d.children ? "ct-parent" : "ct-child";
            });

        g.append("svg:text")
            .attr("transform", transform)
            .attr("dy", ".35em")
            .style("opacity", function (d) {
                return d.dx * ky > 12 ? 1 : 0;
            })
            .text(function (d) {
                return label(d)
            });

        d3.select(window)
            .on("click", function () {
                click(root);
            });

        function click(d) {
            if (!d.children) return;

            kx = (d.y ? w - 40 : w) / (1 - d.y);
            ky = h / d.dx;
            x.domain([d.y, 1]).range([d.y ? 40 : 0, w]);
            y.domain([d.x, d.x + d.dx]);

            var t = g.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .attr("transform", function (d) {
                    return "translate(" + x(d.y) + "," + y(d.x) + ")";
                });

            t.select("rect")
                .attr("width", d.dy * kx)
                .attr("height", function (d) {
                    return d.dx * ky;
                });

            t.select("text")
                .attr("transform", transform)
                .style("opacity", function (d) {
                    return d.dx * ky > 12 ? 1 : 0;
                });


            d3.event.stopPropagation();

        }

        function transform(d) {
            return "translate(8," + d.dx * ky / 2 + ")";
        }

        function label(d) {
            var s = d.name + " (" + format(d.size) + "M)";
            s += d.parent ? "[" + format(parent_size(d)) + "%]" : " - " + year;
            return s;
        }

        function parent_size(d) {
            return d.parent ? (d.size / d.parent.size) * 100 : 0;
        }

    });
}