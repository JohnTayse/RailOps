var industries, locomotives, rollingstock;
var capacity;
var stock;
var difficulty;
var locos;
var locosselected = [];
var stockselected = [];
var setoutlist, switchlist;
var sessioncounter = 1;
var switchlistcounter = 1;

$(function()
{
    //localStorage.setItem("sessioncounter", 0);  //to reset session counter
    $('.controls').hide();
    getRRInfo();
});

function getRRInfo(){
	$.mobile.loading('show');
	$.getJSON('rrinfo.json', function (json) {
	    industries = json.industries;
	    locomotives = json.locomotives;
	    rollingstock = json.rollingstock;

	    capacity = 0;
		$.each(industries, function(){
            capacity += this.spots
		})
		stock = 0;
		$.each(rollingstock, function () {
		    stock += this.spots
		})

		pagesetup();

		$.mobile.loading('hide');

		$('#controls1').show();
    });
}

function pagesetup() {
    //Controls 3, number of locomotives
    var controls3 = '';
    controls3 += '<fieldset data-role="controlgroup">';
    controls3 += '<legend>Select Number of Locomotives:</legend>';
    $.each(locomotives, function (i) {
        controls3 += '<label><input type="radio" name="locomotives" value="' + (i + 1) + '" />' + (i + 1) + '</label>';
    })

    controls3 += '</fieldset>';
    controls3 += '<a href="#" class="ui-btn ui-corner-all" id="backto2">Back</a>';    

    $('#controls3').html(controls3).trigger('create');

    resumeSession();

    setbuttons();
}

function setbuttons() {
    $('#seshnew').click(function () {
        if ($('#session').html().length > 0) {
            if (confirm('Starting a new session will delete your current session. Are you sure you would like to start a new session?')) {
                $('#controls1').hide();
                $('#controls2').show();
                //todo uncheck previous selection
            }
        } else {
            $('#controls1').hide();
            $('#controls2').show();
        }
    })
    $('#seshresume').click(function () {
        $('#controls1').hide();
        $('#session').show();
    })
    $('#seshquick').click(function () {
        if ($('#session').html().length > 0) {
            if (confirm('Starting a new session will delete your current session. Are you sure you would like to start a new session?')) {
                startQuickSession();
            }
        } else {
            startQuickSession();
        }
    })
    $('#backto1').click(function () {
        $('#controls2').hide();
        $('#controls1').show();
    })
    $('#backto2').click(function () {
        $('#controls3').hide();
        $('#controls2').show();
    })

    $('input[name="difficulty"]').change(function () {
        var difficulty = $('input[name=difficulty]:checked').val();
        $('#controls2').hide();
        $('#controls3').show();
    })

    $('input[name="locomotives"]').change(function () {
        locos = $('input[name=locomotives]:checked').val();
        $('#controls3').hide();

        control4setup();

        $('#controls4').show();
    })
}

function control4setup() {
    //select locomotives or random selection->start session
    var controls4 = '';
    controls4 += '<fieldset data-role="controlgroup">';
    controls4 += '<legend>Select Number of Locomotives:</legend>';

    var checkboxorradio = ''
    if (locos > 1) {
        checkboxorradio = 'checkbox';
    } else {
        checkboxorradio = 'radio';
    }

    $.each(locomotives, function (i) {
        controls4 += '<label><input type="' + checkboxorradio + '" name="locos" marking="' + this.marking + '" number="' + this.number + '" desc="' + this.desc + '"/>' + this.marking + ' #' + this.number + ' | ' + this.desc + '</label>';
    })

    controls4 += '</fieldset>';
    controls4 += '<a href="#" class="ui-btn ui-corner-all" id="startsesh">Start Session!</a>';
    controls4 += '<a href="#" class="ui-btn ui-corner-all" id="backto3">Back</a>';

    $('#controls4').html(controls4).trigger('create');

    $('#backto3').click(function () {
        $('#controls4').hide();
        $('#controls3').show();
    })

    $('#startsesh').click(function () {
        var selectlocos = $('input[name=locos]:checked');

        if (selectlocos.length != locos) {
            alert('You have selected ' + selectlocos.length + ' locomotives but only chose to run ' + locos + ' this session. Either adjust your locomotive selection or go back and modify the number of locomotives you would like to run.');
        } else {
            $('#controls4').hide();

            //get locos into locosselected
            $.each(selectlocos, function () {
                var desc = $(this).attr('desc');
                var number = $(this).attr('number');
                var marking = $(this).attr('marking');
                var loco = {
                    "desc": desc,
                    "number": number,
                    "marking": marking
                }
                locosselected[locosselected.length] = loco;
            })

            setupSession();
        }
    })

}

