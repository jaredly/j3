import { JSDOM } from 'jsdom';

global.window = new JSDOM('').window;
global.document = window.document;
window.matchMedia = () => false;
