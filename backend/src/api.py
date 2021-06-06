import os
import flask
import flask_sqlalchemy
import flask_praetorian
import flask_cors
from model import User
import etherum

db = User._db
guard = flask_praetorian.Praetorian()
cors = flask_cors.CORS()

# Initialize flask app
app = flask.Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = 'top secret'
app.config['JWT_ACCESS_LIFESPAN'] = {'hours': 24}
app.config['JWT_REFRESH_LIFESPAN'] = {'days': 30}


# Token blacklist
blacklist = set()

#check if token is valid
def is_blacklisted(jti):
    return jti in blacklist


# Initialize the flask-praetorian instance for the app
guard.init_app(app, User, is_blacklisted=is_blacklisted)

# Initialize a local database
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.getcwd(), 'database.db')}"
db.init_app(app)

# Initializes CORS
cors.init_app(app)

# Set up some routes
@app.route('/api/')
def home():
    ret = etherum.get_last_transaction()
    return ret, 200

# Logs in user
@app.route('/api/register', methods=['POST'])
def register():    
    req = flask.request.get_json(force=True)
    _username = req.get('username', None)
    _password = req.get('password', None)
    _address = req.get('address', None)
    db.create_all() 
    new_user = User(
            username= _username,
            address= _address,
            password= guard.hash_password(_password),
            roles='operator'
    )

    if db.session.query(User).filter_by(username=_username).count() < 1:
        db.session.add(new_user)
        db.session.commit()
    
    user = guard.authenticate(_username, _password)
    ret = {'access_token': guard.encode_jwt_token(user)}
    return ret, 200

# Logs in user
@app.route('/api/login', methods=['POST'])
def login():
    req = flask.request.get_json(force=True)
    username = req.get('username', None)
    password = req.get('password', None)
    user = guard.authenticate(username, password)
    ret = {'access_token': guard.encode_jwt_token(user)}
    return ret, 200

# Disables an JWT
@app.route('/api/logout', methods=['GET'])
def logout():
    token = ((flask.request.headers.get('Authorization')).split())[1]
    data = guard.extract_jwt_token(token)
    blacklist.add(data['jti'])
    return flask.jsonify(message='token blacklisted ({})'.format(data))

# Refreshes an existing JWT
@app.route('/api/refresh', methods=['POST'])
def refresh():    
    old_token = request.get_data()
    new_token = guard.refresh_jwt_token(old_token)
    ret = {'access_token': new_token}
    return ret, 200

# Protected endpoint
@app.route('/api/protected')
@flask_praetorian.auth_required
def protected():
    return {'message': f'protected endpoint user: {flask_praetorian.current_user().username} address: {flask_praetorian.current_user().address})'}


# Run the example
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)