let zohoDeskInstance; // Declare a global variable to store the ZohoDesk instance
let zohoCRMContactId;
let deskContactGlobal;
// Function to register event listeners
function registerEventListeners() {
    // On Ticket Shift (moving from one ticket to another in the left hand sidebar)
    zohoDeskInstance.on("ticket_Shift", function(data){

        document.getElementById("t_shift_cell").innerText = data['ticket_shifted']
        setupInitalOptions();

    });
  
    // Add other event listeners here
  }

function updateStatusBar(number, subject, contactName){
    document.getElementById('ticketNumber').innerHTML = `<strong>#${number}</strong> - ${subject}`
    document.getElementById('ticketContact').innerText = contactName
}

// pull zoho desk user data from logged on user
function getLoggedInUserData(){
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
function getCurrentTicketData(){
    // define the properties to pull
    const properties = ['number','subject','departmentId', 'id', 'accountName', 'contactName', 'contactId'];

    // Create an array of promises for each property
    const promises = properties.map(property => ZOHODESK.get(`ticket.${property}`));

        // Wait for all promises to resolve
        Promise.all(promises)
        .then(responses => {
            // The `responses` array contains the values of the requested properties in the same order as the `properties` array
            const [number, subject, id, contactName] = responses;
            console.log('Ticket #:', number);
            console.log('Subject:', subject	)

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
        headers: { 'Content-Type': 'application/json'},
        type: action,
        postBody: {},
        data: {},
        connectionLinkName: connection,
        responseType :"json",
    };

    return ZOHODESK.request( parameters )
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

function searchForCRMContact(lastName, firstName){
    const firstLetter = firstName[0];
    let endpoint = `https://www.zohoapis.com/crm/v3/Contacts/search?criteria=((Last_Name:equals:${lastName})and(First_Name:starts_with:${firstLetter}))`;
    console.log(endpoint)
    let connection = 'sba_functions_v3';
    let action = 'GET';

    var parameters = {
        url: endpoint,
        headers: { 'Content-Type': 'application/json'},
        type: action,
        postBody: {},
        data: {},
        connectionLinkName: connection,
        responseType :"json",
    };

    return ZOHODESK.request( parameters )
}

function getCRMInfo(module, recordId) {
    
    let endpoint = `https://www.zohoapis.com/crm/v3/${module}/${recordId}`;
    let connection = 'sba_functions_v3';
    let action = 'GET';
    
    var parameters = {
        url: endpoint,
        headers: { 'Content-Type': 'application/json'},
        type: action,
        postBody: {},
        data: {},
        connectionLinkName: connection,
        responseType :"json",
    };

    return ZOHODESK.request( parameters )
}

function getCRMContact() {
    return getCRMInfo('Contacts', zohoCRMContactId)
        .then(crmContact => {
            console.log(crmContact)
            let accountId = crmContact.data.statusMessage.data['0'].Account_Name.id
            
            console.log(accountId)
            return crmContact
        })
        .catch(error => {

            console.error('Error desk fetching contact:', error);
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

  function setupInitalOptions() {
    // Get the zoho desk contact's ID from the ticket 
    getDeskContactIdFromTicket().then(deskContactId => {
      // Look up that user in zoho desk
      getDeskContact(deskContactId).then(deskContact => {
        deskContactGlobal = deskContact
       // Make sure conneciton is authorized
        if (deskContact.data.error_code == "1000"){
            console.log('Authorize Connection:', deskContact.data.resumeUrl)
            displayErrorAlert('Authorize Connection.. ' + deskContact.data.resumeUrl);
        }
        // Get the user's zohoCRMContactId 
        else if (deskContact.data.statusMessage.zohoCRMContact) {
          // Set the Global variable for zohoCRMContactId
            zohoCRMContactId = deskContact.data.statusMessage.zohoCRMContact.id;
        } 
        // If user isnt synced try to get zoho contact id custom field
        else if (deskContact.data.statusMessage.cf.cf_zoho_contact_id){
            zohoCRMContactId = deskContact.data.statusMessage.cf_zoho_contact_id.id;
        }
        // If zoho contact id field null search zoho 
        else {

            firstName = deskContact.data.statusMessage.firstName;
            lastName = deskContact.data.statusMessage.lastName;
            
            searchForCRMContact(firstName, lastName).then(searchResultsList => {
                if (searchResultsList.data.statusMessage.data){

                    const results = searchResultsList.data.statusMessage.data
                    const resultsList = document.getElementById('results-list');

                    results.forEach(result => {
                      const listItem = document.createElement('a');
                      listItem.classList.add('list-group-item', 'list-group-item-action');
                      listItem.innerHTML = `
                        <div class="d-flex w-100 justify-content-between">
                          <h5 class="mb-1">${result.Full_Name}</h5>
                          <small>${result.Type}</small>
                        </div>
                        <p class="mb-1">${result.Account_Name.name}</p>
                        <small>Status: ${result.Status}</small>
                        <small>ID: ${result.id}</small>
                      `;
                
                      resultsList.appendChild(listItem);
                    });
                }
                else {
                    zohoCRMContactId = deskContact.data.statusMessage.zohoCRMContact.id
                }
            }).catch(error => {

                // Render error in popup if there's an issue with fetching deskContact
                displayErrorAlert('Function Failure.. ' + error.message);
                disableUILink('crmInfoListItem', 'crmInfoDescriptor', 'not synced with zoho');
                disableUILink('crmEfinListItem', 'crmEfinDescriptor', 'not synced with zoho');
              });
        }
        
      }).catch(error => {

        // Render error in popup if there's an issue with fetching deskContact
        displayErrorAlert('Function Failure.. ' + error.message);
        disableUILink('crmInfoListItem', 'crmInfoDescriptor', 'not synced with zoho');
        disableUILink('crmEfinListItem', 'crmEfinDescriptor', 'not synced with zoho');
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
