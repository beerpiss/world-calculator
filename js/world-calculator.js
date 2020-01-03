function calculate() {
    document.getElementById("step-to-foward-invalid").style = "";
    document.getElementById("step-invalid").style = "";
    document.getElementById("step-to-forward-min").classList.remove("is-invalid");
    document.getElementById("step-to-forward-max").classList.remove("is-invalid");
    document.getElementById("character-step").classList.remove("is-invalid");
    var min = document.getElementById("step-to-forward-min").value;
    var max = document.getElementById("step-to-forward-max").value;
    var step = document.getElementById("character-step").value;
    if(isNaN(min) || isNaN(max) || isNaN(step) || min * 1 > max * 1) {
        if(isNaN(min)) { document.getElementById("step-to-foward-invalid").style = "display: block"; document.getElementById("step-to-forward-min").classList.add("is-invalid"); }
        if(isNaN(max)) { document.getElementById("step-to-foward-invalid").style = "display: block"; document.getElementById("step-to-forward-max").classList.add("is-invalid"); }
        if(isNaN(step)) { document.getElementById("step-invalid").style = "display: block"; document.getElementById("character-step").classList.add("is-invalid"); }
        if(!isNaN(min) && !isNaN(max) && min * 1 > max * 1) {
            document.getElementById("step-to-foward-invalid").innerHTML = "최댓값은 최솟값 이상이여야 합니다.";
            document.getElementById("step-to-foward-invalid").style = "display: block";
            document.getElementById("step-to-forward-max").classList.add("is-invalid");
        }
        return;
    }
    var chart_potential_min = Math.pow(((((min * 50) / step) - 2.5) / 2.45), 2);
    var chart_potential_max = Math.pow(((((max * 50) / step) - 2.5) / 2.45), 2);
    $.ajaxSetup({beforeSend: function(xhr){
        if (xhr.overrideMimeType) {
          xhr.overrideMimeType("application/json");
        }
    }});
    $.getJSON("static/data/songlist.json", function(data) {
        var songs = data["songs"];
        var songdiv = document.getElementById("song-table");
        var tbl = document.createElement("table");
        tbl.classList.add("table");
        var thead = document.createElement("thead");
        var headtr = document.createElement("tr");
        var thsn = document.createElement("th");
        thsn.appendChild(document.createTextNode("곡 명"));
        headtr.appendChild(thsn);
        var thr = document.createElement("th");
        thr.appendChild(document.createTextNode("난이도"));
        headtr.appendChild(thr);
        var thdr = document.createElement("th");
        thdr.appendChild(document.createTextNode("세부 난이도"));
        headtr.appendChild(thdr);
        var thsr = document.createElement("th");
        thsr.appendChild(document.createTextNode("점수 범위"));
        headtr.appendChild(thsr);
        thead.appendChild(headtr);
        tbl.appendChild(thead);
        var tbody = document.createElement("tbody");
        for(var i = 0; i < songs.length; i++) {
            console.log("Reading " + songs[i]["title_localized"]["en"] + "...");
            var charts = songs[i]["difficulties"]
            for(var j = 0; j < 3; j++) {
                var score_min = get_score(charts[j]["detailed_rating"], chart_potential_min).toFixed(0);
                var score_max = get_score(charts[j]["detailed_rating"], chart_potential_max).toFixed(0);
                console.log("score_min: " + score_min + ", score_max: " + score_max);
                var score_string = "";
                if(score_min >= 0) {
                    score_string += score_min;
                }
                score_string += "~";
                if(score_max >= 0) {
                    score_string += score_max;
                }
                if(score_string == "~") continue;
                var tr = document.createElement("tr");
                var tdsn = document.createElement("td");
                tdsn.appendChild(document.createTextNode(songs[i]["title_localized"]["en"]));
                tr.appendChild(tdsn);
                var tdr = document.createElement("td");
                var tdrColors = ["text-primary", "text-success", "text-danger"];
                var tdrText = ["PAST ", "PRESENT ", "FUTURE "];
                tdr.classList.add(tdrColors[j]);
                tdr.appendChild(document.createTextNode(tdrText[j] + charts[j]["rating"]));
                tr.appendChild(tdr);
                var tddr = document.createElement("td");
                tddr.appendChild(document.createTextNode(charts[j]["detailed_rating"]));
                tr.appendChild(tddr);
                var tdsr = document.createElement("td");
                tdsr.appendChild(document.createTextNode(score_string));
                tr.appendChild(tdsr);
                tbody.appendChild(tr);
            }
        }
        tbl.appendChild(tbody);
        songdiv.appendChild(tbl);
    });
}

function get_score(detailed_rating, chart_potential) {
    console.log("detailed_rating:" + detailed_rating + ", chart_potential:" + chart_potential);
    var score_mod = chart_potential - detailed_rating;
    if(score_mod < -30 || score_mod > 2) {
        return -1;
    }
    if(score_mod == 2) {
        return 10000000;
    } else if(score_mod >= 1.5) {
        return ((score_mod - 1.5) * 100000) + 9950000;
    } else if(score_mod >= 1.0) {
        return ((score_mod - 1.0) * 400000) + 9800000;
    }
    return (score_mod * 300000) + 9500000;
}