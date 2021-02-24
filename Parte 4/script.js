const Modal = {
    open() {
        document.querySelector(".modal-overlay").classList.add("active");
    },
    close() {
        document.querySelector(".modal-overlay").classList.remove("active");
    }
}


const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("transactions")) || [];
    },

    set(transactions) {
        localStorage.setItem("transactions", JSON.stringify(transactions));
    }
}

const Transaction = {

/*
    all: transactions = [
        {
            description: 'Luz',
            amount: -50000,
            date: '23/01/2021',
        },
        {
            description: 'Internet',
            amount: -20000,
            date: '23/01/2021',
        },
        {
            description: 'App',
            amount: 200099,
            date: '23/01/2021',
        },
        {
            description: 'Água',
            amount: -50049,
            date: '23/01/2021',
        }
    ],
*/

    all: Storage.get(),

    add(transaction) {
        
        for(var i = 0; i < transaction.times; i++) {
            
            const splittedDate = transaction.date.split("/");
            
            //alert(transaction.times);
            switch(transaction.repeat) {
                case "yearly":
                    var d = new Date(splittedDate[0], splittedDate[1], splittedDate[2] + i);
                    break;
                case "monthly":
                    var d = new Date(splittedDate[0], splittedDate[1] + i, splittedDate[2]);
                    alert(splittedDate[0] + "-" + splittedDate[1] + "-" + splittedDate[2]);
                    break;
                case "weekly":
                    var d = new Date(splittedDate[0] + i * 7, splittedDate[1], splittedDate[2]);
                    break;
                case "daily":
                    var d = new Date(splittedDate[0] + i, splittedDate[1], splittedDate[2]);
                    break;            
                default:
                    // none
                    console.log("Once");
            }

            console.log(d);

            transaction.date = `${d.getFullYear()}/${d.getMonth()}/${d.getDate()}`;
            //alert(transaction.date);

            //transaction.date = Number(transaction.date) + 10;

            Transaction.all.push(transaction);

            App.reload();
        }
    },

    remove(index) {
        Transaction.all.splice(index, 1);

        App.reload();
    },

    incomes() {
        // Check all transactions and Sum to incomes if it's grather than 0
        let income = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0) {
                income += transaction.amount;
            }
        });
        return income;
    },
    expenses() {
        // Check all transactions and Sum to incomes if it's grather than 0
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) {
                expense += transaction.amount;
            }
        });
        return expense;
    },
    total() {
        // Calc incomes - expenses
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        

        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense";

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
                    <td class="description">${transaction.description}</td>
                    <td class="${CSSclass}">${amount}</td>
                    <td class="date">${transaction.date}</td>
                    <td><img onclick="Transaction.remove(${index})" src="./images/minus.svg" alt="Remover Transação"></td>
        `;

        return html;
    },

    updateBalance() {
        
        document.getElementById('incomeDisplay').innerHTML  = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
        
        // Toogle Colors (For Positive and Negative Total)
        if(Transaction.total() < 0) {
            document.getElementById('header').classList.add('negative');
            document.getElementById('total').classList.add('negative');
        } else {
            document.getElementById('header').classList.remove('negative');
            document.getElementById('total').classList.remove('negative');
        }        
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "";
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, "");

        value = Number(value) / 100;

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        return signal + value;
    },

    formatAmount(value) {
        value = Number(value) * 100;
        return value; 
    },

    formatDate(date) {
        const splittedDate = date.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    repeat: document.querySelector('select#repeat'),
    times: document.querySelector('input#times'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
            repeat: Form.repeat.value,
            times: Form.times.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues();

        if( description.trim() === "" || amount.trim() === "" || date.trim() === "" ) {
            throw new Error("Please fill all fields.");
        }
        console.log(description);
    },

    formatValues() { 
        let { description, amount, date, repeat, times } = Form.getValues();

        amount = Utils.formatAmount(amount);

        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date,
            repeat,
            times
        }
    },

    clearFields() {
        Form.description.value = "";
        Form.amount.value = "";
        //var d = new Date();
        //alert(d);
        Form.date.value = "2021-01-01";
        Form.repeat.value = "monthly";
        Form.times.value = "1";
    },

    submit(event) {
        event.preventDefault();

        try {
            Form.validateFields();
            
            const transaction = Form.formatValues();
            
            // Save Transaction
            Transaction.add(transaction);

            Form.clearFields();

            Modal.close();

        } catch (error) {
            alert(error.message);
        }

        

    }
}

const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index);
        })
        
        DOM.updateBalance();

        Storage.set(Transaction.all);
        
        
    },
    reload() {
        DOM.clearTransactions();
        App.init();
    }
}

App.init();


/*
Transaction.add({
    description: '電気代',
    amount: 10300,
    date: '23/02/2021'
})
*/

//Transaction.remove(4);