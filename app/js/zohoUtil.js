let zohoDeskInstance; // Declare a global variable to store the ZohoDesk instance
let zohoCRMContactId;
let deskContactGlobal;

function registerEventListeners() {
    // On Ticket Shift (moving from one ticket to another in the left hand sidebar)
    zohoDeskInstance.on("ticket_Shift", function (data) {

        setupInitalOptions();

    });

    // Add other event listeners here
}

function updateStatusBar(number, subject, contactName) {
    document.getElementById('ticketNumber').innerHTML = `<strong>#${number}</strong> - ${subject}`
    document.getElementById('ticketContact').innerText = contactName
}

function addAndSetActiveBreadcrumb(text) {

    const breadcrumbList = document.querySelector('.breadcrumb');
    
    const defBreadcrumb = document.createElement('li');
    defBreadcrumb.classList.add('breadcrumb-item');
    defBreadcrumb.innerHTML = `<a href="#" onclick="setupInitalOptions()">Home</a>`

    const newBreadcrumb = document.createElement('li');
    newBreadcrumb.classList.add('breadcrumb-item', 'active');
    newBreadcrumb.setAttribute('aria-current', 'page');
    newBreadcrumb.textContent = text;

    breadcrumbList.appendChild(defBreadcrumb)
    breadcrumbList.appendChild(newBreadcrumb);
  }

// pull zoho desk user data from logged on user
function getLoggedInUserData() {
    // define the properties to pull
    const properties = ['id', 'fullName', 'timeZone'];

    // Create an array of promises for each property
    const promises = properties.map(property => ZOHODESK.get(`user.${property}`));

    // Wait for all promises to resolve
    Promise.all(promises)
        .then(responses => {
            // The `responses` array contains the values of the requested properties in the same order as the `properties` array
            const [id, fullName, timeZone] = responses;
            console.log('User ID:', id);
            console.log('Full Name:', fullName);
            console.log('Time Zone:', timeZone);
            // Add your logic here for handling the retrieved data
        })
        .catch(error => {
            // Error Handling
            console.error('Error fetching user properties:', error);
            displayErrorAlert('Function Failure..', error.message);
        });
}

// get list of departments and agents (pass tickets from dept to dept)
function getDepartments() {
    ZOHODESK.get('department.list')
        .then(function (response) {
            // Response - requested detail
            const departments = response;
            console.log('Departments:', departments);

            // Add your logic here for handling the retrieved departments
            // For example, you can loop through the departments array and process each department object
            departments.forEach(department => {
                console.log(`Department ID: ${department.id}, Name: ${department.name}`);
            });
        })
        .catch(function (error) {
            // Error Handling
            console.error('Error fetching department list:', error);
            displayErrorAlert('Function Failure..', error.message);
        });
}

// pull info from current ticket
function getCurrentTicketData() {
    // define the properties to pull
    const properties = ['number', 'subject', 'contactName'];

    // Create an array of promises for each property
    const promises = properties.map(property => ZOHODESK.get(`ticket.${property}`));

    // Wait for all promises to resolve
    Promise.all(promises)
        .then(responses => {
            // The `responses` array contains the values of the requested properties in the same order as the `properties` array
            const [number, subject, contactName] = responses;
            console.log('Ticket #:', number);
            console.log('Subject:', subject)

            // Add your logic here for handling the retrieved data
            updateStatusBar(number["ticket.number"], subject["ticket.subject"], contactName["ticket.contactName"]);
        })
        .catch(error => {
            // Error Handling
            console.error('Error fetching ticket properties:', error);

            displayErrorAlert('Function Failure. .' + error.message);

        });
}

function fetchDeskContact(id) {

    let endpoint = `https://desk.zoho.com/api/v1/contacts/${id}`;
    let connection = 'sba_functions_v3';
    let action = 'GET';

    var parameters = {
        url: endpoint,
        headers: { 'Content-Type': 'application/json' },
        type: action,
        postBody: {},
        data: {},
        connectionLinkName: connection,
        responseType: "json",
    };

    return ZOHODESK.request(parameters)
}

function getDeskContact(deskContactId) {
    return fetchDeskContact(deskContactId)
        .then(response => {
            return response
        })
        .catch(error => {
            console.error('Error fetching desk contact:', error);
        });
}
function searchForCRMEfin(accountId, efinType) {
    let endpoint = `https://www.zohoapis.com/crm/v3/EFINs/search?criteria=((Account_Name:equals:${accountId})and(EFIN_Type:equals:${efinType}))`;
    console.log(endpoint)
    let connection = 'sba_functions_v3';
    let action = 'GET';

    var parameters = {
        url: endpoint,
        headers: { 'Content-Type': 'application/json' },
        type: action,
        postBody: {},
        data: {},
        connectionLinkName: connection,
        responseType: "json",
    };

    return ZOHODESK.request(parameters)
}


