
var userid= localStorage.getItem('user_ID');
var user_name= localStorage.getItem('username');
const all_course_URL = "https://course-container-7ii64z76zq-uc.a.run.app/course";
//console.log(trainer_course_URL)


window.onload = async function get_all_courses(){
    var str = '';
        document.getElementById("navbarDropdown1").innerText = user_name; 
        
        fetch(all_course_URL).
            then(response => response.json())
            .then(data => {
                //console.log(data.code)
                if (data.code === 400){
                    str += `
                        <tr>
                            <td colspan="9" style="text-align: center;"><br><br><br><br><br>There are no courses currently in LMS<br><br><br><br><br></td>
                        </tr>
                    `;
                } else {
                    var each_course = data.data.courses;
                    //console.log(each_course);
                    for (let i = 0; i < each_course.length; i++) {
                        
                        str += `
                            <tr>
                                <td scope="row">${each_course[i]["course_code"]}</td>
                                <td>${each_course[i]["name"]}</td>
                                <td>${each_course[i]["description"]}</td>
                                <td>${each_course[i]["duration"]} Hours</td>
                        `;

                        if (each_course[i]["prerequisites"].length === 0){
                            str += `
                                <td>None</td>
                            `;
                        } else {
                            str += `<td>`;

                            for (let j =0; j < each_course[i]["prerequisites"].length; j++){
                                str += `
                                    ${each_course[i]["prerequisites"][j]["course_code"]}<br>
                                `;
                            }
                        }

                            str += `
                                </td>
                                <td>${each_course[i]["hr_name"]}</td>
                                <td style="text-align:center;">
                                    <button onclick="course_info(this.id)" id="${each_course[i]["course_ID"]}" type="button" class="btn btn-primary btn-sm 12" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px;">View Course</button><br>
                                </td>
                            </tr>
                        `;
                    }
                }
                
                //console.log(str);
                document.getElementById("all_courses").innerHTML = str;
               
            })               
}

//goes to next page base on button clicked
function course_info(course_id){
    //console.log(course_classid);
    //console.log(myArr)
    //var courseid = myArr[0];
    url = "course_info.html?" + course_id;
    window.location.href = url;
}

function logout(){
    localStorage.clear();
    window.location.href = "login.html";
}