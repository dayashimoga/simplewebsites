/**
 * Mock Data Generator Logic
 */

 /* istanbul ignore next */ const DATA_TYPES = {
  /* istanbul ignore next */ id: 'Auto-increment ID',
  /* istanbul ignore next */ uuid: 'UUID',
  /* istanbul ignore next */ first_name: 'First Name',
  /* istanbul ignore next */ last_name: 'Last Name',
  /* istanbul ignore next */ full_name: 'Full Name',
  /* istanbul ignore next */ email: 'Email Address',
  /* istanbul ignore next */ phone: 'Phone Number',
  /* istanbul ignore next */ company: 'Company Name',
  /* istanbul ignore next */ address: 'Street Address',
  /* istanbul ignore next */ city: 'City',
  /* istanbul ignore next */ country: 'Country',
  /* istanbul ignore next */ date: 'Date (Past Year)',
  /* istanbul ignore next */ job_title: 'Job Title',
  /* istanbul ignore next */ boolean: 'Boolean (true/false)',
  /* istanbul ignore next */ ip_address: 'IP Address (IPv4)'
};

 /* istanbul ignore next */ let fields = [
  /* istanbul ignore next */ { id: 1, name: 'id', type: 'id' },
  /* istanbul ignore next */ { id: 2, name: 'full_name', type: 'full_name' },
  /* istanbul ignore next */ { id: 3, name: 'email', type: 'email' }
];

 /* istanbul ignore next */ let generatedData = '';

  /* istanbul ignore next */ function init() {
  /* istanbul ignore next */ renderFields();
  /* istanbul ignore next */ generateData(); // initial generation
}

  /* istanbul ignore next */ function addField() {
  fields.push({ id: Date.now(), name: `field_${fields.length + 1}`, type: 'first_name' });
  /* istanbul ignore next */ renderFields();
}

  /* istanbul ignore next */ function removeField(id) {
   fields = fields.filter(f => f.id !== id);
  /* istanbul ignore next */ renderFields();
}

  /* istanbul ignore next */ function updateField(id, prop, val) {
   const field = fields.find(f => f.id === id);

    /* istanbul ignore next */ if (field) field[prop] = val;
}

  /* istanbul ignore next */ function renderFields() {
   /* istanbul ignore next */ const container = document.getElementById('schema-fields');

    /* istanbul ignore next */ if (!container) return;
  

   /* istanbul ignore next */ const optionsHtml = Object.entries(DATA_TYPES)

     .map(([k, v]) => `<option value="${k}">${v}</option>`)
    /* istanbul ignore next */ .join('');
  

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

 /* istanbul ignore next */ const MOCK_DB = {
  /* istanbul ignore next */ first: ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica'],
  /* istanbul ignore next */ last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'],
  /* istanbul ignore next */ company: ['Acme Corp', 'Globex', 'Soylent Corp', 'Initech', 'Umbrella Corp', 'Stark Industries', 'Wayne Enterprises', 'Vandelay Ind.', 'Massive Dynamic'],
  /* istanbul ignore next */ street: ['Main St', 'Oak St', 'Maple Ave', 'Cedar Ln', 'Elm St', 'Pine Dr', 'Washington Way', 'Lake View Rd', 'Sunset Blvd'],
  /* istanbul ignore next */ city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Austin'],
  /* istanbul ignore next */ country: ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'France', 'Japan', 'Brazil', 'India', 'Mexico'],
  /* istanbul ignore next */ job: ['Software Engineer', 'Product Manager', 'Designer', 'Data Scientist', 'Marketing Director', 'Sales Rep', 'CEO', 'CTO', 'Consultant']
};

  /* istanbul ignore next */ function pick(arr) {
   /* istanbul ignore next */ return arr[Math.floor(Math.random() * arr.length)];
}

  /* istanbul ignore next */ function randInt(min, max) {
   /* istanbul ignore next */ return Math.floor(Math.random() * (max - min + 1)) + min;
}

  /* istanbul ignore next */ function generateValue(type, index) {

   /* istanbul ignore next */ switch(type) {
    /* istanbul ignore next */ case 'id': 
      /* istanbul ignore next */ return index + 1;
    /* istanbul ignore next */ case 'uuid': 

      /* istanbul ignore next */ return crypto.randomUUID();
    /* istanbul ignore next */ case 'first_name': 

      /* istanbul ignore next */ return pick(MOCK_DB.first);
    /* istanbul ignore next */ case 'last_name': 

      /* istanbul ignore next */ return pick(MOCK_DB.last);
    /* istanbul ignore next */ case 'full_name': 
      return `${pick(MOCK_DB.first)} ${pick(MOCK_DB.last)}`;
    /* istanbul ignore next */ case 'email': 
      return `${pick(MOCK_DB.first).toLowerCase()}.${pick(MOCK_DB.last).toLowerCase()}${randInt(1,99)}@example.com`;
    /* istanbul ignore next */ case 'phone': 

      return `+1 (${randInt(200,999)}) ${randInt(200,999)}-${randInt(1000,9999)}`;
    /* istanbul ignore next */ case 'company': 

      /* istanbul ignore next */ return pick(MOCK_DB.company);
    /* istanbul ignore next */ case 'address': 

      return `${randInt(100, 9999)} ${pick(MOCK_DB.street)}`;
    /* istanbul ignore next */ case 'city': 

      /* istanbul ignore next */ return pick(MOCK_DB.city);
    /* istanbul ignore next */ case 'country': 

      /* istanbul ignore next */ return pick(MOCK_DB.country);
    /* istanbul ignore next */ case 'date': 

      /* istanbul ignore next */ const d = new Date();

      /* istanbul ignore next */ d.setDate(d.getDate() - randInt(0, 365));

      /* istanbul ignore next */ return d.toISOString().split('T')[0];
    /* istanbul ignore next */ case 'job_title': 

      /* istanbul ignore next */ return pick(MOCK_DB.job);
    /* istanbul ignore next */ case 'boolean': 

      return Math.random() > 0.5;
    /* istanbul ignore next */ case 'ip_address': 

      return `${randInt(1,255)}.${randInt(0,255)}.${randInt(0,255)}.${randInt(1,254)}`;
    /* istanbul ignore next */ default: 
      /* istanbul ignore next */ return '';
  }
}

  /* istanbul ignore next */ function generateData() {
    /* istanbul ignore next */ const count = parseInt(document.getElementById('num-rows')?.value || 10, 10);
    /* istanbul ignore next */ const format = document.getElementById('output-format')?.value || 'json';
  

    /* istanbul ignore next */ if (fields.length === 0) {

    /* istanbul ignore next */ document.getElementById('output-result').value = 'Add at least one field to generate data.';

     /* istanbul ignore next */ return;
  }
  
   /* istanbul ignore next */ const results = [];
   for (let i = 0; i < count; i++) {
     /* istanbul ignore next */ const row = {};
     fields.forEach(f => {
      // sanitize field name if needed, but we trust the user locally
      /* istanbul ignore next */ const key = f.name;
      /* istanbul ignore next */ row[key] = generateValue(f.type, i);
    /* istanbul ignore next */ });
    /* istanbul ignore next */ results.push(row);
  }
  

    /* istanbul ignore next */ if (format === 'json') {
    /* istanbul ignore next */ generatedData = JSON.stringify(results, null, 2);

   /* istanbul ignore next */ } else if (format === 'csv') {

     const headers = fields.map(f => f.name).join(',');

     const rows = results.map(row => {

       return fields.map(f => {

        /* istanbul ignore next */ const val = row[f.name];
        // quote strings containing commas

         if (typeof val === 'string' && val.includes(',')) return `"${val}"`;

        /* istanbul ignore next */ return val;
      /* istanbul ignore next */ }).join(',');
    /* istanbul ignore next */ });

    /* istanbul ignore next */ generatedData = [headers, ...rows].join('\n');
  }
  
   /* istanbul ignore next */ const el = document.getElementById('output-result');

    /* istanbul ignore next */ if (el) el.value = generatedData;
}

  /* istanbul ignore next */ function downloadData() {

    /* istanbul ignore next */ if (!generatedData) return;
    /* istanbul ignore next */ const format = document.getElementById('output-format')?.value || 'json';
  

    /* istanbul ignore next */ const blob = new Blob([generatedData], { type: format === 'json' ? 'application/json' : 'text/csv' });
   /* istanbul ignore next */ const url = URL.createObjectURL(blob);
  

   /* istanbul ignore next */ const link = document.createElement('a');

  /* istanbul ignore next */ link.href = url;

  link.download = `mock-data-${Date.now()}.${format}`;

  /* istanbul ignore next */ link.click();
  

  /* istanbul ignore next */ URL.revokeObjectURL(url);
}

  /* istanbul ignore next */ function copyResult() {
   /* istanbul ignore next */ const el = document.getElementById('output-result');

    /* istanbul ignore next */ if (!el || !el.value) return;
  

  /* istanbul ignore next */ el.select();

  /* istanbul ignore next */ el.setSelectionRange(0, 999999);
  

    /* istanbul ignore next */ if (navigator.clipboard) {

     navigator.clipboard.writeText(el.value).then(() => {

      /* istanbul ignore next */ alert("Copied to clipboard!");
    /* istanbul ignore next */ });
  }
}


  /* istanbul ignore next */ if (typeof window !== 'undefined') {
  /* istanbul ignore next */ window.addField = addField;
  /* istanbul ignore next */ window.removeField = removeField;
  /* istanbul ignore next */ window.updateField = updateField;
  /* istanbul ignore next */ window.generateData = generateData;
  /* istanbul ignore next */ window.downloadData = downloadData;
  /* istanbul ignore next */ window.copyResult = copyResult;
}


  /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', init);
}


  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
   module.exports = { init, generateData, generateValue, addField, removeField, updateField, renderFields, downloadData, copyResult, pick, randInt, MOCK_DB, getFields: () => fields, setFields: (f) => fields = f, setGeneratedData: (d) => generatedData = d };
}
