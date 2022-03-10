

async function updatestatusopen(){
  
    var url_string = window.location;
    var url = new URL(url_string);
    courseid= url.searchParams.get("courseid");
    classid= url.searchParams.get("classid");

    //get all sections for this class
    response = await fetch('https://section-container-7ii64z76zq-uc.a.run.app/section?class_ID='+ classid);
    classsections = await response.json();
    classsectionsdata = classsections.data.sections
    sectionstatuscode =classsections.code
   

    //check if this class has any section
    if(classsectionsdata.length ==0) {
        alert('Unable to update to OPEN due to 0 sections')
        return false
    }

    //check if each section has content and ungraded quiz.
    for(var sectiondetail in classsectionsdata){
        if(classsectionsdata[sectiondetail]['has_content'] ==0){
            alert("There is no content for section " + classsectionsdata[sectiondetail]['title'] )
            return false
        }
        if(classsectionsdata[sectiondetail]['has_quiz'] ==0){
            alert("There is no ungraded quiz for section " + classsectionsdata[sectiondetail]['title'] )
            return false
        }
    }

    //check if the class has final graded quiz
    finalquizresponse = await fetch('https://quiz-container-7ii64z76zq-uc.a.run.app/quiz');
    finalquiz = await finalquizresponse.json();
    finalquiz = finalquiz.data.quizzes
    finalquizarray = []
    for(var finalquizdetail in finalquiz){
        if(finalquiz[finalquizdetail]['grading_type'] == 'graded' && finalquiz[finalquizdetail]['class_ID']==classid )
        {
            finalquizarray.push(finalquiz[finalquizdetail]['quiz_ID'])
        }
    }

    if(finalquizarray.length == 0){ 
        alert('Unable to update status to OPEN as there are no Graded quiz.')
        return false
    }
    else{
        //api to update the class_status to OPEN
        updateclassstatus= {
            status:"OPEN"
        }
       
        
        response = await fetch("https://class-container-7ii64z76zq-uc.a.run.app/class/" + classid + "/status", {
                method: "PUT",
                headers: {
                    'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
                },
             
                body: JSON.stringify(updateclassstatus)
            });
            
                result = await response.json();
               
        
    }
   
    $("#success_msg").modal();
    setTimeout(function(){  $("#success_msg").modal("hide"); }, 2000);
    displayclassinfo();
  
}

  
async function updateclass(){
    classname= document.getElementById("classname").value
    classsize= document.getElementById("classsize").value
    enrolstartdate= document.getElementById("enrolstartdate").value
    formatenrolstartdate = (enrolstartdate.split("/"))
    enrolstartdate = formatenrolstartdate[2] + "-" + formatenrolstartdate[0] + "-" + formatenrolstartdate[1]
    enrolenddate = document.getElementById("enrolenddate").value
    formatenrolenddate = (enrolenddate.split("/"))
    enrolenddate = formatenrolenddate[2] + "-" + formatenrolenddate[0] + "-" + formatenrolenddate[1]
    startdate = document.getElementById("startdatetime").value
    enddate = document.getElementById("enddatetime").value
    var url_string = window.location;
    var url = new URL(url_string);
    courseid= url.searchParams.get("courseid");
    classid= url.searchParams.get("classid");
    var instructor = ""
    var checkboxes = document.querySelectorAll('input[name="instructorselect"]:checked')
    var instructorID= ""
    coursecode = localStorage.getItem("getcoursecode")
    for (var i = 0; i < checkboxes.length; i++) {
   
        instructor=(checkboxes[i].value)
      }
  
    if(instructor ==""){
        instructorID = localStorage.getItem('getinstructorid')
    }
    if(instructor != "") {
    instructorinfo = instructor.split("_")
    instructorID = instructorinfo[1]

    if (instructorID== "0"){
        instructorID = "-1"
    }
    }
  
    
    updatedclassdetail= {
        class_name:classname,
        course_ID:courseid,
        size:classsize,
        enrol_start_date:enrolstartdate,
        enrol_end_date:enrolenddate,
        hr_ID:localStorage.getItem("user_ID"),
        trainer_ID: instructorID,
        starting_date: startdate,
        ending_date : enddate
    }
    
    response = await fetch("https://class-container-7ii64z76zq-uc.a.run.app/class/" + classid , {
        method: "PUT",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        },
     
        body: JSON.stringify(updatedclassdetail)
    });
    
     result = await response.json();
   
     $("#success_msg").modal();
     setTimeout(function(){  $("#success_msg").modal("hide"); }, 2000);
     displayclassinfo();

    }
    

