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

function highlight(highlightText)
{
    const tp_results = document.getElementById("tp-results");
    InstantSearch.highlight(tp_results, highlightText);

    const results = document.getElementById("results");
    InstantSearch.highlight(results, highlightText);
}

// Create results table.
function createResultTable(info) {
  
  const final_result = document.getElementById('final-results');
  final_result.textContent = '';

  const table = document.createElement('table');
  table.className = 'table';
  final_result.appendChild(table);

  const th = document.createElement('thead');
  table.appendChild(th);

  const tr = document.createElement('tr');
  const th_r = document.createElement('th');
  
  th_r.textContent = 'Company';
  const th_r_2 = document.createElement('th');
  th_r_2.textContent = 'Website';

  tr.appendChild(th_r);
  tr.appendChild(th_r_2);
  th.appendChild(tr);

  const tbody = document.createElement('tbody');
  console.log(info);
  Object.keys(info).forEach( (com, idx) => {
    info[com]['websites'].forEach( website => {
      const tr_1 = document.createElement('tr');
      const td = document.createElement('td');
      td.textContent = `${com}`;
      const td_2 = document.createElement('td');
      td_2.textContent = `${website}`;

      tr_1.appendChild(td);
      tr_1.appendChild(td_2);

      tbody.appendChild(tr_1);
    });
  });
  table.appendChild(tbody);
}

// Create detailed table.
// Taking the bootstrap cards approach.

function generateCard(row) {
  const results = document.getElementById('results');

  const div_card = document.createElement('div');
  div_card.className = 'card';
  div_card.style = 'width: 100%;';
  results.appendChild(div_card);

  const div_card_body = document.createElement('div');
  div_card_body.className = 'card-body';
  div_card.appendChild(div_card_body);

  const span_label = document.createElement('span');
  span_label.className = "label label-default";
  span_label.textContent = "Leaked url via ref or a key like dl,dr  in third-party:";
  div_card_body.appendChild(span_label);

  const h5 = document.createElement('h5');
  h5.className = "card-title leaky-url";
  h5.style = "overflow-wrap:break-word;";
  h5.textContent = `${row.leakyURL} `;
  div_card_body.appendChild(h5);

  const ul = document.createElement('ul');
  ul.className = "list-group";
  ul.style = "overflow-wrap:break-word;";
  div_card_body.appendChild(ul);

  Object.keys(row.trackers).forEach( t => {
    console.log(row.trackers);
    const li_title = document.createElement('li');
    li_title.className = "list-group-item active";
    li_title.textContent =`${t}`;
  
    const li_details = document.createElement('li');
    li_details.className = "list-group-item";
    li_details.style = "overflow-wrap:break-word;";
    li_details.textContent = `${row.trackers[t]}`;
    ul.appendChild(li_title);
    ul.appendChild(li_details);
  });

}

function generateCardTP(row, query) {
  const results = document.getElementById('tp-results');

  const div_card = document.createElement('div');
  div_card.className = 'container bs-docs-container';
  results.appendChild(div_card);

  const div_card_body = document.createElement('div');
  div_card_body.className = 'bs-docs-section';
  div_card.appendChild(div_card_body);

  const div_card_body_2 = document.createElement('div');
  div_card_body_2.className = 'bs-callout bs-callout-danger';
  div_card_body.appendChild(div_card_body_2);

  const div_card_body_3 = document.createElement('div');
  div_card_body_3.className = 'card';
  div_card_body_3.style = 'overflow-wrap:break-word;'
  div_card_body_2.appendChild(div_card_body_3);
  
  const div_card_body_4 = document.createElement('div');
  div_card_body_4.className = 'card-body';
  div_card_body_3.appendChild(div_card_body_4);

  const h4 = document.createElement('h4');
  h4.textContent = `Also found ${safeHTML(query)} in third-party urls courtesy ${row.details.fpdetails.tracker_host}:`;
  div_card_body_4.appendChild(h4);

  const div_card_body_5 = document.createElement('div');
  div_card_body_5.className = 'card-title leaky-url';
  div_card_body_4.appendChild(div_card_body_5);

  const b = document.createElement('b');
  b.textContent = `${row.leakyTP}`;
  div_card_body_5.appendChild(b);

  if (row.cookie) {
    const span_label = document.createElement('span');
    span_label.className = "badge badge-warning";
    span_label.textContent = "Cookie";
    results.appendChild(span_label);

    const span_test = document.createElement('span');
    span_test.textContent = `${safeHTML(row.cookie)}`;
    results.appendChild(span_test);
  } else {
      const span_label = document.createElement('span');
      span_label.className = "badge badge-warning";
      span_label.textContent = "No Cookie detected";
      results.appendChild(span_label);
  }

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

    const summary = document.getElementById('summary');
    summary.textContent = '';

    const h1 = document.createElement('h1');
    h1.textContent = `${safeQuery}`;
    summary.appendChild(h1);

    const p1 = document.createElement('p');
    p1.textContent = `has been leaked to`;
    
    const b1 = document.createElement('b');
    b1.textContent = ` ${counttpDomains}  third-party domains`;
    p1.appendChild(b1);
    p1.appendChild(document.createTextNode(", owned by"));

    const b2 = document.createElement('b');
    b2.textContent = ` ${countCompanies} different companies`;
    p1.appendChild(b2);
    p1.appendChild(document.createTextNode(' courtesy'));

    const b3 = document.createElement('b');
    b3.textContent = ` ${countDomains} website.`;
    p1.appendChild(b3);

    summary.appendChild(p1);


    if (countCompanies > 0) {
      document.getElementById('final-results').style.display = 'block';
      createResultTable(e.response.resultTable);
    } else {
      document.getElementById('final-results').style.display = 'none';
    }

    document.getElementById('results').textContent = '';
    document.getElementById('tp-results').textContent = '';
    // Check Leaky URLs.
    if (Object.keys(e.response.details[0]).length > 0) {

      
      // Iterate over each result.
      e.response.details[0].forEach( (r, idx) => {
        generateCard(r);
      });

      // Add next header for next column.
      const results = document.getElementById('results');
      const center_detailed_log = document.createElement('center');
      const h2 = document.createElement('h2');
      h2.textContent = 'Detailed Logs';

      center_detailed_log.appendChild(h2);
      results.appendChild(center_detailed_log);
    };



    // Informaion leaked on other third-parties.
    // Check Leaky Pages.
    if (Object.keys(e.response.details[2]).length > 0) {


      // Iterate over each result.
      e.response.details[2].forEach( (r, idx) => {
        generateCardTP(r, safeQuery);
      });

    };


    highlight(safeQuery);


  });
}


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
      const fields_summary = document.getElementById('input-fields-summary');
      if (e.response[safeY]) {
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
      }
      else {
        // Info not leaked so far.
        const code = document.createElement('code');
        code.textContent = `${safeY}:`;
        fields_summary.appendChild(code);

        const btn = document.createElement('button');
        btn.textContent = 'No';
        btn.value = `${safeY}`;
        btn.id = `input-details-${idx}`;
        btn.className = 'label label-success';
        fields_summary.appendChild(btn);
        fields_summary.appendChild(document.createElement('br'));
      }
    });


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
