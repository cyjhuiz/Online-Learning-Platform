

window.onload = load_forumthread()




async function load_forumthread(){
    document.getElementById("all_forums").innerHTML = `<td colspan="18" style="text-align: center;"><br><br><br><br><br> <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"> <span class="sr-only">Loading...</span> </div><br><br><br><br><br> </td>`
    var url_string = window.location;
    var url = new URL(url_string);
    var classid = url.searchParams.get("classid");
    var classname = url.searchParams.get("classname");
    var courseid = url.searchParams.get("courseid");
    user_name =  localStorage.getItem("username")
    user_ID = localStorage.getItem("user_ID")
    document.getElementById("navbarDropdown1").innerText = user_name; 
    roles = localStorage.getItem("roles")
    console.log(roles)
    document.getElementById("classforum").innerText = "Class Forum  (" + classname + ")";
    specificforumthread = await fetch('https://forum-container-7ii64z76zq-uc.a.run.app/forum_thread?class_ID=' +classid );
    specificforumthread = await specificforumthread.json();
    console.log(specificforumthread)
    specificforumthread = specificforumthread.data.forum_threads
    allclasscourse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class?course_ID=' +courseid );
    allclasscourse = await allclasscourse.json();
    allclasscourse = allclasscourse.data.classes
    console.log(allclasscourse)
    isittrainer = 0
    for(var classdetail in allclasscourse){
        if(allclasscourse[classdetail]['trainer_ID']==user_ID ){
            isittrainer+=1
        }
    }


    if(isittrainer >= 1){
        
        document.getElementById("trainersegment").innerHTML = `<div class="row">
        <div class="col">
            <h5 class="title" style="vertical-align: middle;" id="createthreadtitle">Create New Thread</h5>
        </div>
    </div>
    <div class="row">
        
           
                <div for="section_title" class="col-md-1 ">Thread Title</div>
                    <div class="col-md-11">
                        <input type="text" class="form-control" id="threadtitleinput" placeholder="">
                    </div>
           
    

    </div>
    <br>
    <div class="row">
        <div class="form-group col-xs-12 col-sm-5">
            <button type="button" class="btn btn-primary btn-sm" onclick="validateaddthread()">Add Thread </button>
            <button class="btn btn-secondary btn-sm " type="button" onclick="clearfield()">Clear </button>
          
        </div>
    </div>`


    
    console.log(specificforumthread)
        if(specificforumthread.length == 0){
            document.getElementById("all_forums").innerHTML = `
            <tr><td></td>
           
            <td></td>
            <td></td>
            <td></td>
            <td colspan="9" style="text-align: center;"><br><br><br><br><br>No Forum Threads created yet<br><br><br><br><br>
            </td></tr>`
        
            
        }


        else if(specificforumthread.length > 0){
            str =``
            numbercheck = 0
            deletemodal= ``
            for (var forumdetail in specificforumthread){
                numbercheck+=1
                str+= `
                <tr>
                    <td scope="row" style ="min-width:550px;"  id="threadtitle${numbercheck}"><a href="forumdetail.html?threadid=${specificforumthread[forumdetail]['thread_ID']}&classid=${classid}&classname=${classname}&courseid=${courseid}">${specificforumthread[forumdetail]['thread_title']}</a></td>
                    
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td >${specificforumthread[forumdetail]['num_thread_replies']}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td style="text-align:center;" id ="threadbutton${numbercheck}">
                        <button onclick="renamethread(this.id)" id="${specificforumthread[forumdetail]['thread_title']}_${specificforumthread[forumdetail]['thread_ID']}_${numbercheck}" type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; width:100px;padding:5px;">Rename</button><br>
                        <button id="${specificforumthread[forumdetail]['thread_title']}_${specificforumthread[forumdetail]['thread_ID']}" type="button" class="btn btn-secondary btn-sm btn-block" style="text-align: center; width:100px;padding:5px;" data-toggle="modal" data-target="#deletemodal` + numbercheck + `" >Delete Thread</button>
                    </td>
                </tr>
                
            `;

            deletemodal += `
                <div class="modal fade" id="deletemodal` + numbercheck + `" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" style="z-index: 99999 !important;">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Delete Thread</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        Confirm Delete Forum Thread?  Once Thread is deleted, all the Comment/replies will be removed as well.
                    </div>
                    <div class="modal-footer">
                        <button type="button" onclick="deleteforum(this.id)" id="${specificforumthread[forumdetail]['thread_title']}_${specificforumthread[forumdetail]['thread_ID']}" class="btn btn-success" data-dismiss="modal">Confirm</button>
                        <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>
                    </div>
                    </div>
                </div>
                </div>`
            
            }
            document.getElementById("all_forums").innerHTML = str
            document.getElementById("modalarea1").innerHTML =deletemodal

        }


    }

    else if(isittrainer<= 0){
        if(specificforumthread.length == 0){
            document.getElementById("all_forums").innerHTML = `
            <tr><td></td>
           
            <td></td>
            <td></td>
            <td></td>
            <td colspan="9" style="text-align: center;"><br><br><br><br><br>No Forum Threads created yet<br><br><br><br><br>
            </td></tr>`
        
            
        }
        else if(specificforumthread.length > 0) {
        document.getElementById("trainersegment").innerHTML =``
        document.getElementById("actiontd").innerText =``
        str =``
        numbercheck = 0
        deletemodal= ``
        for (var forumdetail in specificforumthread){
            numbercheck+=1
            str+= `
            <tr>
                <td scope="row" style ="min-width:550px;"  id="threadtitle${numbercheck}"><a href="forumdetail.html?threadid=${specificforumthread[forumdetail]['thread_ID']}&classid=${classid}&classname=${classname}&courseid=${courseid}">${specificforumthread[forumdetail]['thread_title']}</a></td>
                
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td >${specificforumthread[forumdetail]['num_thread_replies']}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                
            </tr>
            
        `;

        
        }
        document.getElementById("all_forums").innerHTML = str

    }
    }




}



