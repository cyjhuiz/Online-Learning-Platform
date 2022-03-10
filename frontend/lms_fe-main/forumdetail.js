window.onload = load_forumpost()




async function load_forumpost(){
    document.getElementById("all_post").innerHTML = `<td colspan="18" style="text-align: center;"><br><br><br><br><br> <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"> <span class="sr-only">Loading...</span> </div><br><br><br><br><br> </td>`

    var url_string = window.location;
    var url = new URL(url_string);
    var classid = url.searchParams.get("classid");
    var threadid = url.searchParams.get("threadid");
    var classname = url.searchParams.get("classname");
    var courseid = url.searchParams.get("courseid");
    document.getElementById("classforum").innerText = "Class Forum  (" + classname + ")";
    document.getElementById("createpost").innerHTML = `<button type="button" class="btn btn-success"  data-toggle="modal" data-target="#newpostmodal">Write a Post</button>`

    document.getElementById("modalareapost").innerHTML = ` <div class="modal fade" id="newpostmodal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" >
    <div class="modal-dialog" role="document">
        <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Write new Post</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="modal-body">
           
            
                    <div class="form-group row">
                        <label for="section_title" class="col-sm-4 col-form-label">Post</label>
                            <div class="col-sm-8">
                                <textarea type="text" class="form-control" id="newpost" placeholder=""> </textarea>
                            </div>
                    </div>
            
        </div>
        <div class="modal-footer">
            <button type="button" data-toggle="modal" id="" class="btn btn-success" data-dismiss="modal" onclick="createnewpost();">Confirm</button>
            <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>
        </div>
        </div>
    </div>
    </div>`


    user_name =  localStorage.getItem("username")
    user_ID = localStorage.getItem("user_ID")
    document.getElementById("navbarDropdown1").innerText = user_name; 
    roles = localStorage.getItem("roles")
    specificforum = await fetch('https://forum-container-7ii64z76zq-uc.a.run.app/forum_thread/' +threadid );
    specificforum = await specificforum.json();
    specificforum = specificforum.data.forum_thread
    console.log(specificforum)

    classdetail = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class?class_ID=' +classid );

    
    classdetail = await classdetail.json();
    classdetail = classdetail.data.class
    trainername = classdetail.trainer_info['trainer_name']
    document.getElementById("forumtitle").innerText = specificforum['thread_title']
    document.getElementById("createdby").innerText = "Thread Created on " +specificforum['thread_date'] + " by Trainer " +  trainername
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
    

    
        allpost = await fetch('https://forum-container-7ii64z76zq-uc.a.run.app/forum_thread/' + threadid +'/post'  );
        allpost = await allpost.json();
        allpost = allpost.data.posts
        console.log(allpost)
        str=''
        deletemodal = ''
        replynumberchecker = 0
        deletereplymodal =''
        if (allpost.length == 0){
            document.getElementById("all_post").innerHTML = `
            <tr>
            <td colspan="9" style="text-align: center;"><br><br><br><br><br>No Forum Posts created yet<br><br><br><br><br>
            </td></tr>`
        }

        else if(allpost.length >=1){
            postno = 0
            numbercheck=0

            for(var postinfo in allpost){
                postno+=1
                numbercheck+=1
                deletepostbutton = ''
                if(isittrainer>=1 | allpost[postinfo]['creator_ID'] == user_ID){
                    deletepostbutton = `<button type='button' class='btn btn-secondary' data-toggle="modal" data-target="#deletemodal` + numbercheck + `" >Delete Post </button>`
                }

                

                if(allpost[postinfo]['post_likes'].includes(parseInt(user_ID))==false){
                str+=`<tr>
                <td scope="row" style="width:auto;" >${postno} <br><br><br><br><br><br><br></td>
                <td style="width:100%;" id="targetpost${numbercheck}"><b>${allpost[postinfo]['creator_name']}</b> (${allpost[postinfo]['post_date']}) <br> ${allpost[postinfo]['post_content']}  
                <br><br><span id="likebutton${numbercheck}"> <button type='button' class='btn btn-info' onclick='likepost(this.id);' id="${numbercheck}?${allpost[postinfo]['post_ID']}?${allpost[postinfo]['num_post_likes']}"><i class="bi bi-hand-thumbs-up"></i> Helpful <span id="likecount${numbercheck}">(${allpost[postinfo]['num_post_likes']})</span></button> 
                </span>${deletepostbutton}
                
                `}

                else if (allpost[postinfo]['post_likes'].includes(parseInt(user_ID))==true){
                    str+=`<tr>
                <td scope="row" style="width:auto;" >${postno} <br><br><br><br><br><br><br></td>
                <td style="width:100%;" id="targetpost${numbercheck}" ><b>${allpost[postinfo]['creator_name']}</b> (${allpost[postinfo]['post_date']}) <br> ${allpost[postinfo]['post_content']}  
                <br><br><span id="likebutton${numbercheck}"> <button type='button' class='btn btn-info' onclick='removelike(this.id);' id="${numbercheck}?${allpost[postinfo]['post_ID']}?${allpost[postinfo]['num_post_likes']}"> You found this post helpful,  <i class="bi bi-hand-thumbs-up-fill"></i> <span id="likecount${numbercheck}">(${allpost[postinfo]['num_post_likes']})</span></button> 
                </span>${deletepostbutton}
                
                `
                }

                if(allpost[postinfo]['replies'].length == 0){
                    str+=`<br><br><a class="btn btn-light" data-toggle="collapse" href="#multiCollapseExample${numbercheck}" role="button" aria-expanded="false" aria-controls="multiCollapseExample${numbercheck}">Reply <i class="bi bi-reply"></i></a>
                    <div class="row">
                        <div class="col">
                        <div class="collapse multi-collapse" id="multiCollapseExample${numbercheck}">
                            <div class="card card-body">
                            <input type="text" class="form-control" id="replycontent${numbercheck}" placeholder="Please enter your reply..."> <br><button type="button" class="btn btn-primary btn-sm btn-block"  style="text-align: center; width:100px;padding:5px;" id ="${numbercheck}?${allpost[postinfo]['post_ID']}?${allpost[postinfo]['thread_ID']}" onclick="sendreply(this.id)">Send Reply </button>
                            </div>
                        </div>
                        </div>
                    </div></td></tr>`
                    
                }

                else{
                    replystr = ''
                    
                    
                    for(var eachreply in allpost[postinfo]['replies']){
                        replynumberchecker+=1
                        deletepostreplybutton = ''

                        if(isittrainer>=1 | allpost[postinfo]['replies'][eachreply]['creator_ID'] == user_ID){
                            deletepostreplybutton = `<button style="width: 110px !important;" type='button' class='btn btn-secondary btn-sm' data-toggle="modal" data-target="#deletereplymodal` + replynumberchecker + `" >Delete Post </button>`
                        }

                        if(allpost[postinfo]['replies'][eachreply]['reply_likes'].includes(parseInt(user_ID))==false) {
                            replystr += `<div class="collapse multi-collapse show" id="multiCollapseExample${numbercheck}">
                            <div class="card card-body" style="border: 0.5px; border-style: solid; border-color:#F8F8F8; background-color:#F0F0F0; border-radius: 0px;">
                            <div><b>${allpost[postinfo]['replies'][eachreply]['creator_name']}</b> (${allpost[postinfo]['replies'][eachreply]['reply_date']}) </div>${allpost[postinfo]['replies'][eachreply]['reply_content']} <br><br>
                            <div><span id="replylikebutton${replynumberchecker}"><button type='button' class='btn btn-info btn-sm' onclick='likereplypost(this.id);' id="${replynumberchecker}?${allpost[postinfo]['replies'][eachreply]['reply_ID']}?${allpost[postinfo]['replies'][eachreply]['post_ID']}?${allpost[postinfo]['replies'][eachreply]['num_reply_likes']}"><i class="bi bi-hand-thumbs-up"></i> Helpful <span id="likereplycount${replynumberchecker}">(${allpost[postinfo]['replies'][eachreply]['num_reply_likes']})</span></button> 
                            </span>${deletepostreplybutton}</div>
                            </div>
                            </div>`}
                        else if(allpost[postinfo]['replies'][eachreply]['reply_likes'].includes(parseInt(user_ID))==true){
                            replystr += `<div class="collapse multi-collapse show" id="multiCollapseExample${numbercheck}">
                            <div class="card card-body" style="border: 0.5px; border-style: solid; border-color:#F8F8F8; background-color:#F0F0F0; border-radius: 0px;">
                            <div><b>${allpost[postinfo]['replies'][eachreply]['creator_name']}</b> (${allpost[postinfo]['replies'][eachreply]['reply_date']}) </div>${allpost[postinfo]['replies'][eachreply]['reply_content']} <br><br>
                            <div><span id="replylikebutton${replynumberchecker}"><button type='button' class='btn btn-info btn-sm' onclick='removelikereplypost(this.id);' id="${replynumberchecker}?${allpost[postinfo]['replies'][eachreply]['reply_ID']}?${allpost[postinfo]['replies'][eachreply]['post_ID']}?${allpost[postinfo]['replies'][eachreply]['num_reply_likes']}">You found this post helpful, <i class="bi bi-hand-thumbs-up-fill"></i><span id="likereplycount${replynumberchecker}">(${allpost[postinfo]['replies'][eachreply]['num_reply_likes']})</span></button> 
                            </span>${deletepostreplybutton}</div>
                            </div>
                            </div>`

                        }
                        //allpost[postinfo]['replies'][eachreply]['reply_content']

                        deletereplymodal += `
                            <div class="modal fade" id="deletereplymodal` + replynumberchecker + `" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" style="z-index: 99999 !important;">
                            <div class="modal-dialog" role="document">
                                <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="exampleModalLabel">Delete Reply Post</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    Confirm Delete Reply Post? 
                                </div>
                                <div class="modal-footer">
                                    <button type="button" onclick="deletereplypost(this.id)" id="${allpost[postinfo]['replies'][eachreply]['post_ID']}?${allpost[postinfo]['replies'][eachreply]['reply_ID']}?${allpost[postinfo]['replies'][eachreply]['reply_content']}" class="btn btn-success" data-dismiss="modal">Confirm</button>
                                    <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>
                                </div>
                                </div>
                            </div>
                            </div>` 
                    }

                    str+=`<br><br><a class="btn btn-light" data-toggle="collapse" href="#multiCollapseExample${numbercheck}" role="button" aria-expanded="true" aria-controls="multiCollapseExample${numbercheck}">Collapse All <i class="bi bi-arrows-angle-expand"></i></a>
                    <div class="row">
                        <div class="col" style="border: 0.5px; border-style: solid; border-color:#E0E0E0; border-radius: 10px;">
                        ${replystr}
                        
                        <div class="collapse multi-collapse show" id="multiCollapseExample${numbercheck}">
                            <div class="card card-body" style="border: 0.5px; border-style: solid; border-color:#F8F8F8; background-color:#F0F0F0; border-radius: 0px;">
                            <a class="btn btn-light" style="width: 78px !important;" data-toggle="collapse" href="#replyinput${numbercheck}" role="button" aria-expanded="false" aria-controls="multiCollapseExample${numbercheck}">Reply <i class="bi bi-reply"></i></a>
                            </div>
                        </div>
                        <div class="collapse multi-collapse" id="replyinput${numbercheck}">
                            <div class="card card-body " style="border: 0.5px; border-style: solid; border-color:#F8F8F8; background-color:#F0F0F0; border-radius: 0px;">
                            <input type="text" class="form-control" id="replycontent${numbercheck}" placeholder="Please enter your reply..."> <br><button type="button" class="btn btn-primary btn-sm btn-block"  style="text-align: center; width:100px;padding:5px;" id ="${numbercheck}?${allpost[postinfo]['post_ID']}?${allpost[postinfo]['thread_ID']}" onclick="sendreply(this.id)">Send Reply </button>
                            </div>
                        </div>
                    </div>
                    </div></td></tr>`


                     

                document.getElementById("deletereplypostmodal").innerHTML = deletereplymodal
                }

                deletemodal += `
                <div class="modal fade" id="deletemodal` + numbercheck + `" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" style="z-index: 99999 !important;">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Delete Post</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        Confirm Delete Post?  Once Post is deleted, all the related Replies will be removed as well.
                    </div>
                    <div class="modal-footer">
                        <button type="button" onclick="deletepost(this.id)" id="${allpost[postinfo]['thread_ID']}?${allpost[postinfo]['post_ID']}" class="btn btn-success" data-dismiss="modal">Confirm</button>
                        <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>
                    </div>
                    </div>
                </div>
                </div>`    



            }
            document.getElementById("all_post").innerHTML = str
            document.getElementById("deletepostmodal").innerHTML = deletemodal

        }

}