function searchForCRMContact(lastName, firstName) {
    const firstLetter = firstName[0];
    let endpoint = `https://www.zohoapis.com/crm/v3/Contacts/search?criteria=((Last_Name:equals:${lastName})and(First_Name:starts_with:${firstLetter}))`;
    console.log(endpoint)
    let connection = 'sba_functions_v3';
    let action = 'GET';

    var parameters = {
        url: endpoint,
        headers: { 'Content-Type': 'application/json' },
        type: action,
        postBody: {},
        data: {},
        connectionLinkName: connection,
        responseType: "json",
    };

    return ZOHODESK.request(parameters)
}

function getCRMRelatedList(module, recordId, relation) {


    let endpoint = `https://www.zohoapis.com/crm/v3/${module}/${recordId}/${relation}`;
    console.log('EP', endpoint)
    let connection = 'sba_functions_v3';
    let action = 'GET';
    let fields = ['EFIN']
    var parameters = {
        url: endpoint,
        headers: { 'Content-Type': 'application/json' },
        type: action,
        postBody: {},
        data: {'fields':'EFIN'},
        connectionLinkName: connection,
        responseType: "json",
    };
    return ZOHODESK.request(parameters)

}

function getCRMInfo(module, recordId) {


    let endpoint = `https://www.zohoapis.com/crm/v3/${module}/${recordId}`;
    let connection = 'sba_functions_v3';
    let action = 'GET';

    var parameters = {
        url: endpoint,
        headers: { 'Content-Type': 'application/json' },
        type: action,
        postBody: {},
        data: {},
        connectionLinkName: connection,
        responseType: "json",
    };

    return ZOHODESK.request(parameters)
}

function getMasterEfins() {
    return getCRMInfo('Contacts', zohoCRMContactId)
        .then(crmContact => {
            let accountId = crmContact.data.statusMessage.data['0'].Account_Name.id;

            searchForCRMEfin(accountId, 'Master').then(masters => {
                console.log(masters);

                let html = `<div class="table-responsive table-detail overflow-hidden">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>EFIN</th>
                                            <th>SW</th>
                                            <th>Master</th>
                                            <th>Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>`;

                masters.data.statusMessage.data.forEach(master => {
                    html += `
                        <tr>
                            <td>${master.Name}</td>
                            <td>${master.SVB_Software}</td>
                            <td>${master.Master_EFIN_lu.name}</td>
                            <td>${master.Type}</td>
                        </tr>
                    `;
                });

                html += `</tbody></table></div>`;
                addAndSetActiveBreadcrumb('CRM Info');
                document.getElementById('content-container').innerHTML = html;
            });

        }).catch(error => {
            console.error('Error desk CRM contact:', error);
            displayErrorAlert('Function Failure.. ' + error.message);
        });
}


function getCRMContact() {
    return getCRMInfo('Contacts', zohoCRMContactId)
        .then(crmContact => {
            console.log(crmContact)
            let contactData = [
                { label: "Account ID", value: crmContact.data.statusMessage.data['0'].Account_Name.id },
                { label: "Account Name", value: crmContact.data.statusMessage.data['0'].Account_Name.name },
                { label: "Became Client", value: crmContact.data.statusMessage.data['0'].Became_Client },
                { label: "Phone Number", value: crmContact.data.statusMessage.data['0'].Phone },
                { label: "SBA Buildout", value: crmContact.data.statusMessage.data['0'].SBA_Buildout },
                { label: "Workflow Run URL", value: crmContact.data.statusMessage.data['0'].WorkFlow_Run_URL },
                { label: "Sales Person", value: crmContact.data.statusMessage.data['0'].Sales_Person },
                { label: "Account Status", value: crmContact.data.statusMessage.data['0'].Status },
                { label: "Account Type", value: crmContact.data.statusMessage.data['0'].Type }
              ];

            let html = `<div class="table-responsive table-detail overflow-hidden">
                            <table class="table">
                                <tbody>`;
            contactData.forEach(data => {
            html += `
                <tr>
	                <td class="table-label">${data.label}</td>
	                <td class="table-value">${data.value}</td>
                </tr>
            `;
            });

            html += `</tbody></table></div>`
            addAndSetActiveBreadcrumb('CRM Info')
            document.getElementById('content-container').innerHTML = html;
        })
        .catch(error => {

            console.error('Error desk CRM contact:', error);
            displayErrorAlert('Function Failure.. ' + error.message);

        });
}

function getDeskContactIdFromTicket() {
    return ZOHODESK.get('ticket.contactId').then(response => {
        return response['ticket.contactId'];
    });
}

function disableUILink(elementId, descriptorId, messageText) {
    const element = document.getElementById(elementId);

    if (element.tagName === 'A') {
        element.removeAttribute('href');
    }

    element.setAttribute('disabled', true);
    element.classList.add('disabled');
    document.getElementById(descriptorId).innerText = messageText

}

