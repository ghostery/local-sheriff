// Wrapper using Dexie.js to use IndexedDB.
const updateTime = 1 * 60 * 1000;

// Create database.
const db = new Dexie('localSheriff');
const dbCookie = new Dexie('localSheriffCookieTable');

db.version(1).stores({
    reftp: '++id, ref, tp',
    refhtml: '++id, ref, html',
    tpurl: '++id, tpurl',
    inputFields: '++id, value, sender, details',
    inputFieldsCache: '++id, value, summary',
    tpURLFP: '++id, tpurl, details'
});

// Save cookies
dbCookie.version(1).stores({
	cookietable: '++id, url, details'
});

db.open().then(function (db) {
    // Database opened successfully
    console.log(" DB connection successful.");
    loadFromDatabase();
}).catch (function (err) {
    // Error occurred
    console.log("Error occurred while opening DB." + err);
});

// Access cookie table:
dbCookie.open().then(function (dbCookie) {
    // Database opened successfully
    console.log(" DB connection successful.");
    loadCookiesFromDatabase();
}).catch (function (err) {
    // Error occurred
    console.log("Error occurred while opening DB." + err);
});

// Currently dumping complete objects every 2 minutes.

function dump() {
	console.log("Dumping data to disk");
	db.reftp.add(JSON.stringify(refTP), 'raw');
	db.refhtml.add({refhtml: JSON.stringify(refHTML)});
	db.tpurl.add({tpurl: JSON.stringify(tpURL)});
}

// When extension starts try to load data from disk.
function load(obj, key) {
	db[key].get(key).then(e => {
		if(e) obj = JSON.parse(e);
	});
}

function saveInDB(ref, tp) {
	console.log("saving");
	db.reftp.add({ref: ref,tp: tp});
}

function saveHTML(ref, html) {
	db.refhtml.add({ref: ref,html: html});
}

function savetpList(tpurl) {
	db.tpurl.add({tpurl: tpurl});
}

function saveInputFields(value, sender, details) {
	db.inputFields.add({value: value, sender: sender, details: details});
}

function saveInputFieldsCache(value, summary) {
	db.inputFieldsCache.add({value: value, summary: summary});
}

function savetpURLFP(tpurl, details) {
	db.tpURLFP.add({tpurl: tpurl, details: details});
}

function saveCookies(url, details) {
	dbCookie.cookietable.add({url: url, details: details});
}

function loadFromDatabase() {
	db.reftp.each(row => {addToDict(row.ref, row.tp, 'load')});

	db.refhtml.each(row => {
		if (!refHTML.hasOwnProperty(row.ref)) {
			// Otherwise it will send multiple requests to the same url.
			refHTML[row.ref] = row.html;
		}
	});

	db.tpurl.each(row => {
		tpURL.add(row.tpurl);
	});

	db.inputFields.each(row => {
		if (!inputFields.hasOwnProperty(row.value)) inputFields[row.value] = {};
		if (!inputFields[row.value].hasOwnProperty(row.sender)) inputFields[row.value][row.sender] = {};
		inputFields[row.value][row.sender]	= row.details;
	});

	db.inputFieldsCache.each( row => {
		inputFieldsCache[row.value] = row.summary;
	});

	db.tpURLFP.each( row => {
		thirdPartyFP[row.tpurl] = row.details;
	});
}

function loadCookiesFromDatabase() {
	dbCookie.cookietable.each( row => {
		cookieTable[row.url] = row.details;
	});
}

function cleanLSDB() {
	// Clean local-sheriff DB.
	return db.delete().then(() => {
	    console.log("Local-sheriff Database successfully deleted");
	    Promise.resolve(true);
	}).catch((err) => {
	    console.error("Could not delete cookie database: " +  err);
	    Promise.reject(false);
	});
}

function cleanCookieDB() {
	// Clean local-sheriff DB.
	return dbCookie.delete().then(() => {
	    console.log("Cookie Database successfully deleted");
	    Promise.resolve(true);
	}).catch((err) => {
	    console.error("Could not delete cookie database: " +  err);
	    Promise.reject(false);
	});
}

function cleanStorage() {

	// Clean databases and then re-load the extension.

	Promise.all([cleanLSDB(), cleanCookieDB()]).then( status => {
		chrome.runtime.reload();
	}).catch(console.log);
}