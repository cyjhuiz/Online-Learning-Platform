## List of available endpoints

- [GET] all classes by course ID
- [GET] all classes by trainer ID
- [GET] class by class ID
- [GET] all class
- [POST] create class
- [GET] all OPEN classes
- [GET] check if learner is assigned to class for a specific course
- [PUT] update class
- [DELETE] delete class
- [GET] all enrolled learners by class ID
- [GET] check class minimum requirements to change status (NEW to OPEN)
- [PUT] update class status
- [GET] all learner withdrawals applications by learner ID (status != PENDING)
- [GET] all learner withdrawals applications by class ID
- [DELETE] delete class applicaiton by learner ID and class ID
- [GET] all class applicants by class ID
- [GET] all class applicants by learnerID (application_status = PENDING, class_status != NEW || != CLOSE)
- [POST] create class application by student
- [POST] create approved student record
- [PUT] update class application status
- [PUT] update class withdrawal status
- [GET] all enrolled classes by learner ID
- [GET] enrolled classes by learner ID (class status != NEW || != CLOSED)
- [DELETE] delete enrolled learner from class by learner ID
- [POST] create class withdrawal
