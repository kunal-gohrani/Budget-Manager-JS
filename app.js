//Budget controller
var budgetController = (function() {
    //some code
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(total_inc) {
        if (total_inc > 0) {
            this.percentage = Math.round((this.value / total_inc) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentageExpense: 0
    };

    var updateTotals = function() {
        //calculates total income and expense and updates in data.
        var sum = 0;
        data.allItems.exp.forEach(function(current, index, array) {
            sum = sum + current.value; //current is the object. we need value property of object.
        });
        data.totals.exp = sum;
        sum = 0;

        data.allItems.inc.forEach(function(current, index, array) {
            sum = sum + current.value;
        });
        data.totals.inc = sum;
    };

    var updateExpensePercentage = function() {
        if (data.totals["inc"] > 0) {
            data["percentageExpense"] = parseFloat(
                ((data.totals["exp"] / data.totals["inc"]) * 100).toFixed(1)
            );
        } else if (data.totals["inc"] == 0) {
            data["percentageExpense"] = 0;
        } else {
            data["percentageExpense"] = -100;
        }
    };

    return {
        addTransaction: function(type, des, val) {
            var newItem, ID;

            //create new ID
            if (data.allItems[type].length == 0) {
                ID = 0;
            } else if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }

            //create new item on 'inc' or 'exp'
            if (type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type == "inc") {
                newItem = new Income(ID, des, val);
            }

            //Pushing the newItem to concerned array
            data.allItems[type].push(newItem);

            //Return the new element
            return newItem;
        },

        updateBudget: function() {
            //1. Update the total income and expense
            updateTotals();

            //2. Calculate budget (incomes-expenses)
            data["budget"] = data.totals["inc"] - data.totals["exp"];

            //3. Calculate the percentage of the income we spent. (expense percentage)
            updateExpensePercentage();
        },

        testing: function() {
            console.log(data);
        },

        getBudget: function() {
            return {
                budgetValue: data.budget,
                income: data.totals["inc"],
                expense: data.totals["exp"],
                percentage: data.percentageExpense
            };
        },

        calculateExpenseTransactionPercentage: function() {
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },

        getExpenseTransactionPercentage: function() {
            var percentages = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return percentages;
        },

        deleteTransaction: function(type, id) {
            var index;
            data.allItems[type].forEach(function(current, i, array) {
                console.log(current.id);
                if (current.id == id) {
                    index = i;
                }
            });
            data.allItems[type].splice(index, 1);
        }
    };
})();

//UI Controller
var UIController = (function() {
    //some code
    var DOMs = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        addButton: ".add__btn",
        expenseContainer: ".expenses__list",
        incomeContainer: ".income__list",
        budgetValue: ".budget__value",
        budgetIncome: ".budget__income--value",
        budgetExpense: ".budget__expenses--value",
        expensePercentage: ".budget__expenses--percentage",
        transactionDelete: ".item__delete--btn",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        date: '.budget__title--month'
    };

    return {
        getInputValues: function() {
            var description = document.querySelector(DOMs.inputDescription).value;
            var value = parseFloat(document.querySelector(DOMs.inputValue).value);
            var type = document.querySelector(DOMs.inputType).value; //will be getting inc for + and exp for -
            return {
                type: type,
                description: description,
                value: value
            };
        },

        getDOMStrings: function() {
            return DOMs;
        },

        addItem: function(transaction, type) {
            // TODO
            // 1. Generate template html based on type of transaction
            // 2. replace template string with actual data
            // 3. add the data to html.

            var html; //html - template html to add the new transaction to list, will be choosed according to transaction type.
            var element; //element to add html to
            if (type === "exp") {
                //if type is exp then use expense html template
                html =
                    '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                //element to add to....
                element = DOMs.expenseContainer;
            } else if (type === "inc") {
                //if type is inc then use income html template
                html =
                    '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                element = DOMs.incomeContainer;
            }

            // Replacing template string with actual data
            newHtml = html.replace("%id%", transaction.id);
            newHtml = newHtml.replace("%description%", transaction.description);
            newHtml = newHtml.replace("%value%", transaction.value);

            //Adding the html to concerned list
            document.querySelector(element).insertAdjacentHTML("afterbegin", newHtml);
        },

        clearFields: function() {
            fieldsToClear = document.querySelectorAll(
                DOMs.inputDescription + "," + DOMs.inputValue
            );
            console.log(fieldsToClear);
            for (var i = 0; i < fieldsToClear.length; i++) {
                fieldsToClear[i].value = null;
            }
            fieldsToClear[0].focus();
        },

        updateBudgetUI: function(budget) {
            //Updates the budget in UI

            document.querySelector(DOMs.budgetValue).textContent = budget.budgetValue;
            document.querySelector(DOMs.budgetIncome).textContent = budget.income;
            document.querySelector(DOMs.budgetExpense).textContent = budget.expense;
            document.querySelector(DOMs.expensePercentage).textContent =
                budget.percentage + "%";
        },

        deleteTransactionFromUI: function(elementId) {
            var el = document.getElementById(elementId);
            el.parentNode.removeChild(el);
        },

        updateExpenseTransactionPercentageUI: function(percentages) {
            var el = document.querySelectorAll(DOMs.expensesPercLabel);

            var nodeListForEach = function(list, callback) {
                j = percentages.length - 1;
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], j);
                    j--;
                }
            };
            nodeListForEach(el, function(current, index) {
                current.textContent = percentages[index] + "%";
            });
        },

        displayMonth: function() {
            var date = new Date();
            var year = date.getFullYear();
            monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            monthNumber = date.getMonth();
            document.querySelector(DOMs.date).textContent = monthNames[monthNumber - 1] + ', ' + year;
        },

        typeChanged: function() {
            var fields = document.querySelectorAll(DOMs.inputType + ',' + DOMs.inputValue + ',' + DOMs.inputDescription);

            var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i]);
                }
            };

            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMs.addButton).classList.toggle('red');

        }
    };
})();

