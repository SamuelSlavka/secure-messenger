import os
import flask
import flask_sqlalchemy
import flask_praetorian
import flask_cors

db = flask_sqlalchemy.SQLAlchemy()


from model import User

guard = flask_praetorian.Praetorian()
cors = flask_cors.CORS()


# Initialize flask app for the example
app = flask.Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = 'top secret'
app.config['JWT_ACCESS_LIFESPAN'] = {'hours': 24}
app.config['JWT_REFRESH_LIFESPAN'] = {'days': 30}

# Initialize the flask-praetorian instance for the app
guard.init_app(app, User)

# Initialize a local database for the example
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.getcwd(), 'database.db')}"
db.init_app(app)

# Initializes CORS so that the api_tool can talk to the example app
cors.init_app(app)

# Set up some routes for the example
@app.route('/api/')
def home():
    return {"Hello": "World"}, 200

# Logs in user
@app.route('/api/register', methods=['POST'])
def register():    
    req = flask.request.get_json(force=True)
    _username = req.get('username', None)
    password = req.get('password', None)
    db.create_all()    
    new_user = User(
            username=_username,
            password=guard.hash_password(password),
            roles='operator'
    )
    
    if db.session.query(User).filter_by(username=_username).count() < 1:            
        db.session.add(new_user)
        db.session.commit()
    
    user = guard.authenticate(_username, password)
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

# Refreshes an existing JWT
@app.route('/api/refresh', methods=['POST'])
def refresh():    
    old_token = request.get_data()
    new_token = guard.refresh_jwt_token(old_token)
    ret = {'access_token': new_token}
    return ret, 200

# Disables an JWT
@app.route('/api/logout', methods=['POST'])
def refresh():    
    old_token = request.get_data()
    data = guard.extract_jwt_token(old_token)
    blacklist.add(data['jti'])
    ret = flask.jsonify(message='token blacklisted ({})'.format(req['token']))
    return ret, 200

# Protected endpoint
@app.route('/api/protected')
@flask_praetorian.auth_required
def protected():
    return {'message': f'protected endpoint (allowed user {flask_praetorian.current_user().username})'}


# Run the example
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)