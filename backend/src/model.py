""" DB model """
import flask_sqlalchemy

db = flask_sqlalchemy.SQLAlchemy()


class User(db.Model):
    """ User class for PSQL """
    __tablename__ = 'users'
    database = db
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32), index=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    publicKey = db.Column(db.String(128))
    address = db.Column(db.String(42))
    rolenames = db.Column(db.String(42))

    @classmethod
    def lookup(cls, username):
        """ Lookup user by username """
        return cls.query.filter_by(username=username).one_or_none()

    @classmethod
    def lookup_address(cls, db, address):
        """ Lookup address by address """
        return db.session.query(User.address).filter(User.address == address).one_or_none()

    @classmethod
    def lookup_user_address(cls, db, username):
        """ Lookup address by username """
        return db.session.query(User.address).filter(User.username == username).one_or_none()

    @classmethod
    def lookup_address_pubkey(cls, db, address):
        """ Lookup address """
        return db.session.query(User.publicKey).filter(User.address == address).one_or_none()

    @classmethod
    def identify(cls, id):
        """ Return current user """
        return cls.query.get(id)

    @property
    def identity(self):
        return self.id
