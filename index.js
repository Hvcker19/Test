const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const VERIFY_TOKEN = "09RN12ID20OY";  // Replace this with your token

// Webhook route
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
        // Respond with the challenge token from the request
        res.status(200).send(challenge);
    } else {
        // Respond with '403 Forbidden' if verify tokens do not match
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
