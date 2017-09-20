// required npm packages
var mysql = require("mysql");
var inquirer = require("inquirer");

//global variables
var purchId;
var purchQuant;
var currItemsArr = [];
var purchProdName;
var purchProdPrice;
var remainingInv;
var orderTotal;

//function resetVars resets the values of global variables when consecutive orders are made
function resetVars (){
    purchId = "";
    purchQuant = "";
    purchProdName= "";
    purchProdPrice="";
    remainingInv="";
    orderTotal="";
}

//define the information used to connect to the SQL database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "",
    database: "bamazon"
});
  
//connect to the MySQL server and SQL database
connection.connect(function(err) {
    if (err) throw err;
    //if connection is successful, console.log the banner to the console
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    console.log("+                                                         +");
    console.log("+                       Welcome to                        +");
    console.log("+                        BAMAZON                          +");
    console.log("+                                                         +");
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n");
    //call the function that console.logs the inventory to the console
    setTimeout(displayInventory, 1 * 1000); 
});


//display product for sale
function displayInventory() {
    console.log("***********************************************************");
    console.log("*                    Current Inventory                    *");
    console.log("***********************************************************");
    //query the db for all data in the products table
    connection.query("SELECT * FROM products", function(err, res) {
        currItemsArr.length = 0;
        //iterate through the table data and console.log the desired data to the console
        for (var i = 0; i < res.length; i++) {
            //push all item_ids to the array to use later to validate the selected item below
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
            //save the id of the item to be updated into a variable and then convert that string to an interger
            purchId = answer.requestId;
            var parseId = parseInt(purchId);
            //check to see if the item_id selected is in the array of item #s to ensure a valid item_id
            if (currItemsArr.indexOf(parseId) > -1){ 
                //save the quantity to be updated in a global variable
                purchQuant = parseInt(answer.requestQuant);
                console.log("*****    Your order is being processed.   *****");
                //call the function that checks to make sure the requiested inventory is available
                setTimeout(checkInventory, 1 * 1000);
            } else {
                //if an invalid item_id is inputted, innform the user they need to input a valid item_id and call displayInventory again
                console.log("***********************************************************");
                console.log("*                Please enter a valid Item #.             *");
                console.log("***********************************************************");
                setTimeout(displayInventory, 1 * 1000); 
            }
        });
    });   
};

//function checkInventory ensure that the requested 
function checkInventory(){    
    //assigning the db query command to a variable to be used in the DB call
    var query = "SELECT  product_name, price, stock_quantity FROM products WHERE ?";
    //query the SQL DB using the query string and the purchId defined in displayInventory
    connection.query(query, { item_id: purchId }, function(err, res) {
        //assign the selected products name and price to variables to be used in displayOrder
        purchProdName = res[0].product_name;
        purchProdPrice = res[0].price;
        //check to make sure there are more than 0 units left in inventory
        if (res[0].stock_quantity > 0){
            //if there is some inventory, check to see if the requested quanitty is more than what is in inventory
            if (purchQuant > res[0].stock_quantity){
                //if requested quantity exceeds invoentory, alert the user
                console.log("***********************************************************");
                console.log("ALERT! We only have " + res[0].stock_quantity + " " + purchProdName + "(s) remaining.");
                console.log("***********************************************************");
                //then prompt the user to enter a new order quantity and display the current stock_quantity in that request
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
                    //assign the input to the new order quantity
                    purchQuant = answer.newQuant;
                    console.log("*****        Order quantity updated.      *****")
                    //rerun checkInventory using the new purchQuant
                    checkInventory();
                });
            } else {
                //if the requested amount is in inventory compute the remaing inventory(used to update the SQL DB) and the order total (used in displayOrder)
                remainingInv = res[0].stock_quantity - purchQuant;
                orderTotal = purchQuant * res[0].price;
                //call the function that updates the SQL DB with remainingInv
                updateInv();
            }
        } else {
            //if there is no inventory for the selected item, alert the user and return them to the main menu
            console.log("***********************************************************");
            console.log("ALERT! We don't have any " + purchProdName + "(s) remaining.\nPlease select a new item.");
            console.log("***********************************************************");
            setTimeout(displayInventory, 1 * 1000); 
        }
    });
}


//function updateInv queries the SQL DB and updates the remaining stock inventory
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
          //if the update is successful, show the user the ourchase is being processed
          console.log("*****          Processing order...        *****");
          //call the function that displays the current order
          setTimeout(displayOrder, 1 * 2000); 
        }
    );
}

//function displayOrder displays the current order total and prompts the user if they would like to do another transaction or exit the app
function displayOrder(){
    console.log("***********************************************************");
    console.log("*                      Order Complete!                    *");
    console.log("***********************************************************");
    console.log("Your order:");
    console.log("___________________________________________________________");
    console.log(purchQuant + " x " + purchProdName + " ($" + purchProdPrice +"/each)");
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
                //if the user wants to do another transation
                if (answer.newOrder == "Yes") {
                    //reset all the global variables
                    resetVars();
                    //return to the main menu
                    displayInventory();
                } else {
                    //if they don't want to do another transaction, display the mention and end the connection to the DB, ending the app
                    console.log("***********************************************************");
                    console.log("*                      Come back soon!                    *");
                    console.log("***********************************************************");
                    connection.end();
                }
              
            });
}
