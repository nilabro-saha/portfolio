import { configureLinks } from './links.mjs';
import { setupSiteMenu } from './site-menu.mjs';

setupSiteMenu();
configureLinks();
document.querySelector('#year').textContent = new Date().getFullYear();
