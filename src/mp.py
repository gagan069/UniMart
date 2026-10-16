import mysql.connector as pro

# Database connection (shared globally)
d = pro.connect(host="localhost", user="root", password="admin", database="food")
e = d.cursor()

# ----------------- ADMIN FUNCTIONS -----------------

# ADD FOOD
def add_food():
    ser = int(input("Enter the Food ID: "))
    fi = input("Enter the Food name: ")
    fp = int(input("Enter the Price of Food: "))
    ft = input("Enter the Food Type: ")
    e.execute("INSERT INTO item VALUES (%s, %s, %s, %s)", (ser, fi, fp, ft))
    d.commit()
    print("NEW FOOD ADDED SUCCESSFULLY")

# UPDATE FOOD
def update_food():
    print("1. Update food name")
    print("2. Update food price")
    us = int(input("Enter your choice: "))

    if us == 1:
        fnid = int(input("Enter the Food ID to update name: "))
        fna = input("Enter the updated Food Name: ")
        e.execute("UPDATE item SET Food_Item=%s WHERE S_no=%s", (fna, fnid))
    elif us == 2:
        fnic = int(input("Enter the Food ID to update price: "))
        fnf = int(input("Enter the updated Food Price: "))
        e.execute("UPDATE item SET Price=%s WHERE S_no=%s", (fnf, fnic))
    else:
        print("Invalid choice.")
        return

    d.commit()
    print("UPDATED SUCCESSFULLY")
    ad_login()

# DELETE FOOD
def delete_food():
    fidd = int(input("Enter the Food ID to delete: "))
    e.execute("DELETE FROM item WHERE S_no=%s", (fidd,))
    d.commit()
    print("FOOD ITEM DELETED SUCCESAFULLY")

# VIEW ORDER HISTORY
def view_orders():
    e.execute("SELECT * FROM orders")
    ztt = e.fetchall()
    print("Details of all orders:")
    for i in ztt:
        print("*********************************************")
        print("Food name:", i[0])
        print("Food price:", i[1])
        print("Total price:", i[2])
        print("Phone NO:", i[3])
        print("Address:", i[4])
        print("*********************************************")



        # ADMIN LOGIN MENU
def ad_login():
    while True:
        print("\n--- ADMIN PANEL ---")
        print("1. Add food")
        print("2. Update food")
        print("3. Delete food")
        print("4. View orders")
        print("5. Logout")
        ask = int(input("Enter your Choice: "))
        if ask == 1:
            add_food()
        elif ask == 2:
            update_food()
        elif ask == 3:
            delete_food()
        elif ask == 4:
            view_orders()
        elif ask == 5:
            return
        else:
            print("Invalid input.")

# ADMIN PASSWORD CHECK
def ad_panel():
    pas = input("Enter Admin Password: ")
    if pas == 'Iomato':
        print("Access granted")
        ad_login()
    else:
        print("Wrong Password")
        print("Redirecting to Main Page...")
        admin()

# ----------------- CUSTOMER FUNCTIONS -----------------

# SHOW MENU
def show_menu():
    e.execute("SELECT * FROM item")
    w = e.fetchall()
    print("\n---------------- MENU FOR TODAY ---------------")
    for i in w:
        print(f"Food No: {i[0]}, Food Name: {i[1]}, Price: {i[2]}, Type: {i[3]}")
    
    ui = input("\nDo you want to order food? (yes/no): ")
    if ui.lower() == "yes":
        F_order()
    else:
        print("Thank you. Redirecting to Main Page.")

# PLACE ORDER
def F_order():
    io = int(input("Enter the food item number you want to order: "))
    qty = int(input("Enter quantity: "))
    phn = int(input("Enter your Phone Number: "))
    adr = input("Enter your Address: ")

    e.execute("SELECT * FROM item WHERE S_no=%s", (io,))
    fi = e.fetchone()

    if fi:
        iname = fi[1]
        iprice = fi[2]
        total_price = iprice * qty

        e.execute("INSERT INTO orders(O_name, I_price, O_price, P_no, ADR) VALUES (%s, %s, %s, %s, %s)",
                  (iname, iprice, total_price, phn, adr))
        d.commit()

        print("\n******** BILL ********")
        print("Address:", adr)
        print("Phone NO:", phn)
        print("Food name:", iname)
        print("Food price:", iprice)
        print("Quantity:", qty)
        print("Total price:", total_price)
        print("Order placed successfully.")
    else:
        print("Food item not found.")



        # VIEW ORDERS
def F_View():
    yno = int(input("Enter your Phone Number: "))
    e.execute("SELECT * FROM orders WHERE P_no=%s", (yno,))
    rt = e.fetchall()
    if rt:
        print("********** YOUR ORDER DETAILS **********")
        for i in rt:
            print("Food name:", i[0])
            print("Food price:", i[1])
            print("Total price:", i[2])
            print("Phone NO:", i[3])
            print("Address:", i[4])
            print("---------------------------------------")
    else:
        print("You have not placed any order.")

# CANCEL ORDER
def F_Cancel():
    cor = int(input("Enter your Phone Number: "))
    e.execute("DELETE FROM orders WHERE P_no=%s", (cor,))
    d.commit()
    print("Your order has been cancelled successfully.")

# FEEDBACK
def F_feedb():
    fdb = int(input("Enter your Phone Number: "))
    fdc = input("Give us your Feedback: ")
    e.execute("INSERT INTO feed (P_no, F_back) VALUES (%s, %s)", (fdb, fdc))
    d.commit()
    print("Thanks for your feedback!")

# MAIN MENU FOR CUSTOMER
def main_menu():
    while True:
        print("\n--- WELCOME TO FOOD PORTAL ---")
        print("1. Show Menu")
        print("2. Place Order")
        print("3. View Order")
        print("4. Cancel Order")
        print("5. Feedback")
        print("6. Exit")
        a = int(input("Enter the Service you want: "))
        if a == 1:
            show_menu()
        elif a == 2:
            F_order()
        elif a == 3:
            F_View()
        elif a == 4:
            F_Cancel()
        elif a == 5:
            F_feedb()
        elif a == 6:
            break
        else:
            print("Invalid option.")

# ----------------- HOME PAGE -----------------
def admin():
    while True:
        print("\n========== FOOD PORTAL ==========")
        print("1. Admin Login")
        print("2. Customer Login")
        print("3. Exit")
        op = int(input("Enter option: "))
        if op == 1:
            ad_panel()
        elif op == 2:
            main_menu()
        elif op == 3:
            print("Thank you. Exiting...")
            break
        else:
            print("Invalid input.")

# Start the program
admin()