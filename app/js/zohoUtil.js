console.log('WTF')
let zohoDeskInstance; // Declare a global variable to store the ZohoDesk instance

// Function to register event listeners
function registerEventListeners() {
    // On Ticket Shift (moving from one ticket to another in the left hand sidebar)
    zohoDeskInstance.on("ticket_Shift", function(data){
      document.getElementById("t_shift_cell").innerText = data['ticket_shifted']
      getCurrentTicketData()
    });
  
    // Add other event listeners here
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
        });
}

// get list of departments and agents (prep to pass tickets from dept to dept)
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
        .catch(function (err) {
            // Error Handling
            console.error('Error fetching department list:', err);
        });
}

// pull info from current ticket object
function getCurrentTicketData(){
    // define the properties to pull
    const properties = ['number','departmentId', 'id', 'accountName', 'contactName', 'contactId'];

    // Create an array of promises for each property
    const promises = properties.map(property => ZOHODESK.get(`ticket.${property}`));

        // Wait for all promises to resolve
        Promise.all(promises)
        .then(responses => {
            // The `responses` array contains the values of the requested properties in the same order as the `properties` array
            const [number, departmentId, id, accountName, contactName, contactId] = responses;
            console.log('Ticket #:', number);
            console.log('Dept ID:', departmentId);
            console.log('Ticket ID:', id);
            console.log('accountName', accountName);
            console.log('contactName', contactName);
            console.log('contactId', contactId);
            // Add your logic here for handling the retrieved data
        })
        .catch(error => {
            // Error Handling
            console.error('Error fetching ticket properties:', error);
        });
}    

// pull info from current ticket object -> CANT GET CONTACT FROM TICKET DETAIL PAGE
function getTicketContactData(){
    // define the properties to pull
    const properties = ['number','firstName', 'id', 'accountName', 'createdTime', 'contact.cf'];

    // Create an array of promises for each property
    const promises = properties.map(property => ZOHODESK.get(`contact.${property}`));

        // Wait for all promises to resolve
        Promise.all(promises)
        .then(responses => {
            // The `responses` array contains the values of the requested properties in the same order as the `properties` array
            const [firstName] = responses;
            // console.log('isEndUser:', isEndUser);
            console.log('firstName:', firstName);
            // console.log('Contact ID:', id);
            // console.log('accountName', accountName);
            // console.log('createdTime', createdTime);
            // console.log('contact.cf', contactCF);
            // Add your logic here for handling the retrieved data
        })
        .catch(error => {
            // Error Handling
            console.error('Error fetching user properties:', error);
        });
}    

function apiTest(){
    let sampleRequestObj = {
        url :"https://test.requestcatcher.com",
        type :"GET",
        data : {
            "param1" :"Param 1 Value",
            "param2" :"Param 2 Value"
        },
        postBody : {
            "payloadData1" :"Payload value 1",
            "payloadData2" :"Payload value 2"
        },
        headers : {
            "Content-Type" :"application/json" 
        },
        connectionLinkName :"sba_functions_v3",
        responeType :"arraybuffer",
        fileObj : [{
            key :"",
            file :""
        }]
    }
    
    ZOHODESK.request(sampleRequestObj).then(res=>{
        // Implement your logic here
        }, (error)=>{
        // Implement your logic here		
    })
}

// // pull info from current ticket object
// function getTicketAccountData(){
//     // define the properties to pull
//     const properties = ['number','firstName', 'id', 'accountName', 'createdTime', 'account.cf'];

//     // Create an array of promises for each property
//     const promises = properties.map(property => ZOHODESK.get(`account.${property}`));

//         // Wait for all promises to resolve
//         Promise.all(promises)
//         .then(responses => {
//             // The `responses` array contains the values of the requested properties in the same order as the `properties` array
//             const [isEndUser, firstName, id, accountName, createdTime, accountCF] = responses;
//             console.log('isEndUser:', isEndUser);
//             console.log('firstName:', firstName);
//             console.log('Contact ID:', id);
//             console.log('accountName', accountName);
//             console.log('createdTime', createdTime);
//             console.log('account.cf', accountCF);
//             // Add your logic here for handling the retrieved data
//         })
//         .catch(error => {
//             // Error Handling
//             console.error('Error fetching user properties:', error);
//         });
// }    




window.onload = function () {
ZOHODESK.extension.onload().then(function (App) {
    zohoDeskInstance = App.instance; // Assign the instance to the global variable

    registerEventListeners(); // Call the function to register event listeners
    getLoggedInUserData();
    getTicketContactData();
    // Other code
});
};





	
// window.onload = function () {
//  ZOHODESK.extension.onload().then(function (App) {
    
//     // Event Listeners for Zoho Desk

//     // On Ticket Shift (moving from one ticket to another in the left hand sidebar)
//     App.instance.on("ticket_Shift", function(data){
//         document.getElementById("1").innerText = data['ticket_shifted']
//     });


//     //Get ticket related data
//     ZOHODESK.get('ticket.email').then(function (res) {
//             //response Handling
//         }).catch(function (err) {
//             //error Handling
//         });

//     ZOHODESK.get('user.fullName').then(function(response) {
//         document.getElementById("1").innerText = response['user.fullName']
//         }).catch(function(err){
//         //Error Handling
//         })


//     /*	
//                 //To Set data in Desk UI Client
//                 ZOHODESK.set('ticket.comment', { 'content': "Test comment" }).then(function (res) {
//                     //response Handling
//                 }).catch(function (err) {
//                     //error Handling
//                 });
    
//                 //Access Data Storage for an extension
//                 //Get the saved data of an extension from data storage
//                 ZOHODESK.get('database', { 'key': 'key1', 'queriableValue': 'value1' }).then(function (response) {
//                     //response Handling
//                 }).catch(function (err) {
//                     //error Handling
//                 })            
                
//                 //Save data in to data staorage
//                 ZOHODESK.set('database', { 'key': 'key_1', 'value': { 'id': 123 }, 'queriableValue': 'value1' }).then(function (response) {
//                     //response Handling
//                 }).catch(function (err) {
//                     //error Handling
//                 })
    
//                 //Change tabs in ticket detailview
//                 ZOHODESK.invoke('ROUTE_TO', 'ticket.attachments');
    
//                 //To Insert the content in the current opened reply editor from extension
//                 ZOHODESK.invoke('Insert', 'ticket.replyEditor', { content: "<p>your content</p>" });
    
//                 //To listen to an event in desk
//                 App.instance.on('comment_Added', function(data){
//                     //data handling 
//                 });
    
//                 //To access locale
//                 App.locale;
    
//                 //To access localresources
//                 App.localeResource            
                    
//                 //To Know more on these, please read the documentation
//             */
// });
// };
