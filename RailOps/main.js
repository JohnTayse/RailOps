var industries, locomotives, rollingstock;
var capacity;
var locationspots = [];
var stock;
var difficulty;
var locos;
var locosselected = [];
var setoutlist, switchlist, sessionlists;
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
        controls3 += '<label><input type="radio" name="locomotives" value="' + (Number(i) + 1) + '" />' + i + '</label>';
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
    datamanagement += '<li><a href="#" id="switchupdatedelete">Edit/Delete Current</a></li>';
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

    //2. input boxes
    datamanagement += '<div class="inputs">';

    //dropdowns
    datamanagement += '<div id="datadropdowns">';
    datamanagement += '<div id="dropdownindustries">';
    datamanagement += '<label for="industriesud" class="select"></label>';
    datamanagement += '<select name="industriesud" id="industriesud">';
    datamanagement += '<option>--Choose Industry--</option>';
    $.each(industries, function (i) {
        var industry = this;
        datamanagement += '<option value="' + industry.id + '">' + industry.desc + '</option>';
    })
    datamanagement += '</select>';
    datamanagement += '</div>';
    datamanagement += '<div id="dropdownlocomotives">';
    datamanagement += '<label for="locomotivesud" class="select"></label>';
    datamanagement += '<select name="locomotivesud" id="locomotivesud">';
    datamanagement += '<option>--Choose Locomotive--</option>';
    $.each(locomotives, function (i) {
        var locomotive = this;
        datamanagement += '<option value="' + locomotive.id + '">' + locomotive.desc + '</option>';
    })
    datamanagement += '</select>';
    datamanagement += '</div>';
    datamanagement += '<div id="dropdownrollingstock">';
    datamanagement += '<label for="rollingstockud" class="select"></label>';
    datamanagement += '<select name="rollingstockud" id="rollingstockud">';
    datamanagement += '<option>--Choose Rolling Stock--</option>';
    $.each(rollingstock, function (i) {
        var stock = this;
        datamanagement += '<option value="' + stock.id + '">' + stock.desc + '</option>';
    })
    datamanagement += '</select>';
    datamanagement += '</div>';
    datamanagement += '</div>';

    //industries
    datamanagement += '<div id="inputsindustries">';
    datamanagement += '<input type="text" name="industrydesc" id="industrydesc" value="" placeholder="Description">';
    datamanagement += '<input type="text" name="industryspots" id="industryspots" value="" placeholder="# of Spots">';
    datamanagement += '</div>';
    //locomotives
    datamanagement += '<div id="inputslocomotives">';
    datamanagement += '<input type="text" name="locodesc" id="locodesc" value="" placeholder="Description">';
    datamanagement += '<input type="text" name="loconumber" id="loconumber" value="" placeholder="Number">';
    datamanagement += '<input type="text" name="locomark" id="locomark" value="" placeholder="Reporting Mark">';
    datamanagement += '<select name="locotype" id="locotype" data-role="slider">';
    datamanagement += '<option value="9v">9V</option>';
    datamanagement += '<option value="pf">PF</option>';
    datamanagement += '</select>';
    datamanagement += '</div>';
    //rollingstock
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

    //add button
    datamanagement += '<div id="viewcreate">';
    datamanagement += '<a href="#" class="ui-btn ui-corner-all" id="btnadditem">Add Item</a>';
    datamanagement += '</div>';

    //update/delete button
    datamanagement += '<div id="viewupdatedelete">';
    datamanagement += '<a href="#" class="ui-btn ui-corner-all" id="btnupdateitem">Update Item</a>';
    datamanagement += '<a href="#" class="ui-btn ui-corner-all" id="btndeleteitem">Delete Item</a>';
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

    $('#datadropdowns').hide();
    $('#viewupdatedelete').hide();

    $('#switchcreate').click(function () {
        $('#viewcreate').show();
        $('#viewupdatedelete').hide();
        $('#datadropdowns').hide();

        resetIndustry();
        resetLocomotive();
        resetRollingstock();
    })
    $('#switchupdatedelete').click(function (){
        $('#viewcreate').hide();
        $('#viewupdatedelete').show();
        $('#datadropdowns').show();

        switch (itemtype){
            case 'industries':
                industryClick();
                break;
            case 'locomotives':
                locomotiveClick();
                break;
            case 'rollingstock':
                rollingstockClick();
                break;
            default:
                industryClick();
                break;
        }
    })

    $('#inputslocomotives').hide();
    $('#inputsrollingstock').hide();

    $('#switchindustries').click(function () {
        industryClick();
    })

    function industryClick(){
        itemtype = 'industries';
        $('#inputsindustries').show();
        $('#inputslocomotives').hide();
        $('#inputsrollingstock').hide();

        $('#dropdownindustries').show();
        $('#dropdownlocomotives').hide();
        $('#dropdownrollingstock').hide();

        //reset form
        $('#industriesud')[0].selectedIndex = 0;
        $('#industriesud').selectmenu('refresh');
        resetIndustry();
    }

    function resetIndustry(){
        $('#industrydesc').val('');
        $('#industryspots').val('');
    }

    $('#switchlocomotives').click(function () {
        locomotiveClick();
    })

    function locomotiveClick(){
        itemtype = 'locomotives';
        $('#inputsindustries').hide();
        $('#inputslocomotives').show();
        $('#inputsrollingstock').hide();

        $('#dropdownindustries').hide();
        $('#dropdownlocomotives').show();
        $('#dropdownrollingstock').hide();

        //reset form
        $('#locomotivesud')[0].selectedIndex = 0;
        $('#locomotivesud').selectmenu('refresh');
        resetLocomotive();
    }

    function resetLocomotive(){
        $('#locodesc').val('');
        $('#loconumber').val('');
        $('#locomark').val('');
        $('#locotype')[0].selectedIndex = 0;
        $('#locotype').slider('refresh');
    }

    $('#switchrollingstock').click(function () {
        rollingstockClick();
    })

    function rollingstockClick(){
        itemtype = 'rollingstock';
        $('#inputsindustries').hide();
        $('#inputslocomotives').hide();
        $('#inputsrollingstock').show();

        $('#dropdownindustries').hide();
        $('#dropdownlocomotives').hide();
        $('#dropdownrollingstock').show();

        //reset form
        $('#rollingstockud')[0].selectedIndex = 0;
        $('#rollingstockud').selectmenu('refresh');
        resetRollingstock();
    }

    function resetRollingstock(){
        $('#rsdesc').val('');
        $('#rstype')[0].selectedIndex = 0;
        $('#rstype').selectmenu('refresh');
        $('#rsmark').val('');
        $('#rsspots').val('');
    }

    //on selects
    $('#industriesud').change(function(){
        var industry = industries[$('#industriesud').val()];
        $('#industrydesc').val(industry.desc);
        $('#industryspots').val(industry.spots);
    })
    $('#locomotivesud').change(function(){
        var locomotive = locomotives[$('#locomotivesud').val()];
        $('#locodesc').val(locomotive.desc);
        $('#loconumber').val(locomotive.number);
        $('#locomark').val(locomotive.marking);
        $('#locotype').val(locomotive.type);
        $('#locotype').slider('refresh');
    })
    $('#rollingstockud').change(function(){
        var stock = rollingstock[$('#rollingstockud').val()];
        $('#rsdesc').val(stock.desc);
        $('#rstype').val(stock.type)
        $('#rstype').selectmenu('refresh');
        $('#rsmark').val(stock.marking);
        $('#rsspots').val(stock.spots);
    })

    $('#btnadditem').click(function () {
        if (itemtype == 'industries') {
            industrycount++;

            var newIndustry = {};
            newIndustry.id = industrycount;
            newIndustry.desc = $('#industrydesc').val();
            newIndustry.spots = parseInt($('#industryspots').val());

            industries['' + industrycount] = newIndustry;

            resetIndustry();
        }
        if (itemtype == 'locomotives') {
            lococount++;

            var newLocomotive = {};
            newLocomotive.id = lococount;
            newLocomotive.desc = $('#locodesc').val();
            newLocomotive.number = parseInt($('#loconumber').val());
            newLocomotive.marking = $('#locomark').val();
            newLocomotive.type = $('#locotype').val();

            locomotives['' + lococount] = newLocomotive;

            resetLocomotive();
        }
        if (itemtype == 'rollingstock') {
            rscount++;

            var newRS = {};
            newRS.id = rscount;
            newRS.desc = $('#rsdesc').val();
            newRS.type = $('#rstype').val();
            newRS.marking = $('#rsmark').val();
            newRS.spots = parseInt($('#rsspots').val());

            rollingstock['' + rscount] = newRS;

            resetRollingstock();
        }
        
        $('#jsontext').html('{"industries":' + JSON.stringify(industries) + ',"locomotives":' + JSON.stringify(locomotives) + ',"rollingstock":' + JSON.stringify(rollingstock) + '}');
    })

    $('#btnupdateitem').click(function () {
        if (itemtype == 'industries') {
            var industryupdate = parseInt($('#industriesud').val());

            var updatedIndustry = {};
            updatedIndustry.id = '' + industryupdate;
            updatedIndustry.desc = $('#industrydesc').val();
            updatedIndustry.spots = parseInt($('#industryspots').val());

            industries['' + industryupdate] = updatedIndustry;

            $('#industriesud')[0].selectedIndex = 0;
            $('#industriesud').selectmenu('refresh');

            resetIndustry();
        }
        if (itemtype == 'locomotives') {
            var locoupdate = parseInt($('#locomotivesud').val());

            var updatedLocomotive = {};
            updatedLocomotive.id = '' + locoupdate;
            updatedLocomotive.desc = $('#locodesc').val();
            updatedLocomotive.number = parseInt($('#loconumber').val());
            updatedLocomotive.marking = $('#locomark').val();
            updatedLocomotive.type = $('#locotype').val();

            locomotives['' + locoupdate] = updatedLocomotive;
            
            $('#locomotivesud')[0].selectedIndex = 0;
            $('#locomotivesud').selectmenu('refresh');

            resetLocomotive();
        }
        if (itemtype == 'rollingstock') {
            var rsupdate = parseInt($('#rollingstockud').val());

            var updatedRS = {};
            updatedRS.id = '' + rsupdate;
            updatedRS.desc = $('#rsdesc').val();
            updatedRS.type = $('#rstype').val();
            updatedRS.marking = $('#rsmark').val();
            updatedRS.spots = parseInt($('#rsspots').val());

            rollingstock['' + rsupdate] = updatedRS;

            $('#rollingstockud')[0].selectedIndex = 0;
            $('#rollingstockud').selectmenu('refresh');

            resetRollingstock();
        }
        
        $('#jsontext').html('{"industries":' + JSON.stringify(industries) + ',"locomotives":' + JSON.stringify(locomotives) + ',"rollingstock":' + JSON.stringify(rollingstock) + '}');
    })

    $('#btndeleteitem').click(function(){
        if (itemtype == 'industries') {
            if(!confirm('Are you sure you would like to delete ' + $('#industriesud option[value=' + $('#industriesud').val() + ']').text() + ' from your industries?')){
                return;
            }
            var industrydelete = parseInt($('#industriesud').val());
            delete industries['' + industrydelete];

            for(var i = industrydelete; i < industrycount; i++){
                industries['' + i] = industries['' + (i + 1)];
                industries['' + i].id = '' + i;
            }
            delete industries['' + industrycount];

            industrycount--;

            //remove from dropdown
            $('#industriesud option[value=' + industrydelete + ']').remove();
            //update values in dropdown
            for(var j = industrydelete; j < industrycount + 1; j++){
                $('#industriesud option[value=' + (j + 1) + ']').val('' + j + '');
            }

            $('#industriesud')[0].selectedIndex = 0;
            $('#industriesud').selectmenu('refresh');
            resetIndustry();
        }
        if (itemtype == 'locomotives') {
            if(!confirm('Are you sure you would like to delete ' + $('#locomotivesud option[value=' + $('#locomotivesud').val() + ']').text() + ' from your locomotives?')){
                return;
            }
            var locomotivedelete = parseInt($('#locomotivesud').val());
            delete locomotives['' + locomotivedelete];

            for(var i = locomotivedelete; i < lococount; i++){
                locomotives['' + i] = locomotives['' + (i + 1)];
                locomotives['' + i].id = '' + i;
            }
            delete locomotives['' + lococount];

            lococount--;

            //remove from dropdown
            $('#locomotivesud option[value=' + locomotivedelete + ']').remove();
            //update values in dropdown
            for(var j = locomotivedelete; j < lococount + 1; j++){
                $('#locomotivesud option[value=' + (j + 1) + ']').val('' + j + '');
            }

            $('#locomotivesud')[0].selectedIndex = 0;
            $('#locomotivesud').selectmenu('refresh');
            resetLocomotive();
        }
        if (itemtype == 'rollingstock') {
            if(!confirm('Are you sure you would like to delete ' + $('#rollingstockud option[value=' + $('#rollingstockud').val() + ']').text() + ' from your rolling stock?')){
                return;
            }
            var rsdelete = parseInt($('#rollingstockud').val());
            delete rollingstock['' + rsdelete];

            for(var i = rsdelete; i < rscount; i++){
                rollingstock['' + i] = rollingstock['' + (i + 1)];
                rollingstock['' + i].id = '' + i;
            }
            delete rollingstock['' + rscount];

            rscount--;

            //remove from dropdown
            $('#rollingstockud option[value=' + rsdelete + ']').remove();
            //update values in dropdown
            for(var j = rsdelete; j < rscount + 1; j++){
                $('#rollingstockud option[value=' + (j + 1) + ']').val('' + j + '');
            }

            $('#rollingstockud')[0].selectedIndex = 0;
            $('#rollingstockud').selectmenu('refresh');
            resetRollingstock();
        }
        $('#jsontext').html('{"industries":' + JSON.stringify(industries) + ',"locomotives":' + JSON.stringify(locomotives) + ',"rollingstock":' + JSON.stringify(rollingstock) + '}');
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

    var sessionlist = {};
    sessionlist.id = switchlistcounter;
    sessionlist.setout = setoutlist;
    sessionlist.switch = switchlist;
    sessionlists = {};
    sessionlists[switchlistcounter] = sessionlist;

    sessionhtml();
    $('#session').show();
}

function nextswitchlist() {
    switchlistcounter++;
    if(sessionlists[switchlistcounter] !== undefined) {
        var sessionlist = sessionlists[switchlistcounter];
        setoutlist = sessionlist.setout;
        switchlist = sessionlist.switch;
    } else {
        setoutlist = switchlist;

        var switchstock = shuffle(setoutlist.stock.slice());
        var switchlocations = shuffle(createLocationArray(ObjectLength(locationspots)));

        switchlist = {
            "stock": switchstock,
            "locations": switchlocations
        };

        var sessionlist = {};
        sessionlist.id = switchlistcounter;
        sessionlist.setout = setoutlist;
        sessionlist.switch = switchlist;
        sessionlists[switchlistcounter] = sessionlist;
    }
    sessionhtml();
    $('#session').show();
}

function prevswitchlist() {
    switchlistcounter--;
    var sessionlist = sessionlists[switchlistcounter];
    setoutlist = sessionlist.setout;
    switchlist = sessionlist.switch;

    sessionhtml();
    $('#session').show();
}

function resumeSession() {
    if (typeof (Storage) !== "undefined") {
        if (hasSessionToResume() && localStorage.getItem("sessioncounter") !== null) {
            $('#session').hide();
            setoutlist = JSON.parse(localStorage.getItem("setoutlist"));
            switchlist = JSON.parse(localStorage.getItem("switchlist"));
            sessionlists = JSON.parse(localStorage.getItem("sessionlists"));
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
    if(switchlistcounter > 1){
        seshcontrols += '<a href="#" class="ui-btn ui-corner-all" id="prevsl">Previous Switch List</a>';
    }
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

    $('#prevsl').click(function () {
        prevswitchlist();
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
        localStorage.setItem("sessionlists", JSON.stringify(sessionlists));
        localStorage.setItem("sessioncounter", sessioncounter);
        localStorage.setItem("switchlistcounter", switchlistcounter);
    } else {
        if (localstoragealerted !== true) {
            alert('Local storage not available. Sessions will not be saved!');
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