function validateupdateclassForm() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    currentdate = yyyy + '/' + mm + '/' + dd;
  
    enrolstartyear= document.getElementById("enrolstartdate").value.slice(6,)
    enrolendyear = document.getElementById("enrolenddate").value.slice(6,)
    currentyear = currentdate.slice(0,4)

    newformattedenrolstartdate =  enrolstartyear + "/" + document.getElementById("enrolstartdate").value.slice(0,2) + "/" + document.getElementById("enrolstartdate").value.slice(3,5) 
    newformattedenrolenddate =  enrolendyear + "/" + document.getElementById("enrolenddate").value.slice(0,2) + "/" + document.getElementById("enrolenddate").value.slice(3,5) 

    startyear = document.getElementById("startdatetime").value.slice(0,4)
    endyear = document.getElementById("enddatetime").value.slice(0,4)
    formatstartdatetest = document.getElementById("startdatetime").value.slice(0,4) + "/" + document.getElementById("startdatetime").value.slice(5,7)+ "/" +document.getElementById("startdatetime").value.slice(8,10) 
    formatenddatetest = document.getElementById("enddatetime").value.slice(0,4) + "/" + document.getElementById("enddatetime").value.slice(5,7)  + "/" +  document.getElementById("enddatetime").value.slice(8,10)
    
   

    if (document.getElementById("classname").value == "" 
    | document.getElementById("classsize").value == "" 
    | document.getElementById("enrolstartdate").value == "" 
    | document.getElementById("enrolenddate").value == "" 
    | document.getElementById("startdatetime").value == "" 
    | document.getElementById("enddatetime").value == "" 
    ) 
 
    {
      alert("Please fill up the empty fields if you want to add new classes.");
      return false;
    }
    else if (Number.isInteger(parseInt(document.getElementById("classsize").value))== false){
        alert("Class Size must be numbers");
        return false;
    }
    else if ( (enrolstartyear > enrolendyear)| (newformattedenrolstartdate >=newformattedenrolenddate)){
        alert("Enrol Start Date must be earlier than Enrol End Date");
        return false;
    }
    else if ( (currentyear > enrolstartyear) | (newformattedenrolstartdate< currentdate) ){
        alert("Enrol Start Date must be later than current Date");
        return false;
    }
  
    else if ( (startyear>endyear) | (document.getElementById("startdatetime").value >=document.getElementById("enddatetime").value) ) {
        alert("Start Date/time must be earlier than End Date/time");
        return false;
    }else if( (enrolstartyear> startyear) | (newformattedenrolstartdate> formatstartdatetest) ){
        alert("Enrol Start Date must be earlier than Start Date/time");
        return false;
    }
    else if( (enrolstartyear> endyear) | (newformattedenrolstartdate> formatenddatetest) ){
        alert("Enrol Start Date must be earlier than End Date/time");
        return false;
    }
    else if( (enrolendyear> startyear) | (newformattedenrolenddate> formatstartdatetest) ){
        alert("Enrol End Date must be earlier than Start Date/time");
        return false;
    }
    else if( (enrolendyear> endyear) | (newformattedenrolenddate> formatenddatetest) ){
        alert("Enrol End Date must be earlier than End Date/time");
        return false;
    }
    else {
       
        updateclass()
    }
}
  
  
  

