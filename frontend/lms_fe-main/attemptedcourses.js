
var userid= localStorage.getItem('user_ID');
//var userid= "7";
var user_name= localStorage.getItem('username');
//[GET]Get all of the learner completed course records by learner_ID
const my_attempt_url = "https://user-container-7ii64z76zq-uc.a.run.app/user/" + userid + "/learner_completed"
//console.log(my_attempt_url)


window.onload = async function get_attempted_course(){
    var str = '';
    var attemps_list = [];
        document.getElementById("navbarDropdown1").innerText = user_name;

        fetch(my_attempt_url).
            then(response => response.json())
            .then(data => {
                if (data.data.learner_completed.length == 0){
                    str += `
                        <tr>
                            <td colspan="9" style="text-align: center;"><br><br><br><br><br>You have yet to attempt any courses<br><br><br><br><br></td>
                        </tr>
                    `;
                    document.getElementById("my_courses").innerHTML = str;
                } else {
                    var my_attempts = data.data.learner_completed;
                    for (let i = 0; i < my_attempts.length; i++) {
                        var modified_status = "";
                                             //<span style="color:blue;font-weight:bold">blue</span>
                        if (my_attempts[i].status == "COMPLETED"){
                            modified_status = "<span style='color:green;font-weight:bold'>" + my_attempts[i].status + "</span><br>(Passed)"
                        } else {
                            modified_status = "<span style='color:red;font-weight:bold'>" + my_attempts[i].status + "</span><br>(InComplete/Failed)"
                        }

                        attemps_list.push([
                            my_attempts[i].course_ID,
                            my_attempts[i].class_ID,
                            modified_status
                        ])
                    }
                get_all_details(attemps_list);
                }
            })           
}

async function get_all_details(list){
    //console.log(list);
    var save_list = [];
    save_list.push(list);
    
    var str = '';

    //console.log(save_list[0].length);

    for (k=0; k < save_list[0].length; k++){
        /*console.log(save_list[0][k][0]);
        console.log(save_list[0][k][1]);
        console.log(save_list[0][k][2]);
        console.log(" ");*/

        var course_id = save_list[0][k][0];
        var class_id = save_list[0][k][1];
        var status = save_list[0][k][2];

        //[GET]class by class ID
        const class_details_url = "https://class-container-7ii64z76zq-uc.a.run.app/class?class_ID=" + class_id + "&learner_ID=" + userid;
      
        //console.log(class_details_url);
        var response = await fetch(class_details_url);
        response = await response.json();

        //console.log(response);
        var my_attempts = response.data.class;
        
        //console.log(class_id);
        //console.log(my_attempts["class_status"]);
        //console.log(status);
        if (my_attempts["class_status"] == "CLOSED" || status == "<span style='color:green;font-weight:bold'>COMPLETED</span><br>(Passed)"){

            str += `
                <tr>
                    <td scope="row">${my_attempts["class_name"]}</td>
                    <td>${my_attempts.course_info["course_name"]}</td>
            `;

            if (my_attempts.course_info["prerequisites"] === null){
                str += `
                    <td>None</td>
                `;
            } else if (my_attempts.course_info["prerequisites"].length === 0){
                str += `
                    <td>None</td>
                `;
            } else {
                str += `<td>`;

                for (let j =0; j < my_attempts.course_info["prerequisites"].length; j++){
                    str += `
                        ${my_attempts.course_info["prerequisites"][j]["course_code"]}<br>
                    `;
                }
            }
            
            str += `
                </td>
                <td>${my_attempts["enrol_start_date"]} -<br>${my_attempts["enrol_end_date"]}</td>
                <td>${my_attempts["starting_date"].slice(0,16)} -<br>${my_attempts["ending_date"].slice(0,16)}</td>
                <td>${status}</td>
                <td>${my_attempts.trainer_info["trainer_name"]}</td>
                <td style="text-align:center;">
                    <button onclick="view_course(this.id)" id="${my_attempts["course_ID"]}_${my_attempts["class_ID"]}" type="button" class="btn btn-primary btn-sm 12" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px;">Review Course</button><br>
                </td>
            </tr>
            `;
        }

    }

    if (str.length == 0){
        str = `
            <tr>
                <td colspan="9" style="text-align: center;"><br><br><br><br><br>You have yet to attend/complete any courses<br><br><br><br><br></td>
            </tr>
        `;
    } 
    
    //console.log(str);
    document.getElementById("my_courses").innerHTML = str;
    
    
}

//goes to next page base on button clicked
function view_course(course_classid){
    //console.log(course_id);
    //console.log(myArr)
    //var courseid = myArr[0];
    url = "attendclass.html?" + course_classid;
    window.location.href = url;
    console.log(url);
}


function logout(){
    localStorage.clear();
    window.location.href = "login.html";
}