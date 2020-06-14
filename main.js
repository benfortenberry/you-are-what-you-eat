'use strict'

// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const debug = require('electron-debug');

// debug();

var Datastore = require('nedb'),
    db = new Datastore({ filename: 'data/entries', autoload: true });
db.loadDatabase(function(err) { // Callback is optional
    // Now commands will be executed
});


const path = require('path')
const Window = require('./Window');


const menuTemplate = [{
        label: 'Close',
        role: 'close'

    }

];

let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 700,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })



    // and load the index.html of the app.
    mainWindow.loadFile('renderer/index.html')
        // Open the DevTools.
        // mainWindow.webContents.openDevTools()
}

let addFoodWin


ipcMain.on('add-entry-window', () => {

    if (!addFoodWin) {
        addFoodWin = new Window({
            file: path.join('renderer', 'add.html'),
            width: 600,
            height: 600,
            parent: mainWindow
        })

        addFoodWin.once('ready-to-show', () => {
            addFoodWin.show();
            // console.log('send the event to the adffodwin', docs[0])
        })

        addFoodWin.on('closed', () => {
            addFoodWin = null
        })
    }

})

ipcMain.on('edit-entry-window', (event, entryId) => {

    // console.log(entryId)

    db.find({ _id: entryId }, function(err, docs) {
        // docs is an array containing documents Mars, Earth, Jupiter
        // If no document is found, docs is equal to []
        if (docs.length) {
            // console.log(docs[0].food, docs[0].date, docs[0]._id)
            if (!addFoodWin) {
                addFoodWin = new Window({
                    file: path.join('renderer', 'add.html'),
                    width: 600,
                    height: 600,
                    parent: mainWindow,
                    entryId,
                    food: docs[0].food,
                    date: docs[0].date
                })



                addFoodWin.once('ready-to-show', () => {
                    addFoodWin.show();
                    addFoodWin.webContents.send('entry-data', docs[0]);
                })

                addFoodWin.on('closed', () => {
                    addFoodWin = null
                })
            }
        }


    });




})


ipcMain.on('add-entry', (event, entry) => {

    var doc = {
        food: entry.food,
        date: entry.date,
    };

    // console.log('edit on main', entry)

    if (entry.entryId) {
        db.update({ _id: entry.entryId }, { food: doc.food, date: doc.date }, {}, function(err, numReplaced) {
            // numReplaced = 1
            // The doc #3 has been replaced by { _id: 'id3', planet: 'Pluton' }
            // Note that the _id is kept unchanged, and the document has been replaced
            // (the 'system' and inhabited fields are not here anymore)
        });
    } else {
        db.insert(doc, function(err, newDoc) { // Callback is optional
            // newDoc is the newly inserted document, including its _id
            // newDoc has no key called notToBeSaved since its value was undefined
        });
    }

    db.find({}).exec(function(err, docs) {

        const sorted = docs.sort((a, b) => {
            const aDate = new Date(a.date)
            const bDate = new Date(b.date)

            return bDate - aDate
        })

        mainWindow.webContents.send('entries', sorted)
    });

    addFoodWin.hide();
    addFoodWin = null;

})

ipcMain.on('edit-entry', (event, entry) => {

    var doc = {
        food: entry.food,
        date: entry.date,
        quantity: entry.quantity
    };
    db.insert(doc, function(err, newDoc) { // Callback is optional
        // newDoc is the newly inserted document, including its _id
        // newDoc has no key called notToBeSaved since its value was undefined
    });
    db.find({}).exec(function(err, docs) {

        const sorted = docs.sort((a, b) => {
            const aDate = new Date(a.date)
            const bDate = new Date(b.date)

            return bDate - aDate
        })

        mainWindow.webContents.send('entries', sorted)
    });

})


ipcMain.on('delete-entry', (event, entryId) => {
    db.remove({ _id: entryId }, {}, function(err, numRemoved) {
        // numRemoved = 1
    });
    db.find({}).exec(function(err, docs) {

        const sorted = docs.sort((a, b) => {
            const aDate = new Date(a.date)
            const bDate = new Date(b.date)

            return bDate - aDate
        })

        mainWindow.webContents.send('entries', sorted)
    });

})


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()

    mainWindow.webContents.on('did-finish-load', () => {

        db.find({}).exec(function(err, docs) {

            const sorted = docs.sort((a, b) => {
                const aDate = new Date(a.date)
                const bDate = new Date(b.date)

                return bDate - aDate
            })

            mainWindow.webContents.send('entries', sorted)
        });
    })

    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(mainMenu);

    app.on('activate', function() {

        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.