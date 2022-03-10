


function clearfield() {
    document.getElementById("classname").value="";
    document.getElementById("classsize").value="";
    document.getElementById("enrolstartdate").value="";
    document.getElementById("enrolenddate").value="";
    document.getElementById("startdatetime").value="";
    document.getElementById("enddatetime").value="";
    document.getElementById("instructorselected").innerText="";
    var checks = document.querySelectorAll('input[name="instructorselect"]:checked');
    for(var i =0; i< checks.length;i++){
        var check = checks[i];
        if(!check.disabled){
            check.checked = false;
        }
    }
   
  }  


  
  
async function updatecourse(){

courseid = localStorage.getItem("courseid");

coursecode= document.getElementById("coursecode").value
coursename= document.getElementById("coursename").value
estimatedduration= document.getElementById("estimatedduration").value
shortdescription = document.getElementById("shortdescription").value
coursestatus = document.getElementById("coursestatus").value
var prerequisites = []
var checkboxes = document.querySelectorAll('input[name="prerequsitecheck"]:checked')
for (var i = 0; i < checkboxes.length; i++) {
   
    prerequisites.push(checkboxes[i].value)
  }

  //if hr never select any prerequisite then take the default
if (prerequisites.length == 0){
    prerequisites = courseprerequisite;
}

updatedcoursedetail= {
    course_code:coursecode,
    course_name:coursename,
    description:shortdescription,
    duration:estimatedduration,
    prerequisite:prerequisites,
    badge:"Nil",
    hr_ID: localStorage.getItem("user_ID"),
    status:"OPEN"
}


response = await fetch("https://course-container-7ii64z76zq-uc.a.run.app/course/" + courseid , {
        method: "PUT",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        },
     
        body: JSON.stringify(updatedcoursedetail)
    });
    
     result = await response.json();
  
    $("#success_msg").modal();
    setTimeout(function(){  $("#success_msg").modal("hide"); }, 2000);
    displaycourseinfo();
}


function validateupdatecourseForm() {
 
    if (document.getElementById("coursecode").value == "" 
    | document.getElementById("coursename").value == "" 
    | document.getElementById("estimatedduration").value == "" 
    | document.getElementById("shortdescription").value == "" 
    ) 
 
    {
      alert("Please fill up the empty fields if you want to add new courses.");
      return false;
    }
    else if (Number.isInteger(parseInt(document.getElementById("estimatedduration").value))== false){
        alert("Duration must be numbers");
        return false;
    }
  
    else {
        updatecourse();
    }
}
  

  
async function addclass(){
    var url_string = window.location;
    var url = new URL(url_string);
    classname= document.getElementById("classname").value
    classsize= document.getElementById("classsize").value
    enrolstartdate= document.getElementById("enrolstartdate").value
    formatstartdate = (enrolstartdate.split("/"))
    enrolstartdate = formatstartdate[2] + "-" + formatstartdate[0] + "-" + formatstartdate[1]
    
    courseid= url.searchParams.get("courseid");
    enrolenddate = document.getElementById("enrolenddate").value
    formatenddate = (enrolenddate.split("/"))
    enrolenddate = formatenddate[2] + "-" + formatenddate[0] + "-" + formatenddate[1]
    var instructor = ""
    var checkboxes = document.querySelectorAll('input[name="instructorselect"]:checked')
   

    startdatetime=document.getElementById("startdatetime").value
    enddatetime= document.getElementById("enddatetime").value
    
    for (var i = 0; i < checkboxes.length; i++) {
   
        instructor=(checkboxes[i].value)
      }
 
    if(instructor!=""){
        instructorinfo = instructor.split("_")
        instructorID = instructorinfo[1]
    }

    else if (instructor == "" ){
        instructorID= -1
    }
    else if (instructorID== "0") {
        instructorID= -1
    }
    
    
    newclassdetail= {
        class_name:classname,
        course_ID:courseid,
        size:classsize,
        starting_date:startdatetime,
        ending_date:enddatetime,
        hr_ID:localStorage.getItem("user_ID"),
        trainer_ID: instructorID,
        enrol_start_date:enrolstartdate,
        enrol_end_date:enrolenddate
    }


    response = await fetch("https://class-container-7ii64z76zq-uc.a.run.app/class", {
        method: "POST",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        },
     
        body: JSON.stringify(newclassdetail)
    });
    
     result = await response.json();
  
     if(result.code==400){
         alert("Class Name Exist, Please try again.")
         return false
     }
     $("#success_msg").modal();
     setTimeout(function(){  $("#success_msg").modal("hide"); }, 2000);
     document.getElementById("classname").value= ''
     document.getElementById("classsize").value = ''
     document.getElementById("enrolstartdate").value =''
     document.getElementById("enrolenddate").value = ''
     document.getElementById("startdatetime").value =''
     document.getElementById("enddatetime").value =''
     for (var i = 0; i < checkboxes.length; i++) {
   
        checkboxes[i].checked = false
      }
     document.getElementById("instructorselected").innerText =''
     displayclass();

    }
    

