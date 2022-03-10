var userid= localStorage.getItem('user_ID');
//Get course id and class id as URL and individual data
var sub_url = window.location.href
sub_url.indexOf("?")
var course_class_id_url_back = sub_url.slice(sub_url.indexOf("?")+1)
//alert(course_class_id_url_back)
var myArr = course_class_id_url_back.split("&"); //myArr[0] = courseid, myArr[1] = classid
//console.log(myArr[0]);
//console.log(myArr[1]);
var json_ready_course = myArr[0].split("=");
var json_ready_class = myArr[1].split("=");
//console.log(json_ready_course[0]);
//console.log(json_ready_course[1]);
//console.log(json_ready_class[0]);
//console.log(json_ready_class[1]);


async function create_section(){
    var sectionstr = document.getElementById("inputSectionTitle").value;
    //console.log(sectionstr);
    if (sectionstr == "") {
        //console.log("HI")
        document.getElementById("error_msg").innerHTML = "Error: Section Title cannot be blank<br><br>"
    } else {
        //console.log("BYE")
        
        //Call the API function here
        //before call, must store the data first
        var details_data = {}

        details_data["title"] = sectionstr;
        details_data["class_ID"] = json_ready_class[1]; 
        //console.log(details_data);

        response = await fetch("https://section-container-7ii64z76zq-uc.a.run.app/section", {
            method: "POST",
            headers: {
                'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
            },
 
            body: JSON.stringify(details_data)
        });

        result = await response.json();
        //console.log(result);

        if(result.code == 400) {
            alert(result.message)
        } else {

            //call function to call all sections again then no need reload page
            get_course_sections_only();

            //-----------SUCCESS ALERT----------------------
            //show success message using modal created above
            $(document).ready(function(){
                // Show the Modal on load
                $("#success_msg").modal("show");
            });
            //auto close after 2 seconds
            setTimeout(function(){ $(document).ready(function(){
                // Show the Modal on load
                $("#success_msg").modal("hide");
            }); }, 2000);

        document.getElementById("error_msg").innerHTML = "";
        document.getElementById('inputSectionTitle').value = '';
        }
    }
};

var userid= localStorage.getItem('user_ID');

//get course information
var course_url = "https://course-container-7ii64z76zq-uc.a.run.app/course?course_ID=" + json_ready_course[1];
var class_url = "https://class-container-7ii64z76zq-uc.a.run.app/class?class_ID=" + json_ready_class[1] + "&learner_ID=" + userid;
var section_url = "https://section-container-7ii64z76zq-uc.a.run.app/section?class_ID=" + json_ready_class[1];
var has_quiz_url = "https://quiz-container-7ii64z76zq-uc.a.run.app/quiz?class_ID=" + json_ready_class[1] + "&section_ID=-1"

