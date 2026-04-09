function dataPane(element) {
	var name = $(element).attr('id').replace('Pane', '').toLowerCase();
	showDataPane(name);
}

const DataManagerComponent = {
	render: () => {
		railops.loadTemplate("datamanagerTemplate")
			.then((datamanager) => {
				var section = datamanager;
				$('#app').html(section).trigger('create');
				$('#settingsButton').click(function () { railops.navSettings() });

				$('.dataPane').click(function () { dataPane(this); });

				dataPane($('#layoutsPane'));
			})
	}
}

function showDataPane(name) {
	railops.getData(name)
		.then(data => displayData('#dataManager', railops.capitalizeWords(name), data));
}

function displayData(element, type, data) {
	var displayType = type;
	if (displayType == "Rollingstock") {
		displayType = "Rolling Stock";
	}
	type = type.toLowerCase();

	var dataPane = '<h2>' + displayType + '</h2>';

	if (!data || data.length === 0) {
		dataPane += '<p>No ' + displayType + ' data setup. Create?';
	}
	else {
		//create table
		dataPane += '<div class="table-responsive">';
		dataPane += '<table id="dataTable" class="table">';
		dataPane += '<thead>';
		dataPane += '<tr>';

		Object.keys(data[0]).forEach(key => {
			dataPane += '<th>' + key + '</th>';
		})
		dataPane += '<th></th>';

		dataPane += '</tr>';
		dataPane += '</thead>';
		dataPane += '<tbody>';

		data.forEach(record => {
			dataPane += '<tr>';

			Object.keys(record).forEach(key => {
				var value = record[key];

				if (key.toLowerCase().includes('color')) {
					dataPane += '<td style="background-color:' + value + '" dataColor="' + value + '"></td>';
				}
				else if (key.toLowerCase().includes('photo')) {
					if (value != undefined && value != "") {
						dataPane += '<td><img src="' + value + '" style="max-height:2em"/></td>';
					}
					else {
						dataPane += '<td></td>';
					}
				}
				else {
					if (value == null) {
						dataPane += '<td></td>';
					}
					else {
						dataPane += '<td>' + value + '</td>';
					}
				}
			})

			dataPane += '<td>'
			dataPane += '<img class="editRow" src="scripts/images/icons-svg/edit-black.svg" dataType="' + type + '" rowId=' + record.id + ' alt="edit row"/>';
			dataPane += '&nbsp;&nbsp;'
			dataPane += '<img class="deleteRow" src="scripts/images/icons-svg/delete-black.svg" dataType="' + type + '" rowId=' + record.id + ' alt="delete row"/>';
			dataPane += '</td>'

			dataPane += '</tr>';
		})
		dataPane += '</tbody>';
		dataPane += '</table>';
		dataPane += '</div>';
	}

	dataPane += '<p><button id="addNewButton" class="btn btn-primary" dataType="' + type + '">Add</button></p>';

	$(element).html(dataPane);

	$('#addNewButton').click(function () {
		var dataType = $(this).attr('dataType');
		addData(dataType);
	})

	$('.editRow').click(function () {
		var dataType = $(this).attr('dataType');
		var rowId = parseInt($(this).attr('rowId'));
		editData(dataType, rowId);
	})

	$('.deleteRow').click(function () {
		var dataType = $(this).attr('dataType');
		var rowId = parseInt($(this).attr('rowId'));
		if (confirm("Are you sure you'd like to delete " + dataType + " ID " + rowId + "?")) {
			deleteData(dataType, rowId);
		}
	})
}

