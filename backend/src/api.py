import os
import flask
import flask_sqlalchemy
import flask_praetorian
from flask_cors import CORS, cross_origin
from model import User
import psql
import etherum
import json
import sys

db = User._db
guard = flask_praetorian.Praetorian()

# Initialize flask app
app = flask.Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = 'top secret'
app.config['JWT_ACCESS_LIFESPAN'] = {'hours': 24}
app.config['JWT_REFRESH_LIFESPAN'] = {'days': 30}

# Initializes CORS
cors = CORS(app, resources={"/api/*": {"origins": "*"}})

# Token blacklist
blacklist = set()

#check if token is valid
def is_blacklisted(jti):
    return jti in blacklist

# create psql database and tables
psql.createTables()

# create and deploy smart contract
contract = etherum.build_and_deploy()
if not contract:
    sys.exit("Error connecting")
psql.setContract(contract['contract_address'], json.dumps(contract['abi']))

# Initialize the flask-praetorian instance for the app
guard.init_app(app, User, is_blacklisted=is_blacklisted)

# Initialize a local database
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.getcwd(), 'database.db')}"
db.init_app(app)

with app.app_context():
    db.create_all()

# Set up some routes
@app.route('/api/')
@cross_origin()
def home():
    ret = etherum.get_last_transaction()
    return ret, 200

# Logs in user
@app.route('/api/register', methods=['POST'])
@cross_origin()
def register():
    req = flask.request.get_json(force=True)
    username = req.get('username', None)
    password = req.get('password', None)
    new_user = User(
            username= username,
            address= "",
            password= guard.hash_password(password)
    )
    if username is None or password is None:
        return {'access_token':''},400
    if db.session.query(User).filter_by(username = username).first() is not None:
        return {'access_token':''},400

    db.session.add(new_user)
    db.session.commit()

    user = guard.authenticate(username, password)
    
    ret = {'access_token': guard.encode_jwt_token(user)}
    return ret, 200

# Logs in user
@app.route('/api/login', methods=['POST'])
@cross_origin()
def login():
    req = flask.request.get_json(force=True)
    username = req.get('username', None)
    password = req.get('password', None)
    address = req.get('address', None)
    user = guard.authenticate(username, password)

    ret = {'access_token': guard.encode_jwt_token(user)}
    return ret, 200

# Adds address and return contract info
@app.route('/api/info', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def info():
    req = flask.request.get_json(force=True)        
    address = req.get('address', None)
    if address is not None:
        flask_praetorian.current_user().address = address
        db.session.commit()
    
    res = psql.getContract()

    ret = {'address': res[1], 'abi':res[2], 'userAddr':flask_praetorian.current_user().address, 'userName':flask_praetorian.current_user().username}
    return ret, 200


# Saves message into db
@app.route('/api/savemessage', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def savemessage():
    req = flask.request.get_json(force=True)
    contents = req.get('contents', None)
    name = req.get('recName', None)
    address = req.get('recAddress', None)
    timestamp = req.get('timestamp', None)

    psql.setMessage(address, name, timestamp, contents)

    ret = {'result': 'success'}
    return ret, 200

# Gets message from db
@app.route('/api/getmessage', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def getmessage():
    req = flask.request.get_json(force=True)
    name = req.get('recName', None)
    address = req.get('recAddress', None)
    timestamp = req.get('timestamp', None)
    
    #flask_praetorian.current_user().username
    #flask_praetorian.current_user().address
    
    res = psql.getMessage(address, name, timestamp)

    ret = {'result':res}
    return ret, 200

# Disables an JWT
@app.route('/api/logout', methods=['POST'])
@cross_origin()
def logout():
    req = flask.request.get_json()        
    if req is not None:
        token = req.get('token', None)        
        data = guard.extract_jwt_token(token)
        blacklist.add(data['jti'])
    return flask.jsonify(message='token blacklisted')

# Refreshes an existing JWT
@app.route('/api/refresh', methods=['POST'])
@cross_origin()
def refresh():    
    old_token = request.get_data()
    new_token = guard.refresh_jwt_token(old_token)
    ret = {'access_token': new_token}
    return ret, 200

# Protected endpoint
@app.route('/api/protected')
@cross_origin()
@flask_praetorian.auth_required
def protected():
    return {"user": flask_praetorian.current_user().username, "address": flask_praetorian.current_user().address}


# Run the example
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)