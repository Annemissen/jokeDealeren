const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(cors());
app.listen(8080);

mongoose.connect('mongodb+srv://stef6593:AnnemieogSteffen@cluster0.diqi4.mongodb.net/jokeDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, dbName: "jokeDB" });

const Joke = mongoose.model('Joke', new mongoose.Schema({
    setup: String,
    punchline: String
}));


app.use(express.static(__dirname + "/Filer"));
app.get("/", async(request, response) => {
    response.sendFile(__dirname + "/Filer/index.html")
});

//Til at gå på nettet
app.get('/api/jokes', async(request, response) => {
    let jokes = await Joke.find().select('-_id -__v)').exec();
    // console.log(jokes);
    response.send(jokes);
});

async function getOtherSites() {
    const otherJokesUrl = 'https://krdo-joke-registry.herokuapp.com/api/services';
    let response = await fetch(otherJokesUrl);
    let responseJSON = await response.json();

    let otherJokes = responseJSON.map((foreigenJoke) => ({
        id: foreigenJoke._id,
        address: foreigenJoke.address,
        name: foreigenJoke.name,
        timestamp: foreigenJoke.timestamp
    }));
    return otherJokes;
}

app.get('/api/othersites', async(request, response) => {
    let otherSites = await getOtherSites();
    response.send(otherSites);
})

app.get('/api/otherjokes/:site', async(request, response) => {
    let name = request.params.site;
    
    try {
        let jokeSiteObj = await getOtherSites();
        let joke = jokeSiteObj.find((obj) => obj.name == name);
    
        let site = joke.address  + '/api/jokes';
        let otherJokesResponse = await fetch(site);
        console.log(otherJokesResponse);
        let otherJokesJSON = await otherJokesResponse.json();
        console.log(otherJokesJSON);
        response.send(otherJokesJSON);

    }
    catch (e) {
        console.error(e.name + ': ' + e.message);
    }    
});

app.post('/api/jokes', async(request, response) => {
    let jokeBody = request.body;
    // console.log(jokeBody);
    
    let joke = { setup: jokeBody.setup, punchline: jokeBody.punchline }
    await Joke.create(joke);
    response.sendStatus(201);
})


//Til testing
async function initTestBesked(setup, punchline) {
    let joke = {
        setup,
        punchline
    };
    let jokeToPrint = await Joke.create(joke);
    console.log(jokeToPrint);
}

console.log("Lytter på port 8080....");

//initTestBesked("Who is there?", "Its me Mario!")