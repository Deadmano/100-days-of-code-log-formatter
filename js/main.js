/* Copyright (C) 2019 Phillip Stolić

This file is part of 100 Days Of Code Log Formatter.

100 Days Of Code Log Formatter is free software: you can redistribute
it and/or modify it under the terms of the GNU General Public License
as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

100 Days Of Code Log Formatter is distributed in the hope that it will
be useful, but WITHOUT ANY WARRANTY; without even the implied warranty
of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with 100 Days Of Code Log Formatter.  If not,
see <https://www.gnu.org/licenses/>. */

function getIdValue(elementId) {
  return document.getElementById(elementId).value;
}

function getClassValues(elementClass) {
  return Array.from(document.getElementsByClassName(elementClass));
}

class User {
  constructor() {
    this.day = getIdValue('input-day');
    this.date = getIdValue('input-date');
    this.progress = getIdValue('input-progress');
    this.hours = getIdValue('input-hours');
    this.minutes = getIdValue('input-minutes');
    this.thoughts = getIdValue('input-thoughts');
    this.title = getClassValues('input-link-title');
    this.url = getClassValues('input-link-url');
    this.links = this.buildLinkArray().filter(x => x.title !== '' && x.url !== '');
  }

  buildLinkArray() {
    const linkArray = [];
    for (let i = 0; i < this.title.length; i += 1) {
      linkArray.push({ title: this.title[i].value, url: this.url[i].value });
    }
    return linkArray;
  }

  buildDateString() {
    const date = new Date(this.date);
    return `### Day ${this.day}: ${date.toLocaleString('en-us', {
      month: 'long',
    })} ${date.getDate()}, ${date.toLocaleDateString('en-us', { weekday: 'long' })}.`;
  }

  buildTimeString() {
    let hourString = this.hours <= 0 ? '' : ` ${this.hours} hour`;
    hourString = this.hours > 1 ? ` ${this.hours} hours` : hourString;
    let minuteString = this.minutes <= 0 ? '' : ` ${this.minutes} minute`;
    minuteString = this.minutes > 1 ? ` ${this.minutes} minutes` : minuteString;
    return `**Time Spent**:${hourString}${minuteString}.`;
  }

  buildProgressString() {
    const progressString = "**Today's Progress**:";
    // Adds a fullstop to the end of the input if it was lacking one.
    return !(
      this.progress.endsWith('.')
      || this.progress.endsWith('!')
      || this.progress.endsWith('?')
    )
      ? `${progressString} ${this.progress}.`
      : `${progressString} ${this.progress}`;
  }

  buildThoughtsString() {
    const thoughtsString = '**Thoughts**:';
    // Adds a fullstop to the end of the input if it was lacking one.
    return !(
      this.thoughts.endsWith('.')
      || this.thoughts.endsWith('!')
      || this.thoughts.endsWith('?')
    )
      ? `${thoughtsString} ${this.thoughts}.`
      : `${thoughtsString} ${this.thoughts}`;
  }

  buildLinkString() {
    let linkString = this.links.length === 1 ? '**Link To Work**:' : '**Links To Work**:\n';
    linkString += this.links
      .map((x, i, arr) => `${arr.length === 1 ? '' : `${i + 1}.`} [${x.title}](${x.url})`)
      .join('\n');
    return linkString;
  }

  buildOutputString() {
    let outputString = `${this.buildDateString()}\n\n${this.buildProgressString()}\n\n`;
    if ((this.hours || this.minutes) !== '') {
      outputString += `${this.buildTimeString()}\n\n${this.buildThoughtsString()}\n\n`;
    } else {
      outputString += `${this.buildThoughtsString()}\n\n`;
    }
    if (this.links.length > 0) {
      outputString += `${this.buildLinkString()}`;
    }

    return outputString;
  }

  get outputLog() {
    return this.buildOutputString();
  }
}

function showError(element, errorString) {
  const errorElement = element.parentNode.querySelector('span');
  if (errorElement.classList.contains('error')) {
    return;
  }
  errorElement.innerHTML = errorString;
  errorElement.classList.toggle('error-hidden');
  errorElement.classList.toggle('error');
  setTimeout(() => {
    errorElement.classList.toggle('error');
    errorElement.classList.toggle('error-hidden');
  }, 3000);
}

function showErrorStatic(inputElement, errorString) {
  const errorElement = inputElement.parentNode.querySelector('span');
  if (!inputElement.classList.contains('error-box')) {
    errorElement.innerHTML = errorString;
    inputElement.classList.toggle('error-box');
    errorElement.classList.toggle('error-static');
    errorElement.classList.toggle('error-hidden');
    errorElement.classList.toggle('error');
  }
}

