from flask import Flask, render_template, request, redirect, url_for, abort, session
from jinja2 import environmentfilter
from flask_sqlalchemy import SQLAlchemy
import jinja2
import glob
import json
import sqlite3
from sqlalchemy.engine import create_engine
import unicodedata
import csv
from sqlalchemy import text
from boto.mturk.connection import MTurkConnection
from boto.mturk.question import ExternalQuestion
from boto.mturk.price import Price
import cgi
import cgitb
import numpy as np
import logging
cgitb.enable()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'F34TF$($e34E';
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///example.db'
app.config['SESSION_TYPE']='image_keys'
environment = jinja2.Environment(app)
environment.globals.update(zip=zip)
environment.filters['glob'] = glob
db = SQLAlchemy(app)
########Logging##########
fh = logging.FileHandler('server.log')
#fh.setFormatter(formatter)
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
logger.addHandler(fh)
#######################
AWS_ACCESS_KEY_ID = 'AKIAJRTNSHRM2DJCP23Q'
AWS_SECRET_ACCESS_KEY = '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'
HOST = 'mechanicalturk.sandbox.amazonaws.com'

@app.route('/')
def home():
    logger.info("\nRender main page")
    try:
        session['worker_id'] = request.args.get("worker_id","None")
        session['image_id'] = request.args.get('image_id'))
        logger.info("Image ID: "+str(session['image_id']))
	session['image_id'] = "https://data.vision.ee.ethz.ch/arunv/obj_desc_annotator/cityscape/zurich/"+str(session['image_id'])+".png"
        return render_template('index.html',art=session['image_id'])
    except Exception as e:
    	logging.exception('Got exception on main handler')
    	raise e

########### GET data from client and save to DB ###############
@app.route('/static/savedesc/', methods=['POST','GET'])
def savedesc():
    logger.info("Render Saving to DB")
    try:
    	data_save = request.json
	#data_save = request.get_json()
	if data_save!=None:
		session['data_save'] = data_save
	else:
		data_save = session['data_save']
    	#data = json.loads(data)
   	with open('data.txt', 'w') as outfile:
        	json.dump(data_save, outfile)

    	# We explicitly retrieve the object's attribute values
	workerid = str(session['worker_id'])
    	imageid = str(session['image_id'])#data['video_id']
    	#assignmentid = data_save['assignment_id']
    	boxX = data_save['boxX']
    	boxY = data_save['boxY']
    	boxW = data_save['boxW']
    	boxH = data_save['boxH']
    	boxcolor = data_save['boxcolor']
    	boxdesc = data_save['boxdesc']
	box_attr_obj = data_save['box_attr_obj']
	box_attr_color = data_save['box_attr_color']
	box_attr_numinst = data_save['box_attr_numinst']
	box_attr_action = data_save['box_attr_action']
	box_attr_shape = data_save['box_attr_shape']
	box_us_dist = data_save['box_us_dist']
	box_us_road = data_save['box_us_road']
	box_us_direc = data_save['box_us_direc']
	box_us_rot = data_save['box_us_rot']
	box_us_speed = data_save['box_us_speed']
	box_us_desc = data_save['box_us_desc']
	box_oth_dist = data_save['box_oth_dist']
	box_oth_road = data_save['box_oth_road']
	box_oth_direc = data_save['box_oth_direc']
	box_oth_rot = data_save['box_oth_rot']
	box_oth_speed = data_save['box_oth_speed']
	box_oth_desc = data_save['box_oth_desc']
    	for j in range(len(boxX)):
		str1=""
		a=box_oth_dist[j]['value']
		logger.info(a);
		for bod in box_oth_dist[j]['value']:
			if 'key' in bod:
				str1= str1+bod[u'key']+":";
				str1=str1+bod[u'value']+"_";
		str1 = str1[:-1]
		str2=""
		for bod in box_oth_road[j]['value']:
			if 'key' in bod:
				str2= str2+bod[u'key']+":";
				str2=str2+bod[u'value']+"_";
		str2 = str2[:-1]
		str3=""
		for bod in box_oth_direc[j]['value']:
			if 'key' in bod:
				str3= str3+bod[u'key']+":";
				str3=str3+bod[u'value']+"_";
		str3= str3[:-1]
		str4=""
		for bod in box_oth_rot[j]['value']:
			if 'key' in bod:
				str4= str4+bod[u'key']+":";
				str4=str4+bod[u'value']+"_";
		str4 = str4[:-1]
		str5=""
		for bod in box_oth_speed[j]['value']:
			if 'key' in bod:
				str5= str5+bod[u'key']+":";
				str5=str5+bod[u'value']+"_";
		str5 = str5[:-1]
		str6=""
		for bod in box_oth_desc[j]['value']:
			if 'key' in bod:
				str6=str6+bod[u'value']+"_";
		str6 = str6[:-1]
    		user = User(workerid,imageid,boxX[j]['key'], boxX[j]['value'],boxY[j]['value'],boxW[j]['value'],boxH[j]['value'],boxcolor[j]['value'],boxdesc[j]['value'],box_attr_obj[j]['value'],box_attr_color[j]['value'],box_attr_numinst[j]['value'],box_attr_action[j]['value'],box_attr_shape[j]['value'],box_us_dist[j]['value'],box_us_road[j]['value'],box_us_direc[j]['value'],box_us_rot[j]['value'],box_us_speed[j]['value'],box_us_desc[j]['value'],str1,str2,str3,str4,str5,str6,0)
    		db.session.add(user)
    		db.session.commit()
	return redirect(url_for('message', username="arun"))
    except Exception as e:
    	logging.exception('Got exception on Saving handler')
    	raise e