function addData(dataType) {
	var dataModal = "";

	switch (dataType) {
		case "layouts":
			dataModal = "addLayoutModal";
			break;
		case "industries":
			dataModal = "addIndustryModal";
			break;
		case "locomotives":
			dataModal = "addLocomotiveModal";
			break;
		case "rollingstock":
			dataModal = "addRollingStockModal";
			break;
	}

	if (dataModal == "") {
		alert("Data for " + dataType + " cannot be added as it is not currently implemented.");
	}
	else {
		railops.loadModal(dataModal)
			.then(addModal => {
				var section = addModal;
				$('#modalContainer').html(section);

				var color1 = railops.getRandomColor();
				var color2 = railops.getRandomColor();
				$('#color1Input').val(color1);
				$('#color2Input').val(color2);

				var addModal = new bootstrap.Modal('#' + dataModal);

				switch (dataType) {
					case "layouts":
						addModal.show();
						$('#clearButton').click(() => { ClearLayoutForm(); });
						$('#addButton').click(() => { AddLayout(); });
						break;
					case "industries":
						railops.getData("layouts")
							.then(layouts => {
								layouts.forEach(layout => {
									$('#layoutSelect').append('<option value="' + layout.id + '">' + layout.Name + '</option>');
								})
								addModal.show();

								$('#clearButton').click(() => { ClearIndustryForm(); });
								$('#addButton').click(() => { AddIndustry(); });
							})
						break;
					case "locomotives":
						railops.getData("settings")
							.then(settings => settings.LocomotiveTypes)
							.then(locomotiveTypes => {
								locomotiveTypes.forEach(type => {
									$('#typeSelect').append('<option value="' + type + '">' + type + '</option>');
								})

								addModal.show();

								$('.displayNamePart').on('input', function () {
									var displayName = $('#reportingMarkInput').val() + $('#roadNumberInput').val();
									$('#displayName').val(displayName);
								})

								$('#clearButton').click(() => { ClearLocomotiveForm(); });
								$('#addButton').click(() => { AddLocomotive(); });
							})
						break;
					case "rollingstock":
						railops.getData("settings")
							.then(settings => settings.RollingStockTypes)
							.then(rollingStockTypes => {
								rollingStockTypes.forEach(type => {
									$('#typeSelect').append('<option value="' + type + '">' + type + '</option>');
								})

								addModal.show();

								$('.displayNamePart').on('input', function () {
									var displayName = $('#reportingMarkInput').val() + $('#roadNumberInput').val();
									$('#displayName').val(displayName);
								})

								$('#clearButton').click(() => { ClearRollingStockForm(); });
								$('#addButton').click(() => { AddRollingStock(); });
							})
						break;
				}
			})
	}
}

