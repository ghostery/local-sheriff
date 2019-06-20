import { chrome, browser } from './globals';
import trackerData from './whotracksme.json';
import {
	cleanStorage,
	saveCookies,
	saveHTML,
	saveInDB,
	saveInputFields,
	saveInputFieldsCache,
	savetpList,
	savetpURLFP,
} from './database';

function log(message) {
	if (debug) {
		console.log(message);
	}
}

function strip(html) {
	var doc = new DOMParser().parseFromString(html, 'text/html');
	return doc.body.textContent || "";
}

function decode(txt) {
	try {
		return decodeURIComponent(decodeURIComponent(txt));
	} catch (e) {
		return txt;
	}
}

function cookie_parser(header, fp, tp) {
	header.split(';').map(function (c) {
		return c.trim().split('=').map(decode);
	}).reduce(function (a, b) {
		try {
			// console.log(b);
			a[b[0]] = JSON.parse(b[1]);
		} catch (e) {
			a[b[0]] = b[1];
		}
		// const cookie_map_key = b[0] + ":" + b[1];
		const cookie_map_key = b[1];
		if (!cookie_map.hasOwnProperty(cookie_map_key)) {
			cookie_map[cookie_map_key] = {};
		}

		if (!cookie_map[cookie_map_key].hasOwnProperty(tp)) {
			cookie_map[cookie_map_key][tp] = new Set();
		}
		cookie_map[cookie_map_key][tp].add(fp);
		//console.log(a);
		return a;
	}, {});
}

// parse query parameters from URL
// https://stackoverflow.com/questions/8486099/how-do-i-parse-a-url-query-parameters-in-javascript
function getJsonFromUrl(tp_url, tp_host, fp) {

	var question = tp_url.indexOf("?");
	var hash = tp_url.indexOf("#");
	if (hash == -1 && question == -1) return {};

	if (hash == -1) hash = tp_url.length;
	var query = question == -1 || hash == question + 1 ? tp_url.substring(hash) :
		tp_url.substring(question + 1, hash);
	var result = {};
	query.split("&").forEach(function (part) {
		if (!part) return;
		part = part.split("+").join(" "); // replace every + with space, regexp-free version
		var eq = part.indexOf("=");
		var key = eq > -1 ? part.substr(0, eq) : part;
		var val = eq > -1 ? decodeURIComponent(part.substr(eq + 1)) : "";
		var from = key.indexOf("[");
		if (from == -1) {
			result[decodeURIComponent(key)] = val;
			// Create a map of value => tp => fp. This should match the structure for cookie_map;
			if (!query_param_map[val]) query_param_map[val] = {}
			if (!query_param_map[val][tp_host]) query_param_map[val][tp_host] = new Set();
			query_param_map[val][tp_host].add(fp);
		}
		else {
			var to = key.indexOf("]", from);
			var index = decodeURIComponent(key.substring(from + 1, to));
			key = decodeURIComponent(key.substring(0, from));
			if (!result[key]) result[key] = [];
			if (!index) result[key].push(val);
			else result[key][index] = val;

			// Create a map of value => tp => fp. This should match the structure for cookie_map;
			if (!query_param_map[val]) query_param_map[val] = {}
			if (!query_param_map[val][tp_host]) query_param_map[val][tp_host] = new Set();
			query_param_map[val][tp_host].add(fp);

		}
	});
	return result;
}

// Let's get the intersection between query_map and cookie_map
// Let's find values that can be used for tracking.
const STOP_WORDS = ['true', 'false', 'undefined', '2019', '19-'];

function intersection(o1, o2) {
	return Object.keys(o1).concat(Object.keys(o2)).sort().reduce(function (r, a, i, aa) {
		if (i && aa[i - 1] === a && a.length > 4 && STOP_WORDS.indexOf(a) === -1) {
			r.push(a);
		}
		return r;
	}, []);
}


// Let's find values of interest.
function cookie_synching() {
	return intersection(query_param_map, cookie_map);
}

