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

// Initializes the Sticky Notes app.
function StickyNotesApp() {
  // Shortcuts to DOM Elements.
  this.notesContainer = document.getElementById('notes-container');
  this.noteMessageInput = document.getElementById('message');
  this.addNoteButton = document.getElementById('save');
  this.notesSectionTitle = document.getElementById('notes-section-title');

  // Saves notes on button click.
  this.addNoteButton.addEventListener('click', this.saveNote.bind(this));

  // Toggle for the button.
  this.noteMessageInput.addEventListener('keyup', this.toggleButton.bind(this));

  // Loads all the notes.
  for (var key in localStorage) {
    this.displayNote(key, localStorage[key]);
  }

  // Listen for updates to notes from other windows.
  window.addEventListener('storage', function(e) {
    this.displayNote(e.key, e.newValue);
  }.bind(this));
}

// Saves a new sticky note on localStorage.
StickyNotesApp.prototype.saveNote = function() {
  if (this.noteMessageInput.value) {
    var key = Date.now().toString();
    localStorage.setItem(key, this.noteMessageInput.value);
    this.displayNote(key, this.noteMessageInput.value);
    StickyNotesApp.resetMaterialTextfield(this.noteMessageInput);
    this.toggleButton();
  }
};

// Resets the given MaterialTextField.
StickyNotesApp.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
  element.blur();
};

// Creates/updates/deletes a note in the UI.
StickyNotesApp.prototype.displayNote = function(key, message) {
  var note = document.getElementById(key);
  // If no element with the given key exists we create a new note.
  if (!note) {
    note = document.createElement('sticky-note');
    note.id = key;
    this.notesContainer.insertBefore(note, this.notesSectionTitle.nextSibling);
  }
  // If the message is null we delete the note.
  if (!message) {
    return note.deleteNote();
  }
  note.setMessage(message);
};

// Enables or disables the submit button depending on the values of the input field.
StickyNotesApp.prototype.toggleButton = function() {
  if (this.noteMessageInput.value) {
    this.addNoteButton.removeAttribute('disabled');
  } else {
    this.addNoteButton.setAttribute('disabled', 'true');
  }
};

// On load start the app.
window.addEventListener('load', function() {
  new StickyNotesApp();
});

// A Sticky Note custom element that extends HTMLElement.
var StickyNote = Object.create(HTMLElement.prototype);

// Initial content of the element.
StickyNote.TEMPLATE =
  '<div class="message"></div>' +
  '<div class="date"></div>' +
  '<button class="delete mdl-button mdl-js-button mdl-js-ripple-effect">' +
    'Delete' +
  '</button>';

// StickyNote elements top level style classes.
StickyNote.CLASSES = ['mdl-cell--4-col-desktop', 'mdl-card__supporting-text', 'mdl-cell--12-col',
  'mdl-shadow--2dp', 'mdl-cell--4-col-tablet', 'mdl-card', 'mdl-cell', 'sticky-note'];

// List of shortened month names.
StickyNote.MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov',
                     'Dec'];

// Fires when an instance of the element is created.
StickyNote.createdCallback = function() {
  StickyNote.CLASSES.forEach(function(klass) {
    this.classList.add(klass);
  }.bind(this));
  this.innerHTML = StickyNote.TEMPLATE;
  this.messageElement = this.querySelector('.message');
  this.dateElement = this.querySelector('.date');
  this.deleteButton = this.querySelector('.delete');
  this.deleteButton.addEventListener('click', this.deleteNote.bind(this));
};

// Fires when an attribute of the element is added/deleted/modified.
StickyNote.attributeChangedCallback = function(attributeName) {
  // We display/update the created date message if the id changes.
  if (attributeName == 'id') {
    if (this.id) {
      var date = new Date(parseInt(this.id));
    } else {
      var date = new Date();
    }
    var month = StickyNote.MONTHS[date.getMonth()];
    this.dateElement.textContent = 'Created on ' + month + ' ' + date.getDate();
  }
};

// Sets the message of the note.
StickyNote.setMessage = function(message) {
  this.messageElement.textContent = message;
  // Replace all line breaks by <br>.
  this.messageElement.innerHTML = this.messageElement.innerHTML.replace(/\n/g, '<br>');
};

// Deletes the note by removing the element from the DOM and the data from localStorage.
StickyNote.deleteNote = function() {
  localStorage.removeItem(this.id);
  this.parentNode.removeChild(this);
};

customElements.define('sticky-note', {
  prototype: StickyNote
});
