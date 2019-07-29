const fs = require("fs");
const axios = require("axios");

async function update() {
	// Fetch latest trackers data from whotracks.me
	const { trackers, companies } = (await axios.get(
		"https://whotracks.me/data/trackerdb.json"
	)).data;

	// Create mapping from tracker domain to company name
	const companyMapping = {};
	for (const [tracker, { company_id, domains }] of Object.entries(trackers)) {
		const companyName = (companies[company_id] || { name: "unknown" }).name;
		for (const domain of domains) {
			companyMapping[domain] = companyName;
		}
	}

	// Save mapping on disk
	fs.writeFileSync("whotracksme.json", JSON.stringify(companyMapping), {
		encoding: "utf-8"
	});
}

update();