function values_used_for_tracking() {
	const values_for_tracking = new Set();
	Object.keys(cookie_map).forEach(e => {
		Object.keys(cookie_map[e]).forEach(y => {
			const l = [...cookie_map[e][y]].length
			if (l > 2 && e.length > 4 && e.indexOf('19-') === -1 && e.indexOf('2019') === -1) {
				values_for_tracking.add(e);
			}
		});
	});

	Object.keys(query_param_map).forEach(e => {
		Object.keys(query_param_map[e]).forEach(y => {
			const l = [...query_param_map[e][y]].length
			if (l > 2 && e.length > 4 && e.indexOf('19-') === -1 && e.indexOf('2019') === -1) {
				values_for_tracking.add(e);
			}
		});
	});
	return [...values_for_tracking];
}

// Let's create company profiles.
function company_wise_profile() {
	const company_name = {};
	Object.keys(refTP).forEach(url => {
		const parsed = parseURL(url);
		Object.keys(refTP[url]).forEach(company => {
			if (Object.keys(company_name).indexOf(company) === -1) {
				company_name[company] = new Set();
			}
			company_name[company].add(parsed.hostname);
		})
	});

	const treeD3 = { "name": "Tracker Companies", "children": [] };
	Object.keys(company_name).forEach(tp_company => {
		const t = { "name": tp_company, "children": [] };
		company_name[tp_company].forEach(website => {
			t['children'].push({ "name": website, "size": 100 });
		})
		treeD3['children'].push(t);
	})
	return treeD3;
}
const debug = true;

/// Comes from whitracks.me. We need to improve the mechanisms to update the lists.
const trackerDomains = [];
const companyTree = {} // Should start company -> domain visited -> url -> HTML.
const controlPanelURL = chrome.extension.getURL('templates/control-panel.html');
const treeURL = chrome.extension.getURL('templates/company-tree.html');
let recordingStatus = false;
const contentScriptPath = 'scripts/content-script.js';
const cookie_map = {};
const query_param_map = {};

// They are let and not const. as it helps in reloading them.
let refTP = {};
let tpURL = new Set();
let thirdPartyFP = {};

let refHTML = {};
const inputFields = {};
const inputFieldsCache = {};

let cookieTable = {};

// Maintain a mapping of tab => parent url.
// How is parent url defined? when we observe a main_frame request.

const parentTabMapping = {};

// Create a mapping of hostname to company name
const company_hostname_mapping = {}

Object.values(trackerData.trackers).forEach((info) => {
	const company_name = info.company_id === null ? 'Unknown' : trackerData.companies[info.company_id].name;
	info.domains.forEach(y => {
		trackerDomains.push(y);
		company_hostname_mapping[y] = company_name;
	});
});

// Adding company name and tracker host.
// Structure is:
// refTP[url][company_name] => ['trackerdomain1', 'trackerdomain2'];
// refTP is confusing, it should be named as FP -> Tracker mapping.

function addToDict(ref, tp, action) {
	const _ref = decode(ref);
	if (refTP.hasOwnProperty(_ref)) {
		if (refTP[_ref].hasOwnProperty(tp.company_name)) {
			if (refTP[_ref][tp.company_name].indexOf(tp.tracker_host) === -1) {
				refTP[_ref][tp.company_name].push(tp.tracker_host);
			}
		} else {
			refTP[_ref][tp.company_name] = [];
			refTP[_ref][tp.company_name].push(tp.tracker_host);
		}

	} else {
		refTP[_ref] = {};
		refTP[_ref][tp.company_name] = [];
		refTP[_ref][tp.company_name].push(tp.tracker_host);
	}

	// We use the same function to populate the variables again.
	if (action !== 'load') {
		saveInDB(ref, tp);
		// Needs to be scheduled. For now it's instant.
		addToHTML(_ref);
	}

}

// This function populates FPURL => HTML in the dict. refHTML.
function addToHTML(url) {
	if (!url.startsWith('https://') && !url.startsWith('http://')) return;

	if (!refHTML.hasOwnProperty(url)) {
		// Otherwise it will send multiple requests to the same url.
		refHTML[url] = '';
		getRequest(url).then(res => {
			saveHTML(url, res);
			refHTML[url] = res; // Need to find some cases when it breaks.
		}).catch(console.log);
	}
}
// This funcation adds all third-party URLS with which first-parties they were seen.
function addThirdPartyFP(tp, fp, companyDetailsTP, companyDetailsFP) {
	thirdPartyFP[tp] = {
		tpdetails: companyDetailsTP,
		fpdetails: companyDetailsFP,
		fp
	};

	savetpURLFP(tp, {
		tpdetails: companyDetailsTP,
		fpdetails: companyDetailsFP,
		fp
	});

}

