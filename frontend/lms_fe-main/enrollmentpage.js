var userid= localStorage.getItem('user_ID');
//Get course id and class id as URL and individual data
var sub_url = window.location.href
sub_url.indexOf("?")
var course_class_id_url_back = sub_url.slice(sub_url.indexOf("?")+1)
//alert(course_class_id_url_back)
var myArr = course_class_id_url_back.split("_"); //myArr[0] = courseid, myArr[1] = classid
//console.log(myArr[0]);
//console.log(myArr[1]);

//get course information
var course_url = "https://course-container-7ii64z76zq-uc.a.run.app/course?course_ID=" + myArr[0];
var class_url = "https://class-container-7ii64z76zq-uc.a.run.app/class?class_ID=" + myArr[1] + "&learner_ID=" + userid;
var learner_complete_url = "https://user-container-7ii64z76zq-uc.a.run.app/user/" + userid + "/learner_completed"
var is_curr_enroll_url = "https://class-container-7ii64z76zq-uc.a.run.app/class/assignment_status?course_ID=" + myArr[0] + "&learner_ID=" + userid;

//console.log(is_curr_enroll_url);
//Required vars for checking if learner can enroll
var class_prerequisites = [];
var slots_left = "";
var class_trainer_ID = "";
var learner_complete = [];
var course_ID = parseInt(myArr[0]);
var is_curr_not_assigned = "";
var class_status = "";
var enroll_error_msg = [
                        "You did not satisfy the prerequisites",
                        "You have completed this course before",
                        "You are cuurently assigned to another class of the same course",
                        "You are the instructor of this class",
                        "There are no slots left...come back another time"
                        ];

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
                if (course_info["prerequisites"]===null){
                    document.getElementById("course_prerequisuites").innerHTML = "None"
                } else if (course_info["prerequisites"].length === 0){
                    document.getElementById("course_prerequisuites").innerHTML = "None"
                } else {
                    for (let j =0; j < course_info["prerequisites"].length; j++){
                        prerequisites_str += `
                            ${course_info["prerequisites"][j]["course_code"]}<br>
                        `;
                        class_prerequisites.push(parseInt(course_info["prerequisites"][j]["course_ID"]))
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
            //class_status = class_info["class_status"];
            document.getElementById("class_name").innerHTML = class_info["class_name"];
            document.getElementById("class_size").innerHTML = class_info["size"];
            document.getElementById("enroll_class_start").innerHTML = class_info["enrol_start_date"];
            document.getElementById("enroll_class_end").innerHTML = class_info["enrol_end_date"];
            document.getElementById("class_start").innerHTML = class_info["starting_date"].slice(0,16);
            document.getElementById("class_end").innerHTML = class_info["ending_date"].slice(0,16);
            document.getElementById("class_assigned").innerHTML = class_info.trainer_info["trainer_name"];
            //console.log(class_info["trainer_name"]);

            document.getElementById("class_slots").innerHTML = class_info["size"];
            var slots_taken = parseInt(class_info["size"]) - parseInt(class_info["remaining_slots"]);
            document.getElementById("class_taken").innerHTML = slots_taken;
            document.getElementById("class_remain").innerHTML = class_info["remaining_slots"] + " (Note that approval will be subjected to availability determine by the HR)";

            slots_left = class_info["remaining_slots"];
            class_trainer_ID = class_info["trainer_ID"];
        })

    //Get the completed courses of learner
    fetch(learner_complete_url).
        then(response => response.json())
        .then(data => {
            var completed_courses = data.data.learner_completed;
            //console.log(completed_courses.length);
            if (completed_courses.length != 0){
                for (let i = 0; i < completed_courses.length; i++) {
                    if(completed_courses[i]["status"] == "COMPLETED"){
                        learner_complete.push(completed_courses[i]["course_ID"]);
                    }
                }
            }
        })

    //check if learner is currently enrolled in
    //GET check learner class assignment status
    fetch(is_curr_enroll_url).
        then(response => response.json())
        .then(data => {
            //console.log(data.data["assigned"]);
            is_curr_not_assigned = data.data["assigned"];
        })

    //Call function to load type of buttons displayed for enrollment section after everything is loaded
    determine_buttons();

}