from models import *


@app.route('/message/<username>')
def message(username):
    #user = User.query.filter_by(workerid=username).first_or_404()
    return render_template('message.html', username="arun",
                                           message="Done")

############## Visualize the HIT - post processing and pruning the annotation ###########
@app.route('/static/visualize/', methods=['POST','GET'])
def visalize():
    logger.info("Visualizing...")
    try:
	    imageid = "https://data.vision.ee.ethz.ch/arunv/obj_desc_annotator/cityscape/zurich/"+request.args.get("image_id", "")+".png"
	    sqlstring = "select user.boxX,user.boxY,user.boxW,user.boxH,user.color,user.description from user where user.imageid = '"+imageid+"' and user.workerid='"+request.args.get("worker_id","")+"'"
	    sql = text(sqlstring)
	    result = db.engine.execute(sql).fetchall()
	    #result = User.query.filter(User.assignmentid=='3S4AW7T80CP7VW6AK65JFG2VBLTL4L').first()
	    giv_query = result[0][2]
	    xbox = []
	    ybox = []
	    wbox = []
	    hbox = []
	    colbox = []
	    descbox = []
	    for row in result:
		xbox.append(row[0])
		ybox.append(row[1])
		wbox.append(row[2])
		hbox.append(row[3])
		colbox.append(row[4])
		descbox.append(row[5])
	    return render_template('visualize.html',imageId=imageid,xbox=xbox,ybox=ybox,wbox=wbox,hbox=hbox,colbox=colbox,descbox=descbox)
    except Exception as e:
    	logging.exception('Got exception on Saving handler')
    	raise e

@app.route('/static/_accept_assignment/', methods=['POST','GET'])
def _accept_assignment():

    data = str(request.args.get("assignment_id", ""))
    print data
    connection = MTurkConnection(aws_access_key_id=AWS_ACCESS_KEY_ID,
                            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                             host=HOST)
    connection.approve_assignment(data, feedback=None)
    return json.dumps({'success':True})

@app.route('/static/_reject_assignment/', methods=['POST','GET'])
def _reject_assignment():
    data = str(request.args.get("assignment_id", ""))
    connection = MTurkConnection(aws_access_key_id=AWS_ACCESS_KEY_ID,
                             aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                             host=HOST)
    connection.reject_assignment(data, feedback=None)
    #return redirect(url_for('home'))
    return json.dumps({'success':True})


if __name__ == '__main__':
	app.debug = True
	app.run()
