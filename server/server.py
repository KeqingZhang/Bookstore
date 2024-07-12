from flask import Flask, request, jsonify, session, g
from flask_cors import CORS, cross_origin  # 导入 cross_origin
from werkzeug.utils import secure_filename
from datetime import datetime
import sqlite3
import json
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # 用于 session
CORS(app)  # 允许跨域请求并支持凭据

DATABASE = 'database.db'
BOOKS_DATABASE = 'database.db'
USER_DATA_FILE = 'user_data.json'

# 定义数据库连接函数
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def get_db(database=DATABASE):
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(database)
    return db

# 读取用户数据
def read_user_data():
    if os.path.exists(USER_DATA_FILE) and os.path.getsize(USER_DATA_FILE) > 0:
        with open(USER_DATA_FILE, 'r', encoding='utf-8') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return {}
    return {}

# 定义一个函数将元组转换为字典
def tuple_to_dict(row):
    return {
        'record_id': row[0],
        'custom_id': row[1],
        'admin_id': row[2],
        'context': row[3],
        'time': row[4],
        'state': row[5]  # 假设数据库表中有一个名为 is_read 的字段表示已读未读状态
    }

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def save_user_data(data):
    with open(USER_DATA_FILE, 'w') as f:
        json.dump(data, f)

def load_user_data():
    if os.path.exists(USER_DATA_FILE):
        with open(USER_DATA_FILE, 'r') as f:
            return json.load(f)
    return {}

# @app.route('/')
# def home():
#     return jsonify({'message': '这是首页'})

# API 路由：根据商家的 store_id 查询书籍信息
@app.route('/merchant-books', methods=['GET'])
def merchant_get_books():
    try:
        conn = sqlite3.connect('database.db', check_same_thread=False)
        cursor = conn.cursor()
        with open('user_data.json', 'r') as f:
            data = json.load(f)
        store_id = data.get('store_id')
        cursor.execute('SELECT * FROM books WHERE merchant_id = ?', (store_id,))
        books = cursor.fetchall()
        print(books)
        
        return jsonify([{
            'book_id': book[0],
            'book_name': book[1],
            'price': book[2],  # 新字段
            'merchant_id': book[3],
            'description': book[4],
            'author': book[5],
            'image_path': book[6],
            'stock': book[7],
            'category': book[8],   # 新字段
            'merchant_name': book[9]  # 修改为 merchant_name
        } for book in books])
    except Exception as e:
        print(f"Error querying books: {e}")
        return jsonify({'error': 'Error querying books'}), 500

# API 路由：移除书籍
@app.route('/books_remove/<int:book_id>', methods=['DELETE'])
def remove_book(book_id):
    try:
        conn = sqlite3.connect('database.db', check_same_thread=False)
        cursor = conn.cursor()
        cursor.execute('DELETE FROM books WHERE book_id = ?', (book_id,))
        conn.commit()
        return jsonify({'message': 'Book removed successfully'}), 200
    except Exception as e:
        print(f"Error removing book: {e}")
        return jsonify({'error': 'Error removing book'}), 500

@app.route('/customer-register', methods=['POST'])
def customer_register():
    data = request.get_json()
    username = data['username']
    subusername = data['subusername']
    password = data['password']
    email = data['email']
    defaultAddress = data['defaultAddress']
    birthday = data['birthday']
    bookPreferences = data['bookPreferences']

    db = get_db() 
    db.execute('INSERT INTO Customer (customer_id, nickname, password, email, default_address, birthday, reading_preference) VALUES (?, ?, ?, ?, ?, ?, ?)',
               [username, subusername, password, email, defaultAddress, birthday, bookPreferences])
    db.commit()

    return jsonify({"message": "用户注册成功"}), 201

@app.route('/merchant-register', methods=['POST'])
def merchant_register():
    data = request.get_json()
    storeId = data['storeId']
    storeName = data['storeName']
    storePassword = data['storePassword']
    storeAddress = data['storeAddress']
    salesCategory = data['salesCategory']
    establishmentDate = data['establishmentDate']
    phone = data['phone']

    db = get_db() 
    db.execute('INSERT INTO Merchant (merchant_id, merchant_name, merchant_password, merchant_address, sales_category, establishment_date, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
               [storeId, storeName, storePassword, storeAddress, salesCategory, establishmentDate, phone])
    db.commit()

    return jsonify({"message": "商家注册成功"}), 201

@app.route('/admin-register', methods=['POST'])
def admin_register():
    data = request.get_json()
    adminId = data['adminId']
    adminNickname = data['nickname']
    adminPassword = data['password']
    adminCompanyName = data['email']
    adminAddress = data['office_address']

    db = get_db() # id INTEGER, admin_id TEXT, nickname TEXT, password TEXT, email TEXT, office_address TEXT
    db.execute('INSERT INTO Admin (admin_id, nickname, password, email, office_address) VALUES (?, ?, ?, ?, ?)',
               [adminId, adminNickname, adminPassword, adminCompanyName, adminAddress])
    db.commit()

    return jsonify({"message": "管理员注册成功"}), 201

@app.route('/customer-login', methods=['POST', 'OPTIONS'])
def customer_login():
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
        return '', 200, headers
    
    data = request.get_json()

    username = data['username']
    password = data['password']
    print(username, password)

    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM Customer WHERE customer_id = ? AND password = ?', (username, password))
    customer = cursor.fetchone()
    db.close()

    if customer:
        session['customer_id'] = customer[0]
        user_data = {
            'user_type': 'customer',
            'user_id': customer[0],
            'username': customer[1],
            'subusername': customer[2],
            'email': customer[4],
            'address': customer[5],
            'birthday': customer[6],
            'bookPreferences': customer[7]
        }
        save_user_data(user_data)
        return jsonify({"message": "用户登录成功", "user_data": user_data}), 200
    else:
        return jsonify({"message": "用户名或密码错误"}), 401