//determine which buttons to load
async function determine_buttons(){
    //setTimeout(async function(){ $(document).ready(async function(){
        //console.log(class_status);

        //nned both class applicant and class user
        var class_applicant = 0;
        var class_user = 0;
        var class_status = "";
        var is_assigned = true;

        //check if there are any applications for this CLASS
        const class_applicant_url = "https://class-container-7ii64z76zq-uc.a.run.app/class/class_application?learner_ID=" + userid;
        //console.log(class_applicant_url);
        var response = await fetch(class_applicant_url);
        response = await response.json();

        var class_applications = response.data.applications;
        //console.log(class_applications)

        if (class_applications.length != 0){
            for (let i = 0; i < class_applications.length; i++){
                if (class_applications[i].class_info["class_ID"] == myArr[1]){
                    class_applicant = 1;
                    class_status = class_applications[i].class_info["class_status"];
                }
            }
        }

        //console.log(class_applicant);
        //console.log(class_status);

        //Check if user is enrolled to the CLASS
        const class_enroll_url = "https://class-container-7ii64z76zq-uc.a.run.app/class/all/learner/" + userid;
        //console.log(class_details_url);
        var response1 = await fetch(class_enroll_url);
        response1 = await response1.json();

        var class_enrolls = response1.data.classes;
        //console.log(class_enrolls)

        if (class_enrolls.length != 0){
            for (let i = 0; i < class_enrolls.length; i++){
                if (class_enrolls[i]["class_ID"] == myArr[1]){
                    class_user = 1;
                    class_status = class_enrolls[i]["class_status"];
                     if(class_enrolls[i].learner_info["enrollment_type"] != "ASSIGNED"){
                         is_assigned = false;
                     }
                }
            }
        }

        //console.log(is_assigned);

        //console.log(class_user);
        //console.log(class_status);

        //var class_applicant = 1;
        //var class_user = 1;

        //DISPLAY DIFFERENT BUTTONS BASED ON CONDITIONS
        if(class_applicant==0 && class_user==0){
            document.getElementById("determine_button_type").innerHTML = `
            <button onclick="check_enroll_eligible()" type="button" class="btn btn-primary btn-sm 12" style="width:125px;margin-top: 5px; margin-bottom: 5px; padding-top: 7px; padding-bottom: 7px;">Enroll for Course</button>
            `;
        } else if (class_applicant== 1 && class_user==0){
            document.getElementById("determine_button_type").innerHTML = `
            <button type="button" class="btn btn-secondary btn-sm 12 disabled" style="width:150px;margin-top: 5px; margin-bottom: 5px; padding-top: 7px; padding-bottom: 7px;">Awaiting Approval</button>
            `;
        } else if ((class_applicant==0 || class_applicant==1) && class_user==1){
            document.getElementById("determine_button_type").innerHTML = `
            <button type="button" class="btn btn-success btn-sm 12" style="width:125px;margin-top: 5px; margin-bottom: 5px; padding-top: 7px; padding-bottom: 7px;">Enrolled</button>
            `;
        }

        //if leaner is not enrolled then we must set the assigned to false as well
        if (class_user == 0){
            is_assigned = false;
        }

        //console.log(class_user);
        //console.log(class_applicant);
        //ADDING THE WITHDRAWAL BUTTONS
        //if((class_applicant!=0 || class_user!=0) && is_assigned===false){
        if(((class_applicant==0 && class_user==1) || (class_applicant==1 && class_user==0)) && is_assigned===false){
            if (class_status=="OPEN"){
                //withdraw button here without reason
                document.getElementById("withdrawl_message").innerHTML = `
                    If you withdraw from class and want to enroll to the same class again, HR approval will be required again.<br><br>
                    Do you wish to withdraw?
                `;

                //if learner already enrolled call [DEL] delete enrolled learner by classID&LearnerID
                if(class_user==1){
                    document.getElementById("popup_section_id2").innerHTML = `
                        <button type="button" onclick="withdraw_learner_enrolled()" class="btn btn-danger btn-sm 12" style="width:150px;margin-top: 5px; margin-bottom: 5px; padding-top: 7px; padding-bottom: 7px;">Confirm Withdraw</button>
                    `;
                } else if (class_user==0){ //if application is pending, then call [DEL] withdraw class application
                    document.getElementById("popup_section_id2").innerHTML = `
                        <button type="button" onclick="withdraw_learner_pending()" class="btn btn-danger btn-sm 12" style="width:150px;margin-top: 5px; margin-bottom: 5px; padding-top: 7px; padding-bottom: 7px;">Confirm Withdraw</button>
                    `;
                }

                document.getElementById("determine_button_type").innerHTML += `
                <button type="button" onclick="open_withdraw_popup()" class="btn btn-danger btn-sm 12" style="width:150px;margin-top: 5px; margin-bottom: 5px; padding-top: 7px; padding-bottom: 7px;">Withdraw</button>
                `;
                
            } else {
                //withdraw button here with reason
                document.getElementById("withdrawl_message").innerHTML = `
                    You are trying to withdraw a class after the enrollment period. A valid reason and approval from HR is required.<br><br>
                    Please provide a short reason and click on the withdraw button
                    <div class="form-group row">
                        <label for="with_reason" class="col-sm-4 col-form-label">Reason</label>
                        <div class="col-sm-8">
                            <input type="text" class="form-control" id="with_reason" placeholder="Reason for Withdrawal...">
                        </div>
                    </div>
                    <span id="error_msg" style="color:red;"></span>
                `;
                document.getElementById("popup_section_id2").innerHTML = `
                    <button type="button" onclick="withdraw_learner_reason()" class="btn btn-danger btn-sm 12" style="width:150px;margin-top: 5px; margin-bottom: 5px; padding-top: 7px; padding-bottom: 7px;">Confirm Withdraw</button>
                `;
                document.getElementById("determine_button_type").innerHTML += `
                <button type="button" onclick="open_withdraw_popup()" class="btn btn-danger btn-sm 12" style="width:150px;margin-top: 5px; margin-bottom: 5px; padding-top: 7px; padding-bottom: 7px;">Withdraw</button>
                `;
            }
        }
    //}); }, 2500);
}



