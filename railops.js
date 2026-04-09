var railops = (function () {
	'use strict';

	var api = 'api/';

	var methods = {};

	methods.navHome = function () {
		window.location = '#';
	}

	methods.navLoadSession = function () {
		window.location = '#/loadsession';
	}

	methods.navSettings = function () {
		window.location = '#/settings';
	}

	methods.navDataManager = function () {
		window.location = "#/datamanager";
	}

	methods.navSessionManager = function () {
		window.location = "#/sessionmanager";
	}

	methods.navSessionSetup = function (sessionType) {
		window.location = '#/sessionsetup/' + sessionType;
	}

	methods.navSession = function (sessionId, switchListId) {
		window.location = '#/session/' + sessionId + '-' + switchListId;
	}

	methods.loadTemplate = async function (url) {
		return await fetch('templates/' + url + '.html')
			.then(res => res.text());
	}

	methods.loadModal = async function (url) {
		return await fetch('modals/' + url + '.html')
			.then(res => res.text());
	}

	methods.getData = async function (id) {
		return await fetch(api + 'readjson.php', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: 'filename=' + id + '.json'
		})
			.then(res => res.json())
			.then(resp => {
				if (!resp.success && resp.error.includes('Invalid JSON')) {
					return [];
				}
				else if (!resp.success) {
					if (!confirm('There was an error loading ' + id + ': "' + resp.error + '". Stay here?')) {
						window.location = '#/settings';
					}
				}
				else {
					return resp.data;
				}
			})
	}

	methods.writeData = async function (id, data) {
		var request = {
			filename: id + ".json",
			content: data
		}
		return await fetch(api + 'writejson.php', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(request)
		})
			.then(res => res.json())
			.then(resp => {
				if (!resp.success) {
					if (!confirm('There was an error saving ' + id + ': "' + resp.error + '". Stay here?')) {
						window.location = '#/settings';
					}
				}
				return resp.success;
			})
	}

	methods.addSession = async function (session) {
		var sessions = await railops.getData('sessions');
		if (!sessions) {
			sessions = [];
		}
		session.id = sessions.length + 1;
		session.Timestamp = new Date().toISOString();
		sessions.push(session);
		await railops.writeData('sessions', sessions);
	}

	methods.updateSession = async function (session) {
		const sessions = await railops.getData('sessions');
		const index = sessions.findIndex(x => x.id == session.id);
		sessions[index] = session;
		await railops.writeData('sessions', sessions);
	}

	methods.createSession = async function (session) {
		var nextId = session.SwitchLists.length + 1;

		var switchList = {
			id: nextId
		}

		const industries = await railops.getData('industries')
			.then(response => response.filter(x => x.Layout == session.Layout));

		if (nextId == 1) {
			var capacity = 0;
			industries.forEach(industry => {
				capacity += industry.Spots;
			});
			session.Capacity = capacity;

			var numberofstock = 0;
			if (session.Difficulty == "easy") {
				numberofstock = Math.floor(capacity * .65);
			} else if (session.Difficulty == "medium") {
				numberofstock = Math.floor(capacity * .8);
			} else if (session.Difficulty == "hard") {
				numberofstock = Math.floor(capacity * .95);
			} else {
				numberofstock = capacity;
			}

			if (session.Difficulty == 'custom') {
				session.NumberOfStock = session.RollingStock.length;
				var setouts = railops.getSwitchList(session, session.RollingStock, industries);
				var switches = railops.getSwitchList(session, session.RollingStock, industries);
				switchList.Setouts = setouts;
				switchList.Switches = switches;
				session.SwitchLists.push(switchList);
				return session;
			}
			else {
				const rollingstock = await railops.getData('rollingstock')
					.then(response => response.filter(x => x.Scale == session.Scale));

				if (numberofstock > rollingstock.length) {
					numberofstock = rollingstock.length;
				}
				session.NumberOfStock = numberofstock;
				var setouts = railops.getSwitchList(session, rollingstock, industries);
				var switchedRollingStock = rollingstock.filter(x => setouts.setoutStock.split(',').map(x => parseInt(x)).includes(x.id));
				session.RollingStock = switchedRollingStock;
				var switches = railops.getSwitchList(session, switchedRollingStock, industries);
				switchList.Setouts = setouts;
				switchList.Switches = switches;
				session.SwitchLists.push(switchList);
				return session;
			}
		}
		else {
			var setouts = session.SwitchLists.find(x => x.id == nextId - 1).Switches;
			var switches = railops.getSwitchList(session, session.RollingStock, industries);
			switchList.Setouts = setouts;
			switchList.Switches = switches;
			session.SwitchLists.push(switchList);
			return session;
		}
	}

	methods.getSwitchList = function (session, rollingstock, industries) {
		var setoutStock = '';
		var setoutLocations = '';

		var specificIndustrySpots = [];
		industries.forEach(industry => {
			for (var i = 1; i <= industry.Spots; i++) {
				specificIndustrySpots.push({
					Industry: industry.id,
					Spot: i
				});
			}
		})

		var stockArray = railops.shuffleArray(rollingstock).slice(0, session.NumberOfStock);
		var locationArray = railops.shuffleArray(specificIndustrySpots).slice(0, session.NumberOfStock);

		setoutStock = stockArray.map((stock) => { return stock.id }).join(',');
		setoutLocations = locationArray.map((location) => { return location.Industry + '-' + location.Spot }).join(',');

		return { setoutStock, setoutLocations };
	}

	methods.shuffleArray = function (array) {
		return array.sort(() => Math.random() - 0.5);
	}

	methods.fileToBase64 = async function (file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	methods.capitalizeWords = function (str) {
		return str.split(' ').map(word =>
			word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
		).join(' ');
	}

	methods.getRandomColor = function () {
		return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
	}

	methods.getDisplayName = function (data) {
		return data.ReportingMark + data.RoadNumber;
	}

	return methods;
})();