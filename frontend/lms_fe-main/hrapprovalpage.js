

  
  
async function enrolapprove(approvedetail){
user_ID =  localStorage.getItem("user_ID")

myArr = approvedetail.split("_")

approvedata= {
    class_ID:myArr[0],
    learner_ID:myArr[1],
    status:"APPROVED"
}
console.log(approvedata)
//UPDATE STUDENT APPLICANT STATUS TO APPROVED
response = await fetch("https://class-container-7ii64z76zq-uc.a.run.app/class/update_application", {
        method: "PUT",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        },
     
        body: JSON.stringify(approvedata)
    });
    
    result = await response.json();
    console.log(result)

    //ADD STUDENT TO CLASS IF APPROVED
    if(result.data['status']=="APPROVED"){
        addapprovedata= {
           
            learner_ID:myArr[1],
            is_assigned:false
        }
        response = await fetch("https://class-container-7ii64z76zq-uc.a.run.app/class/" + myArr[0] +"/learner", {
        method: "POST",
        headers: {
            'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
        },
     
        body: JSON.stringify(addapprovedata)
    });
    
     result = await response.json();
     console.log(result)
   

    }


    if(result.code==400){
        alert("Unable to perform the action.")
        return false
    }

    else if(result.code==200) {
        $("#success_msg").modal();
        setTimeout(function(){  $("#success_msg").modal("hide"); }, 2000);
       
        allclassappload();
    }
   
 
}

async function enrolreject(approvedetail){
    user_ID =  localStorage.getItem("user_ID")

    myArr = approvedetail.split("_")
    
    approvedata= {
        class_ID:myArr[0],
        learner_ID:myArr[1],
        status:"REJECTED"
    }
    console.log(approvedata)
    //UPDATE STUDENT APPLICANT STATUS TO APPROVED
    response = await fetch("https://class-container-7ii64z76zq-uc.a.run.app/class/update_application", {
            method: "PUT",
            headers: {
                'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
            },
         
            body: JSON.stringify(approvedata)
        });
        
        result = await response.json();
        console.log(result)
        $("#success_msg").modal();
        setTimeout(function(){  $("#success_msg").modal("hide"); }, 2000);
        allclassappload();
}









  
async function withdrawapprove(approvedetail){
    user_ID =  localStorage.getItem("user_ID")
    myArr = approvedetail.split("_")
    hrreason = document.getElementById("hrreason"+ myArr[2]).value;
    
    approvedata= {
        class_ID:myArr[0],
        learner_ID:myArr[1],
        status: "APPROVED",
        hr_reason:hrreason
    }
    console.log(approvedata)
    response = await fetch("https://class-container-7ii64z76zq-uc.a.run.app/class/update_withdrawal/"+ user_ID, {
            method: "PUT",
            headers: {
                'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
            },
         
            body: JSON.stringify(approvedata)
        });
        
         result = await response.json();
       
        
         console.log(result)

        if(result.code==400){
            alert("Unable to perform the action.")
            return false
        }

        else if(result.code==200) {
            $("#success_msg").modal();
            setTimeout(function(){  $("#success_msg").modal("hide"); }, 2000);
           
            allwithdrawappload();
        }
       
        
    }


    async function withdrawreject(rejectdetail){
      
        user_ID =  localStorage.getItem("user_ID")
        myArr = rejectdetail.split("_")
       
        hrreason = document.getElementById("hrreason" + myArr[2]).value; 
        console.log(document.getElementById("hrreason" + + myArr[2]).value) 
        rejectdata= {
            class_ID:myArr[0],
            learner_ID:myArr[1],
            status: "REJECTED",
            hr_reason:hrreason
        }
        console.log(rejectdata)
        response = await fetch("https://class-container-7ii64z76zq-uc.a.run.app/class/update_withdrawal/"+ user_ID, {
            method: "PUT",
            headers: {
                'Access-Control-Allow-Origin': '*',  'Content-Type': 'application/json;charset=utf-8'
            },

            body: JSON.stringify(rejectdata)
          
        } );
        
         result = await response.json();
        console.log(result)
        if(result.code==400){
            alert("Unable to perform the action.")
            return false
        }

        else if(result.code==200) {
            $("#success_msg").modal();
            setTimeout(function(){  $("#success_msg").modal("hide"); }, 2000);
           
            allwithdrawappload();
        }
    }
  


