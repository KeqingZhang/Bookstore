<>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        作者: {book[5]}
                      </Typography>
                      <br />
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        描述: {book[4]}
                      </Typography>
                      <br />
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        价格: {book[2]}
                      </Typography>
                      {/* {/* <br /> */}
                      {/* <TextField
                        type="number"
                        label="调整价格"
                        onChange={(e) =>
                          handlePriceAdjustment(book.id, e.target.value)
                        }
                      /> */}
                      <TextField
                        type="number"
                        label="调整价格"
                        value={newPrices[book[0]] || ""}
                        onChange={(e) =>
                          handlePriceChange(book[0], e.target.value)
                        }
                        sx={{ mb: 1 }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handlePriceAdjustment(book[0])}
                      ></Button>
                      <br />
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        库存: {book[6]}
                      </Typography>
                      <br />
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        分类: {book[8]}
                      </Typography>
                    </>
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///books.db'
db = SQLAlchemy(app)

# 配置 CORS
CORS(app)

# 数据库模型
class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    book_name = db.Column(db.String(100), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    inventory = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(50), nullable=False)

# 初始化数据库
with app.app_context():
    db.create_all()

# 路由和处理函数
@app.route('/books', methods=['GET'])
def get_books():
    books = Book.query.all()
    return jsonify([{
        'id': book.id,
        'book_name': book.book_name,
        'author': book.author,
        'description': book.description,
        'price': book.price,
        'inventory': book.inventory,
        'category': book.category
    } for book in books])

@app.route('/books/<int:book_id>', methods=['DELETE'])
def remove_book(book_id):
    book = Book.query.get_or_404(book_id)
    db.session.delete(book)
    db.session.commit()
    return jsonify(message='Book removed successfully'), 200

@app.route('/books/<int:book_id>', methods=['PATCH'])
def adjust_price(book_id):
    book = Book.query.get_or_404(book_id)
    new_price = request.json.get('price')
    if new_price is None:
        return jsonify(message='Price is required'), 400

    try:
        new_price = float(new_price)
    except ValueError:
        return jsonify(message='Invalid price format'), 400

    book.price = new_price
    db.session.commit()
    return jsonify(message='Price adjusted successfully'), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
