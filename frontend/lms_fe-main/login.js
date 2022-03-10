
  

  
async function login(){
   
    email= document.getElementById("email").value
    password = document.getElementById("password").value


    var rolecheck = ""
    var checkboxes = document.querySelectorAll('input[name="roleselect"]:checked')
  
    for (var i = 0; i < checkboxes.length; i++) {
   
        rolecheck=(checkboxes[i].value.split("_")[0])
      }
    console.log(rolecheck)
   
    logindetail= {
        email:email,
        password:password
    
    }
   

     response = await fetch("https://user-container-7ii64z76zq-uc.a.run.app/user/login", {
        method: "POST",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        },
     
        body: JSON.stringify(logindetail)
    });
    
     result = await response.json();
    console.log(result);
    if(result.code == 400) {
        alert(result.message)
    }
    else{
        
        console.log(result.data.user_login_details)
        email = result.data.user_login_details.email;
        job_title = result.data.user_login_details.job_title;
        username = result.data.user_login_details.name
        roles = result.data.user_login_details.roles
        user_ID = result.data.user_login_details.user_ID
        //roles = ['trainer','admin' ]
        //console.log(role)
        //usercache = {"email":email,"job_title":job_title,"username": username,"role":role, "user_ID":user_ID};
      //  console.log(email,job_title,username,role,user_ID)
        localStorage.setItem("username", username);
        localStorage.setItem("roles", JSON.stringify(roles));
        localStorage.setItem("email", email);
        localStorage.setItem("job_title", job_title);
        localStorage.setItem("user_ID", user_ID);
        console.log(localStorage.getItem("roles"));
        allroles = JSON.parse(localStorage.getItem("roles"))
        console.log(allroles)
        for(var getrole in allroles){
            if (rolecheck == "admin" && rolecheck == allroles[getrole] ) {
                window.location.href = "hrmgncourse.html";
                return;
                }
                if (rolecheck=="trainer" && rolecheck == allroles[getrole]) {
                    window.location.href = "my_courses.html";
                    return;
                }
                if (rolecheck=="learner" && rolecheck == allroles[getrole]){
                    //direct to learner homepage
                    alert('no page yet')
                    return;
                }
        }
        alert('Sorry, You do not have the access right for this role')
        

    }
    }
    

function validateLoginForm() {
    checkboxes = document.querySelectorAll('input[name="roleselect"]:checked')
   
    console.log(checkboxes)
    if (document.getElementById("email").value == ""  | document.getElementById("password").value == ""  | checkboxes.length == 0 ) 
 
    {
      alert("Please fill up the empty fields if you want to login.");
      return false;
    }
  
    else {
       login();
    }
}
  
  
  
  
  
  

function check(input)
{
   
    var role =  input.value.split("_")[1];
    console.log()
    var checkboxes = document.getElementsByName("roleselect");
   
    for(var i = 0; i < checkboxes.length; i++)
    {
        //uncheck all
        
        if(checkboxes[i].checked == true)
        {console.log(i)
            checkboxes[i].checked = false;
            document.getElementById("buttondisplay").innerText = "-- Please Select your role--";
        }
    }
    
    //set checked of clicked object
    if(input.checked == true)
    {
        input.checked = false;
        
        document.getElementById("buttondisplay").innerText = "-- Please Select your role--";
    }
    else
    {
        input.checked = true;
        document.getElementById("buttondisplay").innerText =  role;
    }	
}