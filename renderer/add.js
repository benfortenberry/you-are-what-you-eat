'use strict'

const { ipcRenderer } = require('electron')

const flatpickr = require("flatpickr");

let entryId = null;

let dateConfig = {
    enableTime: true,
    dateFormat: "Y-m-d h:i K",
    altInput: true,
    altFormat: "F j, Y h:i K",
    defaultDate: new Date(),
    position: 'auto',

}

flatpickr("#date-input", dateConfig);

document.getElementById('food-textarea').focus();

document.getElementById('foodForm').addEventListener('submit', (evt) => {

    evt.preventDefault();
    const dateInput = evt.target[1];
    const foodInput = evt.target[0];
    // const quantityInput = evt.target[3];

    ipcRenderer.send('add-entry', {
        entryId,
        date: dateInput.value.toString(),
        food: foodInput.value.toString(),
        // quantity: quantityInput.value.toString()
    });


    // let myNotification = new Notification('Meal Added!', {
    //     body: 'Hope you enjoyed ' + foodInput.value
    // })

    foodInput.value = '';
    // quantityInput.value = ''


})

ipcRenderer.on('entry-data', (event, entryData) => {
    document.getElementById('food-textarea').value = entryData.food;
    dateConfig.defaultDate = new Date(entryData.date)
    flatpickr("#date-input", dateConfig);
    entryId = entryData._id

});