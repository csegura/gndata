/*
 descripción de los datos

 anyo - año del dato
 cod_proyecto - código del proyecto
 cod_gestor - código del centro gestor
 cod_funcional - código del area funcional
 texto - partida (explicación del gasto?)
 importe
 cod_gestor2 - código del centro gestor 2 digitos (padre)
 gestor - centro gestor (descripción)
 cod_funcion2 - código del área funcional 2 digitos
 funcion - área funcional (descripion)
 cod_proyecto2 - código del proyecto
 proyecto - descripción del proyecto
 economico - partida económica
 */

// format numbers helpers
var dateFormat = d3.time.format("%Y");
var numberFormat = d3.format(",f");
var millionFormat = d3.format(".2s");
var euroFormat = function (d) {
    return millionFormat(d).replace('M', 'M eur').replace('G', 'MM eur');
};
var percentFormat = d3.format(".2%");
var incrementFormat = function(d) {
    if (isNaN(d)) return "";
    if (!isFinite(d)) return "";
    if (d == 0) return "↔";
    return (d<0 ? "⇡ " : "⇣ ")+percentFormat(Math.abs(d));
};


// tooltips for row chart
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) {
        return "<span class='tip-label'>" + d.key + "</span> : " + numberFormat(d.value);
    });

// tooltips for bar chart
var barTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) {
        return "<span class='tip-label'>" + d.data.key + "</span> : " + numberFormat(d.y);
    });

/*
 // how do I get the charts to reset all of their filters and transition during the redraw?
 if ((gastosPorGestorRC.filters().length |
 gastosPorAnyoBC.filters().length |
 gastosPorFuncionRC.filters().length ) > 0) {
 dc.redrawAll("c-gastos");
 }
 else {
 dc.renderAll("c-gastos");
 }
 */

// rotate the x Axis labels
function formatXAxis() {
    d3.selectAll("g.x text")
        .attr("class", "campusLabel")
        .style("text-anchor", "end")
        .attr("transform", "translate(-10,0)rotate(315)");
}

function setUpToolTips() {
    d3.selectAll("g.row").call(tip);
    d3.selectAll("g.row").on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    /*
     d3.selectAll(".pie-slice").call(pieTip);
     d3.selectAll(".pie-slice").on('mouseover', pieTip.show)
     .on('mouseout', pieTip.hide);
     */

    d3.selectAll(".bar").call(barTip);
    d3.selectAll(".bar").on('mouseover', barTip.show)
        .on('mouseout', barTip.hide);
}

// store relevant data (resume data)
var anyos = [];

function getAnyosByKey(criteria) {
    return anyos.filter(function(obj) {
        return Object.keys(criteria).every(function(c) {
            return obj[c] == criteria[c];
        });
    })[0];
}

function addAnyos(o) {
    anyos.push(o);
    return o;
}

var gastosPorFuncionRC = dc.rowChart("#graficoPorFuncion", "c-gastos");
var gastosPorGestorRC = dc.rowChart("#graficoPorCentroGestor", "c-gastos");
var gastosPorAnyoBC = dc.barChart("#graficoPorAnyo", "c-gastos");

var g;
var dsv = d3.dsv(";", "text/plain");

var gastosPorAnyo;
var gastosPorAnyoGrupo;

// set dc.js version in title
d3.selectAll("#version").text(dc.version);