function enableUILink(elementId, descriptorId, messageText) {
    const element = document.getElementById(elementId);
  
    if (element.tagName === 'A') {
      element.setAttribute('href', '#');
    }
  
    element.removeAttribute('disabled');
    element.classList.remove('disabled');
    document.getElementById(descriptorId).innerText = messageText
  }

function resetUI(){

    document.getElementById('breadcrumb-nav-list').innerHTML = ''

    let html =`
    <div id="list-group-options-container" class="list-group-options">
        <a href="#" id="crmInfoListItem" class="list-group-item list-group-item-action d-flex gap-3 py-3 disabled" aria-current="true" disabled>
          <div class="d-flex gap-2 w-100 justify-content-between">
            <div>
              <h6 class="mb-0">CRM Info</h6>
              <p id="crmInfoDescriptor" class="mb-0 opacity-75">Checking for contact id...</p>
            </div>
          </div>
        </a>

        <a href="#" id="crmEfinListItem" class="list-group-item list-group-item-action d-flex gap-3 py-3 disabled" aria-current="true" disabled>
          <div class="d-flex gap-2 w-100 justify-content-between">
            <div>
              <h6 class="mb-0">Software & EFINs</h6>
              <p id="crmEfinDescriptor" class="mb-0 opacity-75">Checking for contact id...</p>
            </div>
          </div>
        </a>

        <a href="#" id="helpDeskListItem" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
          <div class="d-flex gap-2 w-100 justify-content-between">
            <div>
              <h6 class="mb-0">HelpDesk</h6>
              <p id="helpDeskDescriptor" class="mb-0 opacity-75">Helpdesk functions available</p>
            </div>
          </div>
        </a>
      </div>`
      document.getElementById('content-container').innerHTML = html;

    // specify elements to listen to for clicks
    const crmInfoLink = document.getElementById("crmInfoListItem");
    const efinInfoLink = document.getElementById("crmEfinListItem");
    const helpDeskLink = document.getElementById("helpDeskListItem")

    // CRM Info Listener
    crmInfoLink.addEventListener("click", function(event) {
      event.preventDefault(); // Prevent the default navigation behavior
      console.log("CRM Info Link clicked!");
      getCRMContact();
    });

    // EFIN Info Listener
    efinInfoLink.addEventListener("click", function(event) {
      event.preventDefault(); // Prevent the default navigation behavior
      console.log("EFIN Info Link clicked!");
      getMasterEfins();
    });

    // HelpDesk Info Listener
    helpDeskLink.addEventListener("click", function(event) {
        event.preventDefault(); // Prevent the default navigation behavior
        console.log("helpDeskLink clicked!");
        });
    
}  

function setupInitalOptions() {

    resetUI();
    getCurrentTicketData();
    // Get the zoho desk contact's ID from the ticket 
    getDeskContactIdFromTicket().then(deskContactId => {
        // Look up that user in zoho desk
        getDeskContact(deskContactId).then(deskContact => {
            deskContactGlobal = deskContact
            // Make sure conneciton is authorized
            if (deskContact.data.error_code == "1000") {
                console.log('Authorize Connection:', deskContact.data.resumeUrl)
                displayErrorAlert('Authorize Connection.. ' + deskContact.data.resumeUrl);
            }
            // Get the user's zohoCRMContactId 
            else if (deskContact.data.statusMessage.zohoCRMContact) {
                // Set the Global variable for zohoCRMContactId
                zohoCRMContactId = deskContact.data.statusMessage.zohoCRMContact.id;
            }
            // If user isnt synced try to get zoho contact id custom field
            else if (deskContact.data.statusMessage.cf.cf_zoho_contact_id) {
                zohoCRMContactId = deskContact.data.statusMessage.cf_zoho_contact_id.id;
            }
            // If zoho contact id field is null error out and display message 
            else {
                zohoCRMContactId = deskContact.data.statusMessage.zohoCRMContact.id
            }
            enableUILink('crmInfoListItem', 'crmInfoDescriptor', 'Ready to fetch..');
            enableUILink('crmEfinListItem', 'crmEfinDescriptor', 'Ready to fetch..'); 
            
        }).catch(error => {
            // Render error in popup if there's an issue with fetching deskContact
            displayErrorAlert('Function Failure.. ' + error.message);
            document.getElementById('crmInfoDescriptor').innerHTML = `Not synced...`
            document.getElementById('efinInfoDescriptor').innerHTML = `Not synced...`
        });
    });
}

window.onload = function () {
    ZOHODESK.extension.onload().then(function (App) {

        zohoDeskInstance = App.instance; // Assign the instance to the global variable

        registerEventListeners(); // Call the function to register event listeners
        getLoggedInUserData();
        setupInitalOptions();

        // getTicketContactData();
        // Other code
    });
};
