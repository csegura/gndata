/**
 * Created by csegura on 03/01/14.
 */

var imp = false;

$('input[name="sel"]').change(function () {
    imp = $(this).val() == "1";
    loadData();
});

var width = 960,
    height = 1000,
    outerRadius = Math.min(width, height) / 2 - 10,
    innerRadius = outerRadius - 250;

var format = d3.format(",.2f");

var formatValue = function (v) {
    return (imp ? format(v) + "M" : Math.round(v));
};

loadData();

function loadData() {

    d3.select(".ch-chart").remove();

    var svg = d3.select("#chart").append("svg")
        .attr("class", "ch-chart")
        .attr("width", outerRadius * 2)
        .attr("height", outerRadius * 2)
        .append("g")
        .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

    var fill = d3.scale.category20c();

    var chord = d3.layout.chord()
        .padding(.02)
        .sortSubgroups(d3.descending)
        .sortChords(d3.descending);

    var arc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(innerRadius + 20);


    d3.json("data/gndata-chord-fn-2013.json", function (error, root) {
        var indexByName = d3.map(),
            nameByIndex = d3.map(),
            matrix = [],
            n = 0;

        // Returns the Flare package name for the given class name.
        function name(name) {
            return name;
        }

        var insertData = function (name) {
            if (!indexByName.has(name)) {
                nameByIndex.set(n, name);
                indexByName.set(name, n++);
                console.log(name, n);
            }
        };

        // Compute a unique index for each package name.
        root.forEach(function (d) {
            insertData(name(d.name));
            d.imports.forEach(function (d) {
                insertData(name(d));
            })
        });

        var getOrCreateRow = function (d) {
            var source = indexByName.get(name(d)),
                row = matrix[source];
            if (!row) {
                row = matrix[source] = [];
                for (var i = -1; ++i < n;) row[i] = 0;
            }
            return row;
        }

        // Construct a square matrix counting package imports.
        root.forEach(function (d) {
            var row = getOrCreateRow(d.name);
            d.imports.forEach(function (z) {
                row[indexByName.get(name(z))] += (imp ? d.size : 1);
            });
        });

        root.forEach(function (d) {
            d.imports.forEach(function (d) {
                var row = getOrCreateRow(d);
                //row[indexByName.get(name(d))]++;
            })
        });

        chord.matrix(matrix);

        var g = svg.selectAll(".group")
            .data(chord.groups)
            .enter().append("g")
            .attr("class", "group")
            .on("mouseover", fade(0.1))
            .on("mouseout", fade(1));

        // Add a mouseover title.
        g.append("title").text(function (d, i) {
            return nameByIndex.get(i) + ": " + formatValue(d.value);
        });

        g.append("path")
            .style("fill", function (d) {
                return fill(d.index);
            })
            .style("stroke", function (d) {
                return fill(d.index);
            })
            .attr("d", arc);

        g.append("text")
            .each(function (d) {
                d.angle = (d.startAngle + d.endAngle) / 2;
            })
            .attr("dy", ".35em")
            .attr("transform", function (d) {
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                    + "translate(" + (innerRadius + 26) + ")"
                    + (d.angle > Math.PI ? "rotate(180)" : "");
            })
            .style("text-anchor", function (d) {
                return d.angle > Math.PI ? "end" : null;
            })
            .text(function (d) {
                return nameByIndex.get(d.index);
            });

        var chords = svg.selectAll(".chord")
            .data(chord.chords)
            .enter().append("path")
            .attr("class", "chord")
            .style("stroke", function (d) {
                return d3.rgb(fill(d.source.index)).darker();
            })
            .style("fill", function (d) {
                return fill(d.source.index);
            })
            .attr("d", d3.svg.chord().radius(innerRadius));


        // Add an elaborate mouseover title for each chord.
        chords.append("title").text(function (d) {
            return nameByIndex.get(d.source.index)
                + " → " + nameByIndex.get(d.target.index)
                + ": " + formatValue(d.source.value)
                + "\n" + nameByIndex.get(d.target.index)
                + " → " + nameByIndex.get(d.source.index)
                + ": " + formatValue(d.target.value);
        });

        function fade(opacity) {
            return function (g, i) {
                chords.filter(function (d) {
                    return d.source.index != i && d.target.index != i;
                }).transition().style("opacity", opacity);
            };
        }


    });
}