import { ErrorComponent } from './components/error.js';

import { HomeComponent } from './components/home.js';
import { SettingsComponent } from './components/settings.js';
import { DataManagerComponent } from './components/datamanager.js';
import { SessionSetupComponent } from './components/sessionsetup.js';
import { SessionComponent } from './components/session.js';
import { LoadSessionComponent } from './components/loadsession.js';

const routes = [
	{ path: '/', component: HomeComponent, },
	{ path: '/settings', component: SettingsComponent, },
	{ path: '/datamanager', component: DataManagerComponent, },
	{ path: '/sessionsetup/:sessionType', component: SessionSetupComponent, },
	{ path: '/session/:sessionId-switchListId', component: SessionComponent, },
	{ path: '/loadsession', component: LoadSessionComponent, }
];

const router = () => {
	const path = parseLocation();
	const route = findRouteByPath(path, routes) || { path: 'error', component: ErrorComponent };
	var id = '';
	if (path !== '/' && route.path !== 'error') {
		var baseRoute = route.path.replace(/:[^\s/]+/g, '')
		if (baseRoute !== path) {
			id = path.replace(baseRoute, '')
		}
	}
	route.component.render(id);
	window.scrollTo(0, 0);
};

const parseLocation = () => location.hash.slice(1).toLowerCase() || '/';
const findRouteByPath = (path, routes) => routes.find(r => path.match(new RegExp("^" + r.path.replace(/\/:[^\s/]+/g, '(\/.*)') + "$"))) || undefined;

export { router };