async function deleteforum(threadinfo){
    console.log(threadinfo)
    threadinfo= threadinfo.split('_')
    newthreadtitle = threadinfo[0]
    newthreadid = threadinfo[1]
    var url_string = window.location;
    var url = new URL(url_string);
    var classid = url.searchParams.get("classid");
    deletethreadform =
    {thread_title: newthreadtitle,
    class_ID: classid
            }
    response = await fetch("https://forum-container-7ii64z76zq-uc.a.run.app/forum_thread/" + newthreadid, {
    method: "DELETE",
    headers: {
        'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
    },

    body: JSON.stringify(deletethreadform)
    });

    result = await response.json();
    console.log(result)
    if(result.code == 200){
        $("#success_msg").modal();
        setTimeout(function(){  $("#success_msg").modal("hide"); }, 1000);
        load_forumthread();
    }
}

function renamethread(threadinfo){
    console.log(threadinfo)
    threadinfo = threadinfo.split('_')
    threadtitleid = ("threadtitle"+ threadinfo[2] )
    threadbuttonid = ("threadbutton" + threadinfo[2] )
    capturetitle = document.getElementById(threadtitleid).innerHTML
    capturebutton = document.getElementById(threadtitleid).innerHTML
    document.getElementById(threadtitleid).innerHTML = `<input type="text" class="form-control" id="renametitle${threadinfo[2]}" placeholder="" value="${threadinfo[0]}">`
    document.getElementById(threadbuttonid).innerHTML = `<button onclick="updatethreadname(this.id)" id="${threadinfo[1]}_${threadinfo[2]}" type="button" class="btn btn-success btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; width:100px;padding:5px;">Save</button><br>
    <button onclick="load_forumthread()" type="button" class="btn btn-secondary btn-sm btn-block" style="text-align: center; width:100px;padding:5px;" >Cancel</button>`


}


async function updatethreadname(capthreadid){
capthreadid =  capthreadid.split('_')
console.log(document.getElementById("renametitle" + capthreadid[1]).value )
newthreadtitle = document.getElementById("renametitle" + capthreadid[1]).value 
    if(newthreadtitle ==''){
        alert('No empty Thread Title')
    }
    else{
        newthreadtitleform =
        {thread_title: newthreadtitle
                }
    response = await fetch("https://forum-container-7ii64z76zq-uc.a.run.app/forum_thread/" + capthreadid[0], {
        method: "PUT",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        },
    
        body: JSON.stringify(newthreadtitleform)
    });

    result = await response.json();
    console.log(result)

    if(result.code == 200){
        $("#success_msg").modal();
        setTimeout(function(){  $("#success_msg").modal("hide"); }, 2000);
        load_forumthread();
     }
    }
}





function validateaddthread(){
    if(document.getElementById("threadtitleinput").value == ""){
        alert("Please enter a thread title.")
        return false;
    }
    console.log(document.getElementById("threadtitleinput").value )
    createthread();
}



async function createthread(){
threadtitle = document.getElementById("threadtitleinput").value
var url_string = window.location;
var url = new URL(url_string);
var classid = url.searchParams.get("classid");
username = localStorage.getItem("username");
user_ID = localStorage.getItem("user_ID")
newforumdetails =
 {  class_ID: classid,
    thread_title: threadtitle,
    creator_name : username,
    creator_ID : user_ID
        }
response = await fetch("https://forum-container-7ii64z76zq-uc.a.run.app/forum_thread", {
    method: "POST",
    headers: {
        'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
    },
 
    body: JSON.stringify(newforumdetails)
});

 result = await response.json();
 console.log(result)
 if(result.code == 200){
    $("#success_msg").modal();
    setTimeout(function(){  $("#success_msg").modal("hide"); }, 2000);
    document.getElementById("threadtitleinput").value="";
    load_forumthread();
 }

}



function clearfield() {
    document.getElementById("threadtitleinput").value="";
    
  }  