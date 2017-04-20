var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');
var bamazonDepartments = [];


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    // Your username
    user: "me",
    // Your password,m 
    password: "abcd",
    database: "bamazon"
});
connection.connect(function(err) {
    if (err) throw err;
    //console.log("connected as id " + connection.threadId);
});

supervisorChoice();
function supervisorChoice()
{
//console.log(bamazonItems + " in ordernow");
inquirer.prompt([
    {
        type: "list",
        message: "What do you want to do?",
        choices: ['View Product Sales by Department','Create New Department','Quit'],
        name: "options"
    },

]).then(function(data) 
{
   var Choice=data.options;
   manageSupervisorChoice(Choice);
});
}
function manageSupervisorChoice(Choice)
{
    switch(Choice)
    {
        case 'View Product Sales by Department':
            viewProductsForSale();
            break;
        case 'Create New Department':
            CreateNewDepartment();
            break;
        default:
             connection.end();
        //program will not reach this option
    }
}
function viewProductsForSale()
{
            connection.query("SELECT *, total_sales-over_head_costs as total_profit FROM departments", function(err, results) {
            if (err) throw err;
            var table = new Table
            ({
                head: ['Dept Id', 'Department Name', 'Over Head Cost', 'Total Sales','Total Profit']
              , colWidths: [10,25,17,17,17]
            });

            // table is an Array, so you can `push`, `unshift`, `splice` and friends
            for (var i = 0; i < results.length; i++)
            table.push(
             [results[i].department_id,results[i].department_name,results[i].over_head_costs,results[i].total_sales,results[i].total_profit]
            );

            console.log(table.toString());
            console.log('\n-------------------------------------------------------------------------------------------\n');
            console.log('\n-------------------------------------------------------------------------------------------\n');
            supervisorChoice();
            
            });
            // instantiate
           
}
function CreateNewDepartment()
{
populateBamazonDepartments();
function populateBamazonDepartments()
{
	bamazonDepartments = [];
	connection.query("SELECT * FROM departments", function(err, results) 
			{
            if (err) throw err;
            for(var i =0;i<results.length;i++)
            bamazonDepartments.push(results[i].department_name);
        	createDepartment();
            });	
}
function createDepartment()
{
inquirer.prompt([
    {
        type: "input",
        message: "What department would you like to add?",
        name: "name",
        validate: function(value) 
        {
        if (bamazonDepartments.includes(value)) 
        {
          return 'Department already present. Please enter a new department name';
        } 
        else if(value.length==0)
        {
          return 'Department name cannot be blank';
        }
        else
          return true;
        }
    },
    {
        type: "input",
        message: "What is the overhead cost?",
        name: "cost",
        validate: function(value) 
        {
        if (isNaN(value)) 
        {
          return 'Please enter a valid number';
        } 
        else 
        {
          return true;
        }
        }
    },
]).then(function(data) 
{
   var departmentToAdd=data.name;
   var overhead=data.cost;
   connection.query("INSERT into departments (department_name,over_head_costs) values ('"+departmentToAdd+"',"+overhead+");");  
   supervisorChoice();
});
}
}
