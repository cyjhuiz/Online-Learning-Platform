var userid= localStorage.getItem('user_ID');
//Get course id and class id as URL and individual data
var sub_url = window.location.href;
sub_url.indexOf("?");
var course_id = sub_url.slice(sub_url.indexOf("?")+1);
//console.log(course_id);

var userid= localStorage.getItem('user_ID');

//get course information
var course_url = "https://course-container-7ii64z76zq-uc.a.run.app/course?course_ID=" + course_id;
var open_courses_url = "https://class-container-7ii64z76zq-uc.a.run.app/class/open"


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
                if (course_info["prerequisites"].length === 0){
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

    //GET alll OPEN class
    //to check if any course open if yes bring them to the page to enroll
    fetch(open_courses_url).
            then(response => response.json())
            .then(data => {
                var is_open = 0;
                var class_id = 0;
                var open_course = data.data.classes;

                for (i=0; i < open_course.length; i++){
                    if (open_course[i]["course_ID"] == course_id){
                        is_open = 1
                        class_id = open_course[i]["class_ID"];
                    }
                };

                if (is_open == 0) {
                    document.getElementById("directory").innerText = "Do keep a look out for possible future classes open for this course";
                    document.getElementById("directory_btn").innerHTML =   `
                        <button type="button" class="btn btn-primary" style="margin-right: 5px; padding-left:25px; padding-right:25px;" onclick="all_course()">
                            Return to View All Courses
                        </button><br>
                    `;
                } else {
                    document.getElementById("directory").innerText = "This course is currently open for enrollment";
                    document.getElementById("directory_btn").innerHTML =   `
                        <button type="button" id="${course_id}_${class_id}" class="btn btn-primary" style="margin-right: 5px; padding-left:25px; padding-right:25px;" onclick="enrollment_page(this.id)">
                            Check the class out!
                        </button><br>
                    `;
                }
                
            })
}
    
//goes to next page base on button clicked
function enrollment_page(course_classid){
    url = "enrollment_page.html?" + course_classid;
    console.log(url);
    window.location.href = url;
}

function all_course(){
    url = "all_courses.html";
    console.log(url);
    window.location.href = url;
}

function logout(){
    localStorage.clear();
    window.location.href = "login.html";
}