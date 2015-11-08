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
function StickyNotes() {
  // Shortcuts to DOM Elements.
  this.notesContainer = document.getElementById('notes-container');
  this.addNoteForm = document.getElementById('add-note-form');
  this.noteMessageInput = document.getElementById('message');
  this.addNoteSubmitButton = document.getElementById('submit');

  // Saves notes on form submit.
  this.addNoteForm.addEventListener('submit',
    this.getHandlerFor(this.saveNote, true));

  // Toggle for the button.
  var buttonTogglingHandler = this.getHandlerFor(this.toggleButton);
  this.noteMessageInput.addEventListener('keyup', buttonTogglingHandler);
  this.noteMessageInput.addEventListener('change', buttonTogglingHandler);

  // Loads all the notes.
  for (var key in localStorage) {
    this.displayNote(key, localStorage[key]);
  }
  // Listen for updates to notes from other windows.
  window.addEventListener('storage', function(e) {
    this.displayNote(e.key, e.newValue);
  }.bind(this));
}

// Returns an event handler for the for submission which makes sure the given
// function is ran into a closure bound to this object.
StickyNotes.prototype.getHandlerFor = function(func, preventDefault) {
  return function(e) {
    if (preventDefault) {
      e.preventDefault();
    }
    func.bind(this)(e);
  }.bind(this);
};

// Saves a new sticky note on localStorage.
StickyNotes.prototype.saveNote = function() {
  if (this.noteMessageInput.value) {
    var key = Date.now().toString();
    localStorage.setItem(key, this.noteMessageInput.value);
    this.displayNote(key, this.noteMessageInput.value);
    this.resetMaterialTextfield(this.noteMessageInput);
    this.toggleButton();
  }
};

// Resets the given MaterialTextField.
StickyNotes.prototype.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
  element.blur();
};

// Template for sticky notes.
StickyNotes.prototype.stickyNotesTemplate =
  '<div class="mdl-card mdl-cell mdl-cell--12-col mdl-card__supporting-text ' +
              'mdl-shadow--2dp mdl-cell--4-col-tablet ' +
              'mdl-cell--4-col-desktop">' +
    '<div class="message"></div>' +
    '<button class="delete mdl-button mdl-js-button mdl-js-ripple-effect">' +
      'Delete' +
    '</button>' +
  '</div>';

// Creates/updates/deletes a note in the UI.
StickyNotes.prototype.displayNote = function(key, message) {
  var div = document.getElementById(key);
  // If no element with the given key exists we create a new note.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = this.stickyNotesTemplate;
    div = container.firstChild;
    div.setAttribute('id', key);
    this.notesContainer.insertBefore(div,
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
StickyNotes.prototype.toggleButton = function() {
  if (this.noteMessageInput.value) {
    this.addNoteSubmitButton.removeAttribute('disabled');
  } else {
    this.addNoteSubmitButton.setAttribute('disabled', 'true');
  }
};

// Bindings on load.
window.addEventListener('load', function() {
  new StickyNotes();
});
