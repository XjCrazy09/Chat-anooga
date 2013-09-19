var socket = io.connect('http://localhost:80');

// on user join/leave event recieved from server
socket.on('updateUsers', function(data) {

});

// message recieved from server, append to chatbox
socket.on('messageOutput', function(message){
        alert('message is going out!');
});



function checkUser() {
        socket.emit('login', $('#user_name').val() );
        console.log('user: ' + $('#user_name').val() );
}

function sendMessage() {
        alert("sending a Message to all users");
}

function recieveMessage() {
        alert("receiving a message from the server");
}