function safeHTML(str) {
	const temp = document.createElement('div');
	temp.textContent = str;
	return temp.innerHTML;
};


// Change icon which shows it's recording.
function start_recording() {
	// We need to store the pref. to keep track.
	const recordingState = true;
	const saveObject = {
		recording: recordingState
	}
	chrome.storage.local.set(saveObject, e => {
		console.log("State changed. It's recording now.");
		chrome.browserAction.setIcon({ path: '../icons/green-38.png' });
		document.getElementById('start-recording').style.display = 'none';
		document.getElementById('stop-recording').style.display = 'block';
		const additionalInfo = {
			type: 'recording',
			recordingStatus: recordingState
		};

		chrome.runtime.sendMessage(additionalInfo);
	});
}

// Change icon which shows when it's not recording.
function stop_recording() {
	// We need to store the pref. to keep track.
	const recordingState = false;
	const saveObject = {
		recording: recordingState
	}
	chrome.storage.local.set(saveObject, e => {
		console.log("State changed. It's not recording now.");
		chrome.browserAction.setIcon({ path: '../icons/tool-icon-38.png' });
		document.getElementById('stop-recording').style.display = 'none';
		document.getElementById('start-recording').style.display = 'block';

		const additionalInfo = {
			type: 'recording',
			recordingStatus: recordingState
		};

		chrome.runtime.sendMessage(additionalInfo);
	});
}

// Listener of headings to display or hide.
function loadListeners() {
	document.getElementById("h-input-fields-summary").addEventListener("click", function (e) {
		const style = document.getElementById('input-fields-summary').style.display;

		if (style === 'none') {
			document.getElementById('input-fields-summary').style.display = 'block';
		} else {
			document.getElementById('input-fields-summary').style.display = 'none';
		}
	});

	// poi
	document.getElementById("h-poi-summary").addEventListener("click", function (e) {
		const style = document.getElementById('poi-summary').style.display;

		if (style === 'none') {
			// Let's get the values that can be used for tracking a user.
			const additionalInfoIFL = {
				type: 'checkTrackingValues'

			}

			chrome.runtime.sendMessage(additionalInfoIFL, e => {
				console.log(e);
				e.response.forEach((y, idx) => {
					console.log(y);
					const safeY = safeHTML(y);
					const fields_summary = document.getElementById('poi-summary');
					// Info leaked.
					const code = document.createElement('code');
					code.textContent = `${safeY}:`;
					fields_summary.appendChild(code);

					const btn = document.createElement('button');
					btn.textContent = 'Yes';
					btn.value = `${safeY}`;
					btn.id = `input-details-${idx}`;
					btn.className = 'label label-danger';
					fields_summary.appendChild(btn);
					fields_summary.appendChild(document.createElement('br'));

					// This is a very inefficient way of adding a listener. But keeping it like this for now.
					Object.keys(e.response).forEach((y, idx) => {
						if (document.getElementById(`input-details-${idx}`)) {
							document.getElementById(`input-details-${idx}`).removeEventListener("click", function (e) {

							});

							document.getElementById(`input-details-${idx}`).addEventListener("click", function () {
								inputSearch(document.getElementById(`input-details-${idx}`).value, "tracking_id");
							});
						}
					});
				});
			});
			document.getElementById('poi-summary').style.display = 'block';
		} else {
			document.getElementById('poi-summary').style.display = 'none';
		}
	});

	// company.
	document.getElementById("h-company-summary").addEventListener("click", function (e) {
		const style = document.getElementById('company-summary').style.display;
		window.open('./company-tree.html');
	});
}

window.setTimeout(loadListeners, 1000);