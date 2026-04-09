function setPopover(elementId, color1, color2, type) {
	const popoverElement = document.getElementById(elementId);

	const existingPopover = bootstrap.Popover.getInstance(popoverElement);
	if (existingPopover) {
		existingPopover.dispose();
	}

	popoverElement.addEventListener('shown.bs.popover', function () {
		const popoverId = popoverElement.getAttribute('aria-describedby');
		const popoverPanel = document.getElementById(popoverId);

		popoverPanel.querySelector('#color1').style.backgroundColor = color1;
		popoverPanel.querySelector('#color2').style.backgroundColor = color2;
		popoverPanel.querySelector('.popover-body').style.textAlign = "center";
	});

	var content = '<span id="color1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span id="color2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';

	const popover = new bootstrap.Popover(popoverElement, {
		content: content,
		title: type,
		html: true,
		trigger: 'focus',
		placement: 'top'
	});
}

const SessionComponent = {
	render: (sessionIdswitchListId) => {
		var sessionId = parseInt(sessionIdswitchListId.split('-')[0]);
		var switchListId = parseInt(sessionIdswitchListId.split('-')[1]);

		railops.loadTemplate("sessionTemplate")
			.then((sessionHTML) => {
				var section = sessionHTML;
				$('#app').html(section).trigger('create');
				$('#homeButton').click(function () { railops.navHome(); })

				getSession(sessionId, switchListId)
					.then(data => {
						var content = '';
						content += `<h4><em>Locomotive <a tabindex=0 class="locoPopover" id="loco${data.Locomotive.id}Popover">${railops.getDisplayName(data.Locomotive)}</a></em></h4>`;
						$('#sessionContent').html(content);

						setPopover('loco' + data.Locomotive.id + 'Popover', data.Locomotive.Color1, data.Locomotive.Color2, data.Locomotive.Type);

						$('#sessionTitle').text(data.Layout.Name + ' - Session ' + data.session.id);
						var setoutList = '';
						data.SwitchList.Setouts.setoutStock.split(',').forEach((stock, index) => {
							setoutList += '<tr>';
							var stock = data.rollingstock.find(x => x.id == stock);

							setoutList += '<td><a tabindex=0 class="stockPopover" id="stock' + stock.id + 'SetoutPopover">' + railops.getDisplayName(stock) + '</a></td>';
							var location = data.SwitchList.Setouts.setoutLocations.split(',')[index];
							var industry = location.split('-')[0];
							var spot = location.split('-')[1];
							setoutList += '<td>' + data.industries.find(x => x.id == industry).Name + ' - Spot ' + spot + '</td>';
							setoutList += '</tr>';
						})
						$('#sessionSetoutsBody').html(setoutList);

						data.rollingstock.forEach(stock => {
							setPopover('stock' + stock.id + 'SetoutPopover', stock.Color1, stock.Color2, stock.Type);
						})

						var switchList = '';
						data.SwitchList.Switches.setoutStock.split(',').forEach((stock, index) => {
							switchList += '<tr>';
							var stock = data.rollingstock.find(x => x.id == stock);

							switchList += '<td><a tabindex=0 class="stockPopover" id="stock' + stock.id + 'SwitchPopover">' + railops.getDisplayName(stock) + '</a></td>';
							var location = data.SwitchList.Switches.setoutLocations.split(',')[index];
							var industry = location.split('-')[0];
							var spot = location.split('-')[1];
							switchList += '<td>' + data.industries.find(x => x.id == industry).Name + ' - Spot ' + spot + '</td>';
							switchList += '</tr>';
						})
						$('#sessionSwitchesBody').html(switchList);

						data.rollingstock.forEach(stock => {
							setPopover('stock' + stock.id + 'SwitchPopover', stock.Color1, stock.Color2, stock.Type);
						})

						$('#sessionSwitchesTitle').text('Switch List ' + data.SwitchList.id);

						if (switchListId == 1) {
							$('#lastButton').hide();
						}

						$('#lastButton').click(function () {
							railops.navSession(sessionId, switchListId - 1);
						})

						$('#nextButton').click(function () {
							if (switchListId < data.session.SwitchLists.length) {
								railops.navSession(sessionId, switchListId + 1);
							} else {
								railops.createSession(data.session)
									.then(updatedSession => {
										railops.updateSession(updatedSession);
									})
									.then(() => { railops.navSession(sessionId, switchListId + 1); })
							}
						})
					})
			})
	}
}

async function getSession(sessionId, switchListId) {
	var session = await railops.getData("sessions")
		.then(response => response.find(x => x.id == sessionId))
	var SwitchList = session.SwitchLists.find(x => x.id == switchListId);
	var Layout = await railops.getData("layouts")
		.then(response => response.find(x => x.id == session.Layout))
	var industries = await railops.getData("industries")
		.then(response => response.filter(x => x.Layout == session.Layout))
	var Locomotive = await railops.getData("locomotives")
		.then(response => response.find(x => x.id == session.Locomotive))
	var sessionRollingStock = SwitchList.Setouts.setoutStock.split(',').map(x => parseInt(x));
	var rollingstock = await railops.getData("rollingstock")
		.then(response => response.filter(x => sessionRollingStock.includes(x.id)))
	return { session, SwitchList, Layout, industries, Locomotive, rollingstock };
}

export { SessionComponent }