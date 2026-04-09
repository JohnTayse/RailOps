const LoadSessionComponent = {
	render: () => {
		railops.loadTemplate("loadsessionTemplate")
			.then((loadsession) => {
				var section = loadsession;
				$('#app').html(section).trigger('create');
				$('#homeButton').click(function () { railops.navHome(); })

				railops.getData("sessions")
					.then(sessions => {
						railops.getData("layouts")
							.then(layouts => {
								railops.getData("locomotives")
									.then(locomotives => {
										var sessionsTableBody = '';
										sessions.forEach(session => {
											var switchListId = session.SwitchLists[session.SwitchLists.length - 1].id;
											var locomotive = locomotives.find(x => x.id == session.Locomotive);
											sessionsTableBody += `<tr>
												<td>` + session.id + `</td>
												<td>` + layouts.find(x => x.id == session.Layout).Name + `</td>
												<td>` + railops.capitalizeWords(session.Difficulty) + `</td>
												<td>` + railops.getDisplayName(locomotive) + `</td>
												<td>` + session.SwitchLists.length + `</td>
												<td>` + session.Timestamp + `</td>
												<td><img class="sessionRow" src="scripts/images/icons-svg/navigation-black.svg" sessionId='` + session.id + `' switchListId='` + switchListId + `' alt="load session"/></td>
											</tr>`;
										})
										$('#sessionTableBody').html(sessionsTableBody);

										$('#sessionTableBody .sessionRow').click(function () {
											var sessionId = $(this).attr('sessionId');
											var switchListId = $(this).attr('switchListId');
											railops.navSession(sessionId, switchListId);
										})
									})
							})
					})
			})
	}
}

export { LoadSessionComponent }