window.onload = async function class_detail(){
    //retrieve course details
    if (localStorage.getItem("username") == null) { 
        alert("You have to Log In First");
       
        window.location.href = "login.html";
    }
    else {
   
    var url_string = window.location;
    var url = new URL(url_string);
    var courseid = url.searchParams.get("courseid");
    var classid = url.searchParams.get("classid");
    localStorage.setItem('getclassid',classid)
    specificclassresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class?class_ID='+ classid);
    specificclassresponse = await specificclassresponse.json();
    specificclassresponse = specificclassresponse.data.class;
    user_name =  localStorage.getItem("username")
    document.getElementById("navbarDropdown1").innerText = user_name; 

    document.getElementById("classsizeheader").innerText = "Class List (Max " + specificclassresponse['size'] + ")" ;
    document.getElementById("allstudentlist").innerHTML = '<div class="d-flex justify-content-center"> <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"> <span class="sr-only">Loading...</span> </div> </div>'
    document.getElementById("allstudentclasslist").innerHTML = '<div class="d-flex justify-content-center"> <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"> <span class="sr-only">Loading...</span> </div> </div>'

    localStorage.setItem('getinstructorid',specificclassresponse['trainer_ID'])
  
    response = await fetch('https://course-container-7ii64z76zq-uc.a.run.app/course?course_ID='+ courseid);
    specificcourse = await response.json();
    specificcourse = specificcourse.data.course;
    if(specificclassresponse['class_status'] != "NEW" | specificcourse['status'] =='RETIRED' ){
    document.getElementById("buttoninstructor").disabled = true;
    document.getElementById("updateopenbutton").disabled = true;
    document.getElementById("classupdatebutton").disabled = true;
    document.getElementById("updateopenbutton").className = "btn btn-secondary btn-sm btn-block";
   }


   if(specificclassresponse['class_status'] == "IN_PROGRESS"| specificclassresponse['class_status'] == "CLOSED" | specificcourse['status'] =='RETIRED' ){
    document.getElementById("assignbutton").disabled = true;
    document.getElementById("assignbutton").className = "btn btn-secondary btn-sm btn-block";
    document.getElementById("withdrawbutton").disabled = true;
    document.getElementById("withdrawbutton").className = "btn btn-secondary btn-sm btn-block";
   }

    specificcourseresponse = await fetch('https://course-container-7ii64z76zq-uc.a.run.app/course?course_ID='+ courseid);
    specificcourseresponse = await specificcourseresponse.json();
    specificcourseresponse = specificcourseresponse.data.course;
    
   
    document.getElementById("courseheader").innerHTML='<img src="Images/setting.png" width="35" height="35"> ' + specificcourseresponse['course_code'] + "-" + specificclassresponse["class_name"];
    document.getElementById("classname").value=specificclassresponse['class_name'];
    document.getElementById("classsize").value=specificclassresponse['size'];
    localStorage.setItem('getcoursecode',specificcourseresponse['course_code'])
    formattedenrolstartdate = specificclassresponse["enrol_start_date"].split('-')
    formattedenrolenddate = specificclassresponse["enrol_end_date"].split('-')
 
    formatstartdate = specificclassresponse['starting_date']
    formatenddate = specificclassresponse['ending_date']
    document.getElementById("enrolstartdate").value=formattedenrolstartdate[1] + '/' + formattedenrolstartdate[2] + '/' + formattedenrolstartdate[0];
    document.getElementById("enrolenddate").value=formattedenrolenddate[1] + '/' + formattedenrolenddate[2] + '/' + formattedenrolenddate[0];
    document.getElementById("startdatetime").value= formatstartdate
    document.getElementById("enddatetime").value=formatenddate
   
    if(specificclassresponse["trainer_info"]["trainer_name"]==null) {
        document.getElementById("currentinstructor").innerText= "Current Trainer: " +  "No Trainer"
    }
    else{document.getElementById("currentinstructor").innerText= "Current Trainer: " + specificclassresponse["trainer_info"]["trainer_name"]}
    
    document.getElementById("classstatus").innerText += specificclassresponse['class_status']

    prerequisiteids = []
    for(var preid in specificcourseresponse['prerequisites']){
        prerequisiteids.push(specificcourseresponse['prerequisites'][preid]['course_ID'])
    }
    if(prerequisiteids[0]==0){
        prerequisiteids=[]
    }
    trainerids =[]
    classresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class?course_ID='+ courseid);
   
    classresponse = await classresponse.json();
 
    classresponse = classresponse.data.classes;
    courseclasslist=[]
    classusers=[]
   
    //retrieve all trainer ID and class_id OF ALL related class of course
    for(var classdetail in classresponse){
        if(classresponse[classdetail]['course_ID']==courseid){
            trainerids.push(classresponse[classdetail]['trainer_ID'])
            courseclasslist.push(classresponse[classdetail]['class_ID'])
        }
    }
   
    for(var selectedclassid in courseclasslist){
      
        classuserresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class/class_user/'+ courseclasslist[selectedclassid]);
        classuserresponse = await classuserresponse.json();
        if(classuserresponse.code ==200){
        classuserresponse = classuserresponse.data.users;
        for(var classuser in classuserresponse){
            classusers.push(classuserresponse[classuser]['user_ID'])
        }
         }
       
    }
  


    //retrieve all instructor for dropdown
    alluserresponse = await fetch('https://user-container-7ii64z76zq-uc.a.run.app/user');
    alluserresponse = await alluserresponse.json();
    alluserresponse = alluserresponse.data.users

    allinstructor= `<a class="dropdown-item">
    <!-- Default unchecked -->
    <div class="custom-control custom-checkbox">
        <input type="checkbox" class="custom-control-input" name="instructorselect" onclick="check(this);" id="instructorcheckbox0"`  + `value= "none_0"` + `>` + 
        `<label class="custom-control-label" id="labeltext"  for="instructorcheckbox0">None` + `</label>
    </div>
    </a>`;
    numberinstructor= 0
    for (var detail in alluserresponse){
        if(alluserresponse[detail]['roles'].includes('trainer') && classusers.includes(alluserresponse[detail]['user_ID']) ==false ){
        numberinstructor+=1
        
        allinstructor += `
        
        
            <a class="dropdown-item">
            <!-- Default unchecked -->
            <div class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input" name="instructorselect" onclick="check(this);" id="instructorcheckbox` + numberinstructor.toString() + `"` + `value= "[${alluserresponse[detail]['job_title']}]${alluserresponse[detail]['name']}_${alluserresponse[detail]['user_ID']}"` + `>` + 
                `<label class="custom-control-label" id="labeltext"  for="instructorcheckbox` + numberinstructor.toString() + `">` + `[${alluserresponse[detail]['job_title']}] `  +` ${alluserresponse[detail]['name']}</label>
            </div>
            </a>
        
        `;
        }
    }
   
    document.getElementById("dropdown-menu-instructor").innerHTML = allinstructor;

    
    allstudentclasslist=''
    numberstudentclass=0
    //retreieve all students in specific class 
    allstudentclassresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class/class_user/'+ classid);
    allstudentclassresponse = await allstudentclassresponse.json();
    allstudentclassresponse = allstudentclassresponse.data.users
    
    studentexistclass=[]
    for (let i = 0; i < allstudentclassresponse.length; i++ ){

        studentexistclass.push(allstudentclassresponse[i]['user_ID'])
        numberstudentclass+=1
        allstudentclasslist+=`
        

        <li>
                                    <input type="checkbox" name = "studentclasscheckbox" id="studentclasscheckbox` + numberstudentclass.toString()  + `" value="${allstudentclassresponse[i]['name']}?${allstudentclassresponse[i]['user_ID']}" >
                                    <label for="studentclasscheckbox` + numberstudentclass.toString()+ `">${allstudentclassresponse[i]['name']}</label>
        </li>
        `
   
   
    }
  
    document.getElementById("allstudentclasslist").innerHTML = allstudentclasslist;







    allstudentlist=''
    numberstudent=0
    //retreieve all students 
  
    allstudentresponse = await fetch('https://user-container-7ii64z76zq-uc.a.run.app/user');
    allstudentresponse = await allstudentresponse.json();
    allstudentresponse = allstudentresponse.data.users
    console.log(allstudentresponse)
    //if course no prerequsite
    if(specificcourseresponse['prerequisites'].length == 0) {
        
     
        onlylearner = []
    
        for (let i = 0; i < allstudentresponse.length; i++ ) {
            //to ensure onlylearner only consist of those who is learner && not trainer of the course && does not belong to any of the class of the course
            if(allstudentresponse[i]['roles'].includes('learner')&& trainerids.includes(allstudentresponse[i]['user_ID']) ==false && classusers.includes(allstudentresponse[i]['user_ID'] ) == false){
                onlylearner.push(allstudentresponse[i])
                     }
    
    
    
                }
    console.log(onlylearner)
    learnercompletetest = await fetch('https://user-container-7ii64z76zq-uc.a.run.app/user/learner_completed');
    learnercompletetest = await learnercompletetest.json();
    console.log(learnercompletetest)
    learnercomplete = learnercompletetest.data.learner_completed  
    finaleligiblelearner = []
    for (var divlearner in onlylearner) {
        total= 0
        learnercousecomplete = []
        if(learnercomplete.length == 0 ){
            eligiblelearnerdetail={"user_ID":onlylearner[divlearner]['user_ID'], "completed_course":learnercousecomplete  }
                finaleligiblelearner.push(eligiblelearnerdetail)
        }
        for(eligiblelearner in learnercomplete){
             total+=1
            if(onlylearner[divlearner]['user_ID']==learnercomplete[eligiblelearner]['learner_ID']  ){
                learnercousecomplete.push({"course_ID":learnercomplete[eligiblelearner]['course_ID'],"status":learnercomplete[eligiblelearner]['status'] })
            }
            if(total==learnercomplete.length){
                eligiblelearnerdetail={"user_ID":onlylearner[divlearner]['user_ID'], "completed_course":learnercousecomplete  }
                finaleligiblelearner.push(eligiblelearnerdetail)
            }
        }

    }
    
    noteligible=[]
    eligiblelearners=[]
    console.log(finaleligiblelearner)
        //find student who taken the main course itself
    for (var eligiblelearner in finaleligiblelearner) {
      
      
        for(var completeid in finaleligiblelearner[eligiblelearner]['completed_course']) {
            if(Object.values(finaleligiblelearner[eligiblelearner]['completed_course'][completeid]).includes(parseInt(courseid) ) 
                && Object.values(finaleligiblelearner[eligiblelearner]['completed_course'][completeid]).includes('COMPLETED')  ) {
                noteligible.push(finaleligiblelearner[eligiblelearner]['user_ID'])
                     }


                    }
                }
         
            for (clearlearner in finaleligiblelearner){
               
                    if(noteligible.includes(finaleligiblelearner[clearlearner]['user_ID'])== false && eligiblelearners.includes(finaleligiblelearner[clearlearner]['user_ID']) ==false) {
                      
                        eligiblelearners.push(finaleligiblelearner[clearlearner]['user_ID'])  
                    }
                

            }
    console.log(eligiblelearners)
    console.log(allstudentresponse)
    for (let i = 0; i < allstudentresponse.length; i++ ){

        if(allstudentresponse[i]['roles'].includes('learner')&& trainerids.includes(allstudentresponse[i]['user_ID']) ==false  
            && classusers.includes(allstudentresponse[i]['user_ID'] ) == false
            && eligiblelearners.includes(allstudentresponse[i]['user_ID'])    
            ){
        numberstudent+=1
        allstudentlist+=`
        

        <li>
                                    <input type="checkbox" name="studentcheckbox" id="studentcheckbox` + numberstudent.toString()  + `" value="${allstudentresponse[i]['name']}?${allstudentresponse[i]['user_ID']}" >
                                    <label for="studentcheckbox` + numberstudent.toString()+ `">${allstudentresponse[i]['name']}</label>
        </li>
        `
    
        }
    }
    console.log(allstudentlist)
    document.getElementById("allstudentlist").innerHTML = allstudentlist;

    }

    else{
        //get all user who is learner
        onlylearner = []
        
      
        for (let i = 0; i < allstudentresponse.length; i++ ) {
            //to ensure onlylearner only consist of those who is learner && not trainer of the course && does not belong to any of the class of the course
            if(allstudentresponse[i]['roles'].includes('learner')&& trainerids.includes(allstudentresponse[i]['user_ID']) ==false && classusers.includes(allstudentresponse[i]['user_ID'] ) == false){
                onlylearner.push(allstudentresponse[i])
                     }
    
    
    
                }
    learnercompletetest = await fetch('https://user-container-7ii64z76zq-uc.a.run.app/user/learner_completed');
    learnercompletetest = await learnercompletetest.json();
    learnercomplete= learnercompletetest.data.learner_completed
   
    
    //status either ATTEMPTED OR COMPLETED
   
 

   
    finaleligiblelearner = []
    for (var divlearner in onlylearner) {
        total= 0
        learnercousecomplete = []
        if(learnercomplete.length == 0 ){
            eligiblelearnerdetail={"user_ID":onlylearner[divlearner]['user_ID'], "completed_course":learnercousecomplete  }
                finaleligiblelearner.push(eligiblelearnerdetail)
        }
        for(eligiblelearner in learnercomplete){
             total+=1
            if(onlylearner[divlearner]['user_ID']==learnercomplete[eligiblelearner]['learner_ID']  ){
                learnercousecomplete.push({"course_ID":learnercomplete[eligiblelearner]['course_ID'],"status":learnercomplete[eligiblelearner]['status'] })
            }
            if(total==learnercomplete.length){
                eligiblelearnerdetail={"user_ID":onlylearner[divlearner]['user_ID'], "completed_course":learnercousecomplete  }
                finaleligiblelearner.push(eligiblelearnerdetail)
            }
        }

    }

 
    eligiblelearnerlist = []
    
    noteligible=[]
    eligiblelearners=[]
    //find student who taken the main course itself
    for (var eligiblelearner in finaleligiblelearner) {
      
      
        for(var completeid in finaleligiblelearner[eligiblelearner]['completed_course']) {
            if(Object.values(finaleligiblelearner[eligiblelearner]['completed_course'][completeid]).includes(parseInt(courseid) ) 
                && Object.values(finaleligiblelearner[eligiblelearner]['completed_course'][completeid]).includes('COMPLETED')  ) {
                noteligible.push(finaleligiblelearner[eligiblelearner]['user_ID'])
                     }


                    }
                }
        
            for (clearlearner in finaleligiblelearner){
                
                    if(noteligible.includes(finaleligiblelearner[clearlearner]['user_ID'])== false){
                      
                        eligiblelearners.push(finaleligiblelearner[clearlearner])  
                    }
                

            }
            
         
            finaleligiblelearner= eligiblelearners
    for (var eligiblelearner in finaleligiblelearner) {
        checkpre = 0
      
        for(var completeid in finaleligiblelearner[eligiblelearner]['completed_course']) {
           
                for(preid in prerequisiteids){
                    
                    if(Object.values(finaleligiblelearner[eligiblelearner]['completed_course'][completeid]).includes(parseInt(prerequisiteids[preid])) 
                        && Object.values(finaleligiblelearner[eligiblelearner]['completed_course'][completeid]).includes("COMPLETED")  
                         ) {
                
                        checkpre +=1
                    }
                    if(checkpre == prerequisiteids.length && eligiblelearnerlist.includes(finaleligiblelearner[eligiblelearner]['user_ID'])==false) {
                        
                        eligiblelearnerlist.push(finaleligiblelearner[eligiblelearner]['user_ID'])
                    }
                }
        }
    }
     
        allstudentresponse = await fetch('https://user-container-7ii64z76zq-uc.a.run.app/user');
        allstudentresponse = await allstudentresponse.json();
        allstudentresponse = allstudentresponse.data.users
    for (let i = 0; i < allstudentresponse.length; i++ ){

        if(eligiblelearnerlist.includes(parseInt(allstudentresponse[i]['user_ID']))  ){
        numberstudent+=1
        allstudentlist+=`
        

        <li>
                                    <input type="checkbox" name="studentcheckbox" id="studentcheckbox` + numberstudent.toString()  + `" value="${allstudentresponse[i]['name']}?${allstudentresponse[i]['user_ID']}" >
                                    <label for="studentcheckbox` + numberstudent.toString()+ `">${allstudentresponse[i]['name']}</label>
        </li>
        `
    
            }
        document.getElementById("allstudentlist").innerHTML = allstudentlist;
        }
    }
}
  
}



