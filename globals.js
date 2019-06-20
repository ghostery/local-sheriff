const _chrome = chrome;
const _browser = typeof browser !== 'undefined' ? browser : _chrome;

export {
	_browser as browser,
	_chrome as chrome,
};
