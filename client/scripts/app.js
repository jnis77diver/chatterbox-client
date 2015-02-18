$(document).ready(function(){
  var latestMessageDate; //remove this
  var currentRoom = "main room";
  var roomHolder = {};
  var userObj = {
    username:'',
    friends: {}
  };
  //set up init function to execute on load
  var init = function(latestDate,roomName,user){ // gets all messages currently found in server
    if( !userObj.username ){
      var temp = prompt('Select a username');
      userObj.username = sanitize(temp);
      $('.this-user').text(userObj.username);
    }
    var dataOptions = {
      order:'-createdAt',
      // where: { createdAt:{ $gte :{"__type":"Date","iso":"2015-02-17T20:06:47.133Z"}}}
    };
    if( latestDate ) {
      console.log('latestDate is',latestDate);
      dataOptions.where = {createdAt:{$gt:{"__type":"Date","iso":""+ latestDate +""}}};
    }
    if ( roomName ){
      dataOptions.where.roomname = {"$in": [sanitize(roomName)]};
    }
    console.log("dataOptions is ", dataOptions);
    $.ajax({
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'GET',
      data: dataOptions,
      //contentType: 'application/json',
      dataType: 'json',
      success: function (data) {
        console.log('This is ',data);
        displayMessagesAndRooms(data);
        //set rooms
      },
      error: function (data) {
        console.error(data,' failed');
      }
    });
  };

  var sanitize = function(str) {
    if( str === undefined ) { return ""; }
    var mapObj = {
       '&':'&amp;',
       '<':'&lt;',
       '>':'&gt;',
       '"':'&quot;',
       "'":'&#x27;',
       '/':'&#x2F;'
    };
    str = str.replace(/[&<>"'\/]/g, function(matched){
      return mapObj[matched];
    });
    return str;
  };

  var nextMessageDiv = function(nextMessageObj) {
    var $newMessage = $("<div></div>");
    var sanitizedUsername = sanitize(nextMessageObj.username);
    var sanitizedText = sanitize(nextMessageObj.text);
    var messageText = "<p><span class='message-user'>"+sanitizedUsername+"</span>" +  "   <span class='message-date'>" +nextMessageObj.createdAt+"</span><br><span class='message-text'>" + sanitizedText +"</span></p>";
    var parsedMessage = $.parseHTML(messageText);
    return $newMessage.html(parsedMessage);
  };

  var newMessageIterator = function(arrayOfData) {
    //iterates from end of array to get newest messages
    //put contents of obj data into a div for future appendage
    var $divHolder = $("<div></div>");
      arrayOfData = arrayOfData.reverse();
      _.each(arrayOfData,function(messageObj,index){
        var thisMessage = nextMessageDiv(messageObj);
        $divHolder.append(thisMessage);
        //add new rooms to roomHolder
        var thisRoom = messageObj.roomname;
        if( !roomHolder[thisRoom] && thisRoom !== undefined && thisRoom.length > 0 ) {
          roomHolder[thisRoom] = thisRoom;
          var newOption = $('<option></option');
          $(newOption).attr('name', thisRoom).val(thisRoom).text(thisRoom);
          $('.room-select').append(newOption);
        }
      });
    return $divHolder;
  };

  //display messages from the ajax call, will display new messages only if
  //there are already existing message
  var displayMessagesAndRooms = function(obj){
    var arrayOfData = obj.results;
    var length = arrayOfData.length;
    var $divHolder = newMessageIterator(arrayOfData);
    var divHolderContents = $divHolder.html();
    $('.message_display').append(divHolderContents);
    latestMessageDate = arrayOfData[0].createdAt;
  };



  //setting up functionality for submitting a message

  //button to update messages
  // display new messages


  var submitMessage = function(){
    //Get the contents of text in message
    //validate or escape characters
    //get current date, user and room name, encode into a message object
    //
    var userMessage = sanitize($('#message').val());
    var message = {
      'username': userObj.username,
      'text': userMessage,
      'roomname': 'HRR4 Lounge',
      'friend': 'Jorge'
    };
    $.ajax({
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('Submit is ',data);
      },
      error: function (data) {
        console.error(data,' failed');
      }
    });
  };

  var selectRoom = function(roomName) {
    //display messages for roomname only with ajax call
    //
    //set currentRoom to roomname
    init(latestMessageDate,roomName);
    currentRoom = roomName;
  };

  var createRoom = function(roomName){
    //add option to drop-down menu for newly created room and display
    //display messages for that room only
    //call selectRoom
  };

  $('.update').on('click',function(){
    console.log("got here");
    init(latestMessageDate);
  });

  $('.submit').on('click',function(){
    submitMessage();
    init(latestMessageDate);
  });

  $('.room-select').change(function(){
    var selected = $('.room-select').find(":selected").text();
    console.log('selected is',selected);
     $('.message_display').html('');
    selectRoom(selected);
  });

  init();
});

// friend property stores objects
// click a username
// popup/dropdown menu appears, asks "Add friend?"
// if "yes" is clicked post to server:
//  ajax call, adds clicked username to object pointed to by friend property
//
