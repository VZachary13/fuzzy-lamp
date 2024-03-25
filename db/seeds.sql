USE employees_db;

INSERT INTO departments (id, dptname) VALUES
(1, 'HR'),
(2, 'Finance'),
(3, 'IT');

INSERT INTO roles (id, title, salary, department_id) VALUES
(1, 'HR Manager', 70000, 1),
(2, 'HR Assistant', 40000, 1),
(3, 'Accountant', 60000, 2),
(4, 'Financial Analyst', 65000, 2),
(5, 'Software Engineer', 80000, 3),
(6, 'Database Administrator', 75000, 3);

INSERT INTO employees (id, first_name, last_name, role_id, manager_id) VALUES
(1, 'John', 'Doe', 1, NULL),
(2, 'Jane', 'Smith', 2, 1),
(3, 'Michael', 'Johnson', 3, NULL),
(4, 'Emily', 'Brown', 4, 3),
(5, 'David', 'Williams', 5, NULL),
(6, 'Sarah', 'Jones', 6, 5);