function check_enroll_eligible(){
    // console.log(class_prerequisites);
    // console.log(learner_complete);
    // console.log(slots_left);
    // console.log(class_trainer_ID);
    // console.log(course_ID);
    // console.log(enroll_error_msg);
    // console.log(is_curr_not_assigned)

    var is_prerequisite = true;
    var is_newcourse = true;
    var is_not_assigned = true;
    var is_not_instructor = true;
    var is_not_full = true;
    var message_to_use = [];
    var error_str = "";

    //check for pre-requisites
    if (class_prerequisites.length != 0){
        if (learner_complete.length == 0)
        {
            is_prerequisite = false;
            message_to_use.push(0);

        } else {
            for (let i = 0; i < class_prerequisites.length; i++){
                //console.log(learner_complete.includes(class_prerequisites[i]));
                if (learner_complete.includes(class_prerequisites[i])===false){
                    is_prerequisite = false;
                    message_to_use.push(0);
                }
            }
        }
    }
    //console.log(is_prerequisite);

    //check if complete this course before
    if (learner_complete.length != 0){
       
        if (learner_complete.includes(course_ID)){
            is_newcourse = false;
            message_to_use.push(1);
        }
    }
    //console.log(is_newcourse);

    //check if currently assigned another class of the same course
    if (is_curr_not_assigned){
        is_not_assigned = false;
        message_to_use.push(2);
    }
    //console.log(is_not_assigned)


    //check if its instuctor of the course
    if (class_trainer_ID == userid){
        is_not_instructor = false;
        message_to_use.push(3);
    }
    //console.log(is_not_instructor);

    //check if slots are full
    if (slots_left==0){
        is_not_full = false;
        message_to_use.push(4);
    }
    //console.log(is_not_full);
    
    //Validate Eligibility
    if(is_prerequisite && is_newcourse && is_not_assigned && is_not_instructor && is_not_full){
        //open "delete" modal to ask user if they want confirm
        //console.log(true);
        var str = ""
        str = `<button onclick='learner_enroll()' id="` + myArr[1] + "_" + userid +
             `" type="button" class="btn btn-primary" data-dismiss="modal">Enroll</button>
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>`
        
        //console.log(str);

        document.getElementById("popup_section_id").innerHTML = str;

        $(document).ready(function(){
            // Show the Modal on load
            $("#pre_warning_enroll").modal("show");
        });

    } else {
        
        for (let j = 0; j < message_to_use.length; j++){
            error_str += `
                [${j+1}] ${enroll_error_msg[message_to_use[j]]}<br>
            `;
        }

        document.getElementById("reasons_enroll_fail").innerHTML = error_str;

        //console.log(message_to_use);
        $(document).ready(function(){
            // Show the Modal on load
            $("#fail_msg").modal("show");
        });
    }

}    
    

