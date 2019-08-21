require("dotenv");
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table2');
var itemCount;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    users: "root",
    password: "Navygirl07!"
    database: "bamazon"
});

connection.connect(function(err) {
    if(err) { throw err };
    console.log("Connected as user " + connection.threadId + "\n")
    chooseAnOption();
});

function chooseAnOption() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'What would you like to do today?',
            choices: ['View products', 'View low inventory', 'Replenish inventory', 'Add new inventory', 'Exit'],
            filter: function(val) {
                return val.toLowerCase();
            }
        }
    ]).then(function(answers) {
        var choice = answers.choice;

        switch (choice) {
            case "view products":
                listAllItems();
                break;
            case "view low inventory":
                listLowItems();
                break;
            case "replenish inventory":
                getItemToReplenish();
                break;
            case "add new inventory":
                addNewInventory();
                break;
            case "exit":
                console.log("\nGoodbye.\n")
                connection.end();
                break;
            default:
                console.log("There was an error, please try again.")
                chooseAnOption();
                break;
        }
    }):
}

function listAllItems() {
    console.log("Initializing Bamazon");
    var query = connection.query(
        "SELECT * FROM products", function(err, res) {
            if (err) throw err;
            // console.log(res);
            itemCount = res.length;
            console.log("\nGrabbing inventory, please wait...");
            var table = new Table({
                head: ["ID", "Products", "Departments", "Price", "Qty"],
                colWidths: [5, 50, 20, 10, 5]
            });

            for (var i = 0; i < res.length; i++) {
                table.push([{hAlign: 'right', content: res[i].item_id}, res[i].product_name, res[i].dept_name, {hAlign: 'right', content: res[i].price}, {hAlign: 'right', content: res[i].stock_quantity}]);
            };
            console.log(table.toString());
            // connection.end();
            chooseAnOption();
        }
    )
}

function listLowItems() {
    console.log("Displaying low quantities...");
    var query = connection.query(
        "SELECT * FROM products WHERE stock_quantity<20", function(err, res) {
            if (err) throw err;
            // console.log(res);
            // itemCount = res.length;
            console.log("\nGrabbing inventory, please wait...");
            var table = new Table({
                head: ["ID", "Products", "Departments", "Price", "Qty"],
                colWidths: [5, 50, 20, 10, 5]
            });

            for (var i = 0; i < res.length; i++) {
                table.push([{hAlign: 'right', content: res[i].item_id}, res[i].product_name, res[i]dept_name, {hAlign: 'right', content: res[i].price}, {hAlign: 'right', content: res[i].stock_quantity}]);
            };
            console.log(table.toString());
            // connection.end();
            chooseAnOption();
        }
    )
}

function getItemToReplenish() {
    console.log("itemCount: ", itemCount);
    inquirer.prompt([
        {
            type: 'input',
            name: 'askItem',
            message: 'Please enter the ID of the product you would like to replenish.',
            validate: function(value) {
                if (!isNaN(parseFloat(value)) && value <= itemCount) {
                    return true;
                } else {
                    return 'Please enter a number';
                }
            },
            filter: Number
        },
        {
            type: 'input',
            name: 'askQty',
            message: 'Please enter the amount you would like to add.',
        }
    ]).then(function(answers) {
        console.log("Item#: " + answers.askItem, "Qty: " + answers.askQty);
        var itemID = answers.askItem;
        var qty = answers.askQty;
        replenishInventory(itemID, qty);
    });
}

function replenishInventory(itemID, qty) {
    var query = connection.query(
        "UPDATE products SET stock_quantity=stock_quantity+" + qty + "WHERE item_id=\"" + itemID + "\"", function(err, res) {
            if (err) throw err;
        }
    );
    var query2 = connection.query(
        "SELECT * FROM products", function(err, res) {
            // console.log(res);
            itemCount = res.length;
            console.log("\nGrabbing inventory, please wait...");
            var table = new Table({
                head: ["ID", "Products", "Departments", "Price", "Qty"],
                colWidths: [5, 50, 20, 10, 5]
            });

            for (var i = 0; i < res.length; i++) {
                table.push([{hAlign: 'right', content: res[i].item_id}, res[i].product_name, res[i].dept_name, {hAlign: 'right', content: res[i].price}, {hAlign: 'right', content: res[i].stock_quantity}]);
            };
            console.log(table.toString());
            // connection.end();
            console.log(`\>\> Added ${qty} to ${res[itemID - 1].product_name}\n`);
            chooseAnOption();
        }
    )
}

function addNewInventory() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'getProductName',
            message: 'Please enter the name of the product you would like to add.',
        },
        {
            type: 'input',
            name: 'getDept',
            message: 'Which department will the product be in?',
        },
        {
            type: 'input',
            name: 'getPrice',
            message: 'How much will it cost?',
            validate: function(value) {
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a number';
            },
            filter: Number
        },
        {
            type: 'input',
            name: 'getQty',
            message: 'How many will you be adding?',
            validate: function(value) {
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a number';
            },
            filter: Number
        }
    ]).then(function(answers) {
        // console.log("Product Name: " + answers.getProductName, "Dept: " + answers.getDept, "Price: " + answers.getPrice, "Qty: " + answers.getQty);
        // var itemID = answers.askItem;
        // var qty = answers.askQty;
        // replenishInventory(itemID, qty);
        var sql = "INSERT INTO products (product_name, dept_name, price, stock_quantity) VALUES ('" + answers.getProductName + "'," + answers.getDept + "', " + answers.getPrice + ", " + answers.getQty + ")";
        var query = connection.query(sql, function(err, res) {
            if (err) throw err;
            console.log(`\n \>\> Successfully added ${answers.getQty} ${answers.getProductName} to inventory.\n`)
            chooseAnOption();
        });
    });
}