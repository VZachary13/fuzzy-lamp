const inquirer = require('inquirer');
const { table } = require('table');
const {makeUpdate, question1, addDept, addRole, addEmp} = require('./lib/questions');
const db = require('./config/connections')

init();

function viewDepartment(){

    db.query('SELECT id, dptname AS name FROM departments', (error, results) => {
        
        if (error) {
            console.error('Error executing query:', error);
            return;
        } 
        
        const newTable = [
            ['Department ID', 'Department Name']
        ] 

        results.forEach(peanuts => {
            newTable.push([peanuts.id, peanuts.name])
        })

        console.log('\n'+table(newTable));
                                
        init();
    })
}

function addDepartment(){

    inquirer.prompt(addDept).then((data) => {

        db.query('INSERT INTO departments (dptname) VALUES (?)', [data.dptname], (error, results) => {
            if (error) {
                console.error('Error adding department:', error);
                return;
            }

            console.log('Department added successfully.'); 
                                
            init();            
        })
    })
}

function viewRoles(){

    db.query(`SELECT roles.id, roles.title, roles.salary, departments.dptname AS department FROM roles 
    INNER JOIN departments ON roles.department_id = departments.id`, (error, results) => {
        
        if (error) {
        console.error('Error executing query:', error);
        return;
        } 

        const newTable = [
            ['Role ID', 'Title', 'Salary', 'Department']
        ] 

        results.forEach(role => {
            newTable.push([role.id, role.title, role.salary, role.department])
        })

        console.log('\n'+table(newTable));
                                
        init();
    })
}

function addNewRole(){

    inquirer.prompt(addRole).then((data) => {

        var deptIDQuery;

        db.query('SELECT id, dptname FROM departments', (error, results) => {
            
            if (error) {
                console.error('Error executing query:', error);
                return;
            }

            deptIDQuery = results.map(department => `${department.id}: ${department.dptname}`);

            inquirer.prompt({
                type: 'list',
                name: 'dptid',
                message: 'Please select from the available department IDs',
                choices: deptIDQuery
            }).then((data2) => {

                const dptid = data2.dptid.split(':');

                db.query('INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)', [data.title, data.salary, dptid[0]], (error, results) => {
                    
                    if (error) {
                        console.error('Error executing query:', error);
                        return;
                    }

                    console.log('Role added successfully.'); 
                                
                    init();            
                })

            })
        })
    })
}

function viewEmployees(){

    db.query(`SELECT employees.id, CONCAT(employees.first_name, ' ', employees.last_name) AS name, roles.title, roles.salary, departments.dptname AS department, CONCAT(managers.first_name, ' ', managers.last_name) AS manager FROM employees
    INNER JOIN roles ON employees.role_id = roles.id
    INNER JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees AS managers ON employees.manager_id = managers.id`, (error, results) => {

        if (error) {
            console.error('Error executing query:', error);
            return;
        } 

        const newTable = [
            ['Employee ID', 'Name', 'Title', 'Salary', 'Department', 'Manager']
        ] 

        results.forEach(employee => {
            newTable.push([employee.id, employee.name, employee.title, employee.salary, employee.department, employee.manager])
        })

        console.log('\n'+table(newTable));
                                
        init();
    })
}

function addEmployees(){

    inquirer.prompt(addEmp).then((data) => {

        db.query('SELECT id, title FROM roles', (error, results) => {

            if (error) {
                console.error('Error executing query:', error);
                return;
            } 
            
            const roleIDQuery = results.map(role => role.title);

            inquirer.prompt({
                type: 'list',
                name: 'title',
                message: 'Please select a job role from available roles',
                choices: roleIDQuery
            }).then((data2) => {

                var roleID;

                results.map(role => {
                    if (data2.title == role.title) {
                        roleID = role.id;
                    }
                })

                db.query(`SELECT department_id FROM roles
                WHERE title = '${data2.title}'`, (error, results2) => {

                    if (error) {
                        console.error('Error executing query:', error);
                        return;
                    }

                    const department = results2.map(department => department.department_id);

                    db.query(`SELECT employees.id, CONCAT(employees.first_name, ' ', employees.last_name) AS name FROM employees
                    INNER JOIN roles ON employees.role_id = roles.id
                    WHERE roles.department_id = '${department}'`,(error, results3) => {

                        if (error) {
                            console.error('Error executing query:', error);
                            return;
                        }

                        const employeeNameQuery = results3.map(employee => employee.name);
                        employeeNameQuery.push('No Manager');

                        inquirer.prompt({
                            type: 'list',
                            name: 'name',
                            message: 'Please select a manager from available employees or select "No Manager"',
                            choices: employeeNameQuery
                        }).then((data3) => {

                            var manager_id = null; 

                            results3.map(manager => {
                                if (data3.name == manager.name) {
                                    manager_id = manager.id;
                                }
                            })

                            db.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [data.firstname, data.lastname, roleID, manager_id], (error, results) => {
                                
                                if (error) {
                                    console.error('Error executing query:', error);
                                    return;
                                }

                                console.log('Employee added successfully.');

                                init();
                            })
                        })
                    })
                })
            })
        })
    })
}

