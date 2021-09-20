var lang_ko = {
    "tableHelp": "<p>Ctrl+F 를 이용하여 원하는 곡을 검색하면 빠르게 찾을 수 있습니다.</p>\n<p>하드게이지 클리어 실패는 2.5 * (파트너 STEP 수치 / 50) 으로 계산합니다.</p>",
    "minIsBigger": "최댓값은 최솟값 이상이여야 합니다.",
    "songName": "곡 명",
    "rating": "난이도",
    "detailedRating": "세부 난이도(최대 스텝 수)",
    "scoreRange": "점수 범위",
    "impossiblePartner": "해당 파트너는 지정한 범위만큼 이동하는 것이 불가능합니다 :(",
    "noSongs": "해당 범위만큼 전진할 수 있도록 하는 곡이 존재하지 않습니다. :(",
    "jsonPath": "static/data/songlist.json"
}


var lang_en = {
    "tableHelp": "<p>Use Ctrl+F to find desired songs.</p>\n<p>If you failed with HARD gauge partners, 2.5 * (Partner's STEP stat / 50) is your step progress.</p>",
    "minIsBigger": "Input value is must be number.",
    "songName": "Song title",
    "rating": "Difficulty",
    "detailedRating": "Chart constant(Max. step progress)",
    "scoreRange": "Score range",
    "impossiblePartner": "Selected Partner is impossible to progress desired range :(",
    "noSongs": "No songs available to progress desired range :(",
    "jsonPath": "../static/data/songlist.json"
}

function ln(lang, index) {
    if(lang == "en") {
        return lang_en[index];
    }
    return lang_ko[index];
}


function calculate(l) {
    document.getElementById("song-table").innerHTML = ln(l, "tableHelp");
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
            document.getElementById("step-to-foward-invalid").innerHTML = ln(l, "minIsBigger");
            document.getElementById("step-to-foward-invalid").style = "display: block";
            document.getElementById("step-to-forward-max").classList.add("is-invalid");
        }
        return;
    }
    var songdiv = document.getElementById("song-table");
    var chart_potential_min = Math.pow((((min * (50 / step)) - 2.5) / 2.45), 2);
    var chart_potential_max = Math.pow((((max * (50 / step)) - 2.5) / 2.45), 2);
    if((((max * (50 / step)) - 2.5) / 2.45) < 0) {
        var div = document.createElement("div");
        div.style = "padding: 30px 0; text-align: center;";
        div.appendChild(document.createTextNode(ln(l, "impossiblePartner")));
        songdiv.appendChild(div);
        songdiv.style = "display: block;";
        return;
    }
    if((((min * (50 / step)) - 2.5) / 2.45) < 0) chart_potential_min = -31;
    $.ajaxSetup({beforeSend: function(xhr){
        if (xhr.overrideMimeType) {
          xhr.overrideMimeType("application/json");
        }
    }});
    $.getJSON(ln(l, "jsonPath"), function(data) {
        var songs = data["songs"];
        var added = false;
        for(var i = 0; i < songs.length; i++) {
            //console.log("Processing " + songs[i]["title_localized"]["en"] + "...");
            var charts = songs[i]["difficulties"]
            var chartDiv = document.createElement("div");
            chartDiv.classList.add("row");
            var div = document.createElement("div");
            div.classList.add("col-lg");
            var h5 = document.createElement("h5");
            h5.innerHTML = songs[i]["title_localized"]["en"];
            div.appendChild(h5);
            div.appendChild(document.createTextNode(songs[i]["artist"]));
            chartDiv.appendChild(div);
            var chartAdded = false;
            for(var j = 0; j <= charts.length; j++) {
                var score_min = get_rating(charts[j]["detailed_rating"], chart_potential_min).toFixed(0) * 1;
                var score_max = get_rating(charts[j]["detailed_rating"], chart_potential_max).toFixed(0) * 1;
                if(score_min == -1 || score_max == -2) continue;
                var score_string = "";
                if(score_min >= 0) {
                    score_string += score_min.toLocaleString();
                } else {
                    score_string += 0;
                }
                score_string += "~";
                if(score_max == 10000000 || score_max < 0) {
                    score_string += ""
                } else if(score_max >= 0) {
                    score_string += score_max.toLocaleString();
                }
                var rating_string = charts[j]["rating"]
                var rating_plus = charts[j]["ratingPlus"]
                if (rating_plus) rating_string += "+"
                added = true;
                chartAdded = true;
                var colDiv = document.createElement("div");
                colDiv.style = "margin: 0 5px";
                colDiv.classList.add("col-sm-2");
                var badgeColors = ["badge-primary", "badge-success", "badge-danger", "badge-danger"];
                var badgeText = ["PAST ", "PRESENT ", "FUTURE ", "BEYOND "];
                var badge = document.createElement("span");
                badge.classList.add("badge");
                badge.classList.add("badge-pill");
                badge.classList.add(badgeColors[j]);
                badge.innerHTML = badgeText[j] + rating_string + "(" + charts[j]["detailed_rating"].toFixed(1) + ")";
                colDiv.appendChild(badge);
                colDiv.appendChild(document.createElement("br"));
                colDiv.appendChild(document.createTextNode(score_string));
                chartDiv.appendChild(colDiv);
                //tddr.appendChild(document.createTextNode(charts[j]["detailed_rating"] + "(" + ((2.45 * Math.sqrt(charts[j]["detailed_rating"] + 2) + 2.5) * (step / 50)).toFixed(1) + ")"));
            }
            if(chartAdded) {
                songdiv.appendChild(document.createElement("hr"));
                songdiv.appendChild(chartDiv);
            }
        }
        if(!added) {
            var div = document.createElement("div");
            div.style = "padding: 30px 0; text-align: center;";
            div.appendChild(document.createTextNode(ln(l, "noSongs")));
            songdiv.appendChild(div);
        }
        songdiv.style = "display: block;";
    });
}

function get_rating(detailed_rating, chart_potential) {
    //console.log("detailed_rating:" + detailed_rating + ", chart_potential:" + chart_potential);
    var score_mod = chart_potential - detailed_rating;
    if(score_mod < -30) {
        // target score is too low
        return -2;
    }
    if(score_mod > 2) {
        // target score is too high
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

function get_fars_over(score, note_count){
    return ((1e7 - score) / (1e7 / (2 * note_count)).toFixed(0)).toFixed(0)
}

function get_fars_not_over(score, note_count){
    var e = (1e7 - score) / (1e7 / (2 * note_count)).toFixed(0);
    return e > e.toFixed(0) && e++, e.toFixed(0)
}