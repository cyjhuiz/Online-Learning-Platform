
var userid= localStorage.getItem('user_ID');
var user_name= localStorage.getItem('username');
//[GET]all class application by learner ID (application_status = "PENDING", class status != NEW || != CLOSE)
const pending_requests = "https://class-container-7ii64z76zq-uc.a.run.app/class/class_application?learner_ID=" + userid;

//enrolled classes by learner ID (class status != NEW || != CLOSED )
const current_classes = "https://class-container-7ii64z76zq-uc.a.run.app/class/learner?learner_ID=" + userid;

//console.log(current_classes);

window.onload = async function get_pending_requests(){
    var str = '';
    var str2 = '';
        document.getElementById("navbarDropdown1").innerText = user_name; 

        //all class application by learner ID (application status = “PENDING”)
        fetch(pending_requests).
            then(response => response.json())
            .then(data => {
                //console.log(data.data.classes.length)
                if (data.data.applications.length == 0){
                    str += `
                        <tr>
                            <td colspan="10" style="text-align: center;"><br><br>No Pending Requests<br><br></td>
                        </tr>
                    `;
                } else {
                    var pending_request = data.data.applications;
                    for (let i = 0; i < pending_request.length; i++) {
                       
                        str += `
                            <tr>
                                <td scope="row">${pending_request[i].class_info["class_name"]}</td>
                                <td>${pending_request[i].class_info.course_info["course_name"]}</td>
                        `;

                        if (pending_request[i].class_info.course_info["prerequisites"] === null){
                            str += `
                                <td>None</td>
                            `;
                        } else if (pending_request[i].class_info.course_info["prerequisites"].length === 0){
                            str += `
                                <td>None</td>
                            `;
                        } else {
                            str += `<td>`;

                            for (let j =0; j < pending_request[i].class_info.course_info["prerequisites"].length; j++){
                                str += `
                                    ${pending_request[i].class_info.course_info["prerequisites"][j]["course_code"]}<br>
                                `;
                            }
                        }

                            str += `
                                </td>
                                <td>${pending_request[i].class_info["enrol_start_date"]} -<br>${pending_request[i].class_info["enrol_end_date"]}</td>
                                <td>${pending_request[i].class_info["starting_date"].slice(0,16)} -<br>${pending_request[i].class_info["ending_date"].slice(0,16)}</td>
                                <td>Self-Enrolled</td>
                                <td>${pending_request[i].class_info["class_status"]}</td>
                                <td>${pending_request[i].class_info.trainer_info["trainer_name"]}</td>
                                <td>PENDING</td>
                                <td style="text-align:center;">
                                    <button onclick="enrollmentpage(this.id)" id="${pending_request[i].class_info["course_ID"]}_${pending_request[i].class_info["class_ID"]}_2" type="button" class="btn btn-primary btn-sm 12" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px;">View More</button><br>
                                </td>
                                </tr>
                            `;

                    }
                }

                document.getElementById("pending_requests").innerHTML = str;
                //console.log(str);
            })  
            
        //enrolled classes by learner ID (class status != NEW)
        fetch(current_classes).
            then(response => response.json())
            .then(data => {
                //console.log(data.data.classes.length)
                if (data.data.classes.length == 0){
                    str2 += `
                        <tr>
                            <td colspan="10" style="text-align: center;"><br><br>No Pending Requests<br><br></td>
                        </tr>
                    `;
                } else {
                    var current_classes = data.data.classes;
                    for (let i = 0; i < current_classes.length; i++) {
                       
                        str2 += `
                            <tr>
                                <td scope="row">${current_classes[i]["class_name"]}</td>
                                <td>${current_classes[i].course_info["course_name"]}</td>
                        `;
                        
                        if (current_classes[i].course_info["prerequisites"]===null){
                            str2 += `
                                <td>None</td>
                            `;
                        } else if (current_classes[i].course_info["prerequisites"].length === 0){
                            str2 += `
                                <td>None</td>
                            `;
                        } else {
                            str2 += `<td>`;

                            for (let j =0; j < current_classes[i].course_info["prerequisites"].length; j++){
                                str2 += `
                                    ${current_classes[i].course_info["prerequisites"][j]["course_code"]}<br>
                                `;
                            }
                        }

                            str2 += `
                                </td>
                                <td>${current_classes[i]["enrol_start_date"]} -<br>${current_classes[i]["enrol_end_date"]}</td>
                                <td>${current_classes[i]["starting_date"].slice(0,16)} -<br>${current_classes[i]["ending_date"].slice(0,16)}</td>
                                <td>${current_classes[i].learner_info["enrollment_type"]}</td>
                                <td>${current_classes[i]["class_status"]}</td>
                                <td>${current_classes[i].trainer_info["trainer_name"]}</td>
                            `;

                            //capture enrollment type to pass info for next page
                            // 0 = assigned. meaning next page no withdraw button
                            // 1 = self-enrolled. meaning have withdraw button
                            // 2 = pending. meaning button is awaiting approval and cannot click
                            if (current_classes[i].learner_info["enrollment_type"]=="ASSIGNED"){
                                var enroll_type = 0;
                            } else {
                                var enroll_type = 1;
                            }

                            if (current_classes[i]["class_status"]=="OPEN"){
                                str2 += `<td>Enrolled</td>
                                        <td style="text-align:center;">
                                            <button onclick="enrollmentpage(this.id)" id="${current_classes[i]["course_ID"]}_${current_classes[i]["class_ID"]}_${enroll_type}" type="button" class="btn btn-primary btn-sm 12" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px;">View More</button><br>
                                        </td>
                                        </tr>
                                `;
                            } else if (current_classes[i]["class_status"]=="READY"){
                                str2 += `<td>Enrolled<br>(Waiting for<br>class to start)</td>
                                        <td style="text-align:center;">
                                            <button onclick="enrollmentpage(this.id)" id="${current_classes[i]["course_ID"]}_${current_classes[i]["class_ID"]}_${enroll_type}" type="button" class="btn btn-primary btn-sm 12" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px;">View More</button><br>
                                        </td>
                                        </tr>
                                `;
                            } else { //When class is in progress, bring them to the take course page done by WP
                                str2 += `<td>Enrolled<br>Class Open</td>
                                        <td style="text-align:center;">
                                            <button onclick="attendCourse(this.id)" id="${current_classes[i]["course_ID"]}_${current_classes[i]["class_ID"]}" type="button" class="btn btn-success btn-sm 12" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px;">Attend Class</button><br>
                                        </td>
                                        </tr>
                                `;
                            }

                    }
                }

                document.getElementById("current_classes").innerHTML = str2;
                //console.log(str2);
            })  
}

function enrollmentpage(course_id){
    console.log(course_id);
    //console.log(myArr)
    //var courseid = myArr[0];
    url = "enrollment_page.html?" + course_id;
    window.location.href = url;
}

function attendCourse(course_id){
    console.log(course_id);
    //console.log(myArr)
    //var courseid = myArr[0];
    url = "attendclass.html?" + course_id;
    window.location.href = url;
    console.log(url);
}


function logout(){
    localStorage.clear();
    window.location.href = "login.html";
}