const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const VERIFY_TOKEN = "09RN12ID20OY";  // The same verify token you provided to Facebook

app.get('/webhook', (req, res) => {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        // Send the challenge back to Facebook
        res.status(200).send(challenge);
    } else {
        // Respond with a 403 Forbidden if verification fails
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
