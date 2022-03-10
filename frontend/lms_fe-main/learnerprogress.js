window.onload = learnerprogressload()




async function learnerprogressload(){
    user_name =  localStorage.getItem("username")
    document.getElementById("navbarDropdown1").innerText = user_name; 
    var url_string = window.location;
    var url = new URL(url_string);
    var retrieveclassid = url.searchParams.get("classid");
   
      //DISPLAY CLASS INFO

      specificclassresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class?class_ID='+ retrieveclassid);
      specificclassresponse = await specificclassresponse.json();
      user_ID = localStorage.getItem("user_ID")
      specificclassresponse = specificclassresponse.data.class;
      console.log(specificclassresponse)
      document.getElementById("class_name").innerText = specificclassresponse['class_name']; 
      document.getElementById("class_size").innerText = specificclassresponse['size']; 
      document.getElementById("enroll_class_start").innerText = specificclassresponse['enrol_start_date']; 
      document.getElementById("enroll_class_end").innerText = specificclassresponse['enrol_end_date']; 
      document.getElementById("course_start_on").innerText = specificclassresponse['starting_date']; 
      document.getElementById("course_end_on").innerText = specificclassresponse['ending_date']; 
      document.getElementById("assignedinstructor").innerText = specificclassresponse['trainer_info']['trainer_name']; 
      document.getElementById("classstatus").innerText +=" "+ specificclassresponse['class_status']; 


      allsectionclass = await fetch('https://section-container-7ii64z76zq-uc.a.run.app/section?class_ID='+ retrieveclassid);
      allsectionclass = await allsectionclass.json();
      allsectionclass = allsectionclass.data.sections
      console.log(allsectionclass)
      noofsections = 0
      for (var numbersections in allsectionclass){
        noofsections+=1
      }
      getfinalquiz = await fetch('https://quiz-container-7ii64z76zq-uc.a.run.app/quiz?class_ID=' + retrieveclassid +'&section_ID=' +-1)
      getfinalquiz = await getfinalquiz.json();
      console.log(getfinalquiz)
      checkfinalquiz = 0
      if(getfinalquiz.code == 200){
        checkfinalquiz+=1
      }
     
      if(checkfinalquiz==0){
        console.log('here')
        document.getElementById('learner_progresslist').innerHTML = `<td colspan="5" style="text-align: center;"><br><br><br><br><br> Class is not set up Completely Yet. <br><br><br><br><br> </td>`
        return false
      }
      document.getElementById("section_content").innerText += " " + noofsections.toString() + " Chapters + "  + checkfinalquiz.toString() + " Final Quiz"


      //get all quiz for this class
      allquiz = await fetch('https://quiz-container-7ii64z76zq-uc.a.run.app/quiz');
      allquiz = await allquiz.json();
      allquiz = allquiz.data.quizzes
      console.log(allquiz)
      thisclassquiz = []
      for (var thisquiz in allquiz){
        
        if(allquiz[thisquiz]['class_ID']==retrieveclassid){
          thisclassquiz.push({"quiz_ID" :allquiz[thisquiz]['quiz_ID'] , "section_ID":allquiz[thisquiz]['section_ID'],"points" : allquiz[thisquiz]['points']  })
        }
      }
      //console.log(thisclassquiz)
      combinedsectionquizdetail= []
      for(var combinedform in thisclassquiz){
        if(thisclassquiz[combinedform]['section_ID'] == -1){
          combinedsectionquizdetail.push({'class_ID' : parseInt(retrieveclassid),
          'quiz_ID' :thisclassquiz[combinedform]['quiz_ID'], 
          'section_ID' : thisclassquiz[combinedform]['section_ID'] ,
          'ranking' : -1,
          'title': "Final Graded Quiz",
          'points' : thisclassquiz[combinedform]['points'] })
        }
        for(var checksection in allsectionclass){
          if(allsectionclass[checksection]['section_ID'] ==thisclassquiz[combinedform]['section_ID'] ){
            combinedsectionquizdetail.push({'class_ID' :allsectionclass[checksection]['class_ID'] ,
             'section_ID' : allsectionclass[checksection]['section_ID'] , 
              'title': allsectionclass[checksection]['title'],
              'quiz_ID' :thisclassquiz[combinedform]['quiz_ID'],
              'ranking' :allsectionclass[checksection]['ranking'],
              'points' : thisclassquiz[combinedform]['points']
             })
          }
        }
        
      }
      //change to descending order of ranking of sections
      combinedsectionquizdetail.sort((a, b) => parseFloat(b.ranking) - parseFloat(a.ranking));
      //move the final graded quiz to front 
      first = combinedsectionquizdetail[combinedsectionquizdetail.length-1]
      combinedsectionquizdetail.sort(function(x,y){ return x == first ? -1 : y == first ? 1 : 0; });
      console.log(combinedsectionquizdetail)
      if(combinedsectionquizdetail.length ==0){
        document.getElementById('learner_progresslist').innerHTML = `<td colspan="5" style="text-align: center;"><br><br><br><br><br> Class is not set up Completely Yet. <br><br><br><br><br> </td>`
        return false
      }
      alluser = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class/class_user/' + retrieveclassid);
      alluser = await alluser.json();
      alluser = alluser.data.users
      console.log(alluser)


      allquizresult = await fetch('https://quiz-container-7ii64z76zq-uc.a.run.app/quiz/quiz_result')
      allquizresult = await allquizresult.json()
      allquizresult = allquizresult.data.quiz_results
      console.log(allquizresult)

      classquizresult = []
      for(var specifiedquizresult in allquizresult){
        if(allquizresult[specifiedquizresult]['class_ID']== retrieveclassid){
          classquizresult.push(allquizresult[specifiedquizresult])
        }
      }


      console.log(classquizresult)

      

      userinforesult = []

      if(classquizresult.length == 0){
        for (var userinfodetail in alluser){
          quizattempted=[]
          userinforesult.push({'user_ID': alluser[userinfodetail]['user_ID'] , 'user_name': alluser[userinfodetail]['name'],
              'quizattemped' : quizattempted  } )
        }
      }

    else if (classquizresult.length > 0) {
      for(var eachuser in alluser){
        quizattempted=[]
        for(let i = 0; i < classquizresult.length; i++){
        
            if(alluser[eachuser]['user_ID'] == classquizresult[i]['learner_ID'] ){
              quizattempted.push({ 'quiz_ID' : classquizresult[i]['quiz_ID'] ,
              'section_ID' : classquizresult[i]['section_ID'] ,
              'has_passed': classquizresult[i]['has_passed'] ,
              'quiz_score': classquizresult[i]['quiz_score']  })
            }
            if(i == classquizresult.length-1){
              userinforesult.push({'user_ID': alluser[eachuser]['user_ID'] , 'user_name': alluser[eachuser]['name'],
              'quizattemped' : quizattempted  } )
            }
          
        }
      }
    }
      console.log(userinforesult)
      tabledata =[]
      
      loop1:
        for(let x = 0 ; x < userinforesult.length; x++){
          console.log(userinforesult[x]['user_ID'])
          if(userinforesult[x]['quizattemped'].length ==0){
           
            tabledata.push({'user_ID': userinforesult[x]['user_ID'],
            'user_name' :userinforesult[x]['user_name'],
            'title':combinedsectionquizdetail[combinedsectionquizdetail.length-1]['title'],
            'ranking': combinedsectionquizdetail[combinedsectionquizdetail.length-1]['ranking'],
            'quiz_score': '-',
            'has_passed': 'nothing',
            'points': '-' })
            
            continue
          }
          loop2:
              for(var compiledata in combinedsectionquizdetail){
               
                loop3:
                  for(var quizattempdetail in userinforesult[x]['quizattemped']){

                    if(userinforesult[x]['quizattemped'][quizattempdetail]['quiz_ID'] == combinedsectionquizdetail[compiledata]['quiz_ID'] && combinedsectionquizdetail[compiledata]['section_ID'] == -1){
                      tabledata.push({'user_ID': userinforesult[x]['user_ID'],
                      'user_name' :userinforesult[x]['user_name'], 
                      'title' : combinedsectionquizdetail[compiledata]['title'] , 
                      'ranking': combinedsectionquizdetail[compiledata]['ranking'], 
                      'quiz_score': userinforesult[x]['quizattemped'][quizattempdetail]['quiz_score'],
                      'has_passed' : userinforesult[x]['quizattemped'][quizattempdetail]['has_passed'],
                      'points' :  combinedsectionquizdetail[compiledata]['points']   })
                      //userinforesult = userinforesult.filter((item) => item.user_ID != userinforesult[x]['user_ID'] );
                      break loop2;
                  }

                    if(userinforesult[x]['quizattemped'][quizattempdetail]['quiz_ID'] == combinedsectionquizdetail[compiledata]['quiz_ID'] && combinedsectionquizdetail[compiledata]['section_ID'] != -1){
                        tabledata.push({'user_ID': userinforesult[x]['user_ID'],
                        'user_name' :userinforesult[x]['user_name'], 
                        'title' : combinedsectionquizdetail[compiledata-1]['title'] , 
                        'ranking': combinedsectionquizdetail[compiledata-1]['ranking'], 
                        'quiz_score': '-',
                        'has_passed' : 'nothing',
                        'points' :  '-'  })
                       
                        break loop2;
                    }

                    
                  }
              }
        }

   
      console.log(tabledata)
      learnerprogdata = ''
      for(var specificdata in tabledata ){
        scorestatus= ''
        chapterno = tabledata[specificdata]['ranking']
        if(tabledata[specificdata]['has_passed']==1){
          scorestatus= (tabledata[specificdata]['quiz_score']/tabledata[specificdata]['points'])*100
          scorestatus = scorestatus.toFixed(2);
          scorestatus+=" % (Passed. Completed)"
          console.log(scorestatus)
        } 
        else if(tabledata[specificdata]['has_passed']==0){
          scorestatus= (tabledata[specificdata]['quiz_score']/tabledata[specificdata]['points'])*100
          scorestatus = scorestatus.toFixed(2);
          scorestatus+=" % (Currently Fail)"
          console.log(scorestatus)
        }
        else if(tabledata[specificdata]['has_passed']=="nothing"){
          scorestatus = 'Not Yet Attempt'
          console.log(scorestatus)
        }

        if(tabledata[specificdata]['ranking']==-1){
          chapterno = 'Final'
        }


        chatmessages = await fetch('https://chat-container-7ii64z76zq-uc.a.run.app/chat/messages?sender_ID=' + user_ID + '&class_ID=' + retrieveclassid + '&recipient_ID=' + tabledata[specificdata]['user_ID'] );
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
        if(messagecount > 0) {
        learnerprogdata+=`<tr><td scope="row">${tabledata[specificdata]['user_name']}</td>
        
        <td>${tabledata[specificdata]['title']}</td> 
        <td>${chapterno}</td>
        <td>${scorestatus}</td>
        <td style="text-align:center;"><button onclick="gotochat(this.id)" id="${tabledata[specificdata]['user_ID']}_${retrieveclassid}_${specificclassresponse['class_name']}_${specificclassresponse['course_info']['course_name']}` +`"` 
        +  `type="button" class="btn btn-success btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; "> <i class="bi bi-chat-dots"></i> Chat with Learner  <span class="badge badge-danger"> ${messagecount} unread </span> </button><br>
        
        </td></tr>`

        }

        else if(messagecount <= 0){
          learnerprogdata+=`<tr><td scope="row">${tabledata[specificdata]['user_name']}</td>
        
        <td>${tabledata[specificdata]['title']}</td> 
        <td>${chapterno}</td>
        <td>${scorestatus}</td>
        <td style="text-align:center;"><button onclick="gotochat(this.id)" id="${tabledata[specificdata]['user_ID']}_${retrieveclassid}_${specificclassresponse['class_name']}_${specificclassresponse['course_info']['course_name']}` +`"` 
        +  `type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; "> <i class="bi bi-chat-dots"></i> Chat with Learner</button><br>
        
        </td></tr>`
        }
      }
    
      if(learnerprogdata==''){
        document.getElementById('learner_progresslist').innerHTML = `<td colspan="5" style="text-align: center;"><br><br><br><br><br> Class is not set up Completely Yet. <br><br><br><br><br> </td>`
        return false
      }
      document.getElementById('learner_progresslist').innerHTML = learnerprogdata
      
}


function gotochat(userclassinfo){
  //console.log(userclassinfo)
  userclassinfo = userclassinfo.split('_')
  otheruserid = userclassinfo[0]
  getclassid = userclassinfo[1]
  getclassname = userclassinfo[2]
  getcoursename = userclassinfo[3]
  console.log(otheruserid,getclassname,getcoursename)
  window.location.href = "chat.html?classid=" + getclassid + "&otheruserid=" + otheruserid 
    + "&classname=" + getclassname + "&coursename=" + getcoursename
}