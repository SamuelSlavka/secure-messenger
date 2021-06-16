import os, flask, flask_sqlalchemy, flask_praetorian, json, sys
import psql, etherum, constants

from flask_cors import CORS, cross_origin
from model import User

db = User._db
guard = flask_praetorian.Praetorian()

# Initialize flask app
app = flask.Flask(__name__)
app.debug = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'top secret'
app.config['JWT_ACCESS_LIFESPAN'] = {'hours': 24}
app.config['JWT_REFRESH_LIFESPAN'] = {'days': 30}


# Initializes CORS
cors = CORS(app, resources={"/api/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'


# Token blacklist
blacklist = set()

#check if token is valid
def is_blacklisted(jti):
    return jti in blacklist

# create psql message and contract database
psql.createTables()

# Initialize a local user database
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.getcwd(), 'database.db')}"
db.init_app(app)

with app.app_context():
    db.create_all()

# create and deploy smart contract
res = etherum.init_eth_with_PK(constants.PK)

if not res['result']:
    sys.exit("Error connecting to ETH")
# if the contract is new reset user and message dbs    
if res['new_contract']:
    with app.app_context():
        db.drop_all()
        db.create_all()        
        psql.dropUsers()

# Initialize the flask-praetorian instance for the app
guard.init_app(app, User, is_blacklisted=is_blacklisted)

# Returns last transaction on current blockchain
@app.route('/api/')
@cross_origin()
def home():
    ret = etherum.get_last_transaction()
    return ret, 200

# Creates user in db
@app.route('/api/register', methods=['POST'])
@cross_origin()
def register():
    try:
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
    except:
        print(sys.exc_info()[0])
        return {'result': sys.exc_info()[0]} 

# Logs in user
@app.route('/api/login', methods=['POST'])
@cross_origin()
def login():
    try:
        req = flask.request.get_json(force=True)
        username = req.get('username', None)
        password = req.get('password', None)
        address = req.get('address', None)
        user = guard.authenticate(username, password)

        ret = {'access_token': guard.encode_jwt_token(user)}
        return ret, 200
    except:
        print(sys.exc_info()[0])
        return {'result': sys.exc_info()[0]} 

# Returns contract info
@app.route('/api/info', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def info():
    try:
        res = psql.getContract()
        ret = {'address': res[1], 'abi':res[2], 'userAddr':flask_praetorian.current_user().address, 'username':flask_praetorian.current_user().username}
        return ret, 200
    except:
        print(sys.exc_info()[0])
        return {'result': sys.exc_info()[0]} 

# Saves address and public key to the db
@app.route('/api/saveAddress', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def saveAddr():
    try:
        req = flask.request.get_json(force=True)
        address = req.get('address', None)
        publicKey = req.get('public', None)
        if address is not None and publicKey is not None:
            flask_praetorian.current_user().address = address
            db.session.commit()
            flask_praetorian.current_user().publicKey = publicKey
            db.session.commit()
        ret = {'result': 'success'}
        return ret, 200
    except:
        print(sys.exc_info()[0])
        return {'result': sys.exc_info()[0]} 

# Returns list of users that address has communicated with
@app.route('/api/contacts', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def contacts():
    try:
        req = flask.request.get_json(force=True)
        address = req.get('address', None)
        
        res = psql.getContacts(address)
        ret = {'result':res}
        return ret, 200
    except:
        print(sys.exc_info()[0])
        return {'result': sys.exc_info()[0]}

# Saves message into db
@app.route('/api/savemessage', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def savemessage():
    try:
        req = flask.request.get_json(force=True)
        recvAddress = req.get('recvAddress', None)
        sendAddress = req.get('sendAddress', None)
        recvName = req.get('recvName', None)
        sendName = req.get('sendName', None)    
        timestamp = req.get('timestamp', None)
        recvContents = req.get('recvContents', None)
        sendContents = req.get('sendContents', None)
        
        psql.setMessage(recvAddress, sendAddress, recvName, sendName, timestamp, recvContents, sendContents)

        ret = {'result': 'success'}
        return ret, 200
    except:
        print(sys.exc_info()[0])
        return {'result': sys.exc_info()[0]}

# Get all messages for user from db
@app.route('/api/getmessages', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def getmessage():
    try:
        req = flask.request.get_json(force=True)
        raddress = req.get('recvAddress', None)
        saddress = req.get('sendAddress', None)

        res = psql.getMessages(raddress, saddress)
        ret = {'result':res}
        return ret, 200
    except:
        print(sys.exc_info()[0])
        return {'result': sys.exc_info()[0]}

# Disables an JWT
@app.route('/api/logout', methods=['POST'])
@cross_origin()
def logout():
    try:
        req = flask.request.get_json(force=True)    
        token = req.get('token', None)        
        data = guard.extract_jwt_token(token)
        blacklist.add(data['jti'])
        return {'result':'token blacklisted'}
    except:
        print(sys.exc_info()[0])
        return {'result': sys.exc_info()[0]}


# Retruns current user username and password
@app.route('/api/protected')
@cross_origin()
@flask_praetorian.auth_required
def protected():
    return {"username": flask_praetorian.current_user().username, "address": flask_praetorian.current_user().address}


# Sends some eth to address
@app.route('/api/poor', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def poor():
    try:
        req = flask.request.get_json(force=True)
        ret = {"result": 0} 
        address = req.get('address', None)             
        res = etherum.reqest_founds(address,constants.PK)      
        ret = {"result": 1}
        return ret, 200
    except:
        print(sys.exc_info()[0])
        return {'result': sys.exc_info()[0]}

# Return public key for combination of username and address
@app.route('/api/public', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def publicKey():
    try:
        req = flask.request.get_json(force=True)
        res = {"result": 0}

        address = req.get('address', None)           
        username = req.get('username', None)
        with app.app_context():
            ret = db.session.query(User.publicKey).filter(User.address == address).first()
        if (len(ret) > 0):
            res = {"result": ret[0]}        
        return res, 200
    except:
        print(sys.exc_info()[0])
        return {'result': sys.exc_info()[0]}

# Returns provider URL
@app.route('/api/provider', methods=['POST'])
@cross_origin()
def getProvider():  
    res = {"result": constants.PROVIDER}        
    return res, 200

# Return address for given username
@app.route('/api/getUserAddress', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def addressGetter():
    try:
        req = flask.request.get_json(force=True)
        res = {"result": 0}
        
        username = req.get('username', None)
        with app.app_context():
            ret = db.session.query(User.address).filter(User.username == username).first()
        if ret is not None:
            res = {"result": ret[0]}        
        return res, 200
    except:
        print(sys.exc_info()[0])
        return {'result': sys.exc_info()[0]}



# Return address for given username
@app.route('/api/isValid', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def isValid():
    try:    
        req = flask.request.get_json(force=True)
        res = {"result": 0}
        
        username = req.get('username', None)
        address = req.get('address', None)
        with app.app_context():
            ret1 = db.session.query(User.address).filter(User.username == username).first()
            ret2 = db.session.query(User.address).filter(User.address == address).first()
        if ret1 is not None and ret2 is not None:
            if (len(ret1) > 0 and ret1 == ret2):
                res = {"result": 1}        
        return res, 200
    except:
        print(sys.exc_info()[0])
        return {'result': sys.exc_info()[0]}



# Run the server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)