var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');
var bamazonItems = [];
var itemChoice=0;
var noOfItems=0;

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
customerChoice();
function customerChoice()
{
//console.log(bamazonItems + " in ordernow");
inquirer.prompt([
    {
        type: "list",
        message: "What do you want to do?",
        choices: ['View Products for Sale','Buy a product','Quit'],
        name: "options"
    },

]).then(function(data) 
{
   var Choice=data.options;
   manageCustomerChoice(Choice);
});
}

function manageCustomerChoice(Choice)
{
    switch(Choice)
    {
        case 'View Products for Sale':
            viewProductsForSale();
            break;
        case 'Buy a product':
            {
                populateBamazonItems();
                
            }
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
                head: ['Item Id', 'Product Name', 'Department Name', 'Price', 'Stock Quantity']
              , colWidths: [10,30,30,12,17]
            });

            // table is an Array, so you can `push`, `unshift`, `splice` and friends
            for (var i = 0; i < results.length; i++)
            table.push(
             [results[i].item_id,results[i].product_name,results[i].department_name,results[i].price,results[i].stock_quantity]
            );

            console.log(table.toString());
            console.log('\n-------------------------------------------------------------------------------------------\n');
            console.log('\n-------------------------------------------------------------------------------------------\n');
            customerChoice();
            
            });
            // instantiate

           
}

function orderNow()
{

//console.log(bamazonItems + " in ordernow");
inquirer.prompt([
    {
        type: "list",
        message: "What product would you like to buy?",
        choices: bamazonItems,
        name: "options"
    },
    {
        type: "input",
        name: "units",
        message: "How many units do you want to buy?",
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
    }
]).then(function(data) 
{
   itemChoice=data.options;
   noOfItems=data.units;
   //console.log(noOfItems,itemChoice);
   displayData();
});
}
function displayData()
{
  connection.query("SELECT * FROM products WHERE product_name = ? ", itemChoice, function(err, res) 
   {
        if (err) throw err;
        if (noOfItems > res[0].stock_quantity) 
        {   
            console.log('\n-------------------------------------------------------------------------------------------\n');
            console.log("Insufficient quantity! Only "+res[0].stock_quantity+" "+res[0].product_name+" available")
            console.log('\n-------------------------------------------------------------------------------------------\n');
            customerChoice();
        }
        else 
        {   
            var newStock_quantity=(res[0].stock_quantity)-noOfItems;
           
            connection.query("UPDATE products SET  ? WHERE ?", 
            [
                {
                stock_quantity: newStock_quantity
                },
                
                {
                product_name: itemChoice
                }
            ], function(err, result) {});
            
            var orderTotal= (res[0].price)*noOfItems;
            connection.query("UPDATE products SET product_sales=product_sales+"+orderTotal+" WHERE product_name='"+itemChoice+"';");
            connection.query("UPDATE departments SET total_sales=total_sales+"+orderTotal+" WHERE department_name='"+res[0].department_name+"';");

            /*connection.query("select distinct department_name from products",function(err, results) 
            {
                if (err) throw err;
                for(var i=0;i<results.length;i++)
                {
                    console.log("nooooooo"+results[i].department_name);
                    var depName = results[i].department_name;
                    connection.query("select sum(product_sales) AS saleSum from products where department_name = '"
                    +results[i].department_name+"'",function(err, res) 
                        {
                            if (err) throw err;
                            saleSum=res[0].saleSum
                        });
                }
            });*/
            console.log('\n-------------------------------------------------------------------------------------------\n');
            console.log('Your ordered '+noOfItems+' number of '+itemChoice+" at price $ "+res[0].price+" per unit");
            console.log('So your order total is $'+orderTotal);
            console.log('\n-------------------------------------------------------------------------------------------\n');
            customerChoice();
        }
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
            orderNow();
     });

    
}