async function assign(){
    var url_string = window.location;
    var url = new URL(url_string);
    var courseid = url.searchParams.get("courseid");
    var classid = url.searchParams.get("classid");
    var studenttoclass = [];
    var checkboxes = document.querySelectorAll('input[name="studentcheckbox"]:checked')

    for (var i = 0; i < checkboxes.length; i++) {
        studentarr = checkboxes[i].value.split("?");
     
        assignstudent = {learner_ID:studentarr[1], is_assigned:true}
   
        response = await fetch("https://class-container-7ii64z76zq-uc.a.run.app/class/" + classid+ "/learner", {
        method: "POST",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        },
     
        body: JSON.stringify(assignstudent)
        });
    
        result = await response.json();
       
        studenttoclass.push({Name:studentarr[0],user_ID:studentarr[1]});
      
      }
     
      $("#success_msg").modal();
      setTimeout(function(){  $("#success_msg").modal("hide"); }, 4000);
      displaystudentcheckboxes();
}


async function withdraw(){
    var url_string = window.location;
    var url = new URL(url_string);
    var courseid = url.searchParams.get("courseid");
    var classid = url.searchParams.get("classid");
    var studenttoclass = [];
    var checkboxes = document.querySelectorAll('input[name="studentclasscheckbox"]:checked')

    for (var i = 0; i < checkboxes.length; i++) {
        studentarr = checkboxes[i].value.split("?");
       
                                                                                
        response = await fetch("https://class-container-7ii64z76zq-uc.a.run.app/class/learner?class_ID=" + classid + "&learner_ID=" + studentarr[1] , {
        method: "DELETE",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        }
     
      
    });
    
     result = await response.json();
     
        studenttoclass.push({Name:studentarr[0],user_ID:studentarr[1]});
      
      }
    
      $("#success_msg").modal();
      setTimeout(function(){  $("#success_msg").modal("hide"); }, 4000);
      displaystudentcheckboxes();
}





