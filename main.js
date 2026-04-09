import { router } from './modules/router.js';

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
if(window.location.hash === ''){
	window.location = '#';
}

$('#headerHome').click(function(){ window.location = "#"; })
$('#currentyear').html(new Date().getFullYear());