async function likereplypost(likereplyinfo){
    console.log(likereplyinfo)
    likereplyinfo = likereplyinfo.split('?')
    likereplyinfobuttonid = likereplyinfo[0]
    replylikeid = likereplyinfo[1]
    replypostlikeid = likereplyinfo[2]
    numreplylikes = parseInt(likereplyinfo[3])
    var url_string = window.location;
    var url = new URL(url_string);
    var threadid = url.searchParams.get("threadid");
    user_ID = localStorage.getItem("user_ID")
    replypostlikedetail =
    { user_ID: user_ID
            }
    response = await fetch("https://forum-container-7ii64z76zq-uc.a.run.app/forum_thread/" + threadid  + "/post/" + replypostlikeid + "/reply/" + replylikeid + "/reply_like", {
        method: "POST",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        },
    
        body: JSON.stringify(replypostlikedetail)
    });
    result = await response.json();
    console.log(result)
    if(result.code == 200){
        
        numreplylikes+=1
        document.getElementById('replylikebutton' + likereplyinfobuttonid).innerHTML = `<button type='button' class='btn btn-info btn-sm' onclick='removelikereplypost(this.id);' id="${likereplyinfobuttonid}?${replylikeid}?${replypostlikeid}?${numreplylikes}"> You found this post helpful, <i class="bi bi-hand-thumbs-up-fill"></i><span id="likereplycount${likereplyinfobuttonid}"> (${numreplylikes})</span></button> `
        
    }
    else {
        alert(result.message)
    }

}

