var mysql = require("mysql");
var inquirer = require("inquirer");
// chalk?

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "Dipshit12!!",
    database: "bamazon"
  });
  
  connection.connect(function(err) {
    if (err) throw err;
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    console.log("+                                                         +");
    console.log("+                       Welcome to                        +");
    console.log("+                        BAMAZON                          +");
    console.log("+                                                         +");
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    displayInventory();
  });


//display product for sale
function displayInventory() {
    connection.query("SELECT * FROM products", function(err, res) {
        console.log("***********************************************************");
        console.log("*                    Current Inventory                    *");
        console.log("***********************************************************");
        for (var i = 0; i < res.length; i++) {
            console.log("Item #:  " + res[i].item_id + " | Product:  " + res[i].product_name + " | Price:  $" + res[i].price);
            }
        console.log("***********************************************************");
    });
};

//prompt user for 1) item_id of item they want to buy & 2) quantity they want to purchase
//place order
//check inventory to make sure sure order can be fulfilled.  
//No inventory - if not console.log "Insuffficient Quantity!"
//If Inventory 
//  1 - update stock_quantity
//  2 - show customer the total