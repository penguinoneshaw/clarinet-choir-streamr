var fs = require('fs');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var concert_file = process.argv[2]

concert = JSON.parse(fs.readFileSync(concert_file, "utf8"));
console.log("This is the file for: " +  concert.concert + " being held at " + concert.venue + ".")
concert.nowplaying = "preroll";


app.get('/', function(req, res){
  res.sendFile(__dirname + "/index.html");
});

app.get('/omnibar', function(req, res){
  res.sendFile(__dirname + "/omnibar.html")
});

app.use(express.static('public'))

io.on('connection', function(socket){
  console.log("A page connected")
  socket.emit('concert-details', concert)


  socket.on('nowplaying-update', function (num) {
    socket.broadcast.emit('nowplaying-update', num)
    concert.nowplaying = num;
  })


  socket.on('disconnect', function(){
    console.log('page disconnected');
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});