//Global App Controller
var controller = (function(BudgetCtrl, UICtrl) {
    var setup = function() {
        console.log("Application has started");
        var DOM = UICtrl.getDOMStrings();
        document
            .querySelector(DOM.addButton)
            .addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function(evt) {
            if (evt.keyCode == 13 || evt.which == 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.inputDescription).focus();
        document
            .querySelector(DOM.container)
            .addEventListener("click", ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.typeChanged);

        UIController.displayMonth();
    };

    var inputValidated = function(input) {
        // value should be a number!
        if (
            input.description != "" &&
            isNaN(input.value) == false &&
            input.value > 0
        ) {
            return true;
        } else {
            return false;
        }
    };

    var updateExpenseTransactionPercentage = function() {
        //1. Calculate the percentages
        BudgetCtrl.calculateExpenseTransactionPercentage();
        //2. Read the percentages from budget controller
        var percentages = BudgetCtrl.getExpenseTransactionPercentage();
        console.log(percentages);
        //3. Update the UI with the new percentages
        UICtrl.updateExpenseTransactionPercentageUI(percentages);
    };

    var ctrlAddItem = function() {
        // This method is called when a keypress occurs

        // TODO
        // 1. Get input values
        var input = UICtrl.getInputValues();
        if (inputValidated(input)) {
            // 2. Add item to budget controller
            var newItem = BudgetCtrl.addTransaction(
                input.type,
                input.description,
                input.value
            );
            // 3. Add item to UI
            UICtrl.addItem(newItem, input.type);
            // 4. Clear the fields after input
            UICtrl.clearFields();
            // 5. Calculate the buget
            BudgetCtrl.updateBudget();
            // 6. Update the budget in UI
            UICtrl.updateBudgetUI(BudgetCtrl.getBudget());
            // 7. Update the expense transaction percentages
            updateExpenseTransactionPercentage();
        } else {
            alert("Enter in correct format");
        }
    };

    var ctrlDeleteItem = function(event) {
        // Function called when transaction delete button is clicked
        // TODO
        // 1. Get the item id and type to delete
        // 2. Delete the item from data structure
        // 3. Update UI
        // 4. Update Budget
        // 5. Update Budget in UI
        // 6. Update expense transaction percentage in UI
        item = event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(item);
        if (item != "" && typeof item != "undefined") {
            itemArr = item.split("-");
            itemType = itemArr[0];
            itemID = parseInt(itemArr[1]);
            BudgetCtrl.deleteTransaction(itemType, itemID);
            UICtrl.deleteTransactionFromUI(item);
            BudgetCtrl.updateBudget();
            UICtrl.updateBudgetUI(BudgetCtrl.getBudget());
            updateExpenseTransactionPercentage();
        }
    };

    return {
        init: setup
    };
})(budgetController, UIController);

controller.init(); //initialization function