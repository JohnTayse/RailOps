function selectLayout(scale) {
	const radios = document.querySelectorAll('input[name="sessionDifficulty"]');
	if (radios.length > 0) {
		radios[0].checked = true;
	}
	$('#sessionRollingStockDiv').html('');
	if (scale === undefined) {
		$('#sessionLocomotivesDiv').html('');
		$('#sessionDifficultyDiv').hide();
		$('#startSessionButton').hide();
	}
	else {
		$('#sessionDifficultyDiv').show();
		railops.getData("locomotives")
			.then(response => response.filter(x => x.Scale == scale))
			.then(locomotives => {
				$('#sessionLocomotivesDiv').html('');
				var sessionLocomotives = '';
				sessionLocomotives += `<div class="row g-3 align-items-center">
						<div class="col-auto">
							<label for="sessionLocomotive" class="form-label text-start">Session Locomotive</label>
						</div>
						<div class="col-auto">
							<select id="sessionLocomotive" class="form-select" aria-label="Session Locomotive Select">
								<option selected>Choose a locomotive</option>
							</select>
						</div>
					</div>`

				$('#sessionLocomotivesDiv').html(sessionLocomotives);
				locomotives.forEach(locomotive => {
					$('#sessionLocomotive').append(`<option value="${locomotive.id}">${railops.getDisplayName(locomotive)}</option>`);
				})

				$('#sessionLocomotive').change(function () {
					var selectedOption = this.options[this.selectedIndex]
					if (selectedOption.value !== 'Choose a locomotive') {
						$('#startSessionButton').show();
					}
					else {
						$('#startSessionButton').hide();
					}
				})
			})
	}
}

function selectDifficulty(difficulty) {
	if (difficulty !== 'custom') {
		$('#sessionRollingStockDiv').html('');
	}
	else {
		$('#sessionRollingStockDiv').html('');

		var selectedLayout = document.getElementById('sessionLayout');
		var selectedOption = selectedLayout.options[selectedLayout.selectedIndex];
		var scale = selectedOption.getAttribute('scale');

		railops.getData("rollingstock")
			.then(response => response.filter(x => x.Scale == scale))
			.then(rollingstock => {
				var sessionRollingStock = '';
				sessionRollingStock += `<div class="row g-3 align-items-center">
					<div class="col-auto">
						<label for="sessionRollingStock" class="form-label text-start">Session Rolling Stock</label>
					</div>
					<div class="col-auto" id="sessionRollingStock">
					</div>
				</div>`

				$('#sessionRollingStockDiv').html(sessionRollingStock);
				rollingstock.forEach(rollingstock => {
					var rollingstockCheck = '';
					rollingstockCheck += `<div class="form-check">
						<input class="form-check-input" type="checkbox" name="sessionRollingStock" id="sessionRollingStock` + rollingstock.id + `" rsId="` + rollingstock.id + `">
						<label class="form-check-label" for="sessionRollingStock` + rollingstock.id + `">
							` + railops.getDisplayName(rollingstock) + `
						</label>
					</div>`;
					$('#sessionRollingStock').append(rollingstockCheck);
				})
			})
	}
}

function createSession(selectedLayout, selectedDifficulty, selectedLocomotive, selectedRollingStock) {
	var session = {
		id: -1,
		Layout: selectedLayout,
		Difficulty: selectedDifficulty,
		Locomotive: selectedLocomotive,
		RollingStock: selectedRollingStock,
		Scale: '',
		Capacity: 0,
		NumberOfStock: 0,
		SwitchLists: []
	}

	var selectedLayout = document.getElementById('sessionLayout');
	var selectedOption = selectedLayout.options[selectedLayout.selectedIndex];
	session.Scale = selectedOption.getAttribute('scale');

	railops.createSession(session)
		.then((createdSession) => {
			railops.addSession(createdSession)
				.then(() => {
					railops.navSession(createdSession.id, createdSession.SwitchLists[0].id);
				});
		});
}

const SessionSetupComponent = {
	render: (sessionType) => {
		railops.loadTemplate("setupsessionTemplate")
			.then((setupsession) => {
				var section = setupsession;
				$('#app').html(section).trigger('create');

				$('#sessiontype').html(railops.capitalizeWords(sessionType));
				$('#homeButton').click(function () { railops.navHome() });

				railops.getData("layouts")
					.then(layouts => {
						layouts.forEach(layout => {
							$('#sessionLayout').append('<option value="' + layout.id + '" scale="' + layout.Scale + '">' + layout.Name + '</option>');
						})

						$('#sessionLayout').change(function () {
							var selectedOption = this.options[this.selectedIndex]
							selectLayout($(selectedOption).attr('scale'));
						})

						$('#sessionDifficultyDiv').hide();
						$('#startSessionButton').hide();

						var sessionDifficulty = document.querySelectorAll('input[name="sessionDifficulty"]');

						sessionDifficulty.forEach(difficulty => {
							difficulty.addEventListener('change', function () {
								selectDifficulty(this.value);
							})
						})

						$('#startSessionButton').click(function () {
							var sessionLayout = document.getElementById('sessionLayout');
							var selectedLayout = parseInt(sessionLayout.options[sessionLayout.selectedIndex].value);

							var sessionLocomotive = document.getElementById('sessionLocomotive');
							var selectedLocomotive = parseInt(sessionLocomotive.options[sessionLocomotive.selectedIndex].value);

							var sessionDifficulty = Array.from(document.querySelectorAll('input[name="sessionDifficulty"]'));
							var selectedDifficulty = sessionDifficulty.find(x => x.checked);

							if (selectedDifficulty.value === 'custom') {
								var sessionRollingStock = Array.from(document.querySelectorAll('input[name="sessionRollingStock"]'));
								var selectedRollingStock = sessionRollingStock.find(x => x.checked);
								if (selectedRollingStock) {
									createSession(selectedLayout, selectedDifficulty.value, selectedLocomotive, selectedRollingStock.value);
								}
								else {
									alert('Please select rolling stock for the session');
								}
							}
							else {
								createSession(selectedLayout, selectedDifficulty.value, selectedLocomotive);
							}
						})
					})
			})
	}
}

export { SessionSetupComponent }