async function removelikereplypost(removelikereplyinfo){
    console.log(removelikereplyinfo)
    removelikereplyinfo = removelikereplyinfo.split('?')
    likereplyinfobuttonid = removelikereplyinfo[0]
    replylikeid = removelikereplyinfo[1]
    replypostlikeid = removelikereplyinfo[2]
    numreplylikes = parseInt(removelikereplyinfo[3])
    var url_string = window.location;
    var url = new URL(url_string);
    var threadid = url.searchParams.get("threadid");
    user_ID = localStorage.getItem("user_ID")
    response = await fetch("https://forum-container-7ii64z76zq-uc.a.run.app/forum_thread/" + threadid  + "/post/" + replypostlikeid + "/reply/" + replylikeid + "/reply_like?user_ID=" + user_ID, {
        method: "DELETE",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        }
    });

    result = await response.json();
    console.log(result)
    if(result.code == 200){
        
        numreplylikes-=1
        document.getElementById('replylikebutton' + likereplyinfobuttonid).innerHTML = `<button type='button' class='btn btn-info btn-sm' onclick='likereplypost(this.id);' id="${likereplyinfobuttonid}?${replylikeid}?${replypostlikeid}?${numreplylikes}"><i class="bi bi-hand-thumbs-up-fill"></i>Helpful <span id="likereplycount${likereplyinfobuttonid}"> (${numreplylikes})</span></button> `
        
    }
    else{
        alert(result.message)
    }

}


