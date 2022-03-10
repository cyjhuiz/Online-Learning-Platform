


function clearfield() {
    document.getElementById("coursecode").value="";
    document.getElementById("coursename").value="";
    document.getElementById("estimatedduration").value="";
    document.getElementById("shortdescription").value="";
  }  


  
  
async function addnewcourse(){
user_ID =  localStorage.getItem("user_ID")
coursecode= document.getElementById("coursecode").value.toUpperCase() 
coursename= document.getElementById("coursename").value

estimatedduration= document.getElementById("estimatedduration").value
shortdescription = document.getElementById("shortdescription").value
var prerequisites = []
var checkboxes = document.querySelectorAll('input[type=checkbox]:checked')
for (var i = 0; i < checkboxes.length; i++) {
    prerequisiteid = checkboxes[i].value.split("_")
    prerequisites.push(prerequisiteid[0])
  }

newcoursedetail= {
    course_code:coursecode,
    course_name:coursename,
    description:shortdescription,
    duration:estimatedduration,
    prerequisites:prerequisites,
    hr_ID: user_ID,
    badge: "Nil"
}


response = await fetch("https://course-container-7ii64z76zq-uc.a.run.app/course", {
        method: "POST",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        },
     
        body: JSON.stringify(newcoursedetail)
    });
    
     result = await response.json();
 
    if(result.code==400){
        alert("Course Code Exist, Please try again.")
        return false
    }
    $("#success_msg").modal();
    setTimeout(function(){  $("#success_msg").modal("hide"); }, 2000);
  

    document.getElementById("coursecode").value = ''
    document.getElementById("coursename").value = ''
    document.getElementById("estimatedduration").value = ''
    document.getElementById("shortdescription").value=''
    for (var i = 0; i < checkboxes.length; i++) {
   
        checkboxes[i].checked = false
      }
    refreshallcoursetable();
 
}


function validateForm() {
 
    if (document.getElementById("coursecode").value == "" 
    | document.getElementById("coursename").value == "" 
    | document.getElementById("estimatedduration").value == "" 
    | document.getElementById("shortdescription").value == "" 
    ) 
 
    {
      alert("Please fill up the empty fields with * if you want to add new courses.");
      return false;
    }
    else if (Number.isInteger(parseInt(document.getElementById("estimatedduration").value))== false){
        alert("Duration must be numbers");
        return false;
    }
  
    else {
        addnewcourse();
    }
}
  
  
  
  
  