window.onload = async function get_hr_applicant(){

    if (localStorage.getItem("username") == null) { 
        alert("You have to Log In First");
       
        window.location.href = "login.html";
    }
    else {
        user_name =  localStorage.getItem("username")
        document.getElementById("navbarDropdown1").innerText = user_name; 
        

      
        enrolstr=''
        numbercheck= 0

        allclassappresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class/class_application')
        allclassappresponse = await allclassappresponse.json()
        allclassappresponse = allclassappresponse.data.applications
        console.log(allclassappresponse)

        allclasswithdrawresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class/class_withdrawal')
        allclasswithdrawresponse = await allclasswithdrawresponse.json()
        allclasswithdrawresponse = allclasswithdrawresponse.data.withdrawals
        console.log(allclasswithdrawresponse)
        
        
        //remove above loop then put the new api call here
           allclassapp = allclassappresponse
           allclassapplength = allclassapp.length
           console.log(allclassapplength)
           for(var z = 0; z < allclassapplength; z++){
         
            
            if(allclassapp[z]['status'] != 'PENDING'){
                continue
               }
               if(allclassapp[z]['class_info']['trainer_info']['trainer_name']==null){
                allclassapp[z]['class_info']['trainer_info']['trainer_name']=''
               }

              
                if(allclassapp[z]['status'] == 'PENDING'){
                    numbercheck+=1
                    if(allclassapp[z]['class_info']['remaining_slots'] > 0 ){
                        enrolstr += `
                        <tr>
                            <td scope="row">${allclassapp[z]['learner_info']['learner_name']}</td>
                            <td>${allclassapp[z]['class_info']['class_name']}</td>
                            <td>${allclassapp[z]['class_info']['course_info']['course_name']}</td>
                            <td>${allclassapp[z]['class_info']['remaining_slots']}/${allclassapp[z]['class_info']['size']}</td>
                  
                            <td>${allclassapp[z]['class_info']['enrol_start_date']} -<br>${allclassapp[z]['class_info']['enrol_end_date']} </td>
                            <td>${allclassapp[z]['class_info']['starting_date'].slice(0,11)} -<br>${allclassapp[z]['class_info']['ending_date'].slice(0,11)} </td>
                            <td>${allclassapp[z]['class_info']['class_status']}</td>
                            <td>${allclassapp[z]['class_info']['trainer_info']['trainer_name']}</td>
                            <td style="text-align:center;">
                                <button onclick="enrolapprove(this.id)" id="${allclassapp[z]['class_info']['class_ID']}_${allclassapp[z]['learner_ID']}" type="button" class="btn btn-success btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; ">Approve</button><br>
                                <button onclick="enrolreject(this.id)" id="${allclassapp[z]['class_info']['class_ID']}_${allclassapp[z]['learner_ID']}" type="button" class="btn btn-danger btn-sm btn-block" style="text-align: center;"  >Reject</button><br>
                            </td>
                        </tr>
                        
                    `;
                    }

                    else{
                        enrolstr += `
                        <tr>
                            <td scope="row">${allclassapp[z]['learner_info']['learner_name']}</td>
                            <td>${allclassapp[z]['class_info']['class_name']}</td>
                            <td>${allclassapp[z]['class_info']['course_info']['course_name']}</td>
                            <td>${allclassapp[z]['class_info']['remaining_slots']}/${allclassapp[z]['class_info']['size']}</td>
                  
                            <td>${allclassapp[z]['class_info']['enrol_start_date']} -<br>${allclassapp[z]['class_info']['enrol_end_date']} </td>
                            <td>${allclassapp[z]['class_info']['starting_date'].slice(0,11)} -<br>${allclassapp[z]['class_info']['ending_date'].slice(0,11)} </td>
                            <td>${allclassapp[z]['class_info']['class_status']}</td>
                            <td>${allclassapp[z]['class_info']['trainer_info']['trainer_name']}</td>
                            <td style="text-align:center;">
                               
                                <button onclick="enrolreject(this.id)" id="${allclassapp[z]['class_info']['class_ID']}_${allclassapp[z]['learner_ID']}" type="button" class="btn btn-danger btn-sm btn-block" style="text-align: center;"  >Reject</button><br>
                            </td>
                        </tr>
                        
                    `;

                    }


                }
           }
           

        
        
        document.getElementById("all_enrolment").innerHTML = enrolstr;




        //for withdrawal applicant

        withdrawstr=''
        numbercheck= 0
        withdrawrejectmodal = ''
        
                
                    //remove above loop then put the new api call here
                    //allclasswithdrawresponse = allclasswithdrawresponse.data.withdrawals
                    allwithdrawapplicants = allclasswithdrawresponse
                    
                    allwithdrawlength = allwithdrawapplicants.length
                    console.log(allwithdrawlength)
                    for(var y = 0; y < allwithdrawlength; y++){
                        allwithdrawclassinfo = allwithdrawapplicants[y].class_info
                        if(allwithdrawapplicants[y]['class_status'] != 'PENDING'){
                            continue
                           }
                            if(allwithdrawapplicants[y]['class_status'] == 'PENDING'){
                                if(allwithdrawclassinfo['trainer_info']['trainer_name']==null){
                                    allwithdrawclassinfo['trainer_info']['trainer_name']=''
                                }
                               
                                numbercheck+=1
                                withdrawstr += `
                                <tr>
                                    <td scope="row">${allwithdrawapplicants[y]['learner_info']['learner_name']}</td>
                                    <td>${allwithdrawclassinfo['class_name']}</td>
                                    <td>${allwithdrawclassinfo['course_info']['course_name']}</td>
                                    <td>${allwithdrawclassinfo['enrol_start_date']} -<br>${allwithdrawclassinfo['enrol_end_date']} </td>
                                    <td>${allwithdrawclassinfo['starting_date'].slice(0,11)} -<br>${allwithdrawclassinfo['ending_date'].slice(0,11)} </td>
                                    <td>${allwithdrawclassinfo['class_status']}</td>
                                    <td>${allwithdrawclassinfo['trainer_info']['trainer_name']}</td>
                                    <td>${allwithdrawapplicants[y]['reason']}</td>
                                    <td style="text-align:center;">
                                        <button onclick="withdrawapprove(this.id)" id="${allwithdrawapplicants[y]['class_ID']}_${allwithdrawapplicants[y]['learner_ID']}_${numbercheck.toString()}" type="button" class="btn btn-success btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; ">Approve</button><br>
                                        <button type="button" class="btn btn-danger btn-sm btn-block" style="text-align: center;" data-toggle="modal" data-target="#withdrawreject`+ numbercheck.toString() + `" >Reject</button><br>
                                    </td>
                                </tr>
                                
                            `;

                            withdrawrejectmodal+=`<div class="modal fade" id="withdrawreject` + numbercheck.toString() + `"` + ` tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" >
                            <div class="modal-dialog" role="document">
                                <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="exampleModalLabel">Withdraw Request</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                   
                                    
                                            <div class="form-group row">
                                                <label for="section_title" class="col-sm-4 col-form-label">Reason</label>
                                                    <div class="col-sm-8">
                                                        <input type="text" class="form-control" id="hrreason` + numbercheck.toString()   + `" placeholder="">
                                                    </div>
                                            </div>
                                    
                                </div>
                                <div class="modal-footer">
                                    <button type="button" data-toggle="modal" data-target="#deletemodal" id="${allwithdrawapplicants[y]['class_ID']}_${allwithdrawapplicants[y]['learner_ID']}_${numbercheck.toString()}" class="btn btn-success" data-dismiss="modal" onclick="withdrawreject(this.id)">Confirm</button>
                                    <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>
                                </div>
                                </div>
                            </div>
                            </div>
                            
                            `;

                    }
                    

                    }

                
      
            
     
       
    
    document.getElementById("all_withdrawals").innerHTML = withdrawstr;
    document.getElementById("withdrawmodalarea").innerHTML = withdrawrejectmodal;
}

}