function startQuickSession() {
    //quick session at easy difficulty with 1 locomotives
    $('#controls1').hide();
    difficulty = "easy";
    locos = 1;
    locosselected = shuffle(locomotives, 1);
    setupSession();
}

function setupSession() {
    sessioncounter++;
    switchlistcounter = 1;

    var numberofstock = 0;
    if (difficulty == "easy") {
        numberofstock = Math.floor(capacity * .65);
    } else if (difficulty == "med") {
        numberofstock = Math.floor(capacity * .8);
    } else if (difficulty == "hard") {
        numberofstock = Math.floor(capacity * .95);
    } else {
        numberofstock = capacity;
    }

    if (numberofstock > rollingstock.length) {
        numberofstock = rollingstock.length;
    }

    //todo something with the locomotive(s)

    stockselected = shuffle(rollingstock, numberofstock);

    var locationspots = [];
    $.each(industries, function () {
        var industry = this;
        for (var i = 0; i < industry.spots; i++) {
            locationspots[locationspots.length] = industry
        }
    })

    locationspots = shuffle(locationspots, locationspots.length);

    setoutlist = {
        "stock": stockselected,
        "locations": locationspots
    };

    var setoutlisthtml = setsetoutlisthtml(stockselected, locationspots);

    stockselected = shuffle(stockselected, stockselected.length);
    locationspots = shuffle(locationspots, locationspots.length);

    switchlist = {
        "stock": stockselected,
        "locations": locationspots
    };

    var switchlisthtml = setswitchlisthtml(stockselected, locationspots);    

    sessionhtml(setoutlisthtml, switchlisthtml);
    $('#session').show();
}

function nextswitchlist() {
    switchlistcounter++;
    setoutlist = switchlist;

    var stockselected = setoutlist.stock;
    var locationspots = setoutlist.locations;

    var setoutlisthtml = setsetoutlisthtml(stockselected, locationspots);

    stockselected = shuffle(stockselected, stockselected.length);
    locationspots = shuffle(locationspots, locationspots.length);

    switchlist = {
        "stock": stockselected,
        "locations": locationspots
    };

    var switchlisthtml = setswitchlisthtml(stockselected, locationspots);

    sessionhtml(setoutlisthtml, switchlisthtml);
    $('#session').show();
}

function resumeSession() {
    if (typeof (Storage) !== "undefined") {
        if (localStorage.getItem("setoutlist") !== null && localStorage.getItem("switchlist") !== null && localStorage.getItem("sessioncounter") !== null && localStorage.getItem("switchlistcounter") !== null) {
            $('#session').hide();
            setoutlist = JSON.parse(localStorage.getItem("setoutlist"));
            setoutlist = JSON.parse(localStorage.getItem("switchlist"));
            sessioncounter = localStorage.getItem("sessioncounter");
            switchlistcounter = localStorage.getItem("switchlistcounter");
            
            var stockselected = setoutlist.stock;
            var locationspots = setoutlist.locations;

            var setoutlisthtml = setsetoutlisthtml(stockselected, locationspots);

            stockselected = shuffle(stockselected, stockselected.length);
            locationspots = shuffle(locationspots, locationspots.length);

            switchlist = {
                "stock": stockselected,
                "locations": locationspots
            };

            var switchlisthtml = setswitchlisthtml(stockselected, locationspots);

            sessionhtml(setoutlisthtml, switchlisthtml);
        }
    } else {
        if (localstoragealerted !== true) {
            alert('Local storage not available. Sessions will not be saved.');
            localstoragealerted = true;
        }
    }
}