window.onload = async function get_course_section(){
    var str = ''
    var user_name= localStorage.getItem('username');
    document.getElementById("navbarDropdown1").innerText = user_name; 
    //(GET "course by courseID")
    fetch(course_url).
            then(response => response.json())
            .then(data => {
                var course_info = data.data.course;
                //console.log(course_info);
                document.getElementById("created_by").innerHTML = course_info["hr_name"];
                document.getElementById("course_code").innerHTML = course_info["course_code"];
                document.getElementById("course_name").innerHTML = course_info["name"];
                document.getElementById("est_duration").innerHTML = course_info["duration"];

                var prerequisites_str = "";
                if (course_info["prerequisites"] === null){
                    document.getElementById("course_prerequisuites").innerHTML = "None"
                } else if (course_info["prerequisites"].length === 0){
                    document.getElementById("course_prerequisuites").innerHTML = "None"
                } else {
                    for (let j =0; j < course_info["prerequisites"].length; j++){
                        prerequisites_str += `
                            ${course_info["prerequisites"][j]["course_code"]}<br>
                        `;
                        //console.log(course_info["prerequisites"][j]["course_code"]);
                    }
                    document.getElementById("course_prerequisuites").innerHTML = prerequisites_str;
                };

                document.getElementById("course_description").innerHTML = course_info["description"];
            })

    //(GET "class by class ID")
    fetch(class_url).
        then(response => response.json())
        .then(data => {
            var class_info = data.data.class;
            //console.log(course_info)
            document.getElementById("class_hr").innerHTML = class_info["hr_name"];
            document.getElementById("class_status").innerHTML = class_info["class_status"];
            document.getElementById("class_name").innerHTML = class_info["class_name"];
            document.getElementById("class_size").innerHTML = class_info["size"];
            document.getElementById("enroll_class_start").innerHTML = class_info["enrol_start_date"];
            document.getElementById("enroll_class_end").innerHTML = class_info["enrol_end_date"];
            document.getElementById("class_start").innerHTML = class_info["starting_date"].slice(0,16);
            document.getElementById("class_end").innerHTML = class_info["ending_date"].slice(0,16);
            document.getElementById("class_assigned").innerHTML = class_info.trainer_info["trainer_name"];
            //console.log(class_info.trainer_info["trainer_name"]);

            if (class_info["class_status"] != "NEW") {
                document.getElementById('add_section_btns').style.display = "none";
                document.getElementById('inputSectionTitle').placeholder = "HR has changed status of class. You can no longer edit or delete sections.";
                //document.getElementById("inputSectionTitle").style.height = "50px";
                document.getElementById('inputSectionTitle').readOnly = true;
            }


            //Display Forum Button
            document.getElementById("forumbutton").innerHTML = `<button type="button" class="btn btn-primary" onclick="gotoforum(this.id);" id=${json_ready_class[1]}?${class_info["class_name"]}?${json_ready_course[1]} >Manage Class Forum</button>`
            
            //Display Check Learner Progress Button
            if(class_info["class_status"] == "NEW"){
                document.getElementById("checklearnerprogressbutton").innerHTML = `<button type="button" class="btn btn-secondary" disabled>Check Learner Progress</button>`
            }
            else{
                document.getElementById("checklearnerprogressbutton").innerHTML = `<button type="button" class="btn btn-primary" id=${json_ready_class[1]} onclick="gotolearnerprogress(this.id);">Check Learner Progress</button>`
            }

            localStorage.setItem("class_status", class_info["class_status"]);
            get_course_sections_sections(class_info["class_status"]);

           
        })


        

}


    str = "";
    
    async function get_course_sections_sections(class_status){
        //console.log(class_status);
    
        //(GET "Get All sections by class ID")
        fetch(section_url).
            then(response => response.json())
            .then(data => {
                var section_info = data.data.sections;
                //console.log(section_info.length)

                if (section_info.length === 0){
                    str += `
                        <tr>
                            <td colspan="9" style="text-align: center;"><br><br><br><br><br>No Sections created yet<br><br><br><br><br></td>
                        </tr>
                    `;
                } else {
                    for (let i = 0; i < section_info.length; i++) {
                    
                        str += `
                            <tr>
                                <td scope="row">${section_info[i]['ranking']}</td>
                                <td>${section_info[i]['title']}</td>
                        `;

                        if (section_info[i]['has_content'] === false){
                            str += `<td>No</td>`;
                        } else {
                            str += `<td>Yes</td>`;
                        }

                        if (section_info[i]['has_quiz'] === false){
                            str += `<td>No</td>`;
                        } else {
                            str += `<td>Yes</td>`;
                        }
                        
                        if (class_status != "NEW"){
                            str += `
                                    <td style="text-align:center;">
                                        <button onclick="design_section(this.id)" id="${section_info[i]['section_ID']}" type="button" class="btn btn-primary btn-sm 12" style="width:125px;margin-top: 5px; margin-bottom: 5px; padding-top: 7px; padding-bottom: 7px; padding">View Section</button>
                                    </td>
                                </tr>
                            `;
                        } else {
                            str += `
                                    <td style="text-align:center;">
                                        <button onclick="design_section(this.id)" id="${section_info[i]['section_ID']}" type="button" class="btn btn-primary btn-sm 12" style="width:125px;margin-top: 5px; margin-bottom: 5px; padding-top: 7px; padding-bottom: 7px; padding">View Section</button><br>
                                        <button onclick="pass_info_to_model(this.id)" id="${section_info[i]['section_ID']}" data-toggle="modal" data-target="#pre_warning_delete" type="button" class="btn btn-secondary btn-sm 12" style="width:125px;margin-top: 5px; margin-bottom: 5px; padding-top: 7px; padding-bottom: 7px;">Delete Section</button>
                                    </td>
                                </tr>
                            `;
                        }
                        //console.log(str);
                    }
                    
                }
                document.getElementById("my_class_sections").innerHTML = str;
            });
        
        var quiz_str = "";
        //Check if class has final quiz
        fetch(has_quiz_url).
            then(response => response.json())
            .then(data => {
                if(data.data.hasOwnProperty('quiz')){
                    //console.log("Have QUIZ");
                    quiz_str = `
                        <button type="button" class="btn btn-primary" style="margin-right: 5px; padding-left:25px; padding-right:25px;" onclick="view_edit_quiz()">
                            View/Edit Quiz
                        </button><br>
                    `;
                } else {
                    //console.log("No Quiz");
                    quiz_str = `
                        <button type="button" class="btn btn-primary" style="margin-right: 5px; padding-left:25px; padding-right:25px;" onclick="create_quiz()">
                            Create Quiz
                        </button><br>
                    `;
                }
                document.getElementById("determine_button_type").innerHTML = quiz_str;
            })
        
    }