async function deletereplypost(deletereplyinfo){
    var url_string = window.location;
    var url = new URL(url_string);
    var threadid = url.searchParams.get("threadid");
    console.log(deletereplyinfo)
    user_ID = localStorage.getItem("user_ID")
    deletereplyinfo = deletereplyinfo.split('?')
    deletereplypostid = deletereplyinfo[0]
    deletereplyreplyid = deletereplyinfo[1]
    deletereplycontent = deletereplyinfo[2]
    deletereplypostdetail =
    { user_ID: user_ID,
      reply_content: deletereplycontent
            }
    response = await fetch("https://forum-container-7ii64z76zq-uc.a.run.app/forum_thread/" + threadid + "/post/" + deletereplypostid + "/reply/" + deletereplyreplyid, {
        method: "DELETE",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        },
    
        body: JSON.stringify(deletereplypostdetail)
    });

    result = await response.json();
    console.log(result)
    if(result.code == 200){
        $("#success_msg").modal();
        setTimeout(function(){  $("#success_msg").modal("hide"); }, 2000);
        load_forumpost();
    }
    else{
        alert(result.message)
    }

}


async function sendreply(sendinfo){
    sendinfo = sendinfo.split('?')
    sendinfoid = sendinfo[0]
    sendinfopostid = sendinfo[1]
    sendinfothreadid = sendinfo[2]
    user_ID = localStorage.getItem("user_ID")
    username = localStorage.getItem("username");
    replycontentinfo = document.getElementById("replycontent" + sendinfoid).value
    console.log(replycontentinfo)
    replypostdetail =
    { creator_ID: user_ID,
      reply_content: replycontentinfo,
      creator_name : username
            }
    response = await fetch("https://forum-container-7ii64z76zq-uc.a.run.app/forum_thread/ " + sendinfothreadid  + "/post/"+ sendinfopostid +"/reply", {
        method: "POST",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        },
    
        body: JSON.stringify(replypostdetail)
    });

    result = await response.json();
    console.log(result)
    if(result.code == 200){
        $("#success_msg").modal();
        setTimeout(function(){  $("#success_msg").modal("hide"); }, 2000);
        load_forumpost();
    }
    else{
        alert(result.message)
    }
}


