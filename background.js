if (typeof ('chrome') === 'undefined') {
	var chrome = browser;
}

var browser = browser || chrome;

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
		cookie_map_key = b[1];
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
STOP_WORDS = ['true', 'false', 'undefined'];

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

// Let's find values that can be used for tracking.
STOP_WORDS = ['true', 'false', 'undefined', '2019', '19-'];

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
const trackerData = { "Index Exchange": { "hosts": ["casalemedia.com", "indexww.com"], "id": "index_exchange_", "parent": "Index Exchange, Inc. " }, "CDNvideo": { "hosts": ["cdnvideo.com"], "id": "cdnvideo.com", "parent": "CDNvideo" }, "Amazon Instant Video": { "hosts": ["aiv-cdn.net"], "id": "amazon_video", "parent": "Amazon" }, "ShopAuskunft.de": { "hosts": ["shopauskunft.de"], "id": "shopauskunft.de", "parent": "Unknown" }, "MicroAd": { "hosts": ["microad.co.jp", "microad.jp", "microad.net"], "id": "microad", "parent": "Unknown" }, "Impact Radius": { "hosts": ["7eer.net", "d3cxv97fi8q177.cloudfront.net", "evyy.net", "impactradius-event.com", "impactradius-tag.com", "impactradius.com", "ojrq.net", "r7ls.net"], "id": "impact_radius", "parent": "Impact Radius" }, "AdTriba": { "hosts": ["adtriba.com"], "id": "adtriba.com", "parent": "Unknown" }, "adnetworkperformance.com": { "hosts": ["adnetworkperformance.com"], "id": "adnetworkperformance.com", "parent": "Unknown" }, "Urban Airship": { "hosts": ["urbanairship.com"], "id": "urban_airship", "parent": "Urban Airship, Inc." }, "DeepIntent": { "hosts": ["deepintent.com"], "id": "deepintent.com", "parent": "Unknown" }, "ACRWEB": { "hosts": ["ziyu.net"], "id": "acrweb", "parent": "ACRWEB" }, "Kinja": { "hosts": ["kinja.com"], "id": "kinja.com", "parent": "Gizmodo Media Group" }, "Adguard": { "hosts": ["adguard.com"], "id": "adguard", "parent": "Unknown" }, "smartlink.cool": { "hosts": ["smartlink.cool"], "id": "smartlink.cool", "parent": "Unknown" }, "Roblox": { "hosts": ["rbxcdn.com"], "id": "roblox", "parent": "Unknown" }, "StreamRail": { "hosts": ["streamrail.com", "streamrail.net"], "id": "streamrail.com", "parent": "ironSource" }, "24\u0421\u041c\u0418": { "hosts": ["24smi.net", "24smi.org"], "id": "24smi", "parent": "Unknown" }, "Sellpoints": { "hosts": ["sellpoint.net", "sellpoints.com"], "id": "sellpoints", "parent": "ConversionPoint Technologies Inc." }, "econda Cross Sell": { "hosts": ["crosssell.info"], "id": "crosssell.info", "parent": "Econda" }, "LifeStreet Media": { "hosts": ["lfstmedia.com"], "id": "lifestreet_media", "parent": "LifeStreet Corporation" }, "Ownpage": { "hosts": ["ownpage.fr"], "id": "ownpage", "parent": "Unknown" }, "AdSniper": { "hosts": ["adsniper.ru"], "id": "adsniper.ru", "parent": "Unknown" }, "Visual IQ": { "hosts": ["myvisualiq.net"], "id": "visual_iq", "parent": "VisualIQ" }, "Yahoo! Japan": { "hosts": ["storage-yahoo.jp", "yahoo.co.jp", "yahooapis.jp", "yimg.jp", "yjtag.jp"], "id": "yahoo_japan", "parent": "Unknown" }, "DataTables": { "hosts": ["datatables.net"], "id": "datatables", "parent": "Unknown" }, "Acquia": { "hosts": ["acquia.com"], "id": "acquia.com", "parent": "Unknown" }, "adtr02.com": { "hosts": ["adtr02.com"], "id": "adtr02.com", "parent": "Unknown" }, "IAB Consent": { "hosts": ["consensu.org"], "id": "iab_consent", "parent": "IAB" }, "cpx.to": { "hosts": ["cpx.to"], "id": "cpx.to", "parent": "Unknown" }, "CoNative": { "hosts": ["conative.de"], "id": "conative.de", "parent": "Unknown" }, "Meetrics": { "hosts": ["meetrics.net", "mxcdn.net", "research.de.com"], "id": "meetrics", "parent": "Meetrics GmbH" }, "United Internet Media GmbH": { "hosts": ["tifbs.net", "ui-portal.de", "uimserv.net"], "id": "united_internet_media_gmbh", "parent": "United Internet AG" }, "bRealTime": { "hosts": ["brealtime.com"], "id": "brealtime", "parent": "Unknown" }, "Greentube Internet Entertainment Solutions": { "hosts": ["greentube.com", "gt-cdn.net"], "id": "greentube.com", "parent": "Unknown" }, "Zendesk": { "hosts": ["zendesk.com"], "id": "zendesk", "parent": "Zendesk" }, "Vergic": { "hosts": ["vergic.com"], "id": "vergic.com", "parent": "Unknown" }, "Beachfront Media": { "hosts": ["bfmio.com"], "id": "beachfront", "parent": "Unknown" }, "adverServe": { "hosts": ["adverserve.net"], "id": "adverserve", "parent": "adverServe" }, "Pusher": { "hosts": ["pusher.com", "pusherapp.com"], "id": "pusher.com", "parent": "Unknown" }, "stailamedia.com": { "hosts": ["stailamedia.com"], "id": "stailamedia_com", "parent": "Unknown" }, "Shopgate": { "hosts": ["shopgate.com"], "id": "shopgate.com", "parent": "Unknown" }, "Yandex.API": { "hosts": ["yandex.st"], "id": "yandex.api", "parent": "Yandex" }, "Google AdServices": { "hosts": ["googleadservices.com"], "id": "google_adservices", "parent": "Google" }, "pushno.com": { "hosts": ["pushno.com"], "id": "pushno.com", "parent": "Unknown" }, "TubeMogul": { "hosts": ["tubemogul.com"], "id": "tubemogul", "parent": "TubeMogul" }, "Piano": { "hosts": ["npttech.com", "tinypass.com"], "id": "tinypass", "parent": "Piano (Previously Tinypass)" }, "Dailymotion": { "hosts": ["dailymotion.com", "dailymotionbus.com", "dm-event.net", "dmcdn.net"], "id": "dailymotion", "parent": "Vivendi" }, "overheat": { "hosts": ["overheat.it"], "id": "overheat.it", "parent": "Unknown" }, "RichRelevance": { "hosts": ["ics0.com", "richrelevance.com"], "id": "richrelevance", "parent": "RichRelevance" }, "Adomik": { "hosts": ["adomik.com"], "id": "adomik", "parent": "Unknown" }, "Tovarro": { "hosts": ["tovarro.com"], "id": "tovarro.com", "parent": "Unknown" }, "undercomputer.com": { "hosts": ["undercomputer.com"], "id": "undercomputer.com", "parent": "Unknown" }, "mobtrks.com": { "hosts": ["mobtrks.com"], "id": "mobtrks.com", "parent": "Unknown" }, "cdnwidget.com": { "hosts": ["cdnwidget.com"], "id": "cdnwidget.com", "parent": "Unknown" }, "algovid.com": { "hosts": ["algovid.com"], "id": "algovid.com", "parent": "Unknown" }, "Yieldify": { "hosts": ["yieldify.com"], "id": "yieldify", "parent": "Yieldify" }, "enreach": { "hosts": ["adtlgc.com"], "id": "enreach", "parent": "Unknown" }, "Scroll": { "hosts": ["scroll.com"], "id": "scroll", "parent": "Scroll" }, "RawGit": { "hosts": ["rawgit.com"], "id": "rawgit", "parent": "Unknown" }, "Wetter.com": { "hosts": ["wetter.com", "wettercomassets.com"], "id": "wetter_com", "parent": "Unknown" }, "Visualstudio.com": { "hosts": ["visualstudio.com"], "id": "visualstudio.com", "parent": "Microsoft" }, "Pingdom": { "hosts": ["pingdom.net"], "id": "pingdom", "parent": "Pingdom" }, "makesource.cool": { "hosts": ["makesource.cool"], "id": "makesource.cool", "parent": "Unknown" }, "puserving.com": { "hosts": ["puserving.com"], "id": "puserving.com", "parent": "Unknown" }, "NEORY ": { "hosts": ["ad-srv.net", "contentspread.net", "neory-tm.com", "simptrack.com"], "id": "neory_", "parent": "NEORY GmbH" }, "1DMP": { "hosts": ["1dmp.io"], "id": "1dmp.io", "parent": "Unknown" }, "Salesforce Live Agent": { "hosts": ["liveagentforsalesforce.com", "salesforceliveagent.com"], "id": "salesforce_live_agent", "parent": "Salesforce" }, "Giraff.io": { "hosts": ["giraff.io"], "id": "giraff.io", "parent": "Unknown" }, "propvideo.net": { "hosts": ["propvideo.net"], "id": "propvideo_net", "parent": "Unknown" }, "Eperflex": { "hosts": ["email-reflex.com"], "id": "eperflex", "parent": "Unknown" }, "Azure CDN": { "hosts": ["azureedge.net"], "id": "azureedge.net", "parent": "Microsoft" }, "Accengage": { "hosts": ["accengage.net"], "id": "accengage", "parent": "Accengage" }, "Fastly": { "hosts": ["fastly.net", "fastlylb.net"], "id": "fastlylb.net", "parent": "Fastly" }, "Typekit by Adobe": { "hosts": ["typekit.com", "typekit.net"], "id": "typekit_by_adobe", "parent": "Adobe" }, "Segment": { "hosts": ["d2dq2ahtl5zl1z.cloudfront.net", "d47xnnr8b1rki.cloudfront.net", "segment.com", "segment.io"], "id": "segment", "parent": "Segment" }, "TradeTracker": { "hosts": ["tradetracker.net"], "id": "tradetracker", "parent": "TradeTracker" }, "Naver CDN": { "hosts": ["pstatic.net"], "id": "pstatic.net", "parent": "NAVER Corp" }, "Taobao": { "hosts": ["alipcsec.com"], "id": "taobao", "parent": "Alibaba" }, "Yieldr": { "hosts": ["254a.com"], "id": "yieldr", "parent": "Unknown" }, "Gamedistribution.com": { "hosts": ["gamedistribution.com"], "id": "gamedistribution.com", "parent": "Unknown" }, "Statcounter": { "hosts": ["statcounter.com"], "id": "statcounter", "parent": "StatCounter" }, "AddToAny": { "hosts": ["addtoany.com"], "id": "lockerz_share", "parent": "LightInTheBox.com" }, "CreateJS": { "hosts": ["createjs.com"], "id": "createjs", "parent": "Unknown" }, "Mopinion": { "hosts": ["mopinion.com"], "id": "mopinion.com", "parent": "Mopinion" }, "VisualDNA": { "hosts": ["vdna-assets.com", "visualdna.com"], "id": "visualdna", "parent": "Harris Insights & Analytics" }, "Bild.de": { "hosts": ["bildstatic.de"], "id": "bild", "parent": "Unknown" }, "Lenua System": { "hosts": ["lenua.de"], "id": "lenua.de", "parent": "Synatix" }, "SAS": { "hosts": ["aimatch.com", "sas.com"], "id": "sas", "parent": "SAS" }, "Rollbar": { "hosts": ["d37gvrvc0wt4s1.cloudfront.net"], "id": "rollbar", "parent": "Rollbar" }, "Cond\u00e9 Nast Digital": { "hosts": ["condenast.com"], "id": "condenastdigital.com", "parent": "Cond\u00e9 Nast " }, "St-Hatena": { "hosts": ["hatena.ne.jp", "st-hatena.com"], "id": "st-hatena", "parent": "Hatena Co., Ltd." }, "Vizury": { "hosts": ["vizury.com"], "id": "vizury", "parent": "Vizury" }, "apicit.net": { "hosts": ["apicit.net"], "id": "apicit.net", "parent": "Unknown" }, "MRP": { "hosts": ["mrpdata.com", "mrpdata.net"], "id": "mrpdata", "parent": "Fifth Story" }, "redtube.com": { "hosts": ["rdtcdn.com", "redtube.com"], "id": "redtube.com", "parent": "Unknown" }, "MediaMath": { "hosts": ["mathads.com", "mathtag.com"], "id": "mediamath", "parent": "MediaMath, Inc." }, "WWWPromoter": { "hosts": ["wwwpromoter.com"], "id": "wwwpromoter", "parent": "wwwPromoter" }, "bulkhentai.com": { "hosts": ["bulkhentai.com"], "id": "bulkhentai.com", "parent": "Unknown" }, "Indeed": { "hosts": ["indeed.com"], "id": "indeed", "parent": "Indeed" }, "RevenueHits": { "hosts": ["clksite.com", "imageshack.host"], "id": "revenue_hits", "parent": "Intango" }, "Monster Advertising": { "hosts": ["monster.com"], "id": "monster_advertising", "parent": "Monster Worldwide" }, "Yandex.Direct": { "hosts": ["an.yandex.ru", "awaps.yandex.ru"], "id": "yandex_direct", "parent": "Yandex" }, "Demandbase": { "hosts": ["company-target.com", "demandbase.com"], "id": "demandbase", "parent": "Unknown" }, "Curse": { "hosts": ["curse.com"], "id": "curse.com", "parent": "Amazon" }, "Los Angeles Times": { "hosts": ["latimes.com"], "id": "latimes", "parent": "Los Angeles Times" }, "Webgains": { "hosts": ["webgains.com"], "id": "webgains", "parent": "Unknown" }, "Adnologies": { "hosts": ["heias.com"], "id": "adnologies", "parent": "ADNOLOGIES GmbH" }, "Nexage": { "hosts": ["nexage.com"], "id": "nexage", "parent": "Verizon" }, "Taboola": { "hosts": ["basebanner.com", "taboola.com", "taboolasyndication.com"], "id": "taboola", "parent": "Taboola" }, "Storify": { "hosts": ["storify.com"], "id": "storify", "parent": "Unknown" }, "Samba TV": { "hosts": ["samba.tv"], "id": "samba.tv", "parent": "Free Stream Media Corp. dba Samba TV" }, "TrialPay": { "hosts": ["rialpay.com", "tp-cdn.com"], "id": "tp-cdn.com", "parent": "Unknown" }, "CapitalData": { "hosts": ["kdata.fr"], "id": "capitaldata", "parent": "HighCo" }, "westlotto.com": { "hosts": ["westlotto.com"], "id": "westlotto_com", "parent": "Unknown" }, "CBS Interactive": { "hosts": ["cbsinteractive.com"], "id": "cbsi.com", "parent": "CBS Interactive" }, "NBC News": { "hosts": ["s-nbcnews.com"], "id": "nbc_news", "parent": "Unknown" }, "LiveTex": { "hosts": ["livetex.ru"], "id": "livetex.ru", "parent": "Unknown" }, "Sociomantic": { "hosts": ["sociomantic.com"], "id": "sociomantic", "parent": "Sociomantic Labs GmbH" }, "VKontakte": { "hosts": ["userapi.com", "vk.com", "vkontakte.ru"], "id": "vkontakte_widgets", "parent": "Megafon" }, "Audience Square": { "hosts": ["audiencesquare.com"], "id": "audiencesquare.com", "parent": "Unknown" }, "DigiTrust": { "hosts": ["digitru.st"], "id": "digitrust", "parent": "IAB" }, "Vk.com": { "hosts": ["cdn-vk.com", "vk-analytics.com", "vkuservideo.net"], "id": "vk.com", "parent": "Megafon" }, "Google Photos": { "hosts": ["ggpht.com"], "id": "google_photos", "parent": "Google" }, "Traffic Fabrik": { "hosts": ["trafficfabrik.com"], "id": "trafficfabrik.com", "parent": "Unknown" }, "glganltcs.space": { "hosts": ["glganltcs.space"], "id": "glganltcs.space", "parent": "Unknown" }, "G+J e|MS": { "hosts": ["emsservice.de"], "id": "gujems", "parent": "Gruner + Jahr AG" }, "Hola Player": { "hosts": ["h-cdn.com"], "id": "hola_player", "parent": "Hola CDN" }, "Jetlore": { "hosts": ["jetlore.com"], "id": "jetlore", "parent": "Jetlore" }, "TrafficForce": { "hosts": ["trafficforce.com"], "id": "trafficforce", "parent": "TrafficForce" }, "Perform Group": { "hosts": ["performgroup.com"], "id": "perform_group", "parent": "Perform Media Services Ltd" }, "Omniture (Adobe Analytics)": { "hosts": ["2o7.net", "du8783wkf05yr.cloudfront.net", "hitbox.com", "imageg.net", "omtrdc.net"], "id": "omniture__adobe_analytics_", "parent": "Adobe" }, "Rakuten LinkShare": { "hosts": ["linksynergy.com"], "id": "linksynergy.com", "parent": "Rakuten Marketing LLC" }, "Ora.TV": { "hosts": ["ora.tv"], "id": "ora.tv", "parent": "Ora.TV" }, "HomeAway": { "hosts": ["homeaway.com"], "id": "homeaway", "parent": "Unknown" }, "toplist.cz": { "hosts": ["toplist.cz"], "id": "toplist.cz", "parent": "Unknown" }, "ViralGains": { "hosts": ["viralgains.com"], "id": "viralgains", "parent": "Unknown" }, "Freedom Mortgage": { "hosts": ["freedom.com"], "id": "freedom_mortgage", "parent": "Freedom Mortgage" }, "K\u00e4ufersiegel": { "hosts": ["kaeufersiegel.de"], "id": "kaeufersiegel.de", "parent": "Unknown" }, "Adelphic": { "hosts": ["ipredictive.com"], "id": "adelphic", "parent": "Adelphic LLC" }, "nosto": { "hosts": ["nosto.com"], "id": "nosto.com", "parent": "Unknown" }, "BBC": { "hosts": ["bbci.co.uk"], "id": "bbci", "parent": "Unknown" }, "SumoMe": { "hosts": ["sumo.com", "sumome.com"], "id": "sumome", "parent": "SumoMe" }, "Acuity Ads": { "hosts": ["acuityplatform.com"], "id": "acuity_ads", "parent": "Acuityads Inc." }, "akamoihd.net": { "hosts": ["akamoihd.net"], "id": "akamoihd.net", "parent": "Unknown" }, "zog.link": { "hosts": ["zog.link"], "id": "zog.link", "parent": "Unknown" }, "adbetnet": { "hosts": ["adbetclickin.pink", "adbetnet.com"], "id": "adbetclickin.pink", "parent": "Unknown" }, "Optanaon by OneTrust": { "hosts": ["cookielaw.org"], "id": "optanaon", "parent": "Unknown" }, "PubNub": { "hosts": ["pubnub.com"], "id": "pubnub.com", "parent": "Unknown" }, "eluxer.net": { "hosts": ["eluxer.net"], "id": "eluxer_net", "parent": "Unknown" }, "Github Pages": { "hosts": ["github.io"], "id": "github_pages", "parent": "GitHub, Inc." }, "Videology": { "hosts": ["tidaltv.com"], "id": "videology", "parent": "Videology Ltd." }, "easylist.club": { "hosts": ["easylist.club"], "id": "easylist_club", "parent": "Unknown" }, "ipify": { "hosts": ["ipify.org"], "id": "ipify", "parent": "Unknown" }, "Kissmetrics": { "hosts": ["kissmetrics.com"], "id": "kissmetrics.com", "parent": "Unknown" }, "ScoreCard Research": { "hosts": ["comscore.com", "scorecardresearch.com", "scoreresearch.com", "scrsrch.com", "securestudies.com"], "id": "scorecard_research_beacon", "parent": "comScore, Inc." }, "adtng.com": { "hosts": ["adtng.com"], "id": "adtng.com", "parent": "Unknown" }, "BlueConic": { "hosts": ["blueconic.net"], "id": "blueconic.net", "parent": "Unknown" }, "Nekudo": { "hosts": ["nekudo.com"], "id": "nekudo.com", "parent": "Nekudo" }, "Apester": { "hosts": ["apester.com"], "id": "apester", "parent": "Apester Ltd" }, "blogimg.jp": { "hosts": ["blogimg.jp"], "id": "blogimg.jp", "parent": "LINE Corporation" }, "Keen IO": { "hosts": ["dc8na2hxrj29i.cloudfront.net", "keen.io"], "id": "keen_io", "parent": "Keen IO" }, "stayfriends.de": { "hosts": ["stayfriends.de"], "id": "stayfriends.de", "parent": "Unknown" }, "Hubvisor": { "hosts": ["hubvisor.io"], "id": "hubvisor.io", "parent": "Unknown" }, "Nativo": { "hosts": ["ntv.io", "postrelease.com"], "id": "nativo", "parent": "Nativo, Inc." }, "TripAdvisor": { "hosts": ["jscache.com", "tacdn.com", "tamgrt.com", "tripadvisor.co.uk", "tripadvisor.com", "tripadvisor.de"], "id": "tripadvisor", "parent": "IAC (InterActiveCorp)" }, "Bannerflow": { "hosts": ["bannerflow.com"], "id": "bannerflow.com", "parent": "Bannerflow AB" }, "Zimbio": { "hosts": ["zimbio.com"], "id": "zimbio.com", "parent": "Unknown" }, "ShareThrough": { "hosts": ["shareth.ru", "sharethrough.com"], "id": "sharethrough", "parent": "Sharethrough, Inc" }, "freegeoip.net": { "hosts": ["freegeoip.net"], "id": "freegeoip_net", "parent": "Unknown" }, "Beeswax": { "hosts": ["bidr.io"], "id": "beeswax", "parent": "BeeswaxIO Corporation" }, "ADventori": { "hosts": ["adventori.com"], "id": "adventori", "parent": "ADventori SAS" }, "DANtrack": { "hosts": ["dantrack.net"], "id": "dantrack.net", "parent": "Dentsu Aegis Network" }, "Clearbit": { "hosts": ["clearbit.com"], "id": "clearbit.com", "parent": "Clearbit" }, "Eloqua": { "hosts": ["eloqua.com", "en25.com"], "id": "eloqua", "parent": "Oracle" }, "Stripe": { "hosts": ["stripe.com", "stripe.network"], "id": "stripe.com", "parent": "Unknown" }, "Smarter Travel Media": { "hosts": ["smartertravel.com", "travelsmarter.net"], "id": "smarter_travel", "parent": "IAC (InterActiveCorp)" }, "Tumblr Analytics": { "hosts": ["sre-perim.com", "txmblr.com"], "id": "tumblr_analytics", "parent": "Verizon" }, "Hurra Tracker": { "hosts": ["hurra.com"], "id": "hurra_tracker", "parent": "Hurra Communications" }, "Blogfoster": { "hosts": ["blogfoster.com"], "id": "blogfoster.com", "parent": "Blogfoster GmbH" }, "ClearPier": { "hosts": ["pulseradius.com"], "id": "clear_pier", "parent": "ClearPier" }, "MyFonts": { "hosts": ["myfonts.net"], "id": "myfonts_counter", "parent": "MyFonts" }, "GfK": { "hosts": ["sensic.net"], "id": "gfk", "parent": "GfK Group" }, "Zopim": { "hosts": ["zopim.com"], "id": "zopim", "parent": "Zopim" }, "bodelen.com": { "hosts": ["bodelen.com"], "id": "bodelen.com", "parent": "Unknown" }, "Weborama": { "hosts": ["adrcdn.com", "adrcntr.com", "weborama.com", "weborama.fr"], "id": "weborama", "parent": "WEBORAMA" }, "gfycat": { "hosts": ["gfycat.com"], "id": "gfycat.com", "parent": "Unknown" }, "Boxever": { "hosts": ["boxever.com"], "id": "boxever", "parent": "Boxever" }, "Bemobile": { "hosts": ["bemobile.ua"], "id": "bemobile.ua", "parent": "Bemobile" }, "SoMo Audience": { "hosts": ["mobileadtrading.com"], "id": "somoaudience", "parent": "SoMo Audience" }, "1&1 Internet": { "hosts": ["1and1.com", "1und1.de", "uicdn.com", "website-start.de"], "id": "1und1", "parent": "Unknown" }, "SLI Systems": { "hosts": ["sli-system.com"], "id": "resultspage.com", "parent": "SLI Systems" }, "Falk Technologies": { "hosts": ["angsrvr.com"], "id": "falk_technologies", "parent": "Unknown" }, "Nano Interactive": { "hosts": ["audiencemanager.de"], "id": "nano_interactive", "parent": "Nano Interactive GmbH" }, "Snowplow": { "hosts": ["d346whrrklhco7.cloudfront.net", "d78fikflryjgj.cloudfront.net", "dc8xl0ndzn2cb.cloudfront.net", "playwire.com", "snplow.net"], "id": "snowplow", "parent": "Snowplow" }, "Fyber": { "hosts": ["fyber.com"], "id": "fyber", "parent": "Fyber " }, "ReadSpeaker": { "hosts": ["readspeaker.com"], "id": "readspeaker.com", "parent": "Unknown" }, "SociaPlus": { "hosts": ["sociaplus.com"], "id": "sociaplus.com", "parent": "Unknown" }, "Interyield": { "hosts": ["ps7894.com"], "id": "interyield", "parent": "Advertise.com" }, "ZeusClicks": { "hosts": ["zeusclicks.com"], "id": "zeusclicks", "parent": "Unknown" }, "Consumable": { "hosts": ["serverbid.com"], "id": "consumable", "parent": "GiftConnect" }, "Google Appspot": { "hosts": ["appspot.com"], "id": "google_appspot", "parent": "Google" }, "ContentSquare": { "hosts": ["contentsquare.net"], "id": "contentsquare.net", "parent": "Unknown" }, "licensebuttons.net": { "hosts": ["licensebuttons.net"], "id": "licensebuttons.net", "parent": "Unknown" }, "redblue": { "hosts": ["redblue.de"], "id": "redblue_de", "parent": "Unknown" }, "SmartClip": { "hosts": ["smartclip.net"], "id": "smartclip", "parent": "smartclip Holding AG" }, "xHamster": { "hosts": ["xhamster.com", "xhamsterlive.com", "xhamsterpremium.com", "xhcdn.com"], "id": "xhamster", "parent": "Unknown" }, "aldi-international.com": { "hosts": ["aldi-international.com"], "id": "aldi-international.com", "parent": "Unknown" }, "Bigpoint": { "hosts": ["bigpoint-payment.com", "bigpoint.com", "bigpoint.net", "bpcdn.net", "bpsecure.com"], "id": "bigpoint", "parent": "Unknown" }, "Yandex Metrika": { "hosts": ["mc.yandex.ru"], "id": "yandex_metrika", "parent": "Yandex" }, "Usabilla": { "hosts": ["usabilla.com"], "id": "usabilla", "parent": "Usabilla" }, "Kontextr": { "hosts": ["ktxtr.com"], "id": "kontextr", "parent": "Kontext" }, "Livesport Media": { "hosts": ["livesportmedia.eu"], "id": "livesportmedia.eu", "parent": "Unknown" }, "xvideos.com": { "hosts": ["xvideos-cdn.com", "xvideos.com"], "id": "xvideos_com", "parent": "Unknown" }, "modulepush.com": { "hosts": ["modulepush.com"], "id": "modulepush.com", "parent": "Unknown" }, "Mouseflow": { "hosts": ["mouseflow.com"], "id": "mouseflow", "parent": "Mouseflow" }, "Netmining": { "hosts": ["netmining.com", "netmng.com"], "id": "netmining", "parent": "Netmining" }, "Oracle RightNow": { "hosts": ["rightnowtech.com", "rnengage.com"], "id": "oracle_rightnow", "parent": "Oracle" }, "intelliAd": { "hosts": ["intelliad.com", "intelliad.de"], "id": "intelliad", "parent": "intelliAd" }, "TORO": { "hosts": ["toro-tags.com", "toroadvertising.com", "toroadvertisingmedia.com"], "id": "toro", "parent": "TORO Advertising" }, "[24]7": { "hosts": ["247-inc.net", "d1af033869koo7.cloudfront.net"], "id": "24_7", "parent": "Unknown" }, "Crazy Egg": { "hosts": ["cetrk.com", "crazyegg.com", "dnn506yrbagrg.cloudfront.net"], "id": "crazy_egg", "parent": "Crazy Egg" }, "Shopify Stats": { "hosts": ["shopify.com"], "id": "shopify_stats", "parent": "Shopify" }, "GroovinAds": { "hosts": ["groovinads.com"], "id": "groovinads", "parent": "GroovinAds" }, "Effective Measure": { "hosts": ["effectivemeasure.net"], "id": "effective_measure", "parent": "Effective Measure" }, "Zendesk CDN": { "hosts": ["zdassets.com"], "id": "zdassets.com", "parent": "Zendesk" }, "ad4mat": { "hosts": ["ad4mat.ar", "ad4mat.at", "ad4mat.be", "ad4mat.bg", "ad4mat.br", "ad4mat.ch", "ad4mat.co.uk", "ad4mat.cz", "ad4mat.de", "ad4mat.dk", "ad4mat.es", "ad4mat.fi", "ad4mat.fr", "ad4mat.gr", "ad4mat.hu", "ad4mat.it", "ad4mat.mx", "ad4mat.net", "ad4mat.nl", "ad4mat.no", "ad4mat.pl", "ad4mat.ro", "ad4mat.ru", "ad4mat.se", "ad4mat.tr"], "id": "ad4mat", "parent": "ad4mat" }, "PopAds": { "hosts": ["popads.net", "popadscdn.net"], "id": "popads", "parent": "PopAds" }, "AdOcean": { "hosts": ["adocean.pl"], "id": "adocean", "parent": "AdOcean" }, "Media Innovation Group": { "hosts": ["mookie1.com"], "id": "media_innovation_group", "parent": "Media Innovation Group" }, "coll2onf.com": { "hosts": ["coll2onf.com"], "id": "coll2onf.com", "parent": "Unknown" }, "healte.de": { "hosts": ["healte.de"], "id": "healte.de", "parent": "Unknown" }, "Rockerbox": { "hosts": ["getrockerbox.com"], "id": "rockerbox", "parent": "Rockerbox" }, "clcknads.pro": { "hosts": ["clcknads.pro"], "id": "clcknads.pro", "parent": "Unknown" }, "Routenplaner Karten": { "hosts": ["routenplaner-karten.com"], "id": "routenplaner-karten.com", "parent": "Unknown" }, "DataCaciques": { "hosts": ["datacaciques.com"], "id": "datacaciques.com", "parent": "Unknown" }, "SessionCam": { "hosts": ["d2oh4tlt9mrke9.cloudfront.net", "sessioncam.com"], "id": "sessioncam", "parent": "SessionCam" }, "Mapbox": { "hosts": ["mapbox.com"], "id": "mapbox", "parent": "Unknown" }, "Fidelity Media": { "hosts": ["fidelity-media.com"], "id": "fidelity_media", "parent": "Fidelity Media" }, "algolia": { "hosts": ["algolia.com", "algolia.net"], "id": "algolia.net", "parent": "Unknown" }, "khzbeucrltin.com": { "hosts": ["khzbeucrltin.com"], "id": "khzbeucrltin.com", "parent": "Unknown" }, "bluenewsupdate.info": { "hosts": ["bluenewsupdate.info"], "id": "bluenewsupdate.info", "parent": "Unknown" }, "Ligatus": { "hosts": ["content-recommendation.net", "ligadx.com", "ligatus.com", "ligatus.de", "veeseo.com"], "id": "ligatus", "parent": "Gruner + Jahr AG" }, "sheego.de": { "hosts": ["sheego.de"], "id": "sheego.de", "parent": "Unknown" }, "Perimeterx": { "hosts": ["perimeterx.net"], "id": "perimeterx.net", "parent": "Unknown" }, "Datalogix": { "hosts": ["inextaction.net", "nexac.com"], "id": "datalogix", "parent": "Oracle" }, "webclose.net": { "hosts": ["webclose.net"], "id": "webclose.net", "parent": "Unknown" }, "WiredMinds": { "hosts": ["wiredminds.com", "wiredminds.de"], "id": "wiredminds", "parent": "WiredMinds" }, "Salesforce": { "hosts": ["force.com", "salesforce.com"], "id": "salesforce.com", "parent": "Salesforce" }, "Kampyle": { "hosts": ["kampyle.com"], "id": "kampyle", "parent": "Medallia Inc. " }, "Datonics": { "hosts": ["pro-market.net"], "id": "datonics", "parent": "Unknown" }, "Google Shopping": { "hosts": ["googlecommerce.com"], "id": "google_trusted_stores", "parent": "Google" }, "howtank": { "hosts": ["howtank.com"], "id": "howtank.com", "parent": "Unknown" }, "Awin1": { "hosts": ["awin.com"], "id": "awin1.com", "parent": "Awin" }, "Vi": { "hosts": ["digitaltarget.ru"], "id": "vi", "parent": "Vi" }, "Krux Digital": { "hosts": ["krxd.net"], "id": "krux_digital", "parent": "Salesforce" }, "superfastcdn.com": { "hosts": ["superfastcdn.com"], "id": "superfastcdn.com", "parent": "Unknown" }, "bongacams.com": { "hosts": ["bongacams.com"], "id": "bongacams.com", "parent": "Unknown" }, "etracker": { "hosts": ["etracker.com", "etracker.de", "sedotracker.com"], "id": "etracker", "parent": "etracker GmbH" }, "luckypushh.com": { "hosts": ["luckypushh.com"], "id": "luckypushh.com", "parent": "Unknown" }, "Branch": { "hosts": ["app.link", "branch.io"], "id": "branch_metrics", "parent": "Branch Metrics Inc" }, "Evergage": { "hosts": ["evergage.com"], "id": "evergage.com", "parent": "Unknown" }, "SoundCloud": { "hosts": ["sndcdn.com", "soundcloud.com"], "id": "soundcloud", "parent": "SoundCloud" }, "Bidswitch": { "hosts": ["bidswitch.net", "exe.bid"], "id": "bidswitch", "parent": "BIDSWITCH GmbH" }, "Brightcove": { "hosts": ["brightcove.com"], "id": "brightcove", "parent": "Brightcove" }, "AT Internet": { "hosts": ["ati-host.net", "aticdn.net", "xiti.com"], "id": "at_internet", "parent": "AT Internet" }, "Hyvyd GmbH": { "hosts": ["hyvyd.com"], "id": "hyvyd", "parent": "Unknown" }, "m-pathy": { "hosts": ["m-pathy.com"], "id": "m-pathy", "parent": "m-pathy" }, "iPerceptions": { "hosts": ["iperceptions.com"], "id": "iperceptions", "parent": "iPerceptions" }, "Rakuten Global Market": { "hosts": ["rakuten.co.jp"], "id": "rakuten_globalmarket", "parent": "Rakuten Marketing LLC" }, "InfoLinks": { "hosts": ["infolinks.com", "intextscript.com"], "id": "infolinks", "parent": "Infolinks" }, "Bidtellect": { "hosts": ["bttrack.com"], "id": "bidtellect", "parent": "Bidtellect, Inc" }, "Wikia CDN": { "hosts": ["nocookie.net"], "id": "wikia_cdn", "parent": "Wikia" }, "Orange France": { "hosts": ["wanadoo.fr"], "id": "orange_france", "parent": "Orange France" }, "Loggly": { "hosts": ["loggly.com"], "id": "loggly", "parent": "Loggly" }, "Snapchat For Business": { "hosts": ["sc-static.net", "snapchat.com"], "id": "snapchat", "parent": "Unknown" }, "Brandmetrics.com": { "hosts": ["brandmetrics.com"], "id": "brandmetrics.com", "parent": "Unknown" }, "Chatango": { "hosts": ["chatango.com"], "id": "chatango", "parent": "Chatango" }, "Curse CDN": { "hosts": ["cursecdn.com"], "id": "cursecdn.com", "parent": "Amazon" }, "BigCommerce": { "hosts": ["bigcommerce.com"], "id": "bigcommerce.com", "parent": "BigCommerce" }, "Bebi Media": { "hosts": ["bebi.com"], "id": "bebi", "parent": "Unknown" }, "RadiumOne": { "hosts": ["gwallet.com", "r1-cdn.net"], "id": "radiumone", "parent": "RhythmOne, LLC" }, "Map and Route": { "hosts": ["mapandroute.de"], "id": "mapandroute.de", "parent": "Unknown" }, "Auditorius": { "hosts": ["audtd.com"], "id": "audtd.com", "parent": "Unknown" }, "Instart Logic": { "hosts": ["sdad.guru"], "id": "instart_logic", "parent": "Instart Logic Inc." }, "Vicomi": { "hosts": ["vicomi.com"], "id": "vicomi.com", "parent": "Unknown" }, "Amazon CloudFront": { "hosts": ["cloudfront.net"], "id": "amazon_cloudfront", "parent": "Amazon" }, "borrango.com": { "hosts": ["borrango.com"], "id": "borrango.com", "parent": "Unknown" }, "vooxe.com": { "hosts": ["vooxe.com"], "id": "vooxe.com", "parent": "Unknown" }, "CloudMedia": { "hosts": ["cloud-media.fr"], "id": "cloud-media.fr", "parent": "Unknown" }, "Facebook": { "hosts": ["facebook.com", "facebook.net"], "id": "facebook", "parent": "Facebook" }, "Sailthru Horizon": { "hosts": ["sail-horizon.com", "sail-personalize.com", "sailthru.com"], "id": "sailthru_horizon", "parent": "Sailthru" }, "Ooyala": { "hosts": ["ooyala.com"], "id": "ooyala.com", "parent": "Telstra" }, "AdRecover": { "hosts": ["adrecover.com"], "id": "adrecover", "parent": "AdPushUp, Inc." }, "HookLogic": { "hosts": ["hlserve.com"], "id": "hooklogic", "parent": "Criteo S.A." }, "Naver": { "hosts": ["naver.com", "naver.net"], "id": "naver.com", "parent": "NAVER Corp" }, "Reed Business Information": { "hosts": ["reedbusiness.net"], "id": "reed_business_information", "parent": "Andera Partners" }, "Wordpress Ads": { "hosts": ["pubmine.com"], "id": "wordpress_ads", "parent": "Automattic" }, "Stack Exchange": { "hosts": ["sstatic.net"], "id": "sstatic.net", "parent": "Unknown" }, "Digiteka": { "hosts": ["digiteka.net", "ultimedia.com"], "id": "digiteka", "parent": "DIGITEKA Technologies" }, "ComboTag": { "hosts": ["combotag.com"], "id": "combotag", "parent": "Unknown" }, "fortlachanhecksof.info": { "hosts": ["fortlachanhecksof.info"], "id": "fortlachanhecksof.info", "parent": "Unknown" }, "The Reach Group": { "hosts": ["deepthought.online", "reachgroup.com", "redintelligence.net"], "id": "the_reach_group", "parent": "The Reach Group GmbH" }, "Twiago": { "hosts": ["twiago.com"], "id": "twiago", "parent": "twiago GmbH" }, "adality GmbH": { "hosts": ["adrtx.net"], "id": "adality_gmbh", "parent": "Arvato Bertelsmann" }, "Avail": { "hosts": ["avail.net"], "id": "avail", "parent": "Avail" }, "Insider": { "hosts": ["useinsider.com"], "id": "insider", "parent": "Insider" }, "Unruly Media": { "hosts": ["unrulymedia.com"], "id": "unruly_media", "parent": "Unruly Group Ltd" }, "Nanigans": { "hosts": ["nanigans.com"], "id": "nanigans", "parent": "Nanigans" }, "Gruner + Jahr": { "hosts": ["guj.de"], "id": "guj.de", "parent": "Gruner + Jahr AG" }, "MediaNova CDN": { "hosts": ["mncdn.com"], "id": "mncdn.com", "parent": "Unknown" }, "Expedia": { "hosts": ["expedia.com", "trvl-px.com"], "id": "expedia", "parent": "IAC (InterActiveCorp)" }, "Active Agent": { "hosts": ["active-agent.com"], "id": "active_agent", "parent": "Active Agent AG" }, "Traffective": { "hosts": ["cdntrf.com", "traffective.com"], "id": "traffective", "parent": "Unknown" }, "perfdrive.com": { "hosts": ["perfdrive.com"], "id": "perfdrive.com", "parent": "Unknown" }, "Delve Networks": { "hosts": ["delvenetworks.com"], "id": "delve_networks", "parent": "Limelight Networks" }, "TrackJS": { "hosts": ["d2zah9y47r7bi2.cloudfront.net", "dl1d2m8ri9v3j.cloudfront.net", "trackjs.com"], "id": "trackjs", "parent": "TrackJS" }, "Didomi": { "hosts": ["privacy-center.org"], "id": "didomi", "parent": "Didomi" }, "adNET.de": { "hosts": ["adnet.biz", "adnet.de"], "id": "adnet.de", "parent": "adNET.de" }, "7tv.de": { "hosts": ["7tv.de"], "id": "7tv.de", "parent": "Unknown" }, "Maru-EDU": { "hosts": ["edigitalsurvey.com"], "id": "maru-edu", "parent": "MaruEdr" }, "poirreleast.club": { "hosts": ["poirreleast.club"], "id": "poirreleast.club", "parent": "Unknown" }, "srvtrck.com": { "hosts": ["srvtrck.com"], "id": "srvtrck.com", "parent": "Unknown" }, "Adalyser": { "hosts": ["adalyser.com"], "id": "adalyser.com", "parent": "OneSoon Ltd" }, "Kiosked": { "hosts": ["kiosked.com"], "id": "kiosked", "parent": "Kiosked" }, "Vox": { "hosts": ["vox-cdn.com"], "id": "vox", "parent": "Vox Media" }, "ad-delivery.net": { "hosts": ["ad-delivery.net"], "id": "ad-delivery.net", "parent": "Unknown" }, "Cedexis Radar": { "hosts": ["cedexis-radar.net", "cedexis-test.com", "cedexis.com", "cedexis.fastlylb.net", "cedexis.net"], "id": "cedexis_radar", "parent": "Cedexis" }, "redGalaxy CDN": { "hosts": ["atendesoftware.pl"], "id": "redcdn.pl", "parent": "Atende Software Sp. z o.o." }, "Adtheorent": { "hosts": ["adentifi.com"], "id": "adtheorent", "parent": "AdTheorent, Inc" }, "tomnewsupdate.info": { "hosts": ["tomnewsupdate.info"], "id": "tomnewsupdate.info", "parent": "Unknown" }, "Urban Media GmbH": { "hosts": ["urban-media.com"], "id": "urban-media.com", "parent": "Unknown" }, "fontawesome.com": { "hosts": ["fontawesome.com"], "id": "fontawesome_com", "parent": "Unknown" }, "ADmantX": { "hosts": ["admantx.com"], "id": "admantx.com", "parent": "Expert System, SpA" }, "iGoDigital": { "hosts": ["igodigital.com"], "id": "igodigital", "parent": "iGoDigital" }, "Etsy CDN": { "hosts": ["etsystatic.com"], "id": "etsystatic", "parent": "Etsy, Inc." }, "TripleLift": { "hosts": ["3lift.com", "d3iwjrnl4m67rd.cloudfront.net", "triplelift.com"], "id": "triplelift", "parent": "TripleLift, Inc." }, "OnThe.io": { "hosts": ["onthe.io"], "id": "onthe.io", "parent": "onthe.io" }, "VG Wort": { "hosts": ["vgwort.de"], "id": "vg_wort", "parent": "VG Wort" }, "Ippen Digital": { "hosts": ["id-news.net", "idcdn.de"], "id": "id-news.net", "parent": "Unknown" }, "Vibrant Ads": { "hosts": ["intellitxt.com"], "id": "vibrant_ads", "parent": "Vibrant Media Limited" }, "Footprint DNS": { "hosts": ["footprintdns.com"], "id": "footprintdns.com", "parent": "Microsoft" }, "Refined Labs": { "hosts": ["refinedads.com"], "id": "refined_labs", "parent": "Refined Labs" }, "vacaneedasap.com": { "hosts": ["vacaneedasap.com"], "id": "vacaneedasap.com", "parent": "Unknown" }, "newsupdatedir.info": { "hosts": ["newsupdatedir.info"], "id": "newsupdatedir.info", "parent": "Unknown" }, "nerfherdersolo.com": { "hosts": ["nerfherdersolo.com"], "id": "nerfherdersolo_com", "parent": "Unknown" }, "Wix": { "hosts": ["parastorage.com", "wix.com"], "id": "wix.com", "parent": "Unknown" }, "Adtrue": { "hosts": ["adtrue.com"], "id": "adtrue", "parent": "AdTrue" }, "Smartlook": { "hosts": ["getsmartlook.com", "smartlook.com"], "id": "smartlook", "parent": "SmartLook" }, "Wix Media Platform": { "hosts": ["wixmp.com"], "id": "wixmp", "parent": "Wix" }, "LiveChat": { "hosts": ["livechatinc.com", "livechatinc.net"], "id": "livechat", "parent": "LiveChat" }, "Schibsted Media Group": { "hosts": ["schibsted.com", "schibsted.io"], "id": "schibsted", "parent": "Schibsted ASA" }, "Embedly": { "hosts": ["embed.ly", "embedly.com"], "id": "embed.ly", "parent": "Medium" }, "wnzmauurgol.com": { "hosts": ["wnzmauurgol.com"], "id": "wnzmauurgol.com", "parent": "Unknown" }, "IXI Digital": { "hosts": ["ixiaa.com"], "id": "ixi_digital", "parent": "IXI Services" }, "ADTECH": { "hosts": ["adtech.de", "adtechus.com"], "id": "adtech", "parent": "Verizon" }, "1plusX": { "hosts": ["opecloud.com"], "id": "1plusx", "parent": "1plusX AG" }, "Next Tuesday GmbH": { "hosts": ["nt.vc"], "id": "nt.vc", "parent": "Unknown" }, "Adzerk": { "hosts": ["adzerk.net"], "id": "adzerk", "parent": "Adzerk" }, "solads.media": { "hosts": ["solads.media"], "id": "solads.media", "parent": "Unknown" }, "SkimLinks": { "hosts": ["redirectingat.com", "skimlinks.com", "skimresources.com"], "id": "skimlinks", "parent": "SkimLinks" }, "CCM Benchmark": { "hosts": ["ccmbg.com"], "id": "ccm_benchmark", "parent": "Unknown" }, "i-mobile": { "hosts": ["i-mobile.co.jp"], "id": "i-mobile", "parent": "i-mobile" }, "Engagio": { "hosts": ["engagio.com"], "id": "engagio", "parent": "Engagio" }, "Switch Concepts": { "hosts": ["myswitchads.com", "switchadhub.com", "switchads.com", "switchafrica.com"], "id": "switch_concepts", "parent": "Switch Concepts Limited" }, "OpenStat": { "hosts": ["openstat.net"], "id": "openstat", "parent": "Unknown" }, "OnFocus": { "hosts": ["fogl1onf.com", "onfocus.io"], "id": "onfocus.io", "parent": "OnFocus" }, "Jumptap": { "hosts": ["jumptap.com"], "id": "jumptap", "parent": "Millenial Media (Jumptap)" }, "loadercdn.com": { "hosts": ["loadercdn.com"], "id": "loadercdn.com", "parent": "Unknown" }, "belboon GmbH": { "hosts": ["belboon.de"], "id": "belboon_gmbh", "parent": "Unknown" }, "webclicks24.com": { "hosts": ["webclicks24.com"], "id": "webclicks24_com", "parent": "Unknown" }, "Orange": { "hosts": ["orange.fr", "orangeads.fr"], "id": "orange", "parent": "Orange Mobile" }, "BugHerd": { "hosts": ["bugherd.com"], "id": "bugherd.com", "parent": "Macropod Software Pty Ltd" }, "Google Analytics": { "hosts": ["google-analytics.com"], "id": "google_analytics", "parent": "Google" }, "GroupM Server": { "hosts": ["gmads.net", "grmtech.net"], "id": "groupm_server", "parent": "GroupM" }, "Autoscout24": { "hosts": ["autoscout24.com", "autoscout24.net"], "id": "autoscout24.com", "parent": "Scout 24" }, "Zencoder": { "hosts": ["zencdn.net"], "id": "zencoder", "parent": "Zencoder" }, "umebiggestern.club": { "hosts": ["umebiggestern.club"], "id": "umebiggestern.club", "parent": "Unknown" }, "Disqus": { "hosts": ["disqus.com", "disquscdn.com"], "id": "disqus", "parent": "Disqus" }, "Quantcount": { "hosts": ["quantcount.com"], "id": "quantcount", "parent": "Quantcast International Limited" }, "Chute": { "hosts": ["api.getchute.com", "media.chute.io"], "id": "chute", "parent": "ESW Capital" }, "Forter": { "hosts": ["forter.com"], "id": "forter", "parent": "Unknown" }, "Gravatar": { "hosts": ["gravatar.com"], "id": "gravatar", "parent": "Automattic" }, "jsDelivr": { "hosts": ["jsdelivr.net"], "id": "jsdelivr", "parent": "Unknown" }, "Google Servers": { "hosts": ["1e100cdn.net"], "id": "google_servers", "parent": "Google" }, "flixcdn.com": { "hosts": ["flixcdn.com"], "id": "flixcdn.com", "parent": "Unknown" }, "MoPub": { "hosts": ["mopub.com"], "id": "mopub", "parent": "Twitter" }, "LiveRamp": { "hosts": ["pippio.com", "rapleaf.com", "rlcdn.com"], "id": "liveramp", "parent": "Acxiom" }, "Wipe Analytics": { "hosts": ["wipe.de"], "id": "web_wipe_anlaytics", "parent": "TenSquare" }, "Internet BillBoard": { "hosts": ["bbelements.com", "goadservices.com", "ibillboard.com"], "id": "internet_billboard", "parent": "Internet BillBoard a.s." }, "Leadin": { "hosts": ["hsleadflows.net"], "id": "hsleadflows.net", "parent": "HubSpot" }, "Adnium": { "hosts": ["adnium.com"], "id": "adnium.com", "parent": "Unknown" }, "vtracy.de": { "hosts": ["vtracy.de"], "id": "vtracy.de", "parent": "Unknown" }, "OneTrust": { "hosts": ["onetrust.com"], "id": "onetrust", "parent": "OneTrust" }, "SiteImprove Analytics": { "hosts": ["siteimproveanalytics.com"], "id": "siteimprove_analytics", "parent": "Siteimprove" }, "Fiksu": { "hosts": ["fiksu.com"], "id": "fiksu", "parent": "Noosphere" }, "POWr": { "hosts": ["powr.io"], "id": "powr.io", "parent": "POWr" }, "WikiMedia": { "hosts": ["wikimedia.org", "wikipedia.org", "wikiquote.org"], "id": "wikimedia.org", "parent": "Wikimedia Foundation" }, "Plista": { "hosts": ["plista.com"], "id": "plista", "parent": "plista GmbH" }, "Adobe Login": { "hosts": ["adobelogin.com"], "id": "adobe_login", "parent": "Adobe" }, "Turn Inc.": { "hosts": ["turn.com"], "id": "turn_inc.", "parent": "Singtel" }, "AdGear": { "hosts": ["adgear.com", "adgrx.com"], "id": "adgear", "parent": "Samsung" }, "Intermarkets": { "hosts": ["intermarkets.net"], "id": "intermarkets.net", "parent": "Unknown" }, "Kalooga": { "hosts": ["kaloo.ga"], "id": "kaloo.ga", "parent": "Unknown" }, "DMG Media": { "hosts": ["and.co.uk"], "id": "dmg_media", "parent": "Daily Mail and General Trust plc" }, "Booking.com": { "hosts": ["booking.com", "bstatic.com"], "id": "booking.com", "parent": "Unknown" }, "Travel Audience": { "hosts": ["travelaudience.com"], "id": "travel_audience", "parent": "Unknown" }, "Jivox": { "hosts": ["jivox.com"], "id": "jivox", "parent": "Jivox Corp" }, "ad-blocker.org": { "hosts": ["ad-blocker.org"], "id": "ad-blocker.org", "parent": "Unknown" }, "Braze": { "hosts": ["appboycdn.com"], "id": "braze", "parent": "Braze, Inc." }, "makeappdev.xyz": { "hosts": ["makeappdev.xyz"], "id": "makeappdev.xyz", "parent": "Unknown" }, "exoticads": { "hosts": ["exoticads.com"], "id": "exoticads.com", "parent": "Unknown" }, "Stride": { "hosts": ["cdn.stridespark.com", "tracking.stridespark.com"], "id": "stride", "parent": "Stride Software, Inc." }, "Visual Website Optimizer": { "hosts": ["d5phz18u4wuww.cloudfront.net", "visualwebsiteoptimizer.com", "wingify.com"], "id": "visual_website_optimizer", "parent": "Wingify" }, "Le Monde.fr": { "hosts": ["lemde.fr"], "id": "le_monde.fr", "parent": "Le Monde.fr" }, "AdBrain": { "hosts": ["adbrn.com"], "id": "adbrain", "parent": "Unknown" }, "Magnetic": { "hosts": ["d3ezl4ajpp2zy8.cloudfront.net", "domdex.com", "domdex.net"], "id": "magnetic", "parent": "Magnetic" }, "Truste Consent": { "hosts": ["consent.truste.com"], "id": "truste_consent", "parent": "TrustArc" }, "OG Hub": { "hosts": ["oghub.io"], "id": "oghub.io", "parent": "Unknown" }, "Art19": { "hosts": ["art19.com"], "id": "art19", "parent": "Art19" }, "StackAdapt": { "hosts": ["stackadapt.com"], "id": "stackadapt", "parent": "StackAdapt" }, "BrandWire": { "hosts": ["brandwire.tv"], "id": "brandwire.tv", "parent": "Unknown" }, "Tamedia": { "hosts": ["tamedia.ch"], "id": "tamedia.ch", "parent": "Unknown" }, "Segmento": { "hosts": ["rutarget.ru"], "id": "segmento", "parent": "Unknown" }, "RTB House": { "hosts": ["creativecdn.com"], "id": "rtb_house", "parent": "RTB House S.A." }, "GrandSlamMedia": { "hosts": ["trw12.com", "tuberewards.com"], "id": "grandslammedia", "parent": "Grand Slam Media" }, "Navegg DMP": { "hosts": ["navdmp.com"], "id": "navegg_dmp", "parent": "Navegg" }, "Wayfair": { "hosts": ["wayfair.com"], "id": "wayfair_com", "parent": "Unknown" }, "Kaltura": { "hosts": ["kaltura.com"], "id": "kaltura", "parent": "Kaltura" }, "Evidon": { "hosts": ["betrad.com", "evidon.com"], "id": "evidon", "parent": "Unknown" }, "RevContent": { "hosts": ["revcontent.com"], "id": "revcontent", "parent": "Revcontent, LLC" }, "Dropbox": { "hosts": ["dropbox.com", "dropboxstatic.com"], "id": "dropbox.com", "parent": "Unknown" }, "zmctrack.net": { "hosts": ["zmctrack.net"], "id": "zmctrack.net", "parent": "Unknown" }, "Kupona": { "hosts": ["d31bfnnwekbny6.cloudfront.net", "kpcustomer.de", "q-sis.de"], "id": "kupona", "parent": "ACTU/CCI" }, "upravel.com": { "hosts": ["upravel.com"], "id": "upravel.com", "parent": "Unknown" }, "SendPulse": { "hosts": ["sendpulse.com"], "id": "sendpulse.com", "parent": "Unknown" }, "HERE (formerly Navteq Media Solutions)": { "hosts": ["here.com"], "id": "here__formerly_navteq_media_solutions_", "parent": "Unknown" }, "Bunchbox": { "hosts": ["bunchbox.co"], "id": "bunchbox", "parent": "Bunchbox" }, "Bonial Connect": { "hosts": ["bonial.com", "bonialconnect.com", "bonialserviceswidget.de"], "id": "bonial", "parent": "Unknown" }, "web.de": { "hosts": ["web.de", "webde.de"], "id": "web.de", "parent": "Unknown" }, "Browser Update": { "hosts": ["browser-update.org"], "id": "browser_update", "parent": "Browser-Update" }, "Affec.tv": { "hosts": ["affectv.com"], "id": "affec.tv", "parent": "Affectv Ltd" }, "Are You a Human": { "hosts": ["areyouahuman.com"], "id": "are_you_a_human", "parent": "distil networks" }, "Batch Media": { "hosts": ["t4ft.de"], "id": "batch_media", "parent": "ProSiebenSat.1 Media" }, "Amazon Payments": { "hosts": ["amazonpay.com", "payments-amazon.com"], "id": "amazon_payments", "parent": "Amazon" }, "Snap Engage": { "hosts": ["snapengage.com"], "id": "snap_engage", "parent": "Snap Engage" }, "Opinary": { "hosts": ["opinary.com"], "id": "opinary", "parent": "Unknown" }, "HubSpot": { "hosts": ["hs-analytics.net", "hs-scripts.com", "hubapi.com", "hubspot.com"], "id": "hubspot", "parent": "HubSpot" }, "BlogHer": { "hosts": ["blogher.com", "blogherads.com"], "id": "blogher", "parent": "Penske Media Corporation " }, "Supership": { "hosts": ["socdm.com"], "id": "supership", "parent": "Unknown" }, "btncdn.com": { "hosts": ["btncdn.com"], "id": "btncdn.com", "parent": "Unknown" }, "Crimtan": { "hosts": ["ctasnet.com", "ctnsnet.com", "ctpsnet.com"], "id": "crimtan", "parent": "Crimtan Holdings Limited" }, "Spongecell": { "hosts": ["spongecell.com"], "id": "spongecell", "parent": "Spongecell" }, "Yotpo": { "hosts": ["yotpo.com"], "id": "yotpo", "parent": "Unknown" }, "adstir": { "hosts": ["ad-stir.com"], "id": "adstir", "parent": "United Inc." }, "Findologic": { "hosts": ["findologic.com"], "id": "findologic.com", "parent": "Unknown" }, "mbr targeting": { "hosts": ["m6r.eu"], "id": "mbr_targeting", "parent": "Str\u00f6er SSP GmbH" }, "Tribal Fusion": { "hosts": ["exponential.com", "tribalfusion.com"], "id": "tribal_fusion", "parent": "Exponential Interactive, Inc" }, "ZergNet": { "hosts": ["zergnet.com"], "id": "zergnet", "parent": "ZergNet" }, "zalando.de": { "hosts": ["zalan.do", "zalando.de", "ztat.net"], "id": "zalando_de", "parent": "Zalando" }, "PornHub": { "hosts": ["phncdn.com", "pornhub.com"], "id": "pornhub", "parent": "Pornhub" }, "smi2.ru": { "hosts": ["smi2.net", "smi2.ru", "stat.media"], "id": "smi2.ru", "parent": "Unknown" }, "Playbuzz": { "hosts": ["playbuzz.com"], "id": "playbuzz.com", "parent": "Playbuzz Ltd. " }, "ORC International": { "hosts": ["emxdgt.com"], "id": "orc_international", "parent": "Engine" }, "Errorception": { "hosts": ["d15qhc0lu1ghnk.cloudfront.net", "errorception.com"], "id": "errorception", "parent": "Errorception" }, "ubersetzung-app.com": { "hosts": ["ubersetzung-app.com"], "id": "ubersetzung-app.com", "parent": "Unknown" }, "bumlam.com": { "hosts": ["bumlam.com"], "id": "bumlam.com", "parent": "Unknown" }, "AdMachine": { "hosts": ["adx1.com"], "id": "admachine", "parent": "Unknown" }, "LKQD": { "hosts": ["lkqd.net"], "id": "lkqd", "parent": "Nexstar Digital, LLC." }, "atsfi.de": { "hosts": ["atsfi.de"], "id": "atsfi_de", "parent": "Axel Springer Group" }, "LiveInternet": { "hosts": ["yadro.ru"], "id": "liveinternet", "parent": "LiveInternet" }, "ShortNews.de": { "hosts": ["shortnews.de"], "id": "shortnews", "parent": "Unknown" }, "King.com": { "hosts": ["midasplayer.com", "king.com"], "id": "king_com", "parent": "Activision Blizzard" }, "Blue Triangle": { "hosts": ["btttag.com"], "id": "bluetriangle", "parent": "Unknown" }, "RTBmarkt": { "hosts": ["rvty.net"], "id": "rtblab", "parent": "Unknown" }, "94j7afz2nr.xyz": { "hosts": ["94j7afz2nr.xyz"], "id": "94j7afz2nr.xyz", "parent": "Unknown" }, "Q-Division": { "hosts": ["q-divisioncdn.de"], "id": "q_division", "parent": "Unknown" }, "Trustwave": { "hosts": ["trustwave.com"], "id": "trustwave.com", "parent": "Unknown" }, "Bazaarvoice": { "hosts": ["bazaarvoice.com"], "id": "bazaarvoice", "parent": "Bazaarvoice" }, "ESPN CDN": { "hosts": ["espncdn.com"], "id": "espn_cdn", "parent": "The Walt Disney Company" }, "Sonobi": { "hosts": ["sonobi.com"], "id": "sonobi", "parent": "Sonobi, Inc" }, "zononi.com": { "hosts": ["zononi.com"], "id": "zononi.com", "parent": "Unknown" }, "Klarna": { "hosts": ["klarna.com"], "id": "klarna.com", "parent": "Unknown" }, "Catchpoint": { "hosts": ["3gl.net"], "id": "catchpoint", "parent": "Catchpoint Systems" }, "Google Custom Search Ads": { "hosts": ["adsensecustomsearchads.com"], "id": "google_custom_search", "parent": "Google" }, "Beeline": { "hosts": ["beeline.ru"], "id": "beeline.ru", "parent": "Unknown" }, "ihvmcqojoj.com": { "hosts": ["ihvmcqojoj.com"], "id": "ihvmcqojoj.com", "parent": "Unknown" }, "Freshdesk": { "hosts": ["d36mpcpuzc4ztk.cloudfront.net", "freshdesk.com"], "id": "freshdesk", "parent": "Freshdesk" }, "INFOnline": { "hosts": ["ioam.de", "iocnt.net", "ivwbox.de"], "id": "infonline", "parent": "INFOnline" }, "Mov.ad ": { "hosts": ["movad.de", "movad.net"], "id": "mov.ad_", "parent": "Unknown" }, "Flowplayer": { "hosts": ["flowplayer.org"], "id": "flowplayer", "parent": "FlowPlayer" }, "Apa": { "hosts": ["apa.at"], "id": "apa.at", "parent": "Apa" }, "Monero Miner": { "hosts": ["devappgrant.space"], "id": "monero_miner", "parent": "Unknown" }, "Flashtalking": { "hosts": ["flashtalking.com"], "id": "flashtalking", "parent": "Flashtalking, Inc." }, "1000mercis": { "hosts": ["mmtro.com"], "id": "1000mercis", "parent": "1000mercis" }, "newsupdatewe.info": { "hosts": ["newsupdatewe.info"], "id": "newsupdatewe.info", "parent": "Unknown" }, "Mail.Ru CDN": { "hosts": ["mycdn.me"], "id": "mycdn.me", "parent": "Megafon" }, "SevenOne Media": { "hosts": ["71i.de"], "id": "sevenone_media", "parent": "Unknown" }, "Lucky Orange": { "hosts": ["livestatserver.com", "luckyorange.com", "luckyorange.net"], "id": "lucky_orange", "parent": "Unknown" }, "Flickr": { "hosts": ["flickr.com", "staticflickr.com"], "id": "flickr_badge", "parent": "Verizon" }, "Aggregate Knowledge": { "hosts": ["agkn.com"], "id": "aggregate_knowledge", "parent": "Neustar " }, "Diamoni": { "hosts": ["d3von6il1wr7wo.cloudfront.net", "dianomi.com", "dianomioffers.co.uk"], "id": "dianomi", "parent": "Unknown" }, "Between Digital": { "hosts": ["betweendigital.com"], "id": "betweendigital.com", "parent": "Between Digital" }, "Eulerian Technologies": { "hosts": ["ew3.io"], "id": "eulerian", "parent": "Eulerian Technologies" }, "YouPorn": { "hosts": ["youporn.com", "ypncdn.com"], "id": "youporn", "parent": "Unknown" }, "Roq.ad": { "hosts": ["rqtrk.eu"], "id": "roq.ad", "parent": "Roq.ad GmbH" }, "Bitrix24": { "hosts": ["bitrix.info", "bitrix.ru"], "id": "bitrix", "parent": "Unknown" }, "Opta": { "hosts": ["opta.net"], "id": "opta.net", "parent": "Unknown" }, "Digidip": { "hosts": ["digidip.net"], "id": "digidip", "parent": "Digidip" }, "Qubit Opentag": { "hosts": ["d3c3cq33003psk.cloudfront.net", "qubit.com"], "id": "qubit", "parent": "Unknown" }, "HotLog": { "hosts": ["hotlog.ru"], "id": "hotlog.ru", "parent": "Unknown" }, "Cnetcontent": { "hosts": ["cnetcontent.com"], "id": "cnetcontent.com", "parent": "CBS Interactive" }, "Cross Pixel": { "hosts": ["crosspixel.net", "crsspxl.com"], "id": "crosspixel", "parent": "Unknown" }, "H\u00e4ndlerbund": { "hosts": ["haendlerbund.de"], "id": "haendlerbund.de", "parent": "Unknown" }, "IVC Brasil": { "hosts": ["ivcbrasil.org.br"], "id": "ivcbrasil.org.br", "parent": "Unknown" }, "OWOX": { "hosts": ["owox.com"], "id": "owox.com", "parent": "OWOX Inc." }, "Audience Science": { "hosts": ["revsci.net", "targetingmarketplace.com", "wunderloop.net"], "id": "audience_science", "parent": "AudienceScience" }, "Steel House Media": { "hosts": ["steelhousemedia.com"], "id": "steelhouse", "parent": "Steel House, Inc." }, "YOOCHOOSE": { "hosts": ["yoochoose.net"], "id": "yoochoose.net", "parent": "Unknown" }, "Content.ad": { "hosts": ["content.ad"], "id": "content.ad", "parent": "Content.ad" }, "spotscenered.info": { "hosts": ["spotscenered.info"], "id": "spotscenered.info", "parent": "Unknown" }, "Elastic Ad": { "hosts": ["elasticad.net"], "id": "elastic_ad", "parent": "Elastic Ad" }, "OptimiCDN": { "hosts": ["optimicdn.com"], "id": "optimicdn.com", "parent": "Unknown" }, "Social Miner": { "hosts": ["soclminer.com.br"], "id": "social_miner", "parent": "Unknown" }, "ChartBeat": { "hosts": ["chartbeat.com", "chartbeat.net"], "id": "chartbeat", "parent": "ChartBeat" }, "mirtesen.ru": { "hosts": ["mirtesen.ru"], "id": "mirtesen.ru", "parent": "Unknown" }, "Realperson Chat": { "hosts": ["realperson.de"], "id": "realperson.de", "parent": "Optimise-it" }, "Wikia Beacon": { "hosts": ["wikia-beacon.com"], "id": "wikia_beacon", "parent": "Wikia" }, "Forensiq": { "hosts": ["fqtag.com", "securepaths.com"], "id": "forensiq", "parent": "Impact" }, "Intent Media": { "hosts": ["intentmedia.net"], "id": "intent_media", "parent": "Intent Media, Inc." }, "ClickInText": { "hosts": ["clickintext.net"], "id": "clickintext", "parent": "ClickInText" }, "Stroer Digital Media": { "hosts": ["interactivemedia.net", "stroeerdigitalgroup.de", "stroeerdigitalmedia.de", "stroeerdp.de", "stroeermediabrands.de"], "id": "stroer_digital_media", "parent": "Str\u00f6er SSP GmbH" }, "unpkg": { "hosts": ["unpkg.com"], "id": "unpkg.com", "parent": "Unknown" }, "xfreeservice.com": { "hosts": ["xfreeservice.com"], "id": "xfreeservice.com", "parent": "Unknown" }, "Post Affiliate Pro": { "hosts": ["postaffiliatepro.com"], "id": "post_affiliate_pro", "parent": "QualityUnit" }, "Investing Channel": { "hosts": ["investingchannel.com"], "id": "investingchannel", "parent": "InvestingChannel, Inc." }, "FlowSurf": { "hosts": ["othersearch.info"], "id": "othersearch.info", "parent": "Unknown" }, "Mux, Inc.": { "hosts": ["litix.io"], "id": "mux_inc", "parent": "Mux, Inc." }, "TagMan": { "hosts": ["levexis.com"], "id": "tagman", "parent": "TagMan" }, "BidTheatre": { "hosts": ["bidtheatre.com"], "id": "bidtheatre", "parent": "BidTheatre AB" }, "interedy.info": { "hosts": ["interedy.info"], "id": "interedy.info", "parent": "Unknown" }, "Inbox SDK": { "hosts": ["inboxsdk.com"], "id": "inboxsdk.com", "parent": "Unknown" }, "bigmir.net": { "hosts": ["bigmir.net"], "id": "bigmir.net", "parent": "Unknown" }, "vodafone.de": { "hosts": ["vodafone.de"], "id": "vodafone.de", "parent": "Unknown" }, "Conviva": { "hosts": ["conviva.com"], "id": "conviva", "parent": "Conviva" }, "Narrative I/O": { "hosts": ["narrative.io"], "id": "narrative_io", "parent": "Unknown" }, "Cloudinary": { "hosts": ["cloudinary.com"], "id": "cloudinary", "parent": "Unknown" }, "NetSeer": { "hosts": ["netseer.com"], "id": "netseer", "parent": "NetSeer" }, "Beeketing": { "hosts": ["beeketing.com"], "id": "beeketing.com", "parent": "Beeketing" }, "DoublePimp": { "hosts": ["doublepimp.com", "doublepimpssl.com", "redcourtside.com", "xeontopa.com", "zerezas.com"], "id": "doublepimp", "parent": "DoublePimp" }, "Dstillery": { "hosts": ["m6d.com", "media6degrees.com"], "id": "dstillery", "parent": "Dstillery" }, "Instagram": { "hosts": ["cdninstagram.com", "instagram.com"], "id": "instagram_com", "parent": "Facebook" }, "Umeng": { "hosts": ["cnzz.com", "umeng.com"], "id": "cnzz.com", "parent": "Umeng" }, "Digicert Trust Seal": { "hosts": ["digicert.com"], "id": "digicert_trust_seal", "parent": "Digicert" }, "Shopzilla": { "hosts": ["shopzilla.com"], "id": "shopzilla", "parent": "Symphony Technology Group" }, "SmartStream.TV": { "hosts": ["smartstream.tv"], "id": "smartstream.tv", "parent": "SMARTSTREAM.TV GmbH" }, "Pardot": { "hosts": ["pardot.com"], "id": "pardot", "parent": "Pardot" }, "logsss.com": { "hosts": ["logsss.com"], "id": "logsss.com", "parent": "Unknown" }, "NET-Metrix": { "hosts": ["wemfbox.ch"], "id": "net-metrix", "parent": "NET-Metrix" }, "Underdog Media": { "hosts": ["udmserve.net"], "id": "underdog_media", "parent": "Underdog Media LLC " }, "ICF Technology": { "hosts": ["nsimg.net"], "id": "icf_technology", "parent": "Unknown" }, "Popcash": { "hosts": ["popcash.net"], "id": "popcash", "parent": "PopCash Network" }, "Pluso": { "hosts": ["pluso.ru"], "id": "pluso.ru", "parent": "Unknown" }, "Fastly Insights": { "hosts": ["fastly-insights.com"], "id": "fastly_insights", "parent": "Fastly" }, "UserReport": { "hosts": ["userreport.com"], "id": "userreport", "parent": "UserReport" }, "wp.pl": { "hosts": ["wp.pl", "wpimg.pl"], "id": "wp.pl", "parent": "Unknown" }, "AdClear": { "hosts": ["adclear.net"], "id": "adclear", "parent": "AdClear GmbH" }, "AdDefend": { "hosts": ["yagiay.com"], "id": "addefend", "parent": "Unknown" }, "mein-bmi.com": { "hosts": ["mein-bmi.com"], "id": "mein-bmi.com", "parent": "Unknown" }, "teufel.de": { "hosts": ["teufel.de"], "id": "teufel.de", "parent": "Unknown" }, "UserZoom": { "hosts": ["userzoom.com"], "id": "userzoom.com", "parent": "Unknown" }, "ChannelPilot Solutions": { "hosts": ["cptrack.de"], "id": "channel_pilot_solutions", "parent": "Unknown" }, "Zanox": { "hosts": ["zanox-affiliate.de", "zanox.com", "zanox.ws"], "id": "zanox", "parent": "Unknown" }, "Hybrid.ai": { "hosts": ["hybrid.ai", "targetix.net"], "id": "hybrid.ai", "parent": "Hybrid Adtech GmbH" }, "gmx.net": { "hosts": ["gmx.net", "gmxpro.net"], "id": "gmx_net", "parent": "Unknown" }, "noop.style": { "hosts": ["noop.style"], "id": "noop.style", "parent": "Unknown" }, "MarketGid": { "hosts": ["dt00.net", "dt07.net", "marketgid.com", "mgid.com"], "id": "marketgid", "parent": "MGID Inc." }, "idealo.com": { "hosts": ["idealo.com"], "id": "idealo_com", "parent": "Unknown" }, "BrightRoll": { "hosts": ["btrll.com"], "id": "brightroll", "parent": "Verizon" }, "GroundTruth": { "hosts": ["bidagent.xad.com"], "id": "groundtruth", "parent": "GroundTruth" }, "TrafMag": { "hosts": ["trafmag.com"], "id": "trafmag.com", "parent": "Unknown" }, "nonstop Consulting": { "hosts": ["trkme.net"], "id": "nonstop_consulting", "parent": "United Digital Group (FKA nonstopConsulting)" }, "Pepper": { "hosts": ["pepper.com"], "id": "pepper.com", "parent": "6 Minutes Media GmbH" }, "jimdo.com": { "hosts": ["jimcdn.com", "jimdo.com", "jimstatic.com"], "id": "jimdo.com", "parent": "Unknown" }, "SAP Exchange Media": { "hosts": ["sap-xm.org"], "id": "sap_xm", "parent": "Unknown" }, "madeleine.de": { "hosts": ["madeleine.de"], "id": "madeleine.de", "parent": "Unknown" }, "Factor Eleven": { "hosts": ["f11-ads.com"], "id": "f11-ads.com", "parent": "Unknown" }, "AdUp Technology": { "hosts": ["adup-tech.com"], "id": "adup-tech.com", "parent": "Unknown" }, "AdRoll": { "hosts": ["adroll.com"], "id": "adroll", "parent": "AdRoll Inc" }, "xen-media.com": { "hosts": ["xen-media.com"], "id": "xen-media.com", "parent": "Unknown" }, "Bing Maps": { "hosts": ["virtualearth.net"], "id": "bing_maps", "parent": "Microsoft" }, "Trueffect": { "hosts": ["adlegend.com"], "id": "trueffect", "parent": "Trueffect" }, "stalluva.pro": { "hosts": ["stalluva.pro"], "id": "stalluva.pro", "parent": "Unknown" }, "RUN": { "hosts": ["runadtag.com", "rundsp.com"], "id": "run", "parent": "RUN" }, "DataDome": { "hosts": ["datadome.co"], "id": "datadome", "parent": "DataDome" }, "siblesectiveal.club": { "hosts": ["siblesectiveal.club"], "id": "siblesectiveal.club", "parent": "Unknown" }, "alephd": { "hosts": ["alephd.com"], "id": "alephd.com", "parent": "Verizon" }, "realytics.io": { "hosts": ["realytics.io"], "id": "realytics.io", "parent": "Unknown" }, "eanalyzer.de": { "hosts": ["eanalyzer.de"], "id": "eanalyzer.de", "parent": "Unknown" }, "Facebook CDN": { "hosts": ["fbcdn.net", "fbsbx.com"], "id": "facebook_cdn", "parent": "Facebook" }, "HQ Entertainment Network": { "hosts": ["hqentertainmentnetwork.com", "justservingfiles.net"], "id": "hqentertainmentnetwork.com", "parent": "Unknown" }, "XXXLutz": { "hosts": ["xxxlutz.de"], "id": "xxxlutz", "parent": "XXXLutz KG" }, "nfxTrack": { "hosts": ["netrk.net"], "id": "netrk.net", "parent": "netzeffekt" }, "ciuvo.com": { "hosts": ["ciuvo.com"], "id": "ciuvo.com", "parent": "Unknown" }, "GeoTrust": { "hosts": ["geotrust.com"], "id": "geotrust", "parent": "GeoTrust" }, "Dawanda CDN": { "hosts": ["dawandastatic.com"], "id": "dawandastatic.com", "parent": "Unknown" }, "ixquick": { "hosts": ["ixquick.com"], "id": "ixquick.com", "parent": "StartPage" }, "yapfiles.ru": { "hosts": ["yapfiles.ru"], "id": "yapfiles.ru", "parent": "Unknown" }, "Signal": { "hosts": ["btstatic.com", "signal.co", "thebrighttag.com"], "id": "signal", "parent": "Signal Digital Inc." }, "OnAudience": { "hosts": ["behavioralengine.com", "onaudience.com"], "id": "onaudience", "parent": "Cloud Technologies S.A." }, "Voluum": { "hosts": ["cwkuki.com", "voluumtrk3.com"], "id": "voluum", "parent": "Unknown" }, "Contentpass": { "hosts": ["contentpass.de", "contentpass.net"], "id": "contentpass", "parent": "Unknown" }, "gumgum": { "hosts": ["gumgum.com"], "id": "gumgum", "parent": "GumGum, Inc." }, "Visual Revenue": { "hosts": ["visualrevenue.com"], "id": "visual_revenue", "parent": "Outbrain" }, "Level 3 Communications, Inc.": { "hosts": ["footprint.net"], "id": "level3_communications", "parent": "Level 3 Communications, Inc." }, "Netletix": { "hosts": ["netzathleten-media.de"], "id": "netletix", "parent": "IP Deutschland" }, "Admixer": { "hosts": ["admixer.net"], "id": "admixer.net", "parent": "Unknown" }, "iubenda": { "hosts": ["iubenda.com"], "id": "iubenda.com", "parent": "Unknown" }, "Ividence": { "hosts": ["ivitrack.com"], "id": "ividence", "parent": "SIEN" }, "Microsoft Ajax CDN": { "hosts": ["aspnetcdn.com"], "id": "aspnetcdn", "parent": "Microsoft" }, "Marketo": { "hosts": ["marketo.com", "marketo.net", "mktoresp.com"], "id": "marketo", "parent": "Marketo" }, "Bootstrap CDN": { "hosts": ["bootstrapcdn.com"], "id": "bootstrap", "parent": "BootstrapCDN" }, "Livefyre": { "hosts": ["fyre.co", "livefyre.com"], "id": "livefyre", "parent": "Livefyre" }, "ymzrrizntbhde.com": { "hosts": ["ymzrrizntbhde.com"], "id": "ymzrrizntbhde.com", "parent": "Unknown" }, "Admitad": { "hosts": ["admitad.com"], "id": "admitad.com", "parent": "Admitad" }, "Get Site Control": { "hosts": ["getsitecontrol.com"], "id": "get_site_control", "parent": "GetSiteControl" }, "a3cloud.net": { "hosts": ["a3cloud.net"], "id": "a3cloud_net", "parent": "Unknown" }, "pushnative.com": { "hosts": ["pushnative.com"], "id": "pushnative.com", "parent": "Unknown" }, "Nuance": { "hosts": ["inq.com"], "id": "touchcommerce", "parent": "Unknown" }, "StackPath": { "hosts": ["stackpathdns.com"], "id": "stackpathdns.com", "parent": "Unknown" }, "Sophus3": { "hosts": ["sophus3.com"], "id": "sophus3", "parent": "Sophus3" }, "Kinja Static": { "hosts": ["kinja-img.com", "kinja-static.com"], "id": "kinja_static", "parent": "Gizmodo Media Group" }, "Digital.gov": { "hosts": ["digitalgov.gov"], "id": "digital.gov", "parent": "USA Government" }, "PageFair": { "hosts": ["blockmetrics.com", "pagefair.com", "pagefair.net"], "id": "pagefair", "parent": "PageFair" }, "Purch": { "hosts": ["purch.com", "servebom.com"], "id": "purch", "parent": "Purch Group, Inc." }, "Google Tag Manager": { "hosts": ["googletagmanager.com", "googletagservices.com"], "id": "google_tag_manager", "parent": "Google" }, "nyetm2mkch.com": { "hosts": ["nyetm2mkch.com"], "id": "nyetm2mkch.com", "parent": "Unknown" }, "Amplitude": { "hosts": ["amplitude.com", "d24n15hnbwhuhn.cloudfront.net"], "id": "amplitude", "parent": "Amplitude" }, "Vigo": { "hosts": ["vigo.one", "vigo.ru"], "id": "vigo", "parent": "Vigo" }, "VideoAdX": { "hosts": ["videoadex.com"], "id": "videoadex.com", "parent": "DIGITEKA Technologies" }, "VigLink": { "hosts": ["viglink.com"], "id": "viglink", "parent": "VigLink" }, "datds.net": { "hosts": ["datds.net"], "id": "datds.net", "parent": "Unknown" }, "StartApp": { "hosts": ["startappservice.com"], "id": "startapp", "parent": "Unknown" }, "Bid.Run": { "hosts": ["bid.run"], "id": "bid.run", "parent": "Bid.Run" }, "SnackTV": { "hosts": ["snacktv.de"], "id": "snacktv", "parent": "Unknown" }, "faktor.io": { "hosts": ["faktor.io"], "id": "faktor.io", "parent": "Faktor B.V." }, "Creative Commons": { "hosts": ["creativecommons.org"], "id": "creative_commons", "parent": "Creative Commons Corporation" }, "Pinterest": { "hosts": ["pinimg.com", "pinterest.com"], "id": "pinterest", "parent": "Pinterest" }, "Tag Commander": { "hosts": ["commander1.com", "tagcommander.com"], "id": "tag_commander", "parent": "Tag Commander" }, "afgr2.com": { "hosts": ["afgr2.com"], "id": "afgr2.com", "parent": "Unknown" }, "MailChimp": { "hosts": ["chimpstatic.com", "list-manage.com", "mailchimp.com"], "id": "mailchimp", "parent": "The Rocket Science Group" }, "Spoutable": { "hosts": ["spoutable.com"], "id": "spoutable", "parent": "Unknown" }, "TNS": { "hosts": ["research-int.se", "sesamestats.com", "spring-tns.net", "statistik-gallup.net", "tns-cs.net", "tns-gallup.dk"], "id": "tns", "parent": "WPP" }, "V12 Group": { "hosts": ["v12group.com"], "id": "v12_group", "parent": "Unknown" }, "Recreativ": { "hosts": ["recreativ.ru"], "id": "recreativ", "parent": "Recreativ" }, "Baynote Observer": { "hosts": ["baynote.net"], "id": "baynote_observer", "parent": "Baynote" }, "BlueKai": { "hosts": ["bkrtx.com", "bluekai.com"], "id": "bluekai", "parent": "Oracle" }, "PulsePoint": { "hosts": ["contextweb.com", "pulsepoint.com"], "id": "pulsepoint", "parent": "PulsePoint, Inc." }, "ausgezeichnet.org": { "hosts": ["ausgezeichnet.org"], "id": "ausgezeichnet_org", "parent": "Unknown" }, "Propeller Ads": { "hosts": ["oclaserver.com", "onclasrv.com", "onclickads.net", "onclkds.com", "propellerads.com", "propellerpops.com"], "id": "propeller_ads", "parent": "Propeller Ads" }, "Shutterstock": { "hosts": ["shutterstock.com"], "id": "shutterstock", "parent": "Shutterstock, Inc." }, "Siteimprove": { "hosts": ["siteimprove.com"], "id": "siteimprove", "parent": "Siteimprove" }, "Pushwoosh": { "hosts": ["pushwoosh.com"], "id": "pushwoosh.com", "parent": "Pushwoosh" }, "cdnetworks.net": { "hosts": ["cdnetworks.com", "cdnetworks.net"], "id": "cdnetworks.net", "parent": "Unknown" }, "Vidible": { "hosts": ["vidible.tv"], "id": "vidible", "parent": "Verizon" }, "Fivetran": { "hosts": ["fivetran.com"], "id": "fivetran", "parent": "Fivetran" }, "Zebestof": { "hosts": ["zebestof.com"], "id": "zebestof.com", "parent": "Zebestof" }, "Tapad": { "hosts": ["tapad.com"], "id": "tapad", "parent": "Telenor Group" }, "Shopify Cloud": { "hosts": ["shopifycloud.com"], "id": "shopifycloud.com", "parent": "Shopify" }, "Docler": { "hosts": ["awecr.com", "fwbntw.com"], "id": "docler", "parent": "Docler IP" }, "Yusp": { "hosts": ["gravityrd-services.com"], "id": "yusp", "parent": "Unknown" }, "adworxs.net": { "hosts": ["adworxs.net"], "id": "adworxs.net", "parent": "Unknown" }, "Chip Analytics": { "hosts": ["cxo.name"], "id": "cxo.name", "parent": "Unknown" }, "Po.st": { "hosts": ["po.st"], "id": "po.st", "parent": "RhythmOne, LLC" }, "etahub.com": { "hosts": ["etahub.com"], "id": "etahub.com", "parent": "Unknown" }, "Ringier": { "hosts": ["ringier.ch"], "id": "ringier.ch", "parent": "Ringier AG" }, "Adobe TagManager": { "hosts": ["adobetag.com"], "id": "adobe_tagmanager", "parent": "Adobe" }, "Hi-Media Performance": { "hosts": ["adlink.net", "comclick.com", "hi-mediaserver.com", "himediads.com", "himediadx.com"], "id": "hi-media_performance", "parent": "Hi-media Performance" }, "Eyereturn Marketing": { "hosts": ["eyereturn.com"], "id": "eyereturnmarketing", "parent": "Torstar Corporation " }, "pnamic.com": { "hosts": ["pnamic.com"], "id": "pnamic.com", "parent": "Unknown" }, "defpush.com": { "hosts": ["defpush.com"], "id": "defpush.com", "parent": "Unknown" }, "davebestdeals.com": { "hosts": ["davebestdeals.com"], "id": "davebestdeals.com", "parent": "Unknown" }, "adxprtz.com": { "hosts": ["adxprtz.com"], "id": "adxprtz.com", "parent": "Unknown" }, "EroAdvertising": { "hosts": ["ero-advertising.com", "eroadvertising.com"], "id": "eroadvertising", "parent": "Ero Advertising" }, "Imgur": { "hosts": ["imgur.com"], "id": "imgur", "parent": "Imgur" }, "24-ADS GmbH": { "hosts": ["24-ads.com"], "id": "24-ads.com", "parent": "Unknown" }, "Platform360": { "hosts": ["pfrm.co"], "id": "platform360", "parent": "Unknown" }, "Venatus Media": { "hosts": ["vntsm.com"], "id": "vntsm.com", "parent": "Venatus Media Limited" }, "Heroku": { "hosts": ["herokuapp.com"], "id": "heroku", "parent": "Unknown" }, "Platform161": { "hosts": ["creative-serving.com"], "id": "161media", "parent": "Platform161" }, "usemessages.com": { "hosts": ["usemessages.com"], "id": "usemessages.com", "parent": "Unknown" }, "Adloox": { "hosts": ["adlooxtracking.com"], "id": "adloox", "parent": "Adloox SA" }, "Marvellous Machine": { "hosts": ["marvellousmachine.net"], "id": "marvellous_machine", "parent": "Unknown" }, "Exactag": { "hosts": ["exactag.com"], "id": "exactag", "parent": "Exactag GmbH" }, "4finance.com": { "hosts": ["4finance.com"], "id": "4finance_com", "parent": "Unknown" }, "Highwinds": { "hosts": ["hwcdn.net"], "id": "highwinds", "parent": "Highwinds" }, "LinkedIn": { "hosts": ["bizo.com", "bizographics.com", "licdn.com", "linkedin.com", "lynda.com"], "id": "linkedin", "parent": "Microsoft" }, "Bounce Exchange": { "hosts": ["bounceexchange.com"], "id": "bounce_exchange", "parent": "Bounce Exchange, Inc" }, "Traffic Factory": { "hosts": ["trafficfactory.biz"], "id": "trafficfactory", "parent": "Unknown" }, "AOL CDN": { "hosts": ["aolcdn.com"], "id": "aol_cdn", "parent": "Verizon" }, "Whatbroadcast": { "hosts": ["whatsbroadcast.com"], "id": "whatbroadcast", "parent": "WhatsBroadcast" }, "Alibaba": { "hosts": ["alibaba.com", "alicdn.com"], "id": "alibaba.com", "parent": "Alibaba" }, "eXelate": { "hosts": ["exelator.com"], "id": "exelate", "parent": "Nielsen" }, "vorwerk.de": { "hosts": ["vorwerk.de"], "id": "vorwerk.de", "parent": "Unknown" }, "4Chan": { "hosts": ["4cdn.org"], "id": "4chan", "parent": "Unknown" }, "Tealium": { "hosts": ["llnwd.net", "tealium.com", "tealiumiq.com", "tiqcdn.com"], "id": "tealium", "parent": "Tealium" }, "statsy.net": { "hosts": ["statsy.net"], "id": "statsy.net", "parent": "Unknown" }, "Blau": { "hosts": ["blau.de"], "id": "blau.de", "parent": "Unknown" }, "FraudLogix": { "hosts": ["yabidos.com"], "id": "fraudlogix", "parent": "Unknown" }, "Canvas": { "hosts": ["canvas.net", "canvasnetwork.com", "du11hjcvx0uqb.cloudfront.net"], "id": "canvas", "parent": "Unknown" }, "cdnondemand.org": { "hosts": ["cdnondemand.org"], "id": "cdnondemand.org", "parent": "Unknown" }, "Yieldmo": { "hosts": ["yieldmo.com"], "id": "yieldmo", "parent": "Yieldmo, Inc." }, "Gravity Insights": { "hosts": ["gravity.com", "grvcdn.com"], "id": "gravity_insights", "parent": "Gravity" }, "pushwhy.com": { "hosts": ["pushwhy.com"], "id": "pushwhy.com", "parent": "Unknown" }, "Scoota": { "hosts": ["rockabox.co"], "id": "scoota", "parent": "Rockabox Media Ltd" }, "wdr.de": { "hosts": ["wdr.de"], "id": "wdr.de", "parent": "Unknown" }, "JivoChat": { "hosts": ["jivosite.com"], "id": "jivochat", "parent": "Unknown" }, "BetterTTV": { "hosts": ["betterttv.net"], "id": "betterttv", "parent": "NightDev, LLC" }, "MaxPoint Interactive": { "hosts": ["mxptint.net"], "id": "maxpoint_interactive", "parent": "MaxPoint Interactive" }, "Tyroo": { "hosts": ["tyroodr.com"], "id": "tyroo", "parent": "Tyroo" }, "Baidu Static": { "hosts": ["bdimg.com", "bdstatic.com"], "id": "baidu_static", "parent": "Baidu" }, "Polyfill.io": { "hosts": ["polyfill.io"], "id": "polyfill.io", "parent": "Unknown" }, "Netaffiliation": { "hosts": ["netaffiliation.com"], "id": "metaffiliation.com", "parent": "Kwanko" }, "cdn13.com": { "hosts": ["cdn13.com"], "id": "cdn13.com", "parent": "Unknown" }, "codeonclick.com": { "hosts": ["codeonclick.com"], "id": "codeonclick.com", "parent": "Unknown" }, "CPMStar": { "hosts": ["cpmstar.com"], "id": "cpmstar", "parent": "CPMStar" }, "Sublime Skinz": { "hosts": ["ayads.co"], "id": "sublime_skinz", "parent": "Sublime Skinz" }, "True Anthem": { "hosts": ["tru.am"], "id": "trueanthem", "parent": "trueAnthem" }, "neXeps": { "hosts": ["nexeps.com"], "id": "nexeps.com", "parent": "Unknown" }, "SmartClick": { "hosts": ["smartclick.net"], "id": "smartclick.net", "parent": "Unknown" }, "WP Engine": { "hosts": ["wpengine.com"], "id": "wp_engine", "parent": "WP Engine" }, "Wistia": { "hosts": ["wistia.com", "wistia.net"], "id": "wistia", "parent": "Wistia" }, "Research Now": { "hosts": ["researchnow.com"], "id": "research_now", "parent": "Research Now Group, Inc" }, "asambeauty.com": { "hosts": ["asambeauty.com"], "id": "asambeauty.com", "parent": "Unknown" }, "express.co.uk": { "hosts": ["express.co.uk"], "id": "express.co.uk", "parent": "Unknown" }, "Webfonts by Hoefler&Co": { "hosts": ["typography.com"], "id": "typography.com", "parent": "Unknown" }, "Clicky": { "hosts": ["getclicky.com", "staticstuff.net"], "id": "clicky", "parent": "Clicky" }, "oclasrv.com": { "hosts": ["oclasrv.com"], "id": "oclasrv.com", "parent": "Unknown" }, "loadsource.org": { "hosts": ["loadsource.org"], "id": "loadsource.org", "parent": "Unknown" }, "Loadbee": { "hosts": ["loadbee.com"], "id": "loadbee.com", "parent": "Unknown" }, "boltdns.net": { "hosts": ["boltdns.net"], "id": "boltdns.net", "parent": "Unknown" }, "cdn-net.com": { "hosts": ["cdn-net.com"], "id": "cdn-net.com", "parent": "Unknown" }, "Optimizely": { "hosts": ["optimizely.com"], "id": "optimizely", "parent": "Optimizely" }, "AutopilotHQ": { "hosts": ["api.autopilothq.com"], "id": "autopilothq", "parent": "AutopilotHQ" }, "OwnerIQ": { "hosts": ["owneriq.net"], "id": "owneriq", "parent": "OwnerIQ" }, "Symantec (Norton Secured Seal)": { "hosts": ["norton.com", "symantec.com", "thawte.com", "verisign.com"], "id": "symantec", "parent": "Symantec" }, "myThings": { "hosts": ["mythings.com"], "id": "mythings", "parent": "MyThings " }, "maxonclick.com": { "hosts": ["maxonclick.com"], "id": "maxonclick_com", "parent": "Unknown" }, "AdRiver": { "hosts": ["adriver.ru"], "id": "adriver", "parent": "Ad River" }, "Digital Remedy": { "hosts": ["adready.com"], "id": "digital_remedy", "parent": "Digital Remedy" }, "Tumblr Buttons": { "hosts": ["platform.tumblr.com"], "id": "tumblr_buttons", "parent": "Verizon" }, "Shopping24 internet group": { "hosts": ["s24.com"], "id": "s24_com", "parent": "Unknown" }, "Riskfield": { "hosts": ["riskfield.com"], "id": "riskfield.com", "parent": "Riskfield" }, "Eyeview": { "hosts": ["eyeviewads.com"], "id": "eyeview", "parent": "Eyeview" }, "toponclick.com": { "hosts": ["toponclick.com"], "id": "toponclick_com", "parent": "Unknown" }, "ThreatMetrix": { "hosts": ["online-metrix.net"], "id": "threatmetrix", "parent": "ThreatMetrix" }, "Periscope": { "hosts": ["pscp.tv"], "id": "pscp.tv", "parent": "Periscope" }, "continum.net": { "hosts": ["continum.net"], "id": "continum_net", "parent": "Unknown" }, "Rambler DSP": { "hosts": ["dsp-rambler.ru"], "id": "dsp_rambler", "parent": "A&NN Investments " }, "DynAdmic": { "hosts": ["dyntrk.com"], "id": "dynadmic", "parent": "Unknown" }, "ADARA Analytics": { "hosts": ["yieldoptimizer.com"], "id": "adara_analytics", "parent": "ADARA MEDIA UNLIMITED" }, "Jetpack": { "hosts": ["pixel.wp.com", "stats.wp.com"], "id": "jetpack", "parent": "Automattic" }, "MarkMonitor": { "hosts": ["9c9media.com", "caanalytics.com", "mmstat.com"], "id": "markmonitor", "parent": "MarkMonitor" }, "Skyscanner CDN": { "hosts": ["skyscnr.com"], "id": "skyscnr.com", "parent": "Unknown" }, "stripst.com": { "hosts": ["stripst.com"], "id": "stripst.com", "parent": "Unknown" }, "Platform One": { "hosts": ["impact-ad.jp"], "id": "platformone", "parent": "D.A.Consortium" }, "baur.de": { "hosts": ["baur.de"], "id": "baur.de", "parent": "Unknown" }, "pushame.com": { "hosts": ["pushame.com"], "id": "pushame.com", "parent": "Unknown" }, "tororango.com": { "hosts": ["tororango.com"], "id": "tororango.com", "parent": "Unknown" }, "Conversant": { "hosts": ["fastclick.net", "mediaplex.com", "mplxtms.com"], "id": "conversant", "parent": "Conversant Europe Ltd." }, "Firebase": { "hosts": ["firebaseio.com"], "id": "firebaseio.com", "parent": "Google" }, "Whos.amung.us": { "hosts": ["amung.us"], "id": "whos.amung.us", "parent": "whos.amung.us" }, "Bombora": { "hosts": ["ml314.com"], "id": "bombora", "parent": "Bombora Inc." }, "SpringServe": { "hosts": ["springserve.com"], "id": "springserve", "parent": "SpringServe, LLC" }, "Widespace": { "hosts": ["widespace.com"], "id": "widespace", "parent": "Widespace AB" }, "Mail.Ru Group": { "hosts": ["imgsmail.ru", "mail.ru", "mradx.net", "odnoklassniki.ru", "ok.ru"], "id": "mail.ru_group", "parent": "Megafon" }, "Sojern": { "hosts": ["sojern.com"], "id": "sojern", "parent": "Sojern, Inc." }, "Seznam": { "hosts": ["imedia.cz", "szn.cz"], "id": "seznam", "parent": "Seznam" }, "Privy": { "hosts": ["privy.com"], "id": "privy.com", "parent": "Privy" }, "Tawk": { "hosts": ["tawk.to"], "id": "tawk", "parent": "Tawk" }, "Ask.com": { "hosts": ["ask.com"], "id": "ask.com", "parent": "Unknown" }, "Intent IQ": { "hosts": ["intentiq.com"], "id": "intent_iq", "parent": "Intent IQ" }, "Yahoo!": { "hosts": ["interclick.com", "tumblr.com", "yahoo.com", "yahooapis.com", "yimg.com"], "id": "yahoo", "parent": "Verizon" }, "trsv3.com": { "hosts": ["trsv3.com"], "id": "trsv3.com", "parent": "Unknown" }, "GreatViews": { "hosts": ["greatviews.de"], "id": "greatviews.de", "parent": "Parship" }, "C1 Exchange": { "hosts": ["c1exchange.com"], "id": "c1_exchange", "parent": "C1 Exchange " }, "VoiceFive": { "hosts": ["voicefive.com"], "id": "voicefive", "parent": "comScore, Inc." }, "qq.com": { "hosts": ["qq.com"], "id": "qq.com", "parent": "QQ.com" }, "native ads": { "hosts": ["nativeads.com"], "id": "nativeads.com", "parent": "Unknown" }, "Teads": { "hosts": ["teads.tv"], "id": "teads", "parent": "Teads " }, "dcbap.com": { "hosts": ["dcbap.com"], "id": "dcbap.com", "parent": "Unknown" }, "Oxomi": { "hosts": ["oxomi.com"], "id": "oxomi.com", "parent": "Unknown" }, "Ancestry CDN": { "hosts": ["ancestrycdn.com"], "id": "ancestry_cdn", "parent": "Ancestry" }, "BuySellAds": { "hosts": ["buysellads.com", "servedby-buysellads.com"], "id": "buysellads", "parent": "BuySellAds.com" }, "office365.com": { "hosts": ["office365.com"], "id": "office365.com", "parent": "Microsoft" }, "Digital Analytix": { "hosts": ["nedstat.com", "sitestat.com"], "id": "digital_analytix", "parent": "Adobe" }, "Microsoft Network": { "hosts": ["ads.msn.com", "ads1.msn.com", "adsyndication.msn.com", "bat.r.msn.com", "col.stc.s-msn.com", "flex.msn.com", "msn.com", "s-msn.com"], "id": "msn", "parent": "Microsoft" }, "Atlassian Marketplace": { "hosts": ["d1xfq2052q7thw.cloudfront.net", "marketplace.atlassian.com"], "id": "atlassian_marketplace", "parent": "Atlassian" }, "Infospace Search": { "hosts": ["inspsearchapi.com"], "id": "inspsearchapi.com", "parent": "System1" }, "Reuters media": { "hosts": ["reutersmedia.net"], "id": "reuters_media", "parent": "Unknown" }, "SOASTA mPulse": { "hosts": ["go-mpulse.net", "mpstat.us"], "id": "soasta_mpulse", "parent": "Akamai Technologies" }, "Intercom": { "hosts": ["intercom.io", "intercomassets.com", "intercomcdn.com"], "id": "intercom", "parent": "Intercom" }, "1822direkt.de": { "hosts": ["1822direkt.de"], "id": "1822direkt.de", "parent": "Unknown" }, "BurdaForward": { "hosts": ["bf-ad.net", "bf-tools.net"], "id": "burda", "parent": "Hubert Burda Media" }, "ClickTripz": { "hosts": ["clicktripz.com"], "id": "clicktripz", "parent": "ClickTripz" }, "ad6media": { "hosts": ["ad6.fr", "ad6media.co.uk", "ad6media.com", "ad6media.es", "ad6media.fr"], "id": "ad6media", "parent": "ad6media" }, "Swiftype": { "hosts": ["swiftypecdn.com"], "id": "swiftype", "parent": "Elastic" }, "Advertising Technologies Ltd": { "hosts": ["rtmark.net"], "id": "rtmark.net", "parent": "Big Wall Vision" }, "Sanoma": { "hosts": ["ilsemedia.nl", "sanoma.fi"], "id": "sanoma.fi", "parent": "Unknown" }, "Hotjar": { "hosts": ["hotjar.com"], "id": "hotjar", "parent": "Hotjar" }, "GENIEE": { "hosts": ["gssprt.jp"], "id": "geniee", "parent": "Unknown" }, "Imagefap": { "hosts": ["fap.to"], "id": "fap.to", "parent": "Unknown" }, "go.com": { "hosts": ["go.com"], "id": "go.com", "parent": "The Walt Disney Company" }, "Btttag": { "hosts": ["bluetriangletech.com"], "id": "btttag.com", "parent": "Blue Triangle Technologies Inc" }, "Republer": { "hosts": ["republer.com"], "id": "republer.com", "parent": "Republer" }, "Netbiscuits": { "hosts": ["netbiscuits.net"], "id": "netbiscuits", "parent": "Netbiscuits" }, "Deutsche Bahn": { "hosts": ["bahn.de", "img-bahn.de"], "id": "bahn_de", "parent": "Unknown" }, "pendo": { "hosts": ["pendo.io"], "id": "pendo.io", "parent": "Unknown" }, "Atlas": { "hosts": ["adbureau.net", "atdmt.com", "atlassbx.com"], "id": "atlas", "parent": "Facebook" }, "Experian": { "hosts": ["eccmp.com"], "id": "experian", "parent": "Experian Information Solutions, Inc." }, "The Sun": { "hosts": ["thesun.co.uk"], "id": "the_sun", "parent": "The Sun" }, "epoq": { "hosts": ["epoq.de"], "id": "epoq", "parent": "epoq" }, "Grapeshot": { "hosts": ["grapeshot.co.uk", "gscontxt.net"], "id": "grapeshot", "parent": "Oracle" }, "Ad Alliance": { "hosts": ["adalliance.io"], "id": "adalliance.io", "parent": "Unknown" }, "Digilant": { "hosts": ["wtp101.com"], "id": "digilant", "parent": "Digilant Spain, SLU" }, "Dotomi": { "hosts": ["dotomi.com", "dtmc.com", "dtmpub.com"], "id": "dotomi", "parent": "Conversant Europe Ltd." }, "ExoClick": { "hosts": ["exdynsrv.com", "exoclick.com", "exosrv.com"], "id": "exoclick", "parent": "ExoClick" }, "Quisma": { "hosts": ["qservz.com", "quisma.com"], "id": "quisma", "parent": "Quisma" }, "videoplayerhub.com": { "hosts": ["videoplayerhub.com"], "id": "videoplayerhub.com", "parent": "Unknown" }, "Vendemore": { "hosts": ["vendemore.com"], "id": "vendemore", "parent": "Ratos" }, "New Relic": { "hosts": ["d1ros97qkrwjf5.cloudfront.net", "newrelic.com", "nr-data.net"], "id": "new_relic", "parent": "New Relic" }, "Tradelab": { "hosts": ["tradelab.fr"], "id": "tradelab", "parent": "Tradelab, SAS" }, "Typeform": { "hosts": ["typeform.com"], "id": "typeform", "parent": "Unknown" }, "VIVALU": { "hosts": ["vi-tag.net"], "id": "vivalu", "parent": "Vivalu" }, "Skype": { "hosts": ["skype.com", "skypeassets.com"], "id": "skype", "parent": "Microsoft" }, "pmddby.com": { "hosts": ["pmddby.com"], "id": "pmddby.com", "parent": "Unknown" }, "FeedBurner": { "hosts": ["feedburner.com"], "id": "feedburner.com", "parent": "Google" }, "circIT": { "hosts": ["iqcontentplatform.de"], "id": "circit", "parent": "Unknown" }, "Heatmap": { "hosts": ["heatmap.it"], "id": "heatmap", "parent": "Heatmap" }, "Rocket Fuel": { "hosts": ["rfihub.com", "rfihub.net", "ru4.com", "xplusone.com"], "id": "rocket_fuel", "parent": "Sizmek Technologies, Inc. " }, "Semantiqo": { "hosts": ["semantiqo.com"], "id": "semantiqo.com", "parent": "Unknown" }, "ActStream": { "hosts": ["acestream.net"], "id": "acestream.net", "parent": "Unknown" }, "Amazon CDN": { "hosts": ["images-amazon.com", "media-amazon.com", "ssl-images-amazon.com"], "id": "amazon_cdn", "parent": "Amazon" }, "buzzadexchange.com": { "hosts": ["buzzadexchange.com"], "id": "buzzadexchange.com", "parent": "Unknown" }, "Linkpulse": { "hosts": ["lp4.io"], "id": "linkpulse", "parent": "Linkpulse" }, "highwebmedia.com": { "hosts": ["highwebmedia.com"], "id": "highwebmedia.com", "parent": "Unknown" }, "Metrigo": { "hosts": ["metrigo.com"], "id": "metrigo", "parent": "Metrigo" }, "Arc Publishing": { "hosts": ["arcpublishing.com"], "id": "arcpublishing", "parent": "Unknown" }, "Adotmob": { "hosts": ["adotmob.com"], "id": "adotmob.com", "parent": "A.Mob" }, "OptinMonster": { "hosts": ["mstrlytcs.com", "optmnstr.com", "optmstr.com", "optnmstr.com"], "id": "optinmonster", "parent": "OptinMonster" }, "Acxiom": { "hosts": ["acxiom.com"], "id": "acxiom", "parent": "Acxiom" }, "Shareaholic": { "hosts": ["dtym7iokkjlif.cloudfront.net", "shareaholic.com"], "id": "shareaholic", "parent": "Shareaholic" }, "eshopcomp.com": { "hosts": ["eshopcomp.com"], "id": "eshopcomp.com", "parent": "Unknown" }, "blogsmithmedia.com": { "hosts": ["blogsmithmedia.com"], "id": "blogsmithmedia.com", "parent": "Verizon" }, "pcvark.com": { "hosts": ["pcvark.com"], "id": "pcvark.com", "parent": "Unknown" }, "Bauer Media": { "hosts": ["bauernative.com"], "id": "bauer_media", "parent": "Bauer Media" }, "Amazon Web Services": { "hosts": ["amazonaws.com", "amazonwebservices.com", "awsstatic.com"], "id": "amazon_web_services", "parent": "Amazon" }, "CNBC": { "hosts": ["cnbc.com"], "id": "cnbc", "parent": "NBCUniversal, LLC" }, "Oath, Inc.": { "hosts": ["oath.com"], "id": "oath_inc", "parent": "Verizon" }, "AMP Project": { "hosts": ["ampproject.org"], "id": "ampproject.org", "parent": "Google" }, "News Connect": { "hosts": ["newscgp.com"], "id": "newscgp.com", "parent": "News Corp" }, "Rakuten Display": { "hosts": ["mediaforge.com", "rmtag.com"], "id": "rakuten_display", "parent": "Rakuten Marketing LLC" }, "Olark": { "hosts": ["olark.com"], "id": "olark", "parent": "Olark" }, "Seeding Alliance": { "hosts": ["nativendo.de"], "id": "seeding_alliance", "parent": "Str\u00f6er SSP GmbH" }, "Decibel Insight": { "hosts": ["decibelinsight.net"], "id": "decibel_insight", "parent": "Decibel Insight" }, "Twyn": { "hosts": ["twyn.com"], "id": "twyn", "parent": "Twyn" }, "Cookiebot": { "hosts": ["cookiebot.com"], "id": "cookiebot", "parent": "Unknown" }, "FullStory": { "hosts": ["fullstory.com"], "id": "fullstory", "parent": "fullstory" }, "adworx": { "hosts": ["adworx.at"], "id": "adworx.at", "parent": "Unknown" }, "trbo": { "hosts": ["trbo.com"], "id": "trbo", "parent": "trbo" }, "CrossEngage": { "hosts": ["crossengage.io"], "id": "crossengage", "parent": "CrossEngage" }, "t8cdn.com": { "hosts": ["t8cdn.com"], "id": "t8cdn.com", "parent": "Unknown" }, "Alipay": { "hosts": ["alipay.com"], "id": "alipay.com", "parent": "Alibaba" }, "Gannett Media": { "hosts": ["gannett-cdn.com"], "id": "gannett", "parent": "Unknown" }, "Acint": { "hosts": ["acint.net"], "id": "acint.net", "parent": "Acint" }, "LivePerson": { "hosts": ["liveperson.net", "lpsnmedia.net"], "id": "liveperson", "parent": "LivePerson" }, "GetIntent": { "hosts": ["adhigh.net"], "id": "getintent", "parent": "GetIntent" }, "Clever Push": { "hosts": ["cleverpush.com"], "id": "clever_push", "parent": "Clever Push" }, "Getty Images": { "hosts": ["gettyimages.com"], "id": "gettyimages", "parent": "Unknown" }, "iRobinHood": { "hosts": ["donation-tools.org"], "id": "donationtools", "parent": "Unknown" }, "Profitshare": { "hosts": ["profitshare.ro"], "id": "profitshare", "parent": "Unknown" }, "Performio.cz": { "hosts": ["performax.cz"], "id": "performio", "parent": "Unknown" }, "Pushcrew": { "hosts": ["pushcrew.com"], "id": "pushcrew", "parent": "Pushcrew" }, "Media.net": { "hosts": ["media.net"], "id": "media.net", "parent": "Media.net Advertising FZ-LLC" }, "Kaspersky Labs": { "hosts": ["kaspersky-labs.com"], "id": "kaspersky-labs.com", "parent": "Kaspersky Lab" }, "Yandex AdExchange": { "hosts": ["yandexadexchange.net"], "id": "yandex_adexchange", "parent": "Yandex" }, "Amobee": { "hosts": ["ad.amgdgt.com", "ads.amgdgt.com"], "id": "amobee", "parent": "Singtel" }, "glotgrx.com": { "hosts": ["glotgrx.com"], "id": "glotgrx.com", "parent": "Unknown" }, "Walmart": { "hosts": ["walmart.com"], "id": "walmart", "parent": "Unknown" }, "marshadow.io": { "hosts": ["marshadow.io"], "id": "marshadow.io", "parent": "Unknown" }, "Rambler&Co": { "hosts": ["rambler.ru", "top100.ru"], "id": "rambler", "parent": "A&NN Investments " }, "EQS Group": { "hosts": ["equitystory.com"], "id": "eqs_group", "parent": "EQS Group" }, "Dailymotion Advertising": { "hosts": ["dmxleo.com"], "id": "dailymotion_advertising", "parent": "Vivendi" }, "Fit Analytics": { "hosts": ["fitanalytics.com"], "id": "fit_analytics", "parent": "Fit Analytics" }, "Sentifi": { "hosts": ["sentifi.com"], "id": "sentifi.com", "parent": "Sentifi AG" }, "Mercado-Analytics": { "hosts": ["mercadoclics.com", "mlstatic.com"], "id": "mercado", "parent": "Unknown" }, "McAfee Secure": { "hosts": ["scanalert.com", "ywxi.net"], "id": "mcafee_secure", "parent": "McAfee" }, "Google": { "hosts": ["google.at", "google.be", "google.ca", "google.ch", "google.co.id", "google.co.in", "google.co.jp", "google.co.ma", "google.co.th", "google.co.uk", "google.com", "google.com.ar", "google.com.au", "google.com.br", "google.com.mx", "google.com.tr", "google.com.tw", "google.com.ua", "google.cz", "google.de", "google.dk", "google.dz", "google.es", "google.fi", "google.fr", "google.gr", "google.hu", "google.ie", "google.it", "google.nl", "google.no", "google.pl", "google.pt", "google.ro", "google.rs", "google.ru", "google.se", "google.tn"], "id": "google", "parent": "Google" }, "Foresee": { "hosts": ["foresee.com"], "id": "foresee", "parent": "Answers.com" }, "OTM": { "hosts": ["otm-r.com"], "id": "otm-r.com", "parent": "Unknown" }, "Discord": { "hosts": ["discordapp.com"], "id": "discord", "parent": "Unknown" }, "KataWeb": { "hosts": ["kataweb.it"], "id": "kataweb.it", "parent": "Unknown" }, "Openload": { "hosts": ["oloadcdn.net", "openload.co"], "id": "openload", "parent": "Unknown" }, "Nugg.Ad": { "hosts": ["nuggad.net"], "id": "nugg.ad", "parent": "Nugg.ad" }, "Marin Search Marketer": { "hosts": ["marinsm.com"], "id": "marin_search_marketer", "parent": "Marin Software" }, "hoholikik.club": { "hosts": ["hoholikik.club"], "id": "hoholikik.club", "parent": "Unknown" }, "AdsKeeper": { "hosts": ["adskeeper.co.uk"], "id": "adskeeper", "parent": "Adskeeper" }, "MaxMind": { "hosts": ["maxmind.com"], "id": "maxmind", "parent": "MaxMind" }, "Criteo": { "hosts": ["criteo.com", "criteo.net"], "id": "criteo", "parent": "Criteo S.A." }, "Sekindo": { "hosts": ["sekindo.com"], "id": "sekindo", "parent": "SekiNdo" }, "aftv-serving.bid": { "hosts": ["aftv-serving.bid"], "id": "aftv-serving.bid", "parent": "Unknown" }, "cqq5id8n.com": { "hosts": ["cqq5id8n.com"], "id": "cqq5id8n.com", "parent": "Unknown" }, "DCMN": { "hosts": ["dcmn.com"], "id": "dcmn.com", "parent": "Unknown" }, "Quora": { "hosts": ["quora.com"], "id": "quora.com", "parent": "Unknown" }, "GlobalSign": { "hosts": ["globalsign.com"], "id": "globalsign", "parent": "Unknown" }, "DoubleClick": { "hosts": ["2mdn.net", "doubleclick.net", "invitemedia.com"], "id": "doubleclick", "parent": "Google" }, "ard.de": { "hosts": ["ard.de"], "id": "ard.de", "parent": "Unknown" }, "Semasio": { "hosts": ["semasio.net"], "id": "semasio", "parent": "Semasio GmbH" }, "div.show": { "hosts": ["div.show"], "id": "div.show", "parent": "Unknown" }, "Undertone": { "hosts": ["ads.undertone.com"], "id": "undertone", "parent": "Perion" }, "reEmbed": { "hosts": ["reembed.com"], "id": "reembed.com", "parent": "reEmbed" }, "Vindico Group": { "hosts": ["vindicosuite.com"], "id": "vindico_group", "parent": "Vindico Group" }, "Histats": { "hosts": ["histats.com"], "id": "histats", "parent": "Histats" }, "popIn": { "hosts": ["popin.cc"], "id": "popin.cc", "parent": "Unknown" }, "Innovid": { "hosts": ["innovid.com"], "id": "innovid", "parent": "Innovid" }, "MathJax": { "hosts": ["mathjax.org"], "id": "mathjax.org", "parent": "Unknown" }, "Sina CDN": { "hosts": ["sinaimg.cn"], "id": "sina_cdn", "parent": "Unknown" }, "iPromote": { "hosts": ["ipromote.com"], "id": "ipromote", "parent": "iPromote" }, "Merkle RKG": { "hosts": ["rkdms.com"], "id": "merkle_rkg", "parent": "Dentsu Aegis Network" }, "Tail": { "hosts": ["tailtarget.com"], "id": "tail_target", "parent": "Tail" }, "Advertising.com": { "hosts": ["adsdk.com", "advertising.com", "aol.com", "atwola.com", "pictela.net"], "id": "advertising.com", "parent": "Verizon" }, "eProof": { "hosts": ["eproof.com"], "id": "eproof", "parent": "Unknown" }, "Quantum Metric": { "hosts": ["quantummetric.com"], "id": "quantum_metric", "parent": "Quantum Metric, Inc." }, "DC StormIQ": { "hosts": ["dc-storm.com", "h4k5.com", "stormcontainertag.com", "stormiq.com"], "id": "dc_stormiq", "parent": "DC Storm" }, "Akanoo": { "hosts": ["akanoo.com"], "id": "akanoo", "parent": "Akanoo" }, "Digital Window": { "hosts": ["dwin1.com"], "id": "digital_window", "parent": "Axel Springer Group" }, "Flipboard": { "hosts": ["lflipboard.com"], "id": "flipboard", "parent": "Flipboard" }, "xnxx CDN": { "hosts": ["xnxx-cdn.com"], "id": "xnxx_cdn", "parent": "Unknown" }, "Push.world": { "hosts": ["push.world"], "id": "push.world", "parent": "Push.world" }, "pvclouds.com": { "hosts": ["pvclouds.com"], "id": "pvclouds.com", "parent": "Unknown" }, "Chaordic": { "hosts": ["chaordicsystems.com"], "id": "chaordic", "parent": "Unknown" }, "Ionic": { "hosts": ["ionicframework.com"], "id": "ionicframework.com", "parent": "Unknown" }, "Delta Projects": { "hosts": ["adaction.se", "de17a.com"], "id": "delta_projects", "parent": "Delta Projects AB" }, "Cardlytics": { "hosts": ["cardlytics.com"], "id": "cardlytics", "parent": "Unknown" }, "stripchat.com": { "hosts": ["stripcdn.com", "stripchat.com"], "id": "stripchat.com", "parent": "Unknown" }, "NetRatings SiteCensus": { "hosts": ["glanceguide.com", "imrworldwide.com", "vizu.com"], "id": "netratings_sitecensus", "parent": "Nielsen" }, "Adform": { "hosts": ["adform.net", "adformdsp.net", "seadform.net"], "id": "adform", "parent": "Adform A/S" }, "ATG Ad Tech Group": { "hosts": ["oadts.com"], "id": "atg_group", "parent": "Unknown" }, "AdLabs": { "hosts": ["adlabs.ru", "clickiocdn.com", "luxup.ru", "mixmarket.biz"], "id": "adlabs", "parent": "Unknown" }, "icuazeczpeoohx.com": { "hosts": ["icuazeczpeoohx.com"], "id": "icuazeczpeoohx.com", "parent": "Unknown" }, "nyacampwk.com": { "hosts": ["nyacampwk.com"], "id": "nyacampwk.com", "parent": "Unknown" }, "sparkasse.de": { "hosts": ["sparkasse.de"], "id": "sparkasse.de", "parent": "Unknown" }, "sexypartners.net": { "hosts": ["sexypartners.net"], "id": "sexypartners.net", "parent": "Unknown" }, "Bluelithium": { "hosts": ["adrevolver.com", "bluelithium.com"], "id": "bluelithium", "parent": "Verizon" }, "Visible Measures": { "hosts": ["viewablemedia.net", "visiblemeasures.com"], "id": "visible_measures", "parent": "Visible Measures" }, "The Guardian": { "hosts": ["gu-web.net", "guardianapps.co.uk", "guim.co.uk"], "id": "the_guardian", "parent": "The Guardian" }, "Yandex.Advisor": { "hosts": ["metabar.ru"], "id": "yandex_advisor", "parent": "Yandex" }, "GitHub": { "hosts": ["github.com", "githubassets.com", "githubusercontent.com"], "id": "github", "parent": "GitHub, Inc." }, "RTL Group": { "hosts": ["rtl.de", "static-fra.de", "technical-service.net"], "id": "rtl_group", "parent": "Unknown" }, "lyuoaxruaqdo.com": { "hosts": ["lyuoaxruaqdo.com"], "id": "lyuoaxruaqdo.com", "parent": "Unknown" }, "Bitly": { "hosts": ["bit.ly"], "id": "bitly", "parent": "Unknown" }, "Strossle": { "hosts": ["sprinklecontent.com", "strossle.it"], "id": "strossle", "parent": "Strossle" }, "Scarab Research": { "hosts": ["scarabresearch.com"], "id": "scarabresearch", "parent": "Emarsys" }, "Proper Media": { "hosts": ["proper.io"], "id": "propermedia", "parent": "Proper Media" }, "Quantcast": { "hosts": ["quantcast.com", "quantserve.com"], "id": "quantcast", "parent": "Quantcast International Limited" }, "uuidksinc.net": { "hosts": ["uuidksinc.net"], "id": "uuidksinc.net", "parent": "Unknown" }, "Realytics": { "hosts": ["dcniko1cv0rz.cloudfront.net"], "id": "realytics", "parent": "Realytics" }, "uCoz": { "hosts": ["ucoz.net"], "id": "ucoz.net", "parent": "Unknown" }, "Giphy": { "hosts": ["giphy.com"], "id": "giphy.com", "parent": "Unknown" }, "IPG Mediabrands": { "hosts": ["mbww.com"], "id": "ipg_mediabrands", "parent": "IPG Mediabrands" }, "Adobe Dynamic Tag Management": { "hosts": ["adobedtm.com"], "id": "adobe_dynamic_tag_management", "parent": "Adobe" }, "PowerLinks": { "hosts": ["powerlinks.com"], "id": "powerlinks", "parent": "PowerLinks" }, "office.net": { "hosts": ["office.net"], "id": "office.net", "parent": "Microsoft" }, "cXense": { "hosts": ["cxense.com"], "id": "cxense", "parent": "Cxense ASA" }, "Adify": { "hosts": ["afy11.net"], "id": "adify", "parent": "Cox Enterprises" }, "Spot.IM": { "hosts": ["spot.im"], "id": "spot.im", "parent": "Spot.IM Ltd." }, "Mediarithmics": { "hosts": ["mediarithmics.com"], "id": "mediarithmics.com", "parent": "mediarithmics SAS" }, "Prebid": { "hosts": ["prebid.org"], "id": "prebid", "parent": "Unknown" }, "lenmit.com": { "hosts": ["lenmit.com"], "id": "lenmit.com", "parent": "Unknown" }, "xplosion": { "hosts": ["xplosion.de"], "id": "xplosion", "parent": "xplosion interactive" }, "Webtrends": { "hosts": ["webtrends.com", "webtrendslive.com"], "id": "webtrends", "parent": "Webtrends" }, "imonomy": { "hosts": ["imonomy.com"], "id": "imonomy", "parent": "imonomy" }, "RCS": { "hosts": ["rcsmediagroup.it"], "id": "rcs.it", "parent": "RCS MediaGroup S.p.A. \u0003" }, "ComScore, Inc.": { "hosts": ["zqtk.net"], "id": "comscore", "parent": "comScore, Inc." }, "o2online.de": { "hosts": ["o2online.de"], "id": "o2online.de", "parent": "Unknown" }, "Cackle": { "hosts": ["cackle.me"], "id": "cackle.me", "parent": "Unknown" }, "deviantart.net": { "hosts": ["dapxl.com", "deviantart.net"], "id": "deviantart.net", "parent": "Unknown" }, "OWA": { "hosts": ["oewabox.at"], "id": "owa", "parent": "The Austrian Web Analysis (OWA)" }, "Yieldlab": { "hosts": ["yieldlab.net"], "id": "yieldlab", "parent": "ProSiebenSat.1 Media" }, "Zmags": { "hosts": ["zmags.com"], "id": "zmags", "parent": "The Gores Group" }, "Sortable": { "hosts": ["deployads.com"], "id": "sortable", "parent": "Unknown" }, "TRUSTe Seal": { "hosts": ["privacy-policy.truste.com"], "id": "truste_seal", "parent": "TrustArc" }, "Adjust": { "hosts": ["adjust.com"], "id": "adjust", "parent": "Adjust GmbH" }, "srvvtrk.com": { "hosts": ["srvvtrk.com"], "id": "srvvtrk.com", "parent": "Unknown" }, "StickyAds": { "hosts": ["stickyadstv.com"], "id": "stickyads", "parent": "Comcast" }, "SimilarDeals": { "hosts": ["similardeals.net"], "id": "similardeals.net", "parent": "Unknown" }, "affilinet": { "hosts": ["banner-rotation.com", "webmasterplan.com"], "id": "affilinet", "parent": "Axel Springer Group" }, "Convertro": { "hosts": ["convertro.com", "d1ivexoxmp59q7.cloudfront.net"], "id": "convertro", "parent": "Verizon" }, "De Persgroep": { "hosts": ["persgroep.net"], "id": "persgroep", "parent": "Unknown" }, "Answers Cloud Service": { "hosts": ["answerscloud.com"], "id": "answers_cloud_service", "parent": "Answers.com" }, "Oracle Maxymiser": { "hosts": ["maxymiser.net"], "id": "maxymiser", "parent": "Oracle" }, "The New York Times": { "hosts": ["nyt.com"], "id": "nyt.com", "parent": "The New York Times Company" }, "Vidazoo": { "hosts": ["vidazoo.com"], "id": "vidazoo.com", "parent": "Unknown" }, "Brightcove Player": { "hosts": ["brightcove.net"], "id": "brightcove_player", "parent": "Brightcove" }, "sovrn": { "hosts": ["d3pkae9owd2lcf.cloudfront.net", "lijit.com"], "id": "sovrn", "parent": "Sovrn Holdings Inc" }, "pageanalytics.space": { "hosts": ["pageanalytics.space"], "id": "pageanalytics.space", "parent": "Unknown" }, "office.com": { "hosts": ["office.com"], "id": "office.com", "parent": "Microsoft" }, "Sift Science": { "hosts": ["dtlilztwypawv.cloudfront.net", "siftscience.com"], "id": "sift_science", "parent": "Sift Science" }, "hotdogsandads.com": { "hosts": ["hotdogsandads.com"], "id": "hotdogsandads.com", "parent": "Unknown" }, "Reevoo": { "hosts": ["reevoo.com"], "id": "reevoo.com", "parent": "Reevoo" }, "OpenX": { "hosts": ["odnxs.net", "openx.net", "openx.org", "openxenterprise.com", "servedbyopenx.com"], "id": "openx", "parent": "OpenX Software Ltd." }, "Facebook Messenger": { "hosts": ["messenger.com"], "id": "messenger.com", "parent": "Facebook" }, "AdsBookie": { "hosts": ["adsbookie.com"], "id": "adsbookie", "parent": "Unknown" }, "deichmann.com": { "hosts": ["deichmann.com"], "id": "deichmann.com", "parent": "Unknown" }, "The ADEX": { "hosts": ["theadex.com"], "id": "the_adex", "parent": "ProSiebenSat.1 Media" }, "LiquidM Technology GmbH": { "hosts": ["lqm.io", "lqmcdn.com"], "id": "liquidm_technology_gmbh", "parent": "LiquidM Technology GmbH" }, "AdXpansion": { "hosts": ["adxpansion.com"], "id": "adxpansion", "parent": "AdXpansion" }, "Yieldlove": { "hosts": ["yieldlove-ad-serving.net", "yieldlove.com"], "id": "yieldlove", "parent": "Yieldlove GmbH" }, "Eyeota": { "hosts": ["eyeota.net"], "id": "eyeota", "parent": "Eyeota Ptd Ltd" }, "under-box.com": { "hosts": ["under-box.com"], "id": "under-box.com", "parent": "Unknown" }, "Flattr Button": { "hosts": ["flattr.com"], "id": "flattr_button", "parent": "Flattr" }, "dyncdn.me": { "hosts": ["dyncdn.me"], "id": "dyncdn.me", "parent": "Unknown" }, "Wikia Services": { "hosts": ["wikia-services.com"], "id": "wikia-services.com", "parent": "Wikia" }, "IHS Markit": { "hosts": ["ad.wsod.com"], "id": "ihs_markit", "parent": "IHS" }, "Fluct": { "hosts": ["adingo.jp"], "id": "fluct", "parent": "Unknown" }, "uppr GmbH": { "hosts": ["uppr.de"], "id": "uppr.de", "parent": "Unknown" }, "FastPic": { "hosts": ["fastpic.ru"], "id": "fastpic.ru", "parent": "FastPic" }, "Honey": { "hosts": ["joinhoney.com"], "id": "joinhoney", "parent": "Unknown" }, "SundaySky": { "hosts": ["sundaysky.com"], "id": "sundaysky", "parent": "SundaySky" }, "YuMe": { "hosts": ["yume.com"], "id": "yume", "parent": "Unknown" }, "Connextra": { "hosts": ["connextra.com"], "id": "connextra", "parent": "Connextra" }, "adsnative": { "hosts": ["adsnative.com"], "id": "adsnative", "parent": "AdsNative" }, "CivicScience": { "hosts": ["civicscience.com"], "id": "civicscience.com", "parent": "Unknown" }, "SEMKNOX GmbH": { "hosts": ["semknox.com"], "id": "semknox.com", "parent": "Unknown" }, "SALESmanago": { "hosts": ["salesmanago.com"], "id": "salesmanago.pl", "parent": "SALESmanago" }, "sixt-neuwagen.de": { "hosts": ["sixt-neuwagen.de"], "id": "sixt-neuwagen.de", "parent": "Unknown" }, "Adkontekst": { "hosts": ["netsprint.eu"], "id": "adkontekst.pl", "parent": "Netsprint SA" }, "clearsale": { "hosts": ["clearsale.com.br"], "id": "clearsale", "parent": "Unknown" }, "ScribbleLive": { "hosts": ["scribblelive.com"], "id": "scribblelive", "parent": "Unknown" }, "Adtelligence": { "hosts": ["adtelligence.de"], "id": "adtelligence.de", "parent": "Unknown" }, "Runative": { "hosts": ["un-syndicate.com"], "id": "runative", "parent": "Unknown" }, "SexAdNetwork": { "hosts": ["sexad.net"], "id": "sexadnetwork", "parent": "SexAdNetwork" }, "DataMind": { "hosts": ["datamind.ru"], "id": "datamind.ru", "parent": "Unknown" }, "Omarsys": { "hosts": ["omarsys.com"], "id": "omarsys.com", "parent": "XCaliber" }, "Art.Lebedev": { "hosts": ["artlebedev.ru"], "id": "artlebedev.ru", "parent": "Art.Lebedev Studio" }, "relevant4 GmbH": { "hosts": ["relevant4.com"], "id": "relevant4.com", "parent": "Unknown" }, "Inspectlet": { "hosts": ["inspectlet.com"], "id": "inspectlet", "parent": "Inspectlet" }, "Retail Rocket": { "hosts": ["retailrocket.net", "retailrocket.ru"], "id": "retailrocket.net", "parent": "Unknown" }, "ZypMedia": { "hosts": ["extend.tv"], "id": "zypmedia", "parent": "Unknown" }, "jsuol.com.br": { "hosts": ["jsuol.com.br"], "id": "jsuol.com.br", "parent": "Unknown" }, "UserVoice": { "hosts": ["uservoice.com"], "id": "uservoice", "parent": "UserVoice" }, "txxx.com": { "hosts": ["txxx.com"], "id": "txxx.com", "parent": "Unknown" }, "Prisma Media Digital": { "hosts": ["pmdrecrute.com"], "id": "prismamediadigital.com", "parent": "Prisma Media Digital" }, "Cloudimage.io": { "hosts": ["cloudimg.io"], "id": "cloudimage.io", "parent": "Scaleflex SAS" }, "Inbenta": { "hosts": ["inbenta.com"], "id": "inbenta", "parent": "Inbenta" }, "ClickTale": { "hosts": ["clicktale.com", "clicktale.net", "pantherssl.com"], "id": "clicktale", "parent": "ClickTale" }, "Amazon Associates": { "hosts": ["assoc-amazon.ca", "assoc-amazon.co.uk", "assoc-amazon.com", "assoc-amazon.de", "assoc-amazon.fr", "assoc-amazon.jp"], "id": "amazon_associates", "parent": "Amazon" }, "Amazon Adsystem": { "hosts": ["amazon-adsystem.com"], "id": "amazon_adsystem", "parent": "Amazon" }, "eBay Stats": { "hosts": ["classistatic.de", "ebay-us.com", "ebay.com", "ebay.de", "ebayclassifiedsgroup.com", "ebaycommercenetwork.com", "ebaydesc.com", "ebayimg.com", "ebayrtm.com", "ebaystatic.com"], "id": "ebay", "parent": "eBay" }, "Mediator": { "hosts": ["mediator.media"], "id": "mediator.media", "parent": "My.com B.V." }, "Twitter": { "hosts": ["ads-twitter.com", "t.co", "twimg.com", "twitter.com"], "id": "twitter", "parent": "Twitter" }, "tchibo.de": { "hosts": ["tchibo-content.de", "tchibo.de"], "id": "tchibo_de", "parent": "Unknown" }, "Mindspark": { "hosts": ["imgfarm.com", "mindspark.com", "staticimgfarm.com"], "id": "mindspark", "parent": "IAC (InterActiveCorp)" }, "SpotXchange": { "hosts": ["spotx.tv", "spotxcdn.com", "spotxchange.com"], "id": "spotxchange", "parent": "RTL Group" }, "chefkoch.de": { "hosts": ["chefkoch-cdn.de", "chefkoch.de"], "id": "chefkoch_de", "parent": "Unknown" }, "Perfect Audience": { "hosts": ["perfectaudience.com", "prfct.co"], "id": "perfect_audience", "parent": "Perfect Audience" }, "Metapeople": { "hosts": ["metalyzer.com", "mlsat02.de"], "id": "metapeople", "parent": "Metapeople" }, "runmewivel.com": { "hosts": ["runmewivel.com"], "id": "runmewivel.com", "parent": "Unknown" }, "Early Birds": { "hosts": ["early-birds.fr"], "id": "early_birds", "parent": "Unknown" }, "24metrics Fraudshield": { "hosts": ["fstrk.net"], "id": "fstrk.net", "parent": "24metrics" }, "velocecdn.com": { "hosts": ["velocecdn.com"], "id": "velocecdn.com", "parent": "Unknown" }, "Mediascope": { "hosts": ["tns-counter.ru"], "id": "mediascope", "parent": "Mediascope" }, "Dynamic Yield": { "hosts": ["dynamicyield.com"], "id": "dynamic_yield", "parent": "Unknown" }, "Heap": { "hosts": ["d36lvucg9kzous.cloudfront.net", "heapanalytics.com"], "id": "heap", "parent": "Heap" }, "Polar": { "hosts": ["mediavoice.com"], "id": "polar.me", "parent": "Polar Mobile Group Inc." }, "octapi.net": { "hosts": ["octapi.net"], "id": "octapi.net", "parent": "Unknown" }, "Neustar AdAdvisor": { "hosts": ["adadvisor.net"], "id": "neustar_adadvisor", "parent": "Neustar " }, "Bloomberg CDN": { "hosts": ["bwbx.io"], "id": "bwbx.io", "parent": "Unknown" }, "Tru Optik": { "hosts": ["truoptik.com"], "id": "truoptik", "parent": "Unknown" }, "LINE Apps": { "hosts": ["line-apps.com", "line-scdn.net", "line.me"], "id": "line_apps", "parent": "LINE Corporation" }, "Shopify CDN": { "hosts": ["shopifycdn.com"], "id": "shopifycdn.com", "parent": "Shopify" }, "tensitionschoo.club": { "hosts": ["tensitionschoo.club"], "id": "tensitionschoo.club", "parent": "Unknown" }, "Netflix": { "hosts": ["netflix.com", "nflxext.com", "nflximg.net", "nflxso.net", "nflxvideo.net"], "id": "netflix", "parent": "Unknown" }, "Acceptable Ads Exchange": { "hosts": ["aaxads.com"], "id": "aaxads.com", "parent": "Unknown" }, "Sentry": { "hosts": ["ravenjs.com", "sentry.io"], "id": "sentry", "parent": "Unknown" }, "Webedia": { "hosts": ["goutee.top", "mediaathay.org.uk", "wbdx.fr"], "id": "webedia", "parent": "Fimalac Group" }, "commercialvalue.org": { "hosts": ["commercialvalue.org"], "id": "commercialvalue.org", "parent": "Unknown" }, "CDN77": { "hosts": ["cdn77.com", "cdn77.org"], "id": "cdn77", "parent": "Unknown" }, "Live Intent": { "hosts": ["liadm.com"], "id": "live_intent", "parent": "Liveintent Inc." }, "BloomReach": { "hosts": ["brcdn.com", "brsrvr.com", "brtstats.com"], "id": "bloomreach", "parent": "BloomReach" }, "Gigya": { "hosts": ["gigya.com"], "id": "gigya", "parent": "Gigya" }, "Parsely": { "hosts": ["d1z2jf7jlzjs58.cloudfront.net", "parsely.com"], "id": "parsely", "parent": "Parse.ly" }, "Layer-ADS.net": { "hosts": ["layer-ad.org"], "id": "layer-ad.org", "parent": "Unknown" }, "BeamPulse": { "hosts": ["beampulse.com"], "id": "beampulse.com", "parent": "Unknown" }, "MediaV": { "hosts": ["mediav.com"], "id": "mediav", "parent": "Unknown" }, "Turner": { "hosts": ["turner.com"], "id": "turner", "parent": "Turner" }, "Ninja Access Analysis": { "hosts": ["cho-chin.com", "donburako.com", "hishaku.com", "shinobi.jp"], "id": "ninja_access_analysis", "parent": "Samurai Factory" }, "Treasure Data": { "hosts": ["treasuredata.com"], "id": "treasuredata", "parent": "arm" }, "Contentful GmbH": { "hosts": ["ctfassets.net"], "id": "contentful_gmbh", "parent": "Contentful GmbH" }, "Trusted Shops": { "hosts": ["trustedshops.com"], "id": "trusted_shops", "parent": "Trusted Shops" }, "wywy": { "hosts": ["wywy.com", "wywyuserservice.com"], "id": "wywy.com", "parent": "Unknown" }, "Steepto": { "hosts": ["steepto.com"], "id": "steepto.com", "parent": "Unknown" }, "Certona": { "hosts": ["certona.net", "res-x.com"], "id": "certona", "parent": "Certona (Resonance)" }, "Fox News CDN": { "hosts": ["fncstatic.com"], "id": "foxnews_static", "parent": "Fox News Network, LLC" }, "Userlike": { "hosts": ["dq4irj27fs462.cloudfront.net", "userlike-cdn-widgets.s3-eu-west-1.amazonaws.com", "userlike.com"], "id": "userlike.com", "parent": "Unknown" }, "Distroscale": { "hosts": ["jsrdn.com"], "id": "distroscale", "parent": "Unknown" }, "Optimonk": { "hosts": ["optimonk.com"], "id": "optimonk", "parent": "OptiMonk" }, "Ad Spirit": { "hosts": ["adspirit.de", "adspirit.net"], "id": "ad_spirit", "parent": "AdSpirit GmbH" }, "OneSignal": { "hosts": ["onesignal.com", "os.tc"], "id": "onesignal", "parent": "OneSignal" }, "Intelligent Reach": { "hosts": ["ist-track.com"], "id": "intelligent_reach", "parent": "Intelligent Reach" }, "Statuspage": { "hosts": ["statuspage.io"], "id": "statuspage.io", "parent": "Atlassian" }, "StatHat": { "hosts": ["stathat.com"], "id": "stathat", "parent": "Unknown" }, "o12zs3u2n.com": { "hosts": ["o12zs3u2n.com"], "id": "o12zs3u2n.com", "parent": "Unknown" }, "eXTReMe Tracker": { "hosts": ["extreme-dm.com"], "id": "extreme_tracker", "parent": "Extreme Digital" }, "SpeedCurve": { "hosts": ["speedcurve.com"], "id": "speedcurve", "parent": "Unknown" }, "Storygize": { "hosts": ["storygize.net"], "id": "storygize", "parent": "Unknown" }, "GitHub Apps": { "hosts": ["githubapp.com"], "id": "github_apps", "parent": "GitHub, Inc." }, "Auth0 Inc.": { "hosts": ["auth0.com"], "id": "auth0", "parent": "Auth0 Inc." }, "JuggCash": { "hosts": ["contentabc.com", "mofos.com"], "id": "juggcash", "parent": "JuggCash" }, "Connexity": { "hosts": ["connexity.net", "cxt.ms"], "id": "connexity", "parent": "Connexity" }, "StepStone": { "hosts": ["stepstone.com"], "id": "stepstone.com", "parent": "Unknown" }, "Polldaddy": { "hosts": ["polldaddy.com"], "id": "polldaddy", "parent": "Polldaddy" }, "Seedtag": { "hosts": ["seedtag.com"], "id": "seedtag.com", "parent": "Seedtag Advertising S.L" }, "InnoGames": { "hosts": ["innogames.com", "innogames.de", "innogamescdn.com"], "id": "innogames.de", "parent": "Unknown" }, "Bugsnag": { "hosts": ["bugsnag.com", "d2wy8f7a9ursnm.cloudfront.net"], "id": "bugsnag", "parent": "Bugsnag" }, "Advolution": { "hosts": ["advolution.de"], "id": "advolution", "parent": "Advolution" }, "Sourcepoint": { "hosts": ["decenthat.com", "summerhamster.com"], "id": "sourcepoint", "parent": "Unknown" }, "iAdvize": { "hosts": ["iadvize.com"], "id": "iadvize", "parent": "iAdvize" }, "Burda Digital Systems": { "hosts": ["bstatic.de"], "id": "burda_digital_systems", "parent": "Hubert Burda Media" }, "i-Behavior": { "hosts": ["ib-ibi.com"], "id": "i-behavior", "parent": "KBM Group" }, "Raygun": { "hosts": ["raygun.io"], "id": "raygun", "parent": "Raygun" }, "LiftIgniter": { "hosts": ["petametrics.com"], "id": "petametrics", "parent": "Unknown" }, "ACPM": { "hosts": ["acpm.fr"], "id": "acpm.fr", "parent": "Unknown" }, "IBM Customer Experience": { "hosts": ["cmcore.com", "coremetrics.com"], "id": "ibm_customer_experience", "parent": "IBM" }, "doofinder": { "hosts": ["doofinder.com"], "id": "doofinder.com", "parent": "Unknown" }, "Sumologic": { "hosts": ["sumologic.com"], "id": "sumologic.com", "parent": "Unknown" }, "Twitch CDN": { "hosts": ["jtvnw.net", "ttvnw.net", "twitchcdn.net", "twitchsvc.net"], "id": "twitch_cdn", "parent": "Amazon" }, "esprit.de": { "hosts": ["esprit.de"], "id": "esprit.de", "parent": "Unknown" }, "Improve Digital": { "hosts": ["360yield.com"], "id": "improve_digital", "parent": "Improve Digital International BV" }, "eKomi": { "hosts": ["ekomi.de"], "id": "ekomi", "parent": "eKomi" }, "Mailerlite": { "hosts": ["mailerlite.com"], "id": "mailerlite.com", "parent": "MailerLite" }, "Xing": { "hosts": ["xing-share.com", "xing.com"], "id": "xing", "parent": "XING" }, "Shopping.com": { "hosts": ["shoppingshadow.com"], "id": "shopping_com", "parent": "eBay" }, "Adap.tv": { "hosts": ["adap.tv"], "id": "adap.tv", "parent": "Verizon" }, "Ad Lightning": { "hosts": ["adlightning.com"], "id": "ad_lightning", "parent": "Ad Lightning" }, "Sizmek": { "hosts": ["serving-sys.com"], "id": "sizmek", "parent": "Sizmek Technologies, Inc. " }, "pub.network": { "hosts": ["pub.network"], "id": "pub.network", "parent": "Unknown" }, "EMS Mobile": { "hosts": ["emsmobile.de"], "id": "emsmobile.de", "parent": "Unknown" }, "Tremor Video": { "hosts": ["tremorhub.com", "tremorvideo.com", "videohub.tv"], "id": "tremor_video", "parent": "Unknown" }, "The Weather Company": { "hosts": ["w-x.co", "weather.com", "wfxtriggers.com"], "id": "the_weather_company", "parent": "IBM" }, "Atlassian": { "hosts": ["atl-paas.net", "atlassian.com", "atlassian.net", "d12ramskps3070.cloudfront.net"], "id": "atlassian.net", "parent": "Atlassian" }, "camakaroda.com": { "hosts": ["camakaroda.com"], "id": "camakaroda.com", "parent": "Unknown" }, "Digital Nomads": { "hosts": ["adtag.cc"], "id": "digital_nomads", "parent": "Unknown" }, "Gemius": { "hosts": ["gemius.pl"], "id": "gemius", "parent": "Gemius SA" }, "GDM Digital": { "hosts": ["gdmdigital.com"], "id": "gdm_digital", "parent": "VE Interactive (Formely GDM Digital)" }, "ad:C media": { "hosts": ["adc-serv.net", "adc-srv.net"], "id": "adc_media", "parent": "Unknown" }, "Findizer": { "hosts": ["findizer.fr"], "id": "findizer.fr", "parent": "Unknown" }, "liveadexchanger.com": { "hosts": ["liveadexchanger.com"], "id": "liveadexchanger.com", "parent": "Unknown" }, "Yottaa": { "hosts": ["yottaa.net"], "id": "yottaa", "parent": "Yottaa" }, "Uptolike": { "hosts": ["uptolike.com"], "id": "uptolike.com", "parent": "Unknown" }, "Insight Image": { "hosts": ["iias.eu"], "id": "iias.eu", "parent": "Unknown" }, "Site24x7": { "hosts": ["site24x7rum.com", "site24x7rum.eu"], "id": "site24x7", "parent": "Zoho Corporation" }, "Clickonometrics": { "hosts": ["clickonometrics.pl"], "id": "clickonometrics", "parent": "Clickonometrics" }, "Google Static": { "hosts": ["gstatic.com"], "id": "gstatic", "parent": "Google" }, "Just Premium": { "hosts": ["justpremium.com", "justpremium.nl"], "id": "just_premium", "parent": "Justpremium BV" }, "FreakOut": { "hosts": ["fout.jp"], "id": "fout.jp", "parent": "Unknown" }, "Coinhive": { "hosts": ["authedmine.com", "coinhive.com"], "id": "coinhive", "parent": "Unknown" }, "Usemax": { "hosts": ["usemax.de", "usemaxserver.de"], "id": "usemax", "parent": "usemax advertisement (Emego GmbH)" }, "AdScale": { "hosts": ["adscale.de"], "id": "adscale", "parent": "Str\u00f6er SSP GmbH" }, "Optomaton": { "hosts": ["volvelle.tech"], "id": "optomaton", "parent": "Ve Global" }, "PayPal": { "hosts": ["paypal.com", "paypalobjects.com"], "id": "paypal", "parent": "eBay" }, "zukxd6fkxqn.com": { "hosts": ["zukxd6fkxqn.com"], "id": "zukxd6fkxqn.com", "parent": "Unknown" }, "rtbsuperhub.com": { "hosts": ["rtbsuperhub.com"], "id": "rtbsuperhub.com", "parent": "Unknown" }, "district m": { "hosts": ["districtm.ca", "districtm.io"], "id": "districtm.io", "parent": "district m inc." }, "WonderPush": { "hosts": ["wonderpush.com"], "id": "wonderpush", "parent": "WonderPush" }, "The Movie DB": { "hosts": ["tmdb.org"], "id": "themoviedb", "parent": "The Movie DB" }, "GiantMedia": { "hosts": ["videostat.com"], "id": "giantmedia", "parent": "Adknowledge" }, "Advanced Hosters": { "hosts": ["ahcdn.com", "pix-cdn.org"], "id": "advanced_hosters", "parent": "Unknown" }, "Google Fonts": { "hosts": ["fonts.googleapis.com"], "id": "google_fonts", "parent": "Google" }, "Crimson Hexagon": { "hosts": ["crimsonhexagon.com", "hexagon-analytics.com"], "id": "crimsonhexagon_com", "parent": "Unknown" }, "Twenga Solutions": { "hosts": ["c4tw.net"], "id": "twenga", "parent": "Unknown" }, "Google User Content": { "hosts": ["googleusercontent.com"], "id": "google_users", "parent": "Google" }, "Queue-it": { "hosts": ["queue-it.net"], "id": "queue-it", "parent": "Unknown" }, "ImgIX": { "hosts": ["imgix.net"], "id": "imgix.net", "parent": "Unknown" }, "lentainform.com": { "hosts": ["lentainform.com"], "id": "lentainform.com", "parent": "Unknown" }, "ie8eamus.com": { "hosts": ["ie8eamus.com"], "id": "ie8eamus.com", "parent": "Unknown" }, "Apple": { "hosts": ["apple.com"], "id": "apple", "parent": "Apple" }, "Schnee von Morgen": { "hosts": ["schneevonmorgen.com", "svonm.com"], "id": "schneevonmorgen.com", "parent": "Unknown" }, "ADMIZED": { "hosts": ["admized.com"], "id": "admized", "parent": "Unknown" }, "Monotype Imaging Inc.": { "hosts": ["fonts.com"], "id": "monotype_imaging", "parent": "Unknown" }, "WordPress": { "hosts": ["w.org", "wordpress.com", "wp.com"], "id": "wordpress_stats", "parent": "Automattic" }, "Pladform": { "hosts": ["pladform.com"], "id": "pladform.ru", "parent": "Pladform" }, "TRUSTe Notice": { "hosts": ["choices-or.truste.com", "choices.truste.com"], "id": "truste_notice", "parent": "TrustArc" }, "Airbnb": { "hosts": ["muscache.com", "musthird.com"], "id": "airbnb", "parent": "Unknown" }, "HEIM:SPIEL Medien GmbH": { "hosts": ["weltsport.net", "hstrck.com"], "id": "heimspiel", "parent": "Unknown" }, "Keycdn": { "hosts": ["kxcdn.com"], "id": "kxcdn.com", "parent": "Unknown" }, "Rackspace": { "hosts": ["rackcdn.com"], "id": "rackcdn.com", "parent": "Unknown" }, "Google Syndication": { "hosts": ["googlesyndication.com"], "id": "google_syndication", "parent": "Google" }, "TrafficJunky": { "hosts": ["trafficjunky.net"], "id": "trafficjunky", "parent": "TrafficJunky" }, "hiveDX": { "hosts": ["hivedx.com"], "id": "hivedx.com", "parent": "Unknown" }, "Unister": { "hosts": ["unister-adservices.com", "unister-gmbh.de"], "id": "unister", "parent": "Unister" }, "magnuum.com": { "hosts": ["magnuum.com"], "id": "magnuum.com", "parent": "Unknown" }, "CJ Affiliate": { "hosts": ["afcyhf.com", "anrdoezrs.net", "apmebf.com", "awltovhc.com", "emjcd.com", "ftjcfx.com", "lduhtrp.net", "qksz.net", "tkqlhce.com", "tqlkg.com", "yceml.net"], "id": "commission_junction", "parent": "APN News and Media Ltd" }, "Content Exchange": { "hosts": ["contentexchange.me"], "id": "contentexchange.me", "parent": "I.R.V." }, "Adult Webmaster Empire": { "hosts": ["awempire.com", "dditscdn.com", "livejasmin.com"], "id": "adult_webmaster_empire", "parent": "Adult Webmaster Empire" }, "GP One GmbH": { "hosts": ["skadtec.com"], "id": "skadtec.com", "parent": "Unknown" }, "InsightExpress": { "hosts": ["insightexpressai.com"], "id": "insightexpress", "parent": "Millward Brown" }, "Adglue": { "hosts": ["adsafety.net"], "id": "adglue", "parent": "Admans" }, "freenet.de": { "hosts": ["freenet.de", "freent.de"], "id": "freenet_de", "parent": "Unknown" }, "JuicyAds": { "hosts": ["juicyads.com"], "id": "juicyads", "parent": "JuicyAds" }, "blogspot.com": { "hosts": ["blogblog.com", "blogger.com", "blogspot.com"], "id": "blogspot_com", "parent": "Google" }, "Econda": { "hosts": ["econda-monitor.de"], "id": "econda", "parent": "Econda" }, "Wirecard": { "hosts": ["wirecard.com", "wirecard.de"], "id": "wirecard", "parent": "Unknown" }, "AdFox": { "hosts": ["adfox.ru", "adwolf.ru"], "id": "adfox", "parent": "Yandex" }, "NitroPay": { "hosts": ["nitropay.com"], "id": "nitropay", "parent": "GG Software LLC" }, "Cliplister": { "hosts": ["mycliplister.com"], "id": "mycliplister.com", "parent": "Unknown" }, "worldnaturenet.xyz": { "hosts": ["worldnaturenet.xyz"], "id": "worldnaturenet_xyz", "parent": "Unknown" }, "jQuery": { "hosts": ["cdnjquery.com", "jquery.com"], "id": "jquery", "parent": "JS Foundation" }, "itineraire.info": { "hosts": ["itineraire.info"], "id": "itineraire.info", "parent": "Unknown" }, "TVSquared": { "hosts": ["tvsquared.com"], "id": "tvsquared.com", "parent": "Unknown" }, "Smyte": { "hosts": ["smyte.com"], "id": "smyte", "parent": "Smyte" }, "Lengow": { "hosts": ["lengow.com"], "id": "lengow", "parent": "Lengow" }, "ladsp.com": { "hosts": ["ladsp.com"], "id": "ladsp.com", "parent": "Unknown" }, "Flixmedia": { "hosts": ["flix360.com"], "id": "flixmedia", "parent": "Unknown" }, "Trustpilot": { "hosts": ["trustpilot.com"], "id": "trustpilot", "parent": "Trustpilot" }, "Sovrn Viewability Solutions": { "hosts": ["onscroll.com"], "id": "sovrn_viewability_solutions", "parent": "Sovrn Holdings Inc" }, "National Oceanic and Atmospheric Administration": { "hosts": ["noaa.gov"], "id": "noaa.gov", "parent": "Unknown" }, "AdMeira": { "hosts": ["admeira.ch"], "id": "admeira.ch", "parent": "Unknown" }, "Nakanohito": { "hosts": ["nakanohito.jp"], "id": "nakanohito.jp", "parent": "UserInsight" }, "Admedo": { "hosts": ["adizio.com", "admedo.com"], "id": "admedo_com", "parent": "Admedo Ltd" }, "Remintrex": { "hosts": ["remintrex.com"], "id": "remintrex", "parent": "Unknown" }, "Avocet": { "hosts": ["avocet.io"], "id": "avocet", "parent": "Avocet Systems Limited" }, "Infectious Media": { "hosts": ["impdesk.com", "impressiondesk.com"], "id": "infectious_media", "parent": "Infectious Media" }, "Yieldbot": { "hosts": ["yldbt.com"], "id": "yieldbot", "parent": "Yieldbot" }, "Kenshoo": { "hosts": ["xg4ken.com"], "id": "kenshoo", "parent": "Kenshoo" }, "Ensighten": { "hosts": ["ensighten.com"], "id": "ensighten", "parent": "Ensighten" }, "TradeDesk": { "hosts": ["adsrvr.org"], "id": "tradedesk", "parent": "The Trade Desk" }, "AdvertServe": { "hosts": ["advertserve.com"], "id": "advertserve", "parent": "Unknown" }, "AdTiger": { "hosts": ["adtiger.de"], "id": "adtiger", "parent": "AdTiger" }, "Drawbridge": { "hosts": ["adsymptotic.com"], "id": "drawbridge", "parent": "Drawbridge" }, "Media Impact": { "hosts": ["mediaimpact.de"], "id": "media_impact", "parent": "Media Impact" }, "s3xified.com": { "hosts": ["s3xified.com"], "id": "s3xified.com", "parent": "Unknown" }, "Webtrekk": { "hosts": ["d1r27qvpjiaqj3.cloudfront.net", "mateti.net", "wbtrk.net", "wcfbc.net", "webtrekk-asia.net", "webtrekk.com", "webtrekk.net", "wt-eu02.net", "wt-safetag.com"], "id": "webtrekk", "parent": "Webtrekk" }, "adac.de": { "hosts": ["adac.de"], "id": "adac_de", "parent": "Unknown" }, "Feedbackify": { "hosts": ["feedbackify.com"], "id": "feedbackify", "parent": "Feedbackify" }, "DoubleVerify": { "hosts": ["doubleverify.com"], "id": "doubleverify", "parent": "DoubleVerify Inc.\u200b" }, "cdnsure.com": { "hosts": ["cdnsure.com"], "id": "cdnsure.com", "parent": "Unknown" }, "DMWD": { "hosts": ["ctret.de"], "id": "dmwd", "parent": "Unknown" }, "Integral Ad Science": { "hosts": ["adsafeprotected.com", "iasds01.com"], "id": "integral_ad_science", "parent": "Integral Ad Science, Inc." }, "Vinted": { "hosts": ["vinted.net"], "id": "vinted", "parent": "Unknown" }, "congstar.de": { "hosts": ["congstar.de"], "id": "congstar.de", "parent": "Unknown" }, "Ve Interactive": { "hosts": ["veinteractive.com"], "id": "ve_interactive", "parent": "Ve Interactive" }, "boudja.com": { "hosts": ["boudja.com"], "id": "boudja.com", "parent": "Unknown" }, "generaltracking.de": { "hosts": ["generaltracking.de"], "id": "generaltracking_de", "parent": "Unknown" }, "Nice264": { "hosts": ["nice264.com"], "id": "nice264.com", "parent": "Unknown" }, "Wysistat": { "hosts": ["wysistat.net"], "id": "wysistat.com", "parent": "Wysistat" }, "i10c.net": { "hosts": ["i10c.net"], "id": "i10c.net", "parent": "Unknown" }, "Quartic": { "hosts": ["quarticon.com"], "id": "quartic.pl", "parent": "QuarticOn S.A." }, "Loop11": { "hosts": ["loop11.com"], "id": "loop11", "parent": "360i" }, "AdSpyglass": { "hosts": ["o333o.com"], "id": "adspyglass", "parent": "AdSpyglass" }, "AddThis": { "hosts": ["addthis.com", "addthiscdn.com", "addthisedge.com"], "id": "addthis", "parent": "Oracle" }, "eStat": { "hosts": ["cybermonitor.com", "estat.com"], "id": "estat", "parent": "Mediametrie" }, "Twitch": { "hosts": ["ext-twitch.tv", "twitch.tv"], "id": "twitch.tv", "parent": "Amazon" }, "OMS": { "hosts": ["oms.eu", "omsnative.de"], "id": "oms", "parent": "Unknown" }, "FreeWheel": { "hosts": ["fwmrm.net"], "id": "freewheel", "parent": "Comcast" }, "WURFL": { "hosts": ["wurfl.io"], "id": "wurfl", "parent": "ScientiaMobile" }, "Flocktory": { "hosts": ["flocktory.com"], "id": "flocktory.com", "parent": "Unknown" }, "Alexa Metrics": { "hosts": ["alexametrics.com", "d31qbv1cthcecs.cloudfront.net", "d5nxst8fruw4z.cloudfront.net"], "id": "alexa_metrics", "parent": "Amazon" }, "Microsoft SharePoint": { "hosts": ["sharepointonline.com"], "id": "sharepoint", "parent": "Microsoft" }, "tableteducation.com": { "hosts": ["tableteducation.com"], "id": "tableteducation.com", "parent": "Unknown" }, "Akamai Technologies": { "hosts": ["abmr.net", "akamai.net", "akamaihd.net", "akamaized.net", "akstat.io", "edgekey.net", "edgesuite.net"], "id": "akamai_technologies", "parent": "Akamai Technologies" }, "iSpot.tv": { "hosts": ["ispot.tv"], "id": "ispot.tv", "parent": "Unknown" }, "FileServe": { "hosts": ["fileserve.xyz"], "id": "fileserve", "parent": "FileServe" }, "DataXu": { "hosts": ["w55c.net"], "id": "dataxu", "parent": "Dataxu, Inc. " }, "Glomex": { "hosts": ["glomex.cloud", "glomex.com"], "id": "glomex.com", "parent": "Unknown" }, "Flag Counter": { "hosts": ["flagcounter.com"], "id": "flag_counter", "parent": "Flag Counter" }, "Tisoomi": { "hosts": ["tisoomi-services.com"], "id": "tisoomi", "parent": "Unknown" }, "Omniconvert": { "hosts": ["omniconvert.com"], "id": "omniconvert.com", "parent": "Omniconvert" }, "brillen.de": { "hosts": ["brillen.de"], "id": "brillen.de", "parent": "Unknown" }, "Allo-Pages": { "hosts": ["allo-pages.fr"], "id": "allo-pages.fr", "parent": "Links Lab" }, "Connatix": { "hosts": ["connatix.com"], "id": "connatix.com", "parent": "Connatix Native Exchange Inc." }, "Digioh": { "hosts": ["digioh.com", "lightboxcdn.com"], "id": "digioh", "parent": "Unknown" }, "Blink New Media": { "hosts": ["bnmla.com"], "id": "blink_new_media", "parent": "engage:BDR (Blink New Media)" }, "BounceX": { "hosts": ["bouncex.com", "bouncex.net"], "id": "bouncex", "parent": "Unknown" }, "AppsFlyer": { "hosts": ["appsflyer.com"], "id": "appsflyer", "parent": "AppsFlyer" }, "Pixalate": { "hosts": ["adrta.com"], "id": "pixalate", "parent": "Pixalate, Inc." }, "chaturbate.com": { "hosts": ["chaturbate.com"], "id": "chaturbate.com", "parent": "Unknown" }, "Distil Bot Discovery": { "hosts": ["distiltag.com"], "id": "distil_tag", "parent": "distil networks" }, "LeadPlace": { "hosts": ["leadplace.fr"], "id": "leadplace", "parent": "Leadplace - Temelio" }, "Otto Group": { "hosts": ["otto.de", "ottogroup.media"], "id": "otto.de", "parent": "Unknown" }, "Caltat": { "hosts": ["caltat.com"], "id": "caltat.com", "parent": "Unknown" }, "Pulpix": { "hosts": ["pulpix.com"], "id": "pulpix.com", "parent": "ADYOULIKE SA" }, "Spoteffect": { "hosts": ["spoteffects.net"], "id": "spoteffect", "parent": "Spoteffect" }, "SnigelWeb, Inc.": { "hosts": ["h-bid.com"], "id": "snigelweb", "parent": "SnigelWeb, Inc." }, "Moz": { "hosts": ["moz.com"], "id": "moz", "parent": "Unknown" }, "Reddit": { "hosts": ["redd.it", "reddit-image.s3.amazonaws.com", "reddit.com", "redditmedia.com", "redditstatic.com"], "id": "reddit", "parent": "reddit" }, "Smaato": { "hosts": ["smaato.net"], "id": "smaato", "parent": "Spearhead Integrated Marketing Communication" }, "comprigo": { "hosts": ["comprigo.com"], "id": "comprigo", "parent": "Unknown" }, "foxydeal.com": { "hosts": ["foxydeal.com"], "id": "foxydeal_com", "parent": "Unknown" }, "Psyma": { "hosts": ["psyma.com"], "id": "psyma", "parent": "Psyma" }, "onet": { "hosts": ["ocdn.eu", "onet.pl"], "id": "onet.pl", "parent": "Unknown" }, "SaleCycle": { "hosts": ["d16fk4ms6rqz1v.cloudfront.net", "salecycle.com"], "id": "salecycle", "parent": "SaleCycle" }, "Aemediatraffic": { "hosts": ["aemediatraffic.com", "hprofits.com"], "id": "aemediatraffic", "parent": "Unknown" }, "Admo.TV": { "hosts": ["admo.tv"], "id": "admo.tv", "parent": "Unknown" }, "Adglare": { "hosts": ["adglare.net"], "id": "adglare.net", "parent": "Unknown" }, "Allegro": { "hosts": ["allegroimg.com", "allegrostatic.com", "allegrostatic.pl", "ngacm.com", "ngastatic.com"], "id": "allegro.pl", "parent": "Allegro" }, "TrafficHaus": { "hosts": ["traffichaus.com"], "id": "traffichaus", "parent": "TrafficHaus" }, "AB Tasty": { "hosts": ["abtasty.com", "d1447tq2m68ekg.cloudfront.net"], "id": "ab_tasty", "parent": "AB Tasty" }, "Lotame": { "hosts": ["crwdcntrl.net"], "id": "lotame", "parent": "Lotame Solutions, Inc." }, "MaxCDN": { "hosts": ["maxcdn.com", "netdna-cdn.com", "netdna-ssl.com"], "id": "maxcdn", "parent": "Unknown" }, "Effiliation": { "hosts": ["effiliation.com"], "id": "effiliation", "parent": "Effiliation" }, "Perfect Market": { "hosts": ["perfectmarket.com"], "id": "perfect_market", "parent": "Perfect Market" }, "Simpli.fi": { "hosts": ["simpli.fi"], "id": "simpli.fi", "parent": "Simplifi Holdings Inc." }, "Amazon.com": { "hosts": ["amazon.ca", "amazon.co.jp", "amazon.co.uk", "amazon.com", "amazon.de", "amazon.es", "amazon.fr", "amazon.it", "d3io1k5o0zdpqr.cloudfront.net"], "id": "amazon", "parent": "Amazon" }, "Appcues": { "hosts": ["appcues.com"], "id": "appcues", "parent": "Unknown" }, "DreamLab.pl": { "hosts": ["dreamlab.pl"], "id": "dreamlab.pl", "parent": "Onet.pl SA" }, "kairion": { "hosts": ["kairion.de", "kctag.net"], "id": "kairion.de", "parent": "ProSiebenSat.1 Media" }, "Proxistore": { "hosts": ["proxistore.com"], "id": "proxistore.com", "parent": "Unknown" }, "sitelabweb.com": { "hosts": ["sitelabweb.com"], "id": "sitelabweb.com", "parent": "Unknown" }, "Moat": { "hosts": ["moatads.com", "moatpixel.com"], "id": "moat", "parent": "Oracle" }, "Qualtrics": { "hosts": ["qualtrics.com"], "id": "qualtrics", "parent": "Qualtrics" }, "FLXONE": { "hosts": ["flx1.com", "flxpxl.com"], "id": "flxone", "parent": "FlxOne" }, "AffiMax": { "hosts": ["affimax.de"], "id": "affimax", "parent": "AffiMax" }, "Adscore": { "hosts": ["adsco.re"], "id": "adsco.re", "parent": "Unknown" }, "Next Performance": { "hosts": ["nxtck.com"], "id": "next_performance", "parent": "Nextperf" }, "immobilienscout24.de": { "hosts": ["immobilienscout24.de", "static-immobilienscout24.de"], "id": "immobilienscout24_de", "parent": "Scout 24" }, "ablida": { "hosts": ["ablida.de", "ablida.net"], "id": "ablida", "parent": "Unknown" }, "Sape": { "hosts": ["sape.ru"], "id": "sape.ru", "parent": "Sape Sapient Solution" }, "venturead.com": { "hosts": ["venturead.com"], "id": "venturead.com", "parent": "Unknown" }, "Adyoulike": { "hosts": ["adyoulike.com", "omnitagjs.com"], "id": "adyoulike", "parent": "ADYOULIKE SA" }, "IMDB CDN": { "hosts": ["media-imdb.com"], "id": "media-imdb.com", "parent": "Amazon" }, "Lytics": { "hosts": ["lytics.io"], "id": "lytics", "parent": "Unknown" }, "Relap": { "hosts": ["relap.io"], "id": "relap", "parent": "Unknown" }, "xxxlshop.de": { "hosts": ["xxxlshop.de"], "id": "xxxlshop.de", "parent": "Unknown" }, "OLX": { "hosts": ["olx-st.com", "onap.io"], "id": "olx-st.com", "parent": "Unknown" }, "Videoplaza": { "hosts": ["videoplaza.tv"], "id": "videoplaza", "parent": "Videoplaza" }, "Zemanta": { "hosts": ["zemanta.com"], "id": "zemanta", "parent": "Zemanta, Inc." }, "Vimeo": { "hosts": ["vimeo.com", "vimeocdn.com"], "id": "vimeo", "parent": "IAC (InterActiveCorp)" }, "Rating@Mail.Ru": { "hosts": ["list.ru"], "id": "list.ru", "parent": "Megafon" }, "CQuotient": { "hosts": ["cquotient.com"], "id": "cquotient.com", "parent": "Salesforce" }, "Reflected Networks": { "hosts": ["rncdn3.com"], "id": "rncdn3.com", "parent": "Unknown" }, "Ziff Davis": { "hosts": ["webtest.net", "zdbb.net", "ziffdavis.com", "ziffdavisinternational.com", "ziffprod.com", "ziffstatic.com"], "id": "ziff_davis", "parent": "Ziff Davis LLC" }, "Kiwe.io": { "hosts": ["kiwe.io", "tracc.it"], "id": "tracc.it", "parent": "Unknown" }, "Intimate Merger": { "hosts": ["im-apps.net"], "id": "intimate_merger", "parent": "Intimate Merger" }, "o2.pl": { "hosts": ["o2.pl"], "id": "o2.pl", "parent": "o2.pl" }, "CleverTap": { "hosts": ["wzrkt.com"], "id": "clever_tap", "parent": "CleverTap" }, "Contact Impact": { "hosts": ["adrolays.de", "c-i.as", "df-srv.de"], "id": "contact_impact", "parent": "Axel Springer Group" }, "SiteScout": { "hosts": ["sitescout.com"], "id": "sitescout", "parent": "SiteScout" }, "Smartsupp Chat": { "hosts": ["smartsuppchat.com"], "id": "smartsupp_chat", "parent": "Smartsuppp" }, "United Digital Group": { "hosts": ["nonstoppartner.net"], "id": "united_digital_group", "parent": "Unknown" }, "AdsWizz": { "hosts": ["adswizz.com"], "id": "adswizz", "parent": "Unknown" }, "DimML": { "hosts": ["dimml.io"], "id": "dimml", "parent": "Unknown" }, "Adthink": { "hosts": ["adthink.com", "audienceinsights.net"], "id": "adthink", "parent": "Unknown" }, "Adobe Dynamic Media (Scene7)": { "hosts": ["scene7.com"], "id": "scene7.com", "parent": "Adobe" }, "ymetrica1.com": { "hosts": ["ymetrica1.com"], "id": "ymetrica1.com", "parent": "Unknown" }, "Monetate": { "hosts": ["monetate.net"], "id": "monetate", "parent": "Monetate" }, "Daily Mail": { "hosts": ["dailymail.co.uk"], "id": "dailymail.co.uk", "parent": "Dmn Media" }, "Dynamic 1001 GmbH": { "hosts": ["dyntracker.de", "media01.eu"], "id": "dynamic_1001_gmbh", "parent": "Unknown" }, "iovation": { "hosts": ["iesnare.com", "iovation.com"], "id": "iovation", "parent": "iovation" }, "Bing Ads": { "hosts": ["bing.com", "bing.net"], "id": "bing_ads", "parent": "Microsoft" }, "Yabbi": { "hosts": ["adx.com.ru", "yabbi.me"], "id": "yabbi", "parent": "Unknown" }, "Ancora": { "hosts": ["ancoraplatform.com"], "id": "ancora", "parent": "Ancora" }, "Rythmxchange": { "hosts": ["rhythmxchange.com"], "id": "rythmxchange", "parent": "RhythmOne, LLC" }, "Tube Corporate": { "hosts": ["tubecorporate.com"], "id": "tubecorporate", "parent": "Unknown" }, "Valiton": { "hosts": ["vinsight.de"], "id": "valiton", "parent": "Hubert Burda Media" }, "Squarespace": { "hosts": ["squarespace.com"], "id": "squarespace.com", "parent": "Unknown" }, "emetriq": { "hosts": ["emetriq.de"], "id": "emetriq", "parent": "emetriq GmbH" }, "SMART AdServer": { "hosts": ["sascdn.com", "smartadserver.com", "styria-digital.com", "yoc-adserver.com"], "id": "smart_adserver", "parent": "Smart Adserver" }, "Google APIs": { "hosts": ["googleapis.com"], "id": "googleapis.com", "parent": "Google" }, "Blis": { "hosts": ["blismedia.com"], "id": "blis", "parent": "Blis" }, "Adition": { "hosts": ["adition.com"], "id": "adition", "parent": "ProSiebenSat.1 Media" }, "Microsoft Services": { "hosts": ["azurewebsites.net", "cloudapp.net", "gfx.ms", "live.com", "microsoft.com", "microsoftonline-p.com", "microsoftonline.com", "microsofttranslator.com", "msecnd.net", "msedge.net", "msocdn.com", "onestore.ms", "s-microsoft.com", "trouter.io", "windows.net"], "id": "microsoft", "parent": "Microsoft" }, "amgload.net": { "hosts": ["amgload.net"], "id": "amgload.net", "parent": "Unknown" }, "Spotify": { "hosts": ["scdn.co", "spotify.com"], "id": "spotify", "parent": "Unknown" }, "Outbrain": { "hosts": ["outbrain.com", "outbrainimg.com"], "id": "outbrain", "parent": "Outbrain" }, "Bluecore": { "hosts": ["bluecore.com", "triggeredmail.appspot.com"], "id": "bluecore.com", "parent": "Unknown" }, "Peerius": { "hosts": ["peerius.com"], "id": "peerius", "parent": "Peerius" }, "da-ads.com": { "hosts": ["da-ads.com"], "id": "da-ads.com", "parent": "Unknown" }, "Adblade": { "hosts": ["adblade.com"], "id": "adblade.com", "parent": "Adblade" }, "Adverticum": { "hosts": ["adverticum.net"], "id": "adverticum", "parent": "Adverticum Zrt." }, "FriendFinder Network": { "hosts": ["adultfriendfinder.com", "amigos.com", "board-books.com", "cams.com", "facebookofsex.com", "getiton.com", "nostringsattached.com", "pop6.com", "streamray.com"], "id": "friendfinder_network", "parent": "FriendFinder Networks" }, "YouTube": { "hosts": ["googlevideo.com", "youtube-nocookie.com", "youtube.com", "ytimg.com"], "id": "youtube", "parent": "Google" }, "brightonclick.com": { "hosts": ["brightonclick.com"], "id": "brightonclick.com", "parent": "Unknown" }, "CloudFlare": { "hosts": ["cloudflare.com", "cloudflare.net"], "id": "cloudflare", "parent": "Cloudflare" }, "PubMatic": { "hosts": ["pubmatic.com"], "id": "pubmatic", "parent": "PubMatic, Inc." }, "woopic.com": { "hosts": ["woopic.com"], "id": "woopic.com", "parent": "Unknown" }, "Twitter for Business": { "hosts": ["tellapart.com"], "id": "twitter_for_business", "parent": "Twitter" }, "AirPR": { "hosts": ["airpr.com"], "id": "airpr.com", "parent": "AirPR Inc." }, "basilic.io": { "hosts": ["basilic.io"], "id": "basilic.io", "parent": "Unknown" }, "33Across": { "hosts": ["33across.com"], "id": "33across", "parent": "33Across" }, "Optimatic": { "hosts": ["optimatic.com"], "id": "optimatic", "parent": "Optimatic" }, "Komoona": { "hosts": ["komoona.com"], "id": "komoona", "parent": "Komoona" }, "Mixpanel": { "hosts": ["mixpanel.com", "mxpnl.com", "mxpnl.net"], "id": "mixpanel", "parent": "Mixpanel" }, "BangBros": { "hosts": ["bangdom.com"], "id": "bangdom.com", "parent": "Unknown" }, "adwebster": { "hosts": ["adwebster.com"], "id": "adwebster", "parent": "adwebster" }, "Rubicon": { "hosts": ["dpclk.com", "mobsmith.com", "nearbyad.com", "rubiconproject.com"], "id": "rubicon", "parent": "The Rubicon Project, Limited" }, "Yandex": { "hosts": ["d31j93rd8oukbv.cloudfront.net", "webvisor.org", "yandex.net", "yandex.ru", "yastatic.net"], "id": "yandex", "parent": "Yandex" }, "Kameleoon": { "hosts": ["kameleoon.com", "kameleoon.eu"], "id": "kameleoon", "parent": "Kameleoon" }, "Omniscienta": { "hosts": ["omnidsp.com"], "id": "omniscienta", "parent": "Unknown" }, "Qualaroo": { "hosts": ["qualaroo.com"], "id": "qualaroo", "parent": "Unknown" }, "Zedo": { "hosts": ["zedo.com"], "id": "zedo", "parent": "Zedo" }, "TrustArc": { "hosts": ["trustarc.com", "truste.com"], "id": "trustarc", "parent": "TrustArc" }, "Movable Ink": { "hosts": ["micpn.com"], "id": "movable_ink", "parent": "Unknown" }, "adgoal": { "hosts": ["smartadcheck.de", "smartredirect.de"], "id": "adgoal", "parent": "adgoal" }, "Traffic Stars": { "hosts": ["trafficstars.com", "tsyndicate.com"], "id": "traffic_stars", "parent": "Traffic Stars" }, "M. P. NEWMEDIA": { "hosts": ["mpnrs.com"], "id": "m._p._newmedia", "parent": "Unknown" }, "Admeta": { "hosts": ["admaym.com", "atemda.com"], "id": "admeta", "parent": "AdMeta" }, "Babator": { "hosts": ["babator.com"], "id": "babator.com", "parent": "Unknown" }, "Monotype GmbH": { "hosts": ["fonts.net"], "id": "monotype_gmbh", "parent": "Unknown" }, "AniView": { "hosts": ["aniview.com"], "id": "aniview.com", "parent": "Unknown" }, "Baidu Ads": { "hosts": ["baidu.com", "baidustatic.com"], "id": "baidu_ads", "parent": "Baidu" }, "pizzaandads.com": { "hosts": ["pizzaandads.com"], "id": "pizzaandads_com", "parent": "Unknown" }, "AppNexus": { "hosts": ["adnxs.com", "adnxs.net"], "id": "appnexus", "parent": "AppNexus Inc." }, "R-Advertising": { "hosts": ["ads-digitalkeys.com"], "id": "r_advertising", "parent": "Unknown" }, "OptinProject": { "hosts": ["optincollect.com"], "id": "optinproject.com", "parent": "OptinCollect" }, "baletingo.com": { "hosts": ["baletingo.com"], "id": "baletingo.com", "parent": "Unknown" }, "ria.ru": { "hosts": ["ria.ru"], "id": "ria.ru", "parent": "Unknown" }, "AiData": { "hosts": ["aidata.io"], "id": "aidata.io", "parent": "Unknown" }, "Deutsche Telekom": { "hosts": ["sdp-campaign.de", "t-online.de", "telekom-dienste.de", "telekom.com", "telekom.de", "toi.de"], "id": "t-mobile", "parent": "Unknown" }, "cdnnetwok.xyz": { "hosts": ["cdnnetwok.xyz"], "id": "cdnnetwok_xyz", "parent": "Unknown" }, "Keywee": { "hosts": ["keywee.co"], "id": "keywee", "parent": "Unknown" }, "Netsprint Audience": { "hosts": ["nsaudience.pl"], "id": "netsprint_audience", "parent": "Netsprint SA" }, "Jeuxvideo CDN": { "hosts": ["jvc.gg"], "id": "jvc.gg", "parent": "Unknown" }, "Sirdata": { "hosts": ["sddan.com"], "id": "sirdata", "parent": "Sirdata" }, "Adobe Audience Manager": { "hosts": ["adobe.com", "demdex.net", "everestjs.net", "everesttech.net"], "id": "adobe_audience_manager", "parent": "Adobe" }, "First Impression": { "hosts": ["firstimpression.io"], "id": "first_impression", "parent": "First Impression" }, "remove.video": { "hosts": ["remove.video"], "id": "remove.video", "parent": "Unknown" }, "Dotmetrics": { "hosts": ["dotmetrics.net"], "id": "dotmetrics.net", "parent": "Unknown" }, "Walk Me": { "hosts": ["walkme.com"], "id": "walkme.com", "parent": "Unknown" }, "Medialead": { "hosts": ["medialead.de"], "id": "medialead", "parent": "The Reach Group GmbH" }, "Dynatrace": { "hosts": ["dynatrace.com"], "id": "dynatrace.com", "parent": "Thoma Bravo" }, "StumbleUpon Widgets": { "hosts": ["stumble-upon.com", "stumbleupon.com", "su.pr"], "id": "stumbleupon_widgets", "parent": "StumbleUpon" }, "Sovrn OneTag": { "hosts": ["s-onetag.com"], "id": "sovrn_onetag", "parent": "Sovrn Holdings Inc" }, "Tynt": { "hosts": ["tynt.com"], "id": "tynt", "parent": "33Across" }, "Programattik": { "hosts": ["programattik.com"], "id": "programattik", "parent": "T\u00fcrk Telekom" }, "iotec": { "hosts": ["dsp.io"], "id": "iotec", "parent": "iotec global Ltd." }, "tubecup.org": { "hosts": ["tubecup.org"], "id": "tubecup.org", "parent": "Unknown" }, "Notify": { "hosts": ["adleadevent.com"], "id": "notify", "parent": "Unknown" }, "Facetz.DCA": { "hosts": ["facetz.net"], "id": "facetz.dca", "parent": "DCA (Data-Centric Alliance)" }, "Swisscom": { "hosts": ["swisscom.ch"], "id": "swisscom", "parent": "Unknown" }, "Peer5": { "hosts": ["peer5.com"], "id": "peer5.com", "parent": "Peer5" }, "AppDynamics": { "hosts": ["appdynamics.com", "de8of677fyt0b.cloudfront.net", "eum-appdynamics.com"], "id": "appdynamics", "parent": "AppDynamics" }, "TradeDoubler": { "hosts": ["tradedoubler.com"], "id": "tradedoubler", "parent": "Tradedoubler AB" }, "vidcpm.com": { "hosts": ["vidcpm.com"], "id": "lottex_inc", "parent": "Unknown" }, "ShareThis": { "hosts": ["sharethis.com"], "id": "sharethis", "parent": "ShareThis, Inc." }, "Rhythmone Beacon": { "hosts": ["1rx.io"], "id": "rhythmone_beacon", "parent": "RhythmOne, LLC" }, "Disqus Ads": { "hosts": ["disqusads.com"], "id": "disqus_ads", "parent": "Disqus" }, "piguiqproxy.com": { "hosts": ["piguiqproxy.com"], "id": "piguiqproxy.com", "parent": "Unknown" }, "adRom": { "hosts": ["adrom.net", "txt.eu"], "id": "adrom", "parent": "Unknown" }, "AdPilot": { "hosts": ["adpilot.at", "erne.co"], "id": "adpilot", "parent": "Unknown" }, "GlobalWebIndex": { "hosts": ["globalwebindex.net"], "id": "global_web_index", "parent": "GlobalWebIndex" }, "coll1onf.com": { "hosts": ["coll1onf.com"], "id": "coll1onf.com", "parent": "Unknown" }, "ehi-siegel.de": { "hosts": ["ehi-siegel.de"], "id": "ehi-siegel_de", "parent": "Unknown" }, "tdsrmbl.net": { "hosts": ["tdsrmbl.net"], "id": "tdsrmbl_net", "parent": "Unknown" }, "Permutive": { "hosts": ["permutive.com"], "id": "permutive", "parent": "Permutive, Inc." }, "Cam-Content.com": { "hosts": ["cam-content.com"], "id": "cam-content.com", "parent": "Unknown" }, "Dtscout": { "hosts": ["dtscout.com"], "id": "dtscout.com", "parent": "Unknown" }, "JW Player": { "hosts": ["d21rhj7n383afu.cloudfront.net", "jwpcdn.com", "jwplatform.com", "jwplayer.com", "jwpltx.com", "jwpsrv.com"], "id": "jw_player", "parent": "JW Player" }, "globalnotifier.com": { "hosts": ["globalnotifier.com"], "id": "globalnotifier.com", "parent": "Unknown" }, "Recettes.net": { "hosts": ["recettes.net"], "id": "recettes.net", "parent": "Recettes.net" } };
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

Object.keys(trackerData).forEach(e => {
	trackerData[e].hosts.forEach(y => {
		trackerDomains.push(y);
	});
});


// Create a mapping of hostname to company name
company_hostname_mapping = {}

Object.keys(trackerData).forEach(e => {
	trackerData[e].hosts.forEach(y => {
		company_hostname_mapping[y] = trackerData[e].parent;
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
		tracker_host: 'Unknown',
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