function addToCompanyTree(companyName, ref) {
	if (!companyTree.hasOwnProperty(companyName)) {
		companyTree[companyName] = [];
	}

	if (companyTree[companyName].indexOf(ref) === -1) {
		companyTree[companyName].push(ref);
	}
}

function checkPresence(str) {
	// result table[company][tracker]:{lu:0,lp:1,tp:1};
	// result table[company]:{leaks:0}

	if (!str || str.length < 3) {
		return {
			ls: {
				companies: [],
				domain: []
			},
			details: [],
			resultTable: {}
		}
	}


	// const re = new RegExp(str.toLowerCase(), 'ig');
	const resultTable = {};
	const leakyURLs = [];
	const leakyPages = [];
	const leakyTPs = [];

	// Check URLs containing the value.
	for (let i = 0; i < Object.keys(refHTML).length; i++) {

		// Check the URL.
		const url = Object.keys(refHTML)[i];
		const inURL = url.toLowerCase().indexOf(str.toLowerCase());
		const inHTML = refHTML[url].toLowerCase().indexOf(str.toLowerCase()); // Save HTML in lower case?.
		const parsedE = parseURL(url);

		// Check HTML content.


		if (inURL > -1 || inHTML > -1) {
			// console.log(" Information leaked via URL >>>>" + e);
			// console.log("This information is shared with :" + new Set(refTP[e]).size + " Trackers.");
			// console.log("Trackers who have this data >>> " + JSON.stringify([...new Set(refTP[e])]));
			const o = {
				leakyURL: url,
				trackers: refTP[url]
			};
			leakyURLs.push(o);

			// add to resulttable.
			Object.keys(refTP[url]).forEach(com => {
				if (!resultTable.hasOwnProperty(com)) resultTable[com] = { 'leaks': 0, websites: [] };
				if (resultTable[com]['websites'].indexOf(parsedE.hostname) === -1) {
					resultTable[com]['leaks'] += 1;
					resultTable[com]['websites'].push(parsedE.hostname);
				}
			});
		}
	}

	// Check other third-paries containing the value. This means websites are sharing them explcityl.
	// Useful for finding cookie synching across TPs.
	for (let item of tpURL) {
		const _idx = item.toLowerCase().indexOf(str.toLowerCase());
		if (_idx > -1 && thirdPartyFP[item]) {
			// console.log(" Information leaked via Third-party URL >>>>" + item);
			const o = {
				leakyTP: item,
				details: thirdPartyFP[item],
				cookie: cookieTable[item]
			}
			leakyTPs.push(o);
			console.log(item);
			const com = thirdPartyFP[item].tpdetails.company_name;
			console.log(com);
			if (!resultTable.hasOwnProperty(com)) resultTable[com] = { 'leaks': 0, websites: [] };//{'leaks':0, 'website': thirdPartyFP[item].fpdetails.tracker_host};
			if (resultTable[com]['websites'].indexOf(thirdPartyFP[item].fpdetails.tracker_host) === -1) {
				resultTable[com]['leaks'] += 1;
				resultTable[com]['websites'].push(thirdPartyFP[item].fpdetails.tracker_host);
			}
		}
	}

	// Let's also check cookies for this detail.
	Object.keys(cookieTable).forEach(item => {
		const _idx = cookieTable[item].toLowerCase().indexOf(str.toLowerCase());
		if (_idx > -1 && thirdPartyFP[item]) {
			// console.log(" Information leaked via Third-party URL >>>>" + item);
			const o = {
				leakyTP: item,
				details: thirdPartyFP[item],
				cookie: cookieTable[item]
			}
			leakyTPs.push(o);

			const com = thirdPartyFP[item].tpdetails.company_name;
			if (!resultTable.hasOwnProperty(com)) resultTable[com] = { 'leaks': 0, websites: [] };//{'leaks':0, 'website': thirdPartyFP[item].fpdetails.tracker_host};
			if (resultTable[com]['websites'].indexOf(thirdPartyFP[item].fpdetails.tracker_host) === -1) {
				resultTable[com]['leaks'] += 1;
				resultTable[com]['websites'].push(thirdPartyFP[item].fpdetails.tracker_host);
			}
		}
	})

	const ls = leakySummary([leakyURLs, leakyPages, leakyTPs]);
	return {
		ls,
		details: [leakyURLs, leakyPages, leakyTPs],
		resultTable
	}
}

