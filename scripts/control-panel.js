// Change icon which shows it's recording.
function start_recording() {
	// We need to store the pref. to keep track.
	const recordingState = true;
	const saveObject = {
		recording: recordingState
	}
	chrome.storage.local.set(saveObject, e => {
		console.log("State changed. It's recording now.");
		chrome.browserAction.setIcon({path: '../icons/green-38.png'});
		document.getElementById('start-recording').style.display = 'none';
		document.getElementById('stop-recording').style.display = 'block';
		console.log(">>>>>> var >>" + status);
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
		chrome.browserAction.setIcon({path: '../icons/tool-icon-38.png'});
		document.getElementById('stop-recording').style.display = 'none';
		document.getElementById('start-recording').style.display = 'block';

		const additionalInfo = {
			type: 'recording',
			recordingStatus: recordingState
		};

		chrome.runtime.sendMessage(additionalInfo);
	});
}