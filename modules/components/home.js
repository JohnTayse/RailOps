const HomeComponent = {
	render: () => {
		railops.loadTemplate("homeTemplate")
			.then((home) => {
				var section = home;
				$('#app').html(section).trigger('create');
				$('#settingsButton').click(function () { railops.navSettings(); });
				$('#newSessionButton').click(function () { railops.navSessionSetup('new'); });
				$('#loadSessionButton').click(function () { railops.navLoadSession(); });
			})
	}
}

export { HomeComponent };