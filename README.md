# Week 12 homework: bamazon

The bamazon homework utilizes javaScript, node.js, npm packages (mysql & inquirer), and a MySQL database to create a CLI storefront for both customers and managers:

* A video walkthrough of both bamazonCustomer.js and bamazonManager.js can be viewed [HERE](https://www.youtube.com/watch?v=8vHI236OxNo)

Walkthrough:
1. bamazonCustomer.js
  - upon load, the user is welcomed to the store and shown the current items in inventory (the item#, product name and price)
  - they are prompted to enter the item_id of the product they want to purchase
  - they are then prompted to enter the quantity they want to purchase
  - bamazonCustomer.js then validates the item_id entered to make sure the item_id exists in the DB
  - bamazonCustomer.js then queries the database to check a) if there is any inventory of the requested item (if there isn't they are alerted and returned to the main menu to select a different item) and b) if there is enough inventory to fulfill the order (if there is not they are prompted to enter a new quantity)
  -  once the order quanity is confirmed, the DB is queried and new inventory amount is updated
  -  the completed order is then displayed in the terminal 

 2. bamazonManager.js
   -  upon load, the user is welcomed and presented with a list of options:
     -  **View Product** (allows the manager to view the current inventory (item #s, product name, price, and stock quantity))
     -  **View Low Inventory Products** (allows managers to only see products with less than 5 units in inventory.  The DB is queried and bamazonManager iterates through the data only console.log'ing items with less then 5 units)
     -  **Add Product Inventory** (allows the manager to add inventory to any existing product.  The current items in invetory are displayed and the manager is prompted to enter the item# and the amount they would like to add to inventory.  The item# is then validated to make sure it exists in the DB.  The DB is then queried and the new stock_quantity is updated)
     -  **Add a New Product** (allows the manager to add a new product to the DB. The user is prompted for the new items NAME, DEPARTMENT, PRICE, and QUANTITY.  The DB is queried and the inputted values are inserted into the DB)