@app.route('/merchant-login', methods=['POST', 'OPTIONS'])
def merchant_login():
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
        return '', 200, headers

    data = request.get_json()
    username = data['username']
    password = data['password']
    print(username, password)

    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM Merchant WHERE merchant_id = ? AND merchant_password = ?', (username, password))
    merchant = cursor.fetchone()
    db.close()

    if merchant:
        session['merchant_id'] = merchant[0]
        user_data = {
            'user_type': 'merchant',
            'store_id': merchant[0],
            'store_email': merchant[1],
            'store_name': merchant[2],
            'store_address': merchant[4],
            'sales_category': merchant[5],
            'establishment_date': merchant[6],
            'phone': merchant[7]
        }
        save_user_data(user_data)
        return jsonify({"message": "商家登录成功", "user_data": user_data}), 200
    else:
        return jsonify({"message": "用户名或密码错误"}), 401

@app.route('/admin-login', methods=['POST', 'OPTIONS'])
def admin_login():
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
        return '', 200, headers

    data = request.get_json()
    username = data['username']
    password = data['password']
    print(username, password)

    db = get_db()
    cursor = db.cursor() 
    cursor.execute('SELECT * FROM Admin WHERE admin_id = ? AND password = ?', (username, password))
    admin = cursor.fetchone()
    db.close()

    if admin:
        session['admin_id'] = admin[0]
        user_data = {
            'user_type': 'admin',
            'admin_id': admin[1],
            'admin_nickname': admin[2],
            'password':admin[3],
            'email':admin[4],
            'office_address':admin[5]
        }
        save_user_data(user_data)
        return jsonify({"message": "管理员登录成功", "user_data": user_data}), 200
    else:
        return jsonify({"message": "用户名或密码错误"}), 401
    
@app.route('/admin/update', methods=['POST'])
def update_admin_info():
    try:
        data = request.json
        db = get_db()
        cursor = db.cursor()
        account = load_user_data()['admin_id']
        # print(data)
        cursor.execute(
            'UPDATE admin SET nickname = ?, email = ?, office_address = ? WHERE admin_id = ?', 
            (data['admin_nickname'], data['email'], data['office_address'], account)
        )
        db.commit()  # 提交事务
        return jsonify({'message': 'Admin information updated successfully'}), 200
    except Exception as e:
        print(f"Error updating admin information: {e}")
        return jsonify({'error': 'Error updating admin information'}), 500


@app.route('/admin/info', methods=['GET'])
def admin_info():
    try:
        admin_info = load_user_data()
        return jsonify(admin_info), 200
    except Exception as e:
        print(f"Error fetching admin information: {e}")
        return jsonify({'error': 'Error fetching admin information'}), 500


@app.route('/get-current-user', methods=['GET'])
def get_current_user():
    # 假设在这里获取用户信息
    user_data = load_user_data()
    print(user_data)

    if user_data:
        response = jsonify( user_data)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    else:
        return jsonify({'message': '未登录'}), 401

@app.route('/logout', methods=['POST'])
@cross_origin(origin='http://localhost:3000', supports_credentials=True)  # 添加支持凭据的跨域修饰器
def logout():
    session.clear()
    if os.path.exists(USER_DATA_FILE):
        with open(USER_DATA_FILE, 'w') as f:
            json.dump({}, f)  # 清空 user_data.json 文件内容
    return jsonify({'message': '用户已登出'}), 200

@app.route('/get-books', methods=['GET'])
def get_books():
    user_data = load_user_data()
    if not user_data or user_data.get('user_type') != 'merchant':
        return jsonify({'message': '未登录或非商家用户'}), 401

    store_id = user_data.get('user_id')
    db = get_db(database=BOOKS_DATABASE)
    cursor = db.cursor()
    cursor.execute('SELECT * FROM books WHERE store_id = ?', (store_id,))
    books = cursor.fetchall()
    db.close()

    books_list = []
    for book in books:
        books_list.append({
            'book_id': book[0],
            'title': book[1],
            'author': book[2],
            'price': book[3],
            'store_id': book[4],
            'quantity': book[5],
        })

    return jsonify({'books': books_list})

@app.route('/get-current-merchant', methods=['GET'])
def get_current_merchant():
    user_data = load_user_data()
    if user_data and user_data.get('user_type') == 'merchant':
        return jsonify(user_data), 200
    else:
        return jsonify({'message': '未找到商户信息或未登录'}), 401


@app.route('/merchant', methods=['GET'])
def get_merchant():
    user_data = load_user_data()
    if not user_data or user_data.get('user_type') != 'merchant':
        return jsonify({'message': '未登录或非商家用户'}), 401

    store_id = user_data.get('user_id')
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM Merchant WHERE store_id = ?', (store_id,))
    merchant = cursor.fetchone()
    db.close()

    if merchant:
        return jsonify({
            'id': merchant[0],
            'store_id': merchant[1],
            'store_name': merchant[2],
            'store_password': merchant[3],
            'store_address': merchant[4],
            'sales_category': merchant[5],
            'establishment_date': merchant[6],
            'phone': merchant[7]
        })
    else:
        return jsonify({'error': 'Merchant not found'}), 404