function checkNumberInput(event) {
  const inputElement = event.target;
  const elementClasses = ['input-day', 'input-hours', 'input-minutes'];
  const elementMinMax = [[1, 100], [1, 24], [1, 59]];

  function RemoveNonNumbers() {
    if (
      event.type === 'keypress'
      && event.key.length === 1
      && !Number(event.key)
      && Number(event.key !== '0')
    ) {
      showError(inputElement, 'Please only use numerical values.');
    }
    inputElement.value = inputElement.value.replace(/\D/g, '');
  }

  function checkMinValue(elementClass) {
    if (inputElement.value < 1 && inputElement.value !== '') {
      if (elementClass === 'input-day') {
        showError(inputElement, 'Please enter a number greater than 0.');
      } else {
        showError(inputElement, 'Please enter a number greater than 0 or leave this blank.');
      }
      inputElement.value = inputElement.value.replace(/^-\d+|^0+|\D/gi, '');
    }
  }

  function checkMaxValue(elementClass, elementMaxValue) {
    if (inputElement.value > elementMaxValue) {
      if (elementClass === 'input-day') {
        showError(inputElement, 'Please enter a number less than or equal to 100.');
      } else if (elementClass === 'input-hours') {
        showError(inputElement, 'Please enter a number less than or equal to 24.');
      } else if (elementClass === 'input-minutes') {
        showError(inputElement, 'Please enter a number less than 60 or use hours above.');
      }
      inputElement.value = '';
    }
  }

  elementClasses.forEach((elementClass, index) => {
    if (inputElement.classList.contains(elementClass)) {
      RemoveNonNumbers(elementClass);
      checkMinValue(elementClass);
      checkMaxValue(elementClass, elementMinMax[index][1]);
    }
  });
}

function checkUrlTitleInput(event) {
  const urlPattern = /^www\.|^http.:*\//gi;
  if (urlPattern.test(event.target.value) && event.target.classList.contains('input-link-title')) {
    showError(event.target, 'Are you entering a URL instead of the title?');
  }
}

function monitorForm(event) {
  const inputElement = event.target;
  const errorElement = inputElement.parentNode.querySelector('span');

  // Remove static errors if a user interacts with an input element.
  if (errorElement.classList.contains('error-static')) {
    errorElement.classList.toggle('error-static');
    inputElement.classList.toggle('error-box');
    errorElement.classList.toggle('error');
    errorElement.classList.toggle('error-hidden');
  }

  // Wipe the output log if a user edits a field.
  const outputContainer = document.getElementById('output');
  if (outputContainer.innerHTML) {
    outputContainer.innerHTML = '';
  }

  checkNumberInput(event);
  checkUrlTitleInput(event);
}

function validateForm() {
  const day = document.querySelector('input.input-day');
  const date = document.querySelector('input.input-date');
  const progress = document.querySelector('input.input-progress');
  const thoughts = document.querySelector('textarea.input-thoughts');
  const url = Array.from(document.querySelectorAll('input.input-link-url'));

  let numErrors = 0;
  [day, date, progress, thoughts].forEach((inputField, index) => {
    const errorMessage = [
      'Please enter the challenge day being logged.',
      'Please enter a date in yyyy/mm/dd format.',
      'Please enter your progress for this day.',
      'Please enter your thoughts for this day.',
    ];
    if (inputField.value === '') {
      showErrorStatic(inputField, errorMessage[index]);
      numErrors += 1;
    }
  });

  url.forEach((urlInput) => {
    if (!/^www\.|^http.:*\//gi.test(urlInput.value) && urlInput.value !== '') {
      showErrorStatic(urlInput, 'The URL needs to be in www. or http:// format.');
      numErrors += 1;
    }
  });

  return numErrors;
}

function showErrorModal(errorTitleString, errorContentString) {
  const errorModal = document.getElementById('modal');
  const errorModalOverlay = document.getElementById('modal-overlay');
  const errorModalHeader = document.getElementById('modal-header');
  const errorModalContent = document.getElementById('modal-content');
  errorModalHeader.classList.add('modal-error');
  errorModalHeader.innerHTML = errorTitleString;
  errorModalContent.innerHTML = errorContentString;
  errorModalOverlay.classList.add('modal-visible');
  errorModal.classList.add('modal-visible');
}

function showNotificationMessage(notificationElement, notificationMessage, isError = false) {
  const element = notificationElement;
  if (!notificationElement.classList.contains('notification-hidden')) {
    return;
  }
  // Prevent toggling classes if we already have a set toggled class.
  if (
    notificationElement.classList.contains('notification-failure')
    || notificationElement.classList.contains('notification-success')
  ) {
    return;
  }
  element.innerHTML = notificationMessage;
  if (isError) {
    element.classList.toggle('notification-failure');
  } else {
    element.classList.toggle('notification-success');
  }
  element.classList.toggle('notification-hidden');
  setTimeout(() => {
    element.classList.toggle('notification-hidden');
    // Second time-out to keep the colour during the fade.
    setTimeout(() => {
      if (isError) {
        element.classList.toggle('notification-failure');
      } else {
        element.classList.toggle('notification-success');
      }
    }, 2000);
  }, 2000);
}