// We need to create a summary, which should be put in the pop-up box.

/*
	1. Number of unique domains.
	2. Number if unique URLs.
	3. Companies browsing history shared with.
*/
function sessionSummary() {

	const uniqueDomains = new Set();
	const uniqueCompanies = new Set();

	Object.keys(refTP).forEach(u => {

		// Domains of URLs.
		const parsed = parseURL(u);
		if (parsed) {
			uniqueDomains.add(parsed.hostname);
		}

		// Unique companies that have the history.
		Object.keys(refTP[u]).forEach(c => {
			uniqueCompanies.add(c);
		});
	});

	return summary = {
		countUniqueDomains: [...uniqueDomains].length,
		countUniqueURLs: Object.keys(refTP).length,
		countUniqueCompanies: [...uniqueCompanies].length,
		urls: Object.keys(refTP),
		uniqueDomains,
		uniqueCompanies
	}

}

/*
	Summarizes the leaks. To be displayed on the pages.
	leaked is an array [leakyUrls, leakyPages, tpURL]
*/
function leakySummary(leaked) {
	const uniqueCompanies = new Set();  //  Third-party companies
	const uniqueDomains = new Set(); 	// Domain visited by the user.
	const uniqueTPDomains = new Set();	// third-party hosts.

	leaked[0].forEach(lu => {
		// Get website.
		const website = parseURL(lu.leakyURL);
		if (website) uniqueDomains.add(website.hostname);

		// Get tracker companies.
		Object.keys(lu.trackers).forEach(c => {
			uniqueCompanies.add(c);
			if (lu.trackers[c]) {
				lu.trackers[c].forEach(t => {
					uniqueTPDomains.add(t);
				})
			}
		});
	});

	// Based on the leakyTPs enhance the summary.
	leaked[2].forEach(row => {
		uniqueCompanies.add(row.details.tpdetails.company_name);
		uniqueTPDomains.add(row.details.tpdetails.tracker_host);
		uniqueDomains.add(row.details.fpdetails.tracker_host);
	});

	return {
		companies: [...uniqueCompanies],
		domain: [...uniqueDomains],
		tpHosts: [...uniqueTPDomains]
	}

}
function getRequest(url) {
	const promise = new Promise((resolve, reject) => {
		const request = fetch(url, {
			credentials: 'omit',
			cache: 'no-cache',
		});
		const timeout = new Promise((_resolve, _reject) =>
			setTimeout(_reject, 10000, 'timeout'));

		return Promise.race([timeout, request]).then((response) => {
			if (response.status !== 200 && response.status !== 0 /* local files */) {
				reject(`status not valid: ${response.status}`);
			}

			response.text().then((text) => {
				resolve(text.toString());
			});
		}).catch((errorMessage) => {
			reject(errorMessage);
		});
	});
	return promise;
}

function parseHostname(hostname) {
	const o = {
		hostname: null,
		username: '',
		password: '',
		port: null,
	};

	let h = hostname;
	let v = hostname.split('@');
	if (v.length > 1) {
		const w = v[0].split(':');
		o.username = w[0];
		o.password = w[1];
		h = v[1];
	}

	v = h.split(':');
	if (v.length > 1) {
		o.hostname = v[0];
		o.port = parseInt(v[1], 10);
	} else {
		o.hostname = v[0];
		o.port = 80;
	}

	return o;
}