async function allclassappload(){
    user_name =  localStorage.getItem("username")
    document.getElementById("navbarDropdown1").innerText = user_name; 
    document.getElementById("all_enrolment").innerHTML = ' <td colspan="9" style="text-align: center;"><br><br><br><br><br> <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"> <span class="sr-only">Loading...</span> </div><br><br><br><br><br> </td>    '

    enrolstr=''
    numbercheck= 0

    allclassappresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class/class_application')
    allclassappresponse = await allclassappresponse.json()
    allclassappresponse = allclassappresponse.data.applications
    console.log(allclassappresponse)
    //remove above loop then put the new api call here
    allclassapp = allclassappresponse
    allclassapplength = allclassapp.length
    console.log(allclassapplength)
    for(var z = 0; z < allclassapplength; z++){
  
     
     if(allclassapp[z]['status'] != 'PENDING'){
         continue
        }
        if(allclassapp[z]['class_info']['trainer_info']['trainer_name']==null){
         allclassapp[z]['class_info']['trainer_info']['trainer_name']=''
        }

       
         if(allclassapp[z]['status'] == 'PENDING'){
             numbercheck+=1
             if(allclassapp[z]['class_info']['remaining_slots'] > 0 ){
                 enrolstr += `
                 <tr>
                     <td scope="row">${allclassapp[z]['learner_info']['learner_name']}</td>
                     <td>${allclassapp[z]['class_info']['class_name']}</td>
                     <td>${allclassapp[z]['class_info']['course_info']['course_name']}</td>
                     <td>${allclassapp[z]['class_info']['remaining_slots']}/${allclassapp[z]['class_info']['size']}</td>
           
                     <td>${allclassapp[z]['class_info']['enrol_start_date']} -<br>${allclassapp[z]['class_info']['enrol_end_date']} </td>
                     <td>${allclassapp[z]['class_info']['starting_date'].slice(0,11)} -<br>${allclassapp[z]['class_info']['ending_date'].slice(0,11)} </td>
                     <td>${allclassapp[z]['class_info']['class_status']}</td>
                     <td>${allclassapp[z]['class_info']['trainer_info']['trainer_name']}</td>
                     <td style="text-align:center;">
                         <button onclick="enrolapprove(this.id)" id="${allclassapp[z]['class_info']['class_ID']}_${allclassapp[z]['learner_ID']}" type="button" class="btn btn-success btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; ">Approve</button><br>
                         <button onclick="enrolreject(this.id)" id="${allclassapp[z]['class_info']['class_ID']}_${allclassapp[z]['learner_ID']}" type="button" class="btn btn-danger btn-sm btn-block" style="text-align: center;"  >Reject</button><br>
                     </td>
                 </tr>
                 
             `;
             }

             else{
                 enrolstr += `
                 <tr>
                     <td scope="row">${allclassapp[z]['learner_info']['learner_name']}</td>
                     <td>${allclassapp[z]['class_info']['class_name']}</td>
                     <td>${allclassapp[z]['class_info']['course_info']['course_name']}</td>
                     <td>${allclassapp[z]['class_info']['remaining_slots']}/${allclassapp[z]['class_info']['size']}</td>
           
                     <td>${allclassapp[z]['class_info']['enrol_start_date']} -<br>${allclassapp[z]['class_info']['enrol_end_date']} </td>
                     <td>${allclassapp[z]['class_info']['starting_date'].slice(0,11)} -<br>${allclassapp[z]['class_info']['ending_date'].slice(0,11)} </td>
                     <td>${allclassapp[z]['class_info']['class_status']}</td>
                     <td>${allclassapp[z]['class_info']['trainer_info']['trainer_name']}</td>
                     <td style="text-align:center;">
                        
                         <button onclick="enrolreject(this.id)" id="${allclassapp[z]['class_info']['class_ID']}_${allclassapp[z]['learner_ID']}" type="button" class="btn btn-danger btn-sm btn-block" style="text-align: center;"  >Reject</button><br>
                     </td>
                 </tr>
                 
             `;

             }


         }
    }
    

 
 
 document.getElementById("all_enrolment").innerHTML = enrolstr;

       
}




