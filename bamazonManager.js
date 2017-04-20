/*
Create a new Node application called bamazonManager.js. Running this application will:
List a set of menu options:
View Products for Sale
View Low Inventory
Add to Inventory
Add New Product
If a manager selects View Products for Sale, the app should list every available item: the item IDs, names, prices, and quantities.
If a manager selects View Low Inventory, then it should list all items with a inventory count lower than five.
If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.
If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.
*/

var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');
var noOfItems=0;
var bamazonItems=[];
var	bamazonDepartments = [];

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

managerChoice();

function managerChoice()
{
//console.log(bamazonItemIds + " in ordernow");
inquirer.prompt([
    {
        type: "list",
        message: "What do you want to do?",
        choices: ['View Products for Sale','View Low Inventory','Add to Inventory','Add New Product','Quit'],
        name: "options"
    },

]).then(function(data) 
{
   var Choice=data.options;
   //console.log(noOfItems,itemChoice);
   manageInventory(Choice);
});
}

function manageInventory(Choice)
{
	switch(Choice)
	{
		case 'View Products for Sale':
			viewProductsForSale();
		    break;
		case 'View Low Inventory':
			viewLowInventory();
		    break;
		case 'Add to Inventory':
			addToInventory();
		    break;
		case 'Add New Product':
			populateBamazonItems();
		    break;
		default:
		     connection.end();
		//program will not reach this option
	}
}


function viewProductsForSale()
{
  connection.query("SELECT * FROM products", function(err, results) {
            if (err) throw err;
          
            var table = new Table
            ({
                head: ['Item Id', 'Product Name','Department Name', 'Price', 'Stock Quantity','Product Sales']
              , colWidths: [10,22,22,12,17,17]
            });

            // table is an Array, so you can `push`, `unshift`, `splice` and friends
            for (var i = 0; i < results.length; i++)
            table.push(
             [results[i].item_id,results[i].product_name,results[i].department_name,results[i].price,results[i].stock_quantity,results[i].product_sales]
            );
            console.log(table.toString());
            console.log('\n-------------------------------------------------------------------------------------------\n');
            console.log('\n-------------------------------------------------------------------------------------------\n');
            managerChoice();
            });

}

function viewLowInventory()
{
connection.query("SELECT * FROM products WHERE stock_quantity < 6 ",  function(err, results) 
   {
        if (err) throw err;
        var table = new Table
            ({
                head: ['Item Id', 'Product Name',  'Stock Quantity']
              , colWidths: [10,30,17]
            });

            // table is an Array, so you can `push`, `unshift`, `splice` and friends
            for (var i = 0; i < results.length; i++)
            table.push(
             [results[i].item_id,results[i].product_name,results[i].stock_quantity]
            );
            console.log(table.toString());
            console.log('\n-------------------------------------------------------------------------------------------\n');
            console.log('\n-------------------------------------------------------------------------------------------\n');
        managerChoice();
    });
}
function addToInventory()
{
	var bamazonItems=[];
	connection.query("SELECT * FROM products", function(err, results) {
            if (err) throw err;
            for (var i = 0; i < results.length; i++) 
            {
                 bamazonItems.push(results[i].product_name);
            }
            update();
    });
function update()
{
	inquirer.prompt([
    {
        type: "list",
        message: "Which product inventory do you want to add to?",
        choices: bamazonItems,
        name: "product_name"
    },
    {
        type: "input",
        message: "How many do you want to add?",
        name: "product_number"
    },

]).then(function(data) 
{
   var name=data.product_name;
   var product_number=data.product_number;
   addProductStockQuantity(name,product_number);
   function addProductStockQuantity(name,product_number)
   {

   	connection.query("UPDATE products SET stock_quantity=stock_quantity+"+product_number+" WHERE product_name='"+name+"';");  

   }
   managerChoice();
});
}	
}
function addNewProduct()
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
        	
            });	
}

	inquirer.prompt([

    {
        type: "input",
        message: "Name of product?",
        name: "product_name",
        validate: function(value) 
        {
        if (bamazonItems.includes(value)) 
        {
          return 'Product already present. Please enter a new product name';
        } 
        else if(value.length==0)
        {
          return 'Product name cannot be blank';
        }
        else
          return true;
        }
    },
    {
        type: "list",
        message: "Select name of department",
        choices: bamazonDepartments,
        name: "department_name"
    },
    {
        type: "input",
        message: "Price?",
        name: "price",
        validate: function(value) 
        {
        if(value.length==0)
        {
          return 'Price cannot be blank';
        }
        else if (isNaN(value)) 
        {
          return 'Please enter a valid price';
        } 
        else 
        {
          return true;
        }
        }
    },
    {
        type: "input",
        message: "Stock Quantity?",
        name: "stock_quantity",
        validate: function(value) 
        {
        if(value.length==0)
        {
          return 'Price cannot be blank';
        }
        else if (isNaN(value)) 
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
   var productName=data.product_name;
   var departmentName=data.department_name;
   var Price=data.price;
   var stockQuantity=data.stock_quantity;
   addProduct(productName,departmentName,Price,stockQuantity);
   function addProduct(productName,departmentName,Price,stockQuantity)
   {

   	connection.query("INSERT into products (product_name,department_name,price,stock_quantity) values ('"+productName+"','"+departmentName
   		+"','"+Price+"','"+stockQuantity+"');");  

   }
   managerChoice();
});
	
}
function populateBamazonItems()
{
    
    connection.query("SELECT * FROM products", function(err, results) {
            if (err) throw err;
            //console.log("inside bamazonyemspopulate");
            bamazonItems=[];
            for (var i = 0; i < results.length; i++) 
            {
                bamazonItems.push(results[i].product_name);
            }
            addNewProduct();
     });

    
}






