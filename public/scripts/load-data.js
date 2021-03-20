// Engagement Elements
const engagementListBtn = document.getElementById("list-engagement");
const engagementDisplay = document.getElementById("engagement-display");

// Payment Plan Elements
const planListBtn = document.getElementById("list-plan");
const planDisplay = document.getElementById("plan-display");


// INVoice Elements
const invoiceListBtn = document.getElementById("list-invoice");
const invoiceDisplay = document.getElementById("invoice-display");


engagementListBtn.addEventListener("click", (e) => {
    fetch(BASE_URL + "list-engagements").then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log(data);
        generateEngagementTable(data, engagementDisplay);
    }).catch(function (err) {
        console.warn('Something went wrong.', err);
    });
});

planListBtn.addEventListener("click", (e) => {
    fetch(BASE_URL + "list-plans").then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log(data);
        generatePlanTable(data, planDisplay);
    }).catch(function (err) {
        console.warn('Something went wrong.', err);
    });
});

invoiceListBtn.addEventListener("click", (e) => {

    e.preventDefault();
    console.log("invoice");
    var query = 'list-invoices';

    const invoice_form = document.getElementById('invoice_form');
    const formData = new FormData(invoice_form);

    if(formData.get("start_date") || formData.get("end_date") || formData.get("status") || formData.get("customer_id") || formData.get("engagement_id")) {
        query += '?';
    }

    if(formData.get("start_date")) {
        query += `start=${formData.get("start_date")}`;
    }

    if(formData.get("start_date") && formData.get("end_date")) {
        query += `&`;
    }
    
    if(formData.get("end_date")) {
        query += `end=${formData.get("end_date")}`;
    }

    if(formData.get("start_date") || formData.get("end_date") && formData.get("status")) {
        query += `&`;
    }
    
    if(formData.get("status")) {
        query += `status=${formData.get("status")}`;
    }

    if(formData.get("start_date") || formData.get("end_date") || formData.get("status") && formData.get("customer_id")) {
        query += `&`;
    }
    
    if(formData.get("customer_id")) {
        query += `customer=${formData.get("customer_id")}`;
    }

    if(formData.get("start_date") || formData.get("end_date") || formData.get("status") || formData.get("customer_id") && formData.get("engagement_id")) {
        query += `&`;
    }
    
    if(formData.get("engagement_id")) {
        query += `engagement=${formData.get("engagement_id")}`;
    }

    console.log(query);

    fetch(BASE_URL + query).then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log(data);
        // generateEngagementTable(data, invoiceDisplay);
    }).catch(function (err) {
        console.warn('Something went wrong.', err);
    });
});


function generateEngagementTable(data, parentElement) {
    // reset table content
    parentElement.innerHTML = '';

    // create a table
    const table = document.createElement('div');
    table.innerHTML = "<section class='row header-row'><p>Name</p><p>Duration (months)</p><p>Total Amount</p></section>";

    data.forEach(element => {
        var formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });

        const row = document.createElement('section');
        row.classList.add('row');
        row.innerHTML = `<p>${element.engagement_name}</p><p>${element.duration}</p><p>${formatter.format(element.total_fee)}</p>`;
        table.appendChild(row);
    });

    parentElement.appendChild(table);
}

function generatePlanTable(data, parentElement) {
    // reset table content
    parentElement.innerHTML = '';

    // create a table
    const table = document.createElement('div');
    table.innerHTML = "<section class='row header-row'><p>Name</p><p>Terms (months)</p></section>";

    data.forEach(element => {
        const row = document.createElement('section');
        row.classList.add('row');
        row.innerHTML = `<p>${element.plan_name}</p><p>${element.plan_terms}</p>`;
        table.appendChild(row);
    });

    parentElement.appendChild(table);
}
