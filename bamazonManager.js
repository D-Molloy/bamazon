var mysql = require("mysql");
var inquirer = require("inquirer");

var currItemsArr = [];
var addInvId;
var addInvQuant;
var newInvQuant;
var currInvQuant;
var newInvString;



var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    console.log("+                                                         +");
    console.log("+                       Welcome to                        +");
    console.log("+                    BAMAZON 4 Managers                   +");
    console.log("+                                                         +");
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n");
    mainMenu();
});

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
        }
    });
}



function displayInventory() {
    console.log("\n\n***********************************************************");
    console.log("*                    Current Inventory                    *");
    console.log("***********************************************************");
    connection.query("SELECT * FROM products", function(err, res) {
        currItemsArr.length = 0;
        for (var i = 0; i < res.length; i++) {
            currItemsArr.push(res[i].item_id);
            console.log("Item #: " + res[i].item_id + " | Product:  " + res[i].product_name + " | Price:  $" + res[i].price + " | Quantity: " + res[i].stock_quantity);
        }
        console.log("***********************************************************");
    });
    setTimeout(mainMenu, 1*500); 
};

function displayLowInv(){
    console.log("***********************************************************");
    console.log("*                Low Inventory Products                   *");
    console.log("***********************************************************");
    connection.query("SELECT * FROM products", function(err, res) {
        currItemsArr.length = 0;
        for (var i = 0; i < res.length; i++) {
            if (res[i].stock_quantity <= 5){
                currItemsArr.push(res[i].item_id);
                console.log("Item #: " + res[i].item_id + " | Product:  " + res[i].product_name + " | Price:  $" + res[i].price + " | Quantity: " + res[i].stock_quantity);
            } 
        }
        console.log("***********************************************************");
        if (currItemsArr.length == 0){
            console.log ("No items are low on inventory.")
            console.log("***********************************************************");
            console.log("*           There are no low inventory items!             *")
            console.log("***********************************************************");
        }
    });

    setTimeout(mainMenu, 1*500);
}

function addInventory() {
    console.log("\n***********************************************************");
    console.log("*                    Add Inventory                    *");
    console.log("***********************************************************");
    connection.query("SELECT * FROM products", function(err, res) {
        currItemsArr.length = 0;
        for (var i = 0; i < res.length; i++) {
            currItemsArr.push(res[i].item_id);
            console.log("Item #: " + res[i].item_id + " | Product:  " + res[i].product_name + " | Price:  $" + res[i].price + " | Quantity: " + res[i].stock_quantity);
        }
        console.log("***********************************************************");

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
            addInvId = answer.addId;
            var parseInvId = parseInt(addInvId);
            
            if (currItemsArr.indexOf(parseInvId) > -1){ 
                // addInvQuant = parseInt(answer.addQuant);
                addInvQuant = answer.addQuant;
                console.log("*****   Updating Inventory   *****");
                increaseInventory();
            } else {
                console.log("***********************************************************");
                console.log("*                Please enter a valid Item #!             *")
                console.log("***********************************************************");
                addInventory();
            }
        });
    });
    
};

function increaseInventory(){
    var query = "SELECT stock_quantity FROM products WHERE ?";
    
    connection.query(query, { item_id: addInvId }, function(err, res) {
        if (err) throw err;

        currInvQuant = res[0].stock_quantity;
        newInvQuant = parseInt(currInvQuant) + parseInt(addInvQuant);
        newInvString = newInvQuant.toString();

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
                console.log("***********************************************************");
                console.log("*                    Inventory Updated!                   *")
                console.log("***********************************************************");
                mainMenu();
            }
        );
    });
}
