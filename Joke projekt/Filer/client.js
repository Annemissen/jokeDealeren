async function generateJokeTable(jokes) {
    let template = await getText('/jokes.hbs');
    let compiledTemplate = Handlebars.compile(template);
    return compiledTemplate({ jokes });
}

async function generateSiteSelectorOptions(sites) {
    let template = await getText('/selectorOptions.hbs');
    let compiledTemplate = Handlebars.compile(template);
    return compiledTemplate({ sites });
}

// get.js
async function get(url) {
    const respons = await fetch(url);
    if (respons.status !== 200) // OK
        throw new Error(respons.status);
    return await respons.json();
}

// get.js
async function getText(url) {
    const respons = await fetch(url);
    if (respons.status !== 200) // OK
        throw new Error(respons.status);
    return await respons.text();
}

function getTextFromInputFields() {
    let setupInputField = document.getElementById('setupField');
    let punchlineInputField = document.getElementById('punchlineField');

    console.log(setupInputField.value);
    console.log(punchlineInputField.value);

    let joke = {
        setup: setupInputField.value,
        punchline: punchlineInputField.value
    };

    setupInputField.value = "";
    punchlineInputField.value = "";

    return joke;
}

async function post(url, objekt) {
    console.log(JSON.stringify(objekt));

    const respons = await fetch(url, {
        method: "POST",
        body: JSON.stringify(objekt),
        headers: { 'Content-Type': 'application/json' }
    });
    if (respons.status !== 201) // Created
        throw new Error(respons.status);
    // return await respons.json();
}

async function postToServer() {

    try {
        let joke = getTextFromInputFields();
        // console.log(joke);
        await post('/api/jokes', joke);

    } catch (e) {
        console.error(e.name + ':' + e.message + ':' + e.status);
    }

    setTimeout(refreshJokeTable, 2000);
}

async function refreshJokeTable() {
    let ownJokes = await get('/api/jokes');
    console.log(ownJokes);
    let table = document.getElementById("jokesTable")
    table.innerHTML = await generateJokeTable(ownJokes);
}

const change = async () => {
    let selector = document.getElementById('siteSelector');
    let selectedSite = selector.options[selector.selectedIndex].text;
    console.log(selectedSite);
    try {
        let otherJokes = await get('/api/otherjokes/' + selectedSite);
        let table = document.getElementById("jokesTable")
        table.innerHTML = await generateJokeTable(otherJokes);
    }
    catch (e) {
        console.error(e.name + ': ' + e.message)
    }
}

async function main() {
    try {
        let postButton = document.getElementById('createJokeBtn');
        postButton.addEventListener("click", postToServer);

        let selector = document.getElementById('siteSelector');
        selector.addEventListener("change", change);

        let ownJokes = await get('/api/jokes');
        console.log(ownJokes);
        let table = document.getElementById("jokesTable")
        table.innerHTML = await generateJokeTable(ownJokes);

        let otherSites = await get('/api/othersites');
        console.log(otherSites);
        selector.innerHTML = await generateSiteSelectorOptions(otherSites);


    } catch (fejl) {
        console.log(fejl);
    }
}
main();