//API CALL to enroll student
async function learner_enroll(){
    var details_data = {}

        details_data["learner_ID"] = userid;
        details_data["class_ID"] = myArr[1];
        //console.log(details_data);

        response = await fetch("https://class-container-7ii64z76zq-uc.a.run.app/class/class_application", {
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

            //call function to reload page and change to the buttons
            //get_course_sections_only();

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
                location.reload();
            }); }, 2000);

        }
}

function open_withdraw_popup(){
    $(document).ready(function(){
        // Show the Modal on load
        $("#pre_warning_with").modal("show");
    });
}

async function withdraw_learner_enrolled(){
    //console.log("HI");
    response = await fetch("https://class-container-7ii64z76zq-uc.a.run.app/class/learner?class_ID=" + myArr[1] + "&learner_ID=" + userid, {
        method: "DELETE",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        },
    });
    
    result = await response.json();
    //console.log(result);

    if(result.code == 400) {
        alert(result.data.message)
    } else {
    //-----------SUCCESS ALERT----------------------

        //show success message using modal created above
        $(document).ready(function(){
            // Show the Modal on load
            $("#success_msg").modal("show");
            $("#pre_warning_with").modal("hide");
        });
        //auto close after 2 seconds
        setTimeout(function(){ $(document).ready(function(){
            // Show the Modal on load
            $("#success_msg").modal("hide");
            location.reload();
        }); }, 2000);
    }

}

async function withdraw_learner_pending(){
    //console.log("HI");
    response = await fetch("https://class-container-7ii64z76zq-uc.a.run.app/class/class_application?class_ID=" + myArr[1] + "&learner_ID=" + userid, {
        method: "DELETE",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        },
    });
    
    result = await response.json();
    //console.log(result);

    if(result.code == 400) {
        alert(result.data.message)
    } else {
    //-----------SUCCESS ALERT----------------------

        //show success message using modal created above
        $(document).ready(function(){
            // Show the Modal on load
            $("#success_msg").modal("show");
            $("#pre_warning_with").modal("hide");
        });
        //auto close after 2 seconds
        setTimeout(function(){ $(document).ready(function(){
            // Show the Modal on load
            $("#success_msg").modal("hide");
            location.reload();
        }); }, 2000);
    }

}

async function withdraw_learner_reason(){
    //console.log("BYE");
    var sectionstr = document.getElementById("with_reason").value;
    if (sectionstr == "") {
        //console.log("HI")
        document.getElementById("error_msg").innerHTML = "Please enter a Reason..."
    } else {
        //console.log("Bye");

        var with_reason_data = {};
        with_reason_data["reason"] = document.getElementById("with_reason").value;
        with_reason_data["class_ID"] = myArr[1];

        //console.log(with_reason_data);

        response = await fetch("https://class-container-7ii64z76zq-uc.a.run.app/class/learner/" + userid + "/withdrawals", {
                method: "POST",
                headers: {
                    'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
                },
    
                body: JSON.stringify(with_reason_data)
            });
    
        result = await response.json();
        //console.log(result);

        document.getElementById("error_msg").innerHTML = "";

        if(result.code == 400) {
                alert(result.data.message)
        } else {
            //-----------SUCCESS ALERT----------------------
            //show success message using modal created above
            $(document).ready(function(){
                // Show the Modal on load
                $("#success_msg").modal("show");
                $("#pre_warning_with").modal("hide");
            });
            //auto close after 2 seconds
            setTimeout(function(){ $(document).ready(function(){
                // Show the Modal on load
                $("#success_msg").modal("hide");
            }); }, 2000);
        }




    }
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


function logout(){
    localStorage.clear();
    window.location.href = "login.html";
}