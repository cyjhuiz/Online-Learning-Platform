



window.onload = async function get_course_section(){

    var sub_url = window.location.href
    sub_url.indexOf("?")
    var course_class_section_id_url_back = sub_url.slice(sub_url.indexOf("?")+1)
 
    var myArr = course_class_section_id_url_back.split("_");
    retrievecourseid = myArr[0] 
    retrieveclassid = myArr[1] 
    var str = ''
    var user_name= localStorage.getItem('username');
    var user_ID= localStorage.getItem('user_ID');
    document.getElementById("navbarDropdown1").innerText = user_name; 
  

    //DISPLAY COURSE INFO
    response = await fetch('https://course-container-7ii64z76zq-uc.a.run.app/course?course_ID='+ retrievecourseid);
    specificcourse = await response.json();
    specificcourse = specificcourse.data.course;
   
    document.getElementById("created_by").innerText = specificcourse['hr_name']; 
    document.getElementById("course_code").innerText = specificcourse['course_code']; 
    document.getElementById("course_name").innerText = specificcourse['name']; 
    document.getElementById("est_duration").innerText = specificcourse['duration']; 
    document.getElementById("course_description").innerText = specificcourse['description']; 
    courseprerequsites = specificcourse['prerequisites']; 
    prerequisitecourse = ''
    for(var predetail in courseprerequsites ){
        prerequisitecourse+=`[${courseprerequsites[predetail]['course_code']}] ${courseprerequsites[predetail]['name']}<br>`
    }
    document.getElementById("course_prerequisuites").innerHTML = prerequisitecourse


    //DISPLAY CLASS INFO

    specificclassresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class?class_ID='+ retrieveclassid);
    specificclassresponse = await specificclassresponse.json();
  
    specificclassresponse = specificclassresponse.data.class;
    document.getElementById("class_name").innerText = specificclassresponse['class_name']; 
    document.getElementById("class_size").innerText = specificclassresponse['size']; 
    document.getElementById("enroll_class_start").innerText = specificclassresponse['enrol_start_date']; 
    document.getElementById("enroll_class_end").innerText = specificclassresponse['enrol_end_date']; 
    document.getElementById("course_start_on").innerText = specificclassresponse['starting_date']; 
    document.getElementById("course_end_on").innerText = specificclassresponse['ending_date']; 
    document.getElementById("assignedinstructor").innerText = specificclassresponse['trainer_info']['trainer_name']; 
    document.getElementById("classstatus").innerText +=" "+ specificclassresponse['class_status']; 
    retrievetrainerid = specificclassresponse['trainer_ID']
    getclassnamechat = specificclassresponse['class_name']
    getcoursenamechat = specificclassresponse['course_info']['course_name']


    chatmessages = await fetch('https://chat-container-7ii64z76zq-uc.a.run.app/chat/messages?sender_ID=' + user_ID + '&class_ID=' + retrieveclassid + '&recipient_ID=' + retrievetrainerid );
    chatmessages = await chatmessages.json();
        
    chatmessages =chatmessages.data.messages
    chatmessages = chatmessages.reverse()
    console.log(chatmessages)
    messagecount=0
    for(var messagedetail in chatmessages){ 
        if(chatmessages[messagedetail]['recipient_ID']==user_ID && chatmessages[messagedetail]['view_status'] ==0){
            messagecount+=1
          }
    }

    console.log(messagecount)
    if(messagecount ==0){
    document.getElementById("chat_button").innerHTML  = `<button type='button' class='btn btn-info' onclick='gochatportal();'>Chat with Trainer <i class="bi bi-chat-dots"></i> </button> 
    <button type='button' class='btn btn-info' onclick='goforum();'>Class Forum</button>` }

    else if (messagecount > 0){
        document.getElementById("chat_button").innerHTML  = `<button type='button' class='btn btn-success' onclick='gochatportal();'> <i class="bi bi-chat-dots"></i> Chat with Trainer  <span class="badge badge-danger"> ${messagecount} unread </span> </button> 
        <button type='button' class='btn btn-info' onclick='goforum();'>Class Forum</button>`
    }
   // document.getElementById("forum_button").innerHTML  = `<button type='button' class='btn btn-info' onclick='gochatportal();'>Class Forum <i class="bi bi-chat-dots"></i> </button>`
    //DISPLAY ALL SECTIONS BASED ON CLASS ID
    allsections = await fetch('https://section-container-7ii64z76zq-uc.a.run.app/section?class_ID='+ retrieveclassid);
    allsections = await allsections.json();
    allsections = allsections.data.sections
    allsectionscontent = ''
   
    allsectionlength = allsections.length 
    allsections.sort((a, b) => {
        return a.ranking - b.ranking;
    });

    quizattempted = "No"



    quizresult = await fetch('https://quiz-container-7ii64z76zq-uc.a.run.app/quiz/quiz_result?learner_ID=' + user_ID +'&class_ID=' + retrieveclassid);
    quizresult = await quizresult.json();
    quizresult = quizresult.data.quiz_results
  
    quizresultclone = JSON.parse(JSON.stringify(quizresult));
   
    allquiz = await fetch('https://quiz-container-7ii64z76zq-uc.a.run.app/quiz');
    allquiz = await allquiz.json();
    allquiz = allquiz.data.quizzes
 

    checktotalquizattempt = 0
    checkquizbyuser=0
    for(var quizresultinfo in quizresultclone){
       
        for(var quizinfo in allquiz){
         
            if(allquiz[quizinfo]['quiz_ID']==quizresultclone[quizresultinfo]['quiz_ID'] 
            && quizresultclone[quizresultinfo]['learner_ID'] == user_ID 
            &&allquiz[quizinfo]['section_ID']==quizresultclone[quizresultinfo]['section_ID'] 
            && allquiz[quizinfo]['class_ID'] ==retrieveclassid && quizresultclone[quizresultinfo]['class_ID'] ==retrieveclassid )

            {   checkquizbyuser +=1
                quizresultclone[quizresultinfo]['total'] = allquiz[quizinfo]['points']
                quizresultclone[quizresultinfo]['passing_rate'] = allquiz[quizinfo]['passing_rate']
                quizresultclone[quizresultinfo]['attemptstatus'] = 1
                break
            }

           
        }
    }

  

   
    quizarrdetail=''
    if(checkquizbyuser==0){
        quizresultclone=[]
        for(var noattemptquiz in allquiz){
            
            if(allquiz[noattemptquiz]['class_ID']== retrieveclassid && allquiz[noattemptquiz]['grading_type'] !='graded'){
                quizarrdetail = {"class_ID": retrieveclassid,
                                "has_passed":0,
                                "quiz_ID": allquiz[noattemptquiz]['quiz_ID']  ,
                                "learner_ID": user_ID,
                                "quiz_score": 0,
                                "section_ID":  allquiz[noattemptquiz]['section_ID'],
                                "total": allquiz[noattemptquiz]['points'],
                                 "attemptstatus" : 0   }
                quizresultclone.push(quizarrdetail)
            }
           
        }
    }
  

    for(var quizresultranking in quizresultclone){
        if(quizresultclone[quizresultranking]['section_ID']==-1){
            quizresultclone[quizresultranking]['ranking'] = ''
            continue
        }
        for(indsection in allsections){
            

            if(allsections[indsection]['section_ID']==quizresultclone[quizresultranking]['section_ID']  
            && quizresultclone[quizresultranking]['learner_ID'] == user_ID ){
               
                quizresultclone[quizresultranking]['ranking'] = allsections[indsection]['ranking']
                break
            }
        }
    }
    
    quizresultclone.sort((a, b) => {
        return a.ranking - b.ranking;
    });
   

    quizresultcheck=[]
    sectionstatus="OPEN"
    progresscount=0
    sectionloop:
    for(let i = 0; i < allsections.length; i++){
      quizstatus = ''
      quizscorepercent=''
   
      for(let x = 0; x < quizresultclone.length; x++){
        
        //check first section
        if(i==0 ){
            //if user got attempt quiz for 1st section
            if(quizresultclone[x]['section_ID']== allsections[i]['section_ID']){
                    if(quizresultclone[x]['has_passed']==1){
                        quizscorepercent = parseFloat(quizresultclone[x]['quiz_score']) / parseFloat(quizresultclone[x]['total'] )
                        
                        quizscorepercent = quizscorepercent * 100
                        
                        quizscorepercent = quizscorepercent + "%"
                    
                        //quizstatus="Yes (Score:" + quizscorepercent+ ")"
                        quizstatus = "Yes"
                        checktotalquizattempt +=1
                        quizresultcheck.push(quizresultclone[x]['section_ID'])
                        sectionstatus = "COMPLETED"
                        progresscount+=1
                    }

                    

                    allsectionscontent+=`<tr><td scope="row">${allsections[i]['ranking']}</td>
                    <td>${allsections[i]['title']}</td>
                    <td>${sectionstatus}</td>
                    <td>${quizstatus}</td>
                    <td style="text-align:center;"><button onclick="viewsection(this.id)" id="${allsections[i]['section_ID']}_${allsections[i]['class_ID']}_${retrievecourseid}` +`"` 
                    +  `type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; ">View Section</button><br>
                    
                    </td></tr>
                    `

                    break
                }
            //if user didnt attempt quiz for 1st section
            else{
                if(x==quizresultclone.length-1){
                    quizresultcheck.push(quizresultclone[x]['quiz_ID'])
                    quizstatus="No ( -- %)"
                    allsectionscontent+=`<tr><td scope="row">${allsections[i]['ranking']}</td>
                        <td>${allsections[i]['title']}</td>
                        <td>OPEN</td>
                        <td>${quizstatus}</td>
                        <td style="text-align:center;"><button onclick="viewsection(this.id)" id="${allsections[i]['section_ID']}_${allsections[i]['class_ID']}_${retrievecourseid}` +`"` 
                        +  `type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; ">View Section</button><br>
                        
                        </td></tr>
                        `

                        break
                }
            }
        }

        //FOR section after the 1st one
        //if user got attempt quiz for subsecquent section
        if( i != 0){
           
            if(quizresultclone[x]['section_ID']== allsections[i]['section_ID'] && quizresultcheck.includes(quizresultclone[x]['section_ID'])== false ){
                //if previous section quiz pass then let user view the section here
                if(x==0){
                    y=x
                    x+=1
                 
                }
                        
                        if(quizresultclone[x-1]['has_passed']==1){
                                
                                if(quizresultclone[x]['has_passed']==1){
                                    
                                    quizscorepercent = parseFloat(quizresultclone[x]['quiz_score']) / parseFloat(quizresultclone[x]['total'] )
                                    quizscorepercent = quizscorepercent * 100
                                    quizscorepercent = quizscorepercent + "%"
                                    //quizstatus="Yes (Score:" + quizscorepercent+ ") "
                                    quizstatus = "Yes"
                                    quizresultcheck.push(quizresultclone[x]['section_ID'])
                                    checktotalquizattempt +=1
                                    sectionstatus = "COMPLETED"
                                    progresscount+=1
                                }

                                
                                allsectionscontent+=`<tr><td scope="row" >${allsections[i]['ranking']}</td>
                                <td>${allsections[i]['title']}</td>
                                <td>${sectionstatus}</td>
                                <td>${quizstatus}</td>
                                <td style="text-align:center;"><button onclick="viewsection(this.id)" id="${allsections[i]['section_ID']}_${allsections[i]['class_ID']}_${retrievecourseid}` +`"` 
                                +  `type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; ">View Section</button><br>
                                
                                </td></tr>`
                                
                                break
                        }
                        
                        //if didnt pass the quiz from previous section then view section should be disabled
                        else{
                            
                            quizresultcheck.push(quizresultclone[x]['section_ID'])
                            quizstatus="No ( -- %)"
                            allsectionscontent+=`<tr style="background-color:white; opacity:0.4"><td scope="row">${allsections[i]['ranking']}</td>
                                <td>${allsections[i]['title']}</td>
                                <td>LOCKED</td>
                                <td>${quizstatus}</td>
                                <td style="text-align:center;"><button onclick="viewsection(this.id)" id="${allsections[i]['section_ID']}_${allsections[i]['class_ID']}_${retrievecourseid}` +`"` 
                                +  `type="button" class="btn btn-secondary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; " disabled>View Section</button><br>
                                
                                </td></tr>
                                `
            
                                break


                        }

            }
            //if user did not attempt quiz for subsequent section
            else if (x==quizresultclone.length-1){
                //if user got pass previous section quiz
            
                if(quizresultclone[x]['has_passed']==1 && i-1 == x){
               
                    quizstatus="No ( -- %)"
                    allsectionscontent+=`<tr ><td scope="row">${allsections[i]['ranking']}</td>
                        <td>${allsections[i]['title']}</td>
                        <td>OPEN</td>
                        <td>${quizstatus}</td>
                        <td style="text-align:center;"><button onclick="viewsection(this.id)" id="${allsections[i]['section_ID']}_${allsections[i]['class_ID']}_${retrievecourseid}` +`"` 
                        +  `type="button" class="btn btn-Primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; ">View Section</button><br>
                        
                        </td></tr>
                        `
    
                        break

                }
                //if user never pass previous section quiz
                else{
                    
                    quizstatus="No ( -- %)"
                    allsectionscontent+=`<tr style="background-color:white; opacity:0.4"><td scope="row">${allsections[i]['ranking']}</td>
                        <td>${allsections[i]['title']}</td>
                        <td>LOCKED</td>
                        <td>${quizstatus}</td>
                        <td style="text-align:center;"><button onclick="viewsection(this.id)" id="${allsections[i]['section_ID']}_${allsections[i]['class_ID']}_${retrievecourseid}` +`"` 
                        +  `type="button" class="btn btn-secondary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; " disabled>View Section</button><br>
                        
                        </td></tr>
                        `
    
                       break
                }
            }

                 }       
                
                    


        
            }

    }
  
    finalgradequiz=''
    for(var quizdetail in allquiz){
        if(allquiz[quizdetail]['class_ID']== retrieveclassid && allquiz[quizdetail]['grading_type'] =='graded' ){
            finalgradequiz = allquiz[quizdetail]
        }
    
    
    }

finalquizstatus=''

        
        for(let z = 0; z < quizresultclone.length; z++){
          
            
            if(specificclassresponse["class_status"] != "CLOSED" ) {
                if( finalgradequiz['class_ID']==quizresultclone[z]['class_ID'] &&finalgradequiz['quiz_ID']== quizresultclone[z]['quiz_ID']){
             
                
                    if(quizresultclone[z]['has_passed']==1){
                        finalquizscorepercent = parseFloat(quizresultclone[z]['quiz_score']) / parseFloat(quizresultclone[z]['total'] )
                        finalquizscorepercent = finalquizscorepercent * 100
                        finalquizscorepercent = finalquizscorepercent + "%"
                        finalquizstatus="Yes (Score:" + finalquizscorepercent+ ") "
                        checktotalquizattempt +=1 
                        finalsecstatus = "COMPLETED"
                        progresscount+=1       
                    }   

                    if(quizresultclone[z]['has_passed']==0){
                        finalquizscorepercent = parseFloat(quizresultclone[z]['quiz_score']) / parseFloat(quizresultclone[z]['total'] )
                        finalquizscorepercent = finalquizscorepercent * 100
                        finalquizscorepercent = finalquizscorepercent + "%"
                        finalquizstatus="Yes (Score:" + finalquizscorepercent+ ")"
                        finalsecstatus = "OPEN"    
                    }
                    allsectionscontent+=`<tr><td scope="row" ></td>
                    <td>Final Graded Quiz</td>
                    <td>${finalsecstatus}</td>
                    <td>${finalquizstatus}</td>
                    <td style="text-align:center;"><button onclick="takequiz(this.id)" id="${finalgradequiz['class_ID']}_${retrievecourseid}_${user_ID}` +`"` 
                    +  `type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; ">Take Quiz</button><br>
                    
                    </td></tr>`
                    break
                
                }

                else if(z==quizresultclone.length-1 ){
                    if(checktotalquizattempt< allsectionlength ){
                               
                                finalquizstatus="No ( -- %)"
                                allsectionscontent+=`<tr style="background-color:white; opacity:0.4"><td scope="row"></td>
                                    <td>Final Grade Quiz</td>
                                    <td>LOCKED</td>
                                    <td>${finalquizstatus}</td>
                                    <td style="text-align:center;"><button onclick="takequiz(this.id)" id="${finalgradequiz['class_ID']}_${retrievecourseid}_${user_ID}` +`"` 
                                    +  `type="button" class="btn btn-secondary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; " disabled>Take Quiz</button><br>
                                    
                                    </td></tr>
                                    `

                                    break 
                }
                    else{
                        finalquizstatus="No ( -- %)"
                        allsectionscontent+=`<tr><td scope="row"></td>
                            <td>Final Grade Quiz</td>
                            <td>OPEN</td>
                            <td>${finalquizstatus}</td>
                            <td style="text-align:center;"><button onclick="takequiz(this.id)" id="${finalgradequiz['class_ID']}_${retrievecourseid}_${user_ID}` +`"` 
                            +  `type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; " >Take Quiz</button><br>
                            
                            </td></tr>
                            `

                            break 
                    }
                }
            
            }

            else{
                finalquizstatus="No ( -- %)"
                allsectionscontent+=`<tr style="background-color:white; opacity:0.4"><td scope="row"></td>
                    <td>Final Grade Quiz</td>
                    <td>OPEN</td>
                    <td>${finalquizstatus}</td>
                    <td style="text-align:center;"><button onclick="takequiz(this.id)" id="${finalgradequiz['class_ID']}_${retrievecourseid}_${user_ID}` +`"` 
                    +  `type="button" class="btn btn-secondary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; " disabled>Take Quiz</button><br>
                    
                    </td></tr>
                    `

                    break 
            }
       
        }

    overallstatus = ((progresscount/(allsections.length+1))*100).toFixed(2);
    overallstatus = String(overallstatus) + "%"
    console.log(overallstatus)
    if(overallstatus == "0%"){
        document.getElementById("overallstatus").innerHTML += 'New <div class="progress" style="height: 20px;"> <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style=" text-align: center; font-size:20px; width:' + overallstatus + ';" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">' + overallstatus +'</div> </div>';
         }

    else if(overallstatus != "100.00%"){
    document.getElementById("overallstatus").innerHTML += 'In Progress <div class="progress" style="height: 20px;"> <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style=" text-align: center; font-size:20px; width:' + overallstatus + ';" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">' + overallstatus +'</div> </div>';
     }

    else{
    document.getElementById("overallstatus").innerHTML += 'Completed <div class="progress" style="height: 20px;"> <div class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style=" text-align: center; font-size:20px; width:' + overallstatus + ';" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">' + overallstatus +'</div> </div>';

    }
    
    if(allsectionscontent==''){
        document.getElementById('my_class_sections').innerHTML = `<td colspan="5" style="text-align: center;"><br><br><br><br><br> Class is not set up Completely Yet. <br><br><br><br><br> </td>`
        return false
    }
    document.getElementById("my_class_sections").innerHTML = allsectionscontent;
}

  
function viewsection(sectiondetailimpt){
    sectiondetailimpt = (sectiondetailimpt.split("_"))
 
    window.location.href = "attendsection.html?" + "sectionid=" + sectiondetailimpt[0] + "&classid=" + sectiondetailimpt[1] + "&courseid=" + sectiondetailimpt[2];
}


function takequiz(takequizdetail){
    quizarr = (takequizdetail.split("_"))
    quizclassid = quizarr[0]
    quizcourseid = quizarr[1]
    quizuserid = quizarr[2]
    quizsectionid = -1


 window.location.href = "do_quiz.html?classid=" + quizclassid + "&sectionid=" + quizsectionid+ "&courseid=" + quizcourseid + "&userid=" + quizuserid ;
 
}


function gochatportal(){
    window.location.href = "chat.html?classid=" + retrieveclassid + "&otheruserid=" + retrievetrainerid 
    + "&classname=" + getclassnamechat + "&coursename=" + getcoursenamechat
}


function goforum(){
    
    window.location.href = "forum.html?classid=" + retrieveclassid 
    + "&classname=" + getclassnamechat + "&courseid=" + retrievecourseid
}