async function deletepost(deleteinfo){
    deleteinfo = deleteinfo.split('?')
    deletethreadid = deleteinfo[0]
    deletepostid = deleteinfo[1]
            response = await fetch("https://forum-container-7ii64z76zq-uc.a.run.app/forum_thread/" + deletethreadid  +"/post/"+deletepostid , {
                method: "DELETE",
                headers: {
                    'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
                }
            });

            result = await response.json();
            console.log(result)
            if(result.code ==200){
                $("#success_msg").modal();
                setTimeout(function(){  $("#success_msg").modal("hide"); }, 2000);
                load_forumpost();
            }
            else{
                alert(result.message)
            }
}



async function removelike(likeinfo){
    likeinfo = likeinfo.split('?')
    likebuttonid = likeinfo[0]
    likepostid = likeinfo[1]
    user_ID = localStorage.getItem("user_ID")
    numberlike = parseInt(likeinfo[2])
    var url_string = window.location;
    var url = new URL(url_string);
    var threadid = url.searchParams.get("threadid");
    
            response = await fetch("https://forum-container-7ii64z76zq-uc.a.run.app/forum_thread/" + threadid  +"/post/" + likepostid +"/post_like?user_ID=" + user_ID, {
                method: "DELETE",
                headers: {
                    'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
                }
            });

            result = await response.json();
            console.log(result)
            if(result.code == 200){
                
                numberlike-=1
                document.getElementById('likebutton' + likebuttonid).innerHTML = `<button type='button' class='btn btn-info' onclick='likepost(this.id);' id="${likebuttonid}?${likepostid}?${numberlike}"> <i class="bi bi-hand-thumbs-up"></i>Helpful <span id="likecount${likebuttonid}"> (${numberlike})</span></button> `
            }
            else{
                alert(result.message)
            }

}

async function likepost(likeinfo){
    likeinfo = likeinfo.split('?')
    likebuttonid = likeinfo[0]
    likepostid = likeinfo[1]
    user_ID = localStorage.getItem("user_ID")
    numberlike = parseInt(likeinfo[2])
    var url_string = window.location;
    var url = new URL(url_string);
    var threadid = url.searchParams.get("threadid");
    likepostdetail =
            { user_ID: user_ID
                    }
                    
            response = await fetch("https://forum-container-7ii64z76zq-uc.a.run.app/forum_thread/" + threadid + "/post/" + likepostid + "/post_like", {
                method: "POST",
                headers: {
                    'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
                },
            
                body: JSON.stringify(likepostdetail)
            });

            result = await response.json();
            console.log(result)
            if(result.code == 200){
                
                numberlike+=1
                document.getElementById('likebutton' + likebuttonid).innerHTML = `<button type='button' class='btn btn-info' onclick='removelike(this.id);' id="${likebuttonid}?${likepostid}?${numberlike}"> You found this post helpful, <i class="bi bi-hand-thumbs-up-fill"></i><span id="likecount${likebuttonid}"> (${numberlike})</span></button> `
            }
            else{
                alert(result.message)
            }

}


async function createnewpost(){
    var url_string = window.location;
    var url = new URL(url_string);
    var threadid = url.searchParams.get("threadid");
    user_ID = localStorage.getItem("user_ID")
    username = localStorage.getItem("username");
    postcontent = document.getElementById("newpost").value
    console.log(threadid,postcontent)
    if(postcontent==""){
       alert( "Post Content cannot be empty" )
       document.getElementById("newpost").value="";
    }

    else{
        newpostdetails =
            { creator_ID: user_ID,
              post_content: postcontent,
              creator_name:username
                    }
            response = await fetch("https://forum-container-7ii64z76zq-uc.a.run.app/forum_thread/" + threadid + "/post", {
                method: "POST",
                headers: {
                    'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
                },
            
                body: JSON.stringify(newpostdetails)
            });

            result = await response.json();
            console.log(result)
            if(result.code==200){
                $("#success_msg").modal();
                setTimeout(function(){  $("#success_msg").modal("hide"); }, 2000);
                document.getElementById("newpost").value="";
                load_forumpost();
            }
    }
    

}