// load data from a csv file
dsv("data/gndata.csv", function (error, data) {
        console.log(error);

        // feed it through crossfilter
        var ndx = crossfilter(data);
        var all = ndx.groupAll();

        var gastosPorFuncion = ndx.dimension(function (d) {
            return d.funcion;
        });

        var gastosPorFuncionGrupo = gastosPorFuncion.group().reduceSum(function (d) {
            return d.importe;
        });

        var gastosPorCentro = ndx.dimension(function (d) {
            return d.gestor;
        });

        var gastosPorCentroGrupo = gastosPorCentro.group().reduceSum(function (d) {
            return d.importe;
        });

        gastosPorAnyo = ndx.dimension(function (d) {
            return d.anyo;
        });

        gastosPorAnyoGrupo = gastosPorAnyo.group().reduceSum(function (d) {
            return d.importe;
        });

/*
        // TODO clean up this part
        // tooltips for row chart
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                return "<span style='color: #f0027f'>" + d.key + "</span> : " + numberFormat(d.value);
            });

        // tooltips for pie chart
        var pieTip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                return "<span style='color: #f0027f'>" + d.data.key + "</span> : " + numberFormat(d.value);
            });

        // tooltips for bar chart
        var barTip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                return "<span style='color: #f0027f'>" + d.data.key + "</span> : " + numberFormat(d.y);
            });
*/

        gastosPorAnyoBC.width(300)
            .height(200)
            .transitionDuration(750)
            .margins({top: 40, right: 0, bottom: 40, left: 80})
            .dimension(gastosPorAnyo)
            .group(gastosPorAnyoGrupo)
            .elasticY(true)
            .brushOn(false)
            .title(function (d) {
                return "";
            })
            .colors(['#FFCC5C'])
            .xUnits(function () {
                return 5;
            })
            .elasticX(false)
            .x(d3.scale.linear().domain([2010, 2014]))
            .y(d3.scale.ordinal())
            .renderHorizontalGridLines(true)
            .xAxis().ticks(4);

        gastosPorAnyoBC.yAxis()
            .ticks(6)
            .tickFormat(euroFormat);

        gastosPorFuncionRC.width(500)
            .height(500)
            .margins({top: 0, left: 5, right: 0, bottom: 20})
            .transitionDuration(750)
            .dimension(gastosPorFuncion)
            .group(gastosPorFuncionGrupo)
            .colors(['#FF6F69'])
            .label(function(d) {
                return d.key + "(" +
                    percentFormat(d.value / (d3.sum(gastosPorFuncionGrupo.all(), function(d){ return d.value; }))) + ")"; })
            .gap(2)
            .title(function (d) {
                return "";
            })
            .renderLabel(true)
            .elasticX(true)
            .xAxis().ticks(5).tickFormat(euroFormat);

        gastosPorGestorRC.width(960)
            .height(1300)
            .transitionDuration(800)
            .margins({top: 20, right: 10, bottom: 20, left: 10})
            .dimension(gastosPorCentro)
            .group(gastosPorCentroGrupo)
            .title(function (d) {
                return "";
            })
            .gap(1)
            .elasticX(true)
            .colors(['#AAD8B0'])
            .x(d3.scale.linear())
            .xAxis().tickFormat(euroFormat);

        // todo
        gastosPorGestorRC.ordering(function (a,b) {
            return a.value > b.value;
        });

        // update counter
        dc.dataCount(".dc-data-count", "c-gastos")
            .dimension(ndx)
            .group(all);

        // recalc table data
        gastosPorAnyoBC.on("postRedraw", function(chart){
            dc.events.trigger(function() {
                recalcAnyosData();
            });
        });

        dc.renderAll("c-gastos");

        // slider year selector
        $("#sliderAnyo").change(function(ev) {
            var anyo = $(this).val();
            $("#labelAnyo").text(anyo);
            gastosPorAnyo.filter(anyo);
            dc.renderAll("c-gastos");
            setUpToolTips();
            recalcAnyosData();
        });

        // calc totals year
        gastosPorAnyoGrupo.top(4).forEach(function(i,e) {
            var anyo = getAnyosByKey({key: i.key});
            if (anyo == undefined) {
                anyo = addAnyos(i);
            }
            anyo.total = i.value;
            $("#anyo"+ i.key+"val").text(numberFormat(anyo.total));
        });

        // recalculate
        function recalcAnyosData() {
            console.log("recalcAnyosData");

            // calc totals year
            gastosPorAnyoGrupo.orderNatural().top(4).forEach(function(i,e) {
                var anyo = getAnyosByKey({key: i.key});
                anyo.imp = i.value;
                anyo.pct = anyo.imp / anyo.total;
                $("#anyo" + i.key + "pct").text(percentFormat(anyo.pct));
                $("#anyo" + i.key + "imp").text(numberFormat(anyo.imp));
                var anyoPrev = getAnyosByKey({key: ""+((+i.key)-1)});
                if (anyoPrev == undefined) {
                } else {
                    anyo.prev = (anyoPrev.value-anyo.value) / anyoPrev.value;
                    $("#anyo" + i.key + "var").text(incrementFormat(anyo.prev));
                }

            });

            // calc variation 2010-2014
            var vari = ((anyos[0].value-anyos[3].value)/(anyos[0].value));
            $("#anyo2010var").text(incrementFormat(vari));
        }

        // setup start filter
        gastosPorAnyo.filter(2013);

        recalcAnyosData();
        formatXAxis();
        setUpToolTips();
    }

);
