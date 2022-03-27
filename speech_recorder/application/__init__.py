from flask import Flask, render_template, request, redirect, url_for, abort, session
from jinja2 import environmentfilter
from flask_sqlalchemy import SQLAlchemy
import jinja2
import glob
import simplejson as json
import sqlite3
from sqlalchemy.engine import create_engine
import unicodedata
import csv
from sqlalchemy import text
from boto.mturk.connection import MTurkConnection
from boto.mturk.question import ExternalQuestion
from boto.mturk.price import Price
import cgi,json
import cgitb
import numpy as np
import logging
from flask import jsonify
import struct,base64,time
cgitb.enable()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'F34TF$($e34D';
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///example.db'
app.config['SESSION_TYPE']='speech_keys'
environment = jinja2.Environment(app)
environment.globals.update(zip=zip)
environment.filters['glob'] = glob
db = SQLAlchemy(app)
#data = None
#cluster_data=None
#giv_query=None
#giv_title=None
#annotated_data=None
########Logging##########
fh = logging.FileHandler('server.log')
#fh.setFormatter(formatter)
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
logger.addHandler(fh)
#######################
AWS_ACCESS_KEY_ID = 'AKIAIDRXBVZ5SZWLI2WA'#'AKIAJRTNSHRM2DJCP23Q'
AWS_SECRET_ACCESS_KEY = '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'#'HjxzOrk+DLCJFyi+C8mBt0XRgNQaJA0mBXuyu9lK'
HOST = 'mechanicalturk.amazonaws.com'

@app.route('/')
def home():
    logger.info("\nRender main page")
    try:
        #global giv_query
        #global giv_title
        if request.args.get("assignmentId") == "ASSIGNMENT_ID_NOT_AVAILABLE":
            # worker hasn't accepted the HIT (task) yet
            pass
        else:
            # worked accepted the task
            pass

        worker_id = request.args.get("workerId", "")
        #if worker_id in get_worker_ids_past_tasks():
            # you might want to guard against this case somehow
        #    pass

        session['worker_id'] = request.args.get("workerId","None")
        session['speech_id'] = request.args.get("speech_id","None_0_0")
        session['assignment_id'] = request.args.get("assignmentId", "ASSIGNMENT_ID_NOT_AVAILABLE")
        session['hit_id'] = request.args.get("hitId", "None")
        session['image_id'] = request.args.get('image_id')
        logger.info("Worker ID: "+session['worker_id'])
        logger.info("Assignment ID: "+session['assignment_id'])
        logger.info("HIT ID: "+session['hit_id'])
        logger.info("Image ID: "+str(session['image_id']))
	session['video_tag'] = "_".join(str(session['image_id']).split("_")[:2])
	session['video_folder'] = str(session['image_id']).split("_")[0]
        #session['title'] = request.args.get('title')
        #giv_query = session['video_id']
        #giv_query = str(giv_query).replace('_',' ')
        #giv_title = session['title']
        #giv_title = str(giv_title).replace('_',' ')
	session['descriptions']=[]
	if str(session['speech_id']).split("_")[0]=="gref":
		session['ref_id']=int(str(session['speech_id']).split("_")[2])
		csvreader0 = csv.reader(open('application/static/csv/gref_val.csv','r'), delimiter="\t")
		for enum,l0 in enumerate(csvreader0):
			if enum<session['ref_id']+5 and enum>=session['ref_id']:
				session['descriptions'].append(l0[4])
	elif str(session['speech_id']).split("_")[0]=="toyota":
		session['ref_id']=int(str(session['speech_id']).split("_")[2])
		csvreader0 = csv.reader(open('application/static/csv/toyota_samples.csv','r'), delimiter=",")
		for enum,l0 in enumerate(csvreader0):
			if enum<session['ref_id']+5 and enum>=session['ref_id']:
				session['descriptions'].append(l0[5])
	elif str(session['speech_id']).split("_")[0]=="dref":
		session['ref_id']=int(str(session['speech_id']).split("_")[2])
		csvreader0 = csv.reader(open('application/static/csv/drivingref_AMT.csv','r'), delimiter="\t")
		for enum,l0 in enumerate(csvreader0):
			if enum<session['ref_id']+5 and enum>=session['ref_id']:
				session['descriptions'].append(l0[0])
	else:
		session['ref_id']=0;
		csvreader0 = csv.reader(open('application/static/csv/gref_val.csv','r'), delimiter="\t")
		for enum,l0 in enumerate(csvreader0):
			if enum<session['ref_id']+5 and enum>=session['ref_id']:
				session['descriptions'].append(l0[4])
	#result = db.engine.execute(sql).fetchall()
	#result = User.query.filter(User.assignmentid=='3S4AW7T80CP7VW6AK65JFG2VBLTL4L').first()
	#giv_query = result[0][2]
        return render_template('index.html', session=session)
    except Exception as e:
    	logging.exception('Got exception on main handler')
    	raise e