// TODO: suppress for now, fix later
/* eslint-disable no-useless-escape */
/* eslint-disable prefer-template */
function parseURL(url) {
	// username, password, port, path, query_string, hostname, protocol
	const o = {};

	let v = url.split('://');
	if (v.length >= 2) {
		o.protocol = v[0];
		let s = v.slice(1, v.length).join('://');
		v = s.split('/');

		// Check for hostname, if not present then return null.
		if (v[0] === '') {
			return null;
		}

		// Check if the hostname is invalid by checking for special characters.
		// Only special characters like - and _ are allowed.
		const hostnameRegex = /[?!@#\$\^\&*\)\(+=]/g;
		if (hostnameRegex.test(v[0])) {
			return null;
		}

		const oh = parseHostname(v[0]);
		o.hostname = oh.hostname;
		o.port = oh.port;
		o.username = oh.username;
		o.password = oh.password;
		o.path = '/';
		o.query_string = null;

		if (v.length > 1) {
			s = v.splice(1, v.length).join('/');
			v = s.split('?');
			o.path = '/' + v[0];
			if (v.length > 1) {
				o.query_string = v.splice(1, v.length).join('?');
			}

			v = o.path.split(';');
			o.path = v[0];
			if (v.length > 1) {
				o.query_string = v.splice(1, v.length).join(';') + '&' + (o.query_string || '');
			}

			v = o.path.split('#');
			o.path = v[0];
			if (v.length > 1) {
				o.query_string = v.splice(1, v.length).join('#') + '&' + (o.query_string || '');
			}
		}
	} else {
		return null;
	}

	return o;
}

function parseQueryString(q) {
	/* parse the query */
	var x = q.replace(/;/g, '&').split('&'), i, name, t;

	/* q changes from string version of query to object */
	for (q = {}, i = 0; i < x.length; i++) {
		t = x[i].split('=', 2);
		name = unescape(t[0]);
		if (!q[name]) q[name] = [];
		if (t.length > 1) {
			q[name][q[name].length] = unescape(t[1]);
		}
		/* next two lines are nonstandard */
		else q[name][q[name].length] = true;
	}
	return q;
}

function getCompanyName(hostname, partialHostName) {
	if (company_hostname_mapping.hasOwnProperty(hostname) || company_hostname_mapping.hasOwnProperty(partialHostName)) {
		return {
			company_name: company_hostname_mapping[hostname] || company_hostname_mapping[partialHostName],
			// tracker_company: e,
			// tracker_id: trackerData[e].id,
			tracker_host: hostname
		}
	}

	return {
		company_name: 'Unknown',
		tracker_id: 'Unknown',
		tracker_host: hostname
	};

}

function getPartialHN(hostname) {
	let partialHostName = hostname;
	const splitHostName = hostname.split('.');
	if (splitHostName.length > 2) {
		partialHostName = splitHostName[splitHostName.length - 2] + '.' + splitHostName[splitHostName.length - 1];
	}
	return partialHostName;
}

function getReferrer(request) {
	let ref = null;
	request.requestHeaders.forEach(header => {
		if (header.name.toLowerCase() === 'referer') {
			ref = header.value;
		}
	});
	return ref;
}

// We need to check if it originates from a tab which is open in incognito. If yes, then do not observe the requests.
// On chrome it works without this check, because by default extensions are disabled in InCognito mode.

function observeRequest(request) {
	const tabID = request.tabId;

	if (tabID > 0) {
		browser.tabs.get(tabID, (tabDetails) => {
			if (tabDetails && tabDetails.incognito) {
				return;
			}
		});
	}
	onSendHeadersListeners(request);
	/*
	.then( tabDetails => {

	})
	.catch((err) => {
		console.log("Could not get request details", request);
	});
	*/
}

// This the where all requests are passed and check for third-parties start to happen.
function onSendHeadersListeners(request) {

	try {

		// console.log(JSON.stringify(request));

		if (request.type === 'main_frame') {
			parentTabMapping[request.tabId] = request.url;
		}

		/*
		let initiatorURL = '';
		if (request.initiator) {
			initiatorURL = request.initiator;
		} else {
			initiatorURL = getReferrer(request);
		}
		*/

		// This helps to detect cases of cookie sync. like foodora => criteo.
		let initiatorURL = parentTabMapping[request.tabId];
		if (!initiatorURL) {
			initiatorURL = getReferrer(request);
		}

		//console.log(`${request.url} >>>>> ${initiatorURL}`);

		if (!initiatorURL) return;
		if (initiatorURL.indexOf('-extension://') > -1) return;

		const parsedInitiatorURL = parseURL(initiatorURL);

		const parsedURL = parseURL(request.url);
		if (parsedURL && parsedInitiatorURL && parsedInitiatorURL.hostname !== parsedURL.hostname) {
			const hostname = parsedURL.hostname;
			const hostnameFP = parsedInitiatorURL.hostname;

			let partialHostName = getPartialHN(hostname);
			let partialHostNameFP = getPartialHN(hostnameFP);



			// Let's get the company name for the tracker and for the hostname.
			// If companies are different then use it as a third-party tracker.

			const companyDetailsTP = getCompanyName(hostname, partialHostName);
			const companyDetailsFP = getCompanyName(hostnameFP, partialHostNameFP);

			// We need to avoid cases like twitter.com / twimg.com etc.
			// Let's see if whotracks.me data provides us any information.
			// If the companyDetailsTP.company_name is not unknown and different from
			// companyDetailsFP.company_name then we continue.
			// Also avoid cases like FP:nytimes.com & TP:messaging-notifications.api.nytimes.com

			if ((companyDetailsTP.company_name.toLowerCase() === 'unknown' || (companyDetailsTP.company_name !== companyDetailsFP.company_name)) && (partialHostName !== partialHostNameFP)) {

				// console.log(`TP Check >>> ${request.url} >>>> ${initiatorURL} >>> ${companyDetailsTP.company_name} >>>> ${companyDetailsFP.company_name} >>> ${partialHostName} >>>> ${partialHostNameFP}`);
				// Check if referrer is there.
				request.requestHeaders.forEach(header => {
					if (header.name.toLowerCase() === 'referer') {

						// Let's check if header.value hostname is different than FP hostname.
						// This can happen eg: Foodora loads criteo loads adserver.
						// Now adserver get ref as criteo which gives incorrect info on FP.

						const parsedRefName = parseURL(header.value);
						if (parsedRefName && (parsedRefName.hostname === parsedInitiatorURL.hostname)) {
							addToDict(header.value, companyDetailsTP);
						}

						// Add to company tree;
						//addToCompanyTree(companyName, header.value);
					}
				});

				// Check if query string contains any URL.

				// This needs to be improved. We need to check for a url pattern and not just specific keys.
				if (parsedURL.query_string) {
					const parsedQuery = parseQueryString(parsedURL.query_string);
					if (parsedQuery && parsedQuery.dl) {
						const _isURL = parseURL(parsedQuery.dl[0]);
						if (_isURL) addToDict(parsedQuery.dl[0], companyDetailsTP)
					};

					if (parsedQuery && parsedQuery.dr) {
						const _isURL = parseURL(parsedQuery.dr[0]);
						if (_isURL) addToDict(parsedQuery.dr[0], companyDetailsTP);
					}
					if (parsedQuery && parsedQuery.el) {
						const _isURL = parseURL(parsedQuery.el[0]);
						if (_isURL) addToDict(parsedQuery.el[0], companyDetailsTP);
					}
					if (parsedQuery && parsedQuery.url) {
						const _isURL = parseURL(parsedQuery.url[0]);
						if (_isURL) addToDict(parsedQuery.url[0], companyDetailsTP);
					}
				}

				// We should also keep track of the URLs sent as third-party. To look values being shared across.
				tpURL.add(decode(request.url));
				addThirdPartyFP(decode(request.url), initiatorURL, companyDetailsTP, companyDetailsFP);
				savetpList(decode(request.url));

				// Let's parse the URL and add it to query_map.
				getJsonFromUrl(request.url, partialHostName, partialHostNameFP);

				// Let's keep track of the cookies too.
				// Helps find cases like Facebook.
				request.requestHeaders.forEach(header => {
					if (header.name.toLowerCase() === 'cookie') {
						const cookie_details = header.value;
						cookieTable[decode(request.url)] = cookie_details;
						saveCookies(decode(request.url), cookie_details);
						cookie_parser(cookie_details, partialHostNameFP, partialHostName);
					}
				});

			}
			//}
		}
	} catch (ee) {
		console.log(ee);
	}
}

function onMessageListener(info, sender, sendResponse) {
	// Only receive messages from control-panel.
	if (sender.url === controlPanelURL || sender.url === treeURL) {

		// Is it a recording signal.?
		if (info.type === 'recording') {
			recordingStatus = info.recordingStatus;
			console.log(recordingStatus);
		}

		// Is it call for companyTree.?
		if (info.type === 'checkPresence') {
			sendResponse({
				response: checkPresence(info.query)
			});
		}

		// Open the link in incognito.
		if (info.type === 'openLink') {
			chrome.windows.create({ "url": info.url, "incognito": true });
		}

		// Get summary.
		if (info.type === 'sessionSummary') {
			sendResponse({
				response: sessionSummary()
			});
		}

		// Get input fields leaked.
		if (info.type === 'inputFieldsLeaked') {
			sendResponse({
				response: checkInputFieldsLeaked()
			});
		}

		// Clean storage.
		if (info.type === 'cleanStorage') {
			cleanStorage();
		}

		// Check for tracking values.
		if (info.type === 'checkTrackingValues') {
			sendResponse({
				response: values_used_for_tracking()
			});
		}

		// Check for tracking values.
		if (info.type === 'checkCompanyProfiles') {
			sendResponse({
				response: company_wise_profile()
			});
		}
	}


	// Get input fields. PLEASE CHECK IF THIS IS A SAFE WAY. This could be exploited by websites.
	if (info.type === 'inputFields') {

		// Content scripts return "" at times.
		if (info.value.length === 0) return;

		if (!inputFields.hasOwnProperty(info.value)) inputFields[info.value] = {};
		if (!inputFields[info.value].hasOwnProperty(sender.url)) inputFields[info.value][sender.url] = {};
		inputFields[info.value][sender.url] = info.details;

		// Save in DB.
		saveInputFields(info.value, sender.url, info.details);

		// Send message to control-panel to update.
		chrome.runtime.sendMessage({
			type: 'updateInputFields'
		});
	}

}


// This iterates over the object inputFields which contains a list of the text entered in the text boxes.
// The result object contains info: input field value and whether it was leaked or not.

function checkInputFieldsLeaked() {
	const result = {};

	Object.keys(inputFields).forEach(e => {
		if (e.length > 0) {
			let summary = [];
			// Check presence function returns an key ls.companies.
			if (inputFieldsCache.hasOwnProperty(e)) {
				summary = inputFieldsCache[e].summary;
			} else {
				summary = checkPresence(e).ls.companies;
				inputFieldsCache[e] = {
					ts: Date.now(),
					summary
				};

				// Save it in DB.
				saveInputFieldsCache(e, { ts: Date.now(), summary });
			}
			if (summary.length > 0) {
				result[e] = true;
			} else {
				result[e] = false;
			}
		}
	});

	return result;

}

// Purge inputFiedsCache.
function purgeInputFieldsCache() {
	const now = Date.now();
	Object.keys(inputFieldsCache).forEach(e => {
		const tDiff = (now - e.ts) / 1000; // Seconds.
		if (tDiff > (10 * 1000)) {
			delete inputFieldsCache[e];
		}
	});
}


// Purge the input fields cache.
setInterval(purgeInputFieldsCache, 2000);

// CHROME EXTENSION APIs.

// Need to listen to onSendHeaders.
try {
	chrome.webRequest.onSendHeaders.addListener(observeRequest, { urls: ["<all_urls>"] }, ['requestHeaders', 'extraHeaders']);
} catch (ee) {
	chrome.webRequest.onSendHeaders.addListener(observeRequest, { urls: ["<all_urls>"] }, ['requestHeaders']);
}

// chrome.webRequest.onCompleted.addListener(console.log)
// Need to open the control-panel.
chrome.browserAction.onClicked.addListener(function (tab) {
	chrome.tabs.create({ 'url': chrome.extension.getURL('templates/control-panel.html') }, function (tab) { })
})


// Receive messages from control-panel.
chrome.runtime.onMessage.addListener(onMessageListener);



// Because of a bug in FF: https://bugzilla.mozilla.org/show_bug.cgi?id=1405971,
// when doing fetch request from within the extension, it will send the unique ID.
// Hence this check, to remove it.
// Need to compare if onSendHeaders and onBeforeSendHeaders have the same object,
// then we should only keep onBeforeSenHeaders as it allows modifying.
// This only impacts Firefox & Firefox based browsers.

chrome.webRequest.onBeforeSendHeaders.addListener(function (request) {
	try {
		request.requestHeaders.forEach(header => {
			if (header.name.toLowerCase() === 'origin' && header.value.toLowerCase().indexOf('-extension://') > -1) {
				header.value = '';
			}
			return { requestHeaders: request.requestHeaders };
		});
	} catch (ee) {
		return { requestHeaders: request.requestHeaders };
	}
}, { urls: ["<all_urls>"] }, ['blocking', 'requestHeaders']);
