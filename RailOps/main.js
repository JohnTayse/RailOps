var industries, locomotives, rollingstock;
var capacity;
var locationspots = [];
var stock;
var difficulty;
var locos;
var locosselected = [];
var setoutlist, switchlist;
var sessioncounter = 1;
var switchlistcounter = 1;
var industryOrder = [];
var locomotiveOrder = [];
var rollingstockOrder = [];

$(function()
{
    $('.controls').hide();
    if (!hasSessionToResume()) {
        $('#seshresume').hide();
    }
    getRRInfo();
});

function getRRInfo(){
	$.mobile.loading('show');
	$.getJSON('rrinfo.json', function (json) {
	    industries = json.industries;
	    locomotives = json.locomotives;
	    rollingstock = json.rollingstock;

	    capacity = 0;
	    $.each(industries, function () {
	        var industry = this;
	        capacity += industry.spots;
		    for (var i = 0; i < industry.spots; i++) {
		        locationspots[locationspots.length] = industry;
		    }
		})
		stock = 0;
		$.each(rollingstock, function () {
		    stock += this.spots;
		});

		fillOrderObject(industryOrder, industries);
		fillOrderObject(locomotiveOrder, locomotives);
		fillOrderObject(rollingstockOrder, rollingstock);

		pagesetup();

		$.mobile.loading('hide');

		$('#controls1').show();
    });
}

function fillOrderObject(orderArray, orderObject){
    for (var i = 1; i <= Object.keys(orderObject).length; i++){
        orderArray[orderArray.length] = "" + i + "";
    }
}

function pagesetup() {
    //Controls 3, number of locomotives
    var controls3 = '';
    controls3 += '<fieldset data-role="controlgroup">';
    controls3 += '<legend>Select Number of Locomotives:</legend>';
    $.each(locomotives, function (i) {
        controls3 += '<label><input type="radio" name="locomotives" value="' + (Number(i) + 1) + '" />' + (Number(i) + 1) + '</label>';
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
    $('#btnSettings').click(function () {
        $('#controls1').hide();
        $('#settings').show();

        settingssetup();
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

function settingssetup() {
    var settings = '';
    settings += '<a href="#" class="ui-btn ui-corner-all" id="resetseshcount">Reset Session Count</a>';
    settings += '<a href="#" class="ui-btn ui-corner-all" id="resetcurrentsesh">Reset Current Session</a>';
    settings += '<a href="#" class="ui-btn ui-corner-all" id="settingsbackto1">Home</a>';

    $('#settings').html(settings).trigger('create');

    if (!hasSessionToResume()) {
        $('#resetcurrentsesh').hide();
    }

    $('#resetseshcount').click(function () {
        if (confirm('This action will reset the session counter which cannot be undone. Continue?')) {
            localStorage.setItem("sessioncounter", 0);
            sessioncounter = 1;
            $('#session h1').html('Session ' + sessioncounter);
        }
    })

    $('#resetcurrentsesh').click(function () {
        if (confirm('This action will reset the current session which cannot be undone. Continue?')) {
            localStorage.removeItem("setoutlist");
            localStorage.removeItem("switchlist");
            localStorage.removeItem("switchlistcounter");
            $('#seshresume').hide();
            $('#resetcurrentsesh').hide();
        }
    })

    $('#settingsbackto1').click(function () {
        $('#controls1').show();
        $('#settings').hide();
    })
}

function startQuickSession() {
    //quick session at easy difficulty with 1 locomotives
    $('#controls1').hide();
    difficulty = "easy";
    locos = 1;
    locosselected = shuffle(locomotives)[0];
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

    if (numberofstock > ObjectLength(rollingstock)) {
        numberofstock = ObjectLength(rollingstock);
    }

    //todo something with the locomotive(s)

    var setoutstock = shuffle(createNumberArray(ObjectLength(rollingstock))).slice(0, numberofstock);
    var setoutlocations = shuffle(createNumberArray(ObjectLength(locationspots)));

    setoutlist = {
        "stock": setoutstock,
        "locations": setoutlocations
    };

    var switchstock = shuffle(setoutlist.stock.slice());
    var switchlocations = shuffle(createNumberArray(ObjectLength(locationspots)));

    switchlist = {
        "stock": switchstock,
        "locations": switchlocations
    };   

    console.log(setoutlist);
    console.log(switchlist);

    sessionhtml();
    $('#session').show();
}

function nextswitchlist() {
    switchlistcounter++;
    setoutlist = switchlist;

    var switchstock = shuffle(setoutlist.stock.slice());
    var switchlocations = shuffle(createNumberArray(ObjectLength(locationspots)));

    switchlist = {
        "stock": switchstock,
        "locations": switchlocations
    };

    sessionhtml();
    $('#session').show();
}

function resumeSession() {
    if (typeof (Storage) !== "undefined") {
        if (hasSessionToResume() && localStorage.getItem("sessioncounter") !== null) {
            $('#session').hide();
            setoutlist = JSON.parse(localStorage.getItem("setoutlist"));
            switchlist = JSON.parse(localStorage.getItem("switchlist"));
            sessioncounter = localStorage.getItem("sessioncounter");
            switchlistcounter = localStorage.getItem("switchlistcounter");
            sessionhtml();
        }
    } else {
        if (localstoragealerted !== true) {
            alert('Local storage not available. Sessions will not be saved.');
            localstoragealerted = true;
        }
    }
}

function hasSessionToResume() {
    return localStorage.getItem("setoutlist") !== null && localStorage.getItem("switchlist") !== null && localStorage.getItem("switchlistcounter") !== null
}

function sessionhtml() {
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
    $.each(setoutlist.stock, function (i) {
        setoutlisthtml += '<tr>';
        setoutlisthtml += '<td>' + rollingstock[this].desc + '</td>';
        setoutlisthtml += '<td>' + rollingstock[this].type + '</td>';
        setoutlisthtml += '<td>' + rollingstock[this].marking + '</td>';
        setoutlisthtml += '<td>' + locationspots[setoutlist.locations[i]].desc + '</td>';
        setoutlisthtml += '</tr>';
    })
    setoutlisthtml += '</tbody>';
    setoutlisthtml += '</table>';

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
    $.each(switchlist.stock, function (i) {
        switchlisthtml += '<tr>';
        switchlisthtml += '<td>' + rollingstock[this].desc + '</td>';
        switchlisthtml += '<td>' + rollingstock[this].type + '</td>';
        switchlisthtml += '<td>' + rollingstock[this].marking + '</td>';
        switchlisthtml += '<td>' + locationspots[switchlist.locations[i]].desc + '</td>';
        switchlisthtml += '</tr>';
    })
    switchlisthtml += '</tbody>';
    switchlisthtml += '</table>';

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
        $('#seshresume').show();

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

function shuffle(array) {
    var currentIndex = ObjectLength(array), temporaryValue, randomIndex;

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
    return array;
}

function createNumberArray(n) {
    var numberarray = [];
    for (var i = 0; i < n; i++) {
        numberarray[numberarray.length] = i;
    }
    return numberarray;
}

function ObjectLength(object) {
    var length = 0;
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            ++length;
        }
    }
    return length;
};