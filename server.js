const inquirer = require('inquirer');
const express = require('express');
const mysql = require('mysql2');
const { table } = require('table');
const {question1, addDept, addRole, addEmp} = require('./lib/questions');
require('dotenv').config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    console.log(`connected to the employees_db database`)
);

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

        results.forEach(department => {
            newTable.push([department.id, department.name])
        })

        console.log('\n'+table(newTable));
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
    })
}

function addNewRole(){

    inquirer.prompt(addRole).then((data) => {

        var deptIDQuery;

        db.query('SELECT id, dptname FROM departments', (error, results) => {
            
            if (error) {
            console.error('Error fetching department IDs:', error);
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
                        console.error('Error adding role:', error);
                        return;
                    }

                    console.log('Role added successfully.');             
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
                        console.error('Error adding department:', error);
                        return;
                    }

                    const department = results2.map(department => department.department_id);

                    db.query(`SELECT employees.id, CONCAT(employees.first_name, ' ', employees.last_name) AS name FROM employees
                    INNER JOIN roles ON employees.role_id = roles.id
                    WHERE roles.department_id = '${department}'`,(error, results3) => {

                        if (error) {
                            console.error('Error adding department:', error);
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
                                
                            console.log(manager_id);

                            db.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [data.firstname, data.lastname, roleID, manager_id], (error, results) => {
                                
                                if (error) {
                                    console.error('Error adding employee:', error);
                                    return;
                                }

                                console.log('Employee added successfully.');
                            })
                        })
                    })
                })
            })
        })
    })
}

async function init(){
    let loopBreak = 0;
    while (loopBreak === 0) {
    await inquirer.prompt(question1).then((data) => {
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
            case 'Update an employee role':
                db.query('SELECT * FROM roles', (error, results) => {
                    if (error) {
                    console.error('Error executing query:', error);
                    return;
                    } 
                    console.log(results)
                })
                break;
            case 'Quit':
                loopBreak = -1;
                db.end();
                break;
            default:
                break;
        }
    })
}
}