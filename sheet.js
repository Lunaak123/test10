let data = []; // This will hold your Excel data
let filteredData = []; // This will hold filtered data after operations

// Function to load and display the Excel sheet
async function loadExcelSheet(fileUrl) {
    try {
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
        const sheetName = workbook.SheetNames[0]; // Assuming you're using the first sheet
        const sheet = workbook.Sheets[sheetName];

        // Convert sheet data to JSON
        data = XLSX.utils.sheet_to_json(sheet, { defval: null });
        filteredData = [...data]; // Start with all data

        // Populate the dropdowns after loading data
        populatePrimaryColumnDropdown();
        populateOperationColumnsCheckboxes();

        // Initially display the full Excel sheet
        displaySheet(filteredData);
    } catch (error) {
        console.error("Error loading Excel sheet:", error);
    }
}

// Function to populate the primary column dropdown based on Excel data
function populatePrimaryColumnDropdown() {
    const primaryColumnSelect = document.getElementById('primary-column');
    primaryColumnSelect.innerHTML = ''; // Clear any existing options

    if (data.length === 0) {
        alert("No data available to populate columns.");
        return;
    }

    // Assuming the first row contains column headers
    const columnNames = Object.keys(data[0]);

    columnNames.forEach(col => {
        const option = document.createElement('option');
        option.value = col;
        option.textContent = col;
        primaryColumnSelect.appendChild(option);
    });
}

// Function to populate checkboxes for column selection
function populateOperationColumnsCheckboxes() {
    const operationColumnsDiv = document.getElementById('operation-columns');
    operationColumnsDiv.innerHTML = ''; // Clear any existing options

    const columnNames = Object.keys(data[0]);

    columnNames.forEach(col => {
        const checkboxLabel = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = col;
        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(document.createTextNode(col));
        operationColumnsDiv.appendChild(checkboxLabel);
        operationColumnsDiv.appendChild(document.createElement('br'));
    });
}

// Function to display the Excel sheet as an HTML table
function displaySheet(sheetData) {
    const sheetContentDiv = document.getElementById('sheet-content');
    sheetContentDiv.innerHTML = ''; // Clear any existing content

    if (sheetData.length === 0) {
        sheetContentDiv.innerHTML = '<p>No data available</p>';
        return;
    }

    const table = document.createElement('table');

    // Create table headers
    const headerRow = document.createElement('tr');
    Object.keys(sheetData[0]).forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create table rows
    sheetData.forEach(row => {
        const tr = document.createElement('tr');
        Object.values(row).forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell === null ? 'NULL' : cell; // Display 'NULL' for null values
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    sheetContentDiv.appendChild(table);
}

// Function to apply the selected operation (null/not-null check)
function applyOperation() {
    const selectedColumns = Array.from(document.querySelectorAll('#operation-columns input:checked')).map(checkbox => checkbox.value);
    const operation = document.getElementById('operation').value;

    if (selectedColumns.length === 0) {
        alert('Please select at least one column.');
        return;
    }

    // Apply the operation to the filtered data
    filteredData = data.filter(row => {
        return selectedColumns.every(col => {
            if (operation === 'null') {
                return row[col] === null;
            } else {
                return row[col] !== null;
            }
        });
    });

    // Re-display the filtered data
    displaySheet(filteredData);
}

// Event listener for applying the operation
document.getElementById('apply-operation').addEventListener('click', applyOperation);

// Load the Excel sheet when the page is loaded (replace with your file URL)
window.addEventListener('load', () => {
    const fileUrl = getQueryParam('fileUrl'); // Assuming you get file URL from query params
    loadExcelSheet(fileUrl);
});

// Helper function to get query parameters from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
