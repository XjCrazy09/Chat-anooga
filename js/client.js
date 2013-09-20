/////////////////////////////////////////////////////////////
// Below here is the socket listeners                      //
/////////////////////////////////////////////////////////////
var socket = io.connect('http://chat-anooga.com:80');


// on user join/leave event recieved from server
socket.on('update_user_list', function(data){
	$.each(data, function(index, value)
	{
		$('currentUsers').append('<li>' + value + '</li>'); 
		console.log('On socket update user: ' + value); 
	});	
});

// tired of clicking send
$('#input_message').keyup(function(e){
	if(e.which == 13)
	{
		console.log("Enter button was pressed"); 
		e.preventDefault(); 
	}
});

// on message recieved from server
socket.on('add_message', function(message)
{
	$('#chatbox').append('<p>' + message + '</p>'); 
});


///////////////////////////////////////////////////////////////
// Below here is functions                                   //
///////////////////////////////////////////////////////////////

// emit message to server to have it broadcast back to others
function sendMessage()
{
        socket.emit('send_message', $('#input_message').val() );
        $('#input_message').val('');
        $('#input_message').focus();
}


function signup()
{
	socket.emit('signup', $('#user_name').val(), $('#password').val()); 
	$('#user_name').val('');
	$('#password').val('');
}

function login()
{
	socket.emit('login', $('#user_name').val(), $('#password').val() ); 
	$('#user_name').val('');
	$('#password').val('');
}

