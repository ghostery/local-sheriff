/*
Types of leaks:
  1. On URL.
  2. On Page.
  3. Explicitly with third-party QP / Post request - TBD.

  TODO:
  How are 1 and 2 shared:
    a. Ref.
    b. Queryparameter
    c. Post req.


  Keep track whether the resource was a CSS, analytics.
  Keep track of cookies and other headers.
  Enhance chrome devtools???
*/
function safeHTML(str) {
	const temp = document.createElement('div');
	temp.textContent = str;
  return temp.innerHTML;
};

function highlight(text) {
  const re = new RegExp(text, 'ig');

  let inputText = document.getElementById("tp-results");
  let innerHTML = inputText.innerHTML;

  innerHTML = innerHTML.replace(re, `<span class='label label-danger'>${text}</span>`);
  inputText.innerHTML = innerHTML;


  let inputTextURL = document.getElementById("results");
  let innerHTMLURL = inputTextURL.innerHTML;

  innerHTMLURL = innerHTMLURL.replace(re, `<span class='label label-danger'>${text}</span>`);
  inputTextURL.innerHTML = innerHTMLURL;
}

// Create results table.
function createResultTable(info) {
  let table = `<table class="table"> <thead>`;
  table += `          <tr> <th>Company</th> <th>Website</th></tr> </thead>
          <tbody>`;

  Object.keys(info).forEach( (com, idx) => {
    // Company td.


    // Websites on which tracker company  found.
    info[com]['websites'].forEach( website => {
      table += `<tr><td>${com}</td>`;
      table += `<td>${website}</td>`;
      table += `</tr>`;
    });
  });
  table += `</tbody></table>`;
  return table;
}

// Create detailed table.
// Taking the bootstrap cards approach.

function generateCard(row, idx, query) {
  let card = `<div class="card" style="width: 100%;">`;
  card += `<div class="card-body">`;
  card += `<span class="label label-default">Leaked url via ref or a key like dl,dr  in third-party: </span><h5 class="card-title leaky-url" style="overflow-wrap:break-word;">${row.leakyURL} <br/><br/> Visit Page</h5>`;
  card += `<ul class="list-group" style="overflow-wrap:break-word;">`;
  Object.keys(row.trackers).forEach( t => {
    card += `<li class="list-group-item active">${t}</li>`;
    card += `<li class="list-group-item" style="overflow-wrap:break-word;">${row.trackers[t]}</li>`;
  });
  card += `</ul>`;
  card += `</div>`;
  card += `</div>`;
  return card;

}

function generateCardTP(row, query) {
  let card = `<div class="container bs-docs-container"><div class="bs-docs-section"><div class="bs-callout bs-callout-danger">`;
  card += `<div class="card" style="overflow-wrap:break-word;">`;
  card += `<div class="card-body">`;
  card += `<h4>Also found ${safeHTML(query)} in third-party urls courtesy ${row.details.fpdetails.tracker_host}: </h4><div class="card-title leaky-url"><b>${row.leakyTP}</b></div><br/>`;
  if (row.cookie) {
    card += `<span class="badge badge-warning">Cookie</span>${safeHTML(row.cookie)}<br/>`;
  } else {
    card += `<span class="badge badge-warning">No cookie detected.</span>`;
  }
  card += `</div>`;
  card += `</div></div></div></div>`;
  return card;

}

function getWebsitesCount(info) {
  const websites = new Set();

  //info.forEach( e => {
    Object.keys(info.resultTable).forEach( y => {
      console.log(info.resultTable[y]);
      websites.add(info.resultTable[y].website);
    });
  //})
  console.log([...websites]);
  return [...websites];
}
document.onkeyup = function (oPEvt) {
  console.log(oPEvt);
  const query = document.getElementById('search-box').value;

  search(query);
};

function inputSearch(query) {
  // Populate the text box and fire the search event.
  document.getElementById('search-box').value = query;
  search(query);
}