window.onload = async function get_hr_course(){








    if (localStorage.getItem("username") == null) { 
        alert("You have to Log In First");
       
        window.location.href = "login.html";
    }
    else {
        document.getElementById("all_courses").innerHTML = `<td colspan="18" style="text-align: center;"><br><br><br><br><br> <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"> <span class="sr-only">Loading...</span> </div><br><br><br><br><br> </td>`
        user_name =  localStorage.getItem("username")
        document.getElementById("navbarDropdown1").innerText = user_name; 
       
        response = await fetch('https://course-container-7ii64z76zq-uc.a.run.app/course?include_retire='+ 1);
        allcourse = await response.json();
        allhrid = [];
  
        allcourse = allcourse.data.courses;
        checknumber= 0
        prerequisite_course=''
     

        
        for (var prerequisitecourse in allcourse){
            checknumber+=1
            
            prerequisite_course += `
            
            
                <a class="dropdown-item">
                <!-- Default unchecked -->
                <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" name="prerequsitecheck" onclick="precoursecheck(this);"  id="checkbox` + checknumber.toString() + `"` + `value= "${allcourse[prerequisitecourse]['course_ID']}_${allcourse[prerequisitecourse]['course_code']}_${allcourse[prerequisitecourse]['name']}"` + `>` + 
                    `<label class="custom-control-label" id="labeltext"  for="checkbox` + checknumber.toString() + `">` + `[${allcourse[prerequisitecourse]['course_code']}] `  +`${allcourse[prerequisitecourse]['name']}</label>
                </div>
                </a>
            
            `;
        }
        document.getElementById("dropdown-menu").innerHTML = prerequisite_course;

        //retrieve all course for course table
        var str = ''
        var deletemodal = ''
        var retiremodal= ''
        numbercheck=0
        if (Object.getOwnPropertyNames(allcourse).length === 0){
            str += `
                <tr>
                    <td colspan="9" style="text-align: center;"><br><br><br><br><br>There are no courses<br><br><br><br><br></td>
                </tr>
            `;
        } else {
            for (var hr_courses in allcourse){
                eachprerequisite = '';
                numbercheck+=1
                if(allcourse[hr_courses]['prerequisites'].length == 0){
                    eachprerequisite = 'None'
                }
                for (let i = 0; i < allcourse[hr_courses]['prerequisites'].length; i++) {
                        
                    eachprerequisite+= "[" + allcourse[hr_courses]['prerequisites'][i]['course_code'] + "] " + allcourse[hr_courses]['prerequisites'][i]['name']
                    if (i != allcourse[hr_courses]['prerequisites'].length -1) {
                        eachprerequisite+=", "
                    }
                }
                if(allcourse[hr_courses]['status']== "RETIRED"){
                    str += `
                    <tr >
                        <td scope="row" style="background-color:white; opacity:0.4;">${allcourse[hr_courses]['course_code']}</td>
                        <td style="background-color:white; opacity:0.4;">${allcourse[hr_courses]['name']}</td>
                        <td style="background-color:white; opacity:0.4;">${allcourse[hr_courses]['description']}</td>
                        <td style="background-color:white; opacity:0.4;">${allcourse[hr_courses]['duration']}</td>
                        <td style="background-color:white; opacity:0.4;">${eachprerequisite}</td> 
                        <td style="background-color:white; opacity:0.4;">${allcourse[hr_courses]['hr_name']}</td>
                    
                        <td style="text-align:center;">
                            <button onclick="coursedetail(this.id)" id="${allcourse[hr_courses]['course_ID']}_${allcourse[hr_courses]['course_code']}" type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; ">View Retired Course</button><br>
                            <button id="${allcourse[hr_courses]['course_ID']}_${allcourse[hr_courses]['course_code']}" type="button" class="btn btn-secondary btn-sm btn-block" style="text-align: center;" data-toggle="modal" data-target="#deletemodal` + numbercheck + `" >Delete Course</button><br>
                            <button id="${allcourse[hr_courses]['course_ID']}_${allcourse[hr_courses]['course_code']}" type="button" class="btn btn-secondary btn-sm btn-block" style="text-align: center;" data-toggle="modal" data-target="#retiremodal` + numbercheck + `" disabled>Retire</button>
                        </td>
                    </tr>
                    
                `;
                }
                
                else if(allcourse[hr_courses]['status']!= "RETIRED") {
                str += `
                    <tr>
                        <td scope="row">${allcourse[hr_courses]['course_code']}</td>
                        <td>${allcourse[hr_courses]['name']}</td>
                        <td>${allcourse[hr_courses]['description']}</td>
                        <td>${allcourse[hr_courses]['duration']}</td>
                        <td>${eachprerequisite}</td> 
                        <td>${allcourse[hr_courses]['hr_name']}</td>
                    
                        <td style="text-align:center;">
                            <button onclick="coursedetail(this.id)" id="${allcourse[hr_courses]['course_ID']}_${allcourse[hr_courses]['course_code']}" type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; ">View Course</button><br>
                            <button id="${allcourse[hr_courses]['course_ID']}_${allcourse[hr_courses]['course_code']}" type="button" class="btn btn-secondary btn-sm btn-block" style="text-align: center;" data-toggle="modal" data-target="#deletemodal` + numbercheck + `" >Delete Course</button><br>
                            <button id="${allcourse[hr_courses]['course_ID']}_${allcourse[hr_courses]['course_code']}" type="button" class="btn btn-secondary btn-sm btn-block" style="text-align: center;" data-toggle="modal" data-target="#retiremodal` + numbercheck + `" >Retire</button>
                        </td>
                    </tr>
                    
                `;
                }
                deletemodal += `
                <div class="modal fade" id="deletemodal` + numbercheck + `" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" style="z-index: 99999 !important;">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Delete Course</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        Confirm delete course?  Once course is deleted, all the related class will be removed as well.
                    </div>
                    <div class="modal-footer">
                        <button type="button" onclick="deletecourse(this.id)" id="${allcourse[hr_courses]['course_ID']}_${allcourse[hr_courses]['course_code']}" class="btn btn-success" data-dismiss="modal">Confirm</button>
                        <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>
                    </div>
                    </div>
                </div>
                </div>`

                retiremodal+= `
            <div class="modal fade" id="retiremodal` + numbercheck + `" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" style="z-index: 99999 !important;">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Retire Course</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    Confirm retire course?  Once you retire course, you will not be able to undo your action.
                </div>
                <div class="modal-footer">
                    <button type="button" onclick="retire(this.id)" id="${allcourse[hr_courses]['course_ID']}" class="btn btn-success" data-dismiss="modal" >Confirm</button>
                    <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>
                </div>
                </div>
            </div>
            </div>`
            }
            
            
        }
     
        document.getElementById("all_courses").innerHTML = str;
        document.getElementById("modalarea1").innerHTML +=deletemodal
        document.getElementById("modalarea1").innerHTML +=retiremodal
    }
}

