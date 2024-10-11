const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const VERIFY_TOKEN = "09RN12ID20OY";  // The same verify token you provided to Facebook

app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Check if the mode is 'subscribe' and the tokens match
    if (mode && token === VERIFY_TOKEN) {
        // Respond with the challenge token to verify
        res.status(200).send(challenge);
    } else {
        // If the tokens do not match, respond with '403 Forbidden'
        res.sendStatus(403);
    }
});


// Default route for testing
app.get('/', (req, res) => {
    res.send("App is running!");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
