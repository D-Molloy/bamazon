// required npm packages
var mysql = require("mysql");
var inquirer = require("inquirer");

//global variables
var currItemsArr = [];
var addInvId;
var addInvQuant;
var newInvQuant;
var currInvQuant;
var newInvString;

//define the information used to connect to the SQL database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
  
    // username
    user: "root",
  
    // password & database to connect to
    password: "",
    database: "bamazon"
});

//connect to the MySQL server and SQL database
connection.connect(function(err) {
    if (err) throw err;
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    console.log("+                                                         +");
    console.log("+                       Welcome to                        +");
    console.log("+                    BAMAZON 4 Managers                   +");
    console.log("+                                                         +");
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n");
    //run the mainMenu function that displays all menu options
    mainMenu();
});

//mainMenu displays all of the menu options and calls the corresponding function in the switch statment when a selection is made
function mainMenu(){
    inquirer.prompt([
        {
            name: "mainOptions",
            type: "list",
            message:"What would you like to do?",
            choices: ["View Products", "View Low Inventory Products", "Add Product Inventory", "Add New Product", "Exit"]
        }
    ]).then(function(answer){
        switch (answer.mainOptions) {
            case "View Products":
                displayInventory();
                break;
            case "View Low Inventory Products":
                displayLowInv();
                break;
            case "Add Product Inventory":
                addInventory();
                break;
            case "Add New Product":
                addProduct();
                break;
            case "Exit":
                console.log("***********************************************************");
                console.log("*                Have a productive day :-)                *");
                console.log("***********************************************************");
                connection.end();
        };
    });
};

// displayInventory
function displayInventory() {
    console.log("\n\n***********************************************************");
    console.log("*                    Current Inventory                    *");
    console.log("***********************************************************");
    // query the database for all data - iterate through the data to console.log a table of all available items
    connection.query("SELECT * FROM products", function(err, res) {
        for (var i = 0; i < res.length; i++) { 
            console.log("Item #: " + res[i].item_id + " | Product:  " + res[i].product_name + " | Price:  $" + res[i].price + " | Quantity: " + res[i].stock_quantity);
        };
        console.log("***********************************************************");
    });
    //allow the table to display momentarily before calling the main menu function
    setTimeout(mainMenu, 1 * 1000); 
};


//  function displayLowInv allow the user to view all items with less than 5 units in inventory
function displayLowInv(){
    console.log("***********************************************************");
    console.log("*                Low Inventory Products                   *");
    console.log("***********************************************************");
    // query the database for all data in the products table
    connection.query("SELECT * FROM products", function(err, res) {
        currItemsArr.length = 0;
        //iterate through the data to console.log a table showing only items that have less than 5 units in stock quantity
        for (var i = 0; i < res.length; i++) {
            if (res[i].stock_quantity <= 5){
                //push all item_ids to the array to use later to validate the selected item below
                currItemsArr.push(res[i].item_id);
                console.log("Item #: " + res[i].item_id + " | Product:  " + res[i].product_name + " | Price:  $" + res[i].price + " | Quantity: " + res[i].stock_quantity);
            } 
        }
        console.log("***********************************************************");
        //if no item_ids were push into the array, then inform the user that there are no low inventory items
        if (currItemsArr.length == 0){
            console.log("***********************************************************");
            console.log("*           There are no low inventory items!             *")
            console.log("***********************************************************");
        }
    });
    //allow the table to display momentarily before calling the main menu function
    setTimeout(mainMenu, 1 * 1000);
}