function editData(dataType, rowId) {
	var dataModal = "";

	switch (dataType) {
		case "layouts":
			dataModal = "addLayoutModal";
			break;
		case "industries":
			dataModal = "addIndustryModal";
			break;
		case "locomotives":
			dataModal = "addLocomotiveModal";
			break;
		case "rollingstock":
			dataModal = "addRollingStockModal";
			break;
	}

	if (dataModal == "") {
		alert("Data for " + dataType + " cannot be edited as it is not currently implemented.");
	}
	else {
		railops.loadModal(dataModal)
			.then(addModal => {
				var section = addModal;
				$('#modalContainer').html(section);

				var addModal = new bootstrap.Modal('#' + dataModal);
				$('#clearButton').html('Cancel');
				$('#addButton').html('Update');

				switch (dataType) {
					case "layouts":
						railops.getData('layouts')
							.then(layouts => {
								addModal.show();

								var layout = layouts.filter(x => x.id == rowId)[0];
								$('#layoutInput').val(layout.Name);
								$('#descriptionInput').val(layout.Description);
								$('#scaleInput').val(layout.Scale);
								$('#color1Input').val(layout.Color1);
								$('#color2Input').val(layout.Color2);
								$('#notesText').val(layout.Notes);
								$('#pictureInput').val(layout.Photo);
								$('#' + dataModal + 'Label').html($('#' + dataModal + 'Label').html().replace('Add', 'Edit'));
								$('#clearButton').click(() => { $('#' + dataModal).modal('hide'); });
								$('#addButton').click(() => { UpdateLayout(rowId); });
							})
						break;
					case "industries":
						railops.getData('industries')
							.then(industries => {
								var industry = industries.filter(x => x.id == rowId)[0];

								railops.getData("layouts")
									.then(layouts => {
										layouts.forEach(layout => {
											$('#layoutSelect').append('<option value="' + layout.id + '">' + layout.Name + '</option>');
										})
										addModal.show();
										$('#industryInput').val(industry.Name);
										$('#descriptionInput').val(industry.Description);
										$('#spotsInput').val(industry.Spots);

										if (industry.Layout == null) {
											$('#layoutSelect').prop('selectedIndex', 0);
										}
										else {
											$('#layoutSelect').val(industry.Layout);
										}

										$('#color1Input').val(industry.Color1);
										$('#color2Input').val(industry.Color2);
										$('#notesText').val(industry.Notes);
										$('#pictureInput').val(industry.Photo);

										$('#' + dataModal + 'Label').html($('#' + dataModal + 'Label').html().replace('Add', 'Edit'));

										$('#clearButton').click(() => { $('#' + dataModal).modal('hide'); });
										$('#addButton').click(() => { UpdateIndustry(rowId); });
									})
							})


						break;
					case "locomotives":
						railops.getData('locomotives')
							.then(locomotives => {
								var locomotive = locomotives.filter(x => x.id == rowId)[0];

								railops.getData("settings")
									.then(settings => settings.LocomotiveTypes)
									.then(locomotiveTypes => {
										locomotiveTypes.forEach(type => {
											$('#typeSelect').append('<option value="' + type + '">' + type + '</option>');
										})
										addModal.show();
										$('#reportingMarkInput').val(locomotive.ReportingMark);
										$('#roadNumberInput').val(locomotive.RoadNumber);

										$('#displayName').val(railops.getDisplayName(locomotive));

										if (locomotive.Type == null) {
											$('#typeSelect').prop('selectedIndex', 0);
										}
										else {
											$('#typeSelect').val(locomotive.Type);
										}

										$('#scaleInput').val(locomotive.Scale);
										$('#color1Input').val(locomotive.Color1);
										$('#color2Input').val(locomotive.Color2);
										$('#notesText').val(locomotive.Notes);
										$('#pictureInput').val(locomotive.Photo);

										$('#' + dataModal + 'Label').html($('#' + dataModal + 'Label').html().replace('Add', 'Edit'));

										$('.displayNamePart').on('input', function () {
											var displayName = $('#reportingMarkInput').val() + $('#roadNumberInput').val();
											$('#displayName').val(displayName);
										})

										$('#clearButton').click(() => { $('#' + dataModal).modal('hide'); });
										$('#addButton').click(() => { UpdateLocomotive(rowId); });
									})
							})

						break;
					case "rollingstock":
						railops.getData('rollingstock')
							.then(rollingstock => {
								var stock = rollingstock.filter(x => x.id == rowId)[0];

								railops.getData("settings")
									.then(settings => settings.RollingStockTypes)
									.then(rollingStockTypes => {
										rollingStockTypes.forEach(type => {
											$('#typeSelect').append('<option value="' + type + '">' + type + '</option>');
										})

										addModal.show();

										$('#reportingMarkInput').val(stock.ReportingMark);
										$('#roadNumberInput').val(stock.RoadNumber);

										$('#displayName').val(railops.getDisplayName(stock));

										if (stock.Type == null) {
											$('#typeSelect').prop('selectedIndex', 0);
										}
										else {
											$('#typeSelect').val(stock.Type);
										}

										$('#scaleInput').val(stock.Scale);
										$('#color1Input').val(stock.Color1);
										$('#color2Input').val(stock.Color2);
										$('#notesText').val(stock.Notes);
										$('#pictureInput').val(stock.Photo);

										$('#' + dataModal + 'Label').html($('#' + dataModal + 'Label').html().replace('Add', 'Edit'));

										$('.displayNamePart').on('input', function () {
											var displayName = $('#reportingMarkInput').val() + $('#roadNumberInput').val();
											$('#displayName').val(displayName);
										})

										$('#clearButton').click(() => { $('#' + dataModal).modal('hide'); });
										$('#addButton').click(() => { UpdateRollingStock(rowId); });
									})
							})

						break;
				}
			})
	}
}

function deleteData(dataType, rowId) {
	railops.getData(dataType)
		.then(data => {
			var updatedData = data.filter(x => x.id != rowId);
			railops.writeData(dataType, updatedData)
				.then(success => {
					if (success && dataType == 'layouts') {
						var industriesType = 'industries';
						railops.getData(industriesType)
							.then(industries => {
								industries.forEach(industry => {
									if (industry.Layout == rowId) {
										industry.Layout = null;
									}
								})
								railops.writeData(industriesType, industries)
									.then(success => {
										if (success) {
											showDataPane(dataType);
										}
										else {
											alert('An error occurred while updating Industries for the removed Layout. Please try again or update manually.');
										}
									})
							})
					}
					else if (success) {
						showDataPane(dataType);
					}
					else {
						alert('An error occurred while deleting. Please try again.');
					}
				})
		});
}

