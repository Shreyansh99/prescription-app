const { contextBridge, ipcRenderer } = require('electron');

/**
 * Safely handles IPC communication by ensuring data is serializable
 * and providing consistent error handling
 * @param {string} channel - The IPC channel name
 * @param {any} data - The data to send
 * @returns {Promise<any>} - The response from the main process
 */
async function safeIpcInvoke(channel, data) {
  try {
    // Ensure data is serializable to prevent "An object could not be cloned" errors
    const serializedData = data ? JSON.parse(JSON.stringify(data)) : undefined;
    return await ipcRenderer.invoke(channel, serializedData);
  } catch (error) {
    console.error(`IPC communication error (${channel}):`, error);
    return {
      success: false,
      error: error.message || 'Communication error with main process',
      errorCode: 'IPC_ERROR'
    };
  }
}

contextBridge.exposeInMainWorld('api', {
  savePrescription: (rx) => safeIpcInvoke('save-prescription', rx),
  getPrescriptions: () => safeIpcInvoke('get-prescriptions'),
  login: (credentials) => safeIpcInvoke('login', credentials),
  createModerator: (moderator) => safeIpcInvoke('create-moderator', moderator),
  getUsers: () => safeIpcInvoke('get-users'),
  deleteModerator: (username) => safeIpcInvoke('delete-moderator', username),
  checkAdminExists: () => safeIpcInvoke('check-admin-exists'),
  registerAdmin: (adminData) => safeIpcInvoke('register-admin', adminData),
  importBackup: (backupData) => safeIpcInvoke('import-backup', backupData),
});

// Expose error handling utilities to renderer process
contextBridge.exposeInMainWorld('errorUtils', {
  // Log errors to console and optionally to a file
  logError: (error, context) => {
    console.error(`Error in ${context || 'application'}:`, error);
    // Could add file logging here if needed
    return { logged: true, timestamp: new Date().toISOString() };
  },
  
  // Format error for display to user
  formatErrorMessage: (error) => {
    if (!error) return 'An unknown error occurred';
    
    // Handle different error types
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    
    try {
      return JSON.stringify(error);
    } catch (e) {
      return 'An error occurred that could not be displayed';
    }
  }
});
