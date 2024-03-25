const inquirer = require('inquirer');
const express = require('express');
const mysql = require('mysql2');
const { table } = require('table');
const {question1, addDept, addRole} = require('./lib/questions');
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

inquirer.prompt(question1).then((data) => {
    switch (data.choice) {
        case 'View all departments':
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

                console.log(table(newTable));
            })
            break;
        case 'View all roles':
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

                console.log(table(newTable));
            })
            break;
        case 'View all employees':
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

                console.log(table(newTable));
            })
            break;
        case 'Add a department':
            inquirer.prompt(addDept).then((data) => {
                db.query('INSERT INTO departments (dptname) VALUES (?)', [data.dptname], (error, results) => {
                    if (error) {
                        console.error('Error adding department:', error);
                        return;
                      }
                      console.log('Department added successfully.');             
                })
            })
            break;
        case 'Add a role':
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
                        const newData = data2.dptid;
                        const dptid = newData.split(':');
                        db.query('INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)', [data.title, data.salary, dptid[0]], (error, results) => {
                            if (error) {
                                console.error('Error adding department:', error);
                                return;
                            }
                            console.log('Role added successfully.');             
                        })
                    })
                })
            })
            break;
        case 'Add an employee':
            db.query('SELECT * FROM roles', (error, results) => {
                if (error) {
                  console.error('Error executing query:', error);
                  return;
                } 
                console.log(results)
            })
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
            db.end();
            break;
        default:
            break;
    }
})

