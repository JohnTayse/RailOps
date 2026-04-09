const ErrorComponent = {
	render: () => {
		var section = `
			<section>
				<h1>Error 404: Path not found</h1>
				<p>Please return to the <a href="#" id="homeLink">home screen</a></p>
			</section>
		`;
		$('#app').html(section).trigger('create');

		$('#homeLink').click(function(){ window.location = "#"; });
	}
}

export { ErrorComponent };