
var userid= localStorage.getItem('user_ID');
var user_name= localStorage.getItem('username');
const all_open_course_url = "https://class-container-7ii64z76zq-uc.a.run.app/class/open";
//console.log(all_open_course_url)

window.onload = async function get_instruct_course(){
    var str = '';
        document.getElementById("navbarDropdown1").innerText = user_name; 

        //Get all Open class
        fetch(all_open_course_url).
            then(response => response.json())
            .then(data => {
                //console.log(data.data.classes.length)
                if (data.data.classes.length == 0){
                    str += `
                        <tr>
                            <td colspan="9" style="text-align: center;"><br><br><br><br><br>There are no classes open for enrollment yet<br><br><br><br><br></td>
                        </tr>
                    `;
                } else {
                    var open_classes = data.data.classes;
                    for (let i = 0; i < open_classes.length; i++) {
                       
                        str += `
                            <tr>
                                <td scope="row">${data.data.classes[i]["class_name"]}</td>
                                <td>${data.data.classes[i].course_info["course_name"]}</td>
                        `;
                        
                        if (open_classes[i].course_info["prerequisites"] === null){
                            str += `
                                <td>None</td>
                            `;
                        } else if (open_classes[i].course_info["prerequisites"].length === 0){
                            str += `
                                <td>None</td>
                            `;
                        } else {
                            str += `<td>`;

                            for (let j =0; j < open_classes[i].course_info["prerequisites"].length; j++){
                                str += `
                                    ${open_classes[i].course_info["prerequisites"][j]["course_code"]}<br>
                                `;
                            }
                        }

                        //2nd <td> will need to wait for real data to come in. For now hard code
                        //3rd <td> will see how they return the time to me
                            str += `
                                </td>
                                <td>${open_classes[i]["remaining_slots"]}/${open_classes[i]["size"]}</td>
                                <td>${open_classes[i]["enrol_start_date"]} -<br>${open_classes[i]["enrol_end_date"]}</td>
                                <td>${open_classes[i]["starting_date"].slice(0,16)} -<br>${open_classes[i]["ending_date"].slice(0,16)}</td>
                                <td>${open_classes[i]["class_status"]}</td>
                                <td>${open_classes[i].trainer_info["trainer_name"]}</td>
                                <td style="text-align:center;">
                                    <button onclick="design_course(this.id)" id="${open_classes[i]["course_ID"]}_${open_classes[i]["class_ID"]}" type="button" class="btn btn-primary btn-sm 12" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px;">View More</button><br>
                                </td>
                            </tr>
                        `;
                    }
                }

                document.getElementById("open_classes").innerHTML = str;
               
            })               
}

//goes to next page base on button clicked
function design_course(course_classid){
    //CourseID, ClassID
    url = "enrollment_page.html?" + course_classid;
    console.log(url);
    window.location.href = url;
}


function logout(){
    localStorage.clear();
    window.location.href = "login.html";
}