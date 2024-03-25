function isItText(input){
    const onlyLets = /^[A-Za-z]+$/;
    if(onlyLets.test(input)){
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
        choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role', 'Quit']
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

module.exports = {
    question1: question1, 
    addDept: addDept
};