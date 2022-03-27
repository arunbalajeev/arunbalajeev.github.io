from flask_sqlalchemy import SQLAlchemy
from application import app

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    workerid = db.Column(db.String)
    assignmentid = db.Column(db.String)
    description = db.Column(db.String)
    audio_blob = db.Column(db.String)
    approved = db.Column(db.Integer)

    def __init__(self,workerid,assignmentid,description,audio_blob,approved):
        self.workerid = workerid
        self.assignmentid = assignmentid
	self.description = description
	self.audio_blob = audio_blob
	self.approved = approved
