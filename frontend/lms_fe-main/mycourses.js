
// [GET] all class by trainer ID
var userid= localStorage.getItem('user_ID');
var user_name= localStorage.getItem('username');
const trainer_course_URL = "https://class-container-7ii64z76zq-uc.a.run.app/class?trainer_ID=" + userid;

//console.log(trainer_course_URL)

window.onload = async function get_instruct_course(){
    var str = '';
        document.getElementById("navbarDropdown1").innerText = user_name; 
        fetch(trainer_course_URL).
            then(response => response.json())
            .then(data => {
                //console.log(data.code)
                if (data.code === 400){
                    str += `
                        <tr>
                            <td colspan="9" style="text-align: center;"><br><br><br><br><br>There are no courses assigned to you<br><br><br><br><br></td>
                        </tr>
                    `;
                } else {
                    var instruct_classes = data.data.classes;
                    //console.log(instruct_classes);
                    for (let i = 0; i < instruct_classes.length; i++) {
                        
                        str += `
                            <tr>
                                <td scope="row">${data.data.classes[i]["class_name"]}</td>
                                <td>${data.data.classes[i].course_info["course_name"]}</td>
                        `;
                        
                        if (data.data.classes[i].course_info["prerequisites"] === null){
                            str += `
                                <td>None</td>
                            `;
                        } else if (data.data.classes[i].course_info["prerequisites"].length == 0){
                            str += `
                            <td>None</td>
                            `; 
                        } else {
                            str += `<td>`;

                            for (let j =0; j < data.data.classes[i]["course_info"]["prerequisites"].length; j++){
                                str += `
                                    ${data.data.classes[i]["course_info"]["prerequisites"][j]["course_code"]}<br>
                                `;
                            }
                        }

                            str += `
                                </td>
                                <td>${data.data.classes[i]["size"]}</td>
                                <td>${data.data.classes[i]["enrol_start_date"]} -<br>${data.data.classes[i]["enrol_end_date"]}</td>
                                <td>${data.data.classes[i]["starting_date"].slice(0,16)} -<br>${data.data.classes[i]["ending_date"].slice(0,16)}</td>
                                <td>${data.data.classes[i]["class_status"]}</td>
                                <td>${data.data.classes[i]["hr_name"]}</td>
                                <td style="text-align:center;">
                                    <button onclick="design_course(this.id)" id="${data.data.classes[i]["course_ID"]}_${data.data.classes[i]["class_ID"]}" type="button" class="btn btn-primary btn-sm 12" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px;">View Class</button><br>
                                </td>
                            </tr>
                        `;
                    }
                }

                document.getElementById("my_courses").innerHTML = str;
                sortTable();
            })               
}

//goes to next page base on button clicked
function design_course(course_classid){
    //console.log(course_classid);
    myArr = course_classid.split("_")
    //console.log(myArr)
    //var courseid = myArr[0];
    url = "view_course.html?courseid=" + myArr[0] + "&classid=" + myArr[1]
    window.location.href = url;
}

function sortTable() {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("myTable");
    switching = true;
    /*Make a loop that will continue until
    no switching has been done:*/
    while (switching) {
      //start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /*Loop through all table rows (except the
      first, which contains table headers):*/
      for (i = 1; i < (rows.length - 1); i++) {
        //start by saying there should be no switching:
        shouldSwitch = false;
        /*Get the two elements you want to compare,
        one from current row and one from the next:*/
        x = rows[i].getElementsByTagName("TD")[6];
        y = rows[i + 1].getElementsByTagName("TD")[6];
        //check if the two rows should switch place:
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
      if (shouldSwitch) {
        /*If a switch has been marked, make the switch
        and mark that a switch has been done:*/
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  }

function logout(){
    localStorage.clear();
    window.location.href = "login.html";
}