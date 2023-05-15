let zohoDeskInstance; // Declare a global variable to store the ZohoDesk instance
let zohoCRMContactId;
let deskContactGlobal;
let helpDeskUserSearchResults;

function registerEventListeners() {
    // On Ticket Shift (moving from one ticket to another in the left hand sidebar)
    zohoDeskInstance.on("ticket_Shift", function (data) {

        setupInitalOptions();

    });

    // Add other event listeners here
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
            displayAlert('Function Failure..', error.message);
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
            displayAlert('Function Failure..', error.message);
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

            displayAlert('Function Failure. .' + error.message);

        });
}

function searchForHelpCenterUser(searchBy, searchValue) {
    // let endpoint = `https://desk.zoho.com/api/v1/users?searchBy=(First_Name:starts_with:Craig)&limit=50&sortBy=email`
    let endpoint = `https://desk.zoho.com/api/v1/users?searchBy=(${searchBy}:equals:${searchValue})`
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

function fetchDeskData(module, id) {
    let endpoint = `https://desk.zoho.com/api/v1/${module}/${id}`;
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

function getHelpCenterUsersJoinedGroups(userId){
    let endpoint = `https://desk.zoho.com/api/v1/users/${userId}/groups`
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

function getHelpCenterUser(userId){
    let endpoint = `https://desk.zoho.com/api/v1/users/${userId}`
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
    return fetchDeskData('contacts', deskContactId)
        .then(response => {
            return response
        })
        .catch(error => {
            console.error('Error fetching desk contact:', error);
        });
}

function getDeskContactIdFromTicket() {
    return ZOHODESK.get('ticket.contactId').then(response => {
        return response['ticket.contactId'];
    });
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

function getCRMContact() {
    return getCRMInfo('Contacts', zohoCRMContactId)
        .then(crmContact => {

            let contactResult = crmContact.data.statusMessage.data['0']

            console.log(contactResult)

            let contactData = [
                { label: "Account ID", value: contactResult.Account_Name.id },
                { label: "Account Name", value: contactResult.Account_Name.name },
                { label: "Became Client", value: contactResult.Became_Client },
                { label: "Phone Number", value: contactResult.Phone },
                { label: "SBA Buildout", value: contactResult.SBA_Buildout },
                { label: "Workflow Run URL", value: contactResult.WorkFlow_Run_URL },
                { label: "Sales Person", value: contactResult.Sales_Person },
                { label: "Account Status", value: contactResult.Status },
                { label: "Account Type", value: contactResult.Type }
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
            clearBreadcrumbsPastHome();
            addAndSetActiveBreadcrumb('CRM Info');
            document.getElementById('content-container').innerHTML = html;
        })
        .catch(error => {

            console.error('Error desk CRM contact:', error);
            displayAlert('Function Failure.. ' + error.message);

        });
}

function getMasterEfins() {
    return getCRMInfo('Contacts', zohoCRMContactId)
        .then(crmContact => {

            let accountId = crmContact.data.statusMessage.data['0'].Account_Name.id;

            searchForCRMEfin(accountId, 'Master').then(masters => {
                console.log(masters)

                // Get count of Master EFINS 
                // console.log('# Masters', masters.data.statusMessage.data.length);
                // numberOfMasters = masters.data.statusMessage.data.length

                // If there are no master EFINS found display an error
                if (masters.data.statusMessage == "") {
                    disableUILink('crmEfinListItem', 'crmEfinDescriptor', 'No master found...')
                }

                // If only one Master just grab all the info and display it 
                else if (masters.data.statusMessage.data.length == 1) {
                    let master = masters.data.statusMessage.data[0]
                    renderEfinHTML(master.Name, master.Account_Name.id, master.Account_Name.name, master.Company_Name, master.EFIN_Type, master.Type, master.Email,master.Master_EFIN_lu.name, master.SVB_Software, master.SVB_User_ID, master.SVB_Login_URL, master.Software_Login_URL, master.Software_User_ID, master.Tax_Year)
                }

                // If > 1 master display the table 
                else {
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
                        console.log('master###', master)

                        html += `
                        <tr>
                        <td><button onclick="renderEfinHTML('${master.Name}', ${master.Account_Name.id}, '${master.Account_Name.name}', '${master.Company_Name}', '${master.EFIN_Type}', '${master.Type}', '${master.Email}', '${master.Master_EFIN_lu.name}', '${master.SVB_Software}', '${master.SVB_User_ID}', '${master.SVB_Login_URL}', '${master.Software_Login_URL}', '${master.Software_User_ID}', '${master.Tax_Year}')" title="Get info" style="border: none; background: none; padding: 0; cursor: pointer;">${master.Name}</button></td>

                            <td>${master.SVB_Software}</td>
                            <td>${master.Master_EFIN_lu.name}</td>
                            <td>${master.Type}</td>
                        </tr>
                        `;
                    });

                    html += `</tbody></table></div>`;
                    clearBreadcrumbsPastHome();
                    addAndSetActiveBreadcrumb('Masters');
                    document.getElementById('content-container').innerHTML = html;

                }
            });

        }).catch(error => {
            console.error('Error desk CRM contact:', error);
            displayAlert('Function Failure.. ' + error.message);
        });
}

function getCRMRelatedList(module, recordId, relation, fields) {


    let endpoint = `https://www.zohoapis.com/crm/v3/${module}/${recordId}/${relation}`;
    console.log('EP', endpoint)
    let connection = 'sba_functions_v3';
    let action = 'GET';
    var parameters = {
        url: endpoint,
        headers: { 'Content-Type': 'application/json' },
        type: action,
        postBody: {},
        data: {'fields' : 'Last_Name,First_Name'},
        connectionLinkName: connection,
        responseType: "json",
    };
    return ZOHODESK.request(parameters)

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
// HALF
// DYNAMIC
function searchZohoCRM(module, criteria) {

    // ((Last_Name:equals:${lastName})and(First_Name:starts_with:${firstLetter}))


    let endpoint = `https://www.zohoapis.com/crm/v3/${module}/search?criteria=${criteria}`;
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
// HALF 
// DYNAMIC



async function getZohoCRM(module, fields, cvid, page = 1) {
    let zohoApi = 'https://www.zohoapis.com/crm/v2/';
    let endpoint = `${zohoApi}${module}?cvid=${cvid}&page=${page}`;
  
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
  
    let response = await ZOHODESK.request(parameters);
    
    let records = response.data.statusMessage.data;
  
    // If there are more records, make a recursive call to fetch the next page
    if (response.data.statusMessage.info.more_records) {
      let nextPage = page + 1;
      let moreRecords = await getZohoCRM(module, fields, cvid, nextPage);
      // Append the newly fetched records to the ones we have so far
      records = records.concat(moreRecords);
    }
  
    return records;
  }


function renderEfinHTML(name, accountId, accountName, company, efinType, type, email, master, software, svbUser, svbLogin, softwareLogin, softwareUser, taxYear) {
    let efinData = [
      { label: "EFIN", value: name },
      { label: "Account ID", value: accountId },
      { label: "Account Name", value: accountName },
      { label: "Company", value: company },
      { label: "EFIN Type", value: efinType },
      { label: "Type", value: type },
      { label: "Email", value: email },
      { label: "Master", value: master },
      { label: "SW", value: software },
      { label: "SVB User", value: svbUser },
      { label: "SVB Login", value: svbLogin },
      { label: "SW Login", value: softwareLogin },
      { label: "SW User", value: softwareUser },
      { label: "Tax Year", value: taxYear }
    ];

    let html = `<div class="table-responsive table-detail overflow-hidden">
    <table class="table">
        <tbody>
        `;

        efinData.forEach(data => {
            html += `
              <tr>
                <td class="table-label">${data.label}</td>
                <td class="table-value">${typeof data.value === 'string' && data.value.startsWith('https') ? 
                  `<span>
                    <a href="${data.value}" target="_blank" title="Open URL"><i class="fa fa-external-link"></i></a>
                    <button onclick="copyToClipboard('${data.value}', this)" title="Copy URL to clipboard"><i class="fa fa-copy"></i></button>
                    <span class="tooltiptext">Link copied to clipboard</span>
                  </span>` : data.value}
                </td>
              </tr>
            `;
          });

        html += `</tbody></table></div>`
        addAndSetActiveBreadcrumb(`${name}`, true)
        document.getElementById('content-container').innerHTML = html;
}

function checkHelpDeskUserStatus(){
            //
            // To do here - incorporate search feature into UI 
            results = helpDeskUserSearchResults.data.statusMessage.data
            let firstFoundEmail = results[0].emailAddress
            let deskEmail = deskContactGlobal.data.statusMessage.email

            if (firstFoundEmail == deskEmail) {
                let centerUserId = results[0].id
                
                // Take the first result and get the help center user data 
                getHelpCenterUser(centerUserId).then(userResult => {

                // Get the groups that the member is a user of 
                getHelpCenterUsersJoinedGroups(userResult.data.statusMessage.id).then(usersGroups => {

                    joinedGroups = usersGroups.data.statusMessage.data

                    // If the help center user is not a member of any groups 
                    if(Array.isArray(joinedGroups) && joinedGroups.length === 0){

                        //
                        // Todo here - add invite option to UI
                        //
                        displayAlert('Help center user is not a member of any groups...')
                    }

                    else{

                        console.log('joinedGroups', joinedGroups)

                    }
                })
                })
            }

            else {
                displayAlert('Contact is a helpcenter user but unable to find user with matching email')
            }
}



function displaySearchResults(results, modal) {
    let resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = ''; // Clear previous results
    let selectedElement = null; // Track the currently selected element
    modal.removeButtonClickListener();
    modal.updateContent('Select an account to continue..')
    for (let [index, result] of results.entries()) {
      let resultElement = document.createElement('p');
      resultElement.classList.add('accountP');
      resultElement.textContent = result.Account_Name; // Replace 'name' with the actual property you want to display
      resultElement.dataset.id = result.id; // Store the id in a data attribute
      resultElement.dataset.position = index; // Store the position in a data attribute
  
      // Attach an event listener
      resultElement.addEventListener('click', function(event) {
        event.stopImmediatePropagation(); // Stop the event from propagating to other listeners
  
        console.log(this.dataset.id); // Logs the id when the element is clicked
        console.log(this.dataset.position); // Logs the position when the element is clicked
  
        if (selectedElement !== null) {
          selectedElement.classList.remove('selected'); // Remove the "selected" class from the previously selected element
        }
  
        if (selectedElement === this) {
          selectedElement = null; // Clear the selected element if it's clicked again
        } else {
          this.classList.add('selected'); // Add the "selected" class to the clicked element
          selectedElement = this; // Update the selected element
        }
      });
  
      resultsContainer.appendChild(resultElement);
    }
    modal.enableButton();

    modal.changeButtonText('Link to this Account')

    modal.setButtonClickListener(function() {
        let account = results[document.querySelector('.accountP.selected').dataset.position]
        console.log(account)
        step2FixAssVerifyAccount(modal, account)
    });
  }

function showModal(id, title, content, buttonText) {
    const modal = new Modal(id, title, content, buttonText);
    modal.show();
    return modal; // return the modal object for further manipulation
}

function step1FixAssociation(modal){


    var spinner = document.querySelector('.spinner-border');
    spinner.style.display = 'inline-block';

    modal.updateContent('Pulling list of all active customers from CRM...')
    modal.disableButton();

    let sbaAccountsCvid = '5199860000000723003';
    let crmAccounts = [];

    getZohoCRM('Accounts', '', sbaAccountsCvid).then(records => {
        crmAccounts = records;
        console.log(crmAccounts)
        spinner.style.display = 'none';
  
        document.getElementById('searchInput').style.display = 'block';

        displaySearchResults(crmAccounts, modal);



        document.getElementById('searchInput').addEventListener('input', function() {
            let searchTerm = this.value.toLowerCase();
            let results = crmAccounts.filter(account => {
                return account.Account_Name.toLowerCase().includes(searchTerm);
            });
                displaySearchResults(results, modal);
            }); 
            
            
    
    });
}


function step2FixAssVerifyAccount(modal, account){
    console.log('fix ver ass step 2', modal, account)
    console.log('type', typeof account)
    modal.updateTitle('Verify Account')
    modal.updateContent('If this is the correct account, click link account again below...')

    let html = `<div class="table-responsive table-detail overflow-hidden">
    <table class="table">
        <tbody>
        `;

    let fieldsToShow = ['Account_Name', 'Became_Client', 'Billing_City', 'Billing_State', 'Onboarding_Portal', 'SBA_Buildout', 'Phone', 'Type', 'Status', 'Unique_Identifier'];

    for (let field in account){
        if (fieldsToShow.includes(field)){
            let value = account[field];
            html += `
              <tr>
                <td class="table-label">${field}</td>
                <td class="table-value">${typeof value === 'string' && value.startsWith('https') ? 
                  `<span>
                    <a href="${value}" target="_blank" title="Open URL"><i class="fa fa-external-link"></i></a>
                    <button onclick="copyToClipboard('${value}', this)" title="Copy URL to clipboard"><i class="fa fa-copy"></i></button>
                    <span class="tooltiptext">Link copied to clipboard</span>
                  </span>` : value}
                </td>
              </tr>
            `;
        }
    }

    html += `</tbody></table></div>`

    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('searchInput').style.display = 'none';
    document.getElementById('accountPlaceholder').innerHTML = html

    modal.removeButtonClickListener();
    modal.setButtonClickListener(function() {

        step3FixAssLinkTheAccount(modal, account['id']);
      });
    // // addAndSetActiveBreadcrumb(`${name}`, true)
    // document.getElementById('content-container').innerHTML = html;
}



function step3FixAssLinkTheAccount(modal, crmAccountId) {


    let customFields = {
        "cf" : {"cf_zoho_account_id" : crmAccountId }
    };

      updateDeskData('contacts', deskContactGlobal.data.statusMessage.id, customFields)

      getCRMRelatedList('Accounts', crmAccountId, 'Contacts').then(response => {
        console.log(response)

        if (response.data.statusMessage == "") {
            
        }
        else {step4FixAssLinkContact(modal, response.data.statusMessage.data)}
    })  
    
};

function step4FixAssLinkContact(modal, contacts) {

    modal.updateTitle('Verify Contact')
    modal.updateContent('If this is the correct contact, click link account again below...')

    let html = `<div class="table-responsive table-detail overflow-hidden">
    <table class="table">
        <tbody>
        `;

    console.log(contacts)

    for (let contact in contacts){
        for (let field in contacts[contact]){
            let value = contacts[contact][field];
            
            html += `
            <tr>
              <tr>
                <td class="table-label">${field}</td>
                <td class="table-value">${typeof value === 'string' && value.startsWith('https') ? 
                  `<span>
                    <a href="${value}" target="_blank" title="Open URL"><i class="fa fa-external-link"></i></a>
                    <button onclick="copyToClipboard('${value}', this)" title="Copy URL to clipboard"><i class="fa fa-copy"></i></button>
                    <span class="tooltiptext">Link copied to clipboard</span>
                  </span>` : value}
                </td>
              </tr></tr>
            `;
    }
}

    html += `</tbody></table></div>`
    document.getElementById('accountPlaceholder').innerHTML = html
    modal.removeButtonClickListener();
    modal.setButtonClickListener(function() {
        let customFields = {
            "cf" : {"cf_zoho_contact_id" : contacts[0].id }
        };
        console.log('cf', customFields)
        updateDeskData('contacts', deskContactGlobal.data.statusMessage.id, customFields)
            document.getElementById('accountPlaceholder').innerHTML = ''
            modal.updateTitle('Success');
            modal.updateContent('');
            modal.changeButtonText('');
            modal.disableButton();
            resetUI();
      });

    

};


function updateDeskData(module, recordId, params){

    let sampleRequestObj = {
        url :`https://desk.zoho.com/api/v1/${module}/${recordId}`,
        type :"PATCH",
        postBody : params,
        headers : {
            "Content-Type" :"application/json" 
        },
        connectionLinkName :"sba_functions_v3",
        responeType :"json"
    }
    
    ZOHODESK.request(sampleRequestObj).then(res=>{
        console.log(res)
        // Implement your logic here
        }, (error)=>{
            console.log(error)
        // Implement your logic here		
    })

}


function promptToFixDeskCrmAccountAssociation() {
    let modal = showModal('modalChoice', 'CRM Account Not Linked', 'Click start search to find account.', 'Start Search');

    // Remove the existing event listener, if any
    modal.removeButtonClickListener();

    // Add the event listener
    modal.setButtonClickListener(function() {
      step1FixAssociation(modal);
    });
}
  

function setupInitalOptions() {

    resetUI();
    getCurrentTicketData();


    // Get the zoho desk contact's ID from the ticket 
    getDeskContactIdFromTicket().then(deskContactId => {

        // Look up that contact in zoho desk
        getDeskContact(deskContactId).then(deskContact => {

            deskContactGlobal = deskContact

            console.log(deskContactGlobal)

            // Make sure conneciton is authorized
            if (deskContact.data.error_code == "1000") {
                console.log('Authorize Connection:', deskContact.data.resumeUrl)
                displayAlert('Authorize Connection.. ' + deskContact.data.resumeUrl);
            }

            // Get the contact's zohoCRMContactId 
            if (deskContact.data.statusMessage.zohoCRMContact) {

                // Set the Global variable for zohoCRMContactId
                zohoCRMContactId = deskContact.data.statusMessage.zohoCRMContact.id;
                console.log('crm', zohoCRMContactId)
            }

            // If contact isnt synced try to get zoho contact id from custom field in desk
            else if (deskContact.data.statusMessage.cf.cf_zoho_contact_id) {
                displayAlert(
                    'INFO: Contact was manually synced via app. ', 
                    'info', 
                    'Change Association', 
                    '#', 
                    function() { 
                        promptToFixDeskCrmAccountAssociation(); 
                    }
                );
                // Set the Global variable for zohoCRMContactId
                zohoCRMContactId = deskContact.data.statusMessage.cf.cf_zoho_contact_id;

                console.log('desk', zohoCRMContactId)
            }

            //
            // To do here - incorporate search feature into UI 
            //
            // If zoho contact id field is null error out and display message 

            else {
                

                promptToFixDeskCrmAccountAssociation()
                
                // Set the Global variable for zohoCRMContactId
                zohoCRMContactId = deskContact.data.statusMessage.zohoCRMContact.id

            }

            enableUILink('crmInfoListItem', 'crmInfoDescriptor', 'Ready to fetch..');
            enableUILink('crmEfinListItem', 'crmEfinDescriptor', 'Ready to fetch..');

            // Check if the contact is an end user of the help center 
            if (deskContact.data.statusMessage.isEndUser != true){

                // To do here - incorporate quick auto search feature into UI to make sure there isnt really an account
                // Add Invitation options to UI
                // 
                // 
                displayAlert('This contact is not a helpdesk end user and will not have access to the support portal.');
                document.getElementById('helpDeskDescriptor').innerHTML = `Requires invitation...`
            } else {

                // Search the for a help center user by the desk contacts email 
                searchForHelpCenterUser('Email', deskContact.data.statusMessage.email).then(userSearchResults => {

                    // Set the Global Variable up for later use
                    helpDeskUserSearchResults = userSearchResults
                    enableUILink('helpDeskListItem', 'helpDeskDescriptor', 'Ready to fetch..')

                })

            }

        }).catch(error => {

            // Render error in popup if there's an issue with fetching deskContact
            displayAlert('Function Failure.. ' + error.message);
            document.getElementById('crmInfoDescriptor').innerHTML = `Not synced...`
            document.getElementById('crmEfinDescriptor').innerHTML = `Not synced...`

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