function ClearLayoutForm() {
	$('#layoutInput').val('');
	$('#descriptionInput').val('');
	$('#scaleInput').val('');
	$('#color1Input').val('#ffffff');
	$('#color2Input').val('#000000');
	$('#notesText').val('');
	$('#pictureInput').val('');
}

function ClearIndustryForm() {
	$('#industryInput').val('');
	$('#descriptionInput').val('');
	$('#spotsInput').val(1);
	$('#layoutSelect').prop('selectedIndex', 0);
	$('#color1Input').val('#ffffff');
	$('#color2Input').val('#000000');
	$('#notesText').val('');
	$('#pictureInput').val('');
}

function ClearLocomotiveForm() {
	$('#reportingMarkInput').val('');
	$('#roadNumberInput').val('');
	$('#typeSelect').prop('selectedIndex', 0);
	$('#scaleInput').val('');
	$('#color1Input').val('#ffffff');
	$('#color2Input').val('#000000');
	$('#notesText').val('');
	$('#pictureInput').val('');
}

function ClearRollingStockForm() {
	$('#reportingMarkInput').val('');
	$('#roadNumberInput').val('');
	$('#typeSelect').prop('selectedIndex', 0);
	$('#scaleInput').val('');
	$('#color1Input').val('#ffffff');
	$('#color2Input').val('#000000');
	$('#notesText').val('');
	$('#pictureInput').val('');
}

function AddLayout() {
	railops.getData('layouts')
		.then(data => {
			var nextId = 1;
			if (!data) {
				data = [];
			}
			else {
				nextId = data[data.length - 1].id + 1;
			}

			var pictureInput = document.getElementById('pictureInput');
			var file = pictureInput.files[0];
			if (!file) {
				var newLayout = {
					"id": nextId,
					"Name": $('#layoutInput').val(),
					"Description": $('#descriptionInput').val(),
					"Scale": $('#scaleInput').val(),
					"Color1": $('#color1Input').val(),
					"Color2": $('#color2Input').val(),
					"Notes": $('#notesText').val(),
					"Photo": ""
				}

				data[data.length] = newLayout;

				railops.writeData('layouts', data)
					.then(success => {
						if (success) {
							$('#addLayoutModal').modal('hide');
							showDataPane('layouts');
						}
						else {
							alert('An error occurred while adding the Layout. Please try again.');
						}
					})
			}
			else {
				railops.fileToBase64(file)
					.then(photoData => {
						var newLayout = {
							"id": nextId,
							"Name": $('#layoutInput').val(),
							"Description": $('#descriptionInput').val(),
							"Scale": $('#scaleInput').val(),
							"Color1": $('#color1Input').val(),
							"Color2": $('#color2Input').val(),
							"Notes": $('#notesText').val(),
							"Photo": photoData
						}

						data[data.length] = newLayout;

						railops.writeData('layouts', data)
							.then(success => {
								if (success) {
									$('#addLayoutModal').modal('hide');
									showDataPane('layouts');
								}
								else {
									alert('An error occurred while adding the Layout. Please try again.');
								}
							})
					})
			}
		})
}

