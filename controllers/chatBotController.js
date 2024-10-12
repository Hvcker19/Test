const request = require("request");

const postWebhook = (req, res) => {
    let body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(entry => {
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
};

let getWebhook = (req, res) => {
    console.log("Webhook GET hit");
    let VERIFY_TOKEN = "L3A1W2O0A2R2K2Q95";  // Replace with actual token

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
};


// Handles messaging_postbacks events
const handlePostback = (sender_psid, received_postback) => {
    let response;

    const payload = received_postback.payload;

    if (payload === 'yes') {
        response = { text: "Thanks!" };
    } else if (payload === 'no') {
        response = { text: "Oops, try sending another image." };
    }

    callSendAPI(sender_psid, response);
};

// Sends response messages via the Send API
const callSendAPI = (sender_psid, response) => {
    const request_body = {
        recipient: {
            id: sender_psid
        },
        message: { text: response.text }
    };

    request({
        uri: "https://graph.facebook.com/v7.0/me/messages",
        qs: { access_token: "EAAOYblINcNMBO4o28MSZB48R0mTfmPitBYDP0MjyRzWYCfGSdFqrAIlnDcKt8nEKBaFdya7PhjJtuDMLZBFUQKT0W0jHzRl2jyKx3tclOvX1XVSuxfo0EuC5FcYkEZA0Gu2DzYgsIs20zLWMEkCA2kCEGlO7TuuXYVLoFLZCorz1jnkslUbDFqB79a8VVwgPLAZDZD" },  // Replace with actual token
        method: "POST",
        json: request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!');
        } else {
            console.error("Unable to send message: " + err);
        }
    });
};

// Extract traits for NLP processing
const firstTrait = (nlp, name) => {
    return nlp && nlp.traits && nlp.traits[name] && nlp.traits[name][0];
};

// Handle incoming messages
const handleMessage = (sender_psid, message) => {
    if (message.attachments && message.attachments.length > 0 && message.attachments[0].payload) {
        callSendAPI(sender_psid, { text: "Thank you for watching my video !!!" });
        callSendAPIWithTemplate(sender_psid);
        return;
    }

    const entitiesArr = ["wit$greetings", "wit$thanks", "wit$bye"];
    let entityChosen = "";

    entitiesArr.forEach(name => {
        let entity = firstTrait(message.nlp, name);
        if (entity && entity.confidence > 0.8) {
            entityChosen = name;
        }
    });

    if (entityChosen === "") {
        callSendAPI(sender_psid, { text: "The bot needs more training, try saying 'thanks a lot' or 'hi' to the bot." });
    } else {
        switch (entityChosen) {
            case "wit$greetings":
                callSendAPI(sender_psid, { text: 'Hi there! This bot is created by Hary Pham. Watch more videos on HaryPhamDev Channel!' });
                break;
            case "wit$thanks":
                callSendAPI(sender_psid, { text: "You're welcome!" });
                break;
            case "wit$bye":
                callSendAPI(sender_psid, { text: 'Goodbye!' });
                break;
        }
    }
};

// Send a message template
const callSendAPIWithTemplate = (sender_psid) => {
    const body = {
        recipient: {
            id: sender_psid
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [
                        {
                            title: "Want to build something awesome?",
                            image_url: "https://www.nexmo.com/wp-content/uploads/2018/10/build-bot-messages-api-768x384.png",
                            subtitle: "Watch more videos on my YouTube channel ^^",
                            buttons: [
                                {
                                    type: "web_url",
                                    url: "https://bit.ly/subscribe-haryphamdev",
                                    title: "Watch now"
                                }
                            ]
                        }
                    ]
                }
            }
        }
    };

    request({
        uri: "https://graph.facebook.com/v6.0/me/messages",
        qs: { access_token: "EAAOYblINcNMBO4o28MSZB48R0mTfmPitBYDP0MjyRzWYCfGSdFqrAIlnDcKt8nEKBaFdya7PhjJtuDMLZBFUQKT0W0jHzRl2jyKx3tclOvX1XVSuxfo0EuC5FcYkEZA0Gu2DzYgsIs20zLWMEkCA2kCEGlO7TuuXYVLoFLZCorz1jnkslUbDFqB79a8VVwgPLAZDZD" },  // Replace with actual token
        method: "POST",
        json: body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!');
        } else {
            console.error("Unable to send message: " + err);
        }
    });
};

module.exports = {
    postWebhook,
    getWebhook
};
