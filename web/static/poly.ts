import { JSDOM } from 'jsdom';

// const nsd =
global.window = new JSDOM('').window;
global.document = window.document;
window.matchMedia = () => false;
