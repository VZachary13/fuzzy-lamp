const inquirer = require('inquirer');
const express = require('express');
const mysql = require('mysql2');
const {question1, addDept} = require('./lib/questions');
require('dotenv').config();

const PORT = 3001;
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
            db.query('SELECT * FROM departments', (error, results) => {
                if (error) {
                  console.error('Error executing query:', error);
                  return;
                } 
                console.log(results)
            })
            break;
        case 'View all roles':
            db.query('SELECT * FROM roles', (error, results) => {
                if (error) {
                  console.error('Error executing query:', error);
                  return;
                } 
                console.log(results)
            })
            break;
        case 'View all employees':
            db.query('SELECT * FROM employees', (error, results) => {
                if (error) {
                  console.error('Error executing query:', error);
                  return;
                } 
                console.log(results)
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
            db.query('SELECT * FROM roles', (error, results) => {
                if (error) {
                  console.error('Error executing query:', error);
                  return;
                } 
                console.log(results)
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

