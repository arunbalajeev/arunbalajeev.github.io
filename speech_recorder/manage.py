#!/usr/bin/env python
from flask.ext.script import Manager, Shell, Server
from application import app

manager = Manager(app)
manager.add_command("runserver", Server())
manager.add_command("shell", Shell())

@manager.command
def createdb():
    from application.models import db
    db.create_all()

manager.run()
