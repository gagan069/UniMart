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