//function addInventory allows the user to add more inventory to a selected item
function addInventory() {
    console.log("\n***********************************************************");
    console.log("*                      Add Inventory                      *");
    console.log("***********************************************************");
    //query the db for all information in the products table
    connection.query("SELECT * FROM products", function(err, res) {
        currItemsArr.length = 0;
        //iterate through the db data and console.log every item to the console
        for (var i = 0; i < res.length; i++) {
            //push all item_ids to the array to use later to validate the selected item later
            currItemsArr.push(res[i].item_id);
            console.log("Item #: " + res[i].item_id + " | Product:  " + res[i].product_name + " | Price:  $" + res[i].price + " | Quantity: " + res[i].stock_quantity);
        }
        console.log("***********************************************************");
        //prompt the user for the item number of they item and how much inventory will be added
        inquirer.prompt([
            {
                name: "addId",
                type: "input",
                message:"Please enter the item number of which you'd like to increase inventory:",
                validate: function(value){
                    if(isNaN(value)==false){   
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            {
                name: "addQuant",
                type: "input",
                message:"How many units would you like to add to inventory?",
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
            addInvId = answer.addId;
            var parseInvId = parseInt(addInvId);
            //check to see if the item_id selected is in the array of item #s to ensure a valid item_id
            if (currItemsArr.indexOf(parseInvId) > -1){ 
                //save the quantity to be updated in a global variable
                addInvQuant = answer.addQuant;
                console.log("*****   Updating Inventory   *****");
                //call the function that inreases the inventory (update the SQL DB)
                setTimeout(increaseInventory, 1 * 1000);
            } else {
                //if the ID # entered doesn't exist in the DB, alert the user and rerun the addInventory function
                console.log("***********************************************************");
                console.log("*                Please enter a valid Item #!             *")
                console.log("***********************************************************");
                setTimeout(addInventory, 1 * 1000);
            }
        });
    });
    
};


//increaseInventory is the function that increase the new inventory amount from addInventory and updates the SQL DB
function increaseInventory(){
    var query = "SELECT stock_quantity FROM products WHERE ?";
    //quaery the DB to get the item_ids and their associate stock quantity
    connection.query(query, { item_id: addInvId }, function(err, res) {
        if (err) throw err;
        //store the requested item's stock quantity to a variable
        currInvQuant = res[0].stock_quantity;
        //convert the current inventory and inventory to be added from strings to intergers amd add them together
        newInvQuant = parseInt(currInvQuant) + parseInt(addInvQuant);
        // convert the newly calculated total inventory into a string so it can be inserted into the DB
        newInvString = newInvQuant.toString();
        //query the SQL DB and update the inventory for the specified item_id
        connection.query(
            "UPDATE products SET ? WHERE ?",
            [
                {
                    stock_quantity: newInvString
                },
                {
                    item_id: addInvId
                }
            ],
            function(err) {
                if (err) throw err;
                //if successfull, inform the user the DB was updated and then call mainMenu to return to display the menu option
                console.log("***********************************************************");
                console.log("*                    Inventory Updated!                   *")
                console.log("***********************************************************");
                setTimeout(mainMenu, 1 * 1000);
            }
        );
    });
}

//function addProduct allows the user to create a new product
function addProduct(){
    console.log("\n***********************************************************");
    console.log("*                       Add Product                       *");
    console.log("***********************************************************");
    //use inquirer to prompt the user for all necessary data values
    inquirer.prompt([
        {
            name: "inputNewName",
            type: "input",
            message:"Please enter the new product's NAME:",
        },
        {
            name: "inputNewDept",
            type: "input",
            message:"Please enter the new product's DEPARTMENT:",
        },
        {
            name: "inputNewPrice",
            type: "input",
            message:"Please enter the new product's PRICE (no $ needed):",
            validate: function(value){
                if(isNaN(value)==false){
                    return true;
                } else {
                    return false;
                }
            } 
        },
        {
            name: "inputNewQuant",
            type: "input",
            message:"Please enter the new product's INVENTORY QUANITIY:",
            validate: function(value){
                if(isNaN(value)==false){
                    return true;
                } else {
                    return false;
                }
            } 
        },
    ]).then(function(answer){
        //ensure that the price entered only has two decimal places
        var price = answer.inputNewPrice
        var intPrice = parseFloat(price);
        var fixedPrice = intPrice.toFixed(2);
        //query the DB and insert the inputted values into the db
        connection.query(
            "INSERT INTO products SET ?",
            {
                product_name: answer.inputNewName,
                department_name: answer.inputNewDept,
                price: fixedPrice,
                stock_quantity: answer.inputNewQuant
            },
            function(err) {
                if (err) throw err;
                //if successful, inform the user and display the main menu
                console.log("***********************************************************");
                console.log("*                        Item Created!                    *")
                console.log("***********************************************************");
                setTimeout(mainMenu, 1*1000);
            }
        )
    });
}