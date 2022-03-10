


window.onload = load_message()




async function load_message(){
    
    var url_string = window.location;
    var url = new URL(url_string);
    var classname = url.searchParams.get("classname");
    var coursename = url.searchParams.get("coursename");
    var classid = url.searchParams.get("classid");
    var otheruserid = url.searchParams.get("otheruserid");
    
    //console.log(classname,coursename,classid,otheruserid)
    user_name =  localStorage.getItem("username")
    user_ID = localStorage.getItem("user_ID")
    document.getElementById("navbarDropdown1").innerText = user_name; 
    var element = document.getElementById("chat_messages");
    element.scrollTop = element.scrollHeight;
    selecteduser = await fetch('https://user-container-7ii64z76zq-uc.a.run.app/user/' + otheruserid);
    selecteduser = await selecteduser.json();
    selecteduser = selecteduser.data.user
    otherusername = selecteduser['name']
    
   
    document.getElementById("courseclassinfo").innerHTML = classname + " - " + coursename + ", You are Chatting with : " + otherusername

    chatmessages = await fetch('https://chat-container-7ii64z76zq-uc.a.run.app/chat/messages?sender_ID=' + user_ID + '&class_ID=' + classid + '&recipient_ID=' + otheruserid );
    chatmessages = await chatmessages.json();
    
    chatmessages =chatmessages.data.messages
    chatmessages = chatmessages.reverse()
    console.log(chatmessages.length)
    //chatmessages.sort(function(a,b){ return new Date(a.timestamp) - new Date(b.timestamp); });
    
    allmssg = ''

    //offsettime = new Date(chatmessages[0]['time_stamp']).getTimezoneOffset();
    //currenttime =  new Date(chatmessages[0]['time_stamp']) + offsettime
    //console.log(currenttime)
    if(chatmessages.length !=0){
    for(var messagedetail in chatmessages){
        //if past message sender is me
       
        currenttime =  new Date(chatmessages[messagedetail]['time_stamp']) 
        currenttime = currenttime.toString().slice(0,-31)
        if(chatmessages[messagedetail]['sender_ID'] ==user_ID ){
            if(chatmessages[messagedetail]['view_status']== 0 ){
            allmssg += `  <div class="chatcontainer user" id="usermsg"><img src="Images/blueprofile.png" alt="Avatar" class="right"><p><b id='selfname'>`+ user_name +`</b></p><p style = "font-size:18px;">` 
            + chatmessages[messagedetail]['message'] + `</p><span class="time-left">` + currenttime + `</span>` + `<span id="msgstatus" class="time-right" >sent ,unread</span>`  + `</div>` }

            else if(chatmessages[messagedetail]['view_status']== 1){
                allmssg += `  <div class="chatcontainer user" id="usermsg"><img src="Images/blueprofile.png" alt="Avatar" class="right"><p><b id='selfname'>`+ user_name +`</b></p><p style = "font-size:18px;">` 
                + chatmessages[messagedetail]['message'] + `</p><span class="time-left">` + currenttime + `</span>` + `<span id="msgstatus" class="time-right" >sent ,read</span>`  + `</div>`
            }
        }

        else if (chatmessages[messagedetail]['sender_ID'] == otheruserid ){
            allmssg += `  <div class="chatcontainer" id="usermsg"><img class="time-left" src="Images/blackprofile.png" alt="Avatar"><p><b id='selfname'>`+ otherusername +`</b></p><p style = "font-size:18px;">` 
            + chatmessages[messagedetail]['message'] + `</p><span class="time-right" >` + currenttime + `</span>`    + `</div>`
            }
        
       


        }


        document.getElementById("chat_messages").innerHTML =allmssg
        var element = document.getElementById("chat_messages");
        element.scrollTop = element.scrollHeight;
    
    for(var updatemessage in chatmessages){ 
        if(chatmessages[updatemessage]['recipient_ID']==user_ID ){
            updatemessagedetail= {
                sender_ID:otheruserid,
                recipient_ID:user_ID,
                class_ID:classid
            }
            
            
            response = await fetch("https://chat-container-7ii64z76zq-uc.a.run.app/chat/messages", {
                    method: "PUT",
                    headers: {
                        'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
                    },
                 
                    body: JSON.stringify(updatemessagedetail)
                });
                
                 result = await response.json();
                 console.log(result)
             ;
        }


        }
    
    }

    else if(chatmessages.length == 0){
        document.getElementById("chat_messages").innerHTML = '<img style = "width: 100%; max-height: 100%; display: block; margin-left: auto; margin-right: auto; width: 50%;" src="Images/nomessage.png" alt="Avatar">'
    }
    
    refreshIntervalId = window.setInterval(load_message, 10000);

}








async function send(){
    clearInterval(refreshIntervalId);
    load_message();
    currentdate = new Date().toString();
    currentdate= currentdate.slice(0,-31)
    console.log(currentdate.slice(0,-31))
    var url_string = window.location;
    var url = new URL(url_string);
    var otheruserid = url.searchParams.get("otheruserid");
    var classid = url.searchParams.get("classid");
    user_name =  localStorage.getItem("username")
    chatmssg = document.getElementById("messagecontent").value
    console.log(chatmssg)
    user_ID = localStorage.getItem("user_ID")
    selfnameget =user_name
   

    newmessage= {
        sender_ID:user_ID,
        recipient_ID:otheruserid,
        class_ID:classid,
        message:chatmssg
    }
    
    
    response = await fetch("https://chat-container-7ii64z76zq-uc.a.run.app/chat/messages", {
            method: "POST",
            headers: {
                'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
            },
         
            body: JSON.stringify(newmessage)
        });
        
         result = await response.json();
         console.log(result)
     ;


    if(result.code == 200) {

    //var myobj = document.getElementById("nomessage");
    //myobj.remove();
   
    chatuserbox = `  <div class="chatcontainer user" id="usermsg"><img src="Images/blueprofile.png" alt="Avatar" class="right"><p><b id='selfname'>`+ selfnameget +`</b></p><p style = "font-size:18px;">` 
    + chatmssg + `</p><span class="time-left" id="time-left">` + currentdate + `</span>` + `<span class="time-right" >sent, unread</span>`  + `</div>`
    if(document.getElementById("chat_messages").innerHTML.toString().slice(1,4) == "img") {
        document.getElementById("chat_messages").innerHTML =chatuserbox
    }

    else
    {
    document.getElementById("chat_messages").innerHTML +=chatuserbox }
    
    var element = document.getElementById("chat_messages");
    element.scrollTop = element.scrollHeight;
    document.getElementById("messagecontent").value = ''
    }
    load_message()
}