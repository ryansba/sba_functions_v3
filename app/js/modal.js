class Modal {
    constructor(id, title, content, buttonText) {
      this.id = id;
      this.title = title;
      this.content = content;
      this.buttonText = buttonText;
      this.modalElement = document.getElementById(this.id);
      this.bsModal = new bootstrap.Modal(this.modalElement);
      this.buttonElement = this.modalElement.querySelector('.modal-footer button');
      this.titleElement = this.modalElement.querySelector('.modal-body h5');
      this.contentElement = this.modalElement.querySelector('.modal-body p');
      this.clickHandler = null; // Initialize the click handler
    }
  
    show() {
      // Get the modal elements
      const titleElement = this.modalElement.querySelector('.modal-body h5');
      const contentElement = this.modalElement.querySelector('.modal-body p');
  
      // Update the modal with the details for this instance
      titleElement.textContent = this.title;
      contentElement.textContent = this.content;
      this.buttonElement.textContent = this.buttonText;
  
      // Show the modal
      this.bsModal.show();
    }

    disableButton() {
        // Disable the button
        this.buttonElement.disabled = true;
      }
  
      enableButton() {
        // Enable the button
        this.buttonElement.disabled = false;
      }

    changeButtonText(newText) {
      // Change the button text
      this.buttonElement.textContent = newText;
    }
  
    hide() {
      // Hide the modal
      this.bsModal.hide();
    }

    setButtonClickListener(handler) {
      // Remove the previous handler if it exists
      if (this.clickHandler) {
        this.buttonElement.removeEventListener('click', this.clickHandler);
      }

      // Set the new handler
      this.clickHandler = handler;

      // Add the new handler
      if (this.clickHandler) {
        this.buttonElement.addEventListener('click', this.clickHandler);
      }
  }
  updateTitle(newTitle) {
    this.title = newTitle;
    this.titleElement.textContent = this.title;
}

updateContent(newContent) {
    this.content = newContent;
    this.contentElement.textContent = this.content;
}
  removeButtonClickListener() {
      // Remove the handler if it exists
      if (this.clickHandler) {
        this.buttonElement.removeEventListener('click', this.clickHandler);
        this.clickHandler = null; // Clear the handler
      }
  }
}
