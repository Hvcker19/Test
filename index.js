const express = require("express");
const viewEngine = require("./config/viewEngine");
const homepageController = require("./controllers/homepageController");
const chatBotController = require("./controllers/chatBotController");
const bodyParser = require("body-parser");

const app = express();
const router = express.Router();

// Config view engine
viewEngine(app);

// Use body-parser to post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define and initialize web routes
const initWebRoutes = (app) => {
    router.get("/", homepageController.getHomepage);
    router.get("/webhook", chatBotController.getWebhook);
    router.post("/webhook", chatBotController.postWebhook);

    return app.use("/", router);
};

// Initialize web routes
initWebRoutes(app);

// Directly set the port
const port = 8080;

app.listen(port, () => {
    console.log(`App is running at the port ${port}`);
});
