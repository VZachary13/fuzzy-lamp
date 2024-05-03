function isItText(input){
    const onlyLets = /^[A-Za-z]+$/;
    if(onlyLets.test(input)){
        return true
    }  else {
        return 'Invalid Entry'
    }
}

function isItNum(input){
    const onlyNums = /^\d+(\.\d{0,2})?$/;
    if(onlyNums.test(input)){
        return true
    }  else {
        return 'Invalid Entry'
    }
}

const question1 = [
    {
        type: 'list',
        name: 'choice',
        message: 'What would you like to do?',
        choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee', 'Quit']
    }
]

const addDept = [
    {
        type: 'input',
        name: 'dptname',
        message: 'What is the name of the new department you would like to add?',
        validate: isItText
    }
]

const addRole = [
    {
        type: 'input',
        name: 'title',
        message: 'What is the name of the new role you would like to add?',
        validate: isItText
    },
    {
        type: 'input',
        name: 'salary',
        message: 'What is the starting salary for this role?',
        validate: isItNum
    }
]

const addEmp = [
    {
        type: 'input',
        name: 'firstname',
        message: "Please enter employee's first name",
        validate: isItText
    },
    {
        type: 'input',
        name: 'lastname',
        message: "Please enter employee's last name",
        validate: isItText
    }
]
const makeUpdate = [
    {
    type: 'list',
    name: 'which',
    message: 'which would you like to update?',
    choices: ['Name', 'Role', 'Manager', 'Quit']
    }
]

module.exports = {
    makeUpdate: makeUpdate, 
    question1: question1,
    addDept: addDept,
    addRole: addRole,
    addEmp: addEmp
};