@app.route('/static/saveaudio/', methods=['POST','GET'])
def saveaudio():
    logger.info("Render Saving to DB")
    try:
    	session['data_save'] = request.json
	#logger.info(request.json)
	#logger.info(request.files['file'].filename)
	#logger.info(request.files['file'].content_type)
	#logger.info(request.files['file'].name)
	#data_save = request.get_json()
	'''if data_save!=None:
		session['data_save'] = data_save
	else:
		data_save = session['data_save']
    	#data = json.loads(data)
   	with open('data.txt', 'w') as outfile:
        	json.dump(data_save, outfile)'''

    	# We explicitly retrieve the object's attribute values
    	#workerid = str(session['worker_id'])#data['worker_id']#
	workerid = str(session['worker_id'])
    	imageid = str(session['image_id'])#data['video_id']
    	boxdesc = session['data_save']['blob']
	session['count']=0
	if session['data_save']['submitted']!=-1:
		#blob = bin(int(boxdesc.decode('base64')))
		for x in range(len(session['data_save']['blob'])):
			blob=base64.decodestring(session['data_save']['blob'][x])
			#logger.info("Entered for mp3 save")
			if str(session['speech_id']).split("_")[0]=="gref":
				with open("speech_output/output_"+str(session['ref_id']+x)+"_"+str(session['assignment_id'])+".mp3", "wb") as output_file:
			    		output_file.write(blob)
			if str(session['speech_id']).split("_")[0]=="toyota":
				with open("speech_output_toyota/output_"+str(session['ref_id']+x)+"_"+str(session['assignment_id'])+".mp3", "wb") as output_file:
			    		output_file.write(blob)
			if str(session['speech_id']).split("_")[0]=="dref":
				with open("speech_output_dref/output_"+str(session['ref_id']+x)+"_"+str(session['assignment_id'])+".mp3", "wb") as output_file:
			    		output_file.write(blob)
		logger.info("Saving to DB")
		logger.info("Number: "+str(len(session['data_save']['blob'])))
	    	for j in range(len(session['data_save']['blob'])):
			#logger.info("Entered for DB save")
			if str(session['speech_id']).split("_")[0]=="gref":
				speech_output="speech_output/output_"+str(session['ref_id']+j)+"_"+str(session['assignment_id'])+".mp3"
			if str(session['speech_id']).split("_")[0]=="dref":
				speech_output="speech_output_dref/output_"+str(session['ref_id']+j)+"_"+str(session['assignment_id'])+".mp3"
			user = User(session['worker_id'],session['assignment_id'],str(session['descriptions'][j]),speech_output,0)
	    		db.session.add(user)
	    		db.session.commit()
	else:
		sqlstring = "select user.assignmentid from user"
	    	sql = text(sqlstring)
	    	result = db.engine.execute(sql).fetchall()	
		for row in result:
			if row[0]==session['assignment_id']:
				session['count']=session['count']+1;
		if session['count']==5:
			session['data_save']['status']="OK";
			logger.info("Checking for the saved ones.")
			return json.dumps({'status':'OK'})
	return json.dumps({'status':'Fail'})#redirect(url_for('message', username="arun"))
    except Exception as e:
    	logging.exception('Got exception on Saving handler')
    	raise e

@app.route('/message/<username>')
def message(username):
    #user = User.query.filter_by(workerid=username).first_or_404()
    return render_template('message.html', username="arun",
                                           message="Done")

