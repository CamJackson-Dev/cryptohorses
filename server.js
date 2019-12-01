const http = require("http");
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
const dbConfig = require("./config/config.js");
const mongoose = require("mongoose");
const socketIO = require("socket.io");
var cron = require('node-cron'); 
const { Users } = require("./utils/users");
var users = new Users();

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var session = require("express-session");
var cookieParser = require("cookie-parser");

const { location1 } = require("./utils/watch_for_betEvents_location1");
const { distributeDividend } = require("./utils/distributeDividend");
// require("./utils/place_dummy_bet");

var i18n = require("i18n");

/// ejs for header footer include

var ejs = require("ejs");
ejs.open = "{{";
ejs.close = "}}";
app.engine("html", require("ejs").renderFile);

// using cookie and session

app.use(cookieParser());

app.use(
  session({
    secret: "This is top secret session key session key of my website",
    saveUninitialized: false,
    resave: false
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("views", path.join(__dirname + "/html"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/html"));
app.use(bodyParser.json());

i18n.configure({
  locales: ["en", "ru", "de", "zh-CN", "fr", "kr", "es", "po"],
  cookie: "language",
  defaultLocale: 'en',
  directory: __dirname + "/locales"
});

app.use(i18n.init);

// Connecting to the database
mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch(err => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
  });

// controller router file ...

app.use("/", require("./controller/restapi/router"));

// Require Main House routes
require("./app/routes/mainhouse.routes.js")(app);

// Require Individual Player routes
require("./app/routes/individualplayer.routes")(app);

// Require Location 1 Bets routes
require("./app/routes/location1bets.routes")(app);

// Require Chat routes
require("./app/routes/chat.routes")(app);

const Chat = require("./app/models/chat.model");
const IndividualPlayer = require("./app/models/individualplayer.model");

// Socket code
io.on("connection", socket => {
  // console.log("New user connected");

  socket.on("join", (data, callback) => {
    socket.join(data.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, data.username, data.room, data.address);

    socket.emit("getMessage", { address: data.address });
  });

  socket.on("signChat", async (data, callback) => {
    console.log(data)
    try {
      await IndividualPlayer.findOneAndUpdate(
        {
          playerAddress: data.userAddress
        },
        { signChat: data.sign },
        { new: true }
      );
      
    } catch (error) {
      console.log(error)
    }
    callback();
  })

  socket.on("createMessage", async (data, callback) => {
    var user = users.getUser(socket.id);
    if (user) {
      try {

          let chat = new Chat({
            userAddress: data.userAddress,
            userName: data.userName,
            level: data.level,
            message: data.message,
            room: data.room
          });
      
          chat = await chat.save();

          io.to(data.room).emit("newMessage", {
            userName: data.userName,
            message: data.message,
            level: data.level
          });
    
      } catch (error) {
        console.log(error)
      }
    }
    callback();
  });

  socket.on("disconnect", () => {
    // console.log("disconnected");
  });
});

location1();

cron.schedule('0 1 * * *', () => {
  console.log('Runing a job at 01:00 AM daily at Europe/London timezone');
  distributeDividend()
}, {
  scheduled: true,
  timezone: "Europe/London"
});

// creating server

var server = server.listen(process.env.PORT || 6001, function() {
  console.log("Listening locally on port %d", server.address().port);

  var adr = "http://localhost:" + server.address().port;
  console.log("Browser Addr", adr);
});
 