const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PAGE_ACCESS_TOKEN = 'EAAT13Lq8BNIBO7zgrYlqwZBEootFXmXqXo8jWPZBcJng9Un57ZCZCdLX4gno50c3bcXFFNZBPpOxhE9xACpVpwNIaZCyMclyb993aHfJjt2YknrLd0ZCwlelxeLcY7NO9kSx9yi3MbrfZAewGAkiTOVb2ZCN7wHUzQme1DYR0NXSmVOKxUYKlYfnWAZACsrg0zWr1uvFOuvSwoZC3NBeeOKbQZDZD'; // Replace with your Page Access Token
const VERIFY_TOKEN = 'J2L3M54A1S6'; // Replace with your Webhook Verify Token

app.use(bodyParser.json());

// Store users and chat sessions
let usersSearching = []; // List of users looking for a stranger
let activeChats = {};    // Store active chat pairs { userId1: userId2, userId2: userId1 }

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

// Handle incoming messages
function handleMessage(senderId, receivedMessage) {
  let response;

  if (receivedMessage.text) {
    const messageText = receivedMessage.text.toLowerCase();

    if (messageText === '-start') {
      findStranger(senderId);
    } else if (messageText === '-end') {
      endChat(senderId);
    } else {
      relayMessage(senderId, messageText);
    }
  }
}

// Find a stranger for the user
function findStranger(senderId) {
  if (usersSearching.length > 0) {
    // Match with another user
    const strangerId = usersSearching.pop(); // Remove one user from the search list

    // Store the chat pair
    activeChats[senderId] = strangerId;
    activeChats[strangerId] = senderId;

    // Notify both users
    callSendAPI(senderId, { text: "You are now connected to a stranger. Say hi!" });
    callSendAPI(strangerId, { text: "You are now connected to a stranger. Say hi!" });
  } else {
    // No one is available, add the user to the search list
    usersSearching.push(senderId);
    callSendAPI(senderId, { text: "Looking for a stranger to chat with..." });
  }
}

// Relay messages between paired users
function relayMessage(senderId, messageText) {
  const partnerId = activeChats[senderId];

  if (partnerId) {
    // Send the message to the partner
    callSendAPI(partnerId, { text: messageText });
  } else {
    // The user is not in an active chat
    callSendAPI(senderId, { text: "You are not currently in a chat. Type '-start' to find a stranger." });
  }
}

// End the chat between two users
function endChat(senderId) {
  const partnerId = activeChats[senderId];

  if (partnerId) {
    // Notify both users
    callSendAPI(senderId, { text: "You have ended the chat." });
    callSendAPI(partnerId, { text: "The stranger has left the chat." });

    // Remove the chat pair
    delete activeChats[senderId];
    delete activeChats[partnerId];
  } else {
    callSendAPI(senderId, { text: "You are not currently in a chat." });
  }
}

// Send messages using Facebook Graph API
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

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