from models import *
@app.route('/static/acceptassignment/', methods=['POST','GET'])
def acceptassignment():
    logger.info("Accepting Assignment...")
    try:
	    jsonassid = request.json
    	    connection = MTurkConnection(aws_access_key_id=AWS_ACCESS_KEY_ID,
                            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                             host=HOST)
	    hits=connection.get_reviewable_hits(status='Reviewable', sort_by='Expiration', sort_direction='Descending', page_size=50, page_number=1)
    	    admin = User.query.filter_by(assignmentid=jsonassid['assID'],approved=0).first()
	    admin.approved=1
	    db.session.commit()
    	    for hit in hits:
            	#print(hit.HITId)
        	for a in connection.get_assignments(hit.HITId):
            		if a.AssignmentStatus == 'Submitted' and a.AssignmentId==jsonassid['assID']:
    	    			connection.approve_assignment(jsonassid['assID'], feedback=None)
				logger.info("Success! Assignment accepted...")
	    return redirect(url_for('message', username="arun"))
    except Exception as e:
    	logging.exception('Got exception on Accepting handler')
    	raise e

@app.route('/static/removerow/', methods=['POST','GET'])
def removerow():
    logger.info("Removing Row from DB...")
    try:
	    jsonassid = request.json
	    peter = User.query.filter_by(assignmentid=jsonassid['assID']).first()
	    db.session.delete(peter)
	    db.session.commit()
	    return redirect(url_for('message', username="arun"))
    except Exception as e:
    	logging.exception('Got exception on Removing handler')
    	raise e

@app.route('/static/visualize/', methods=['POST','GET'])
def visalize():
    logger.info("Visualizing...")
    try:
	    #giv_query = session['video_id']
	    #giv_query = str(giv_query).replace('_',' ')
	    #assignId = request.args.get("visualizeId", "")
	    #assignId = get_reviewable_video_id(page_size=100,return_all=False)
	    #assignId=assignId[1]
	    #imageid = "https://data.vision.ee.ethz.ch/arunv/obj_desc_annotator/ours/2017_04_26/"+request.args.get("assignmentId", "")+".png"
	    session['assignmentId']=request.args.get("assignmentId", "")
	    sqlstring = "select user.audio_blob,user.workerid,user.assignmentid,user.approved from user where user.assignmentid = '"+session['assignmentId']+"'"
	    sql = text(sqlstring)
	    result = db.engine.execute(sql).fetchall()
	    #result = User.query.filter(User.assignmentid=='3S4AW7T80CP7VW6AK65JFG2VBLTL4L').first()
	    #giv_query = result[0][2]
	    audio_blob = [];ybox = [];wbox = [];hbox = [];colbox = [];worker=[];assignmt=[];approved=[];
	    descbox = [];boxattrobj=[];boxattrcolor=[];boxattrnuminst=[]; boxattraction=[];boxattrfutact=[]; boxattrshape=[]; boxattrattend=[]; boxusdist=[];boxussdist=[];boxusroad=[]; boxusdirec=[];boxusrot=[]; boxusspeed=[];boxusdesc=[];
	    for row in result:
		audio_blob.append(row[0])
		worker.append(row[1])
		assignmt.append(row[2])
		approved.append(row[3])
	    return render_template('visualize.html',session=session,audio_blob=audio_blob,worker=worker,assignmt=assignmt,approved=approved)
    except Exception as e:
    	logging.exception('Got exception on Saving handler')
    	raise e


def get_reviewable_video_id(page_size=10,return_all=False):
    '''
    Gets the next video_id from the set of reviewable HITs
    :return: video_id or None, if no reviewable HITs
    '''
    connection = MTurkConnection(aws_access_key_id=AWS_ACCESS_KEY_ID,
                             aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                             host=HOST)
    hits=connection.get_reviewable_hits(status='Reviewable', sort_by='Expiration', sort_direction='Descending', page_size=page_size, page_number=1)
    #hits.extend(mturk.get_reviewable_hits(status='Reviewing', sort_by='Expiration', sort_direction='Ascending', page_size=20, page_number=1))

    if len(hits)==0:
	#return None,"HAha", None
        print('No HITs found')
        return None, None, None

    results=[]
    for hit in hits:
        print(hit.HITId)
        for a in connection.get_assignments(hit.HITId):
            videoId = [answer.fields[0] for answer in a.answers[0] if answer.qid=='AssignmentId']
            print('%s: %s' % (videoId,a.AssignmentStatus))

            if a.AssignmentStatus == 'Submitted':
                results.append([videoId,a.AssignmentId, a.WorkerId])
            #else:
            #    print('%s: %s' % (a.AssignmentId,a.AssignmentStatus))

    print('Number of reviewable assignments: %d' % len(results))
    if return_all:
        return results

    elif len(results)>0:
        idx=np.random.randint(0,len(results))
        return results[idx]+[len(results)]
    else:
        return None, None, None, 0

if __name__ == '__main__':
	app.debug = True
	app.run()
