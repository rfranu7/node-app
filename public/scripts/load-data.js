const BASE_URL = "https://afternoon-dawn-87591.herokuapp.com/";

// Engagement Elements
const engagementListBtn = document.getElementById("list-engagement");
const engagementDisplay = document.getElementById("engagement-display");

// Payment Plan Elements
const planListBtn = document.getElementById("list-plan");
const planDisplay = document.getElementById("plan-display");

engagementListBtn.addEventListener("click", (e) => {
    fetch(BASE_URL + "list-engagements").then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log(data);
        generateTable(data, engagementDisplay);
    }).catch(function (err) {
        console.warn('Something went wrong.', err);
    });
});

planListBtn.addEventListener("click", (e) => {
    fetch(BASE_URL + "list-plans").then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log(data);
        generateTable(data, planDisplay);
    }).catch(function (err) {
        console.warn('Something went wrong.', err);
    });
});

function generateTable(data, parentElement) {
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