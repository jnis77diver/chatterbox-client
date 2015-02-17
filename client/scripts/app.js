$(document).ready(function(){
  var latestMessageDateIndex;
  //set up init function to execute on load
  var init = function(){ // gets all messages currently found in server
    $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    data: "order=-createdAt",
    //contentType: 'application/json',
    dataType: 'json',
    success: function (data) {
      console.log('This is ',data);
      displayMessages(data);
    },
    error: function (data) {
      console.error(data,' failed');
  }
  });
  };

  var nextMessageDiv = function(nextMessageObj) {
    var $newMessage = $("<div></div>");
    var messageText = "<p>"+nextMessageObj.username+"  "+nextMessageObj.createdAt+"<br>"+nextMessageObj.text+"</p>";
    return $newMessage.html(messageText);
  };

  var newMessageIterator = function(arrayOfData, indexOfLatestMessage) {
    //iterates from beginning of array or from latest message
    //if index of lastestMessageDate, iterate from that index
    //else iterate from the beginning
    //put contents of obj data into a div for future appendage
    var $divHolder = $("<div></div>");
    if( indexOfLatestMessage ) {
      for( var i = indexOfLatestMessage + 1; i < arrayOfData.length; i++ ) {
        var thisMessage = nextMessageDiv(messageObj);
        $divHolder.append(thisMessage);
      }
    } else {
      _.each(arrayOfData,function(messageObj,index){
        var thisMessage = nextMessageDiv(messageObj);
        $divHolder.append(thisMessage);
      });
    }
    return $divHolder;
  };

  //display messages from the ajax call, will display new messages only if
  //there are already existing message
  var displayMessages = function(obj){
    var arrayOfData = obj.results;
    var $divHolder = newMessageIterator(arrayOfData, latestMessageDateIndex);
    var divHolderContents = $divHolder.html();
    $('.message_display').append(divHolderContents);
    debugger;
    latestMessageDateIndex = arrayOfData.length - 1;
  };



  //setting up functionality for submitting a message

  //button to update messages
  // display new messages


  var submitMessage = function(){
    //Get the contents of text in message
    //validate or escape characters
    //get current date, user and room name, encode into a message object
    //
    var userMessage = $('#message').val();
    var message = {
      'username': 'Jonah',
      'text': userMessage,
      'roomName': 'HRR4 Lounge'
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

  $('.update').on('click',function(){
    init();
  });

  $('.submit').on('click',function(){
    submitMessage();
    displayMessages();
  });

  init();
});