function search(query){
  // Send the query to background and capture the response.

  const safeQuery = safeHTML(query);
  const additionalInfo = {
    type: 'checkPresence',
    query: safeQuery
  };


  chrome.runtime.sendMessage(additionalInfo, e => {

    // console.log(e.response);
    // console.log(getWebsitesCount(e.response));
    const countCompanies = e.response.ls.companies.length; // Placeholder.
    const countDomains = e.response.ls.domain.length; //Placeholder.
    const counttpDomains = e.response.ls.tpHosts.length;

    document.getElementById('summary').innerHTML = '<h1>' + safeQuery + '</span></h1> <p>has been leaked to <b>' + counttpDomains +' third-party domains </b>, owned by <b>' + countCompanies + ' different companies </b> courtesy <b>' + countDomains + ' website. </p>';

    /*
    if (countDomains === 1) {
      document.getElementById('summary').innerHTML += ' website. </p>';
    } else {
      document.getElementById('summary').innerHTML += ' websites. </p>';
    }
    */

    if (countCompanies > 0) {
      document.getElementById('final-results').style.display = 'block';
      document.getElementById('final-results').innerHTML = createResultTable(e.response.resultTable);
    } else {
      document.getElementById('final-results').style.display = 'none';
    }

    document.getElementById('results').innerHTML = '';
    document.getElementById('tp-results').innerHTML = '';
    // Check Leaky URLs.
    if (Object.keys(e.response.details[0]).length > 0) {

      document.getElementById('results').innerHTML += "<center><h2> Detailed Logs</h2></center>";
      // Iterate over each result.
      e.response.details[0].forEach( (r, idx) => {

        const card = generateCard(r, idx, safeQuery);
        document.getElementById('results').innerHTML += card;
      });

    };



    // Informaion leaked on other third-parties.
    // Check Leaky Pages.
    if (Object.keys(e.response.details[2]).length > 0) {


      // Iterate over each result.
      e.response.details[2].forEach( (r, idx) => {
        const card = generateCardTP(r, safeQuery);
        document.getElementById('tp-results').innerHTML += card;
      });

    };

    console.log(">>>>> safeQuery >>>> " + safeQuery);

    highlight(safeQuery);
    // Detect click on url div.
    $('h5.leaky-url').click(function(e) {
        console.log(e);
        const url = e.currentTarget.textContent.split('Visit Page')[0];
        console.log(url);
        e.stopPropagation();
        e.preventDefault();

        const additionalInfo = {
          type: 'openLink',
          url
        };

        // Open page in new incognito window.
        chrome.runtime.sendMessage(additionalInfo);
        return false;
    });

  });
}

/*
// Let's get the summary.
const additionalInfo = {
  type: 'sessionSummary'

}

chrome.runtime.sendMessage(additionalInfo, e => {
  if (!e.response) return;
  let html = `<code>No. of websites visited:</code> ${e.response.countUniqueDomains}`;
  html += `<br/><code>No. of pages visited:</code> ${e.response.countUniqueURLs}`;
  html += `<br/><code>No. of third-party companies tracking:</code> ${e.response.countUniqueCompanies}`;
  document.getElementById('overall-summary').innerHTML = html;

});
*/

function updateInputFields() {
  // Get input fields leaked.
  // Let's get the summary.
  const additionalInfoIFL = {
    type: 'inputFieldsLeaked'

  }

  chrome.runtime.sendMessage(additionalInfoIFL, e => {
    let html = '';
    Object.keys(e.response).forEach( (y, idx) => {
      const safeY = safeHTML(y);
      if (e.response[safeY]) {
        // Info leaked.
        html += `<code>${safeY}: </code><button id=input-details-${idx} value="${safeY}" class="label label-danger">Yes </button><br/>`;
      }
      else {
        // Info not leaked so far.
        html += `<code>${safeY}: </code> <button id=input-details-${idx} value="${safeY}" class="label label-success">No </button><br/>`;
      }
    });
    document.getElementById('input-fields-summary').innerHTML = html;

    // This is a very inefficient way of adding a listener. But keeping it like this for now.
    Object.keys(e.response).forEach( (y, idx) => {
      if(document.getElementById(`input-details-${idx}`)) {
        document.getElementById(`input-details-${idx}`).addEventListener("click", function(){
          inputSearch(document.getElementById(`input-details-${idx}`).value);
        });
      }
    });



  });
}

function clean() {
    const additionalInfoIFL = {
    type: 'cleanStorage'
  }

  chrome.runtime.sendMessage(additionalInfoIFL);
}

document.addEventListener('DOMContentLoaded', function() {

  // Listen for clear data button click.
  document.getElementById("clean-storage").addEventListener("click", clean);
});

function onMessageListener(info, sender, sendResponse){
  if (info.type === 'updateInputFields') {
    // Just to make sure, the calls have finised, else it will give incorrect information about leaks.
    // setTimeout(updateInputFields, 3000);
  }

}

chrome.runtime.onMessage.addListener(onMessageListener);
updateInputFields();
