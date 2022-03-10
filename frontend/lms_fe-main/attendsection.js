








var url = window.location.href
url.indexOf("?")
var sectionclassdetail = url.slice(url.indexOf("?")+1)

myArr = sectionclassdetail.split("&")
retrieveclassid = myArr[1].split("=")[1]
retrievesectionid = myArr[0].split("=")[1]
retrievecourseid = myArr[2].split("=")[1]
user_ID = localStorage.getItem("user_ID");










window.onload =  function (){
    attemptsection();
}

async function attemptsection(){

    if (localStorage.getItem("username") == null) { 
        alert("You have to Log In First");
       
        window.location.href = "login.html";
    }

    else {

        user_name =  localStorage.getItem("username")
        
        document.getElementById("navbarDropdown1").innerText = user_name; 
       
        response = await fetch('https://course-container-7ii64z76zq-uc.a.run.app/course?course_ID='+ retrievecourseid);
        specificcourse = await response.json();
        specificcourse = specificcourse.data.course;
    
        specificclassresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class?class_ID='+ retrieveclassid);
        specificclassresponse = await specificclassresponse.json();
    
        specificclassresponse = specificclassresponse.data.class;

        document.getElementById("coursename").innerHTML+=" " + specificcourse["course_code"] + "-" + specificcourse["name"] + "/" +  specificclassresponse['class_name'] ;


        sectiondetailget = await fetch('https://section-container-7ii64z76zq-uc.a.run.app/section/'+ retrievesectionid);
        sectiondetailget = await sectiondetailget.json();
      
        sectiondetailget = sectiondetailget.data.section;
        document.getElementById("sectioname").innerHTML=sectiondetailget['title']


        //get section content based on Section ID
        specificsectioncontent = await fetch('https://section-container-7ii64z76zq-uc.a.run.app/section/' + retrievesectionid  + '/content' );
        specificsectioncontent = await specificsectioncontent.json();
        specificsectioncontent =  specificsectioncontent.data.section_contents;
       
        indexno=0
        sectioncontentdetail=''
        for( var detail in specificsectioncontent){
            indexno+=1
            sectioncontentdetail+=`<tr><td scope="row">${indexno}</td>
                        <td>${specificsectioncontent[detail]['content_type']}</td>
                        <td>${specificsectioncontent[detail]['description']}</td>
                      
                        <td style="text-align:center;"><button onclick="openlink(this.id)" id="${specificsectioncontent[detail]['url']}~${specificsectioncontent[detail]['content_ID']}~${specificsectioncontent[detail]['section_ID']}` +`"` 
                        +  `type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; " >View Material</button><br>
                        
                        </td></tr>
                        `
        }

        document.getElementById("section_content").innerHTML = sectioncontentdetail;

        quizresult = await fetch('https://quiz-container-7ii64z76zq-uc.a.run.app/quiz/quiz_result?learner_ID=' + user_ID +'&class_ID=' + retrieveclassid);
        quizresult = await quizresult.json();
        quiz_result = quizresult.data.quiz_results
     
        quizresultclone = JSON.parse(JSON.stringify(quiz_result));
        allquiz = await fetch('https://quiz-container-7ii64z76zq-uc.a.run.app/quiz');
        allquiz = await allquiz.json();
        allquiz = allquiz.data.quizzes
  

        allsections = await fetch('https://section-container-7ii64z76zq-uc.a.run.app/section?class_ID='+ retrieveclassid);
        allsections = await allsections.json();
        allsections = allsections.data.sections
      
        document.getElementById("quizscore").innerHTML= ''

        for(var quizresultinfo in quizresultclone){
            for(var quizinfo in allquiz){
              
                if(allquiz[quizinfo]['quiz_ID']==quizresultclone[quizresultinfo]['quiz_ID'] 
                && quizresultclone[quizresultinfo]['learner_ID'] == user_ID 
                &&allquiz[quizinfo]['section_ID']==quizresultclone[quizresultinfo]['section_ID'] )
    
                {
                    quizresultclone[quizresultinfo]['total'] = allquiz[quizinfo]['points']
                    quizresultclone[quizresultinfo]['passing_rate'] = allquiz[quizinfo]['passing_rate']
                }
    
            }
        }


        
     
        gotpassma= ''
        findquizscore:
        
        for(let i=0; i < quizresultclone.length; i++){
            quizscorepercent=''
            if(quizresultclone[i]['section_ID'] == retrievesectionid){
            for(let x=0; x < allquiz.length; x++){
             
               
                    
                    if(quizresultclone[i]['quiz_ID']== allquiz[x]['quiz_ID']){
                        if(quizresultclone[i]['has_passed']==1){
                        //quizscorepercent = parseFloat(quizresultclone[i]['quiz_score']) / parseFloat(quizresultclone[i]['total'] )
                     
                        //quizscorepercent = quizscorepercent * 100
                        
                        //quizscorepercent = quizscorepercent+ "%" 
                        quizscorepercent = "Attempted"
                        document.getElementById("quizscore").innerText += quizscorepercent;
                        gotpassma= quizresultclone[i]['has_passed']
                        break findquizscore
                        }
                        else{
                        //quizscorepercent = parseFloat(quizresultclone[i]['quiz_score']) / parseFloat(quizresultclone[i]['total'] )
                      
                        //quizscorepercent = quizscorepercent * 100
                        
                        //quizscorepercent = quizscorepercent+ "%"
                        quizscorepercent = "Attempted"
                        document.getElementById("quizscore").innerText += quizscorepercent;
                        gotpassma= quizresultclone[i]['has_passed']
                        break findquizscore
                        }
                    }


                

            
                }
            }

        else if(i == quizresultclone.length-1){
            quizscorepercent = "Not Attempted"
            document.getElementById("quizscore").innerText += quizscorepercent;
            break findquizscore
            }

        }

        

        


      
        contentviewget = await fetch('https://section-container-7ii64z76zq-uc.a.run.app/section/'+ retrievesectionid + "/content/view?learner_ID=" + user_ID);
        contentviewget = await contentviewget.json();
        contentviewget =  contentviewget.data.content_views
     
       

        previouschap = ''
        nextchap = ''
        currentsectionranking = ''
        prevchapsecid=''
        nextchapsecid=''
        for(var sectiondetail in allsections){
            if(allsections[sectiondetail]['section_ID'] == retrievesectionid){
                currentsectionranking = allsections[sectiondetail]['ranking']
            }
        }
        
        previouschap = currentsectionranking-1
        nextchap = currentsectionranking+1

        for(var sectionranking in allsections){
            if(allsections[sectionranking]['ranking'] == previouschap){
                prevchapsecid = allsections[sectionranking]['section_ID']
            }
            if(allsections[sectionranking]['ranking'] == nextchap){
                nextchapsecid = allsections[sectionranking]['section_ID']
            }
        }
        
        if(prevchapsecid=='')
        {
            document.getElementById("previouschap").innerHTML = '<button onclick="" id="" type="button" class="btn btn-secondary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; " disabled>Previous Chapter</button>';
         }
        else if (prevchapsecid != ''){
            document.getElementById("previouschap").innerHTML = '<button onclick="prevchap(this.id)" id="' + prevchapsecid + '" type="button" class="btn btn-outline-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; " >Previous Chapter</button>';
        }

        document.getElementById("classoverviewbutton").innerHTML = '<button onclick="classoverview()"  type="button" class="btn btn-outline-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; " >Class overview</button>';



        if (specificsectioncontent.length > contentviewget.length  | specificclassresponse['class_status'] == "CLOSED"){
            document.getElementById("attemptquiznow").innerHTML = '<button onclick="" id="" type="button" class="btn btn-secondary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; " disabled>Attempt Quiz</button>';

        }

        else if(specificsectioncontent.length == contentviewget.length){
            document.getElementById("attemptquiznow").innerHTML = '<button onclick="attemptquiz(this.id)" id="' + retrieveclassid + '?' + retrievesectionid + '?' + retrievecourseid + '?' + user_ID + '" type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; " >Attempt Quiz</button>';

        }
        
        
        if((specificsectioncontent.length > contentviewget.length ) | gotpassma==''){
            document.getElementById("overall_status").innerText = "Incompleted"
                if(nextchapsecid==''){
                    document.getElementById("nextchap").innerHTML = '<button onclick="attemptquiz(this.id)" id="' + retrieveclassid + '?' + -1 + '?' + retrievecourseid + '?' + user_ID + '" type="button" class="btn btn-secondary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; " disabled >Attempt Final Quiz</button>';
                }
                else {
                document.getElementById("nextchap").innerHTML = '<button onclick="" id="" type="button" class="btn btn-secondary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; " disabled>Next Chapter</button>';
                }
            }

        else if(specificsectioncontent.length == contentviewget.length && gotpassma==1 ){
         
            document.getElementById("overall_status").innerText = "Completed"
        
            if(nextchapsecid==''){
                
                if(specificclassresponse['class_status'] != "CLOSED"){
                document.getElementById("nextchap").innerHTML = '<button onclick="attemptquiz(this.id)" id="' + retrieveclassid + '?' + -1 + '?' + retrievecourseid + '?' + user_ID + '" type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; " >Attempt Final Quiz</button>';
                }

                else{
                document.getElementById("nextchap").innerHTML = '<button onclick="attemptquiz(this.id)" id="' + retrieveclassid + '?' + -1 + '?' + retrievecourseid + '?' + user_ID + '" type="button" class="btn btn-secondary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; " disabled>Attempt Final Quiz</button>';

                }
            }
            else if(nextchapsecid != ''){
                document.getElementById("nextchap").innerHTML = '<button onclick="nextchapter(this.id)" id="' + nextchapsecid + '" type="button" class="btn btn-outline-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; " >Next Chapter</button>';
            }
        }
        
        

               
               
                


        }
    

    

    }

