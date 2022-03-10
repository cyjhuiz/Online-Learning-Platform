

window.addEventListener('load', (event) => {
    if (localStorage.getItem("username") == null) { 
        alert("You have to Log In First");
       
        window.location.href = "login.html";
    }
    
    retrieveroles = JSON.parse(localStorage.getItem("roles"))
    console.log(retrieveroles)
    //retrieveroles =['learner','trainer']
    //navrbarroles = ''
    //navbarroles = `<ul class="navbar-nav mr-auto" name = "navbartarget"></ul>`
    navdropdown = ''
    //document.getElementById("navbarappend").innerHTML+='navbarroles';
  
    for(var navrole in retrieveroles ){
        if(retrieveroles[navrole] == 'admin'){
            if(document.getElementById("lengthadmintrainer").innerText.length == 0){
                document.getElementById("lengthadmintrainer").innerHTML = `<a id= "trainerhrnav" class="nav-link dropdown-toggle" style="font-size:19px;" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
               Courses             
                </a><div class="dropdown-menu " aria-labelledby="navbarDropdown" id="trainerhrnavdrop" >
                      </div>`
            }
            document.getElementById("trainerhrnavdrop").innerHTML+=`<a class="dropdown-item" href="hrmgncourse.html">Manage Courses</a>
                                                                    <a class="dropdown-item" href="hrapprovalpage.html">Applicant List</a>
             `;
        }

        if(retrieveroles[navrole] == 'learner'  ){
            if(document.getElementById("lengthlearnertrainer").innerText.length == 0){
                document.getElementById("lengthlearnertrainer").innerHTML = ` 
                <a id ="trainerlearnernav" class="nav-link dropdown-toggle" style="font-size:19px;" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Learning Centre       
                </a>
                <div class="dropdown-menu " aria-labelledby="navbarDropdown" id = "trainerlearnernavdrop">
                    
                </div>`;
            }
            document.getElementById("trainerlearnernavdrop").innerHTML=`
            

            <a class="dropdown-item" href="all_courses.html">All Courses</a>
            <a class="dropdown-item" href="open_classes.html">Classes Available</a>
            <a class="dropdown-item" href="current_courses.html">My Current Course(s)</a>
            <a class="dropdown-item" href="attempted_courses.html">My Attempted Course(s)</a>
            <a class="dropdown-item" href="action_history.html">Action History</a>
          
            `;
        }

        if(retrieveroles[navrole] == 'trainer'){
            if(document.getElementById("lengthadmintrainer").innerText.length == 0){
                document.getElementById("lengthadmintrainer").innerHTML = `
                <a id= "trainerhrnav" class="nav-link dropdown-toggle" style="font-size:19px;" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Courses      
                </a><div class="dropdown-menu " aria-labelledby="navbarDropdown" id="trainerhrnavdrop" >
                     </div>`
            }
            document.getElementById("trainerhrnavdrop").innerHTML+=`
           
            <a class="dropdown-item" href="my_courses.html">My Courses</a>
            
        `;
        }

    }
   
    //document.getElementById("navbartarget").innerHTML+=navdropdown;


});

function logout(){
    localStorage.clear();
    window.location.href = "login.html";
}