async function allwithdrawappload(){
    user_name =  localStorage.getItem("username")
    document.getElementById("navbarDropdown1").innerText = user_name; 
    
    document.getElementById("all_withdrawals").innerHTML = ' <td colspan="9" style="text-align: center;"><br><br><br><br><br> <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"> <span class="sr-only">Loading...</span> </div><br><br><br><br><br> </td>    '
    document.getElementById("withdrawmodalarea").innerHTML = ''

    allclasswithdrawresponse = await fetch('https://class-container-7ii64z76zq-uc.a.run.app/class/class_withdrawal')
    allclasswithdrawresponse = await allclasswithdrawresponse.json()
    allclasswithdrawresponse = allclasswithdrawresponse.data.withdrawals
    console.log(allclasswithdrawresponse)
    //for withdrawal applicant

    withdrawstr=''
    numbercheck= 0
    withdrawrejectmodal = ''
    
            
                //remove above loop then put the new api call here
                //allclasswithdrawresponse = allclasswithdrawresponse.data.withdrawals
                allwithdrawapplicants = allclasswithdrawresponse
                
                allwithdrawlength = allwithdrawapplicants.length
                console.log(allwithdrawlength)
                for(var y = 0; y < allwithdrawlength; y++){
                    allwithdrawclassinfo = allwithdrawapplicants[y].class_info
                    if(allwithdrawapplicants[y]['class_status'] != 'PENDING'){
                        continue
                       }
                        if(allwithdrawapplicants[y]['class_status'] == 'PENDING'){
                            if(allwithdrawclassinfo['trainer_info']['trainer_name']==null){
                                allwithdrawclassinfo['trainer_info']['trainer_name']=''
                            }
                           
                            numbercheck+=1
                            withdrawstr += `
                            <tr>
                                <td scope="row">${allwithdrawapplicants[y]['learner_info']['learner_name']}</td>
                                <td>${allwithdrawclassinfo['class_name']}</td>
                                <td>${allwithdrawclassinfo['course_info']['course_name']}</td>
                                <td>${allwithdrawclassinfo['enrol_start_date']} -<br>${allwithdrawclassinfo['enrol_end_date']} </td>
                                <td>${allwithdrawclassinfo['starting_date'].slice(0,11)} -<br>${allwithdrawclassinfo['ending_date'].slice(0,11)} </td>
                                <td>${allwithdrawclassinfo['class_status']}</td>
                                <td>${allwithdrawclassinfo['trainer_info']['trainer_name']}</td>
                                <td>${allwithdrawapplicants[y]['reason']}</td>
                                <td style="text-align:center;">
                                    <button onclick="withdrawapprove(this.id)" id="${allwithdrawapplicants[y]['class_ID']}_${allwithdrawapplicants[y]['learner_ID']}_${numbercheck.toString()}" type="button" class="btn btn-success btn-sm btn-block" style="margin-top: 5px; margin-bottom: 5px; padding-top: 4px; padding-bottom: 4px; ">Approve</button><br>
                                    <button type="button" class="btn btn-danger btn-sm btn-block" style="text-align: center;" data-toggle="modal" data-target="#withdrawreject`+ numbercheck.toString() + `" >Reject</button><br>
                                </td>
                            </tr>
                            
                        `;

                        withdrawrejectmodal+=`<div class="modal fade" id="withdrawreject` + numbercheck.toString() + `"` + ` tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" >
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLabel">Withdraw Request</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                               
                                
                                        <div class="form-group row">
                                            <label for="section_title" class="col-sm-4 col-form-label">Reason</label>
                                                <div class="col-sm-8">
                                                    <input type="text" class="form-control" id="hrreason` + numbercheck.toString()   + `" placeholder="">
                                                </div>
                                        </div>
                                
                            </div>
                            <div class="modal-footer">
                                <button type="button" data-toggle="modal" data-target="#deletemodal" id="${allwithdrawapplicants[y]['class_ID']}_${allwithdrawapplicants[y]['learner_ID']}_${numbercheck.toString()}" class="btn btn-success" data-dismiss="modal" onclick="withdrawreject(this.id)">Confirm</button>
                                <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>
                            </div>
                            </div>
                        </div>
                        </div>
                        
                        `;

                }
                

                }

            
  
        
 
   

document.getElementById("all_withdrawals").innerHTML = withdrawstr;
document.getElementById("withdrawmodalarea").innerHTML = withdrawrejectmodal;

   
    
}

function logout(){
    localStorage.clear();
    window.location.href = "login.html";
}