function updateEmployees(){

    db.query(`SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees`, (error, results) => {

        if (error) {
            console.error('Error executing query:', error);
            return;
        }
        empList = results.map(employee => `${employee.id}: ${employee.name}`);
        var empID;
                
        inquirer.prompt({
            type: 'list',
            name: 'employee',
            message: "Which employee's data would you like to update?",
            choices: empList
        }).then((data) => {
            var temp = data.employee.split(': ');
            results.map(emp => {
                if(temp[1] == emp.name) {
                    empID = emp.id;
                }
            })
            console.log(empID);
            updateSwitchCase(empID);
        })
    })
}

function updateSwitchCase(empID){
    
    inquirer.prompt(makeUpdate).then((choiceData)=>{

        switch (choiceData.which){
            case 'Name':
                updateName(empID);
                break;

            case 'Role':
                updateRole(empID);
                break;

            case 'Manager':
                updateManager(empID);
                break;

            case 'Quit':
                init();
                break;
        }
    })
}

function updateName(empID){
    inquirer.prompt(addEmp).then((nameData)=>{
        db.query(`UPDATE employees SET first_name = '${nameData.firstname}', last_name = '${nameData.lastname}' WHERE id = '${empID}'`, (error, results) => {

            if (error) {
                console.error('Error executing query:', error);
                return;
            }

            console.log('Name updated successfully');
            updateSwitchCase(empID);
        })
    })
}

function updateRole(empID){
    
    db.query('SELECT id, title FROM roles', (error, results) => {

        if (error) {
            console.error('Error executing query:', error);
            return;
        }
        
        const roleIDQuery = results.map(role => role.title);

        inquirer.prompt({
            type: 'list',
            name: 'title',
            message: 'Please select a job role from available roles',
            choices: roleIDQuery
        }).then((data2) => {

            var roleID;

            results.map(role => {
                if (data2.title == role.title) {
                    roleID = role.id;
                }
            })
            
            db.query(`UPDATE employees SET role_id = '${roleID}' WHERE id = '${empID}'`, (error, results) => {

                if (error) {
                    console.error('Error executing query:', error);
                    return;
                }

                console.log('Role updated successfully');
                updateSwitchCase(empID);
            })
        }) 
    })
}

function updateManager(empID){
    db.query(`SELECT department_id FROM roles
    WHERE title = '${data2.title}'`, (error, results2) => {

        if (error) {
            console.error('Error executing query:', error);
            return;
        }

        const department = results2.map(department => department.department_id);

        db.query(`SELECT employees.id, CONCAT(employees.first_name, ' ', employees.last_name) AS name FROM employees
        INNER JOIN roles ON employees.role_id = roles.id
        WHERE roles.department_id = '${department}'`,(error, results3) => {

            if (error) {
                console.error('Error executing query:', error);
                return;
            }

            const employeeNameQuery = results3.map(employee => employee.name);
            employeeNameQuery.push('No Manager');

            inquirer.prompt({
                type: 'list',
                name: 'name',
                message: 'Please select a manager from available employees or select "No Manager"',
                choices: employeeNameQuery
            }).then((data3) => {

                var manager_id = null; 

                results3.map(manager => {
                    if (data3.name == manager.name) {
                        manager_id = manager.id;
                    }
                })
                
                db.query(`UPDATE employees SET manager_id = '${manager_id}' WHERE id = '${empID}'`, (error, results) => {

                    if (error) {
                        console.error('Error executing query:', error);
                        return;
                    }

                    console.log('Manager updated successfully');
                    updateSwitchCase(empID);
                })
            }) 
        }) 
    })
}

function init(){
    inquirer.prompt(question1).then((data) => {

        switch (data.choice) {

            case 'View all departments':
                viewDepartment();
                break;

            case 'View all roles':
                viewRoles();
                break;

            case 'View all employees':
                viewEmployees();
                break;

            case 'Add a department':
                addDepartment();
                break;

            case 'Add a role':
                addNewRole();
                break;

            case 'Add an employee':
                addEmployees();
                break;

            case 'Update an employee':
                updateEmployees();
                break;

            case 'Quit':
                db.end();
                break;

            default:
                break;
        }
    })
}