//RELOAD only section section after successfully adding section
//Any changes made copy and paste from above async function
//Need to duplicate because cannot call functions which are on windows.load
function get_course_sections_only(){
    var class_status = localStorage.getItem('class_status');

    str = "";
    //(GET "Get All sections by class ID")
    fetch(section_url).
            then(response => response.json())
            .then(data => {
                var section_info = data.data.sections;
                //console.log(section_info.length)

                if (section_info.length === 0){
                    str += `
                        <tr>
                            <td colspan="9" style="text-align: center;"><br><br><br><br><br>No Sections created yet<br><br><br><br><br></td>
                        </tr>
                    `;
                } else {
                    for (let i = 0; i < section_info.length; i++) {
                    
                        str += `
                            <tr>
                                <td scope="row">${section_info[i]['ranking']}</td>
                                <td>${section_info[i]['title']}</td>
                        `;

                        if (section_info[i]['has_content'] === false){
                            str += `<td>No</td>`;
                        } else {
                            str += `<td>Yes</td>`;
                        }

                        if (section_info[i]['has_quiz'] === false){
                            str += `<td>No</td>`;
                        } else {
                            str += `<td>Yes</td>`;
                        }
                        
                        if (class_status != "NEW"){
                            str += `
                                    <td style="text-align:center;">
                                        <button onclick="design_section(this.id)" id="${section_info[i]['section_ID']}" type="button" class="btn btn-primary btn-sm 12" style="width:125px;margin-top: 5px; margin-bottom: 5px; padding-top: 7px; padding-bottom: 7px; padding">View Section</button>
                                    </td>
                                </tr>
                            `;
                        } else {
                            str += `
                                    <td style="text-align:center;">
                                        <button onclick="design_section(this.id)" id="${section_info[i]['section_ID']}" type="button" class="btn btn-primary btn-sm 12" style="width:125px;margin-top: 5px; margin-bottom: 5px; padding-top: 7px; padding-bottom: 7px; padding">View Section</button><br>
                                        <button onclick="pass_info_to_model(this.id)" id="${section_info[i]['section_ID']}" data-toggle="modal" data-target="#pre_warning_delete" type="button" class="btn btn-secondary btn-sm 12" style="width:125px;margin-top: 5px; margin-bottom: 5px; padding-top: 7px; padding-bottom: 7px;">Delete Section</button>
                                    </td>
                                </tr>
                            `;
                        }
                        //console.log(str);
                    }
                    
                }
                document.getElementById("my_class_sections").innerHTML = str;
            });
}

//goes to next page base on button clicked
function design_section(sectionid){
    var course_id = json_ready_course[1];
    var class_id = json_ready_class[1];
    url = "course_section.html?" + course_id + "_" + class_id + "_" + sectionid;
    //console.log(url);
    window.location.href = url;
}

//Delete pop up and passing of sectionid
function pass_info_to_model(sectionid){
    var str = ""
    str = `<button onclick='delete_section(this.id)' id="` + sectionid +
         `" type="button" class="btn btn-danger" data-dismiss="modal">Confirm Delete</button>
            <button type="button" class="btn btn-primary" data-dismiss="modal">Cancel</button>`
    
    //dconsole.log(str);

    document.getElementById("popup_section_id").innerHTML = str;
}

async function delete_section(sectionid){
    //console.log(sectionid)
    //delete api here
    //all sections api here
    response = await fetch("https://section-container-7ii64z76zq-uc.a.run.app/section/" + sectionid, {
        method: "DELETE",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        },
    });

    result = await response.json();
    //console.log(result);

    if(result.code == 400) {
        alert(result.message)
    } else {
        //Reload the section
        get_course_sections_only()
        //-----------SUCCESS ALERT----------------------
        //show success message using modal created above
        $(document).ready(function(){
            // Show the Modal on load
            $("#success_msg").modal("show");
        });
        //auto close after 2 seconds
        setTimeout(function(){ $(document).ready(function(){
            // Show the Modal on load
            $("#success_msg").modal("hide");
        }); }, 2000);
    }
}

//goes to next page if no quiz created
function create_quiz(){
    //section_class_trainer_1  (1=graded Quiz)
    url = "create_quiz_final.html?" + "-1" + "_" + json_ready_class[1] + "_" +  userid + "_1_" + myArr[0].slice(9,12);
    window.location.href = url;
    //console.log(url);
}
//goes to next page if quiz is created
function view_edit_quiz(){
    //sectionid_classid
    url = "view_quiz_final.html?" + "-1" + "_" + json_ready_class[1] + "_" + myArr[0];
    window.location.href = url;
    //console.log(url);
}

//goes to learner progress page
function gotolearnerprogress(classidcapture){
    
    window.location.href = "learnerprogress.html?classid=" + classidcapture
}

function gotoforum(classidcapture){
    classidcapture = classidcapture.split('?')
    window.location.href = "forum.html?classid=" + classidcapture[0] + "&classname=" + classidcapture[1] + "&courseid=" + classidcapture[2]
}

function logout(){
    localStorage.clear();
    window.location.href = "login.html";
}
