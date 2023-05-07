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