function validateclassForm() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    currentdate = yyyy + '/' + mm + '/' + dd;
    
    enrolstartyear= document.getElementById("enrolstartdate").value.slice(6,)
    enrolendyear = document.getElementById("enrolenddate").value.slice(6,)
    startyear = document.getElementById("startdatetime").value.slice(0,4)
    endyear = document.getElementById("enddatetime").value.slice(0,4)
    currentyear = currentdate.slice(0,4)


    newformattedenrolstartdate =  enrolstartyear + "/" + document.getElementById("enrolstartdate").value.slice(0,2) + "/" + document.getElementById("enrolstartdate").value.slice(3,5) 
    newformattedenrolenddate =  enrolendyear + "/" + document.getElementById("enrolenddate").value.slice(0,2) + "/" + document.getElementById("enrolenddate").value.slice(3,5) 
    formatstartdate = document.getElementById("startdatetime").value.slice(5,7) + "/" + document.getElementById("startdatetime").value.slice(8,10)+ "/" +document.getElementById("startdatetime").value.slice(0,4) 
    formatenddate = document.getElementById("enddatetime").value.slice(5,7) + "/" + document.getElementById("enddatetime").value.slice(8,10)+ "/" +document.getElementById("enddatetime").value.slice(0,4) 
    formatstartdatetest = document.getElementById("startdatetime").value.slice(0,4) + "/" + document.getElementById("startdatetime").value.slice(5,7)+ "/" +document.getElementById("startdatetime").value.slice(8,10) 
    formatenddatetest = document.getElementById("enddatetime").value.slice(0,4) + "/" + document.getElementById("enddatetime").value.slice(5,7)  + "/" +  document.getElementById("enddatetime").value.slice(8,10)

    if (document.getElementById("classname").value == "" 
    | document.getElementById("classsize").value == "" 
    | document.getElementById("enrolstartdate").value == "" 
    | document.getElementById("enrolenddate").value == "" 
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
        
       addclass();
    }
}
  
  
  
  
  