//goes to next page base on button clicked
function coursedetail(courseid){
    
    myArr = courseid.split("_")
   
    url = "hrcoursedetail.html?courseid=" + myArr[0] + "&coursecode=" + myArr[1]
    window.location.href = url;
}


async function deletecourse(courseid){
  
    myArr = courseid.split("_")
   
    response = await fetch("https://course-container-7ii64z76zq-uc.a.run.app/course/" + myArr[0], {
        method: "DELETE",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        }
     
      
    });
    
     result = await response.json();
   
    $("#success_msg").modal();
    setTimeout(function(){  $("#success_msg").modal("hide"); }, 2000);
    refreshallcoursetable();
  
}

async function retire(courseid){
  
    courseresponse = await fetch('https://course-container-7ii64z76zq-uc.a.run.app/course?course_ID='+ courseid);
    specificcourse = await courseresponse.json();
    specificcourse = specificcourse.data.course;
  
    preids=[]
    for(var preid in specificcourse['prerequisites'] ){
        preids.push(specificcourse['prerequisites'][preid]['course_ID'])
    }
  
    updatedcoursedetail= {
        course_code:specificcourse['course_code'],
        course_name:specificcourse['name'],
        description:specificcourse['description'],
        duration:specificcourse['duration'],
        prerequisite:preids,
        badge:specificcourse['badge'],
        hr_ID: specificcourse['hr_ID'],
        status:"RETIRED"
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
    refreshallcoursetable();
  
}









async function refreshallcoursetable(){
   
    if (localStorage.getItem("username") == null) { 
        alert("You have to Log In First");
       
        window.location.href = "login.html";
    }
    else {
        document.getElementById("all_courses").innerHTML = `<td colspan="18" style="text-align: center;"><br><br><br><br><br> <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"> <span class="sr-only">Loading...</span> </div><br><br><br><br><br> </td>`
        document.getElementById("modalarea1").innerHTML = ''
        user_name =  localStorage.getItem("username")
        document.getElementById("navbarDropdown1").innerText = user_name; 
        
        newresponse = await fetch('https://course-container-7ii64z76zq-uc.a.run.app/course?include_retire=' + 1);
        allcourse = await newresponse.json();
        allhrid = [];
   
        allcourse = allcourse.data.courses;
        console.log(allcourse)
        checknumber= 0
     
        

        

        //retrieve all course for course table
        var str = ''
        var deletemodal = ''
        var retiremodal= ''
        numbercheck=0
        if (Object.getOwnPropertyNames(allcourse).length === 0){
            str += `
                <tr>
                    <td colspan="9" style="text-align: center;"><br><br><br><br><br>There are no courses<br><br><br><br><br></td>
                </tr>
            `;
        } else {
            for (var hr_courses in allcourse){
                eachprerequisite = '';
                numbercheck+=1
                if(allcourse[hr_courses]['prerequisites'].length == 0){
                    eachprerequisite = 'None'
                }
                for (let i = 0; i < allcourse[hr_courses]['prerequisites'].length; i++) {
                        
                    eachprerequisite+= "[" + allcourse[hr_courses]['prerequisites'][i]['course_code'] + "] " + allcourse[hr_courses]['prerequisites'][i]['name']
                    if (i != allcourse[hr_courses]['prerequisites'].length -1) {
                        eachprerequisite+=", "
                    }
                }
               
                if(allcourse[hr_courses]['status']== "RETIRED"){
                    str += `
                    <tr >
                        <td scope="row" style="background-color:white; opacity:0.4;">${allcourse[hr_courses]['course_code']}</td>
                        <td style="background-color:white; opacity:0.4;"${allcourse[hr_courses]['name']}</td>
                        <td style="background-color:white; opacity:0.4;">${allcourse[hr_courses]['description']}</td>
                        <td style="background-color:white; opacity:0.4;">${allcourse[hr_courses]['duration']}</td>
                        <td style="background-color:white; opacity:0.4;">${eachprerequisite}</td> 
                        <td style="background-color:white; opacity:0.4;">${allcourse[hr_courses]['hr_name']}</td>
                    
                        <td style="text-align:center;">
                            <button onclick="coursedetail(this.id)" id="${allcourse[hr_courses]['course_ID']}_${allcourse[hr_courses]['course_code']}" type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; ">View Retired Course</button><br>
                            <button id="${allcourse[hr_courses]['course_ID']}_${allcourse[hr_courses]['course_code']}" type="button" class="btn btn-secondary btn-sm btn-block" style="text-align: center;" data-toggle="modal" data-target="#deletemodal` + numbercheck + `" >Delete Course</button><br>
                            <button id="${allcourse[hr_courses]['course_ID']}_${allcourse[hr_courses]['course_code']}" type="button" class="btn btn-secondary btn-sm btn-block" style="text-align: center;" data-toggle="modal" data-target="#retiremodal` + numbercheck + `" disabled>Retire</button>
                        </td>
                    </tr>
                    
                `;
                }
                
                else if(allcourse[hr_courses]['status']!= "RETIRED") {
                str += `
                    <tr>
                        <td scope="row">${allcourse[hr_courses]['course_code']}</td>
                        <td>${allcourse[hr_courses]['name']}</td>
                        <td>${allcourse[hr_courses]['description']}</td>
                        <td>${allcourse[hr_courses]['duration']}</td>
                        <td>${eachprerequisite}</td> 
                        <td>${allcourse[hr_courses]['hr_name']}</td>
                    
                        <td style="text-align:center;">
                            <button onclick="coursedetail(this.id)" id="${allcourse[hr_courses]['course_ID']}_${allcourse[hr_courses]['course_code']}" type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; ">View Course</button><br>
                            <button id="${allcourse[hr_courses]['course_ID']}_${allcourse[hr_courses]['course_code']}" type="button" class="btn btn-secondary btn-sm btn-block" style="text-align: center;" data-toggle="modal" data-target="#deletemodal` + numbercheck + `" >Delete Course</button><br>
                            <button id="${allcourse[hr_courses]['course_ID']}_${allcourse[hr_courses]['course_code']}" type="button" class="btn btn-secondary btn-sm btn-block" style="text-align: center;" data-toggle="modal" data-target="#retiremodal` + numbercheck + `" >Retire</button>
                        </td>
                    </tr>
                    
                `;
                }
                deletemodal += `
                <div class="modal fade" id="deletemodal` + numbercheck + `" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" style="z-index: 99999 !important;">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Delete Course</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        Confirm delete course? Once course is deleted, all the related class will be removed as well.
                    </div>
                    <div class="modal-footer">
                        <button type="button" onclick="deletecourse(this.id)" id="${allcourse[hr_courses]['course_ID']}_${allcourse[hr_courses]['course_code']}" class="btn btn-success" data-dismiss="modal">Confirm</button>
                        <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>
                    </div>
                    </div>
                </div>
                </div>`

                retiremodal+= `
            <div class="modal fade" id="retiremodal` + numbercheck + `" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" style="z-index: 99999 !important;">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Retire Course</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    Confirm retire course? Once you retire course, you will not be able to undo your action.
                </div>
                <div class="modal-footer">
                    <button type="button" onclick="retire(this.id)" id="${allcourse[hr_courses]['course_ID']}" class="btn btn-success" data-dismiss="modal" >Confirm</button>
                    <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>
                </div>
                </div>
            </div>
            </div>`
            }
            
            
        }
     
        document.getElementById("all_courses").innerHTML = str;
        document.getElementById("modalarea1").innerHTML +=deletemodal
        document.getElementById("modalarea1").innerHTML +=retiremodal
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








