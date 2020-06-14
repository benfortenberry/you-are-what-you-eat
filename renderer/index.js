'use strict'
var moment = require('moment');

const { ipcRenderer } = require('electron')

const deleteFood = (e) => {
    ipcRenderer.send('delete-food', e.target.textContent)
}

document.getElementById('createFoodBtn').addEventListener('click', () => {
    ipcRenderer.send('add-entry-window')
})

ipcRenderer.on('entries', (event, entries) => {

    let html = ''

    const entriesHtml = entries.forEach((entry, index) => {
        entry.formattedDate = moment(entry.date).format("dddd, MMMM Do YYYY, h:mm A");
        html += `<tr><td><sup>${entry.formattedDate}</sup> <br />${entry.food}</td><td class="text-right"><div class="btn-group">
        <button entry=${entry._id} class="editButton btn btn-primary s-circle ">  <i entry=${entry._id} class="icon icon-edit"></i>   </button>
        <button entry=${entry._id} class="deleteButton btn btn-primary s-circle ">  <i entry=${entry._id} class="icon icon-cross"></i>   </button></div>
        </tr>`

    })

    document.getElementById('testy').innerHTML = html

    const deleteButtons = document.querySelectorAll('.deleteButton');

    deleteButtons.forEach(el => el.addEventListener('click', event => {
        ipcRenderer.send('delete-entry', event.target.attributes.entry.value)
    }));

    const editButtons = document.querySelectorAll('.editButton');

    editButtons.forEach(el => el.addEventListener('click', event => {
        ipcRenderer.send('edit-entry-window', event.target.attributes.entry.value)
    }));

});