function formatInput() {
  const currentUser = new User();
  const formErrors = validateForm();
  const outputContainer = document.getElementById('output');
  const errorMessage = `Hey there! The form currently has ${
    formErrors > 1 ? `${formErrors} errors` : `${formErrors} error`
  }! Please check the input ${
    formErrors > 1 ? 'fields' : 'field'
  } marked in red for more information.`;
  if (formErrors === 0) {
    // If there are no form errors, we can output the user's log!
    outputContainer.innerHTML = currentUser.outputLog;
  } else {
    // If there are errors, show the user the error modal with information.
    showErrorModal('Form Validation Error', errorMessage);
    if (outputContainer.innerHTML) {
      outputContainer.innerHTML = '';
    }
  }
}

function copyOutput() {
  // Add notification for copied, as well as if content is empty.
  const outputContainer = document.getElementById('output');
  const notificationElement = document.getElementById('notification-copy');
  const notificationMessageSuccess = 'The log output was copied to your clipboard!';
  const notificationMessageFailure = 'There is nothing to copy!';
  outputContainer.select();
  document.execCommand('copy');
  outputContainer.setSelectionRange(0, 0);
  outputContainer.blur();
  if (outputContainer.innerHTML === '') {
    showNotificationMessage(notificationElement, notificationMessageFailure, true);
  } else {
    showNotificationMessage(notificationElement, notificationMessageSuccess);
  }
}

function addLinkSection() {
  const links = document.getElementById('links');

  const linksContainer = document.createElement('div');

  // Remove element button.
  const removeElementContainer = document.createElement('div');
  const removeElementButton = document.createElement('button');

  // Link Titles.
  const titleContainer = document.createElement('div');
  const titleParagraph = document.createElement('p');
  const titleHeading = document.createTextNode('Title');
  const titleInput = document.createElement('input');
  const titleError = document.createElement('span');

  // Link URLs.
  const urlContainer = document.createElement('div');
  const urlParagraph = document.createElement('p');
  const urlHeading = document.createTextNode('URL');
  const urlInput = document.createElement('input');
  const urlError = document.createElement('span');

  links.appendChild(linksContainer);
  linksContainer.className = 'flex-container-column';

  // Title Input
  linksContainer.appendChild(titleContainer);
  titleContainer.appendChild(titleParagraph);
  titleParagraph.appendChild(titleHeading);
  titleContainer.appendChild(titleInput);
  titleContainer.appendChild(titleError);
  titleContainer.className = 'link-title flex-column-links';
  titleInput.className = 'input input-link-title';
  titleInput.type = 'text';
  titleInput.placeholder = 'Optional: Add a title for the reference.';
  titleInput.addEventListener('input', monitorForm);
  titleError.className = 'error-hidden';

  // URL Input
  linksContainer.appendChild(urlContainer);
  urlContainer.appendChild(urlParagraph);
  urlParagraph.appendChild(urlHeading);
  urlContainer.appendChild(urlInput);
  urlContainer.appendChild(urlError);
  urlContainer.className = 'link-url flex-column-links';
  urlInput.className = 'input input-link-url';
  urlInput.type = 'url';
  urlInput.placeholder = 'Optional: Add a URL for the reference.';
  urlInput.addEventListener('input', monitorForm);
  urlError.className = 'error-hidden';

  linksContainer.appendChild(removeElementContainer);
  removeElementContainer.appendChild(removeElementButton);
  removeElementButton.className = 'far fa-times-circle button-remove-link';
}

function removeElement(elementToRemove) {
  if (elementToRemove.classList.contains('button-remove-link')) {
    elementToRemove.parentNode.parentNode.remove();
  }
  if (elementToRemove.classList.contains('button-close-modal')) {
    document.getElementById('modal-overlay').classList.remove('modal-visible');
    document.getElementById('modal').classList.remove('modal-visible');
  }
}

function addEvent(selector, eventType, functionToCall) {
  document.querySelector(selector).addEventListener(eventType, functionToCall);
}

// Add event handlers for the buttons and input fields.
addEvent('#button-format', 'click', formatInput);
addEvent('#button-copy', 'click', copyOutput);
addEvent('#button-add-link', 'click', addLinkSection);
addEvent('#links', 'click', e => removeElement(e.target));
addEvent('#modal', 'click', e => removeElement(e.target));
addEvent('.input-day', 'input', monitorForm);
addEvent('.input-date', 'input', monitorForm);
addEvent('.input-progress', 'input', monitorForm);
addEvent('.input-hours', 'input', monitorForm);
addEvent('.input-minutes', 'input', monitorForm);
addEvent('.input-thoughts', 'input', monitorForm);
addEvent('.input-link-url', 'input', monitorForm);
addEvent('.input-link-title', 'input', monitorForm);
addEvent('.input-day', 'keypress', monitorForm);
addEvent('.input-hours', 'keypress', monitorForm);
addEvent('.input-minutes', 'keypress', monitorForm);

// Prevent the user from accidentally quitting the application.
window.addEventListener('beforeunload', (event) => {
  // Cancel the event and show a confirmation.
  event.preventDefault();
  // Default return value for chrome and legacy browsers.
  const returnString = 'There may be unsaved data on this page. Are you sure you wish to exit?';
  // Legacy return value for older browsers.
  return returnString;
});
