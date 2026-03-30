/**
 * Mock Data Generator Logic
 */

const DATA_TYPES = {
  id: 'Auto-increment ID',
  uuid: 'UUID',
  first_name: 'First Name',
  last_name: 'Last Name',
  full_name: 'Full Name',
  email: 'Email Address',
  phone: 'Phone Number',
  company: 'Company Name',
  address: 'Street Address',
  city: 'City',
  country: 'Country',
  date: 'Date (Past Year)',
  job_title: 'Job Title',
  boolean: 'Boolean (true/false)',
  ip_address: 'IP Address (IPv4)'
};

let fields = [
  { id: 1, name: 'id', type: 'id' },
  { id: 2, name: 'full_name', type: 'full_name' },
  { id: 3, name: 'email', type: 'email' }
];

let generatedData = '';

function init() {
  renderFields();
  generateData(); // initial generation
}

function addField() {
  fields.push({ id: Date.now(), name: `field_${fields.length + 1}`, type: 'first_name' });
  renderFields();
}

function removeField(id) {
  fields = fields.filter(f => f.id !== id);
  renderFields();
}

function updateField(id, prop, val) {
  const field = fields.find(f => f.id === id);
  if (field) field[prop] = val;
}

function renderFields() {
  const container = document.getElementById('schema-fields');
  if (!container) return;
  
  const optionsHtml = Object.entries(DATA_TYPES)
    .map(([k, v]) => `<option value="${k}">${v}</option>`)
    .join('');
  
  container.innerHTML = fields.map(f => `
    <div class="field-row d-flex gap-2 align-center p-2 bg-bg rounded border border-border">
      <div class="flex-1">
        <input type="text" class="input w-full text-sm font-mono" value="${f.name}" placeholder="Field name" oninput="updateField(${f.id}, 'name', this.value)">
      </div>
      <div class="flex-1">
        <select class="input w-full text-sm" onchange="updateField(${f.id}, 'type', this.value)">
          ${optionsHtml.replace(`value="${f.type}"`, `value="${f.type}" selected`)}
        </select>
      </div>
      <button class="btn btn-sm btn-danger px-2 text-sm" onclick="removeField(${f.id})">🗑️</button>
    </div>
  `).join('');
}

// ----------------------------------------------------
// Mock Data Generators
// ----------------------------------------------------

const MOCK_DB = {
  first: ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica'],
  last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'],
  company: ['Acme Corp', 'Globex', 'Soylent Corp', 'Initech', 'Umbrella Corp', 'Stark Industries', 'Wayne Enterprises', 'Vandelay Ind.', 'Massive Dynamic'],
  street: ['Main St', 'Oak St', 'Maple Ave', 'Cedar Ln', 'Elm St', 'Pine Dr', 'Washington Way', 'Lake View Rd', 'Sunset Blvd'],
  city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Austin'],
  country: ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'France', 'Japan', 'Brazil', 'India', 'Mexico'],
  job: ['Software Engineer', 'Product Manager', 'Designer', 'Data Scientist', 'Marketing Director', 'Sales Rep', 'CEO', 'CTO', 'Consultant']
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateValue(type, index) {
  switch(type) {
    case 'id': 
      return index + 1;
    case 'uuid': 
      return crypto.randomUUID();
    case 'first_name': 
      return pick(MOCK_DB.first);
    case 'last_name': 
      return pick(MOCK_DB.last);
    case 'full_name': 
      return `${pick(MOCK_DB.first)} ${pick(MOCK_DB.last)}`;
    case 'email': 
      return `${pick(MOCK_DB.first).toLowerCase()}.${pick(MOCK_DB.last).toLowerCase()}${randInt(1,99)}@example.com`;
    case 'phone': 
      return `+1 (${randInt(200,999)}) ${randInt(200,999)}-${randInt(1000,9999)}`;
    case 'company': 
      return pick(MOCK_DB.company);
    case 'address': 
      return `${randInt(100, 9999)} ${pick(MOCK_DB.street)}`;
    case 'city': 
      return pick(MOCK_DB.city);
    case 'country': 
      return pick(MOCK_DB.country);
    case 'date': 
      const d = new Date();
      d.setDate(d.getDate() - randInt(0, 365));
      return d.toISOString().split('T')[0];
    case 'job_title': 
      return pick(MOCK_DB.job);
    case 'boolean': 
      return Math.random() > 0.5;
    case 'ip_address': 
      return `${randInt(1,255)}.${randInt(0,255)}.${randInt(0,255)}.${randInt(1,254)}`;
    default: 
      return '';
  }
}

function generateData() {
  const count = parseInt(document.getElementById('num-rows')?.value || 10, 10);
  const format = document.getElementById('output-format')?.value || 'json';
  
  if (fields.length === 0) {
    document.getElementById('output-result').value = 'Add at least one field to generate data.';
    return;
  }
  
  const results = [];
  for (let i = 0; i < count; i++) {
    const row = {};
    fields.forEach(f => {
      // sanitize field name if needed, but we trust the user locally
      const key = f.name;
      row[key] = generateValue(f.type, i);
    });
    results.push(row);
  }
  
  if (format === 'json') {
    generatedData = JSON.stringify(results, null, 2);
  } else if (format === 'csv') {
    const headers = fields.map(f => f.name).join(',');
    const rows = results.map(row => {
      return fields.map(f => {
        const val = row[f.name];
        // quote strings containing commas
        if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
        return val;
      }).join(',');
    });
    generatedData = [headers, ...rows].join('\n');
  }
  
  const el = document.getElementById('output-result');
  if (el) el.value = generatedData;
}

function downloadData() {
  if (!generatedData) return;
  const format = document.getElementById('output-format')?.value || 'json';
  
  const blob = new Blob([generatedData], { type: format === 'json' ? 'application/json' : 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `mock-data-${Date.now()}.${format}`;
  link.click();
  
  URL.revokeObjectURL(url);
}

function copyResult() {
  const el = document.getElementById('output-result');
  if (!el || !el.value) return;
  
  el.select();
  el.setSelectionRange(0, 999999);
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(el.value).then(() => {
      alert("Copied to clipboard!");
    });
  }
}

if (typeof window !== 'undefined') {
  window.addField = addField;
  window.removeField = removeField;
  window.updateField = updateField;
  window.generateData = generateData;
  window.downloadData = downloadData;
  window.copyResult = copyResult;
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, generateData, generateValue, addField, removeField, updateField, renderFields, downloadData, copyResult, pick, randInt, MOCK_DB, getFields: () => fields, setFields: (f) => fields = f, setGeneratedData: (d) => generatedData = d };
}