@app.route('/update-merchant-info', methods=['PATCH'])
def update_merchant():
    user_data = load_user_data()
    if not user_data or user_data.get('user_type') != 'merchant':
        return jsonify({'message': '未登录或非商家用户'}), 401

    store_id = user_data.get('user_id')
    data = request.get_json()
    store_name = data.get('store_name')
    store_password = data.get('store_password')
    store_address = data.get('store_address')
    sales_category = data.get('sales_category')
    phone = data.get('phone')
    print(data)

    if not all([store_name, store_password, store_address, sales_category, phone]):
        return jsonify({'message': '缺少必要的商户信息'}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute('''
        UPDATE Merchant
        SET store_name = ?, store_password = ?, store_address = ?, sales_category = ?, phone = ?
        WHERE store_id = ?
    ''', (store_name, store_password, store_address, sales_category, phone, store_id))
    db.commit()
    db.close()

    # 更新 session 中的数据
    user_data['store_name'] = store_name
    user_data['store_address'] = store_address
    user_data['sales_category'] = sales_category
    user_data['phone'] = phone
    save_user_data(user_data)

    return jsonify({'message': '商户信息更新成功'})

@app.route('/update-user-info', methods=['POST'])
def update_user_info():
    user_data = load_user_data()
    if not user_data or user_data.get('user_type') != 'customer':
        return jsonify({'message': '未登录或非客户用户'}), 401

    data = request.get_json()
    user_id = user_data.get('user_id')

    db = get_db()
    cursor = db.cursor()
    cursor.execute('''
        UPDATE Customer
        SET username = ?, nickname = ?, email = ?, default_address = ?, reading_preference = ?, birthday = ?
        WHERE id = ?
    ''', (data['username'], data['subusername'], data['email'], data['address'], data['bookPreferences'], data['birthday'], user_id))
    db.commit()

    # 更新 user_data.json
    updated_user_data = {
        'user_type': 'customer',
        'user_id': user_id,
        'username': data['username'],
        'subusername': data['subusername'],
        'email': data['email'],
        'address': data['address'],
        'birthday': data['birthday'],
        'bookPreferences': data['bookPreferences']
    }
    save_user_data(updated_user_data)

    return jsonify({'message': '用户信息更新成功'}), 200

@app.route('/update-merchant-password', methods=['PATCH'])
def update_merchant_password():
    user_data = load_user_data()
    if not user_data or user_data.get('user_type') != 'merchant':
        return jsonify({'message': '未登录或非商家用户'}), 401

    store_id = user_data.get('user_id')
    data = request.get_json()
    print(data)
    store_password = data.get('store_password')
    print(store_password)

    if not store_password:
        return jsonify({'message': '缺少新密码'}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute('''
        UPDATE Merchant
        SET merchant_password = ?
        WHERE merchant_id = ?
    ''', (store_password, store_id))
    db.commit()
    db.close()

    # 更新 session 中的数据
    user_data['store_password'] = store_password
    save_user_data(user_data)

    return jsonify({'message': '商户密码更新成功'})

@app.route('/update-password', methods=['POST'])
def update_password():
    user_data = load_user_data()
    if not user_data or user_data.get('user_type') != 'customer':
        return jsonify({'message': '未登录或非客户用户'}), 401

    data = request.get_json()
    user_id = user_data.get('user_id')
    new_password = data.get('password')

    db = get_db()
    cursor = db.cursor()
    cursor.execute('UPDATE Customer SET password = ? WHERE id = ?', (new_password, user_id))
    db.commit()

    return jsonify({'message': '密码更新成功'}), 200

@app.route('/admin/update_password', methods=['POST'])
def update_admin_password():
    user_data = load_user_data()
    if not user_data or user_data.get('user_type') != 'admin':
        return jsonify({'message': '未登录或非管理员用户'}), 401

    data = request.get_json()
    new_password = data.get('password')

    db = get_db()
    cursor = db.cursor()
    admin_id = user_data.get('admin_id')
    cursor.execute('UPDATE Admin SET password = ? WHERE admin_id = ?', (new_password, admin_id))
    db.commit()

    return jsonify({'message': '管理员密码更新成功'}), 200

@app.route('/adjust-quantity', methods=['POST'])
def adjust_quantity():
    try:
        user_data = read_user_data()
        username = user_data.get('user_id')
        data = request.get_json()
        print(data)
        
        book_id = data['book']['book_id']
        new_quantity = data['quantity']
        print(new_quantity)

        # 连接到SQLite数据库
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()

        # 更新购物车中书本的数量
        cursor.execute("""
            UPDATE shoppingcart
            SET quantity = ?
            WHERE book_id = ?
        """, (new_quantity, book_id))

        conn.commit()

        # 查询当前用户购物车中的所有记录
        cursor.execute('SELECT * FROM shoppingcart WHERE username = ?', (username,))
        cart_items = cursor.fetchall()
        
        # 将查询结果转换为 JSON 响应
        cart_items_json = [
            {
            'username': item[0],
            'author': item[1],
            'book_name': item[2],
            'category': item[3],
            'description': item[4],
            'image_path': item[5],
            'merchant': item[6],
            'price': item[7],
            'stock': item[8],
            'quantity': item[9],
            'book_id': item[10]
            }
            for item in cart_items
        ]
        
        return jsonify({"cart": cart_items_json})
    except Exception as e:
        print(f"调整数量出错: {e}")
        return jsonify({"error": "调整数量出错，请重试"}), 500

@app.route('/add-to-cart', methods=['POST'])
def add_to_cart():
    book = request.json
    user_data = read_user_data()
    username = user_data.get('user_id')
    
    if not username:
        return jsonify({'message': '用户未登录'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 插入或更新购物车记录，仅记录商品信息和数量
        cursor.execute('''
            INSERT INTO shoppingcart (username, author, book_name, category, description, image_path, merchant, price, stock, quantity, book_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(book_id) DO UPDATE SET
                author=excluded.author,
                book_name=excluded.book_name,
                category=excluded.category,
                description=excluded.description,
                image_path=excluded.image_path,
                merchant=excluded.merchant,
                price=excluded.price,
                stock=excluded.stock,
                quantity=excluded.quantity
        ''', (username, book['author'], 
            book['book_name'], book['category'], 
            book['description'], 
            book['image_path'], book['merchant'], 
            book['price'], book['stock'], 
            book['quantity'], book['id']))
    
        conn.commit()

        # 查询当前用户购物车中的所有记录
        cursor.execute('SELECT * FROM shoppingcart WHERE username = ?', (username,))
        cart_items = cursor.fetchall()
        
        # 将查询结果转换为 JSON 响应
        cart_items_json = [
            {
                'username': item['username'],
                'author': item['author'],
                'book_name': item['book_name'],
                'category': item['category'],
                'description': item['description'],
                'image_path': item['image_path'],
                'merchant': item['merchant'],
                'price': item['price'],
                'stock': item['stock'],
                'quantity': item['quantity'],
                'book_id': item['book_id']
            }
            for item in cart_items
        ]
        
        return jsonify({'message': '添加到购物车成功', 'cart': cart_items_json}), 200
    except Exception as e:
        conn.rollback()
        print(f'添加到购物车失败: {e}')  # 添加详细错误日志
        return jsonify({'message': '添加到购物车失败', 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/remove-from-cart', methods=['POST'])
def remove_from_cart():
    book = request.json
    user_data = read_user_data()
    username = user_data.get('user_id')
    
    if not username:
        return jsonify({'message': '用户未登录'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    print(book)
    try:
        cursor.execute('DELETE FROM shoppingcart WHERE username = ? AND book_id = ?', (username, book['id']))
        conn.commit()

        # 查询当前用户购物车中的所有记录
        cursor.execute('SELECT * FROM shoppingcart WHERE username = ?', (username,))
        cart_items = cursor.fetchall()
        for item in cart_items:
            print(dict(item))
        cart_items_json = [
            {
                'username': dict(item)['username'],
                'author': dict(item)['author'],
                'book_name': dict(item)['book_name'],
                'category': dict(item)['category'],
                'description': dict(item)['description'],
                # 'cart_id': dict(item)['cart_id'],
                'image_path': dict(item)['image_path'],
                'merchant': dict(item)['merchant'],
                'price': dict(item)['price'],
                'stock': dict(item)['stock'],
                'quantity': dict(item)['quantity'],
                'book_id': dict(item)['book_id']
            }
            for item in cart_items
        ]

        return jsonify({'message': '从购物车中移除成功', 'cart': cart_items_json}), 200
    except Exception as e:
        conn.rollback()
        print(f'从购物车中移除失败: {e}')  # 添加详细错误日志
        return jsonify({'message': '从购物车中移除失败', 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/clear-cart', methods=['POST'])
def clear_cart():
    user_data = read_user_data()
    username = user_data.get('user_id')
    
    if not username:
        return jsonify({'message': '用户未登录'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('DELETE FROM shoppingcart WHERE username = ?', (username,))
        conn.commit()
        return jsonify({'message': '购物车已清空', 'cart': []}), 200
    except Exception as e:
        conn.rollback()
        print(f'清空购物车失败: {e}')  # 添加详细错误日志
        return jsonify({'message': '清空购物车失败', 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/get-user-info', methods=['GET'])
def get_user_info():
    user_data = read_user_data()
    if 'user_id' in user_data:
        return jsonify({'user': user_data})
    return jsonify({'message': '用户信息未找到'}), 404

@app.route('/get-cart', methods=['GET'])
def get_cart():
    user_data = read_user_data()
    username = user_data.get('user_id')
    
    if not username:
        return jsonify({'message': '用户未登录'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT * FROM shoppingcart WHERE username = ?', (username,))
        cart_items = cursor.fetchall()
        
        cart_items_json = [
            {
                'username': dict(item)['username'],
                'author': dict(item)['author'],
                'book_name': dict(item)['book_name'],
                'category': dict(item)['category'],
                'description': dict(item)['description'],
                'image_path': dict(item)['image_path'],
                'merchant': dict(item)['merchant'],
                'price': dict(item)['price'],
                'stock': dict(item)['stock'],
                'quantity': dict(item)['quantity'],
                'book_id': dict(item)['book_id']
            }
            for item in cart_items
        ]
        # print(cart_items_json)
        return jsonify({'cart': cart_items_json}), 200
    except Exception as e:
        print(f'读取购物车失败: {e}')  # 添加详细错误日志
        return jsonify({'message': '读取购物车失败', 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/checkout', methods=['POST'])
def checkout():
    user_data = read_user_data()
    username = user_data.get('user_id')
    if not username:
        return jsonify({'message': '用户未登录'}), 400

    data = request.json
    cart = data.get('cart')
    address = data.get('address', '理塘')  # 默认收货地址为'理塘'
    transaction_status = '未发货'  # 默认交易状态为'正在配送'

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        for book in cart:
            order_id = str(uuid.uuid4())
            # print(book)
            customer_id = username  # 假设 customer_id 为用户名
            merchant_id = book.get('id')  # 假设 merchant_id 从 book 对象中获取
            
            cursor.execute('''
                INSERT INTO orders (order_id, merchant_name, nickname, book_name, quantity, total_amount, transaction_date, delivery_address, transaction_status, customer_id, merchant_id)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?)
            ''', (
                order_id,
                book['merchant'],
                username,
                book['book_name'],
                book['quantity'],
                book['price'] * book['quantity'],
                address,
                transaction_status,
                customer_id,
                merchant_id
            ))
        # print(merchant_id)
        conn.commit()

        cursor.execute('DELETE FROM shoppingcart WHERE username = ?', (username,))
        conn.commit()
        
        return jsonify({'message': '结账成功'}), 200
    except Exception as e:
        conn.rollback()
        print(e)
        return jsonify({'message': '结账失败', 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/customer-logout', methods=['POST'])
def customer_logout():
    session.clear()
    if os.path.exists(USER_DATA_FILE):
        with open(USER_DATA_FILE, 'w') as f:
            json.dump({}, f)  # 清空 user_data.json 文件内容
    return jsonify({'message': '用户已登出'}), 200
@app.route('/apply-discount', methods=['GET'])
def apply_discount():
    user_data = read_user_data()
    username = user_data.get('user_id')
    
    if not username:
        return jsonify({'message': '用户未登录'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 查询当前用户购物车中的所有记录
        cursor.execute('SELECT * FROM shoppingcart WHERE username = ?', (username,))
        _cart_items = cursor.fetchall()
        cart_items = []
        for item in _cart_items:
            cart_items.append(dict(item))

        # 查询当前用户的所有优惠券
        cursor.execute('SELECT * FROM Coupon WHERE customer_id = ?', (username,))
        _coupons = cursor.fetchall()
        coupons = []
        for item in _coupons:
            coupons.append(dict(item))

        # 初始化打折和未打折购物记录
        discounted_items = []
        non_discounted_items = []

        for item in cart_items:
            # 检查该书籍的商家是否有可用优惠券
            matching_coupons = [dict(coupon) for coupon in coupons if coupon['merchant_id'] == item['merchant']]
            if matching_coupons:
                total_quantity = item['quantity']
                coupon_quantity = len(matching_coupons)
                if total_quantity > coupon_quantity:
                    # 部分打折，部分不打折
                    discounted_items.append({**item, 'quantity': coupon_quantity, 'discounted': True})
                    non_discounted_items.append({**item, 'quantity': total_quantity - coupon_quantity, 'discounted': False})
                else:
                    # 全部打折
                    discounted_items.append({**item, 'quantity': total_quantity, 'discounted': True})
            else:
                # 无可用优惠券，不打折
                non_discounted_items.append({**item, 'quantity': item['quantity'], 'discounted': False})
        return jsonify({
            'discounted_items': discounted_items,
            'non_discounted_items': non_discounted_items
        }), 200
    except Exception as e:
        print(f'应用优惠失败: {e}')  # 添加详细错误日志
        return jsonify({'message': '应用优惠失败', 'error': str(e)}), 500
    finally:
        conn.close()

# 路由用于从数据库中获取特定用户的数据
@app.route('/comments', methods=['GET'])
def get_customer_data():
    with open('user_data.json', 'r') as f:
        data = json.load(f)
    user_id = data['user_id']
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    # 连接到 SQLite 数据库
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    # 执行查询
    cursor.execute("SELECT * FROM CommitCustomer WHERE customer_id=?", (user_id,))
    customer_data = cursor.fetchall()

    # 将每条记录转换为字典对象
    customer_data_dict = [tuple_to_dict(row) for row in customer_data]
    conn.close()

    # 将查询结果转换为 JSON 格式并返回
    return jsonify(customer_data_dict)

# 路由用于从数据库中获取特定商店的数据
@app.route('/merchant_comments', methods=['GET'])
def get_merchant_data():
    with open('user_data.json', 'r') as f:
        data = json.load(f)
    user_id = data['store_id']
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    # 连接到 SQLite 数据库
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    # 执行查询
    cursor.execute("SELECT * FROM CommitMerchant WHERE merchant_id=?", (user_id,))
    customer_data = cursor.fetchall()

    # 将每条记录转换为字典对象
    customer_data_dict = [tuple_to_dict(row) for row in customer_data]
    conn.close()

    # 将查询结果转换为 JSON 格式并返回
    return jsonify(customer_data_dict)

# 路由用于将评论标记为已读
@app.route('/merchant_comments/read', methods=['POST'])
def marchent_comment_as_read():
    with open('user_data.json', 'r') as f:
        data = json.load(f)
    user_id = data['store_id']
    
    data = request.json
    comment_id = data.get('comment_id')

    if not comment_id:
        return jsonify({'error': 'Comment ID is required in request body'}), 400

    # 连接到 SQLite 数据库
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    try:
        # 更新数据库中对应评论的状态为已读（假设 is_read 为 1 表示已读）
        cursor.execute("UPDATE CommitMerchant SET is_read=1 WHERE record_id=?", (comment_id,))
        conn.commit()

        # 重新查询并获取更新后的评论数据
        cursor.execute("SELECT * FROM CommitMerchant WHERE merchant_id=?", (user_id,))
        updated_customer_data = cursor.fetchall()

        # 将每条记录转换为字典对象
        updated_customer_data_dict = [tuple_to_dict(row) for row in updated_customer_data]
        
        conn.close()

        # 返回更新后的评论数据
        return jsonify(updated_customer_data_dict)

    except Exception as e:
        conn.rollback()
        print("Error marking comment as read:", e)
        return jsonify({'error': 'Failed to mark comment as read'}), 500
    finally:
        conn.close()

# 路由用于将评论标记为已读
@app.route('/comments/read', methods=['POST'])
def mark_comment_as_read():
    with open('user_data.json', 'r') as f:
        data = json.load(f)
    user_id = data['user_id']
    
    data = request.json
    comment_id = data.get('comment_id')

    if not comment_id:
        return jsonify({'error': 'Comment ID is required in request body'}), 400

    # 连接到 SQLite 数据库
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    try:
        # 更新数据库中对应评论的状态为已读（假设 is_read 为 1 表示已读）
        cursor.execute("UPDATE CommitCustomer SET is_read=1 WHERE record_id=?", (comment_id,))
        conn.commit()

        # 重新查询并获取更新后的评论数据
        cursor.execute("SELECT * FROM CommitCustomer WHERE customer_id=?", (user_id,))
        updated_customer_data = cursor.fetchall()

        # 将每条记录转换为字典对象
        updated_customer_data_dict = [tuple_to_dict(row) for row in updated_customer_data]
        
        conn.close()

        # 返回更新后的评论数据
        return jsonify(updated_customer_data_dict)

    except Exception as e:
        conn.rollback()
        print("Error marking comment as read:", e)
        return jsonify({'error': 'Failed to mark comment as read'}), 500
    finally:
        conn.close()

@app.route('/comments/unread/count', methods=['GET'])
def get_unread_comments_count():
    try:
        with open('user_data.json', 'r') as f:
            data = json.load(f)
        user_id = data.get('user_id')
        # print(data)
        print(user_id)
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400

        # 连接到 SQLite 数据库
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()

        try:
            # 查询未读评论的数量
            cursor.execute("SELECT COUNT(*) FROM CommitCustomer WHERE customer_id=? AND is_read=0", (user_id,))
            unread_count = cursor.fetchone()  # 获取查询结果的第一个值
            print(unread_count)

            # 返回未读评论数量
            return jsonify({'count': unread_count})

        except Exception as e:
            print("Error fetching unread comments count:", e)
            return jsonify({'error': 'Failed to fetch unread comments count'}), 500

        finally:
            conn.close()
    
    except FileNotFoundError:
        return jsonify({'error': 'user_data.json file not found'}), 500
    
    except json.JSONDecodeError:
        return jsonify({'error': 'Error decoding JSON data'}), 500

    except Exception as e:
        print("Error processing request:", e)
        return jsonify({'error': 'An error occurred while processing the request'}), 500

# @app.route('/test', methods=['GET'])
# def test():
#     try:
#         db = get_db()
#         cursor = db.cursor()
#         cursor.execute('SELECT * FROM books')
#         books = cursor.fetchall()  # 获取所有结果
#         # print(books)
#         db.close()
#         formatted_books = [{
#             'id': book[0],
#             'book_name': book[1],
#             'price': book[2],
#             'merchant': book[3],
#             'description': book[4],
#             'author': book[5],
#             'image_path': book[6],
#             'stock': book[7],
#             'category': book[8]
#         } for book in books]
#         return jsonify({"books": formatted_books}), 200
#     except Exception as e:
#         # print(e)
#         return jsonify({"message": "获取书本数据失败"}), 500

@app.route('/customer-get-books', methods=['GET'])
def customer_get_books():
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM books')
        books = cursor.fetchall()  # 获取所有结果
        # print(books)
        db.close()
        formatted_books = [{
            'id': book[0],
            'book_name': book[1],
            'price': book[2],
            'merchant': book[3],
            'description': book[4],
            'author': book[5],
            'image_path': book[6],
            'stock': book[7],
            'category': book[8]
        } for book in books]
        return jsonify({"books": formatted_books}), 200
    except Exception as e:
        # print(e)
        return jsonify({"message": "获取书本数据失败"}), 500

@app.route('/search-books', methods=['GET'])
def search_books():
    category = request.args.get('category')
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM books WHERE category LIKE ?', ('%' + category + '%',))
        books = cursor.fetchall()  # 获取所有结果
        print(books)
        db.close()
        formatted_books = [{
            'id': book[0],
            'title': book[1],
            'price': book[2],
            'merchant': book[3],
            'description': book[4],
            'author': book[5],
            'image': book[6],
            'stock': book[7],
            'category': book[8]
        } for book in books]
        return jsonify({"books": formatted_books}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "搜索书本数据失败"}), 500

# 获取所有订单或根据条件筛选订单
@app.route('/admin/orders', methods=['GET'])
def get_orders():
    try:
        # 获取查询参数
        conn = sqlite3.connect('database.db', check_same_thread=False)
        cursor = conn.cursor()
        user_name = request.args.get('user_name')
        merchant_name = request.args.get('merchant_name')
        transaction_date = request.args.get('transaction_date')
        
        # 构建初始 SQL 查询语句
        query = 'SELECT * FROM orders WHERE 1=1'
        params = []

        # 如果提供了 user_name，通过 Customer 表查询 customer_id
        if user_name:
            cursor.execute('SELECT customer_id FROM Customer WHERE nickname LIKE ?', (f'%{user_name}%',))
            customer_ids = cursor.fetchall()
            if customer_ids:
                customer_ids = [customer_id[0] for customer_id in customer_ids]
                query += ' AND customer_id IN ({})'.format(','.join(['?' for _ in customer_ids]))
                params.extend(customer_ids)
            else:
                return jsonify([])  # 如果没有找到匹配的 customer_id，返回空列表

        # 如果提供了 merchant_name，通过 Merchant 表查询 merchant_id
        if merchant_name:
            cursor.execute('SELECT merchant_id FROM Merchant WHERE merchant_name LIKE ?', (f'%{merchant_name}%',))
            merchant_ids = cursor.fetchall()
            if merchant_ids:
                merchant_ids = [merchant_id[0] for merchant_id in merchant_ids]
                query += ' AND merchant_id IN ({})'.format(','.join(['?' for _ in merchant_ids]))
                params.extend(merchant_ids)
            else:
                return jsonify([])  # 如果没有找到匹配的 merchant_id，返回空列表
        
        # 如果提供了 transaction_date，直接在 orders 表中进行筛选
        if transaction_date:
            query += ' AND transaction_date LIKE ?'
            params.append(f'%{transaction_date}%')

        # 执行查询
        cursor.execute(query, params)
        rows = cursor.fetchall()

        # 将查询结果转换为 JSON 格式
        orders = []
        
        for row in rows:
            # 获取商店名称
            # print(row[1], row[2])
            cursor.execute('SELECT merchant_id FROM Merchant WHERE id = ?', (row[1],))
            merchant_name = cursor.fetchall()

            # 获取用户的用户名
            cursor.execute('SELECT customer_id FROM Customer WHERE id = ?', (row[2],))
            customer_id = cursor.fetchall()

            order = {
                'order_id': row[0],
                'merchant_name': merchant_name,
                'customer_id': customer_id,
                'book_name': row[3],
                'quantity': row[4],
                'total_amount': row[5],
                'transaction_date': row[6],
                'delivery_address': row[7],
                'transaction_status': row[8]
            }
            orders.append(order)
        return jsonify(orders)

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

# 删除订单
@app.route('/admin/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    try:
        conn = sqlite3.connect('database.db', check_same_thread=False)
        cursor = conn.cursor()
        cursor.execute('DELETE FROM orders WHERE order_id = ?', (order_id,))
        conn.commit()
        return jsonify({'message': 'Order deleted successfully'}), 200
    
    except Exception as e:
        print(f"Error deleting order: {e}")
        return jsonify({'error': 'Error deleting order'}), 500

# 获取所有商店或根据商店名称筛选商店
@app.route('/admin/stores', methods=['GET'])
def get_stores():
    try:
        conn = sqlite3.connect('database.db', check_same_thread=False)
        cursor = conn.cursor()
        # 获取查询参数
        store_name = request.args.get('store_name')

        # 构建 SQL 查询语句
        query = 'SELECT * FROM Merchant WHERE 1=1'
        params = []

        if store_name:
            query += ' AND merchant_name LIKE ?'
            params.append(f'%{store_name}%')

        cursor.execute(query, params)
        stores = cursor.fetchall()

        # 构建商店列表 JSON 响应
        stores_list = []
        for store in stores:
            store_dict = {
                'store_id': store[0],
                'store_name': store[2],
                'store_address': store[4]
            }
            stores_list.append(store_dict)

        return jsonify(stores_list)
    
    except Exception as e:
        print(f"Error fetching stores: {e}")
        return jsonify({'error': 'Error fetching stores'}), 500

# 删除商店
@app.route('/admin/stores/<int:store_id>', methods=['DELETE'])
def delete_store(store_id):
    try:
        conn = sqlite3.connect('database.db', check_same_thread=False)
        cursor = conn.cursor()
        cursor.execute('DELETE FROM Merchant WHERE id = ?', (store_id,))
        conn.commit()
        return jsonify({'message': 'Store deleted successfully'}), 200
    
    except Exception as e:
        print(f"Error deleting store: {e}")
        return jsonify({'error': 'Error deleting store'}), 500

# 向商店发出警告并记录
@app.route('/admin/warn_store', methods=['POST'])
def warn_store():
    try:
        data = request.get_json()
        store_id = data.get('store_id')
        warning_content = data.get('warning_content')

        cursor.execute('INSERT INTO CommitMerchant (merchant_id, context) VALUES (?, ?)', (store_id, warning_content))
        conn.commit()
        return jsonify({'message': 'Warning issued successfully'}), 200
    
    except Exception as e:
        print(f"Error warning store: {e}")
        return jsonify({'error': 'Error warning store'}), 500

# 获取所有用户或根据用户名筛选用户
@app.route('/admin/users', methods=['GET'])
def get_users():
    try:
        conn = sqlite3.connect('database.db', check_same_thread=False)
        cursor = conn.cursor()
        # 获取查询参数
        user_name = request.args.get('user_name')

        # 构建 SQL 查询语句
        query = 'SELECT * FROM Customer WHERE 1=1'
        params = []

        if user_name:
            query += ' AND nickname LIKE ?'
            params.append(f'%{user_name}%')

        cursor.execute(query, params)
        users = cursor.fetchall()

        # 构建用户列表 JSON 响应
        users_list = []
        # print(users)
        for user in users:
            user_dict = {
                'user_id': user[0],
                'user_name': user[1],
                'nickname': user[2],
                'password': user[3],
                'email': user[4],
                'address': user[5],
                'birthday': user[6],
                'category': user[7]
            }
            users_list.append(user_dict)

        return jsonify(users_list)
    
    except Exception as e:
        print(f"Error fetching users: {e}")
        return jsonify({'error': 'Error fetching users'}), 500

# 删除用户
@app.route('/admin/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        conn = sqlite3.connect('database.db', check_same_thread=False)
        cursor = conn.cursor()
        cursor.execute('DELETE FROM Customer WHERE id = ?', (user_id,))
        conn.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    
    except Exception as e:
        print(f"Error deleting user: {e}")
        return jsonify({'error': 'Error deleting user'}), 500

# 给用户评论
@app.route('/admin/warn_user', methods=['POST'])
def warn_user():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        warning_content = data.get('warning_content')

        cursor.execute('INSERT INTO CommitCustomer (customer_id, context) VALUES (?, ?)', (user_id, warning_content))
        conn.commit()
        return jsonify({'message': 'Warning issued successfully'}), 200
    
    except Exception as e:
        print(f"Error warning user: {e}")
        return jsonify({'error': 'Error warning user'}), 500

@app.route('/coupons', methods=['GET'])
def get_coupons():
    with open('user_data.json', 'r') as f:
        data = json.load(f)
    username = data['user_id']
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM Coupon WHERE customer_id = ?', (username,))
    coupons = cursor.fetchall()

    if not coupons:
        return jsonify({"message": "No coupons found for this user."}), 404

    store_coupons = {}
    for coupon in coupons:
        store_id = coupon[3]
        cursor.execute('SELECT * FROM Merchant WHERE id = ?', (store_id,))
        merchant_info = cursor.fetchall()
        store_name = merchant_info[0][2]
        expiration_date = datetime.strptime(coupon[2], '%Y-%m-%d')  # 更新日期解析格式
        discount_value = coupon[4]
        promotion = coupon[5]
        promotion_description = coupon[6]

        
        if store_id not in store_coupons:
            store_coupons[store_id] = {
                'count': 0,
                'earliest_expiration_date': expiration_date.strftime('%Y-%m-%d'),
                'coupons': []
            }
        
        store_coupons[store_id]['coupons'].append({
            'id': coupon[0],
            'username': coupon[1],
            'expiration_date': coupon[2],
            'store_id': coupon[3],
            'store_name': store_name,
            'discount_value': discount_value,
            'promotion': promotion,
            'promotion_description': promotion_description
        })
        
        store_coupons[store_id]['count'] += 1
        if expiration_date < datetime.strptime(store_coupons[store_id]['earliest_expiration_date'], '%Y-%m-%d'):
            store_coupons[store_id]['earliest_expiration_date'] = expiration_date.strftime('%Y-%m-%d')
    
    return jsonify(store_coupons), 200

@app.route('/coupons/<username>/search', methods=['GET'])
def search_coupons(username):
    store_name = request.args.get('store_name', '')

    db = get_db()
    cursor = db.cursor()
    cursor.execute('''
        SELECT Coupon.* 
        FROM Coupon
        JOIN Store ON Coupon.merchant_id = Store.id
        WHERE Coupon.customer_id = ? AND Store.name LIKE ?
    ''', (username, f'%{store_name}%'))
    coupons = cursor.fetchall()

    if not coupons:
        return jsonify({"message": "No coupons found for this user or store name."}), 404

    store_coupons = {}
    for coupon in coupons:
        store_id = coupon[3]
        expiration_date = datetime.strptime(coupon[2], '%Y-%m-%d %H:%M:%S')  # 更新日期解析格式
        discount_value = coupon[4]
        promotion = coupon[5]
        promotion_description = coupon[6]
        
        if store_id not in store_coupons:
            store_coupons[store_id] = {
                'count': 0,
                'earliest_expiration_date': expiration_date.strftime('%Y-%m-%d'),
                'coupons': []
            }
        
        store_coupons[store_id]['coupons'].append({
            'id': coupon[0],
            'username': coupon[1],
            'expiration_date': coupon[2],
            'store_id': coupon[3],
            'discount_value': discount_value,
            'promotion': promotion,
            'promotion_description': promotion_description
        })
        
        store_coupons[store_id]['count'] += 1
        if expiration_date < datetime.strptime(store_coupons[store_id]['earliest_expiration_date'], '%Y-%m-%d'):
            store_coupons[store_id]['earliest_expiration_date'] = expiration_date.strftime('%Y-%m-%d')
    
    return jsonify(store_coupons), 200

@app.route('/merchant/orders', methods=['GET'])
def get_merchant_orders():
    try:
        conn = sqlite3.connect('database.db', check_same_thread=False)
        cursor = conn.cursor()
        with open('user_data.json', 'r') as f:
            data = json.load(f)
        store_id = data.get('store_id')
        status = request.args.get('status')
        print("store_id, status:", store_id, status)
        if status and status != "全部":
            cursor.execute(
                'SELECT * FROM orders WHERE merchant_name = ? AND transaction_status = ? ORDER BY transaction_date ASC', 
                (store_id, status)
            )
        else:
            cursor.execute(
                'SELECT * FROM orders WHERE merchant_name = ? ORDER BY transaction_date ASC', 
                (store_id,)
            )
        orders = cursor.fetchall()
        print("orders:", orders)
        return jsonify([{
            'order_id': order[0],
            'merchant_name': order[1],
            'nickname': order[2],  # 新字段
            'book_name': order[3],
            'quantity': order[4],
            'total_amount': order[5],
            'transaction_date': order[6],
            'delivery_address': order[7],
            'transaction_status': order[8],
            'customer_id': order[9],   # 新字段
            'merchant_id': order[10]  # 新字段
        } for order in orders])
    except Exception as e:
        print(e)
        return jsonify({'error': f'Error querying orders: {e}'}), 500

@app.route('/orders', methods=['PATCH'])
def update_order_status():
    new_status = request.json.get('transaction_status')
    orderId = request.json.get('orderId')
    print(new_status, orderId)
    try:
        cursor.execute(
            'UPDATE orders SET transaction_status = ? WHERE order_id = ?',
            (new_status, orderId)
        )
        conn.commit()
        return jsonify({'message': 'Order status updated successfully.'}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'An error occurred while updating order status.'}), 500

@app.route('/customer/orders', methods=['GET'])
def get_customer_orders():
    try:
        user_data = read_user_data()
        user_id = user_data.get('user_id')
        
        if not user_id:
            return jsonify({'error': '用户未登录'}), 400
        print(type(request.args), request.args)
        book_name = request.args.get('book_name')
        merchant_name = request.args.get('merchant_name')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        status = request.args.get('status', '全部')

        query = 'SELECT * FROM orders WHERE customer_id = ?'
        params = [user_id]

        if status != '全部':
            query += ' AND transaction_status = ?'
            params.append(status)

        if book_name:
            query += ' AND book_name LIKE ?'
            params.append(f'%{book_name}%')
        if merchant_name:
            query += ' AND merchant_name LIKE ?'
            params.append(f'%{merchant_name}%')
        if start_date:
            query += ' AND transaction_date >= ?'
            params.append(start_date)
        if end_date:
            query += ' AND transaction_date <= ?'
            params.append(end_date)

        query += ' ORDER BY transaction_date ASC'

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        _orders = cursor.fetchall()
        orders = []
        for item in _orders:
            orders.append(dict(item))
        print(orders)

        # cursor.execute('SELECT merchant_id FROM Merchant WHERE id = ?', (row[1],))
        #     merchant_name = cursor.fetchall()

        return jsonify([{
            'order_id': order['order_id'],
            'merchant_name': order['merchant_name'],
            'nickname': order['nickname'],
            'book_name': order['book_name'],
            'quantity': order['quantity'],
            'total_amount': order['total_amount'],
            'transaction_date': order['transaction_date'],
            'delivery_address': order['delivery_address'],
            'transaction_status': order['transaction_status'],
            'coupon_id': order['customer_id'],
            'coupon_num': order['merchant_id']
        } for order in orders])
    except Exception as e:
        print(e)
        return jsonify({'error': f'Error querying orders: {e}'}), 500

if __name__ == '__main__':
    # app.run(debug=True, port=5000)
    app.run(host="0.0.0.0", debug=True, port=5000)