function check(input)
{
    instructnamejob = input.value.split("_")[0];
 
    var checkboxes = document.getElementsByName("instructorselect");
   
    for(var i = 0; i < checkboxes.length; i++)
    {
        //uncheck all
        
        if(checkboxes[i].checked == true)
        {
            checkboxes[i].checked = false;
            document.getElementById("instructorselected").innerText = "";
        }
    }
    
    //set checked of clicked object
    if(input.checked == true)
    {
        input.checked = false;
        
        document.getElementById("instructorselected").innerText = "";
    }
    else
    {
        input.checked = true;
        document.getElementById("instructorselected").innerText = "New Selected Trainer: " + instructnamejob;
    }	
}




async function displayclassinfo() {
   
    var url_string = window.location;
    var url = new URL(url_string);
    var courseid = url.searchParams.get("courseid");
    var classid = url.searchParams.get("classid");
    localStorage.setItem('getclassid',classid)
    user_name =  localStorage.getItem("username")
    document.getElementById("navbarDropdown1").innerText = user_name; 

    specificclassresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class?class_ID='+ classid);
    specificclassresponse = await specificclassresponse.json();

    specificclassresponse = specificclassresponse.data.class;
    localStorage.setItem('getinstructorid',specificclassresponse['trainer_ID'])



    if(specificclassresponse['class_status'] != "NEW"){
        document.getElementById("buttoninstructor").disabled = true;
        document.getElementById("updateopenbutton").disabled = true;
        document.getElementById("updateopenbutton").className = "btn btn-secondary btn-sm btn-block";
       }
    
    
       if(specificclassresponse['class_status'] == "IN_PROGRESS"| specificclassresponse['class_status'] == "CLOSED"){
        document.getElementById("assignbutton").disabled = true;
        document.getElementById("assignbutton").className = "btn btn-secondary btn-sm btn-block";
        document.getElementById("withdrawbutton").disabled = true;
        document.getElementById("withdrawbutton").className = "btn btn-secondary btn-sm btn-block";
       }

       
    document.getElementById("instructorselected").innerText = ""
    specificcourseresponse = await fetch('https://course-container-7ii64z76zq-uc.a.run.app/course?course_ID='+ courseid);
    specificcourseresponse = await specificcourseresponse.json();
    specificcourseresponse = specificcourseresponse.data.course;
  
    document.getElementById("classsizeheader").innerText = "Class List (Max " + specificclassresponse['size'] + ")" ;
    document.getElementById("courseheader").innerHTML='<img src="Images/setting.png" width="35" height="35"> ' + specificcourseresponse['course_code'] + "-" + specificclassresponse["class_name"];
    document.getElementById("classname").value=specificclassresponse['class_name'];
    document.getElementById("classsize").value=specificclassresponse['size'];
    localStorage.setItem('getcoursecode',specificcourseresponse['course_code'])
    formattedenrolstartdate = specificclassresponse["enrol_start_date"].split('-')
    formattedenrolenddate = specificclassresponse["enrol_end_date"].split('-')
 
    formatstartdate = specificclassresponse['starting_date']
    formatenddate = specificclassresponse['ending_date']
    document.getElementById("enrolstartdate").value=formattedenrolstartdate[1] + '/' + formattedenrolstartdate[2] + '/' + formattedenrolstartdate[0];
    document.getElementById("enrolenddate").value=formattedenrolenddate[1] + '/' + formattedenrolenddate[2] + '/' + formattedenrolenddate[0];
    document.getElementById("startdatetime").value= formatstartdate
    document.getElementById("enddatetime").value=formatenddate
    if(specificclassresponse["trainer_info"]["trainer_name"]==null) {
        document.getElementById("currentinstructor").innerText= "Current Trainer: " +  "No Trainer"
    }
    else{document.getElementById("currentinstructor").innerText= "Current Trainer: " + specificclassresponse["trainer_info"]["trainer_name"]}
    document.getElementById("classstatus").innerText = ''
    document.getElementById("classstatus").innerText = 'Status: '
    document.getElementById("classstatus").innerText += specificclassresponse['class_status']

    if(prerequisiteids[0]==0){
        prerequisiteids=[]
    }
    trainerids =[]
    classresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class?course_ID='+ courseid);

    classresponse = await classresponse.json();
 
    classresponse = classresponse.data.classes;
    courseclasslist=[]
    classusers=[]
 
    //retrieve all trainer ID and class_id OF ALL related class of course
    for(var classdetail in classresponse){
        if(classresponse[classdetail]['course_ID']==courseid){
            trainerids.push(classresponse[classdetail]['trainer_ID'])
            courseclasslist.push(classresponse[classdetail]['class_ID'])
        }
    }
    
    for(var selectedclassid in courseclasslist){
      
        classuserresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class/class_user/'+ courseclasslist[selectedclassid]);
        classuserresponse = await classuserresponse.json();
        if(classuserresponse.code ==200){
        classuserresponse = classuserresponse.data.users;
        for(var classuser in classuserresponse){
            classusers.push(classuserresponse[classuser]['user_ID'])
        }
         }
       
    }
   
    //retrieve all instructor for dropdown
    alluserresponse = await fetch('https://user-container-7ii64z76zq-uc.a.run.app/user');
    alluserresponse = await alluserresponse.json();
    alluserresponse = alluserresponse.data.users
    
    allinstructor= `<a class="dropdown-item">
    <!-- Default unchecked -->
    <div class="custom-control custom-checkbox">
        <input type="checkbox" class="custom-control-input" name="instructorselect" onclick="check(this);" id="instructorcheckbox0"`  + `value= "none_0"` + `>` + 
        `<label class="custom-control-label" id="labeltext"  for="instructorcheckbox0">None` + `</label>
    </div>
    </a>`;
    numberinstructor= 0
    for (var detail in alluserresponse){
        if(alluserresponse[detail]['roles'].includes('trainer') && classusers.includes(alluserresponse[detail]['user_ID']) ==false ){
        numberinstructor+=1
        
        allinstructor += `
        
        
            <a class="dropdown-item">
            <!-- Default unchecked -->
            <div class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input" name="instructorselect" onclick="check(this);" id="instructorcheckbox` + numberinstructor.toString() + `"` + `value= "[${alluserresponse[detail]['job_title']}]${alluserresponse[detail]['name']}_${alluserresponse[detail]['user_ID']}"` + `>` + 
                `<label class="custom-control-label" id="labeltext"  for="instructorcheckbox` + numberinstructor.toString() + `">` + `[${alluserresponse[detail]['job_title']}] `  +` ${alluserresponse[detail]['name']}</label>
            </div>
            </a>
        
        `;
        }
    }
   
    document.getElementById("dropdown-menu-instructor").innerHTML = allinstructor;
    displaystudentcheckboxes();
}