function prevchap(prevsecid){
    window.location.href = "attendsection.html?sectionid=" + prevsecid + "&classid=" + retrieveclassid+ "&courseid=" + retrievecourseid;
}

function classoverview() {
    window.location.href = "attendclass.html?" + retrievecourseid + "_" + retrieveclassid;
  }

  function nextchapter(nextsecid){
    window.location.href = "attendsection.html?sectionid=" + nextsecid + "&classid=" + retrieveclassid+ "&courseid=" + retrievecourseid;
}


function attemptquiz(quizstuff){

 quizarr = quizstuff.split('?')
 quizclassid = quizarr[0]
 quizsectionid = quizarr[1]
 quizcourseid = quizarr[2]
 quizuserid = quizarr[3]


 window.location.href = "do_quiz.html?classid=" + quizclassid + "&sectionid=" + quizsectionid+ "&courseid=" + quizcourseid + "&userid=" + quizuserid ;
}






async function openlink(urlink) {
  
    urlarr = urlink.split("~")
    urllink = urlarr[0]
    contentid = urlarr[1]
    sectionidurl = urlarr[2]
    user_ID = localStorage.getItem("user_ID");
    window.open(urllink, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=600,height=400");

    learnerview={
        learner_ID : user_ID
    }
    response = await fetch("https://section-container-7ii64z76zq-uc.a.run.app/section/" + sectionidurl + "/content/"+ contentid + "/view" , {
        method: "POST",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        },
     
        body: JSON.stringify(learnerview)
    });
    
     result = await response.json();
     location.reload();
  
}



function logout(){
    localStorage.clear();
    window.location.href = "login.html";
}