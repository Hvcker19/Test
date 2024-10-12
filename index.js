const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PAGE_ACCESS_TOKEN = 'EAAT13Lq8BNIBO7zgrYlqwZBEootFXmXqXo8jWPZBcJng9Un57ZCZCdLX4gno50c3bcXFFNZBPpOxhE9xACpVpwNIaZCyMclyb993aHfJjt2YknrLd0ZCwlelxeLcY7NO9kSx9yi3MbrfZAewGAkiTOVb2ZCN7wHUzQme1DYR0NXSmVOKxUYKlYfnWAZACsrg0zWr1uvFOuvSwoZC3NBeeOKbQZDZD'; // Replace with your Page Access Token
const VERIFY_TOKEN = 'J2L3M54A1S6'; // Replace with your Webhook Verify Token

app.use(bodyParser.json());

// Webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook Verified');
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Verification failed');
    }
  }
});

// Webhook for messages
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message) {
        handleMessage(senderId, webhookEvent.message);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

function handleMessage(senderId, receivedMessage) {
  let response;

  if (receivedMessage.text) {
    const messageText = receivedMessage.text.toLowerCase();

    if (messageText.includes('hello')) {
      response = { text: 'Hi! How can I help you today?' };
    } else {
      response = { text: "Sorry, I don't understand that command." };
    }
  }

  callSendAPI(senderId, response);
}

function callSendAPI(senderId, response) {
  const requestBody = {
    recipient: {
      id: senderId,
    },
    message: response,
  };

  axios
    .post(`https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, requestBody)
    .then(() => {
      console.log('Message sent successfully');
    })
    .catch((error) => {
      console.error('Error sending message:', error.response ? error.response.data : error.message);
    });
}

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