function AddIndustry() {
	railops.getData('industries')
		.then(data => {
			var nextId = 1;
			if (!data) {
				data = [];
			}
			else {
				nextId = data[data.length - 1].id + 1;
			}

			var pictureInput = document.getElementById('pictureInput');
			var file = pictureInput.files[0];
			if (!file) {
				var newIndustry = {
					"id": nextId,
					"Name": $('#industryInput').val(),
					"Description": $('#descriptionInput').val(),
					"Spots": parseInt($('#spotsInput').val()),
					"Layout": parseInt($('#layoutSelect').val()),
					"Color1": $('#color1Input').val(),
					"Color2": $('#color2Input').val(),
					"Notes": $('#notesText').val(),
					"Photo": ""
				}

				data[data.length] = newIndustry;

				railops.writeData('industries', data)
					.then(success => {
						if (success) {
							$('#addIndustryModal').modal('hide');
							showDataPane('industries');
						}
						else {
							alert('An error occurred while adding the Industry. Please try again.');
						}
					})
			}
			else {
				railops.fileToBase64(file)
					.then(photoData => {
						var newIndustry = {
							"id": nextId,
							"Name": $('#industryInput').val(),
							"Description": $('#descriptionInput').val(),
							"Spots": parseInt($('#spotsInput').val()),
							"Layout": parseInt($('#layoutSelect').val()),
							"Color1": $('#color1Input').val(),
							"Color2": $('#color2Input').val(),
							"Notes": $('#notesText').val(),
							"Photo": photoData
						}

						data[data.length] = newIndustry;

						railops.writeData('industries', data)
							.then(success => {
								if (success) {
									$('#addIndustryModal').modal('hide');
									showDataPane('industries');
								}
								else {
									alert('An error occurred while adding the Industry. Please try again.');
								}
							})
					})
			}
		})
}

function AddLocomotive() {
	railops.getData('locomotives')
		.then(data => {
			var nextId = 1;
			if (!data) {
				data = [];
			}
			else {
				nextId = data[data.length - 1].id + 1;
			}

			var pictureInput = document.getElementById('pictureInput');
			var file = pictureInput.files[0];
			if (!file) {
				var newLocomotive = {
					"id": nextId,
					"ReportingMark": $('#reportingMarkInput').val(),
					"RoadNumber": $('#roadNumberInput').val(),
					"Type": $('#typeSelect').val(),
					"Scale": $('#scaleInput').val(),
					"Color1": $('#color1Input').val(),
					"Color2": $('#color2Input').val(),
					"Notes": $('#notesText').val(),
					"Photo": ""
				}

				data[data.length] = newLocomotive;

				railops.writeData('locomotives', data)
					.then(success => {
						if (success) {
							$('#addLocomotiveModal').modal('hide');
							showDataPane('locomotives');
						}
						else {
							alert('An error occurred while adding the Locomotive. Please try again.');
						}
					})
			}
			else {
				railops.fileToBase64(file)
					.then(photoData => {
						var newLocomotive = {
							"id": nextId,
							"ReportingMark": $('#reportingMarkInput').val(),
							"RoadNumber": $('#roadNumberInput').val(),
							"Type": $('#typeSelect').val(),
							"Scale": $('#scaleInput').val(),
							"Color1": $('#color1Input').val(),
							"Color2": $('#color2Input').val(),
							"Notes": $('#notesText').val(),
							"Photo": photoData
						}

						data[data.length] = newLocomotive;

						railops.writeData('locomotives', data)
							.then(success => {
								if (success) {
									$('#addLocomotiveModal').modal('hide');
									showDataPane('locomotives');
								}
								else {
									alert('An error occurred while adding the Locomotive. Please try again.');
								}
							})
					})
			}
		})
}

function AddRollingStock() {
	railops.getData('rollingstock')
		.then(data => {
			var nextId = 1;
			if (!data) {
				data = [];
			}
			else {
				nextId = data[data.length - 1].id + 1;
			}

			var pictureInput = document.getElementById('pictureInput');
			var file = pictureInput.files[0];
			if (!file) {
				var newRollingStock = {
					"id": nextId,
					"ReportingMark": $('#reportingMarkInput').val(),
					"RoadNumber": $('#roadNumberInput').val(),
					"Type": $('#typeSelect').val(),
					"Scale": $('#scaleInput').val(),
					"Color1": $('#color1Input').val(),
					"Color2": $('#color2Input').val(),
					"Notes": $('#notesText').val(),
					"Photo": ""
				}

				data[data.length] = newRollingStock;

				railops.writeData('rollingstock', data)
					.then(success => {
						if (success) {
							$('#addRollingStockModal').modal('hide');
							showDataPane('rollingstock');
						}
						else {
							alert('An error occurred while adding the Rolling Stock. Please try again.');
						}
					})
			}
			else {
				railops.fileToBase64(file)
					.then(photoData => {
						var newRollingStock = {
							"id": nextId,
							"ReportingMark": $('#reportingMarkInput').val(),
							"RoadNumber": $('#roadNumberInput').val(),
							"Type": $('#typeSelect').val(),
							"Scale": $('#scaleInput').val(),
							"Color1": $('#color1Input').val(),
							"Color2": $('#color2Input').val(),
							"Notes": $('#notesText').val(),
							"Photo": photoData
						}

						data[data.length] = newRollingStock;

						railops.writeData('rollingstock', data)
							.then(success => {
								if (success) {
									$('#addRollingStockModal').modal('hide');
									showDataPane('rollingstock');
								}
								else {
									alert('An error occurred while adding the Rolling Stock. Please try again.');
								}
							})
					})
			}
		})
}

