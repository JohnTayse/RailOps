const SettingsComponent = {
	render: () => {
		railops.loadTemplate("settingsTemplate")
			.then((settings) => {
				var section = settings;
				$('#app').html(section).trigger('create');
				$('#homeButton').click(function () { railops.navHome(); })
				$('#dataManagerButton').click(function () { railops.navDataManager(); })
				$('#sessionManagerButton').click(function () { railops.navSessionManager(); })
			})
	}
}

export { SettingsComponent }