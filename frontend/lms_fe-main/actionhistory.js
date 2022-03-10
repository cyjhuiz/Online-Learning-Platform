
var userid= localStorage.getItem('user_ID');
var user_name= localStorage.getItem('username');
const self_enroll_hist = "https://class-container-7ii64z76zq-uc.a.run.app/class/class_withdrawal?learner_ID=" + userid;

console.log(self_enroll_hist)

window.onload = async function get_history(){
    var str = '';
        document.getElementById("navbarDropdown1").innerText = user_name; 

        //[GET] all class withdrawl by learner ID (status != PENDING)
        fetch(self_enroll_hist).
            then(response => response.json())
            .then(data => {
                //console.log(data.data.classes.length)
                if (data.code == 400 || data.data.withdrawals.length == 0){
                    str += `
                        <tr>
                            <td colspan="10" style="text-align: center;"><br><br><br><br><br>There are no self-enrollment history for rejected/withdrawal yet<br><br><br><br><br></td>
                        </tr>
                    `;
                } else {
                    var class_history = data.data.withdrawals;
                    for (let i = 0; i < class_history.length; i++) {
                    
                        str += `
                            <tr>
                                <td scope="row">${class_history[i].class_info["class_name"]}</td>
                                <td>${class_history[i].class_info.course_info["course_name"]}</td>
                        `;

                        if (class_history[i].class_info.course_info["prerequisites"] === null){
                            str += `
                                <td>None</td>
                            `;
                        } else if (class_history[i].class_info.course_info["prerequisites"].length === 0){
                            str += `
                                <td>None</td>
                            `;
                        } else {
                            str += `<td>`;

                            for (let j =0; j < class_history[i].class_info.course_info["prerequisites"].length; j++){
                                str += `
                                    ${class_history[i].class_info.course_info["prerequisites"][j]["course_code"]}<br>
                                `;
                            }
                        }

                            str += `
                                </td>
                                <td>${class_history[i].class_info["enrol_start_date"]} -<br>${class_history[i].class_info["enrol_end_date"]}</td>
                                <td>${class_history[i].class_info["starting_date"].slice(0,16)} -<br>${class_history[i].class_info["ending_date"].slice(0,16)}</td>
                                <td>Self-Enrolled</td>
                                <td>${class_history[i].class_info.trainer_info["trainer_name"]}</td>
                            `;

                        if (class_history[i]["action"] == 1) {
                            str += `<td>Enrollment Request<br>`;
                        } else if (class_history[i]["action"] == 2){
                            str += `<td>Withdrawal Request<br>`;
                        } else {
                            str += `<td>Withdrawal after Enroll Period<br>`;
                        }

                            str += `
                                ${class_history[i]["reason"]}</td>
                                <td>${class_history[i]["class_status"]}<br>${class_history[i]["hr_reason"]}</td>
                                <td>${class_history[i]["date_of_action"]}</td>
                            </tr>
                            `;
                    }
                }

                document.getElementById("action_history").innerHTML = str;
               
            })               
}

function logout(){
    localStorage.clear();
    window.location.href = "login.html";
}