var industries, locomotives, rollingstock;
var capacity;
var locationspots = [];
var stock;
var difficulty;
var locos;
var locosselected = [];
var setoutlist, switchlist;
var sessioncounter = 0;
var switchlistcounter = 1;
var industryOrder = [];
var locomotiveOrder = [];
var rollingstockOrder = [];
var isMobileDevice;
var jsontext;

$(function()
{
    isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!isMobileDevice) {
        $('.controls').css('width', '25%');
        $('.controls').css('margin-left', '37.5%');
    }

    $('#currentyear').html(new Date().getFullYear());

    $('.controls').hide();
    if (!hasSessionToResume()) {
        $('#seshresume').hide();
    }
    getRRInfo();
});

function getRRInfo(){
	$.mobile.loading('show');
	$.getJSON('rrinfo.json', function (json) {
	    jsontext = JSON.stringify(json);
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
    settings += '<a href="#" class="ui-btn ui-corner-all" id="datamanager">Data Manager</a>';
    settings += '<a href="#" class="ui-btn ui-corner-all" id="settingsbackto1">Home</a>';

    $('#settings').html(settings).trigger('create');

    if (!hasSessionToResume()) {
        $('#resetcurrentsesh').hide();
    }

    $('#resetseshcount').click(function () {
        if (confirm('This action will reset the session counter which cannot be undone. Continue?')) {
            if (hasSessionToResume) {
                sessioncounter = 1;
                $('#session h1').html('Session ' + sessioncounter);
                localStorage.setItem("sessioncounter", sessioncounter);
            } else {
                sessioncounter = 0;
                localStorage.removeItem("sessioncounter");
            }

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

    $('#datamanager').click(function () {
        $('#datamanagement').show();
        $('#settings').hide();

        datamanagersetup();
    })

    $('#settingsbackto1').click(function () {
        $('#controls1').show();
        $('#settings').hide();
    })
}

var itemtype = 'industries';
var industrycount = 0, lococount = 0, rscount = 0;
function datamanagersetup() {
    industrycount = ObjectLength(industries);
    lococount = ObjectLength(locomotives);
    rscount = ObjectLength(rollingstock);

    var datamanagement = '';

    //switch between Create/Update/Delete
    datamanagement += '<div id="crudswitchnav" data-role="navbar">';
    datamanagement += '<ul>';
    datamanagement += '<li><a href="#" id="switchcreate" class="ui-btn-active">Add New</a></li>';
    datamanagement += '<li><a href="#" id="switchupdate">Edit Current</a></li>';
    datamanagement += '<li><a href="#" id="switchdelete">Delete Current</a></li>';
    datamanagement += '</ul>';
    datamanagement += '</div>';
    datamanagement += '<br/>';

    //1. switch between industries/locomotive/rollingstock
    datamanagement += '<div id="typeswitchnav" data-role="navbar">';
    datamanagement += '<ul>';
    datamanagement += '<li><a href="#" id="switchindustries" class="ui-btn-active">Industries</a></li>';
    datamanagement += '<li><a href="#" id="switchlocomotives">Locomotives</a></li>';
    datamanagement += '<li><a href="#" id="switchrollingstock">Rolling Stock</a></li>';
    datamanagement += '</ul>';
    datamanagement += '</div>';

    datamanagement += '<div class="inputs">';
    datamanagement += '<div id="viewcreate">';
    //2. input boxes
    //2a. industries
    datamanagement += '<div id="inputsindustries">';
    datamanagement += '<input type="text" name="industrydesc" id="industrydesc" value="" placeholder="Description">';
    datamanagement += '<input type="text" name="industryspots" id="industryspots" value="" placeholder="# of Spots">';
    datamanagement += '</div>';
    //2b. locomotives
    datamanagement += '<div id="inputslocomotives">';
    datamanagement += '<input type="text" name="locodesc" id="locodesc" value="" placeholder="Description">';
    datamanagement += '<input type="text" name="loconumber" id="loconumber" value="" placeholder="Number">';
    datamanagement += '<input type="text" name="locomark" id="locomark" value="" placeholder="Reporting Mark">';
    datamanagement += '<select name="locotype" id="locotype" data-role="slider">';
    datamanagement += '<option value="9v">9V</option>';
    datamanagement += '<option value="pf">PF</option>';
    datamanagement += '</select>';
    datamanagement += '</div>';
    //2c. rollingstock
    datamanagement += '<div id="inputsrollingstock">';
    datamanagement += '<input type="text" name="rsdesc" id="rsdesc" value="" placeholder="Description">';

    datamanagement += '<label for="rstype" class="select"></label>';
    datamanagement += '<select name="rstype" id="rstype">';
    datamanagement += '<option>--Stock Type--</option>';
    datamanagement += '<option value="auxiliary">Auxiliary</option>';
    datamanagement += '<option value="boxcar">Boxcar</option>';
    datamanagement += '<option value="flatcar">Flatcar</option>';
    datamanagement += '<option value="gondola">Gondola</option>';
    datamanagement += '<option value="hopper">Hopper</option>';
    datamanagement += '<option value="passenger">Passenger</option>';
    datamanagement += '<option value="specialized">Specialized</option>';
    datamanagement += '<option value="tanker">Tanker</option>';
    datamanagement += '<option value="well">Well</option>';
    datamanagement += '</select>';
    
    datamanagement += '<input type="text" name="rsmark" id="rsmark" value="" placeholder="Reporting Mark">';
    datamanagement += '<input type="text" name="rsspots" id="rsspots" value="" placeholder="Spots">';
    datamanagement += '</div>';
    //2. add button
    datamanagement += '<a href="#" class="ui-btn ui-corner-all" id="btnadditem">Add Item</a>';
    datamanagement += '</div>';

    //3. json text area
    datamanagement += '<textarea cols="40" rows="1" name="jsontext" id="jsontext">' + jsontext + '</textarea>';
    //4. copy to clipboard
    datamanagement += '<a href="#" class="ui-btn ui-corner-all" id="btncopy">Copy To Clipboard</a>';
    datamanagement += '</div>';
    //5. instructions
    datamanagement += '<p>Once you have finished adding items, click copy to clipboard. Then in the RailOps folder, open the <code>rrinfo.json</code> file in a text editor, select all [<code>CTRL + A</code> or <code>CMD + A</code>], and paste [<code>CTRL + V</code> or <code>CMD + V</code>]. Save the file and reload RailOps.</p>';

    datamanagement += '<div class="inputs">';
    datamanagement += '<a href="#" class="ui-btn ui-corner-all" id="datareload">Reload Page</a>';
    datamanagement += '<a href="#" class="ui-btn ui-corner-all" id="backtosettings">Back to Settings</a>';
    datamanagement += '</div>';

    $('#datamanagement').html(datamanagement).trigger('create');

    if (!isMobileDevice) {
        $('#datamanagement').css('width', '50%');
        $('#datamanagement').css('margin-left', '25%');

        $('.inputs').css('width', '45%');
        $('.inputs').css('margin-left', '27.5%');
    }

    $('#viewupdate').hide();
    $('#viewdelete').hide();

    $('#switchcreate').click(function () {
        $('#viewcreate').show();
        $('#viewupdate').hide();
        $('#viewdelete').hide();
    })
    $('#switchupdate').click(function (){
        $('#viewcreate').hide();
        $('#viewupdate').show();
        $('#viewdelete').hide();
    })
    $('#switchdelete').click(function (){
        $('#viewcreate').hide();
        $('#viewupdate').hide();
        $('#viewdelete').show();
    })

    $('#inputslocomotives').hide();
    $('#inputsrollingstock').hide();

    $('#switchindustries').click(function () {
        itemtype = 'industries';
        $('#inputsindustries').show();
        $('#inputslocomotives').hide();
        $('#inputsrollingstock').hide();
    })
    $('#switchlocomotives').click(function () {
        itemtype = 'locomotives';
        $('#inputsindustries').hide();
        $('#inputslocomotives').show();
        $('#inputsrollingstock').hide();
    })
    $('#switchrollingstock').click(function () {
        itemtype = 'rollingstock';
        $('#inputsindustries').hide();
        $('#inputslocomotives').hide();
        $('#inputsrollingstock').show();
    })

    $('#btnadditem').click(function () {
        //todo insert into textarea [jsontext]
        var jsontoinsert = $('#jsontext').html();

        if (itemtype == 'industries') {
            industrycount++;

            var industryinsert = ',"' + industrycount + '": {"id": "' + industrycount + '","desc": "' + $('#industrydesc').val() + '","spots": ' + $('#industryspots').val() + '}';
            jsontoinsert = jsontoinsert.slice(0, jsontoinsert.indexOf('},"locomotives":{"')) + industryinsert + jsontoinsert.slice(jsontoinsert.indexOf('},"locomotives":{"'));

            $('#industrydesc').val('');
            $('#industryspots').val('');
        }
        if (itemtype == 'locomotives') {
            lococount++;

            var locoinsert = ',"' + lococount + '": {"id": "' + lococount + '", "desc": "' + $('#locodesc').val() + '", "number": ' + $('#loconumber').val() + ', "marking": "' + $('#locomark').val() + '", "type": "' + $('#locotype').val() + '"}';
            jsontoinsert = jsontoinsert.slice(0, jsontoinsert.indexOf('},"rollingstock":{"')) + locoinsert + jsontoinsert.slice(jsontoinsert.indexOf('},"rollingstock":{"'));

            $('#locodesc').val('');
            $('#loconumber').val('');
            $('#locomark').val('');
            $('#locotype').val(0).slider('refresh');
        }
        if (itemtype == 'rollingstock') {
            rscount++;

            var rsinsert = ',"' + rscount + '": {"id": "' + rscount + '", "desc": "' + $('#rsdesc').val() + '", "type": "' + $('#rstype').val() + '", "marking": "' + $('#rsmark').val() + '", "spots": ' + $('#rsspots').val() + '}';
            jsontoinsert = jsontoinsert.slice(0, jsontoinsert.indexOf('}}}') + 1) + rsinsert + jsontoinsert.slice(jsontoinsert.indexOf('}}}') + 1);

            $('#rsdesc').val('');
            $('#rstype')[0].selectedIndex = 0;
            $('#rstype').selectmenu('refresh');
            $('#rsmark').val('');
            $('#rsspots').val('');
        }

        $('#jsontext').html(jsontoinsert);
    })

    $('#btncopy').click(function () {
        $('#jsontext').select();
        try{
            var successful = document.execCommand('copy');
            console.log(successful);
        } catch (err) {
            window.prompt("Copy to clipboard: Ctrl+C, Enter", $('#jsontext').val());
        }
    })

    $('#datareload').click(function () {
        window.location.reload(true);
    })

    $('#backtosettings').click(function () {
        $('#settings').show();
        $('#datamanagement').hide();
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

    var setoutstock = shuffle(createStockArray(ObjectLength(rollingstock))).slice(0, numberofstock);
    var setoutlocations = shuffle(createLocationArray(ObjectLength(locationspots)));

    setoutlist = {
        "stock": setoutstock,
        "locations": setoutlocations
    };

    var switchstock = shuffle(setoutlist.stock.slice());
    var switchlocations = shuffle(createLocationArray(ObjectLength(locationspots)));

    switchlist = {
        "stock": switchstock,
        "locations": switchlocations
    };

    sessionhtml();
    $('#session').show();
}

function nextswitchlist() {
    switchlistcounter++;
    setoutlist = switchlist;

    var switchstock = shuffle(setoutlist.stock.slice());
    var switchlocations = shuffle(createLocationArray(ObjectLength(locationspots)));

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
    seshcontrols += '<div id="seshcontrols" class="controls">';
    seshcontrols += '<a href="#" class="ui-btn ui-corner-all" id="nextsl">Next Switch List</a>';
    seshcontrols += '<a href="#" class="ui-btn ui-corner-all" id="seshbackto1">Home</a>';
    seshcontrols += '</div>';

    $('#session').append(seshcontrols).trigger('create');

    if (!isMobileDevice) {
        $('.controls').css('width', '25%');
        $('.controls').css('margin-left', '37.5%');
    }

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

function createStockArray(n) {
    var numberarray = [];
    for (var i = 1; i <= n; i++) {
        numberarray[numberarray.length] = i;
    }
    return numberarray;
}

function createLocationArray(n) {
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