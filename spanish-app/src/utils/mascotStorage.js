/**
 * LocalStorage Keys
 * Define consistent keys to avoid typos.
 */
const OWNED_MASCOTS_KEY = 'ownedMascots';
const AVAILABLE_MASCOTS_KEY = 'availableMascots';
const SELECTED_MASCOT_KEY = 'selectedMascot';

// --- Helper for array-based storage ---

/**
 * Retrieves a list of numbers from localStorage.
 * If the key doesn't exist or data is invalid, returns a default empty array.
 * @param {string} key The localStorage key.
 * @returns {number[]} The list of numbers.
 */
function getMascotListFromLocalStorage(key) {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            const parsedValue = JSON.parse(storedValue);
            // Ensure it's an array and contains only numbers
            if (Array.isArray(parsedValue) && parsedValue.every(item => typeof item === 'number')) {
                return parsedValue;
            } else {
                console.warn(`LocalStorage key "${key}" contains invalid data. Returning empty array.`);
            }
        }
    } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
    }
    return []; // Default empty array if no data or invalid data
}

/**
 * Saves a list of numbers to localStorage.
 * @param {string} key The localStorage key.
 * @param {number[]} list The list of numbers to save.
 */
function saveMascotListToLocalStorage(key, list) {
    try {
        // Ensure the list is an array of numbers before saving
        if (!Array.isArray(list) || !list.every(item => typeof item === 'number')) {
            console.error(`Attempted to save invalid data to localStorage key "${key}". Must be an array of numbers.`);
            return;
        }
        localStorage.setItem(key, JSON.stringify(list));
    } catch (error) {
        console.error(`Error saving to localStorage key "${key}":`, error);
    }
}


// --- Functions for Owned Mascots ---

/**
 * Gets the list of owned mascot IDs.
 * @returns {number[]} An array of numbers representing owned mascot IDs.
 */
export function getOwnedMascots() {
    return getMascotListFromLocalStorage(OWNED_MASCOTS_KEY);
}

/**
 * Adds a mascot ID to the owned mascots list if it's not already present.
 * @param {number} mascotId The ID of the mascot to add.
 * @returns {number[]} The updated list of owned mascot IDs.
 */
export function addOwnedMascot(mascotId) {
    if (typeof mascotId !== 'number') {
        console.error("Invalid mascotId. Must be a number.");
        return getOwnedMascots();
    }
    const ownedMascots = getOwnedMascots();
    if (!ownedMascots.includes(mascotId)) {
        ownedMascots.push(mascotId);
        saveMascotListToLocalStorage(OWNED_MASCOTS_KEY, ownedMascots);
    }
    return ownedMascots;
}

/**
 * Sets the entire owned mascots list, overwriting any existing data.
 * @param {number[]} newOwnedMascots The new list of owned mascot IDs.
 */
export function setOwnedMascots(newOwnedMascots) {
    saveMascotListToLocalStorage(OWNED_MASCOTS_KEY, newOwnedMascots);
}


// --- Functions for Available Mascots ---

/**
 * Gets the list of available mascot IDs.
 * @returns {number[]} An array of numbers representing available mascot IDs.
 */
export function getAvailableMascots() {
    return getMascotListFromLocalStorage(AVAILABLE_MASCOTS_KEY);
}

/**
 * Adds a mascot ID to the available mascots list if it's not already present.
 * @param {number} mascotId The ID of the mascot to add to available.
 * @returns {number[]} The updated list of available mascot IDs.
 */
export function addAvailableMascot(mascotId) {
    if (typeof mascotId !== 'number') {
        console.error("Invalid mascotId. Must be a number.");
        return getAvailableMascots();
    }
    const availableMascots = getAvailableMascots();
    if (!availableMascots.includes(mascotId)) {
        availableMascots.push(mascotId);
        saveMascotListToLocalStorage(AVAILABLE_MASCOTS_KEY, availableMascots);
    }
    return availableMascots;
}

/**
 * Removes a mascot ID from the available mascots list.
 * @param {number} mascotId The ID of the mascot to remove from available.
 * @returns {number[]} The updated list of available mascot IDs.
 */
export function removeAvailableMascot(mascotId) {
    if (typeof mascotId !== 'number') {
        console.error("Invalid mascotId. Must be a number.");
        return getAvailableMascots();
    }
    let availableMascots = getAvailableMascots();
    availableMascots = availableMascots.filter(id => id !== mascotId);
    saveMascotListToLocalStorage(AVAILABLE_MASCOTS_KEY, availableMascots);
    return availableMascots;
}

/**
 * Sets the entire available mascots list, overwriting any existing data.
 * @param {number[]} newAvailableMascots The new list of available mascot IDs.
 */
export function setAvailableMascots(newAvailableMascots) {
    saveMascotListToLocalStorage(AVAILABLE_MASCOTS_KEY, newAvailableMascots);
}


// --- Functions for Selected Mascot ---

/**
 * Gets the currently selected mascot ID.
 * @returns {number | null} The selected mascot ID as a number, or null if none is selected or invalid.
 */
export function getSelectedMascot() {
    try {
        const storedValue = localStorage.getItem(SELECTED_MASCOT_KEY);
        if (storedValue !== null) {
            const parsedValue = Number(storedValue);
            if (!isNaN(parsedValue)) {
                return parsedValue;
            }
        }
    } catch (error) {
        console.error("Error retrieving selected mascot from localStorage:", error);
    }
    return null; // Default to null if no selection or invalid data
}

/**
 * Sets the currently selected mascot ID.
 * @param {number} mascotId The ID of the mascot to set as selected.
 */
export function setSelectedMascot(mascotId) {
    if (typeof mascotId !== 'number' || isNaN(mascotId)) {
        console.error("Invalid mascotId for selection. Must be a number.");
        return;
    }
    try {
        localStorage.setItem(SELECTED_MASCOT_KEY, String(mascotId));
    } catch (error) {
        console.error("Error setting selected mascot in localStorage:", error);
    }
}


export function initMascotStorage() {
    // Check and initialize ownedMascots
    const owned = getOwnedMascots();
    if (owned.length === 0) { // If it's empty, means it wasn't set or was invalid
        setOwnedMascots([0]);
        setSelectedMascot(0);
        console.log("Initialized ownedMascots to [0]");
    }

    // Check and initialize availableMascots
    const available = getAvailableMascots();
    if (available.length === 0) { // If it's empty, means it wasn't set or was invalid
        setAvailableMascots([]); // Explicitly set to an empty array
        console.log("Initialized availableMascots to []");
    }

    

    // selectedMascot is handled by getSelectedMascot returning null if not found.
    // You might want to set a default if it's consistently null after this init,
    // e.g., if (getSelectedMascot() === null) { setSelectedMascot(0); }
    // However, the current requirement only specified owned and available.
}