function UpdateLayout(rowId) {
	railops.getData('layouts')
		.then(data => {
			if (!data) {
				data = [{ "id": rowId }];
			}

			var pictureInput = document.getElementById('pictureInput');
			var file = pictureInput.files[0];
			if (!file) {
				var updatedLayout = {
					"id": rowId,
					"Name": $('#layoutInput').val(),
					"Description": $('#descriptionInput').val(),
					"Scale": $('#scaleInput').val(),
					"Color1": $('#color1Input').val(),
					"Color2": $('#color2Input').val(),
					"Notes": $('#notesText').val(),
					"Photo": ""
				}

				var updatedData = data.map(x => {
					return x.id == rowId ? updatedLayout : x;
				})

				railops.writeData('layouts', updatedData)
					.then(success => {
						if (success) {
							$('#addLayoutModal').modal('hide');
							showDataPane('layouts');
						}
						else {
							alert('An error occurred while updating the Layout. Please try again.');
						}
					})
			}
			else {
				railops.fileToBase64(file)
					.then(photoData => {
						var updatedLayout = {
							"id": rowId,
							"Name": $('#layoutInput').val(),
							"Description": $('#descriptionInput').val(),
							"Scale": $('#scaleInput').val(),
							"Color1": $('#color1Input').val(),
							"Color2": $('#color2Input').val(),
							"Notes": $('#notesText').val(),
							"Photo": photoData
						}

						var updatedData = data.map(x => {
							return x.id == rowId ? updatedLayout : x;
						})

						railops.writeData('layouts', updatedData)
							.then(success => {
								if (success) {
									$('#addLayoutModal').modal('hide');
									showDataPane('layouts');
								}
								else {
									alert('An error occurred while updating the Layout. Please try again.');
								}
							})
					})
			}
		})
}

function UpdateIndustry(rowId) {
	railops.getData('industries')
		.then(data => {
			if (!data) {
				data = [{ "id": rowId }];
			}

			var pictureInput = document.getElementById('pictureInput');
			var file = pictureInput.files[0];
			if (!file) {
				var updatedIndustry = {
					"id": rowId,
					"Name": $('#industryInput').val(),
					"Description": $('#descriptionInput').val(),
					"Spots": parseInt($('#spotsInput').val()),
					"Layout": parseInt($('#layoutSelect').val()),
					"Color1": $('#color1Input').val(),
					"Color2": $('#color2Input').val(),
					"Notes": $('#notesText').val(),
					"Photo": ""
				}

				var updatedData = data.map(x => {
					return x.id == rowId ? updatedIndustry : x;
				})

				railops.writeData('industries', updatedData)
					.then(success => {
						if (success) {
							$('#addIndustryModal').modal('hide');
							showDataPane('industries');
						}
						else {
							alert('An error occurred while updating the Industry. Please try again.');
						}
					})
			}
			else {
				railops.fileToBase64(file)
					.then(photoData => {
						var updatedIndustry = {
							"id": rowId,
							"Name": $('#industryInput').val(),
							"Description": $('#descriptionInput').val(),
							"Spots": parseInt($('#spotsInput').val()),
							"Layout": parseInt($('#layoutSelect').val()),
							"Color1": $('#color1Input').val(),
							"Color2": $('#color2Input').val(),
							"Notes": $('#notesText').val(),
							"Photo": photoData
						}

						var updatedData = data.map(x => {
							return x.id == rowId ? updatedIndustry : x;
						})

						railops.writeData('industries', updatedData)
							.then(success => {
								if (success) {
									$('#addIndustryModal').modal('hide');
									showDataPane('industries');
								}
								else {
									alert('An error occurred while updating the Industry. Please try again.');
								}
							})
					})
			}
		})
}