function setsetoutlisthtml(stockselected, locationspots) {
    var setoutlisthtml = '';
    setoutlisthtml += '<h3>Set Out</h3>';
    setoutlisthtml += '<table id="setout">';
    setoutlisthtml += '<thead>';
    setoutlisthtml += '<tr>';
    setoutlisthtml += '<th colspan="3">Rolling Stock</th>';
    setoutlisthtml += '<th>Location<th>'
    setoutlisthtml += '</tr>';
    setoutlisthtml += '</thead>';
    setoutlisthtml += '<tbody>';
    setoutlisthtml += '<tr>';
    setoutlisthtml += '<th>Desc</th>';
    setoutlisthtml += '<th>Type</th>';
    setoutlisthtml += '<th>Marking</th>';
    setoutlisthtml += '<th><th>'
    setoutlisthtml += '</tr>';
    $.each(stockselected, function (i) {
        setoutlisthtml += '<tr>';
        setoutlisthtml += '<td>' + stockselected[i].desc + '</td>';
        setoutlisthtml += '<td>' + stockselected[i].type + '</td>';
        setoutlisthtml += '<td>' + stockselected[i].marking + '</td>';
        setoutlisthtml += '<td>' + locationspots[i].desc + '</td>';
        setoutlisthtml += '<tr>';
    })
    setoutlisthtml += '</tbody>';
    return setoutlisthtml;
}

function setswitchlisthtml(stockselected, locationspots) {
    var switchlisthtml = '';
    switchlisthtml += '<h3>Switch List ' + switchlistcounter + '</h3>';
    switchlisthtml += '<table id="switchlist">';
    switchlisthtml += '<thead>';
    switchlisthtml += '<tr>';
    switchlisthtml += '<th colspan="3">Rolling Stock</th>';
    switchlisthtml += '<th>Location<th>'
    switchlisthtml += '</tr>';
    switchlisthtml += '</thead>';
    switchlisthtml += '<tbody>';
    switchlisthtml += '<tr>';
    switchlisthtml += '<th>Desc</th>';
    switchlisthtml += '<th>Type</th>';
    switchlisthtml += '<th>Marking</th>';
    switchlisthtml += '<th><th>'
    switchlisthtml += '</tr>';
    $.each(stockselected, function (i) {
        switchlisthtml += '<tr>';
        switchlisthtml += '<td>' + stockselected[i].desc + '</td>';
        switchlisthtml += '<td>' + stockselected[i].type + '</td>';
        switchlisthtml += '<td>' + stockselected[i].marking + '</td>';
        switchlisthtml += '<td>' + locationspots[i].desc + '</td>';
        switchlisthtml += '<tr>';
    })
    switchlisthtml += '</tbody>';
    return switchlisthtml;
}

function sessionhtml(setoutlisthtml, switchlisthtml) {
    $('#session').html('<h1>Session ' + sessioncounter + '</h1>');
    $('#session').append(setoutlisthtml).trigger('create');
    $('#session').append(switchlisthtml).trigger('create');

    var seshcontrols = '';
    seshcontrols += '<a href="#" class="ui-btn ui-corner-all" id="nextsl">Next Switch List</a>';
    seshcontrols += '<a href="#" class="ui-btn ui-corner-all" id="seshbackto1">Home</a>';

    $('#session').append(seshcontrols).trigger('create');

    $('#nextsl').click(function () {
        nextswitchlist();
    })

    $('#seshbackto1').click(function () {
        $('#controls1').show();
        $('#session').hide();
    })

    $('tbody tr').click(function () {
        console.log($(this).css('background-color'))

        if ($(this).css('background-color') == 'rgb(243, 243, 21)') {
            $(this).css('background-color', '#F9F9F9');
        } else {
            $(this).css('background-color', '#F3F315');
        }
    })

    savepoint();
}

function savepoint() {
    //saves session settings to local storage
    if (typeof (Storage) !== "undefined") {
        localStorage.setItem("setoutlist", JSON.stringify(setoutlist));
        localStorage.setItem("switchlist", JSON.stringify(switchlist));
        localStorage.setItem("sessioncounter", sessioncounter);
        localStorage.setItem("switchlistcounter", switchlistcounter);
    } else {
        if (localstoragealerted !== true) {
            alert('Local storage not available. Sessions will not be saved.');
            localstoragealerted = true;
        }
    }
}

function shuffle(array, elements) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array.slice(0, elements);
}