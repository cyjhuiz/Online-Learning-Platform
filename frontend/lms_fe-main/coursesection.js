
    var userid= localStorage.getItem('user_ID');
    //Get course id and class id as URL and individual data
    var sub_url = window.location.href
    sub_url.indexOf("?")
    var course_class_section_id_url_back = sub_url.slice(sub_url.indexOf("?")+1)
    //alert(course_class_id_url_back)
    var myArr = course_class_section_id_url_back.split("_"); //myArr[0] = courseid, myArr[1] = classid, myArr[2] = sectionid
    //console.log(myArr[0]);
    //console.log(myArr[1]);
   // console.log(myArr[2]);

    var userid= localStorage.getItem('user_ID');
    const order_url = "http://localhost:8000/api/v1/order?userid=" + userid;
    //console.log(order_url)

    var course_url = "https://course-container-7ii64z76zq-uc.a.run.app/course?course_ID=" + myArr[0];
    var class_url = "https://class-container-7ii64z76zq-uc.a.run.app/class?class_ID=" + myArr[1] + "&learner_ID=" + userid;
    var section_url = "https://section-container-7ii64z76zq-uc.a.run.app/section/" + myArr[2];
    var material_url = "https://section-container-7ii64z76zq-uc.a.run.app/section/" + myArr[2] +"/content"

    window.onload = async function get_section_information(){
        var user_name= localStorage.getItem('username');
        document.getElementById("navbarDropdown1").innerText = user_name; 
        document.getElementById("fulldetails_name").innerText = "";
        
        //Get Course Info
        fetch(course_url).
            then(response => response.json())
            .then(data => {
                var course_info = data.data.course;
                course_code = course_info["course_code"];
                course_name = course_info["name"];
                //console.log(course_code);
                localStorage.setItem("getcoursecode" , course_code)
                localStorage.setItem("getcoursename" , course_name)
            });

        fetch(class_url).
            then(response => response.json())
            .then(data => {
                var class_info = data.data.class;
                class_name = class_info["class_name"];
                //console.log(current_value);
                localStorage.setItem("getclassname" , class_name)
            })

        fetch(section_url).
            then(response => response.json())
            .then(data => {
                var section_info = data.data.section;
                section_name = section_info["title"];
                document.getElementById("inputSectionTitle").value = section_name;
                localStorage.setItem("getsectionname" , section_name)

                //Determin Action button for quiz portion
                //Depending on the has quiz
                var has_quiz = section_info["has_quiz"];
                var section_id = section_info["section_ID"];
                //console.log(has_quiz);
                var str = "";

                if (has_quiz){
                    str = `
                        <button type="button" class="btn btn-primary" style="margin-right: 5px; padding-left:25px; padding-right:25px;" onclick="view_edit_quiz()">
                            View/Edit Quiz
                        </button><br>
                    `;
                } else {
                    str = `
                        <button type="button" class="btn btn-primary" style="margin-right: 5px; padding-left:25px; padding-right:25px;" onclick="create_quiz()">
                            Create Quiz
                        </button><br>
                    `;
                }
                document.getElementById("determine_button_type").innerHTML = str;
            })
        
        var str = "";
        
        get_material();

        //Need to call cause of the async part which will lag, causing information to be disorted
        combine_title();
    }

    //COPY OF ABOVE TO ONLY LOAD MATERIALS PART
    async function get_material(){
        //GET(Get all section content by section_ID)
        var str = "";
        fetch(material_url).
            then(response => response.json())
            .then(data => {
                var material_info = data.data.section_contents;
                //console.log(material_info.length)

                if (material_info.length === 0){
                    str += `
                        <tr>
                            <td colspan="4" style="text-align: center;"><br><br><br>No Materials Uploaded yet<br>Click on "Add Materials" to start<br><br></td>
                        </tr>
                    `;
                } else {
                    for (let i = 0; i < material_info.length; i++) {
                       var class_status = localStorage.getItem('class_status');
                       
                       if (class_status = "NEW"){
                            str += `
                                    <tr>
                                        <td>${i+1}</td>
                                        <td>${material_info[i]["content_type"]}</td>
                                        <td><a href="" onclick="mat_preview('${material_info[i]["url"]}');">${material_info[i]["description"]}</a></td>
                                        <td style="text-align:center;">
                                            <button onclick="pass_info_to_model(this.id)" id="${material_info[i]['content_ID']}" data-toggle="modal" data-target="#pre_warning_delete" type="button" class="btn btn-secondary btn-sm 12" style="width:125px;margin-top: 5px; margin-bottom: 5px; padding-top: 7px; padding-bottom: 7px;">Delete</button>
                                        </td>
                                    </tr>
                            `;
                       } else {
                            str += `
                            <tr>
                                <td>${i+1}</td>
                                <td>${material_info[i]["content_type"]}</td>
                                <td><a href="" onclick="mat_preview('${material_info[i]["url"]}');">${material_info[i]["description"]}</a></td>
                                <td style="text-align:center;">
                                    Cannot Delete
                                </td>
                            </tr>
                            `;
                       }
                    }
                }
                document.getElementById("course_materials").innerHTML = str;
            })
    }

    function mat_preview(url){
        //console.log(url);
        window.open(url, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=600,height=400");
    }

    function combine_title(){
        setTimeout(function(){ $(document).ready(function(){
            var title_str = " " + localStorage.getItem("getcoursecode") +
                            "-" + localStorage.getItem("getcoursename") +
                            "/" + localStorage.getItem("getclassname") +
                            "/" + localStorage.getItem("getsectionname");
            //console.log(title_str);
            document.getElementById("fulldetails_name").innerHTML = title_str;
        }); }, 2000);

        //CHECK STATUS AND DISPLAY ACCORDINGLY
        var class_status = localStorage.getItem('class_status');
        //console.log(class_status);
        if (class_status != "NEW"){
            document.getElementById('update_section_btn').style.display = "none";
            document.getElementById('inputSectionTitle').readOnly = true;
            document.getElementById('course_mat_btn').style.display = "none";
        }
    }

    async function update_section(){
        var sectionstr = document.getElementById("inputSectionTitle").value;
        if (sectionstr == "") {
            //console.log("HI")
            document.getElementById("error_msg").innerHTML = "Error: Section Title cannot be blank<br><br>"
        } else {

            var section_title_data = {};
            section_title_data["title"] = document.getElementById("inputSectionTitle").value;

            response = await fetch("https://section-container-7ii64z76zq-uc.a.run.app/section/" + myArr[2], {
                    method: "PUT",
                    headers: {
                        'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
                    },
        
                    body: JSON.stringify(section_title_data)
                });
        
            result = await response.json();
            //console.log(result);

            document.getElementById("error_msg").innerHTML = "";

            if(result.code == 400) {
                    alert(result.message)
            } else {
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
    }

    //goes to next page if no quiz created
    function create_quiz(){
        //section_class_trainer_0  (0=ungraded Quiz)
        url = "create_quiz_final.html?" + myArr[2] + "_" + myArr[1] + "_" +  userid + "_0_" + myArr[0];
        window.location.href = url;
        //console.log(url);
    }
    //goes to next page if quiz is created
    function view_edit_quiz(){
        //sectionid_classid
        url = "view_quiz_final.html?" + myArr[2] + "_" + myArr[1] + "_" + myArr[0];
        //console.log(url);
        window.location.href = url;
    }

    //Delete pop up and passing of sectionid
    function pass_info_to_model(sectionid){
        var str = ""
        str = `<button onclick='delete_section(this.id)' id="` + sectionid +
             `" type="button" class="btn btn-danger" data-dismiss="modal">Confirm Delete</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal">Cancel</button>`
        
        //console.log(str);

        document.getElementById("popup_section_id").innerHTML = str;
    }

    async function delete_section(sectionid){
        //console.log(sectionid)
        //delete api here
        //all sections api here
        response = await fetch("https://section-container-7ii64z76zq-uc.a.run.app/section/" + myArr[2] + "/content/" + sectionid, {
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
        //-----------SUCCESS ALERT----------------------

            //refresh materials section
            get_material();
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

    //SECTION FOR UPLOAD MATERIAL
    function youtube_call(){
        //console.log("Hello");
        var str = "";
        str = `
            <div class="form-group row">
                <label for="YoutubeURL" class="col-sm-4 col-form-label">YouTube URL</label>
                <div class="col-sm-8">
                    <input type="text" class="form-control" id="inputURL" placeholder="Paste YouTube URL here...">
                </div>
            </div>
        `;
        document.getElementById("radio_selected").innerHTML = str;
    }

    function upload_file_call(){
        //console.log("BYE");
        var str = "";
        str = `
            <div class="form-group row">
                <label for="custom_file" class="col-sm-4 col-form-label">Upload File:</label>
                <div class="custom-file col-sm-8" style="width:90%;">
                    <input type="file" class="form-control" id="new_file" style="border-color: white;">
                </div>
            </div>
        `;
        document.getElementById("radio_selected").innerHTML = str;
    }

    function upload_file(){
        //True = youtube selected. False = Youtube Link Selected
        var radio_selected = document.getElementById("youtube_url_radio").checked;

        var formData = new FormData();

        var section_id = myArr[2];
        formData.append("section_ID", section_id);

        var name = document.getElementById("inputname").value;
        formData.append("description", name);

        if (radio_selected){
            var url_input = document.getElementById("inputURL").value;
            var input_name = document.getElementById("inputname").value;
            if (url_input=="" || input_name==""){
                document.getElementById("error_msg2").innerHTML = "Error: No blanks allowed";
                return;
            }
        } else {
            var input_name = document.getElementById("inputname").value;
            var input_file = document.getElementById("new_file").value;
            if (input_file=="" || input_name==""){
                document.getElementById("error_msg2").innerHTML = "Error: No blanks allowed";
                return;
            }
        }

        if (radio_selected){
            var url = document.getElementById("inputURL").value;
            formData.append("url", url);
            
            var content_type = "video";
            formData.append("content_type", content_type);

            var to_BE_url = "https://section-container-7ii64z76zq-uc.a.run.app/section/content";

        } else {
            

            //var url = "Test";
            var to_BE_url = "https://section-container-7ii64z76zq-uc.a.run.app/section/content";

            let file = document.getElementById("new_file");
            if ('files' in file) {
                if (file.files.length != 0) {
                    formData.append('url', file.files[0])
                    //console.log(file.files[0]);
                }
            }

            var content_type = "file";
            formData.append("content_type", content_type);

        }

        //console.log(name,section_id,content_type,url);

        fetch(to_BE_url, {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(result => {
                //alert("Success:", result);
                //location.reload();
                $("#addcoursematerial").modal("hide");
                
                //document.getElementById("new_file").value="";


                //-----------SUCCESS ALERT----------------------
                //refresh materials section
                get_material();
                youtube_call();
                document.getElementById("inputname").value = "";
                document.getElementById("error_msg2").innerText= "";
                document.getElementById("youtube_url_radio").checked = true;
                document.getElementById("upload_file_radio").checked = false; 
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
            

            })
            .catch(error => {
                alert('Error:', error);
            });

            

    }


    function logout(){
        localStorage.clear();
        window.location.href = "login.html";
    }