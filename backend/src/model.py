""" DB model """
import flask_sqlalchemy

db = flask_sqlalchemy.SQLAlchemy()

class User(db.Model):
    """ User class for PSQL """
    __tablename__ = 'users'
    database = db
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32), index = True)
    password = db.Column(db.String(128))
    publicKey = db.Column(db.String(128))
    address = db.Column(db.String(42))

    @classmethod
    def lookup(cls, username):
        """ Lookup user by username """
        return cls.query.filter_by(username=username).one_or_none()

    @classmethod
    def lookup_address(cls, address):
        """ Lookup address """
        return cls.query.filter_by(address=address).one_or_none()

    @classmethod
    def identify(cls, user_id):
        """ Lookup usr id """
        return cls.query.get(user_id)

    @property
    def identity(self):
        """ Return current user """
        return self.id
