function displayErrorAlert(errorMessage) {
    const alertContainer = document.getElementById('alert-container');
    
    // Create a new Bootstrap 5 alert element
    const alertElement = document.createElement('div');
    alertElement.className = 'alert alert-danger alert-dismissible fade show';
    alertElement.setAttribute('role', 'alert');
    alertElement.innerHTML = errorMessage;
    
    // Add a close button to the alert
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close';
    closeButton.setAttribute('data-bs-dismiss', 'alert');
    closeButton.setAttribute('aria-label', 'Close');
    
    alertElement.appendChild(closeButton);
    alertContainer.appendChild(alertElement);
  }

function renderHTML(where, what) {
  element = document.getElementById(where)

}

function copyToClipboard(text, element) {
  // Create a temporary element to hold the text to copy
  const copyElement = document.createElement("textarea");
  copyElement.value = text;

  // Append the element to the document
  document.body.appendChild(copyElement);

  // Select the text in the element
  copyElement.select();

  // Copy the text to the clipboard
  document.execCommand("copy");

  // Remove the temporary element from the document
  document.body.removeChild(copyElement);

  // Add a tooltip to the button to confirm the copy
  const tooltip = document.createElement("span");
  tooltip.innerHTML = "Copied!";
  tooltip.className = "tooltip";
  element.appendChild(tooltip);
  setTimeout(() => {
    tooltip.remove();
  }, 2000);
}

function clearBreadcrumbsPastHome() {
  const breadcrumbList = document.querySelector('.breadcrumb');
  const homeBreadcrumb = breadcrumbList.querySelector('li.breadcrumb-item:first-child');
  if (homeBreadcrumb) {
    let breadcrumb = homeBreadcrumb.nextElementSibling;
    while (breadcrumb) {
      const nextBreadcrumb = breadcrumb.nextElementSibling;
      breadcrumb.remove();
      breadcrumb = nextBreadcrumb;
    }
  }
}

function updateStatusBar(number, subject, contactName) {
  document.getElementById('ticketNumber').innerHTML = `<strong>#${number}</strong> - ${subject}`
  document.getElementById('ticketContact').innerText = contactName
}

function addAndSetActiveBreadcrumb(text, addMastersBreadcrumb) {
  const breadcrumbList = document.querySelector('.breadcrumb');

  // Check if the home breadcrumb exists
  const homeBreadcrumb = breadcrumbList.querySelector('li.breadcrumb-item:first-child');
  if (!homeBreadcrumb) {
      // Create the home breadcrumb if it doesn't exist
      const defBreadcrumb = document.createElement('li');
      defBreadcrumb.classList.add('breadcrumb-item');
      defBreadcrumb.innerHTML = `<a href="#" onclick="setupInitalOptions()">Home</a>`;
      breadcrumbList.appendChild(defBreadcrumb);
  }

  // Clear breadcrumbs after the home breadcrumb
  while (breadcrumbList.childNodes.length > 1) {
      breadcrumbList.removeChild(breadcrumbList.lastChild);
  }

  // Create the Masters breadcrumb with a link if specified
  if (addMastersBreadcrumb) {
      const mastersBreadcrumb = document.createElement('li');
      mastersBreadcrumb.classList.add('breadcrumb-item');
      mastersBreadcrumb.innerHTML = `<a href="#" onclick="getMasterEfins()">Masters</a>`;
      breadcrumbList.appendChild(mastersBreadcrumb);
  }

  if (localStorage.efin) {
      const efinBreadcrumb = document.createElement('li');
      efinBreadcrumb.classList.add('breadcrumb-item', 'active');
      efinBreadcrumb.setAttribute('aria-current', 'page');
      efinBreadcrumb.textContent = localStorage.efin;
      breadcrumbList.appendChild(efinBreadcrumb);
  }

  // Create the new breadcrumb
  const newBreadcrumb = document.createElement('li');
  newBreadcrumb.classList.add('breadcrumb-item', 'active');
  newBreadcrumb.setAttribute('aria-current', 'page');
  newBreadcrumb.textContent = text;
  breadcrumbList.appendChild(newBreadcrumb);
}

function resetUI() {

  document.getElementById('breadcrumb-nav-list').innerHTML = ''

  let html = `
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
  crmInfoLink.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent the default navigation behavior
      console.log("CRM Info Link clicked!");
      getCRMContact();
  });

  // EFIN Info Listener
  efinInfoLink.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent the default navigation behavior
      console.log("EFIN Info Link clicked!");
      getMasterEfins();
  });

  // HelpDesk Info Listener
  helpDeskLink.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent the default navigation behavior
      console.log("helpDeskLink clicked!");
  });

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

function disableUILink(elementId, descriptorId, messageText) {
  const element = document.getElementById(elementId);

  if (element.tagName === 'A') {
      element.removeAttribute('href');
  }

  element.setAttribute('disabled', true);
  element.classList.add('disabled');
  document.getElementById(descriptorId).innerText = messageText

}