courseprerequisite= [];
window.onload =  function (){
    course_detail();
}
    
    async function course_detail(){
    if (localStorage.getItem("username") == null) { 
        alert("You have to Log In First");
       
        window.location.href = "login.html";
    }
    else {
    //retrieve course details
    var url = window.location.href
    url.indexOf("?")
    var course_class_id_url_back = url.slice(url.indexOf("?")+1)
    user_name =  localStorage.getItem("username")
    document.getElementById("navbarDropdown1").innerText = user_name; 
    myArr = course_class_id_url_back.split("&")
    retrievecourseid = myArr[0].split("=")[1]
    localStorage.setItem("courseid",retrievecourseid)
    //retrieve specific course info
    response = await fetch('https://course-container-7ii64z76zq-uc.a.run.app/course?course_ID='+ retrievecourseid);
    specificcourse = await response.json();
    specificcourse = specificcourse.data.course;
    console.log(specificcourse)

    if(specificcourse['status']== "RETIRED"){
        document.getElementById("updatecoursebutton").disabled = true;
        document.getElementById("addclassbutton").disabled = true;
    }
    
    //DISPLAY to the course information 
    document.getElementById("courseheader").innerHTML='<img src="Images/setting.png" width="35" height="35"> ' + specificcourse['course_code'] + "-" + specificcourse["name"];
    document.getElementById("coursecode").value=specificcourse["course_code"];
    document.getElementById("coursename").value=specificcourse["name"];
    document.getElementById("estimatedduration").value=specificcourse["duration"];
    document.getElementById("shortdescription").value=specificcourse["description"];
    document.getElementById("coursestatus").value=specificcourse["status"];
    currentprerequisite = ''
    for (let i = 0; i < specificcourse["prerequisites"].length; i++) {
        courseprerequisite.push( specificcourse["prerequisites"][i]["course_ID"])
        if(i != specificcourse["prerequisites"].length-1){
            currentprerequisite+= "[" + specificcourse["prerequisites"][i]["course_code"] + "] " + specificcourse["prerequisites"][i]["name"] + "<br> "
        }
        else{
        currentprerequisite+= "[" + specificcourse["prerequisites"][i]["course_code"] + "] " + specificcourse["prerequisites"][i]["name"]
        }
    }
    document.getElementById("prerequisitedisplay").innerHTML=currentprerequisite;


    classresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class?course_ID='+ retrievecourseid);
    classresponse = await classresponse.json();
 
    classresponse = classresponse.data.classes;
    courseclasslist=classresponse
    classusers=[]
    //retrieve all trainer ID and class_id OF ALL related class of course
    
    for(var selectedclassid in courseclasslist){
      
        classuserresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class/class_user/'+ courseclasslist[selectedclassid]['class_ID']);
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
        
                if(alluserresponse[detail]['roles'].includes('trainer') &&classusers.includes(alluserresponse[detail]['user_ID'])==false ){
                numberinstructor+=1
                
                allinstructor += `
                
                
                    <a class="dropdown-item">
                    <!-- Default unchecked -->
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" name="instructorselect" onclick="check(this);" id="instructorcheckbox` + numberinstructor.toString() + `"` + `value= "[${alluserresponse[detail]['job_title']}] ${alluserresponse[detail]['name']}_${alluserresponse[detail]['user_ID']}"` + `>` + 
                        `<label class="custom-control-label" id="labeltext"  for="instructorcheckbox` + numberinstructor.toString() + `">` + `[${alluserresponse[detail]['job_title']}] `  +`${alluserresponse[detail]['name']}</label>
                    </div>
                    </a>
                
                `   ;
                }
    }
    document.getElementById("dropdown-menu-instructor").innerHTML = allinstructor;


    //retrieve all course for prerequisite dropdown

    prerequsiteresponse = await fetch('https://course-container-7ii64z76zq-uc.a.run.app/course');
    prerequsitedrop = await prerequsiteresponse.json();
    prerequisite_course= ''
    checknumber= 0
    prerequsitedrop = prerequsitedrop.data.courses
    prerequisite_course= `<a class="dropdown-item">
    <!-- Default unchecked -->
    <div class="custom-control custom-checkbox">
        <input type="checkbox" onclick="precoursecheck(this);" class="custom-control-input" name="prerequsitecheck" id="checkbox0"`  + `value= ""` + `>` + 
        `<label class="custom-control-label" id="labeltext"  for="checkbox0">None` + `</label>
    </div>
    </a>`;
    for (var prerequisitecourse in prerequsitedrop){
        if(retrievecourseid != prerequsitedrop[prerequisitecourse]['course_ID']){
        checknumber+=1
        
        prerequisite_course += `
        
        
            <a class="dropdown-item">
            <!-- Default unchecked -->
            <div class="custom-control custom-checkbox">
                <input type="checkbox" onclick="precoursecheck(this);" class="custom-control-input" name="prerequsitecheck" id="checkbox` + checknumber.toString() + `"` + `value= "${prerequsitedrop[prerequisitecourse]['course_ID']}"` + `>` + 
                `<label class="custom-control-label" id="labeltext"  for="checkbox` + checknumber.toString() + `">` + `[${prerequsitedrop[prerequisitecourse]['course_code']}] `  +`${prerequsitedrop[prerequisitecourse]['name']}</label>
            </div>
            </a>
        
        `
       
        
        ;
        }
    }
  
    document.getElementById("dropdown-menu").innerHTML = prerequisite_course;

    //retrieve all class for course table
    classresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class?course_ID='+ retrievecourseid);
    classresponse = await classresponse.json();
    if (classresponse.code == 200 ){
    classresponse = classresponse.data.classes;
    }
   
    var str = ''
    var numbercheck = 0
    var deletemodalbox = '';
    if (classresponse.code == 400){
        str += `
            <tr>
                <td colspan="9" style="text-align: center;"><br><br><br><br><br>There are no classes<br><br><br><br><br></td>
            </tr>
        `;
    } else {
        for (var hr_courses in classresponse){
   
                    numbercheck+=1
                    if(classresponse[hr_courses]['class_status']=="NEW"){
                        if(classresponse[hr_courses]['trainer_info']['trainer_name']==null){
                            classresponse[hr_courses]['trainer_info']['trainer_name']=''
                        }

                        if(specificcourse['status']!="RETIRED"){
                        str += `
                        <tr>
                            <td scope="row">${classresponse[hr_courses]['class_name']}</td>
                            <td>${classresponse[hr_courses]['size']}</td>
                            <td>${classresponse[hr_courses]['enrol_start_date'] } - <br>${classresponse[hr_courses]['enrol_end_date'] }</td>
                            <td>${classresponse[hr_courses]['starting_date'] } - <br>${classresponse[hr_courses]['ending_date'] }</td>
                            <td>${classresponse[hr_courses]['class_status']}</td>
                            <td>${classresponse[hr_courses]['trainer_info']['trainer_name']}</td>
                            <td>${classresponse[hr_courses]['course_info']['hr_name']}</td>
                        
                            <td style="text-align:center;">
                                <button onclick="classdetail(this.id)" id="${classresponse[hr_courses]['course_ID']}_${classresponse[hr_courses]['class_ID']}` +`"` +  `type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; ">View Class</button><br>
                                <button id="${classresponse[hr_courses]['course_ID']}_${classresponse[hr_courses]['class_ID']}" type="button" class="btn btn-secondary btn-sm btn-block" style="text-align: center;"data-toggle="modal" data-target="#deletemodal`+ [numbercheck]  + `">Delete Class</button><br>
                            </td>
                        </tr>
                    `
                    }

                    else if(specificcourse['status'] == "RETIRED"){
                        str += `
                        <tr>
                            <td scope="row">${classresponse[hr_courses]['class_name']}</td>
                            <td>${classresponse[hr_courses]['size']}</td>
                            <td>${classresponse[hr_courses]['enrol_start_date'] } - <br>${classresponse[hr_courses]['enrol_end_date'] }</td>
                            <td>${classresponse[hr_courses]['starting_date'] } - <br>${classresponse[hr_courses]['ending_date'] }</td>
                            <td>${classresponse[hr_courses]['class_status']}</td>
                            <td>${classresponse[hr_courses]['trainer_info']['trainer_name']}</td>
                            <td>${classresponse[hr_courses]['course_info']['hr_name']}</td>
                        
                            <td style="text-align:center;">
                                <button onclick="classdetail(this.id)" id="${classresponse[hr_courses]['course_ID']}_${classresponse[hr_courses]['class_ID']}` +`"` +  `type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; ">View Class</button><br>
                                
                            </td>
                        </tr>
                    `

                    }
                    deletemodalbox +=`<div class="modal fade" id="deletemodal` + [numbercheck] + `"` + ` tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" >
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Delete Class</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            Confirm delete class? Once you delete class, all students will be removed from the class.
                        </div>
                        <div class="modal-footer">
                            <button type="button" data-toggle="modal" data-target="#deletemodal" id="${classresponse[hr_courses]['course_ID']}_${classresponse[hr_courses]['class_ID']}" class="btn btn-success" data-dismiss="modal" onclick="deleteclass(this.id)">Confirm</button>
                            <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>
                        </div>
                        </div>
                    </div>
                    </div>`
                    
                    ;
                    }
                    else{
                        if(classresponse[hr_courses]['trainer_info']['trainer_name']==null){
                            classresponse[hr_courses]['trainer_info']['trainer_name']=''
                        }

                        
                    str += `
                        <tr>
                            <td scope="row">${classresponse[hr_courses]['class_name']}</td>
                            <td>${classresponse[hr_courses]['size']}</td>
                            <td>${classresponse[hr_courses]['enrol_start_date'] } - <br>${classresponse[hr_courses]['enrol_end_date'] }</td>
                            <td>${classresponse[hr_courses]['starting_date'] } - <br> ${classresponse[hr_courses]['ending_date'] }</td>
                            <td>${classresponse[hr_courses]['class_status']}</td>
                            <td>${classresponse[hr_courses]['trainer_info']['trainer_name']}</td>
                            <td>${classresponse[hr_courses]['course_info']['hr_name']}</td>
                        
                            <td style="text-align:center;">
                            <button onclick="classdetail(this.id)" id="${classresponse[hr_courses]['course_ID']}_${classresponse[hr_courses]['class_ID']}`  +`"` +  `type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; ">View Class</button><br>
                                
                            </td>
                        </tr>
                    `; 
                    }
                
        }
    }
  
    document.getElementById("all_class").innerHTML = str;
    document.getElementById("modalarea1").innerHTML += deletemodalbox;
    }   

  
}