function UpdateLocomotive(rowId) {
	railops.getData('locomotives')
		.then(data => {
			if (!data) {
				data = [{ "id": rowId }];
			}

			var pictureInput = document.getElementById('pictureInput');
			var file = pictureInput.files[0];
			if (!file) {
				var updatedLocomotive = {
					"id": rowId,
					"ReportingMark": $('#reportingMarkInput').val(),
					"RoadNumber": $('#roadNumberInput').val(),
					"Type": $('#typeSelect').val(),
					"Scale": $('#scaleInput').val(),
					"Color1": $('#color1Input').val(),
					"Color2": $('#color2Input').val(),
					"Notes": $('#notesText').val(),
					"Photo": ""
				}

				var updatedData = data.map(x => {
					return x.id == rowId ? updatedLocomotive : x;
				})

				railops.writeData('locomotives', updatedData)
					.then(success => {
						if (success) {
							$('#addLocomotiveModal').modal('hide');
							showDataPane('locomotives');
						}
						else {
							alert('An error occurred while updating the Locomotive. Please try again.');
						}
					})
			}
			else {
				railops.fileToBase64(file)
					.then(photoData => {
						var updatedLocomotive = {
							"id": rowId,
							"ReportingMark": $('#reportingMarkInput').val(),
							"RoadNumber": $('#roadNumberInput').val(),
							"Type": $('#typeSelect').val(),
							"Scale": $('#scaleInput').val(),
							"Color1": $('#color1Input').val(),
							"Color2": $('#color2Input').val(),
							"Notes": $('#notesText').val(),
							"Photo": photoData
						}

						var updatedData = data.map(x => {
							return x.id == rowId ? updatedLocomotive : x;
						})

						railops.writeData('locomotives', updatedData)
							.then(success => {
								if (success) {
									$('#addLocomotiveModal').modal('hide');
									showDataPane('locomotives');
								}
								else {
									alert('An error occurred while updating the Locomotive. Please try again.');
								}
							})
					})
			}
		})
}

function UpdateRollingStock(rowId) {
	railops.getData('rollingstock')
		.then(data => {
			if (!data) {
				data = [{ "id": rowId }];
			}

			var pictureInput = document.getElementById('pictureInput');
			var file = pictureInput.files[0];
			if (!file) {
				var updatedRollingStock = {
					"id": rowId,
					"ReportingMark": $('#reportingMarkInput').val(),
					"RoadNumber": $('#roadNumberInput').val(),
					"Type": $('#typeSelect').val(),
					"Scale": $('#scaleInput').val(),
					"Color1": $('#color1Input').val(),
					"Color2": $('#color2Input').val(),
					"Notes": $('#notesText').val(),
					"Photo": ""
				}

				var updatedData = data.map(x => {
					return x.id == rowId ? updatedRollingStock : x;
				})

				railops.writeData('rollingstock', updatedData)
					.then(success => {
						if (success) {
							$('#addRollingStockModal').modal('hide');
							showDataPane('rollingstock');
						}
						else {
							alert('An error occurred while adding the Rolling Stock. Please try again.');
						}
					})
			}
			else {
				railops.fileToBase64(file)
					.then(photoData => {
						var updatedRollingStock = {
							"id": rowId,
							"ReportingMark": $('#reportingMarkInput').val(),
							"RoadNumber": $('#roadNumberInput').val(),
							"Type": $('#typeSelect').val(),
							"Scale": $('#scaleInput').val(),
							"Color1": $('#color1Input').val(),
							"Color2": $('#color2Input').val(),
							"Notes": $('#notesText').val(),
							"Photo": photoData
						}

						var updatedData = data.map(x => {
							return x.id == rowId ? updatedRollingStock : x;
						})

						railops.writeData('rollingstock', updatedData)
							.then(success => {
								if (success) {
									$('#addRollingStockModal').modal('hide');
									showDataPane('rollingstock');
								}
								else {
									alert('An error occurred while adding the Rolling Stock. Please try again.');
								}
							})
					})
			}
		})
}

export { DataManagerComponent };