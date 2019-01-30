if(typeof('chrome') === 'undefined') {
  var chrome = browser;
}
// var browser = chrome;

function log(message) {
	if (debug) {
		console.log(message);
	}
}

function strip(html){
   var doc = new DOMParser().parseFromString(html, 'text/html');
   return doc.body.textContent || "";
}

function decode(txt) {
	try {
		return decodeURIComponent(decodeURIComponent(txt));
	} catch (e) {
		return decodeURIComponent(txt);
	}
}

const debug = true;

/// Comes from whitracks.me. We need to improve the mechanisms to update the lists.
const trackerData = {"Google Analytics": {"id": "google_analytics", "hosts": ["google-analytics.com"], "parent": "Google"}, "DoubleClick": {"id": "doubleclick", "hosts": ["2mdn.net", "invitemedia.com", "doubleclick.net"], "parent": "Google"}, "Google": {"id": "google", "hosts": ["google.nl", "google.it", "google.be", "google.co.uk", "google.es", "google.de", "google.pl", "google.ch", "google.gr", "google.at", "google.com.br", "google.com", "google.co.th", "google.co.ma", "google.fr", "google.dz", "google.ca", "google.dk", "google.ru", "google.fi", "google.com.ua", "google.se", "google.com.au", "google.no", "google.cz", "google.pt", "google.co.in", "google.hu", "google.ro", "google.rs", "google.tn", "google.com.mx", "google.com.tr", "google.co.jp", "google.ie"], "parent": "Google"}, "Google Tag Manager": {"id": "google_tag_manager", "hosts": ["googletagmanager.com", "googletagservices.com"], "parent": "Google"}, "Facebook": {"id": "facebook", "hosts": ["facebook.net", "atlassbx.com", "facebook.com", "fbcdn.net", "fbsbx.com"], "parent": "Facebook"}, "Google Static": {"id": "gstatic", "hosts": ["gstatic.com"], "parent": "Google"}, "INFOnline": {"id": "infonline", "hosts": ["ivwbox.de", "ioam.de"], "parent": "INFOnline"}, "Google Fonts": {"id": "google_fonts", "hosts": ["fonts.googleapis.com"], "parent": "Google"}, "Google AdServices": {"id": "google_adservices", "hosts": ["googleadservices.com"], "parent": "Google"}, "Google APIs": {"id": "googleapis.com", "hosts": ["googleapis.com"], "parent": "Google"}, "Google Syndication": {"id": "google_syndication", "hosts": ["googlesyndication.com"], "parent": "Google"}, "Criteo": {"id": "criteo", "hosts": ["criteo.com", "criteo.net"], "parent": "Criteo"}, "AppNexus": {"id": "appnexus", "hosts": ["adnxs.com", "adnxs.net"], "parent": "AppNexus"}, "Amazon CloudFront": {"id": "amazon_cloudfront", "hosts": ["cloudfront.net"], "parent": "Amazon"}, "eBay Stats": {"id": "ebay", "hosts": ["ebayclassifiedsgroup.com", "ebayrtm.com", "ebaydesc.com", "ebayimg.com", "ebaystatic.com", "ebay.com", "ebay.de", "ebay-us.com", "classistatic.de", "ebaycommercenetwork.com"], "parent": "eBay"}, "Amazon Associates": {"id": "amazon_associates", "hosts": ["assoc-amazon.jp", "assoc-amazon.de", "assoc-amazon.ca", "assoc-amazon.co.uk", "amazon.fr", "amazon.ca", "amazon.es", "amazon.co.jp", "amazon.de", "assoc-amazon.com", "amazon.com", "amazon-adsystem.com", "amazon.co.uk", "assoc-amazon.fr", "amazon.it", "media-amazon.com", "ssl-images-amazon.com", "images-amazon.com"], "parent": "Amazon"}, "Adition": {"id": "adition", "hosts": ["adition.com"], "parent": "Adition Technologies AG"}, "Adform": {"id": "adform", "hosts": ["adformdsp.net", "adform.net", "seadform.net"], "parent": "Adform"}, "Amazon Web Services": {"id": "amazon_web_services", "hosts": ["amazonaws.com", "amazonwebservices.com", "awsstatic.com"], "parent": "Amazon"}, "ScoreCard Research Beacon": {"id": "scorecard_research_beacon", "hosts": ["scoreresearch.com", "scrsrch.com", "securestudies.com", "scorecardresearch.com", "comscore.com"], "parent": "ComScore"}, "Optimizely": {"id": "optimizely", "hosts": ["optimizely.com"], "parent": "Unknown"}, "Twitter": {"id": "twitter", "hosts": ["twitter.com", "twimg.com", "ads-twitter.com", "t.co"], "parent": "Twitter"}, "CloudFlare": {"id": "cloudflare", "hosts": ["cloudflare.com", "cloudflare.net"], "parent": "Cloudflare"}, "YouTube": {"id": "youtube", "hosts": ["ytimg.com", "youtube-nocookie.com", "youtube.com", "googlevideo.com"], "parent": "Google"}, "Rubicon": {"id": "rubicon", "hosts": ["dpclk.com", "mobsmith.com", "nearbyad.com", "rubiconproject.com"], "parent": "Rubicon Project"}, "The ADEX": {"id": "the_adex", "hosts": ["theadex.com"], "parent": "The ADEX"}, "OpenX": {"id": "openx", "hosts": ["servedbyopenx.com", "odnxs.net", "openx.org", "openx.net", "openxenterprise.com"], "parent": "OpenX"}, "Yieldlab": {"id": "yieldlab", "hosts": ["yieldlab.net"], "parent": "Yieldlab"}, "Nugg.Ad": {"id": "nugg.ad", "hosts": ["nuggad.net"], "parent": "Nugg.ad"}, "Kaspersky Labs": {"id": "kaspersky-labs.com", "hosts": ["kaspersky-labs.com"], "parent": "Unknown"}, "Bing Ads": {"id": "bing_ads", "hosts": ["bing.com", "bing.net"], "parent": "Microsoft"}, "Adobe Audience Manager": {"id": "adobe_audience_manager", "hosts": ["everestjs.net", "demdex.net", "everesttech.net", "adobe.com"], "parent": "Adobe"}, "PubMatic": {"id": "pubmatic", "hosts": ["pubmatic.com"], "parent": "PubMatic"}, "Index Exchange": {"id": "index_exchange_", "hosts": ["casalemedia.com", "indexww.com"], "parent": "Index Exchange"}, "Tealium": {"id": "tealium", "hosts": ["llnwd.net", "tealiumiq.com", "tealium.com", "tiqcdn.com"], "parent": "Tealium"}, "xplosion": {"id": "xplosion", "hosts": ["xplosion.de"], "parent": "xplosion interactive"}, "MediaMath": {"id": "mediamath", "hosts": ["mathads.com", "mathtag.com"], "parent": "MediaMath"}, "Akamai Technologies": {"id": "akamai_technologies", "hosts": ["akamai.net", "akamaihd.net", "edgesuite.net", "akamaized.net", "akstat.io", "edgekey.net", "abmr.net"], "parent": "Akamai Technologies"}, "Meetrics": {"id": "meetrics", "hosts": ["meetrics.net", "de.com", "mxcdn.net"], "parent": "Meetrics"}, "TradeDesk": {"id": "tradedesk", "hosts": ["adsrvr.org"], "parent": "The Trade Desk"}, "Media Innovation Group": {"id": "media_innovation_group", "hosts": ["mookie1.com"], "parent": "Media Innovation Group"}, "BlueKai": {"id": "bluekai", "hosts": ["bkrtx.com", "bluekai.com"], "parent": "Oracle"}, "New Relic": {"id": "new_relic", "hosts": ["d1ros97qkrwjf5.cloudfront.net", "nr-data.net", "newrelic.com"], "parent": "New Relic"}, "Yahoo!": {"id": "yahoo", "hosts": ["tumblr.com", "yahoo.com", "interclick.com", "yimg.com", "yahooapis.com", "yimg.jp"], "parent": "Verizon"}, "Google User Content": {"id": "google_users", "hosts": ["googleusercontent.com"], "parent": "Google"}, "Exactag": {"id": "exactag", "hosts": ["exactag.com"], "parent": "Exactag"}, "emetriq": {"id": "emetriq", "hosts": ["emetriq.de"], "parent": "emetriq"}, "Adobe Dynamic Tag Management": {"id": "adobe_dynamic_tag_management", "hosts": ["adobedtm.com"], "parent": "Adobe"}, "Adomik": {"id": "adomik", "hosts": ["adomik.com"], "parent": "Unknown"}, "AddThis": {"id": "addthis", "hosts": ["addthiscdn.com", "addthis.com", "addthisedge.com"], "parent": "Oracle"}, "Outbrain": {"id": "outbrain", "hosts": ["outbrain.com"], "parent": "Outbrain"}, "Audience Science": {"id": "audience_science", "hosts": ["wunderloop.net", "revsci.net", "targetingmarketplace.com"], "parent": "AudienceScience"}, "United Internet Media GmbH": {"id": "united_internet_media_gmbh", "hosts": ["uimserv.net", "ui-portal.de", "tifbs.net"], "parent": "United Internet AG"}, "Atlas": {"id": "atlas", "hosts": ["adbureau.net", "atdmt.com"], "parent": "Facebook"}, "AT Internet": {"id": "at_internet", "hosts": ["xiti.com", "ati-host.net", "aticdn.net"], "parent": "AT Internet"}, "Bidswitch": {"id": "bidswitch", "hosts": ["bidswitch.net", "exe.bid"], "parent": "Bidswitch"}, "Bootstrap CDN": {"id": "bootstrap", "hosts": ["bootstrapcdn.com"], "parent": "Unknown"}, "ADTECH": {"id": "adtech", "hosts": ["adtech.de", "adtechus.com"], "parent": "Verizon"}, "Advertising.com": {"id": "advertising.com", "hosts": ["advertising.com", "aol.com", "pictela.net", "adsdk.com", "atwola.com"], "parent": "Verizon"}, "Google Photos": {"id": "google_photos", "hosts": ["ggpht.com"], "parent": "Google"}, "PayPal": {"id": "paypal", "hosts": ["paypal.com", "paypalobjects.com"], "parent": "PayPal"}, "Taboola": {"id": "taboola", "hosts": ["taboola.com", "taboolasyndication.com", "basebanner.com"], "parent": "Taboola"}, "Webtrekk": {"id": "webtrekk", "hosts": ["webtrekk.net", "wt-safetag.com", "webtrekk-asia.net", "wt-eu02.net", "wbtrk.net", "webtrekk.com", "mateti.net", "wcfbc.net"], "parent": "Webtrekk"}, "jQuery": {"id": "jquery", "hosts": ["jquery.com"], "parent": "JS Foundation"}, "adality GmbH": {"id": "adality_gmbh", "hosts": ["adrtx.net"], "parent": "Unknown"}, "Trusted Shops": {"id": "trusted_shops", "hosts": ["trustedshops.com"], "parent": "Trusted Shops"}, "Hotjar": {"id": "hotjar", "hosts": ["hotjar.com"], "parent": "Hotjar"}, "ExoClick": {"id": "exoclick", "hosts": ["exoclick.com", "exosrv.com", "exdynsrv.com"], "parent": "ExoClick"}, "Ligatus": {"id": "ligatus", "hosts": ["ligatus.com", "ligatus.de", "ligadx.com", "veeseo.com", "content-recommendation.net"], "parent": "Gruner + Jahr AG"}, "Omniture (Adobe Analytics)": {"id": "omniture__adobe_analytics_", "hosts": ["imageg.net", "freedom.com", "du8783wkf05yr.cloudfront.net", "hitbox.com", "reedbusiness.net", "omtrdc.net", "2o7.net"], "parent": "Adobe"}, "Turn Inc.": {"id": "turn_inc.", "hosts": ["turn.com"], "parent": "Turn Inc."}, "Krux Digital": {"id": "krux_digital", "hosts": ["krxd.net"], "parent": "Salesforce"}, "SMART AdServer": {"id": "smart_adserver", "hosts": ["sascdn.com", "smartadserver.com", "yoc-adserver.com", "styria-digital.com"], "parent": "Smart AdServer"}, "Quantcast": {"id": "quantcast", "hosts": ["quantcast.com", "quantserve.com"], "parent": "Quantcast"}, "Google Custom Search Ads": {"id": "google_custom_search", "hosts": ["adsensecustomsearchads.com"], "parent": "Google"}, "Yandex": {"id": "yandex", "hosts": ["yandex.ru", "yandex.net", "yastatic.net"], "parent": "Yandex"}, "BrightRoll": {"id": "brightroll", "hosts": ["btrll.com"], "parent": "Verizon"}, "AdScale": {"id": "adscale", "hosts": ["adscale.de"], "parent": "Stroer"}, "Sizmek": {"id": "sizmek", "hosts": ["serving-sys.com"], "parent": "Sizmek"}, "Deustche Telekom": {"id": "t-mobile", "hosts": ["t-online.de", "telekom.de", "telekom.com", "toi.de", "sdp-campaign.de", "telekom-dienste.de"], "parent": "Unknown"}, "ChartBeat": {"id": "chartbeat", "hosts": ["chartbeat.net", "chartbeat.com"], "parent": "ChartBeat"}, "Moat": {"id": "moat", "hosts": ["moatpixel.com", "moatads.com"], "parent": "Oracle"}, "mbr targeting": {"id": "mbr_targeting", "hosts": ["m6r.eu"], "parent": "Stroer"}, "Stroer Digital Media": {"id": "stroer_digital_media", "hosts": ["stroeerdigitalmedia.de", "stroeermediabrands.de", "interactivemedia.net", "stroeerdigitalgroup.de", "stroeerdp.de"], "parent": "Stroer"}, "Visual Revenue": {"id": "visual_revenue", "hosts": ["visualrevenue.com"], "parent": "Outbrain"}, "Pinterest": {"id": "pinterest", "hosts": ["pinimg.com", "pinterest.com", "d3io1k5o0zdpqr.cloudfront.net"], "parent": "Pinterest"}, "Plista": {"id": "plista", "hosts": ["plista.com"], "parent": "Plista"}, "cdnnetwok.xyz": {"id": "cdnnetwok_xyz", "hosts": ["cdnnetwok.xyz"], "parent": "Unknown"}, "xHamster": {"id": "xhamster", "hosts": ["xhcdn.com", "xhamsterlive.com", "xhamster.com"], "parent": "Unknown"}, "NetRatings SiteCensus": {"id": "netratings_sitecensus", "hosts": ["imrworldwide.com", "glanceguide.com", "vizu.com"], "parent": "Nielsen"}, "eluxer.net": {"id": "eluxer_net", "hosts": ["eluxer.net"], "parent": "Unknown"}, "worldnaturenet.xyz": {"id": "worldnaturenet_xyz", "hosts": ["worldnaturenet.xyz"], "parent": "Unknown"}, "Microsoft Services": {"id": "microsoft", "hosts": ["live.com", "msecnd.net", "windows.net", "microsofttranslator.com", "microsoftonline.com", "msedge.net", "cloudapp.net", "azurewebsites.net", "s-microsoft.com", "microsoft.com", "gfx.ms", "onestore.ms", "trouter.io"], "parent": "Microsoft"}, "Nexage": {"id": "nexage", "hosts": ["nexage.com"], "parent": "Verizon"}, "Roq.ad": {"id": "roq.ad", "hosts": ["rqtrk.eu"], "parent": "Unknown"}, "Visual Website Optimizer": {"id": "visual_website_optimizer", "hosts": ["visualwebsiteoptimizer.com", "wingify.com", "d5phz18u4wuww.cloudfront.net"], "parent": "Wingify"}, "WikiMedia": {"id": "wikimedia.org", "hosts": ["wikimedia.org", "wikiquote.org", "wikipedia.org"], "parent": "Unknown"}, "Integral Ad Science": {"id": "integral_ad_science", "hosts": ["adsafeprotected.com", "iasds01.com"], "parent": "Integral Ad Science"}, "Aggregate Knowledge": {"id": "aggregate_knowledge", "hosts": ["agkn.com"], "parent": "Neustar "}, "VG Wort": {"id": "vg_wort", "hosts": ["vgwort.de"], "parent": "VG Wort"}, "Zanox": {"id": "zanox", "hosts": ["zanox-affiliate.de", "zanox.com", "zanox.ws"], "parent": "Unknown"}, "Conversant": {"id": "conversant", "hosts": ["fastclick.net", "mplxtms.com", "mediaplex.com"], "parent": "APN News and Media Ltd"}, "BuySellAds": {"id": "buysellads", "hosts": ["buysellads.com"], "parent": "BuySellAds.com"}, "Oracle Maxymiser": {"id": "maxymiser", "hosts": ["maxymiser.net"], "parent": "Oracle Maxymiser"}, "Traffic Stars": {"id": "traffic_stars", "hosts": ["trafficstars.com", "tsyndicate.com"], "parent": "Traffic Stars"}, "CreateJS": {"id": "createjs", "hosts": ["createjs.com"], "parent": "Unknown"}, "PornHub": {"id": "pornhub", "hosts": ["phncdn.com", "pornhub.com"], "parent": "Unknown"}, "Econda": {"id": "econda", "hosts": ["econda-monitor.de"], "parent": "Econda"}, "affilinet": {"id": "affilinet", "hosts": ["banner-rotation.com", "webmasterplan.com"], "parent": "Axel Springer Group"}, "LinkedIn": {"id": "linkedin", "hosts": ["linkedin.com", "bizographics.com", "bizo.com", "licdn.com"], "parent": "LinkedIn"}, "JW Player": {"id": "jw_player", "hosts": ["jwpcdn.com", "jwpsrv.com", "d21rhj7n383afu.cloudfront.net", "jwpltx.com", "jwplayer.com", "jwplatform.com"], "parent": "JW Player"}, "SpotXchange": {"id": "spotxchange", "hosts": ["spotxcdn.com", "spotxchange.com", "spotx.tv"], "parent": "RTL Group"}, "Crazy Egg": {"id": "crazy_egg", "hosts": ["dnn506yrbagrg.cloudfront.net", "crazyegg.com", "cetrk.com"], "parent": "Crazy Egg"}, "DataXu": {"id": "dataxu", "hosts": ["w55c.net"], "parent": "DataXu"}, "Contact Impact": {"id": "contact_impact", "hosts": ["df-srv.de", "adrolays.de", "c-i.as"], "parent": "Axel Springer Group"}, "Dotomi": {"id": "dotomi", "hosts": ["dtmpub.com", "dtmc.com", "dotomi.com"], "parent": "Dotomi"}, "Eyeota": {"id": "eyeota", "hosts": ["eyeota.net"], "parent": "Eyeota"}, "intelliAd": {"id": "intelliad", "hosts": ["intelliad.de", "intelliad.com"], "parent": "intelliAd"}, "JuggCash": {"id": "juggcash", "hosts": ["contentabc.com", "mofos.com"], "parent": "JuggCash"}, "Webtrends": {"id": "webtrends", "hosts": ["webtrends.com", "webtrendslive.com"], "parent": "Webtrends"}, "LiveRamp": {"id": "liveramp", "hosts": ["rlcdn.com", "rapleaf.com"], "parent": "Acxiom"}, "Flashtalking": {"id": "flashtalking", "hosts": ["flashtalking.com"], "parent": "Flashtalking"}, "etracker": {"id": "etracker", "hosts": ["etracker.com", "sedotracker.com", "etracker.de"], "parent": "etracker GmbH"}, "TrafficJunky": {"id": "trafficjunky", "hosts": ["trafficjunky.net"], "parent": "TrafficJunky"}, "Twiago": {"id": "twiago", "hosts": ["twiago.com"], "parent": "Unknown"}, "Batch Media": {"id": "batch_media", "hosts": ["t4ft.de"], "parent": "The ADEX"}, "Quantcount": {"id": "quantcount", "hosts": ["quantcount.com"], "parent": "Quantcast"}, "Indeed": {"id": "indeed", "hosts": ["indeed.com"], "parent": "Indeed"}, "M. P. NEWMEDIA": {"id": "m._p._newmedia", "hosts": ["mpnrs.com"], "parent": "Unknown"}, "SevenOne Media": {"id": "sevenone_media", "hosts": ["71i.de"], "parent": "Unknown"}, "Heatmap": {"id": "heatmap", "hosts": ["heatmap.it"], "parent": "Heatmap"}, "eXelate": {"id": "exelate", "hosts": ["exelator.com"], "parent": "Harris Insights & Analytics"}, "Alexa Metrics": {"id": "alexa_metrics", "hosts": ["d31qbv1cthcecs.cloudfront.net", "d5nxst8fruw4z.cloudfront.net", "alexametrics.com"], "parent": "Alexa"}, "The Reach Group": {"id": "the_reach_group", "hosts": ["redintelligence.net"], "parent": "Unknown"}, "Unknown": {"id": "autoscout24.net", "hosts": [], "parent": "autoscout24.net"}, "Tapad": {"id": "tapad", "hosts": ["tapad.com"], "parent": "Telenor Group"}, "Lotame": {"id": "lotame", "hosts": ["crwdcntrl.net"], "parent": "Lotame"}, "Digital Analytix": {"id": "digital_analytix", "hosts": ["nedstat.com", "sitestat.com"], "parent": "Adobe"}, "PulsePoint": {"id": "pulsepoint", "hosts": ["contextweb.com", "pulsepoint.com"], "parent": "Pulsepoint Ad Exchange"}, "Highwinds": {"id": "highwinds", "hosts": ["hwcdn.net"], "parent": "Highwinds"}, "OWA": {"id": "owa", "hosts": ["oewabox.at"], "parent": "The Austrian Web Analysis (OWA)"}, "Browser Update": {"id": "browser_update", "hosts": ["browser-update.org"], "parent": "Browser-Update"}, "wywy": {"id": "wywy.com", "hosts": ["wywy.com", "wywyuserservice.com"], "parent": "Unknown"}, "Rocket Fuel": {"id": "rocket_fuel", "hosts": ["rfihub.net", "rfihub.com", "ru4.com", "xplusone.com"], "parent": "Sizmek"}, "1plusX": {"id": "1plusx", "hosts": ["opecloud.com"], "parent": "Unknown"}, "Parsely": {"id": "parsely", "hosts": ["d1z2jf7jlzjs58.cloudfront.net", "parsely.com"], "parent": "Parse.ly"}, "Gravatar": {"id": "gravatar", "hosts": ["gravatar.com"], "parent": "Automattic"}, "Google Shopping": {"id": "google_trusted_stores", "hosts": ["googlecommerce.com"], "parent": "Google"}, "DoublePimp": {"id": "doublepimp", "hosts": ["redcourtside.com", "doublepimp.com", "doublepimpssl.com", "zerezas.com", "xeontopa.com"], "parent": "DoublePimp"}, "NEORY ": {"id": "neory_", "hosts": ["ad-srv.net"], "parent": "Unknown"}, "Mouseflow": {"id": "mouseflow", "hosts": ["mouseflow.com"], "parent": "Mouseflow"}, "Improve Digital": {"id": "improve_digital", "hosts": ["360yield.com"], "parent": "Improve Digital"}, "Linkpulse": {"id": "linkpulse", "hosts": ["lp4.io"], "parent": "Linkpulse"}, "AppDynamics": {"id": "appdynamics", "hosts": ["de8of677fyt0b.cloudfront.net", "appdynamics.com", "eum-appdynamics.com"], "parent": "AppDynamics"}, "ad4mat": {"id": "ad4mat", "hosts": ["ad4mat.fi", "ad4mat.it", "ad4mat.gr", "ad4mat.de", "ad4mat.pl", "ad4mat.bg", "ad4mat.ar", "ad4mat.ru", "ad4mat.dk", "ad4mat.cz", "ad4mat.tr", "ad4mat.ch", "ad4mat.net", "ad4mat.br", "ad4mat.be", "ad4mat.at", "ad4mat.fr", "ad4mat.nl", "ad4mat.co.uk", "ad4mat.no", "ad4mat.se", "ad4mat.ro", "ad4mat.es", "ad4mat.hu", "ad4mat.mx"], "parent": "ad4mat"}, "Instagram": {"id": "instagram_com", "hosts": ["instagram.com", "cdninstagram.com"], "parent": "Facebook"}, "Scarab Research": {"id": "scarabresearch", "hosts": ["scarabresearch.com"], "parent": "Emarsys"}, "WordPress": {"id": "wordpress_stats", "hosts": ["wp.com", "wordpress.com", "w.org"], "parent": "Automattic"}, "AB Tasty": {"id": "ab_tasty", "hosts": ["abtasty.com", "d1447tq2m68ekg.cloudfront.net"], "parent": "AB Tasty"}, "LiveInternet": {"id": "liveinternet", "hosts": ["yadro.ru"], "parent": "LiveInternet"}, "StickyAds": {"id": "stickyads", "hosts": ["stickyadstv.com"], "parent": "Comcast"}, "Advanced Hosters": {"id": "advanced_hosters", "hosts": ["ahcdn.com"], "parent": "Unknown"}, "jsDelivr": {"id": "jsdelivr", "hosts": ["jsdelivr.net"], "parent": "Unknown"}, "Kameleoon": {"id": "kameleoon", "hosts": ["kameleoon.com", "kameleoon.eu"], "parent": "Kameleoon"}, "Advolution": {"id": "advolution", "hosts": ["advolution.de"], "parent": "Advolution"}, "TubeMogul": {"id": "tubemogul", "hosts": ["tubemogul.com"], "parent": "TubeMogul"}, "m-pathy": {"id": "m-pathy", "hosts": ["m-pathy.com"], "parent": "m-pathy"}, "OMS": {"id": "oms", "hosts": ["omsnative.de", "oms.eu"], "parent": "Unknown"}, "Ensighten": {"id": "ensighten", "hosts": ["ensighten.com"], "parent": "Ensighten"}, "Teads": {"id": "teads", "hosts": ["teads.tv"], "parent": "Teads"}, "Disqus": {"id": "disqus", "hosts": ["disqus.com", "disquscdn.com"], "parent": "Disqus"}, "Ve Interactive": {"id": "ve_interactive", "hosts": ["veinteractive.com"], "parent": "Ve Interactive"}, "Cedexis Radar": {"id": "cedexis_radar", "hosts": ["cedexis.net", "cedexis-radar.net", "cedexis.com", "cedexis-test.com"], "parent": "Cedexis"}, "Typekit by Adobe": {"id": "typekit_by_adobe", "hosts": ["typekit.com", "typekit.net"], "parent": "Adobe"}, "web.de": {"id": "web.de", "hosts": ["web.de", "webde.de"], "parent": "Unknown"}, "Pingdom": {"id": "pingdom", "hosts": ["pingdom.net"], "parent": "Pingdom"}, "SOASTA mPulse": {"id": "soasta_mpulse", "hosts": ["mpstat.us", "go-mpulse.net"], "parent": "Akamai Technologies"}, "BurdaForward": {"id": "burda", "hosts": ["bf-ad.net", "bf-tools.net"], "parent": "Hubert Burda Media"}, "Ad Spirit": {"id": "ad_spirit", "hosts": ["adspirit.de", "adspirit.net"], "parent": "AdSpirit"}, "Adobe Dynamic Media (Scene7)": {"id": "scene7.com", "hosts": ["scene7.com"], "parent": "Adobe"}, "Kupona": {"id": "kupona", "hosts": ["d31bfnnwekbny6.cloudfront.net", "kpcustomer.de", "q-sis.de"], "parent": "ACTU/CCI"}, "Mixpanel": {"id": "mixpanel", "hosts": ["mixpanel.com", "mxpnl.net", "mxpnl.com"], "parent": "Mixpanel"}, "stripchat.com": {"id": "stripchat.com", "hosts": ["stripchat.com", "stripcdn.com"], "parent": "Unknown"}, "Monotype GmbH": {"id": "monotype_gmbh", "hosts": ["fonts.net"], "parent": "Unknown"}, "Tag Commander": {"id": "tag_commander", "hosts": ["tagcommander.com", "commander1.com"], "parent": "Tag Commander"}, "Dynamic 1001 GmbH": {"id": "dynamic_1001_gmbh", "hosts": ["media01.eu", "dyntracker.de"], "parent": "Unknown"}, "Datalogix": {"id": "datalogix", "hosts": ["nexac.com"], "parent": "Datalogix"}, "ClickTale": {"id": "clicktale", "hosts": ["cdngc.net", "clicktale.net", "pantherssl.com"], "parent": "ClickTale"}, "Usabilla": {"id": "usabilla", "hosts": ["usabilla.com"], "parent": "Usabilla"}, "zononi.com": {"id": "zononi.com", "hosts": ["zononi.com"], "parent": "Unknown"}, "RTL Group": {"id": "rtl_group", "hosts": ["rtl.de", "static-fra.de", "technical-service.net"], "parent": "Unknown"}, "Google Appspot": {"id": "google_appspot", "hosts": ["appspot.com"], "parent": "Google"}, "Infectious Media": {"id": "infectious_media", "hosts": ["impressiondesk.com", "impdesk.com"], "parent": "Infectious Media"}, "pizzaandads.com": {"id": "pizzaandads_com", "hosts": ["pizzaandads.com"], "parent": "Unknown"}, "Spoteffect": {"id": "spoteffect", "hosts": ["spoteffects.net"], "parent": "Spoteffect"}, "Next Tuesday GmbH": {"id": "nt.vc", "hosts": ["nt.vc"], "parent": "Unknown"}, "1&1 Internet": {"id": "1und1", "hosts": ["website-start.de", "1and1.com", "1und1.de", "uicdn.com"], "parent": "Unknown"}, "eKomi": {"id": "ekomi", "hosts": ["ekomi.de"], "parent": "eKomi"}, "Sociomantic": {"id": "sociomantic", "hosts": ["sociomantic.com"], "parent": "Sociomantic Labs GmbH"}, "AOL CDN": {"id": "aol_cdn", "hosts": ["aolcdn.com"], "parent": "Verizon"}, "immobilienscout24.de": {"id": "immobilienscout24_de", "hosts": ["immobilienscout24.de", "static-immobilienscout24.de"], "parent": "Unknown"}, "Evidon": {"id": "evidon", "hosts": ["betrad.com"], "parent": "Unknown"}, "SmartClip": {"id": "smartclip", "hosts": ["smartclip.net"], "parent": "smartclip"}, "Metapeople": {"id": "metapeople", "hosts": ["metalyzer.com", "mlsat02.de"], "parent": "Metapeople"}, "Drawbridge": {"id": "drawbridge", "hosts": ["adsymptotic.com"], "parent": "Drawbridge"}, "Bunchbox": {"id": "bunchbox", "hosts": ["bunchbox.co"], "parent": "Bunchbox"}, "cpx.to": {"id": "cpx.to", "hosts": ["cpx.to"], "parent": "Unknown"}, "eStat": {"id": "estat", "hosts": ["cybermonitor.com", "estat.com"], "parent": "Mediametrie"}, "cdn13.com": {"id": "cdn13.com", "hosts": ["cdn13.com"], "parent": "Unknown"}, "Weborama": {"id": "weborama", "hosts": ["weborama.com", "weborama.fr", "adrcdn.com", "adrcntr.com"], "parent": "Weborama"}, "zalando.de": {"id": "zalando_de", "hosts": ["zalando.de", "ztat.net", "zalan.do"], "parent": "Unknown"}, "Adap.tv": {"id": "adap.tv", "hosts": ["adap.tv"], "parent": "Verizon"}, "Mail.Ru Group": {"id": "mail.ru_group", "hosts": ["odnoklassniki.ru", "mail.ru", "ok.ru", "imgsmail.ru", "mradx.net"], "parent": "Mail.Ru Group"}, "G+J e|MS": {"id": "gujems", "hosts": ["emsservice.de"], "parent": "Gruner + Jahr AG"}, "ShareThis": {"id": "sharethis", "hosts": ["sharethis.com"], "parent": "ShareThis"}, "Booking.com": {"id": "booking.com", "hosts": ["booking.com", "bstatic.com"], "parent": "Unknown"}, "Seeding Alliance": {"id": "seeding_alliance", "hosts": ["nativendo.de"], "parent": "Unknown"}, "TVSquared": {"id": "tvsquared.com", "hosts": ["tvsquared.com"], "parent": "Unknown"}, "Userlike": {"id": "userlike.com", "hosts": ["userlike.com", "dq4irj27fs462.cloudfront.net", "userlike-cdn-widgets.s3-eu-west-1.amazonaws.com"], "parent": "Unknown"}, "TripleLift": {"id": "triplelift", "hosts": ["triplelift.com", "d3iwjrnl4m67rd.cloudfront.net", "3lift.com"], "parent": "TripleLift"}, "Brightcove": {"id": "brightcove", "hosts": ["brightcove.com"], "parent": "Brightcove"}, "NET-Metrix": {"id": "net-metrix", "hosts": ["wemfbox.ch"], "parent": "NET-Metrix"}, "Gemius": {"id": "gemius", "hosts": ["gemius.pl"], "parent": "Gemius SA"}, "Adloox": {"id": "adloox", "hosts": ["adlooxtracking.com"], "parent": "Adloox"}, "Deutsche Bahn": {"id": "bahn_de", "hosts": ["img-bahn.de", "bahn.de"], "parent": "Unknown"}, "Bazaarvoice": {"id": "bazaarvoice", "hosts": ["bazaarvoice.com"], "parent": "Bazaarvoice"}, "Schnee von Morgen": {"id": "schneevonmorgen.com", "hosts": ["svonm.com", "schneevonmorgen.com"], "parent": "Unknown"}, "alephd": {"id": "alephd.com", "hosts": ["alephd.com"], "parent": "Verizon"}, "ShareThrough": {"id": "sharethrough", "hosts": ["shareth.ru", "sharethrough.com"], "parent": "Sharethrough"}, "VKontakte": {"id": "vkontakte_widgets", "hosts": ["userapi.com", "vkontakte.ru", "vk.com"], "parent": "Unknown"}, "neXeps": {"id": "nexeps.com", "hosts": ["nexeps.com"], "parent": "Unknown"}, "Kiosked": {"id": "kiosked", "hosts": ["kiosked.com"], "parent": "Kiosked"}, "Semasio": {"id": "semasio", "hosts": ["semasio.net"], "parent": "Semasio"}, "Trustpilot": {"id": "trustpilot", "hosts": ["trustpilot.com"], "parent": "Trustpilot"}, "Vibrant Ads": {"id": "vibrant_ads", "hosts": ["intellitxt.com"], "parent": "Vibrant Media"}, "EroAdvertising": {"id": "eroadvertising", "hosts": ["ero-advertising.com", "eroadvertising.com"], "parent": "Ero Advertising"}, "Metrigo": {"id": "metrigo", "hosts": ["metrigo.com"], "parent": "Metrigo"}, "epoq": {"id": "epoq", "hosts": ["epoq.de"], "parent": "epoq"}, "Amazon Payments": {"id": "amazon_payments", "hosts": ["payments-amazon.com"], "parent": "Amazon"}, "AdUp Technology": {"id": "adup-tech.com", "hosts": ["adup-tech.com"], "parent": "Unknown"}, "Jetpack": {"id": "jetpack", "hosts": ["pixel.wp.com", "stats.wp.com"], "parent": "Automattic"}, "Zopim": {"id": "zopim", "hosts": ["zopim.com"], "parent": "Zopim"}, "Next Performance": {"id": "next_performance", "hosts": ["nxtck.com"], "parent": "Nextperf"}, "LivePerson": {"id": "liveperson", "hosts": ["lpsnmedia.net", "liveperson.net"], "parent": "LivePerson"}, "Videology": {"id": "videology", "hosts": ["tidaltv.com"], "parent": "Unknown"}, "Akanoo": {"id": "akanoo", "hosts": ["akanoo.com"], "parent": "Akanoo"}, "TradeDoubler": {"id": "tradedoubler", "hosts": ["tradedoubler.com"], "parent": "TradeDoubler"}, "YouPorn": {"id": "youporn", "hosts": ["ypncdn.com", "youporn.com"], "parent": "Unknown"}, "BidTheatre": {"id": "bidtheatre", "hosts": ["bidtheatre.com"], "parent": "BidTheatre"}, "Openload": {"id": "openload", "hosts": ["oloadcdn.net", "openload.co"], "parent": "Unknown"}, "Hurra Tracker": {"id": "hurra_tracker", "hosts": ["hurra.com"], "parent": "Hurra Communications"}, "congstar.de": {"id": "congstar.de", "hosts": ["congstar.de"], "parent": "Unknown"}, "sovrn": {"id": "sovrn", "hosts": ["lijit.com", "d3pkae9owd2lcf.cloudfront.net"], "parent": "Unknown"}, "Tisoomi": {"id": "tisoomi", "hosts": ["tisoomi-services.com"], "parent": "Unknown"}, "FriendFinder Network": {"id": "friendfinder_network", "hosts": ["getiton.com", "pop6.com", "adultfriendfinder.com", "streamray.com", "cams.com", "amigos.com", "board-books.com", "facebookofsex.com", "nostringsattached.com"], "parent": "FriendFinder Networks"}, "Rhythmone Beacon": {"id": "rhythmone_beacon", "hosts": ["1rx.io"], "parent": "RythmOne"}, "Falk Technologies": {"id": "falk_technologies", "hosts": ["angsrvr.com"], "parent": "Unknown"}, "RadiumOne": {"id": "radiumone", "hosts": ["gwallet.com", "r1-cdn.net"], "parent": "RhythmOne"}, "Rackspace": {"id": "rackcdn.com", "hosts": ["rackcdn.com"], "parent": "Unknown"}, "otto.de": {"id": "otto.de", "hosts": ["otto.de"], "parent": "Unknown"}, "TrafficHaus": {"id": "traffichaus", "hosts": ["traffichaus.com"], "parent": "TrafficHaus"}, "TNS": {"id": "tns", "hosts": ["tns-gallup.dk", "spring-tns.net", "statistik-gallup.net", "tns-counter.ru", "sesamestats.com", "tns-cs.net", "research-int.se"], "parent": "TNS"}, "xvideos.com": {"id": "xvideos_com", "hosts": ["xvideos.com", "xvideos-cdn.com"], "parent": "Unknown"}, "DynAdmic": {"id": "dynadmic", "hosts": ["dyntrk.com"], "parent": "Unknown"}, "circIT": {"id": "circit", "hosts": ["iqcontentplatform.de"], "parent": "Unknown"}, "Content Spread": {"id": "content_spread", "hosts": ["contentspread.net"], "parent": "Unknown"}, "TRUSTe Notice": {"id": "truste_notice", "hosts": ["choices.truste.com", "choices-or.truste.com"], "parent": "TrustArc"}, "adgoal": {"id": "adgoal", "hosts": ["smartredirect.de", "smartadcheck.de"], "parent": "adgoal"}, "Microsoft Ajax CDN": {"id": "aspnetcdn", "hosts": ["aspnetcdn.com"], "parent": "Microsoft"}, "TripAdvisor": {"id": "tripadvisor", "hosts": ["tamgrt.com", "tripadvisor.com", "tripadvisor.co.uk", "tacdn.com", "tripadvisor.de"], "parent": "IAC (InterActiveCorp)"}, "highwebmedia.com": {"id": "highwebmedia.com", "hosts": ["highwebmedia.com"], "parent": "Unknown"}, "UserReport": {"id": "userreport", "hosts": ["userreport.com"], "parent": "UserReport"}, "idealo.com": {"id": "idealo_com", "hosts": ["idealo.com"], "parent": "Unknown"}, "Statcounter": {"id": "statcounter", "hosts": ["statcounter.com"], "parent": "StatCounter"}, "Platform161": {"id": "161media", "hosts": ["creative-serving.com"], "parent": "Unknown"}, "FraudLogix": {"id": "fraudlogix", "hosts": ["yabidos.com"], "parent": "Unknown"}, "etahub.com": {"id": "etahub.com", "hosts": ["etahub.com"], "parent": "Unknown"}, "Gigya": {"id": "gigya", "hosts": ["gigya.com"], "parent": "Gigya"}, "Signal": {"id": "signal", "hosts": ["btstatic.com", "thebrighttag.com", "signal.co"], "parent": "Unknown"}, "MaxCDN": {"id": "maxcdn", "hosts": ["netdna-ssl.com", "netdna-cdn.com", "maxcdn.com"], "parent": "Unknown"}, "o2online.de": {"id": "o2online.de", "hosts": ["o2online.de"], "parent": "Unknown"}, "PopAds": {"id": "popads", "hosts": ["popadscdn.net", "popads.net"], "parent": "PopAds"}, "Remintrex": {"id": "remintrex", "hosts": ["remintrex.com"], "parent": "Unknown"}, "foxydeal.com": {"id": "foxydeal_com", "hosts": ["foxydeal.com"], "parent": "Unknown"}, "i-Behavior": {"id": "i-behavior", "hosts": ["ib-ibi.com"], "parent": "KBM Group"}, "AdRoll": {"id": "adroll", "hosts": ["adroll.com"], "parent": "Unknown"}, "Zendesk": {"id": "zendesk", "hosts": ["zendesk.com"], "parent": "Zendesk"}, "Brightcove Player": {"id": "brightcove_player", "hosts": ["brightcove.net"], "parent": "Brightcove"}, "LiquidM Technology GmbH": {"id": "liquidm_technology_gmbh", "hosts": ["lqm.io", "lqmcdn.com"], "parent": "Unknown"}, "Zencoder": {"id": "zencoder", "hosts": ["zencdn.net"], "parent": "Zencoder"}, "glotgrx.com": {"id": "glotgrx.com", "hosts": ["glotgrx.com"], "parent": "Unknown"}, "IXI Digital": {"id": "ixi_digital", "hosts": ["ixiaa.com"], "parent": "IXI Services"}, "Imgur": {"id": "imgur", "hosts": ["imgur.com"], "parent": "Unknown"}, "Adglue": {"id": "adglue", "hosts": ["adsafety.net"], "parent": "Admans"}, "OneSignal": {"id": "onesignal", "hosts": ["onesignal.com"], "parent": "OneSignal"}, "Blau": {"id": "blau.de", "hosts": ["blau.de"], "parent": "Unknown"}, "Rambler": {"id": "rambler", "hosts": ["rambler.ru", "top100.ru", "rnet.plus"], "parent": "Unknown"}, "ChannelPilot Solutions": {"id": "channel_pilot_solutions", "hosts": ["cptrack.de"], "parent": "Unknown"}, "PageFair": {"id": "pagefair", "hosts": ["pagefair.com", "blockmetrics.com", "pagefair.net"], "parent": "PageFair"}, "OnThe.io": {"id": "onthe.io", "hosts": ["onthe.io"], "parent": "onthe.io"}, "Perfect Market": {"id": "perfect_market", "hosts": ["perfectmarket.com"], "parent": "Perfect Market"}, "Kontextr": {"id": "kontextr", "hosts": ["ktxtr.com"], "parent": "Kontext"}, "MyFonts": {"id": "myfonts_counter", "hosts": ["myfonts.net"], "parent": "MyFonts"}, "Traffective": {"id": "traffective", "hosts": ["cdntrf.com", "traffective.com"], "parent": "Unknown"}, "sheego.de": {"id": "sheego.de", "hosts": ["sheego.de"], "parent": "Unknown"}, "Findologic": {"id": "findologic.com", "hosts": ["findologic.com"], "parent": "Unknown"}, "Whatbroadcast": {"id": "whatbroadcast", "hosts": ["whatsbroadcast.com"], "parent": "WhatsBroadcast"}, "EMS Mobile": {"id": "emsmobile.de", "hosts": ["emsmobile.de"], "parent": "Unknown"}, "Yieldlove": {"id": "yieldlove", "hosts": ["yieldlove.com", "yieldlove-ad-serving.net"], "parent": "Unknown"}, "Quisma": {"id": "quisma", "hosts": ["quisma.com", "qservz.com"], "parent": "Quisma"}, "trbo": {"id": "trbo", "hosts": ["trbo.com"], "parent": "trbo"}, "Smaato": {"id": "smaato", "hosts": ["smaato.net"], "parent": "Spearhead Integrated Marketing Communication"}, "iAdvize": {"id": "iadvize", "hosts": ["iadvize.com"], "parent": "iAdvize"}, "ADventori": {"id": "adventori", "hosts": ["adventori.com"], "parent": "Unknown"}, "iovation": {"id": "iovation", "hosts": ["iovation.com", "iesnare.com"], "parent": "iovation"}, "easylist.club": {"id": "easylist_club", "hosts": ["easylist.club"], "parent": "Unknown"}, "Microsoft Network": {"id": "msn", "hosts": ["ads.msn.com", "ads1.msn.com", "bat.r.msn.com", "adsyndication.msn.com", "flex.msn.com", "col.stc.s-msn.com", "s-msn.com", "msn.com"], "parent": "Microsoft"}, "AdClear": {"id": "adclear", "hosts": ["adclear.net"], "parent": "AdClear"}, "GENIEE": {"id": "geniee", "hosts": ["gssprt.jp"], "parent": "Unknown"}, "Just Premium": {"id": "just_premium", "hosts": ["justpremium.nl", "justpremium.com"], "parent": "Just Premium"}, "Are You a Human": {"id": "are_you_a_human", "hosts": ["areyouahuman.com"], "parent": "distil networks"}, "stailamedia.com": {"id": "stailamedia_com", "hosts": ["stailamedia.com"], "parent": "Unknown"}, "Media.net": {"id": "media.net", "hosts": ["media.net"], "parent": "media.net"}, "Wetter.com": {"id": "wetter_com", "hosts": ["wettercomassets.com", "wetter.com"], "parent": "Unknown"}, "MarketGid": {"id": "marketgid", "hosts": ["dt07.net", "dt00.net", "mgid.com"], "parent": "MarketGid USA"}, "Loggly": {"id": "loggly", "hosts": ["loggly.com"], "parent": "Loggly"}, "Keycdn": {"id": "kxcdn.com", "hosts": ["kxcdn.com"], "parent": "Unknown"}, "srvtrck.com": {"id": "srvtrck.com", "hosts": ["srvtrck.com"], "parent": "Unknown"}, "Usemax": {"id": "usemax", "hosts": ["usemaxserver.de", "usemax.de"], "parent": "Usemax"}, "SpringServe": {"id": "springserve", "hosts": ["springserve.com"], "parent": "SpringServe"}, "xfreeservice.com": {"id": "xfreeservice.com", "hosts": ["xfreeservice.com"], "parent": "Unknown"}, "Flickr": {"id": "flickr_badge", "hosts": ["flickr.com", "staticflickr.com"], "parent": "Verizon"}, "SmartStream.TV": {"id": "smartstream.tv", "hosts": ["smartstream.tv"], "parent": "Unknown"}, "SiteScout": {"id": "sitescout", "hosts": ["sitescout.com"], "parent": "SiteScout"}, "Digidip": {"id": "digidip", "hosts": ["digidip.net"], "parent": "Digidip"}, "Acxiom": {"id": "acxiom", "hosts": ["acxiomapac.com"], "parent": "Acxiom"}, "Qubit Opentag": {"id": "qubit", "hosts": ["qubit.com", "d3c3cq33003psk.cloudfront.net"], "parent": "Unknown"}, "Beeswax": {"id": "beeswax", "hosts": ["bidr.io"], "parent": "Beeswax"}, "Propeller Ads": {"id": "propeller_ads", "hosts": ["onclickads.net", "onclkds.com", "propellerpops.com", "oclaserver.com", "propellerads.com", "onclasrv.com"], "parent": "Propeller Ads"}, "Advertising Technologies Ltd": {"id": "rtmark.net", "hosts": ["rtmark.net"], "parent": "Big Wall Vision"}, "ciuvo.com": {"id": "ciuvo.com", "hosts": ["ciuvo.com"], "parent": "Unknown"}, "Vimeo": {"id": "vimeo", "hosts": ["vimeocdn.com", "vimeo.com"], "parent": "IAC (InterActiveCorp)"}, "Klarna": {"id": "klarna.com", "hosts": ["klarna.com"], "parent": "Unknown"}, "Refined Labs": {"id": "refined_labs", "hosts": ["refinedads.com"], "parent": "Refined Labs"}, "IBM Customer Experience": {"id": "ibm_customer_experience", "hosts": ["cmcore.com", "coremetrics.com"], "parent": "IBM"}, "Symantec (Norton Secured Seal)": {"id": "symantec", "hosts": ["norton.com", "verisign.com", "symantec.com", "thawte.com"], "parent": "Symantec"}, "United Digital Group": {"id": "united_digital_group", "hosts": ["nonstoppartner.net"], "parent": "Unknown"}, "westlotto.com": {"id": "westlotto_com", "hosts": ["westlotto.com"], "parent": "Unknown"}, "Marin Search Marketer": {"id": "marin_search_marketer", "hosts": ["marinsm.com"], "parent": "Marin Software"}, "office365.com": {"id": "office365.com", "hosts": ["office365.com"], "parent": "Microsoft"}, "Admeta": {"id": "admeta", "hosts": ["admaym.com", "atemda.com"], "parent": "AdMeta"}, "Unruly Media": {"id": "unruly_media", "hosts": ["unrulymedia.com"], "parent": "Unruly"}, "ATG Ad Tech Group": {"id": "atg_group", "hosts": ["oadts.com"], "parent": "Unknown"}, "AdTriba": {"id": "adtriba.com", "hosts": ["adtriba.com"], "parent": "Unknown"}, "freenet.de": {"id": "freenet_de", "hosts": ["freenet.de", "freent.de"], "parent": "Unknown"}, "Schibsted Media Group": {"id": "schibsted", "hosts": ["schibsted.com", "schibsted.io"], "parent": "Schibsted ASA"}, "cXense": {"id": "cxense", "hosts": ["cxense.com"], "parent": "Cxense"}, "Sentry": {"id": "sentry", "hosts": ["ravenjs.com", "sentry.io"], "parent": "Unknown"}, "Autoscout24": {"id": "autoscout24.com", "hosts": ["autoscout24.net", "autoscout24.com"], "parent": "Unknown"}, "ICF Technology": {"id": "icf_technology", "hosts": ["nsimg.net"], "parent": "Unknown"}, "Reddit": {"id": "reddit", "hosts": ["reddit.com", "redditmedia.com", "redditstatic.com", "redd.it"], "parent": "reddit"}, "vorwerk.de": {"id": "vorwerk.de", "hosts": ["vorwerk.de"], "parent": "Unknown"}, "RTB House": {"id": "rtb_house", "hosts": ["creativecdn.com"], "parent": "RTB House"}, "CQuotient": {"id": "cquotient.com", "hosts": ["cquotient.com"], "parent": "Salesforce"}, "Mov.ad ": {"id": "mov.ad_", "hosts": ["movad.net", "movad.de"], "parent": "Unknown"}, "Internet BillBoard": {"id": "internet_billboard", "hosts": ["ibillboard.com", "goadservices.com"], "parent": "Internet BillBoard"}, "CoNative": {"id": "conative.de", "hosts": ["conative.de"], "parent": "Unknown"}, "Polyfill.io": {"id": "polyfill.io", "hosts": ["polyfill.io"], "parent": "Unknown"}, "Cliplister": {"id": "mycliplister.com", "hosts": ["mycliplister.com"], "parent": "Unknown"}, "iGoDigital": {"id": "igodigital", "hosts": ["igodigital.com"], "parent": "iGoDigital"}, "ThreatMetrix": {"id": "threatmetrix", "hosts": ["online-metrix.net"], "parent": "ThreatMetrix"}, "Cloudinary": {"id": "cloudinary", "hosts": ["cloudinary.com"], "parent": "Unknown"}, "Netletix": {"id": "netletix", "hosts": ["netzathleten-media.de"], "parent": "IP Deutschland"}, "GfK": {"id": "gfk", "hosts": ["sensic.net"], "parent": "GfK Group"}, "vtracy.de": {"id": "vtracy.de", "hosts": ["vtracy.de"], "parent": "Unknown"}, "Netflix": {"id": "netflix", "hosts": ["netflix.com", "nflxext.com"], "parent": "Unknown"}, "Neustar AdAdvisor": {"id": "neustar_adadvisor", "hosts": ["adadvisor.net"], "parent": "Neustar "}, "eanalyzer.de": {"id": "eanalyzer.de", "hosts": ["eanalyzer.de"], "parent": "Unknown"}, "SoundCloud": {"id": "soundcloud", "hosts": ["soundcloud.com", "sndcdn.com"], "parent": "SoundCloud"}, "Sift Science": {"id": "sift_science", "hosts": ["dtlilztwypawv.cloudfront.net", "siftscience.com"], "parent": "Sift Science"}, "Alibaba": {"id": "alibaba.com", "hosts": ["alicdn.com", "alibaba.com"], "parent": "Alibaba"}, "CDN77": {"id": "cdn77", "hosts": ["cdn77.org", "cdn77.com"], "parent": "Unknown"}, "ausgezeichnet.org": {"id": "ausgezeichnet_org", "hosts": ["ausgezeichnet.org"], "parent": "Unknown"}, "Salesforce Live Agent": {"id": "salesforce_live_agent", "hosts": ["salesforceliveagent.com", "liveagentforsalesforce.com"], "parent": "Salesforce"}, "Monetate": {"id": "monetate", "hosts": ["monetate.net"], "parent": "Monetate"}, "Bidtellect": {"id": "bidtellect", "hosts": ["bttrack.com"], "parent": "Unknown"}, "Netmining": {"id": "netmining", "hosts": ["netmng.com", "netmining.com"], "parent": "Netmining"}, "Shopping24 internet group": {"id": "s24_com", "hosts": ["s24.com"], "parent": "Unknown"}, "BangBros": {"id": "bangdom.com", "hosts": ["bangdom.com"], "parent": "Unknown"}, "redblue": {"id": "redblue_de", "hosts": ["redblue.de"], "parent": "Unknown"}, "Fyber": {"id": "fyber", "hosts": ["fyber.com"], "parent": "Unknown"}, "Dtscout": {"id": "dtscout.com", "hosts": ["dtscout.com"], "parent": "Unknown"}, "Bing Maps": {"id": "bing_maps", "hosts": ["virtualearth.net"], "parent": "Microsoft"}, "Twenga Solutions": {"id": "twenga", "hosts": ["c4tw.net"], "parent": "Unknown"}, "ScribbleLive": {"id": "scribblelive", "hosts": ["scribblelive.com"], "parent": "Unknown"}, "GetIntent": {"id": "getintent", "hosts": ["adhigh.net"], "parent": "GetIntent"}, "Azure CDN": {"id": "azureedge.net", "hosts": ["azureedge.net"], "parent": "Microsoft"}, "AdRiver": {"id": "adriver", "hosts": ["adriver.ru"], "parent": "Ad River"}, "Ancora": {"id": "ancora", "hosts": ["ancoraplatform.com"], "parent": "Ancora"}, "Peerius": {"id": "peerius", "hosts": ["peerius.com"], "parent": "Peerius"}, "Elastic Ad": {"id": "elastic_ad", "hosts": ["elasticad.net"], "parent": "Elastic Ad"}, "Adyoulike": {"id": "adyoulike", "hosts": ["adyoulike.com", "omnitagjs.com"], "parent": "Adyoulike"}, "Tremor Video": {"id": "tremor_video", "hosts": ["videohub.tv", "tremorhub.com", "tremorvideo.com"], "parent": "Unknown"}, "Adult Webmaster Empire": {"id": "adult_webmaster_empire", "hosts": ["awempire.com", "livejasmin.com", "dditscdn.com"], "parent": "Adult Webmaster Empire"}, "Simpli.fi": {"id": "simpli.fi", "hosts": ["simpli.fi"], "parent": "Simpli.fi"}, "VigLink": {"id": "viglink", "hosts": ["viglink.com"], "parent": "VigLink"}, "crimsonhexagon.com": {"id": "crimsonhexagon_com", "hosts": ["crimsonhexagon.com", "hexagon-analytics.com"], "parent": "Unknown"}, "TagMan": {"id": "tagman", "hosts": ["levexis.com"], "parent": "TagMan"}, "Webgains": {"id": "webgains", "hosts": ["webgains.com"], "parent": "Unknown"}, "Steepto": {"id": "steepto.com", "hosts": ["steepto.com"], "parent": "Unknown"}, "Zemanta": {"id": "zemanta", "hosts": ["zemanta.com"], "parent": "Zemanta"}, "Delta Projects": {"id": "delta_projects", "hosts": ["de17a.com", "adaction.se"], "parent": "Delta Projects"}, "SkimLinks": {"id": "skimlinks", "hosts": ["redirectingat.com", "skimresources.com", "skimlinks.com"], "parent": "SkimLinks"}, "RichRelevance": {"id": "richrelevance", "hosts": ["ics0.com", "richrelevance.com"], "parent": "RichRelevance"}, "Optimatic": {"id": "optimatic", "hosts": ["optimatic.com"], "parent": "Optimatic"}, "Histats": {"id": "histats", "hosts": ["histats.com"], "parent": "Histats"}, "Po.st": {"id": "po.st", "hosts": ["po.st"], "parent": "RhythmOne"}, "FLXONE": {"id": "flxone", "hosts": ["flxpxl.com", "flx1.com"], "parent": "FlxOne"}, "SimilarDeals": {"id": "similardeals.net", "hosts": ["similardeals.net"], "parent": "Unknown"}, "HEIM:SPIEL Medien GmbH": {"id": "heimspiel", "hosts": ["weltsport.net"], "parent": "Unknown"}, "Snap Engage": {"id": "snap_engage", "hosts": ["snapengage.com"], "parent": "Snap Engage"}, "Tradelab": {"id": "tradelab", "hosts": ["tradelab.fr"], "parent": "Tradelab"}, "blogspot.com": {"id": "blogspot_com", "hosts": ["blogspot.com", "blogger.com"], "parent": "Google"}, "Fit Analytics": {"id": "fit_analytics", "hosts": ["fitanalytics.com"], "parent": "Fit Analytics"}, "Qualtrics": {"id": "qualtrics", "hosts": ["qualtrics.com"], "parent": "Qualtrics"}, "Digiteka": {"id": "digiteka", "hosts": ["ultimedia.com"], "parent": "Digiteka"}, "stayfriends.de": {"id": "stayfriends.de", "hosts": ["stayfriends.de"], "parent": "Unknown"}, "woopic.com": {"id": "woopic.com", "hosts": ["woopic.com"], "parent": "Unknown"}, "adac.de": {"id": "adac_de", "hosts": ["adac.de"], "parent": "Unknown"}, "StreamRail": {"id": "streamrail.com", "hosts": ["streamrail.com", "streamrail.net"], "parent": "ironSource"}, "Skype": {"id": "skype", "hosts": ["skype.com", "skypeassets.com"], "parent": "Microsoft"}, "generaltracking.de": {"id": "generaltracking_de", "hosts": ["generaltracking.de"], "parent": "Unknown"}, "DoubleVerify": {"id": "doubleverify", "hosts": ["doubleverify.com"], "parent": "DoubleVerify"}, "Tynt": {"id": "tynt", "hosts": ["tynt.com"], "parent": "33Across"}, "Truste Consent": {"id": "truste_consent", "hosts": ["consent.truste.com"], "parent": "TrustArc"}, "webclicks24.com": {"id": "webclicks24_com", "hosts": ["webclicks24.com"], "parent": "Unknown"}, "MarkMonitor": {"id": "markmonitor", "hosts": ["caanalytics.com", "mmstat.com", "9c9media.com"], "parent": "MarkMonitor"}, "Sonobi": {"id": "sonobi", "hosts": ["sonobi.com"], "parent": "Sonobi"}, "Whos.amung.us": {"id": "whos.amung.us", "hosts": ["amung.us"], "parent": "whos.amung.us"}, "GeoTrust": {"id": "geotrust", "hosts": ["geotrust.com"], "parent": "GeoTrust"}, "GroupM Server": {"id": "groupm_server", "hosts": ["gmads.net", "grmtech.net"], "parent": "GroupM"}, "Shopgate": {"id": "shopgate.com", "hosts": ["shopgate.com"], "parent": "Unknown"}, "Tribal Fusion": {"id": "tribal_fusion", "hosts": ["tribalfusion.com", "exponential.com"], "parent": "Exponential Interactive"}, "1822direkt.de": {"id": "1822direkt.de", "hosts": ["1822direkt.de"], "parent": "Unknown"}, "ADARA Analytics": {"id": "adara_analytics", "hosts": ["yieldoptimizer.com"], "parent": "ADARA Analytics"}, "redtube.com": {"id": "redtube.com", "hosts": ["rdtcdn.com", "redtube.com"], "parent": "Unknown"}, "ehi-siegel.de": {"id": "ehi-siegel_de", "hosts": ["ehi-siegel.de"], "parent": "Unknown"}, "Opinary": {"id": "opinary", "hosts": ["opinary.com"], "parent": "Unknown"}, "belboon GmbH": {"id": "belboon_gmbh", "hosts": ["belboon.de"], "parent": "Unknown"}, "DimML": {"id": "dimml", "hosts": ["dimml.io"], "parent": "Unknown"}, "adverServe": {"id": "adverserve", "hosts": ["adverserve.net"], "parent": "adverServe"}, "DANtrack": {"id": "dantrack.net", "hosts": ["dantrack.net"], "parent": "Dentsu Aegis Network"}, "LifeStreet Media": {"id": "lifestreet_media", "hosts": ["lfstmedia.com"], "parent": "LifeStreet Media"}, "Visual IQ": {"id": "visual_iq", "hosts": ["myvisualiq.net"], "parent": "VisualIQ"}, "Fastly": {"id": "fastlylb.net", "hosts": ["fastly.net", "fastlylb.net"], "parent": "Unknown"}, "RawGit": {"id": "rawgit", "hosts": ["rawgit.com"], "parent": "Unknown"}, "Sekindo": {"id": "sekindo", "hosts": ["sekindo.com"], "parent": "SekiNdo"}, "PowerLinks": {"id": "powerlinks", "hosts": ["powerlinks.com"], "parent": "PowerLinks"}, "Monotype Imaging Inc.": {"id": "monotype_imaging", "hosts": ["fonts.com"], "parent": "Unknown"}, "Sublime Skinz": {"id": "sublime_skinz", "hosts": ["ayads.co"], "parent": "Unknown"}, "AddToAny": {"id": "lockerz_share", "hosts": ["addtoany.com"], "parent": "LightInTheBox.com"}, "adNET.de": {"id": "adnet.de", "hosts": ["adnet.biz", "adnet.de"], "parent": "adNET.de"}, "bulkhentai.com": {"id": "bulkhentai.com", "hosts": ["bulkhentai.com"], "parent": "Unknown"}, "Conviva": {"id": "conviva", "hosts": ["conviva.com"], "parent": "Conviva"}, "codeonclick.com": {"id": "codeonclick.com", "hosts": ["codeonclick.com"], "parent": "Unknown"}, "GP One GmbH": {"id": "skadtec.com", "hosts": ["skadtec.com"], "parent": "Unknown"}, "mycdn.me": {"id": "mycdn.me", "hosts": ["mycdn.me"], "parent": "Unknown"}, "Eyeview": {"id": "eyeview", "hosts": ["eyeviewads.com"], "parent": "Eyeview"}, "LKQD": {"id": "lkqd", "hosts": ["lkqd.net"], "parent": "LKQD"}, "Traffic Fabrik": {"id": "trafficfabrik.com", "hosts": ["trafficfabrik.com"], "parent": "Unknown"}, "AdSpyglass": {"id": "adspyglass", "hosts": ["o333o.com"], "parent": "AdSpyglass"}, "Glomex": {"id": "glomex.com", "hosts": ["glomex.com", "glomex.cloud"], "parent": "Unknown"}, "adnetworkperformance.com": {"id": "adnetworkperformance.com", "hosts": ["adnetworkperformance.com"], "parent": "Unknown"}, "teufel.de": {"id": "teufel.de", "hosts": ["teufel.de"], "parent": "Unknown"}, "InsightExpress": {"id": "insightexpress", "hosts": ["insightexpressai.com"], "parent": "Millward Brown"}, "myThings": {"id": "mythings", "hosts": ["mythings.com"], "parent": "MyThings "}, "Switch Concepts": {"id": "switch_concepts", "hosts": ["switchadhub.com", "switchads.com", "myswitchads.com", "switchafrica.com"], "parent": "Switch Concepts"}, "zog.link": {"id": "zog.link", "hosts": ["zog.link"], "parent": "Unknown"}, "Orange": {"id": "orange", "hosts": ["orange.fr", "orangeads.fr"], "parent": "Orange Mobile"}, "Videoplaza": {"id": "videoplaza", "hosts": ["videoplaza.tv"], "parent": "Videoplaza"}, "Amplitude": {"id": "amplitude", "hosts": ["d24n15hnbwhuhn.cloudfront.net", "amplitude.com"], "parent": "Amplitude"}, "Intercom": {"id": "intercom", "hosts": ["intercomcdn.com", "intercom.io", "intercomassets.com"], "parent": "Intercom"}, "Airbnb": {"id": "airbnb", "hosts": ["muscache.com", "musthird.com"], "parent": "Unknown"}, "Jivox": {"id": "jivox", "hosts": ["jivox.com"], "parent": "Jivox"}, "Pulpix": {"id": "pulpix.com", "hosts": ["pulpix.com"], "parent": "Adyoulike"}, "office.com": {"id": "office.com", "hosts": ["office.com"], "parent": "Microsoft"}, "ixquick": {"id": "ixquick.com", "hosts": ["ixquick.com"], "parent": "Unknown"}, "BrandWire": {"id": "brandwire.tv", "hosts": ["brandwire.tv"], "parent": "Unknown"}, "Adnium": {"id": "adnium.com", "hosts": ["adnium.com"], "parent": "Unknown"}, "Connexity": {"id": "connexity", "hosts": ["cxt.ms", "connexity.net"], "parent": "Connexity"}, "Magnetic": {"id": "magnetic", "hosts": ["domdex.com", "d3ezl4ajpp2zy8.cloudfront.net", "domdex.net"], "parent": "Magnetic"}, "asambeauty.com": {"id": "asambeauty.com", "hosts": ["asambeauty.com"], "parent": "Unknown"}, "Nuance": {"id": "touchcommerce", "hosts": ["inq.com"], "parent": "Unknown"}, "Crimtan": {"id": "crimtan", "hosts": ["ctnsnet.com", "ctpsnet.com", "ctasnet.com"], "parent": "Crimtan"}, "Forensiq": {"id": "forensiq", "hosts": ["fqtag.com", "securepaths.com"], "parent": "CPA Detective"}, "kairion": {"id": "kairion.de", "hosts": ["kctag.net", "kairion.de"], "parent": "ProSiebenSat.1 Media"}, "AffiMax": {"id": "affimax", "hosts": ["affimax.de"], "parent": "AffiMax"}, "Curse CDN": {"id": "cursecdn.com", "hosts": ["cursecdn.com"], "parent": "Amazon"}, "Live Intent": {"id": "live_intent", "hosts": ["liadm.com"], "parent": "LiveIntent"}, "Dailymotion": {"id": "dailymotion", "hosts": ["dailymotion.com", "dmcdn.net", "dailymotionbus.com"], "parent": "Vivendi"}, "JuicyAds": {"id": "juicyads", "hosts": ["juicyads.com"], "parent": "JuicyAds"}, "Eloqua": {"id": "eloqua", "hosts": ["en25.com", "eloqua.com"], "parent": "Oracle"}, "basilic.io": {"id": "basilic.io", "hosts": ["basilic.io"], "parent": "Unknown"}, "Realperson Chat": {"id": "realperson.de", "hosts": ["realperson.de"], "parent": "Optimise-it"}, "DMWD": {"id": "dmwd", "hosts": ["ctret.de"], "parent": "Unknown"}, "OwnerIQ": {"id": "owneriq", "hosts": ["owneriq.net"], "parent": "OwnerIQ"}, "Apester": {"id": "apester", "hosts": ["apester.com"], "parent": "Apester"}, "Mindspark": {"id": "mindspark", "hosts": ["staticimgfarm.com", "imgfarm.com", "mindspark.com"], "parent": "IAC (InterActiveCorp)"}, "adworx": {"id": "adworx.at", "hosts": ["adworx.at"], "parent": "Unknown"}, "Zedo": {"id": "zedo", "hosts": ["zedo.com"], "parent": "Zedo"}, "Twyn": {"id": "twyn", "hosts": ["twyn.com"], "parent": "Twyn"}, "VoiceFive": {"id": "voicefive", "hosts": ["voicefive.com"], "parent": "ComScore"}, "AdPilot": {"id": "adpilot", "hosts": ["erne.co", "adpilot.at"], "parent": "Unknown"}, "Dynamic Yield": {"id": "dynamic_yield", "hosts": ["dynamicyield.com"], "parent": "Unknown"}, "Vindico Group": {"id": "vindico_group", "hosts": ["vindicosuite.com"], "parent": "Vindico Group"}, "Sumologic": {"id": "sumologic.com", "hosts": ["sumologic.com"], "parent": "Unknown"}, "SmartClick": {"id": "smartclick.net", "hosts": ["smartclick.net"], "parent": "Unknown"}, "Adotmob": {"id": "adotmob.com", "hosts": ["adotmob.com"], "parent": "Unknown"}, "Snowplow": {"id": "snowplow", "hosts": ["playwire.com", "dc8xl0ndzn2cb.cloudfront.net", "d346whrrklhco7.cloudfront.net", "d78fikflryjgj.cloudfront.net", "snplow.net"], "parent": "Snowplow"}, "LiveChat": {"id": "livechat", "hosts": ["livechatinc.net", "livechatinc.com"], "parent": "LiveChat"}, "ad:C media": {"id": "adc_media", "hosts": ["adc-srv.net", "adc-serv.net"], "parent": "Unknown"}, "brillen.de": {"id": "brillen.de", "hosts": ["brillen.de"], "parent": "Unknown"}, "GreatViews": {"id": "greatviews.de", "hosts": ["greatviews.de"], "parent": "Parship"}, "Answers Cloud Service": {"id": "answers_cloud_service", "hosts": ["answerscloud.com"], "parent": "Answers.com"}, "Xing": {"id": "xing", "hosts": ["xing-share.com", "xing.com"], "parent": "XING"}, "Chatango": {"id": "chatango", "hosts": ["chatango.com"], "parent": "Chatango"}, "Sojern": {"id": "sojern", "hosts": ["sojern.com"], "parent": "Sojern"}, "LeadPlace": {"id": "leadplace", "hosts": ["leadplace.fr"], "parent": "LeadPlace"}, "Ask.com": {"id": "ask.com", "hosts": ["ask.com"], "parent": "Unknown"}, "AdTiger": {"id": "adtiger", "hosts": ["adtiger.de"], "parent": "AdTiger"}, "NetSeer": {"id": "netseer", "hosts": ["netseer.com"], "parent": "NetSeer"}, "1000mercis": {"id": "1000mercis", "hosts": ["mmtro.com"], "parent": "1000mercis"}, "SnackTV": {"id": "snacktv", "hosts": ["snacktv.de"], "parent": "Unknown"}, "VIVALU": {"id": "vivalu", "hosts": ["vi-tag.net"], "parent": "Vivalu"}, "Vicomi": {"id": "vicomi.com", "hosts": ["vicomi.com"], "parent": "Unknown"}, "Beachfront Media": {"id": "beachfront", "hosts": ["bfmio.com"], "parent": "Unknown"}, "Content.ad": {"id": "content.ad", "hosts": ["content.ad"], "parent": "Content.ad"}, "trsv3.com": {"id": "trsv3.com", "hosts": ["trsv3.com"], "parent": "Unknown"}, "Adify": {"id": "adify", "hosts": ["afy11.net"], "parent": "Cox Enterprises"}, "gumgum": {"id": "gumgum", "hosts": ["gumgum.com"], "parent": "GumGum"}, "Yieldify": {"id": "yieldify", "hosts": ["yieldify.com"], "parent": "Yieldify"}, "TradeTracker": {"id": "tradetracker", "hosts": ["tradetracker.net"], "parent": "TradeTracker"}, "octapi.net": {"id": "octapi.net", "hosts": ["octapi.net"], "parent": "Unknown"}, "Connextra": {"id": "connextra", "hosts": ["connextra.com"], "parent": "Connextra"}, "RTBmarkt": {"id": "rtblab", "hosts": ["rvty.net"], "parent": "Unknown"}, "MediaNova CDN": {"id": "mncdn.com", "hosts": ["mncdn.com"], "parent": "Unknown"}, "Nativo": {"id": "nativo", "hosts": ["ntv.io", "postrelease.com"], "parent": "Nativo"}, "Apple": {"id": "apple", "hosts": ["apple.com"], "parent": "Apple"}, "Voluum": {"id": "voluum", "hosts": ["voluumtrk3.com", "cwkuki.com"], "parent": "Unknown"}, "Bombora": {"id": "bombora", "hosts": ["ml314.com"], "parent": "Bombora"}, "mein-bmi.com": {"id": "mein-bmi.com", "hosts": ["mein-bmi.com"], "parent": "Unknown"}, "adwebster": {"id": "adwebster", "hosts": ["adwebster.com"], "parent": "adwebster"}, "RUN": {"id": "run", "hosts": ["rundsp.com", "runadtag.com"], "parent": "RUN"}, "Adtelligence": {"id": "adtelligence.de", "hosts": ["adtelligence.de"], "parent": "Unknown"}, "Stripe": {"id": "stripe.com", "hosts": ["stripe.com", "stripe.network"], "parent": "Unknown"}, "Rythmxchange": {"id": "rythmxchange", "hosts": ["rhythmxchange.com"], "parent": "RythmOne"}, "Audience Square": {"id": "audiencesquare.com", "hosts": ["audiencesquare.com"], "parent": "Unknown"}, "adsnative": {"id": "adsnative", "hosts": ["adsnative.com"], "parent": "AdsNative"}, "Vi": {"id": "vi", "hosts": ["digitaltarget.ru"], "parent": "Vi"}, "DC StormIQ": {"id": "dc_stormiq", "hosts": ["dc-storm.com", "stormcontainertag.com", "h4k5.com", "stormiq.com"], "parent": "DC Storm"}, "CJ Affiliate": {"id": "commission_junction", "hosts": ["anrdoezrs.net", "apmebf.com", "ftjcfx.com", "qksz.net", "awltovhc.com", "emjcd.com", "tkqlhce.com", "lduhtrp.net", "yceml.net", "tqlkg.com", "afcyhf.com"], "parent": "APN News and Media Ltd"}, "Marketo": {"id": "marketo", "hosts": ["mktoresp.com", "marketo.com", "marketo.net"], "parent": "Marketo"}, "district m": {"id": "districtm.io", "hosts": ["districtm.io", "districtm.ca"], "parent": "Unknown"}, "Convertro": {"id": "convertro", "hosts": ["d1ivexoxmp59q7.cloudfront.net", "convertro.com"], "parent": "Verizon"}, "Rakuten LinkShare": {"id": "linksynergy.com", "hosts": ["linksynergy.com"], "parent": "Rakuten"}, "SexAdNetwork": {"id": "sexadnetwork", "hosts": ["sexad.net"], "parent": "Unknown"}, "Yieldr": {"id": "yieldr", "hosts": ["254a.com"], "parent": "Unknown"}, "Dstillery": {"id": "dstillery", "hosts": ["media6degrees.com"], "parent": "Unknown"}, "Inspectlet": {"id": "inspectlet", "hosts": ["inspectlet.com"], "parent": "Inspectlet"}, "MathJax": {"id": "mathjax.org", "hosts": ["mathjax.org"], "parent": "Unknown"}, "Komoona": {"id": "komoona", "hosts": ["komoona.com"], "parent": "Unknown"}, "Monster Advertising": {"id": "monster_advertising", "hosts": ["monster.com"], "parent": "Unknown"}, "Proxistore": {"id": "proxistore.com", "hosts": ["proxistore.com"], "parent": "Unknown"}, "Pusher": {"id": "pusher.com", "hosts": ["pusher.com"], "parent": "Unknown"}, "Effiliation": {"id": "effiliation", "hosts": ["effiliation.com"], "parent": "Unknown"}, "HubSpot": {"id": "hubspot", "hosts": ["hs-analytics.net", "hubspot.com", "hs-scripts.com"], "parent": "HubSpot"}, "UserVoice": {"id": "uservoice", "hosts": ["uservoice.com"], "parent": "UserVoice"}, "Findizer": {"id": "findizer.fr", "hosts": ["findizer.fr"], "parent": "Unknown"}, "Clicky": {"id": "clicky", "hosts": ["getclicky.com", "staticstuff.net"], "parent": "Clicky"}, "AdXpansion": {"id": "adxpansion", "hosts": ["adxpansion.com"], "parent": "Unknown"}, "FreeWheel": {"id": "freewheel", "hosts": ["fwmrm.net"], "parent": "Comcast"}, "Flattr Button": {"id": "flattr_button", "hosts": ["flattr.com"], "parent": "Unknown"}, "Impact Radius": {"id": "impact_radius", "hosts": ["evyy.net", "impactradius.com", "r7ls.net", "ojrq.net", "7eer.net", "d3cxv97fi8q177.cloudfront.net", "impactradius-tag.com"], "parent": "Impact Radius"}, "Branch": {"id": "branch_metrics", "hosts": ["app.link", "branch.io"], "parent": "Branch Metrics Inc"}, "Avocet": {"id": "avocet", "hosts": ["avocet.io"], "parent": "Unknown"}, "Smarter Travel Media": {"id": "smarter_travel", "hosts": ["smartertravel.com"], "parent": "IAC (InterActiveCorp)"}, "Apa": {"id": "apa.at", "hosts": ["apa.at"], "parent": "Unknown"}, "Errorception": {"id": "errorception", "hosts": ["d15qhc0lu1ghnk.cloudfront.net", "errorception.com"], "parent": "Unknown"}, "Marketgrid": {"id": "marketgrid", "hosts": ["marketgid.com"], "parent": "Marketgid RU"}, "Adelphic": {"id": "adelphic", "hosts": ["ipredictive.com"], "parent": "Adelphic"}, "Livefyre": {"id": "livefyre", "hosts": ["fyre.co", "livefyre.com"], "parent": "Livefyre"}, "Sentifi": {"id": "sentifi.com", "hosts": ["sentifi.com"], "parent": "Unknown"}, "Alipay": {"id": "alipay.com", "hosts": ["alipay.com"], "parent": "Alibaba"}, "Perform Group": {"id": "perform_group", "hosts": ["performgroup.com"], "parent": "Unknown"}, "office.net": {"id": "office.net", "hosts": ["office.net"], "parent": "Microsoft"}, "nerfherdersolo.com": {"id": "nerfherdersolo_com", "hosts": ["nerfherdersolo.com"], "parent": "Unknown"}, "Permutive": {"id": "permutive", "hosts": ["permutive.com"], "parent": "Unknown"}, "tubecup.org": {"id": "tubecup.org", "hosts": ["tubecup.org"], "parent": "Unknown"}, "Q-Division": {"id": "q_division", "hosts": ["q-divisioncdn.de"], "parent": "Unknown"}, "magnuum.com": {"id": "magnuum.com", "hosts": ["magnuum.com"], "parent": "Unknown"}, "GrandSlamMedia": {"id": "grandslammedia", "hosts": ["tuberewards.com", "trw12.com"], "parent": "Grand Slam Media"}, "[24]7": {"id": "24_7", "hosts": ["247-inc.net", "d1af033869koo7.cloudfront.net"], "parent": "Unknown"}, "cqq5id8n.com": {"id": "cqq5id8n.com", "hosts": ["cqq5id8n.com"], "parent": "Unknown"}, "Digital Window": {"id": "digital_window", "hosts": ["dwin1.com"], "parent": "Axel Springer Group"}, "Hola Player": {"id": "hola_player", "hosts": ["h-cdn.com"], "parent": "Hola CDN"}, "Webfonts by Hoefler&Co": {"id": "typography.com", "hosts": ["typography.com"], "parent": "Unknown"}, "V12 Group": {"id": "v12_group", "hosts": ["v12group.com"], "parent": "Unknown"}, "Certona": {"id": "certona", "hosts": ["certona.net", "res-x.com"], "parent": "Certona (Resonance)"}, "bongacams.com": {"id": "bongacams.com", "hosts": ["bongacams.com"], "parent": "Unknown"}, "TrackJS": {"id": "trackjs", "hosts": ["dl1d2m8ri9v3j.cloudfront.net", "d2zah9y47r7bi2.cloudfront.net", "trackjs.com"], "parent": "TrackJS"}, "AiData": {"id": "aidata.io", "hosts": ["aidata.io"], "parent": "Unknown"}, "YuMe": {"id": "yume", "hosts": ["yume.com"], "parent": "Unknown"}, "SaleCycle": {"id": "salecycle", "hosts": ["d16fk4ms6rqz1v.cloudfront.net", "salecycle.com"], "parent": "SaleCycle"}, "nosto": {"id": "nosto.com", "hosts": ["nosto.com"], "parent": "Unknown"}, "vodafone.de": {"id": "vodafone.de", "hosts": ["vodafone.de"], "parent": "Unknown"}, "Clickonometrics": {"id": "clickonometrics", "hosts": ["clickonometrics.pl"], "parent": "Clickonometrics"}, "MaxPoint Interactive": {"id": "maxpoint_interactive", "hosts": ["mxptint.net"], "parent": "MaxPoint Interactive"}, "1DMP": {"id": "1dmp.io", "hosts": ["1dmp.io"], "parent": "Unknown"}, "Nanigans": {"id": "nanigans", "hosts": ["nanigans.com"], "parent": "Nanigans"}, "Twitch CDN": {"id": "twitch_cdn", "hosts": ["ttvnw.net", "jtvnw.net", "twitchcdn.net", "twitchsvc.net"], "parent": "Amazon"}, "TrafficForce": {"id": "trafficforce", "hosts": ["trafficforce.com"], "parent": "Unknown"}, "SessionCam": {"id": "sessioncam", "hosts": ["sessioncam.com", "d2oh4tlt9mrke9.cloudfront.net"], "parent": "SessionCam"}, "Between Digital": {"id": "betweendigital.com", "hosts": ["betweendigital.com"], "parent": "Unknown"}, "algovid.com": {"id": "algovid.com", "hosts": ["algovid.com"], "parent": "Unknown"}, "Pixalate": {"id": "pixalate", "hosts": ["adrta.com"], "parent": "Unknown"}, "cdn-net.com": {"id": "cdn-net.com", "hosts": ["cdn-net.com"], "parent": "Unknown"}, "AdFox": {"id": "adfox", "hosts": ["adwolf.ru", "adfox.ru"], "parent": "AdFox"}, "GitHub": {"id": "github", "hosts": ["githubusercontent.com", "github.com"], "parent": "Unknown"}, "chaturbate.com": {"id": "chaturbate.com", "hosts": ["chaturbate.com"], "parent": "Unknown"}, "adtr02.com": {"id": "adtr02.com", "hosts": ["adtr02.com"], "parent": "Unknown"}, "Routenplaner Karten": {"id": "routenplaner-karten.com", "hosts": ["routenplaner-karten.com"], "parent": "Unknown"}, "Sourcepoint": {"id": "sourcepoint", "hosts": ["summerhamster.com", "decenthat.com"], "parent": "Unknown"}, "SAP Exchange Media": {"id": "sap_xm", "hosts": ["sap-xm.org"], "parent": "Unknown"}, "exoticads": {"id": "exoticads.com", "hosts": ["exoticads.com"], "parent": "Unknown"}, "ablida": {"id": "ablida", "hosts": ["ablida.de", "ablida.net"], "parent": "Unknown"}, "DigiTrust": {"id": "digitrust", "hosts": ["digitru.st"], "parent": "Unknown"}, "freegeoip.net": {"id": "freegeoip_net", "hosts": ["freegeoip.net"], "parent": "Unknown"}, "fontawesome.com": {"id": "fontawesome_com", "hosts": ["fontawesome.com"], "parent": "Unknown"}, "GlobalSign": {"id": "globalsign", "hosts": ["globalsign.com"], "parent": "Unknown"}, "sexypartners.net": {"id": "sexypartners.net", "hosts": ["sexypartners.net"], "parent": "Unknown"}, "Vidible": {"id": "vidible", "hosts": ["vidible.tv"], "parent": "Verizon"}, "AdMeira": {"id": "admeira.ch", "hosts": ["admeira.ch"], "parent": "Unknown"}, "StepStone": {"id": "stepstone.com", "hosts": ["stepstone.com"], "parent": "Unknown"}, "Yandex AdExchange": {"id": "yandex_adexchange", "hosts": ["yandexadexchange.net"], "parent": "Yandex"}, "liveadexchanger.com": {"id": "liveadexchanger.com", "hosts": ["liveadexchanger.com"], "parent": "Unknown"}, "HomeAway": {"id": "homeaway", "hosts": ["homeaway.com"], "parent": "Unknown"}, "The Weather Company": {"id": "the_weather_company", "hosts": ["wfxtriggers.com", "weather.com"], "parent": "IBM"}, "Demandbase": {"id": "demandbase", "hosts": ["company-target.com", "demandbase.com"], "parent": "Unknown"}, "Flowplayer": {"id": "flowplayer", "hosts": ["flowplayer.org"], "parent": "FlowPlayer"}, "propvideo.net": {"id": "propvideo_net", "hosts": ["propvideo.net"], "parent": "Unknown"}, "ContentSquare": {"id": "contentsquare.net", "hosts": ["contentsquare.net"], "parent": "Unknown"}, "oclasrv.com": {"id": "oclasrv.com", "hosts": ["oclasrv.com"], "parent": "Unknown"}, "marshadow.io": {"id": "marshadow.io", "hosts": ["marshadow.io"], "parent": "Unknown"}, "Perimeterx": {"id": "perimeterx.net", "hosts": ["perimeterx.net"], "parent": "Unknown"}, "OnAudience": {"id": "onaudience", "hosts": ["onaudience.com", "behavioralengine.com"], "parent": "Unknown"}, "deichmann.com": {"id": "deichmann.com", "hosts": ["deichmann.com"], "parent": "Unknown"}, "Bounce Exchange": {"id": "bounce_exchange", "hosts": ["bounceexchange.com"], "parent": "Bounce Exchange"}, "sixt-neuwagen.de": {"id": "sixt-neuwagen.de", "hosts": ["sixt-neuwagen.de"], "parent": "Unknown"}, "Walmart": {"id": "walmart", "hosts": ["walmart.com"], "parent": "Unknown"}, "InfoLinks": {"id": "infolinks", "hosts": ["intextscript.com", "infolinks.com"], "parent": "Infolinks"}, "tdsrmbl.net": {"id": "tdsrmbl_net", "hosts": ["tdsrmbl.net"], "parent": "Unknown"}, "Wayfair": {"id": "wayfair_com", "hosts": ["wayfair.com"], "parent": "Unknown"}, "Contentpass": {"id": "contentpass", "hosts": ["contentpass.net", "contentpass.de"], "parent": "Unknown"}, "esprit.de": {"id": "esprit.de", "hosts": ["esprit.de"], "parent": "Unknown"}, "Performio.cz": {"id": "performio", "hosts": ["performax.cz"], "parent": "Unknown"}, "Media Impact": {"id": "media_impact", "hosts": ["mediaimpact.de"], "parent": "Media Impact"}, "Optomaton": {"id": "optomaton", "hosts": ["volvelle.tech"], "parent": "Ve Global"}, "s3xified.com": {"id": "s3xified.com", "hosts": ["s3xified.com"], "parent": "Unknown"}, "Merkle RKG": {"id": "merkle_rkg", "hosts": ["rkdms.com"], "parent": "Dentsu Aegis Network"}, "AdGear": {"id": "adgear", "hosts": ["adgear.com", "adgrx.com"], "parent": "Samsung"}, "ZypMedia": {"id": "zypmedia", "hosts": ["extend.tv"], "parent": "Unknown"}, "4finance.com": {"id": "4finance_com", "hosts": ["4finance.com"], "parent": "Unknown"}, "iotec": {"id": "iotec", "hosts": ["dsp.io"], "parent": "Unknown"}, "a3cloud.net": {"id": "a3cloud_net", "hosts": ["a3cloud.net"], "parent": "Unknown"}, "Factor Eleven": {"id": "f11-ads.com", "hosts": ["f11-ads.com"], "parent": "Unknown"}, "maxonclick.com": {"id": "maxonclick_com", "hosts": ["maxonclick.com"], "parent": "Unknown"}, "Lenua System": {"id": "lenua.de", "hosts": ["lenua.de"], "parent": "Synatix"}, "Acuity Ads": {"id": "acuity_ads", "hosts": ["acuityplatform.com"], "parent": "Acuity Ads"}, "Catchpoint": {"id": "catchpoint", "hosts": ["3gl.net"], "parent": "Catchpoint Systems"}, "Admedo": {"id": "admedo_com", "hosts": ["admedo.com", "adizio.com"], "parent": "Unknown"}, "Bugsnag": {"id": "bugsnag", "hosts": ["d2wy8f7a9ursnm.cloudfront.net"], "parent": "Bugsnag"}, "mobtrks.com": {"id": "mobtrks.com", "hosts": ["mobtrks.com"], "parent": "Unknown"}, "pushnative.com": {"id": "pushnative.com", "hosts": ["pushnative.com"], "parent": "Unknown"}, "baur.de": {"id": "baur.de", "hosts": ["baur.de"], "parent": "Unknown"}, "Ippen Digital": {"id": "id-news.net", "hosts": ["idcdn.de", "id-news.net"], "parent": "Unknown"}, "upravel.com": {"id": "upravel.com", "hosts": ["upravel.com"], "parent": "Unknown"}, "Twitter for Business": {"id": "twitter_for_business", "hosts": ["tellapart.com"], "parent": "Twitter"}, "Scoota": {"id": "scoota", "hosts": ["rockabox.co"], "parent": "Unknown"}, "AdsKeeper": {"id": "adskeeper", "hosts": ["adskeeper.co.uk"], "parent": "Adskeeper"}, "Programattik": {"id": "programattik", "hosts": ["programattik.com"], "parent": "Unknown"}, "Distil Bot Discovery": {"id": "distil_tag", "hosts": ["distiltag.com"], "parent": "distil networks"}, "Fluct": {"id": "fluct", "hosts": ["adingo.jp"], "parent": "Unknown"}, "AdBrain": {"id": "adbrain", "hosts": ["adbrn.com"], "parent": "Unknown"}, "TrustArc": {"id": "trustarc", "hosts": ["truste.com", "trustarc.com"], "parent": "TrustArc"}, "StatHat": {"id": "stathat", "hosts": ["stathat.com"], "parent": "Unknown"}, "xxxlshop.de": {"id": "xxxlshop.de", "hosts": ["xxxlshop.de"], "parent": "Unknown"}, "bRealTime": {"id": "brealtime", "hosts": ["brealtime.com"], "parent": "Unknown"}, "Docler": {"id": "docler", "hosts": ["awecr.com", "fwbntw.com"], "parent": "Docler IP"}, "tchibo.de": {"id": "tchibo_de", "hosts": ["tchibo.de", "tchibo-content.de"], "parent": "Unknown"}, "eshopcomp.com": {"id": "eshopcomp.com", "hosts": ["eshopcomp.com"], "parent": "Unknown"}, "davebestdeals.com": {"id": "davebestdeals.com", "hosts": ["davebestdeals.com"], "parent": "Unknown"}, "FlowSurf": {"id": "othersearch.info", "hosts": ["othersearch.info"], "parent": "Unknown"}, "Heap": {"id": "heap", "hosts": ["d36lvucg9kzous.cloudfront.net", "heapanalytics.com"], "parent": "Heap"}, "Mediarithmics": {"id": "mediarithmics.com", "hosts": ["mediarithmics.com"], "parent": "Unknown"}, "spotscenered.info": {"id": "spotscenered.info", "hosts": ["spotscenered.info"], "parent": "Unknown"}, "brightonclick.com": {"id": "brightonclick.com", "hosts": ["brightonclick.com"], "parent": "Unknown"}, "ubersetzung-app.com": {"id": "ubersetzung-app.com", "hosts": ["ubersetzung-app.com"], "parent": "Unknown"}, "Supership": {"id": "supership", "hosts": ["socdm.com"], "parent": "Unknown"}, "overheat": {"id": "overheat.it", "hosts": ["overheat.it"], "parent": "Unknown"}, "ImgIX": {"id": "imgix.net", "hosts": ["imgix.net"], "parent": "Unknown"}, "ShopAuskunft.de": {"id": "shopauskunft.de", "hosts": ["shopauskunft.de"], "parent": "Unknown"}, "bumlam.com": {"id": "bumlam.com", "hosts": ["bumlam.com"], "parent": "Unknown"}, "Wirecard": {"id": "wirecard", "hosts": ["wirecard.com", "wirecard.de"], "parent": "Unknown"}, "Site24x7": {"id": "site24x7", "hosts": ["site24x7rum.com", "site24x7rum.eu"], "parent": "Unknown"}, "MRP": {"id": "mrpdata", "hosts": ["mrpdata.com", "mrpdata.net"], "parent": "Unknown"}, "Digilant": {"id": "digilant", "hosts": ["wtp101.com"], "parent": "Unknown"}, "Cardlytics": {"id": "cardlytics", "hosts": ["cardlytics.com"], "parent": "Unknown"}, "VisualDNA": {"id": "visualdna", "hosts": ["visualdna.com", "vdna-assets.com"], "parent": "Harris Insights & Analytics"}, "pmddby.com": {"id": "pmddby.com", "hosts": ["pmddby.com"], "parent": "Unknown"}, "Interyield": {"id": "interyield", "hosts": ["ps7894.com"], "parent": "Advertise.com"}, "Yieldmo": {"id": "yieldmo", "hosts": ["yieldmo.com"], "parent": "Unknown"}, "comprigo": {"id": "comprigo", "hosts": ["comprigo.com"], "parent": "Unknown"}, "Platform One": {"id": "platformone", "hosts": ["impact-ad.jp"], "parent": "D.A.Consortium"}, "ORC International": {"id": "orc_international", "hosts": ["emxdgt.com"], "parent": "Engine"}, "pnamic.com": {"id": "pnamic.com", "hosts": ["pnamic.com"], "parent": "Unknown"}, "iRobinHood": {"id": "donationtools", "hosts": ["donation-tools.org"], "parent": "Unknown"}, "Active Agent": {"id": "active_agent", "hosts": ["active-agent.com"], "parent": "Unknown"}, "HookLogic": {"id": "hooklogic", "hosts": ["hlserve.com"], "parent": "Criteo"}, "Bitly": {"id": "bitly", "hosts": ["bit.ly"], "parent": "Unknown"}, "Tru Optik": {"id": "truoptik", "hosts": ["truoptik.com"], "parent": "Unknown"}, "solads.media": {"id": "solads.media", "hosts": ["solads.media"], "parent": "Unknown"}, "doofinder": {"id": "doofinder.com", "hosts": ["doofinder.com"], "parent": "Unknown"}, "OptinMonster": {"id": "optinmonster", "hosts": ["mstrlytcs.com", "optmstr.com"], "parent": "OptinMonster"}, "Opta": {"id": "opta.net", "hosts": ["opta.net"], "parent": "Unknown"}, "afgr2.com": {"id": "afgr2.com", "hosts": ["afgr2.com"], "parent": "Unknown"}, "Marvellous Machine": {"id": "marvellous_machine", "hosts": ["marvellousmachine.net"], "parent": "Unknown"}, "Aemediatraffic": {"id": "aemediatraffic", "hosts": ["hprofits.com", "aemediatraffic.com"], "parent": "Unknown"}, "Adtheorent": {"id": "adtheorent", "hosts": ["adentifi.com"], "parent": "Unknown"}, "dcbap.com": {"id": "dcbap.com", "hosts": ["dcbap.com"], "parent": "Unknown"}, "ViralGains": {"id": "viralgains", "hosts": ["viralgains.com"], "parent": "Unknown"}, "Segment": {"id": "segment", "hosts": ["segment.com", "segment.io", "d47xnnr8b1rki.cloudfront.net", "d2dq2ahtl5zl1z.cloudfront.net"], "parent": "Segment"}, "AdsWizz": {"id": "adswizz", "hosts": ["adswizz.com"], "parent": "Unknown"}, "Storygize": {"id": "storygize", "hosts": ["storygize.net"], "parent": "Unknown"}, "realytics.io": {"id": "realytics.io", "hosts": ["realytics.io"], "parent": "Unknown"}, "Ziff Davis": {"id": "ziff_davis", "hosts": ["zdbb.net", "ziffdavis.com", "ziffprod.com", "ziffdavisinternational.com", "ziffstatic.com", "webtest.net"], "parent": "Unknown"}, "Sailthru Horizon": {"id": "sailthru_horizon", "hosts": ["sail-horizon.com", "sailthru.com"], "parent": "Sailthru"}, "Realytics": {"id": "realytics", "hosts": ["dcniko1cv0rz.cloudfront.net"], "parent": "Realytics"}, "Adguard": {"id": "adguard", "hosts": ["adguard.com"], "parent": "Unknown"}, "Sortable": {"id": "sortable", "hosts": ["deployads.com"], "parent": "Unknown"}, "Piano": {"id": "tinypass", "hosts": ["tinypass.com", "npttech.com"], "parent": "Piano (Previously Tinypass)"}, "Disqus Ads": {"id": "disqus_ads", "hosts": ["disqusads.com"], "parent": "Disqus"}, "ZergNet": {"id": "zergnet", "hosts": ["zergnet.com"], "parent": "ZergNet"}, "Aloodo": {"id": "aloodo", "hosts": ["github.io"], "parent": "Aloodo"}, "Wikia CDN": {"id": "wikia_cdn", "hosts": ["nocookie.net"], "parent": "Wikia"}, "Adtrue": {"id": "adtrue", "hosts": ["adtrue.com"], "parent": "AdTrue"}, "smi2.ru": {"id": "smi2.ru", "hosts": ["smi2.ru", "smi2.net"], "parent": "Unknown"}, "venturead.com": {"id": "venturead.com", "hosts": ["venturead.com"], "parent": "Unknown"}, "Recreativ": {"id": "recreativ", "hosts": ["recreativ.ru"], "parent": "Recreativ"}, "LiftIgniter": {"id": "petametrics", "hosts": ["petametrics.com"], "parent": "Unknown"}, "rtbsuperhub.com": {"id": "rtbsuperhub.com", "hosts": ["rtbsuperhub.com"], "parent": "Unknown"}, "Yahoo! Japan": {"id": "yahoo_japan", "hosts": ["yjtag.jp", "yahoo.co.jp"], "parent": "Unknown"}, "lentainform.com": {"id": "lentainform.com", "hosts": ["lentainform.com"], "parent": "Unknown"}, "RevContent": {"id": "revcontent", "hosts": ["revcontent.com"], "parent": "RevContent"}, "Expedia": {"id": "expedia", "hosts": ["expedia.com", "trvl-px.com"], "parent": "IAC (InterActiveCorp)"}, "AdOcean": {"id": "adocean", "hosts": ["adocean.pl"], "parent": "AdOcean"}, "First Impression": {"id": "first_impression", "hosts": ["firstimpression.io"], "parent": "First Impression"}, "Layer-ADS.net": {"id": "layer-ad.org", "hosts": ["layer-ad.org"], "parent": "Unknown"}, "Baidu Ads": {"id": "baidu_ads", "hosts": ["baidu.com", "baidustatic.com"], "parent": "Baidu"}, "iPerceptions": {"id": "iperceptions", "hosts": ["iperceptions.com"], "parent": "iPerceptions"}, "Purch": {"id": "purch", "hosts": ["servebom.com", "purch.com"], "parent": "Purch"}, "Smartlook": {"id": "smartlook", "hosts": ["smartlook.com", "getsmartlook.com"], "parent": "SmartLook"}, "Twitch": {"id": "twitch.tv", "hosts": ["twitch.tv"], "parent": "Amazon"}, "Spot.IM": {"id": "spots.im", "hosts": ["spots.im"], "parent": "Unknown"}, "Stack Exchange": {"id": "sstatic.net", "hosts": ["sstatic.net"], "parent": "Unknown"}, "Maru-EDU": {"id": "maru-edu", "hosts": ["edigitalsurvey.com"], "parent": "MaruEdr"}, "ACPM": {"id": "acpm.fr", "hosts": ["acpm.fr"], "parent": "Unknown"}, "Yandex.API": {"id": "yandex.api", "hosts": ["yandex.st"], "parent": "Yandex"}, "Seznam": {"id": "seznam", "hosts": ["imedia.cz"], "parent": "Seznam"}, "enreach": {"id": "enreach", "hosts": ["adtlgc.com"], "parent": "Unknown"}, "Ownpage": {"id": "ownpage", "hosts": ["ownpage.fr"], "parent": "Unknown"}, "iBillboard": {"id": "bbelements.com", "hosts": ["bbelements.com"], "parent": "Unknown"}, "Visualstudio.com": {"id": "visualstudio.com", "hosts": ["visualstudio.com"], "parent": "Microsoft"}, "Dotmetrics": {"id": "dotmetrics.net", "hosts": ["dotmetrics.net"], "parent": "Unknown"}, "Bitrix24": {"id": "bitrix", "hosts": ["bitrix.info", "bitrix.ru"], "parent": "Unknown"}, "SendPulse": {"id": "sendpulse.com", "hosts": ["sendpulse.com"], "parent": "Unknown"}, "onet": {"id": "onet.pl", "hosts": ["onet.pl", "ocdn.eu"], "parent": "Unknown"}, "Bebi Media": {"id": "bebi", "hosts": ["bebi.com"], "parent": "Unknown"}, "Get Site Control": {"id": "get_site_control", "hosts": ["getsitecontrol.com"], "parent": "GetSiteControl"}, "Effective Measure": {"id": "effective_measure", "hosts": ["effectivemeasure.net"], "parent": "Effective Measure"}, "Sirdata": {"id": "sirdata", "hosts": ["sddan.com"], "parent": "Sirdata"}, "Keywee": {"id": "keywee", "hosts": ["keywee.co"], "parent": "Unknown"}, "FullStory": {"id": "fullstory", "hosts": ["fullstory.com"], "parent": "fullstory"}, "bigmir.net": {"id": "bigmir.net", "hosts": ["bigmir.net"], "parent": "Unknown"}, "Yandex.Advisor": {"id": "yandex_advisor", "hosts": ["metabar.ru"], "parent": "Yandex"}, "adbetnet": {"id": "adbetclickin.pink", "hosts": ["adbetclickin.pink"], "parent": "Unknown"}, "Embedly": {"id": "embed.ly", "hosts": ["embed.ly", "embedly.com"], "parent": "Medium"}, "AdMachine": {"id": "admachine", "hosts": ["adx1.com"], "parent": "Unknown"}, "Digioh": {"id": "digioh", "hosts": ["digioh.com", "lightboxcdn.com"], "parent": "Unknown"}, "Segmento": {"id": "segmento", "hosts": ["rutarget.ru"], "parent": "Unknown"}, "Dynatrace": {"id": "dynatrace.com", "hosts": ["dynatrace.com"], "parent": "Thoma Bravo"}, "Dropbox": {"id": "dropbox.com", "hosts": ["dropbox.com"], "parent": "Unknown"}, "Retail Rocket": {"id": "retailrocket.net", "hosts": ["retailrocket.net", "retailrocket.ru"], "parent": "Unknown"}, "24\u0421\u041c\u0418": {"id": "24smi", "hosts": ["24smi.net", "24smi.org"], "parent": "Unknown"}, "Giphy": {"id": "giphy.com", "hosts": ["giphy.com"], "parent": "Unknown"}, "DataMind": {"id": "datamind.ru", "hosts": ["datamind.ru"], "parent": "Unknown"}, "toplist.cz": {"id": "toplist.cz", "hosts": ["toplist.cz"], "parent": "Unknown"}, "Visible Measures": {"id": "visible_measures", "hosts": ["visiblemeasures.com", "viewablemedia.net"], "parent": "Visible Measures"}, "Tovarro": {"id": "tovarro.com", "hosts": ["tovarro.com"], "parent": "Unknown"}, "Perfect Audience": {"id": "perfect_audience", "hosts": ["perfectaudience.com", "prfct.co"], "parent": "Perfect Audience"}, "Uptolike": {"id": "uptolike.com", "hosts": ["uptolike.com"], "parent": "Unknown"}, "Cross Pixel": {"id": "crosspixel", "hosts": ["crosspixel.net", "crsspxl.com"], "parent": "Unknown"}, "Hybrid.ai": {"id": "hybrid.ai", "hosts": ["hybrid.ai", "targetix.net"], "parent": "Unknown"}, "CloudMedia": {"id": "cloud-media.fr", "hosts": ["cloud-media.fr"], "parent": "Unknown"}, "gfycat": {"id": "gfycat.com", "hosts": ["gfycat.com"], "parent": "Unknown"}, "Pardot": {"id": "pardot", "hosts": ["pardot.com"], "parent": "Pardot"}, "Tumblr Buttons": {"id": "tumblr_buttons", "hosts": ["platform.tumblr.com"], "parent": "Tumblr"}, "Flocktory": {"id": "flocktory.com", "hosts": ["flocktory.com"], "parent": "Unknown"}, "Lucky Orange": {"id": "lucky_orange", "hosts": ["luckyorange.net", "luckyorange.com", "livestatserver.com"], "parent": "Unknown"}, "Intent Media": {"id": "intent_media", "hosts": ["intentmedia.net"], "parent": "Unknown"}, "perfdrive.com": {"id": "perfdrive.com", "hosts": ["perfdrive.com"], "parent": "Unknown"}, "Seedtag": {"id": "seedtag.com", "hosts": ["seedtag.com"], "parent": "Unknown"}, "wp.pl": {"id": "wp.pl", "hosts": ["wp.pl"], "parent": "Unknown"}, "mirtesen.ru": {"id": "mirtesen.ru", "hosts": ["mirtesen.ru"], "parent": "Unknown"}, "Auditorius": {"id": "audtd.com", "hosts": ["audtd.com"], "parent": "Unknown"}, "CPMStar": {"id": "cpmstar", "hosts": ["cpmstar.com"], "parent": "CPMStar"}, "BlueConic": {"id": "blueconic.net", "hosts": ["blueconic.net"], "parent": "Unknown"}, "De Persgroep": {"id": "persgroep", "hosts": ["persgroep.net"], "parent": "Unknown"}, "Pluso": {"id": "pluso.ru", "hosts": ["pluso.ru"], "parent": "Unknown"}, "Sanoma": {"id": "sanoma.fi", "hosts": ["sanoma.fi", "ilsemedia.nl"], "parent": "Unknown"}, "Atlassian": {"id": "atlassian.net", "hosts": ["atlassian.net", "d12ramskps3070.cloudfront.net", "atl-paas.net", "atlassian.com"], "parent": "Atlassian"}, "Beeline": {"id": "beeline.ru", "hosts": ["beeline.ru"], "parent": "Unknown"}, "Tawk": {"id": "tawk", "hosts": ["tawk.to"], "parent": "Tawk"}, "uCoz": {"id": "ucoz.net", "hosts": ["ucoz.net"], "parent": "Unknown"}, "Yusp": {"id": "yusp", "hosts": ["gravityrd-services.com"], "parent": "Unknown"}, "Salesforce": {"id": "salesforce.com", "hosts": ["force.com", "salesforce.com"], "parent": "Salesforce.com"}, "piguiqproxy.com": {"id": "piguiqproxy.com", "hosts": ["piguiqproxy.com"], "parent": "Unknown"}, "puserving.com": {"id": "puserving.com", "hosts": ["puserving.com"], "parent": "Unknown"}, "Curse": {"id": "curse.com", "hosts": ["curse.com"], "parent": "Amazon"}, "BBC": {"id": "bbci", "hosts": ["bbci.co.uk"], "parent": "Unknown"}, "Relap": {"id": "relap", "hosts": ["relap.io"], "parent": "Unknown"}, "velocecdn.com": {"id": "velocecdn.com", "hosts": ["velocecdn.com"], "parent": "Unknown"}, "hotdogsandads.com": {"id": "hotdogsandads.com", "hosts": ["hotdogsandads.com"], "parent": "Unknown"}, "Heroku": {"id": "heroku", "hosts": ["herokuapp.com"], "parent": "Unknown"}, "IMDB CDN": {"id": "media-imdb.com", "hosts": ["media-imdb.com"], "parent": "Amazon"}, "OpenStat": {"id": "openstat", "hosts": ["openstat.net"], "parent": "Unknown"}, "ymetrica1.com": {"id": "ymetrica1.com", "hosts": ["ymetrica1.com"], "parent": "Unknown"}, "SpeedCurve": {"id": "speedcurve", "hosts": ["speedcurve.com"], "parent": "Unknown"}, "ComboTag": {"id": "combotag", "hosts": ["combotag.com"], "parent": "Unknown"}, "OLX": {"id": "olx-st.com", "hosts": ["olx-st.com", "onap.io"], "parent": "Unknown"}, "Foresee": {"id": "foresee", "hosts": ["foresee.com"], "parent": "Answers.com"}, "MailChimp": {"id": "mailchimp", "hosts": ["mailchimp.com", "list-manage.com"], "parent": "Unknown"}, "Microsoft SharePoint": {"id": "sharepoint", "hosts": ["sharepointonline.com"], "parent": "Microsoft"}, "unpkg": {"id": "unpkg.com", "hosts": ["unpkg.com"], "parent": "Unknown"}, "ipify": {"id": "ipify", "hosts": ["ipify.org"], "parent": "Unknown"}, "Allegro": {"id": "allegro.pl", "hosts": ["allegrostatic.com", "allegroimg.com", "ngacm.com", "ngastatic.com"], "parent": "Allegro"}, "Research Now": {"id": "research_now", "hosts": ["researchnow.com"], "parent": "Research Now"}, "Taobao": {"id": "taobao", "hosts": ["alipcsec.com"], "parent": "Alibaba"}, "Adglare": {"id": "adglare.net", "hosts": ["adglare.net"], "parent": "Unknown"}, "TRUSTe Seal": {"id": "truste_seal", "hosts": ["privacy-policy.truste.com"], "parent": "TrustArc"}, "AdvertServe": {"id": "advertserve", "hosts": ["advertserve.com"], "parent": "Unknown"}, "Quora": {"id": "quora.com", "hosts": ["quora.com"], "parent": "Unknown"}, "Traffic Factory": {"id": "trafficfactory", "hosts": ["trafficfactory.biz"], "parent": "Unknown"}, "WWWPromoter": {"id": "wwwpromoter", "hosts": ["wwwpromoter.com"], "parent": "wwwPromoter"}, "Footprint DNS": {"id": "footprintdns.com", "hosts": ["footprintdns.com"], "parent": "Microsoft"}, "BounceX": {"id": "bouncex", "hosts": ["bouncex.net", "bouncex.com"], "parent": "Unknown"}, "Qualaroo": {"id": "qualaroo", "hosts": ["qualaroo.com"], "parent": "Unknown"}, "Smyte": {"id": "smyte", "hosts": ["smyte.com"], "parent": "Unknown"}, "Wistia": {"id": "wistia", "hosts": ["wistia.com", "wistia.net"], "parent": "Wistia"}, "Spotify": {"id": "spotify", "hosts": ["scdn.co", "spotify.com"], "parent": "Unknown"}, "KataWeb": {"id": "kataweb.it", "hosts": ["kataweb.it"], "parent": "Unknown"}, "OTM": {"id": "otm-r.com", "hosts": ["otm-r.com"], "parent": "Unknown"}, "Caltat": {"id": "caltat.com", "hosts": ["caltat.com"], "parent": "Unknown"}, "Samba TV": {"id": "samba.tv", "hosts": ["samba.tv"], "parent": "Samba TV"}, "Pushcrew": {"id": "pushcrew", "hosts": ["pushcrew.com"], "parent": "Pushcrew"}, "Ooyala": {"id": "ooyala.com", "hosts": ["ooyala.com"], "parent": "Telstra"}, "Dailymotion Advertising": {"id": "dailymotion_advertising", "hosts": ["dmxleo.com"], "parent": "Vivendi"}, "Giraff.io": {"id": "giraff.io", "hosts": ["giraff.io"], "parent": "Unknown"}, "Cackle": {"id": "cackle.me", "hosts": ["cackle.me"], "parent": "Unknown"}};
const trackerDomains = [];
const companyTree = {} // Should start company -> domain visited -> url -> HTML.
const controlPanelURL = chrome.extension.getURL('templates/control-panel.html');
let recordingStatus = false;
const contentScriptPath = 'scripts/content-script.js';

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
	for (let i=0;i<Object.keys(refHTML).length;i++) {

		// Check the URL.
		const url = Object.keys(refHTML)[i];
		const inURL = url.toLowerCase().indexOf(str.toLowerCase());
		const inHTML = refHTML[url].toLowerCase().indexOf(str.toLowerCase()); // Save HTML in lower case?.
		const parsedE = parseURL(url);

		// Check HTML content.


		if ( inURL > -1 || inHTML > -1 ) {
			// console.log(" Information leaked via URL >>>>" + e);
			// console.log("This information is shared with :" + new Set(refTP[e]).size + " Trackers.");
			// console.log("Trackers who have this data >>> " + JSON.stringify([...new Set(refTP[e])]));
			const o = {
				leakyURL: url,
				trackers: refTP[url]
			};
			leakyURLs.push(o);

			// add to resulttable.
			Object.keys(refTP[url]).forEach( com => {
				if (!resultTable.hasOwnProperty(com)) resultTable[com] = {'leaks': 0, websites: []};
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
			const com = thirdPartyFP[item].tpdetails.company_name;
			if (!resultTable.hasOwnProperty(com)) resultTable[com] = {'leaks': 0, websites: []};//{'leaks':0, 'website': thirdPartyFP[item].fpdetails.tracker_host};
			if (resultTable[com]['websites'].indexOf(thirdPartyFP[item].fpdetails.tracker_host) === -1) {
				resultTable[com]['leaks'] += 1;
				resultTable[com]['websites'].push(thirdPartyFP[item].fpdetails.tracker_host);
			}
		}
	}

	// Let's also check cookies for this detail.
	Object.keys(cookieTable).forEach( item => {
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
			if (!resultTable.hasOwnProperty(com)) resultTable[com] = {'leaks': 0, websites: []};//{'leaks':0, 'website': thirdPartyFP[item].fpdetails.tracker_host};
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

	Object.keys(refTP).forEach( u => {

		// Domains of URLs.
		const parsed = parseURL(u);
		if (parsed) {
			uniqueDomains.add(parsed.hostname);
		}

		// Unique companies that have the history.
		Object.keys(refTP[u]).forEach( c => {
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

	leaked[0].forEach( lu => {
		// Get website.
		const website = parseURL(lu.leakyURL);
		if (website) uniqueDomains.add(website.hostname);

		// Get tracker companies.
		Object.keys(lu.trackers).forEach( c => {
			uniqueCompanies.add(c);
			if (lu.trackers[c]) {
				lu.trackers[c].forEach( t => {
					uniqueTPDomains.add(t);
				})
			}
		});
	});

	// Based on the leakyTPs enhance the summary.
	leaked[2].forEach( row => {
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

function parseQueryString(q){
	/* parse the query */
	var x = q.replace(/;/g, '&').split('&'), i, name, t;

	/* q changes from string version of query to object */
	for (q={}, i=0; i<x.length; i++){
	    t = x[i].split('=', 2);
	    name = unescape(t[0]);
	    if (!q[name]) q[name] = [];
	    if (t.length > 1){
	        q[name][q[name].length] = unescape(t[1]);
	    }
	    /* next two lines are nonstandard */
	    else q[name][q[name].length] = true;
	}
	return q;
}

function getCompanyName(hostname, partialHostName) {
	for(let i=0;i<Object.keys(trackerData).length;i++) {

		const e = Object.keys(trackerData)[i];

		if (trackerData[e].hosts.indexOf(hostname) > -1 || trackerData[e].hosts.indexOf(partialHostName) > -1) {
			return {
				company_name: trackerData[e].parent,
				tracker_company: e,
				tracker_id: trackerData[e].id,
				tracker_host: hostname
			}
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
		partialHostName = splitHostName[splitHostName.length-2] + '.' + splitHostName[splitHostName.length-1];
	}
	return partialHostName;
}

function getReferrer(request) {
	let ref = null;
	request.requestHeaders.forEach( header => {
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
	browser.tabs.get(tabID)
	.then( tabDetails => {
		console.log(tabDetails);
		if (!tabDetails.incognito) {
			onSendHeadersListeners(request)
		}
	})
	.catch((err) => {
		console.log("Could not get request details", request);
	});
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
		if (!initiatorURL) getReferrer(request);

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

				console.log(`TP Check >>> ${request.url} >>>> ${initiatorURL} >>> ${companyDetailsTP.company_name} >>>> ${companyDetailsFP.company_name} >>> ${partialHostName} >>>> ${partialHostNameFP}`);
				// Check if referrer is there.
				request.requestHeaders.forEach( header => {
					if (header.name.toLowerCase() === 'referer') {

						// Let's check if header.value hostname is different than FP hostname.
						// This can happen eg: Foodora loads criteo loads adserver.
						// Now adserver get ref as criteo which gives incorrect info on FP.

						const parsedRefName = parseURL(header.value);
						if (parsedRefName && (parsedRefName.hostname === parsedInitiatorURL.hostname)) {
							addToDict(header.value,  companyDetailsTP);
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

				// Let's keep track of the cookies too.
				// Helps find cases like Facebook.
				request.requestHeaders.forEach( header => {
					if (header.name.toLowerCase() === 'cookie') {
						cookieTable[decode(request.url)] = header.value;
						saveCookies(decode(request.url), header.value);
					}
				});
			} else {
				console.log(">> Companies are same >>> " + companyDetailsTP.company_name + ' >>>> ' + companyDetailsFP.company_name)
			}

			//}
		}
	} catch(ee) {
		console.log(ee);
	}
}

function onMessageListener(info, sender, sendResponse){

	// Only receive messages from control-panel.
	if (sender.url === controlPanelURL) {

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
			chrome.windows.create({"url": info.url, "incognito": true});
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
	}


	// Get input fields. PLEASE CHECK IF THIS IS A SAFE WAY. This could be exploited by websites.
	if (info.type === 'inputFields') {

		// Content scripts return "" at times.
		if (info.value.length === 0) return;

		if (!inputFields.hasOwnProperty(info.value)) inputFields[info.value] = {};
		if (!inputFields[info.value].hasOwnProperty(sender.url)) inputFields[info.value][sender.url] = {};
		inputFields[info.value][sender.url]	= info.details;

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
				saveInputFieldsCache(e,{ts:Date.now(), summary});
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
	Object.keys(inputFieldsCache).forEach( e => {
		const tDiff = (now - e.ts)/1000; // Seconds.
		if (tDiff > (10*1000)) {
			delete inputFieldsCache[e];
		}
	});
}


// Purge the input fields cache.
setInterval(purgeInputFieldsCache, 2000);

// CHROME EXTENSION APIs.

// Need to listen to onSendHeaders.
chrome.webRequest.onSendHeaders.addListener(observeRequest, {urls: [ "<all_urls>" ]},['requestHeaders']);

// chrome.webRequest.onCompleted.addListener(console.log)
// Need to open the control-panel.
chrome.browserAction.onClicked.addListener(function(tab){
  chrome.tabs.create({'url': chrome.extension.getURL('templates/control-panel.html')}, function(tab){})
})

// Receive messages from control-panel.
chrome.runtime.onMessage.addListener(onMessageListener);



// Because of a bug in FF: https://bugzilla.mozilla.org/show_bug.cgi?id=1405971,
// when doing fetch request from within the extension, it will send the unique ID.
// Hence this check, to remove it.
// Need to compare if onSendHeaders and onBeforeSendHeaders have the same object,
// then we should only keep onBeforeSenHeaders as it allows modifying.
// This only impacts Firefox & Firefox based browsers.

chrome.webRequest.onBeforeSendHeaders.addListener(function(request) {
	try {
			request.requestHeaders.forEach( header => {
			if (header.name.toLowerCase() === 'origin' && header.value.toLowerCase().indexOf('-extension://') > -1) {
				header.value = '';
			}
			return {requestHeaders: request.requestHeaders};
		});
	} catch (ee) {
		return {requestHeaders: request.requestHeaders};
	}
}, {urls: [ "<all_urls>" ]},['blocking', 'requestHeaders']);