//goes to next page base on button clicked
function classdetail(courseid){
  
    myArr = courseid.split("_")
  
    url = "hrclassdetail.html?courseid=" + myArr[0] + "&classid=" + myArr[1] 
    window.location.href = url;
}


async function deleteclass(classid){

    myArr = classid.split("_")
    
    response = await fetch("https://class-container-7ii64z76zq-uc.a.run.app/class/" + myArr[1], {
        method: "DELETE",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        }
     
      
    });
    
     result = await response.json();
  
     $("#success_msg").modal();
     setTimeout(function(){  $("#success_msg").modal("hide"); }, 2000);
     displayclass();
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
        document.getElementById("instructorselected").innerText = "Selected Trainer: " + instructnamejob;
    }	
}



function precoursecheck(input)
{
    
    var checkboxes = document.getElementsByName("prerequsitecheck");
    for(var i = 0; i < checkboxes.length; i++)
    {
        //uncheck all
        
        if(checkboxes[i].checked == true)
        {
            checkboxes[i].checked = false;
         
        }
    }
    
    //set checked of clicked object
    if(input.checked == true)
    {
        input.checked = false;
        
    }
    else
    {
        input.checked = true;
      
    }	
}







async function displaycourseinfo(){
    var url = window.location.href
    url.indexOf("?")
    var course_class_id_url_back = url.slice(url.indexOf("?")+1)
 
    user_name =  localStorage.getItem("username")
    document.getElementById("navbarDropdown1").innerText = user_name; 
    myArr = course_class_id_url_back.split("&")
    retrievecourseid = myArr[0].split("=")[1]
    localStorage.setItem("courseid",retrievecourseid)
    //retrieve specific course info
    response = await fetch('https://course-container-7ii64z76zq-uc.a.run.app/course?course_ID='+ retrievecourseid);
    specificcourse = await response.json();
    specificcourse = specificcourse.data.course;
    if(specificcourse['status']== "RETIRED"){
        document.getElementById("updatecoursebutton").disabled = true;
        document.getElementById("addclassbutton").disabled = true;
    }
    
    //DISPLAY to the course information 
    document.getElementById("courseheader").innerHTML='<img src="images/setting.png" width="35" height="35"> ' + specificcourse['course_code'] + "-" + specificcourse["name"];
    document.getElementById("coursecode").value=specificcourse["course_code"];
    document.getElementById("coursename").value=specificcourse["name"];
    document.getElementById("estimatedduration").value=specificcourse["duration"];
    document.getElementById("shortdescription").value=specificcourse["description"];
    currentprerequisite = ''
    for (let i = 0; i < specificcourse["prerequisites"].length; i++) {
        courseprerequisite.push( specificcourse["prerequisites"][i]["course_ID"])
        if(i != specificcourse["prerequisites"].length-1){
            currentprerequisite+= "[" + specificcourse["prerequisites"][i]["course_code"] + "] " + specificcourse["prerequisites"][i]["name"] + "<br> "
        }
        else{
        currentprerequisite+= "[" + specificcourse["prerequisites"][i]["course_code"] + "] " + specificcourse["prerequisites"][i]["name"]
        }
    }
    document.getElementById("prerequisitedisplay").innerHTML=currentprerequisite;




    //retrieve all course for prerequisite dropdown

    prerequsiteresponse = await fetch('https://course-container-7ii64z76zq-uc.a.run.app/course');
    prerequsitedrop = await prerequsiteresponse.json();
    prerequisite_course= ''
    checknumber= 0
    prerequsitedrop = prerequsitedrop.data.courses
    prerequisite_course= `<a class="dropdown-item">
    <!-- Default unchecked -->
    <div class="custom-control custom-checkbox">
        <input type="checkbox" class="custom-control-input" onclick="precoursecheck(this);" name="prerequsitecheck" id="checkbox0"`  + `value= ""` + `>` + 
        `<label class="custom-control-label" id="labeltext"  for="checkbox0">None` + `</label>
    </div>`
    for (var prerequisitecourse in prerequsitedrop){
        if(retrievecourseid != prerequsitedrop[prerequisitecourse]['course_ID']){
        checknumber+=1
        
        prerequisite_course += `
        
        
            <a class="dropdown-item">
            <!-- Default unchecked -->
            <div class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input" onclick="precoursecheck(this);" name="prerequsitecheck" id="checkbox` + checknumber.toString() + `"` + `value= "${prerequsitedrop[prerequisitecourse]['course_ID']}"` + `>` + 
                `<label class="custom-control-label" id="labeltext"  for="checkbox` + checknumber.toString() + `">` + `[${prerequsitedrop[prerequisitecourse]['course_code']}] `  +`${prerequsitedrop[prerequisitecourse]['name']}</label>
            </div>
            </a>
        
        `;
        }
    }
  
    document.getElementById("dropdown-menu").innerHTML = prerequisite_course;

}



