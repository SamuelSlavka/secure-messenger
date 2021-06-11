import flask_sqlalchemy

db = flask_sqlalchemy.SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    _db = db
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32), index = True)
    password = db.Column(db.String(128))
    address = db.Column(db.String(42))

    @property
    def rolenames(self):
        try:
            return self.roles.split(',')
        except Exception:
            return []

    @classmethod
    def lookup(cls, username):
        return cls.query.filter_by(username=username).one_or_none()

    @classmethod
    def lookupAddress(cls, address):
        return cls.query.filter_by(address=address).one_or_none()

    @classmethod
    def identify(cls, id):
        return cls.query.get(id)

    @property
    def identity(self):
        return self.id

