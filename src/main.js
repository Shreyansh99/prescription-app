const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Import sanitization utility
const { sanitizeObject } = require('./utils/sanitization');

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Log to file if needed
});

// Global handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Log to file if needed
});

const prescriptionsFilePath = path.join(app.getPath('userData'), 'prescriptions.json');
const usersFilePath = path.join(app.getPath('userData'), 'users.json');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  
  // Set Content-Security-Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; font-src 'self' data:"]
      }
    });
  });

  // Disable Autofill warnings in DevTools and handle other console errors
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      // Suppress Autofill errors and JSX warnings which are not relevant to our app
      console.error = (function(originalFunction) {
        return function(message) {
          if (message && (
            message.includes('Autofill.enable') ||
            message.includes('Autofill.setAddresses') ||
            message.includes('non-boolean attribute') ||
            message.includes('jsx') ||
            message.includes('global')
          )) {
            return;
          }
          return originalFunction.apply(this, arguments);
        };
      })(console.error);
      
      // Add global error handler for uncaught errors in renderer
      window.addEventListener('error', (event) => {
        console.error('Uncaught error:', event.error);
        event.preventDefault();
      });
      
      // Add global handler for unhandled promise rejections in renderer
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        event.preventDefault();
      });
    `);
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

function getUsers() {
  try {
    if (!fs.existsSync(usersFilePath)) {
      // Create an empty users array - no default admin
      const users = [];
      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
      return users;
    }
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting users:', error);
    // Return an empty array if there's an error
    return [];
  }
}

ipcMain.handle('get-prescriptions', () => {
  try {
    if (!fs.existsSync(prescriptionsFilePath)) {
      return [];
    }
    const data = fs.readFileSync(prescriptionsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting prescriptions:', error);
    return { error: error.message, success: false };
  }
});

ipcMain.handle('save-prescription', (event, prescription) => {
  try {
    // Validate the prescription object to ensure it's properly formatted
    if (!prescription || typeof prescription !== 'object') {
      throw new Error('Invalid prescription data');
    }
    
    // Sanitize input data to prevent XSS
    const sanitizedPrescription = sanitizeObject(prescription);
    
    // Ensure the prescription object is serializable
    const serializedPrescription = JSON.parse(JSON.stringify(sanitizedPrescription));
    
    let prescriptions = [];
    if (fs.existsSync(prescriptionsFilePath)) {
      const data = fs.readFileSync(prescriptionsFilePath, 'utf-8');
      prescriptions = JSON.parse(data);
    }
    
    // Calculate the next registration number
    let nextRegNumber = 1;
    if (prescriptions.length > 0) {
      // Find the maximum registration number and add 1
      nextRegNumber = Math.max(...prescriptions.map(p => p.registrationNumber || 0)) + 1;
    }
    
    const newPrescription = {
      ...serializedPrescription,
      registrationNumber: nextRegNumber,
    };
    
    prescriptions.push(newPrescription);
    fs.writeFileSync(prescriptionsFilePath, JSON.stringify(prescriptions, null, 2));
    return newPrescription;
  } catch (error) {
    console.error('Error saving prescription:', error);
    return { error: error.message, success: false };
  }
});

ipcMain.handle('login', (event, credentials) => {
  try {
    // Validate input
    if (!credentials || !credentials.username || !credentials.password) {
      return { success: false, message: 'Username and password are required' };
    }
    
    const { username, password } = credentials;
    
    const users = getUsers();
    const user = users.find((u) => u.username === username);
    if (!user) {
      return { success: false, message: 'Invalid username or password' };
    }
    
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return { success: false, message: 'Invalid username or password' };
    }
    
    return { success: true, user: { username: user.username, role: user.role } };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Authentication system error. Please contact IT support.' };
  }
});

ipcMain.handle('create-moderator', (event, moderatorData) => {
  try {
    // Validate input
    if (!moderatorData || !moderatorData.username || !moderatorData.password) {
      return { success: false, message: 'Username and password are required' };
    }
    
    // Sanitize input data to prevent XSS
    const sanitizedData = sanitizeObject(moderatorData);
    const { username, password, createdBy } = sanitizedData;
    
    // Check if username already exists
    const users = getUsers();
    if (users.some(user => user.username === username)) {
      return { success: false, message: 'Username already exists' };
    }
    
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const newModerator = { username, password: hash, role: 'moderator', createdBy };
    users.push(newModerator);
    
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    return { success: true, message: 'Moderator created successfully' };
  } catch (error) {
    console.error('Error creating moderator:', error);
    return { success: false, message: 'Failed to create moderator: ' + error.message };
  }
});

ipcMain.handle('get-users', () => {
  try {
    return getUsers();
  } catch (error) {
    console.error('Error getting users list:', error);
    return { error: error.message, success: false };
  }
});

ipcMain.handle('delete-moderator', (event, username) => {
  try {
    // Validate input
    if (!username) {
      return { success: false, message: 'Username is required' };
    }
    
    const users = getUsers();
    const initialLength = users.length;
    
    // Filter out the user to delete (only if they are a moderator)
    const updatedUsers = users.filter(user => {
      // Don't allow deleting admin users
      if (user.role === 'admin') return true;
      return user.username !== username;
    });
    
    // Check if a user was actually removed
    if (updatedUsers.length === initialLength) {
      return { success: false, message: 'User not found or cannot be deleted' };
    }
    
    // Save the updated users list
    fs.writeFileSync(usersFilePath, JSON.stringify(updatedUsers, null, 2));
    return { success: true, message: 'Moderator deleted successfully' };
  } catch (error) {
    console.error('Error deleting moderator:', error);
    return { success: false, message: 'Failed to delete moderator: ' + error.message };
  }
});

// Check if admin exists
ipcMain.handle('check-admin-exists', () => {
  try {
    const users = getUsers();
    const adminExists = users.some(user => user.role === 'admin');
    return { success: true, adminExists };
  } catch (error) {
    console.error('Error checking admin existence:', error);
    return { success: false, message: 'Failed to check admin existence: ' + error.message };
  }
});

// Register admin user
ipcMain.handle('register-admin', (event, adminData) => {
  try {
    // Validate input
    if (!adminData || !adminData.username || !adminData.password) {
      return { success: false, message: 'Username and password are required' };
    }
    
    // Sanitize input data to prevent XSS
    const sanitizedData = sanitizeObject(adminData);
    const { username, password } = sanitizedData;
    
    // Check if any admin already exists
    const users = getUsers();
    if (users.some(user => user.role === 'admin')) {
      return { success: false, message: 'Admin user already exists' };
    }
    
    // Check if username already exists
    if (users.some(user => user.username === username)) {
      return { success: false, message: 'Username already exists' };
    }
    
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const newAdmin = { username, password: hash, role: 'admin' };
    users.push(newAdmin);
    
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    return { success: true, message: 'Admin created successfully' };
  } catch (error) {
    console.error('Error creating admin:', error);
    return { success: false, message: 'Failed to create admin: ' + error.message };
  }
});

// Import backup data
ipcMain.handle('import-backup', (event, backupData) => {
  try {
    // Validate backup data structure
    if (!backupData || !backupData.metadata || !backupData.prescriptions) {
      return { success: false, message: 'Invalid backup data format' };
    }
    
    // Import prescriptions
    let currentPrescriptions = [];
    if (fs.existsSync(prescriptionsFilePath)) {
      const data = fs.readFileSync(prescriptionsFilePath, 'utf-8');
      currentPrescriptions = JSON.parse(data);
    }
    
    // Merge prescriptions, avoiding duplicates by registration number
    const existingRegNumbers = new Set(currentPrescriptions.map(p => p.registrationNumber));
    const newPrescriptions = backupData.prescriptions.filter(p => !existingRegNumbers.has(p.registrationNumber));
    const mergedPrescriptions = [...currentPrescriptions, ...newPrescriptions];
    
    // Sort by registration number
    mergedPrescriptions.sort((a, b) => a.registrationNumber - b.registrationNumber);
    
    // Save merged prescriptions
    fs.writeFileSync(prescriptionsFilePath, JSON.stringify(mergedPrescriptions, null, 2));
    
    return { 
      success: true, 
      message: `Import successful. Added ${newPrescriptions.length} new prescriptions.` 
    };
  } catch (error) {
    console.error('Error importing backup:', error);
    return { success: false, message: 'Failed to import backup: ' + error.message };
  }
});