async function displayclass(){
    document.getElementById("modalarea1").innerHTML=''
    var url = window.location.href
    url.indexOf("?")
    var course_class_id_url_back = url.slice(url.indexOf("?")+1)
    myArr = course_class_id_url_back.split("&")
    retrievecourseid = myArr[0].split("=")[1]
     //retrieve all class for course table
    classresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class?course_ID='+ retrievecourseid);

    classresponse = await classresponse.json();
    if (classresponse.code == 200 ){
    classresponse = classresponse.data.classes;
    }
    response = await fetch('https://course-container-7ii64z76zq-uc.a.run.app/course?course_ID='+ retrievecourseid);
    specificcourse = await response.json();
    specificcourse = specificcourse.data.course;

    var str = ''
    var numbercheck = 0
    var deletemodalbox = '';
    if (classresponse.code == 400){
        str += `
            <tr>
                <td colspan="9" style="text-align: center;"><br><br><br><br><br>There are no classes<br><br><br><br><br></td>
            </tr>
        `;
    } else {
        for (var hr_courses in classresponse){
                
                    numbercheck+=1
                    if(classresponse[hr_courses]['class_status']=="NEW"){
                        if(classresponse[hr_courses]['trainer_info']['trainer_name']==null){
                            classresponse[hr_courses]['trainer_info']['trainer_name']=''
                        }
                        if(specificcourse['status']!="RETIRED"){
                        str += `
                        <tr>
                            <td scope="row">${classresponse[hr_courses]['class_name']}</td>
                            <td>${classresponse[hr_courses]['size']}</td>
                            <td>${classresponse[hr_courses]['enrol_start_date'] } - <br>${classresponse[hr_courses]['enrol_end_date'] }</td>
                            <td>${classresponse[hr_courses]['starting_date'] } - <br>${classresponse[hr_courses]['ending_date'] }</td>
                            <td>${classresponse[hr_courses]['class_status']}</td>
                            <td>${classresponse[hr_courses]['trainer_info']['trainer_name']}</td>
                            <td>${classresponse[hr_courses]['course_info']['hr_name']}</td>
                        
                            <td style="text-align:center;">
                                <button onclick="classdetail(this.id)" id="${classresponse[hr_courses]['course_ID']}_${classresponse[hr_courses]['class_ID']}` +`"` +  `type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; ">View Class</button><br>
                                <button id="${classresponse[hr_courses]['course_ID']}_${classresponse[hr_courses]['class_ID']}" type="button" class="btn btn-secondary btn-sm btn-block" style="text-align: center;"data-toggle="modal" data-target="#deletemodal`+ [numbercheck]  + `">Delete Class</button><br>
                            </td>
                        </tr>
                    `
                    }

                    else if(specificcourse['status'] == "RETIRED"){
                        str += `
                        <tr>
                            <td scope="row">${classresponse[hr_courses]['class_name']}</td>
                            <td>${classresponse[hr_courses]['size']}</td>
                            <td>${classresponse[hr_courses]['enrol_start_date'] } - <br>${classresponse[hr_courses]['enrol_end_date'] }</td>
                            <td>${classresponse[hr_courses]['starting_date'] } - <br>${classresponse[hr_courses]['ending_date'] }</td>
                            <td>${classresponse[hr_courses]['class_status']}</td>
                            <td>${classresponse[hr_courses]['trainer_info']['trainer_name']}</td>
                            <td>${classresponse[hr_courses]['course_info']['hr_name']}</td>
                        
                            <td style="text-align:center;">
                                <button onclick="classdetail(this.id)" id="${classresponse[hr_courses]['course_ID']}_${classresponse[hr_courses]['class_ID']}` +`"` +  `type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; ">View Class</button><br>
                                
                            </td>
                        </tr>
                    `

                    }

                    deletemodalbox +=`<div class="modal fade" id="deletemodal` + [numbercheck] + `"` + ` tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" >
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Delete Class</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            Confirm delete class? Once you delete class, all students will be removed from the class.
                        </div>
                        <div class="modal-footer">
                            <button type="button" data-toggle="modal" data-target="#deletemodal" id="${classresponse[hr_courses]['course_ID']}_${classresponse[hr_courses]['class_ID']}" class="btn btn-success" data-dismiss="modal" onclick="deleteclass(this.id)">Confirm</button>
                            <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>
                        </div>
                        </div>
                    </div>
                    </div>`
                    
                    ;
                    }
                    else{
                        if(classresponse[hr_courses]['trainer_info']['trainer_name']==null){
                            classresponse[hr_courses]['trainer_info']['trainer_name']=''
                        }
                    str += `
                        <tr>
                            <td scope="row">${classresponse[hr_courses]['class_name']}</td>
                            <td>${classresponse[hr_courses]['size']}</td>
                            <td>${classresponse[hr_courses]['enrol_start_date'] } - <br>${classresponse[hr_courses]['enrol_end_date'] }</td>
                            <td>${classresponse[hr_courses]['starting_date'] } - <br> ${classresponse[hr_courses]['ending_date'] }</td>
                            <td>${classresponse[hr_courses]['class_status']}</td>
                            <td>${classresponse[hr_courses]['trainer_info']['trainer_name']}</td>
                            <td>${classresponse[hr_courses]['course_info']['hr_name']}</td>
                        
                            <td style="text-align:center;">
                            <button onclick="classdetail(this.id)" id="${classresponse[hr_courses]['course_ID']}_${classresponse[hr_courses]['class_ID']}`  +`"` +  `type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; ">View Class</button><br>
                                
                            </td>
                        </tr>
                    `;
                    }
                
        }
    }
  
    document.getElementById("all_class").innerHTML = str;
    document.getElementById("modalarea1").innerHTML += deletemodalbox;
}




function logout(){
    localStorage.clear();
    window.location.href = "login.html";
}