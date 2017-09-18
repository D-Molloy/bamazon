var mysql = require("mysql");
var inquirer = require("inquirer");
// chalk?

var purchId;
var purchQuant;
var currItemsArr = [];
var purchProdName;
var purchProdPrice;
var remainingInv;
var orderTotal;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "",
    database: "bamazon"
  });
  
  function resetVars (){
    purchId = "";
    purchQuant = "";
    purchProdName= "";
    purchProdPrice="";
    remainingInv="";
    orderTotal="";
  }

  connection.connect(function(err) {
    if (err) throw err;
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    console.log("+                                                         +");
    console.log("+                       Welcome to                        +");
    console.log("+                        BAMAZON                          +");
    console.log("+                                                         +");
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n");
    displayInventory();
  });


//display product for sale
function displayInventory() {
        console.log("***********************************************************");
        console.log("*                    Current Inventory                    *");
        console.log("***********************************************************");
    connection.query("SELECT * FROM products", function(err, res) {
        currItemsArr.length = 0;
        for (var i = 0; i < res.length; i++) {
            currItemsArr.push(res[i].item_id);
            console.log("Item #: " + res[i].item_id + " | Product:  " + res[i].product_name + " | Price:  $" + res[i].price);
        }
        console.log("***********************************************************");
        inquirer.prompt([
            {
                name: "requestId",
                type: "input",
                message:"Please enter the item number you would like to purchase:",
                validate: function(value){
                    // if(value <= res.length){
                    if(isNaN(value)==false){   
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            {
                name: "requestQuant",
                type: "input",
                message:"How many would you like to purchase?",
                validate: function(value){
                    if(isNaN(value)==false){
                        return true;
                    } else {
                        return false;
                    }
                } 
            }
        ]).then(function(answer){
            purchId = answer.requestId;
            var parseId = parseInt(purchId);
            
            if (currItemsArr.indexOf(parseId) > -1){ 
                purchId = answer.requestId;
                purchQuant = parseInt(answer.requestQuant);
                console.log("*****   Your order is being processed.   *****");
                checkInventory();
            } else {
                console.log("***********************************************************");
                console.log("Please enter a valid Item #.")
                console.log("***********************************************************");
                displayInventory();
            }
        });
    });   
};

function checkInventory(){    
    var query = "SELECT  product_name, price, stock_quantity FROM products WHERE ?";
    connection.query(query, { item_id: purchId }, function(err, res) {
        purchProdName = res[0].product_name;
        purchProdPrice = res[0].price;
        if (res[0].stock_quantity > 0){
            if (purchQuant > res[0].stock_quantity){
                console.log("ALERT! We only have " + res[0].stock_quantity + " " + purchProdName + "(s) remaining.");
                inquirer.prompt([
                    {
                        name: "newQuant",
                        type: "input",
                        message:"Please enter a new amount ("+ res[0].stock_quantity+" or fewer):",
                        validate: function(value){
                            if(isNaN(value)==false){   
                                return true;
                            } else {
                                return false;
                            }
                        }
                    }
                ]).then(function(answer){
                    purchQuant = answer.newQuant;
                    console.log("Order quantity updated.")
                    checkInventory();
                    //might need to toString the answer in order for it to work
                });

            } else {
                remainingInv = res[0].stock_quantity - purchQuant;
                orderTotal = purchQuant * res[0].price;
                updateInv();
            }
        } else {
            console.log("***********************************************************");
            console.log("ALERT! We don't have any " + purchProdName + "(s) remaining.\nPlease select a new item.");
            console.log("***********************************************************");
            displayInventory();
        }
    });
}

function updateInv(){
    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: remainingInv
            },
            {
                item_id: purchId
            }
        ],
        function(err) {
          if (err) throw err;
          console.log("Processing order...");
          displayOrder();
        }
    );
}

function displayOrder(){
    console.log("***********************************************************");
    console.log("*                      Order Complete!                    *");
    console.log("***********************************************************");
    console.log("Your order of:");
    console.log("___________________________________________________________");
    console.log(purchQuant + " x " + purchProdName) + " ($" + purchProdPrice +"/each)";
    console.log("===========================================================");
    console.log("Order Total: $" + orderTotal.toFixed(2) + "\n");
    console.log("Delivery: Sooner than you think!");
    console.log("***********************************************************");
    console.log("*                Thanks for your business!                *");
    console.log("***********************************************************");

    inquirer.prompt([
                {
                    name: "newOrder",
                    type: "list",
                    message:"Place another order?",
                    choices: ["Yes", "No"]
                }
            ]).then(function(answer){
                if (answer.newOrder == "Yes") {
                    resetVars();
                    displayInventory();
                } else {
                    console.log("***********************************************************");
                    console.log("*                      Come back soon!                    *");
                    console.log("***********************************************************");
                    connection.end();
                }
              
            });
}
