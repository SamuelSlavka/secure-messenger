""" Main program """
import os
import sys
import flask
import flask_praetorian
from flask_cors import CORS
from flask_cors import cross_origin
from model import User
import psql
import etherum
import constants

db = User.database
guard = flask_praetorian.Praetorian()

# Initialize flask app
app = flask.Flask(__name__)
app.debug = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'top secret'
app.config['JWT_ACCESS_LIFESPAN'] = {'hours': 24}
app.config['JWT_REFRESH_LIFESPAN'] = {'days': 30}


# Initializes cors
cors = CORS(app, resources={"/api/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'


# Token blacklist
blacklist = set()


def is_blacklisted(jti):
    """ check if token is valid """
    return jti in blacklist


# create psql message and contract database
psql.create_tables()

# Initialize a local user database
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.getcwd(), 'database.db')}"
db.init_app(app)

with app.app_context():
    db.create_all()

# create and deploy smart contract
res = etherum.init_eth_with_pk(constants.PK)

if not res['result']:
    sys.exit("Error connecting to ETH")
# if the contract is new reset user and message dbs
if res['new_contract']:
    with app.app_context():
        db.drop_all()
        db.create_all()
        psql.drop_users()

# Initialize the flask-praetorian instance for the app
guard.init_app(app, User, is_blacklisted=is_blacklisted)


@app.route('/api/')
@cross_origin()
def home():
    """ Returns last transaction on current blockchain """
    ret = etherum.get_last_transaction()
    return ret, 200


@app.route('/api/register', methods=['POST'])
@cross_origin()
def register():
    """ Creates user in db """
    req = flask.request.get_json(force=True)
    username = req.get('username', None)
    password = req.get('password', None)
    new_user = User(
            username=username,
            address="",
            password=guard.hash_password(password)
    )
    if username is None or password is None:
        return {'access_token': ''}, 400
    if db.session.query(User).filter_by(username=username).first() is not None:
        return {'access_token': ''}, 400

    db.session.add(new_user)
    db.session.commit()

    user = guard.authenticate(username, password)

    ret = {'access_token': guard.encode_jwt_token(user)}
    return ret, 200


@app.route('/api/login', methods=['POST'])
@cross_origin()
def login():
    """  Logs in user """
    req = flask.request.get_json(force=True)
    username = req.get('username', None)
    password = req.get('password', None)
    user = guard.authenticate(username, password)

    ret = {'access_token': guard.encode_jwt_token(user)}
    return ret, 200


@app.route('/api/info', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def info():
    """  Returns contract info """
    contract = psql.get_contract()
    ret = {'address': contract[1],
           'abi': contract[2],
           'userAddr': flask_praetorian.current_user().address,
           'username': flask_praetorian.current_user().username}
    return ret, 200


@app.route('/api/saveAddress', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def save_addr():
    """  Saves address and public key to the db """
    req = flask.request.get_json(force=True)
    address = req.get('address', None)
    pubkey = req.get('public', None)
    if address is not None and pubkey is not None:
        flask_praetorian.current_user().address = address
        db.session.commit()
        flask_praetorian.current_user().publicKey = pubkey
        db.session.commit()
    ret = {'result': 'success'}
    return ret, 200


@app.route('/api/contacts', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def contacts():
    """ Returns list of users that address has communicated with """
    req = flask.request.get_json(force=True)
    address = req.get('address', None)

    contact_list = psql.get_contacts(address)
    ret = {'result': contact_list}
    return ret, 200


@app.route('/api/savemessage', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def save_message():
    """ Saves message into db """
    req = flask.request.get_json(force=True)
    recv_address = req.get('recvAddress', None)
    send_address = req.get('sendAddress', None)
    recv_name = req.get('recvName', None)
    send_name = req.get('sendName', None)
    timestamp = req.get('timestamp', None)
    recv_contents = req.get('recvContents', None)
    send_contents = req.get('sendContents', None)

    psql.set_message(recv_address, send_address, recv_name, send_name,
                     timestamp, recv_contents, send_contents)

    ret = {'result': 'success'}
    return ret, 200


@app.route('/api/getmessages', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def get_message():
    """ Get all messages for user from db """
    req = flask.request.get_json(force=True)
    receive_address = req.get('recvAddress', None)
    send_address = req.get('sendAddress', None)

    messages = psql.get_messages(receive_address, send_address)
    ret = {'result': messages}
    return ret, 200


@app.route('/api/logout', methods=['POST'])
@cross_origin()
def logout():
    """ Disables an JWT """
    req = flask.request.get_json(force=True)
    token = req.get('token', None)
    data = guard.extract_jwt_token(token)
    blacklist.add(data['jti'])
    return {'result': 'token blacklisted'}


@app.route('/api/protected')
@cross_origin()
@flask_praetorian.auth_required
def protected():
    """ Returns current user username and password """
    return {"username": flask_praetorian.current_user().username,
            "address": flask_praetorian.current_user().address}


@app.route('/api/poor', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def poor():
    """ Sends some eth to address """
    req = flask.request.get_json(force=True)
    ret = {"result": 0}
    address = req.get('address', None)
    receipt = etherum.request_founds(address, constants.PK)
    if "error" not in receipt:
        ret = {"result": 1}
    return ret, 200


@app.route('/api/public', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def public_key():
    """ Return public key for combination of username and address """
    req = flask.request.get_json(force=True)
    result = {"result": 0}
    address = req.get('address', None)

    with app.app_context():
        ret = db.session.query(User.publicKey).filter(User.address == address).first()
    if len(ret) > 0:
        result = {"result": ret[0]}
    return result, 200


@app.route('/api/provider', methods=['POST'])
@cross_origin()
def get_provider():
    """ Returns provider URL """
    provider = {"result": constants.PROVIDER}
    return provider, 200


@app.route('/api/getUserAddress', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def get_addr():
    """ Return address for given username """
    req = flask.request.get_json(force=True)
    result = {"result": 0}

    username = req.get('username', None)
    with app.app_context():
        ret = db.session.query(User.address).filter(User.username == username).first()
    if ret is not None:
        result = {"result": ret[0]}
    return result, 200


@app.route('/api/isValid', methods=['POST'])
@cross_origin()
@flask_praetorian.auth_required
def is_valid():
    """ Return address for given username """
    req = flask.request.get_json(force=True)
    result = {"result": 0}

    username = req.get('username', None)
    address = req.get('address', None)
    with app.app_context():
        ret1 = db.session.query(User.address).filter(User.username == username).first()
        ret2 = db.session.query(User.address).filter(User.address == address).first()
    if ret1 is not None and ret2 is not None:
        if len(ret1) > 0 and ret1 == ret2:
            result = {"result": 1}
    return result, 200


# Run the server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
