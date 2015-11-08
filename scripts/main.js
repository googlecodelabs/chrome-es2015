/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Initializes the StickyNotes system.
function StyckyNotes() {

  // Shortcuts to DOM Elements.
  this.messageList = document.getElementById('message-list');
  this.messageForm = document.getElementById('message-form');
  this.messageInput = document.getElementById('message');
  this.submitButton = document.getElementById('submit');

  // Saves message on form submit.
  this.messageForm.addEventListener('submit',
    this.getHandlerFor(this.saveNote, true));

  // Toggle for the button.
  var buttonTogglingHandler = this.getHandlerFor(this.toggleButton);
  this.messageInput.addEventListener('keyup', buttonTogglingHandler);
  this.messageInput.addEventListener('change', buttonTogglingHandler);

  // Loads the last 12 messages and listen for new ones.
  for (var key in localStorage) {
    this.displayMessage(key, localStorage[key]);
  }
  // Listen for messages updates.
  window.addEventListener('storage', function(e) {
    this.displayMessage(e.key, e.newValue);
  }.bind(this));
}

// Returns an event handler for the for submission which makes sure the given
// function is ran into a closure bound to this object.
StyckyNotes.prototype.getHandlerFor = function(func, preventDefault) {
  return function(e) {
    if (preventDefault) {
      e.preventDefault();
    }
    func.bind(this)(e);
  }.bind(this);
};

// Saves a new sticky note on localStorage.
StyckyNotes.prototype.saveNote = function() {
  if (this.messageInput.value) {
    var key = Date.now().toString();
    localStorage.setItem(key, this.messageInput.value);
    this.displayMessage(key, this.messageInput.value);
    this.resetMaterialTextfield(this.messageInput);
    this.toggleButton();
  }
};

// Resets the given MaterialTextField.
StyckyNotes.prototype.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
  element.blur();
};

// Template for sticky notes.
StyckyNotes.prototype.stickyNotesTemplate =
  '<div class="mdl-card mdl-cell mdl-cell--12-col mdl-card__supporting-text ' +
              'mdl-shadow--2dp mdl-cell--4-col-tablet ' +
              'mdl-cell--4-col-desktop">' +
    '<div class="message"></div>' +
    '<button class="delete mdl-button mdl-js-button mdl-js-ripple-effect">' +
      'Delete' +
    '</button>' +
  '</div>';

// Displays or updates a Sticky Note in the UI.
StyckyNotes.prototype.displayMessage = function(key, message) {
  var div = document.getElementById(key);
  // If no element with the given key exists we create a new note.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = this.stickyNotesTemplate;
    div = container.firstChild;
    div.setAttribute('id', key);
    this.messageList.insertBefore(div,
      document.getElementById('message-title').nextSibling);
  }
  // If the message is null we delete the note.
  if (!message) {
    div.parentNode.removeChild(div);
    return;
  }
  div.querySelector('.message').textContent = message;
  // Replace all line breaks by <br>.
  div.querySelector('.message').innerHTML =
    div.querySelector('.message').innerHTML.replace('\n', '<br>');
  // Add Delete button click logic.
  div.querySelector('.delete').addEventListener('click', function() {
    localStorage.removeItem(key);
    div.parentNode.removeChild(div);
  });
};

// Enables or disables the submit button depending on the values of the input
// field.
StyckyNotes.prototype.toggleButton = function() {
  if (this.messageInput.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

// Bindings on load.
window.addEventListener('load', function() {
  new StyckyNotes();
});