async function displaystudentcheckboxes(){
    document.getElementById("allstudentlist").innerHTML = '<div class="d-flex justify-content-center"> <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"> <span class="sr-only">Loading...</span> </div> </div>'
    document.getElementById("allstudentclasslist").innerHTML = '<div class="d-flex justify-content-center"> <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"> <span class="sr-only">Loading...</span> </div> </div>'
    var url_string = window.location;
    var url = new URL(url_string);
    var classid = url.searchParams.get("classid");
    var courseid = url.searchParams.get("courseid");
    prerequisiteids = []
    for(var preid in specificcourseresponse['prerequisites']){
        prerequisiteids.push(specificcourseresponse['prerequisites'][preid]['course_ID'])
    }
    if(prerequisiteids[0]==0){
        prerequisiteids=[]
    }
    trainerids =[]
    classresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class?course_ID='+ courseid);
  
    classresponse = await classresponse.json();
 
    classresponse = classresponse.data.classes;
    courseclasslist=[]
    classusers=[]
    
    //retrieve all trainer ID and class_id OF ALL related class of course
    for(var classdetail in classresponse){
        if(classresponse[classdetail]['course_ID']==courseid){
            trainerids.push(classresponse[classdetail]['trainer_ID'])
            courseclasslist.push(classresponse[classdetail]['class_ID'])
        }
    }
   
    for(var selectedclassid in courseclasslist){
      
        classuserresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class/class_user/'+ courseclasslist[selectedclassid]);
        classuserresponse = await classuserresponse.json();
        if(classuserresponse.code ==200){
        classuserresponse = classuserresponse.data.users;
        for(var classuser in classuserresponse){
            classusers.push(classuserresponse[classuser]['user_ID'])
        }
         }
       
    }
   
    //retrieve all instructor for dropdown
    alluserresponse = await fetch('https://user-container-7ii64z76zq-uc.a.run.app/user');
    alluserresponse = await alluserresponse.json();
    alluserresponse = alluserresponse.data.users
 
    allinstructor= `<a class="dropdown-item">
    <!-- Default unchecked -->
    <div class="custom-control custom-checkbox">
        <input type="checkbox" class="custom-control-input" name="instructorselect" onclick="check(this);" id="instructorcheckbox0"`  + `value= "none_0"` + `>` + 
        `<label class="custom-control-label" id="labeltext"  for="instructorcheckbox0">None` + `</label>
    </div>
    </a>`;
    numberinstructor= 0
    for (var detail in alluserresponse){
        if(alluserresponse[detail]['roles'].includes('trainer') && classusers.includes(alluserresponse[detail]['user_ID']) ==false ){
        numberinstructor+=1
        
        allinstructor += `
        
        
            <a class="dropdown-item">
            <!-- Default unchecked -->
            <div class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input" name="instructorselect" onclick="check(this);" id="instructorcheckbox` + numberinstructor.toString() + `"` + `value= "[${alluserresponse[detail]['job_title']}]${alluserresponse[detail]['name']}_${alluserresponse[detail]['user_ID']}"` + `>` + 
                `<label class="custom-control-label" id="labeltext"  for="instructorcheckbox` + numberinstructor.toString() + `">` + `[${alluserresponse[detail]['job_title']}] `  +` ${alluserresponse[detail]['name']}</label>
            </div>
            </a>
        
        `;
        }
    }
   
    document.getElementById("dropdown-menu-instructor").innerHTML = allinstructor;

    
    allstudentclasslist=''
    numberstudentclass=0
    //retreieve all students in specific class 
    allstudentclassresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class/class_user/'+ classid);
    allstudentclassresponse = await allstudentclassresponse.json();
    allstudentclassresponse = allstudentclassresponse.data.users
 
    studentexistclass=[]
    for (let i = 0; i < allstudentclassresponse.length; i++ ){

        studentexistclass.push(allstudentclassresponse[i]['user_ID'])
        numberstudentclass+=1
        allstudentclasslist+=`
        

        <li>
                                    <input type="checkbox" name = "studentclasscheckbox" id="studentclasscheckbox` + numberstudentclass.toString()  + `" value="${allstudentclassresponse[i]['name']}?${allstudentclassresponse[i]['user_ID']}" >
                                    <label for="studentclasscheckbox` + numberstudentclass.toString()+ `">${allstudentclassresponse[i]['name']}</label>
        </li>
        `
   
   
    }
  
    document.getElementById("allstudentclasslist").innerHTML = allstudentclasslist;







    allstudentlist=''
    numberstudent=0
    //retreieve all students 
  
    allstudentresponse = await fetch('https://user-container-7ii64z76zq-uc.a.run.app/user');
    allstudentresponse = await allstudentresponse.json();
    allstudentresponse = allstudentresponse.data.users

    //if course no prerequsite
    if(specificcourseresponse['prerequisites'].length == 0) {
        
        

        onlylearner = []
    
      
        for (let i = 0; i < allstudentresponse.length; i++ ) {
            //to ensure onlylearner only consist of those who is learner && not trainer of the course && does not belong to any of the class of the course
            if(allstudentresponse[i]['roles'].includes('learner')&& trainerids.includes(allstudentresponse[i]['user_ID']) ==false && classusers.includes(allstudentresponse[i]['user_ID'] ) == false){
                onlylearner.push(allstudentresponse[i])
                     }
    
    
    
                }

  
    finaleligiblelearner = []
    for (var divlearner in onlylearner) {
        total= 0
        learnercousecomplete = []
        if(learnercomplete.length == 0 ){
            eligiblelearnerdetail={"user_ID":onlylearner[divlearner]['user_ID'], "completed_course":learnercousecomplete  }
                finaleligiblelearner.push(eligiblelearnerdetail)
        }
        for(eligiblelearner in learnercomplete){
             total+=1
            if(onlylearner[divlearner]['user_ID']==learnercomplete[eligiblelearner]['learner_ID']  ){
                learnercousecomplete.push({"course_ID":learnercomplete[eligiblelearner]['course_ID'],"status":learnercomplete[eligiblelearner]['status'] })
            }
            if(total==learnercomplete.length){
                eligiblelearnerdetail={"user_ID":onlylearner[divlearner]['user_ID'], "completed_course":learnercousecomplete  }
                finaleligiblelearner.push(eligiblelearnerdetail)
            }
        }

    }
  
    noteligible=[]
    eligiblelearners=[]

        //find student who taken the main course itself
    for (var eligiblelearner in finaleligiblelearner) {
      
      
        for(var completeid in finaleligiblelearner[eligiblelearner]['completed_course']) {
            if(Object.values(finaleligiblelearner[eligiblelearner]['completed_course'][completeid]).includes(parseInt(courseid) ) 
                && Object.values(finaleligiblelearner[eligiblelearner]['completed_course'][completeid]).includes('COMPLETED')  ) {
                noteligible.push(finaleligiblelearner[eligiblelearner]['user_ID'])
                     }


                    }
                }
           
            for (clearlearner in finaleligiblelearner){
            
                    if(noteligible.includes(finaleligiblelearner[clearlearner]['user_ID'])== false && eligiblelearners.includes(finaleligiblelearner[clearlearner]['user_ID']) ==false) {
                      
                        eligiblelearners.push(finaleligiblelearner[clearlearner]['user_ID'])  
                    }
                

            }

    for (let i = 0; i < allstudentresponse.length; i++ ){

        if(allstudentresponse[i]['roles'].includes('learner')&& trainerids.includes(allstudentresponse[i]['user_ID']) ==false  
            && classusers.includes(allstudentresponse[i]['user_ID'] ) == false
            && eligiblelearners.includes(allstudentresponse[i]['user_ID'])    
            ){
        numberstudent+=1
        allstudentlist+=`
        

        <li>
                                    <input type="checkbox" name="studentcheckbox" id="studentcheckbox` + numberstudent.toString()  + `" value="${allstudentresponse[i]['name']}?${allstudentresponse[i]['user_ID']}" >
                                    <label for="studentcheckbox` + numberstudent.toString()+ `">${allstudentresponse[i]['name']}</label>
        </li>
        `
    
        }
    }

    document.getElementById("allstudentlist").innerHTML = allstudentlist;

    }

    else{
        //get all user who is learner
        onlylearner = []
      
       
        for (let i = 0; i < allstudentresponse.length; i++ ) {
            //to ensure onlylearner only consist of those who is learner && not trainer of the course && does not belong to any of the class of the course
            if(allstudentresponse[i]['roles'].includes('learner')&& trainerids.includes(allstudentresponse[i]['user_ID']) ==false && classusers.includes(allstudentresponse[i]['user_ID'] ) == false){
                onlylearner.push(allstudentresponse[i])
                     }
    
    
    
                }
    
    //status either ATTEMPTED OR COMPLETED
  
  

   
    finaleligiblelearner = []
    for (var divlearner in onlylearner) {
        total= 0
        learnercousecomplete = []
        if(learnercomplete.length == 0 ){
            eligiblelearnerdetail={"user_ID":onlylearner[divlearner]['user_ID'], "completed_course":learnercousecomplete  }
                finaleligiblelearner.push(eligiblelearnerdetail)
        }
        for(eligiblelearner in learnercomplete){
             total+=1
            if(onlylearner[divlearner]['user_ID']==learnercomplete[eligiblelearner]['learner_ID']  ){
                learnercousecomplete.push({"course_ID":learnercomplete[eligiblelearner]['course_ID'],"status":learnercomplete[eligiblelearner]['status'] })
            }
            if(total==learnercomplete.length){
                eligiblelearnerdetail={"user_ID":onlylearner[divlearner]['user_ID'], "completed_course":learnercousecomplete  }
                finaleligiblelearner.push(eligiblelearnerdetail)
            }
        }

    }

 
    eligiblelearnerlist = []

    noteligible=[]
    eligiblelearners=[]
    //find student who taken the main course itself
    for (var eligiblelearner in finaleligiblelearner) {
      
      
        for(var completeid in finaleligiblelearner[eligiblelearner]['completed_course']) {
            if(Object.values(finaleligiblelearner[eligiblelearner]['completed_course'][completeid]).includes(parseInt(courseid) ) 
                && Object.values(finaleligiblelearner[eligiblelearner]['completed_course'][completeid]).includes('COMPLETED')  ) {
                noteligible.push(finaleligiblelearner[eligiblelearner]['user_ID'])
                     }


                    }
                }
           
            for (clearlearner in finaleligiblelearner){
               
                    if(noteligible.includes(finaleligiblelearner[clearlearner]['user_ID'])== false){
                      
                        eligiblelearners.push(finaleligiblelearner[clearlearner])  
                    }
                

            }
    
            finaleligiblelearner= eligiblelearners
    for (var eligiblelearner in finaleligiblelearner) {
        checkpre = 0
      
        for(var completeid in finaleligiblelearner[eligiblelearner]['completed_course']) {
           
                for(preid in prerequisiteids){
                    
                    if(Object.values(finaleligiblelearner[eligiblelearner]['completed_course'][completeid]).includes(parseInt(prerequisiteids[preid])) 
                        && Object.values(finaleligiblelearner[eligiblelearner]['completed_course'][completeid]).includes("COMPLETED")  
                         ) {
                        
                        checkpre +=1
                    }
                    if(checkpre == prerequisiteids.length && eligiblelearnerlist.includes(finaleligiblelearner[eligiblelearner]['user_ID'])==false) {
                        
                        eligiblelearnerlist.push(finaleligiblelearner[eligiblelearner]['user_ID'])
                    }
                }
        }
    }
     
      
        allstudentresponse = await fetch('https://user-container-7ii64z76zq-uc.a.run.app/user');
        allstudentresponse = await allstudentresponse.json();
        allstudentresponse = allstudentresponse.data.users
    for (let i = 0; i < allstudentresponse.length; i++ ){

        if(eligiblelearnerlist.includes(parseInt(allstudentresponse[i]['user_ID']))  ){
        numberstudent+=1
        allstudentlist+=`
        

        <li>
                                    <input type="checkbox" name="studentcheckbox" id="studentcheckbox` + numberstudent.toString()  + `" value="${allstudentresponse[i]['name']}?${allstudentresponse[i]['user_ID']}" >
                                    <label for="studentcheckbox` + numberstudent.toString()+ `">${allstudentresponse[i]['name']}</label>
        </li>
        `
    
            }
        document.getElementById("allstudentlist").innerHTML = allstudentlist;
        }
    }

}








function logout(){
    localStorage.clear();
    window.location.href = "login.html";
}