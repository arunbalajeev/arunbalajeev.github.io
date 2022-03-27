
function save(check,submit) {
    if (typeof(check)==='undefined') {
        check=false;
    }
    if (typeof(submit)==='undefined') {
        submit=false;
    }
    //document.write("Hello")
    var frame_data = [];
    //var resolution = {h: video.videoHeight, w: video.videoWidth};
    //console.log('Resolution' + JSON.stringify(resolution));
    for (iter in AnnotatedData) {
        if (AnnotatedData.hasOwnProperty(iter)) {
            var tr = {
                imageID: iter,
                relevance: AnnotatedData[iter]
            };
            //console.log('Annotations:' + JSON.stringify(AnnotatedData[iter]));
            frame_data.push(tr);
        }
    }
    //document.write("Hello12")
    var out_data = {
        submitted: submit,
        check: check,
        frame_data: frame_data,
        video_id: $("#video > source").attr("src").split('/').pop(),
        worker_id: document.getElementById('workerId').value,
        assignment_id: document.getElementById('assignmentId').value,
	//left_attempts:5,
	//text:'Hello',
	//success:true
    };
    //document.write(out_data['video_id'])
    console.log(endpoint);
    //document.write(endpoint)
    alert(JSON.stringify(out_data));
    console.log(JSON.stringify(out_data))
    $.ajax({
      type: "POST",
      //dataType: 'json',
      url: endpoint + 'checkdata/',
      data: JSON.stringify(out_data),
      contentType:"application/json; charset=utf-8",
      success: function(data) {
	data = JSON.stringify(out_data)
	//document.write(data)
        if (data.hasOwnProperty('error')) {
            alert('Error while saving\n' + data['error']);
        } else if (check && data.hasOwnProperty('text')) {
	    //document.write("Hello2")
            qualification.left_attempts=data['left_attempts'];
            document.getElementById('quali_text').innerHTML='';
            if (data['success']) {
                document.getElementById('quali_text').innerHTML += data['text'];//'Great job! Clilck OK to submit the HIT';
                document.getElementById('finish_quali').addEventListener("click", function() {
                    $("#amt_submit").submit();
                }, true);
            } else {
                for (var idx=0;idx<data['text'].length;idx++) {
                    document.getElementById('quali_text').innerHTML += data['text'][idx]+'<br/>'
                }
                document.getElementById('quali_text').innerHTML += qualification.left_attempts + ' submission attempts remaining.<br/>';
                if (qualification.left_attempts<0) {
                    document.getElementById('quali_text').innerHTML ='Qualification failed. Click to return the HIT';
                    document.getElementById('finish_quali').addEventListener("click", function() {
                        $("#amt_submit").submit();
                    }, true);
                }
            }
            $('#quali_info').modal('show');
        } else if (check) {
	    //document.write("Hello3")
            $('#submit_hit_model').modal('show');
        //$('#amt_submit').submit();
        }
      }},'json').fail(function(jqXHR, textStatus, errorThrown) {
        console.log("error " + textStatus);
        console.log("incoming Text " + jqXHR.responseText);
    });
    //document.write("hai")
}

function annotate_relevance(li_id) {
    //console.log(li_id)
    var frame_data = [];
    var annotate_data = [];
    var element_count = 0;
    for (e in AnnotatedData) {  if (AnnotatedData.hasOwnProperty(e)) element_count++; }
    //alert(element_count)
    var Nimages = document.getElementsByClassName("mySlides")
    //alert(Nimages.length.toString()+cluster_filenames.length.toString())
    if (element_count < Nimages.length -1){  //-1 is for the non-consideration of THE END image
    	document.getElementById('quali_text').innerHTML ='Submission Failed. Annotate all the frames: '+element_count.toString()+' have been annotated and '+(Nimages.length-element_count-1).toString()+' images are left to be annotated';
	$('#quali_info').modal('show');
    }
    else{
    //var resolution = {h: video.videoHeight, w: video.videoWidth};
    //console.log('Resolution' + JSON.stringify(resolution));
    for (iter in AnnotatedData) {
        if (AnnotatedData.hasOwnProperty(iter)) {
            var tr = {
                imageID: iter,
                relevance: AnnotatedData[iter]
            };
	    if(AnnotatedData[iter]!=0){
	     	frame_data.push(iter);
	    }
	    else{
		var cf = {
                key: "liclus0",
                value: iter
                };
		cluster_filenames.push(cf)
		AnnotatedData[tr] = 0		
	    }
            //console.log('Annotations:' + JSON.stringify(AnnotatedData[iter]));
            annotate_data.push(tr);
        }
    }
    /////////////////////////////////////////////////////////////*
    /*var Nimages = document.getElementsByClassName("enlarge")
    //alert(Nimages.length.toString()+cluster_filenames.length.toString())
    if (cluster_filenames.length < Nimages.length){
    	document.getElementById('quali_text').innerHTML ='Submission Failed. Group all the frames: '+cluster_filenames.length.toString()+' have been grouped and '+(Nimages.length-cluster_filenames.length).toString()+' images are left to be grouped';
	$('#quali_info').modal('show');
    }
    else{
    //alert(cluster_filenames)
    for (iter in cluster_filenames){
	if (cluster_filenames.hasOwnProperty(iter)) {
		if(cluster_filenames[iter]["key"]!=li_id){
			var tr = cluster_filenames[iter]["value"]
	     		frame_data.push(tr);
		}
		else{
			var tr = cluster_filenames[iter]["value"]
			AnnotatedData[tr] = 0		
		}
	}
    }*/
    ///////////////////////////////////////////////////////////
    var out_data = {
	cluster_files:cluster_filenames,
        frame_data: frame_data,
	rel_annotation:annotate_data,
	annotateddata:AnnotatedData
    };
    //alert(cluster_filenames)
    //document.write(out_data['video_id'])
    //console.log(endpoint);
    //document.write(endpoint)
    //alert(endpoint);
    //console.log(JSON.stringify(out_data))
    $.ajax({
      type: "POST",
      //dataType: 'json',
      url: endpoint + 'diversity/',
      data: JSON.stringify(out_data),
      contentType:"application/json; charset=utf-8",
      success: function(data) {
	cluster_filenames = data['cluster_files']
	AnnotatedData = data['annotateddata']
	$("#submit_for_Rel").submit();
      }},'json').fail(function(jqXHR, textStatus, errorThrown) {
        //console.log("error " + textStatus);
        //console.log("incoming Text " + jqXHR.responseText);
    });
    }
    //document.write("hai")
}

function savedescription(submit){
    if (typeof(submit)==='undefined') {
        	submit=false;
    }
    if (box_desc.length != box_X.length || box_X.length<5){
    	document.getElementById('quali_text').innerHTML ='Submission Failed. Describe all the boxes: '+box_desc.length.toString()+' have been described and '+(box_X.length-box_desc.length).toString()+' boxes are left to be described';
	$('#quali_info').modal('show');
    }
    else{
	console.log(box_desc);
    	var keys=[]
    	var values=[]
    	for (k in box_desc) {
  		if (box_desc.hasOwnProperty(k)){keys.push(parseInt(box_desc[k]["key"]));values.push(box_desc[k]["value"]);}
    	}
    	keys.sort(function(a, b){return a-b});
    	var new_desc=[];var new_attr_obj=[];var new_attr_color=[];var new_attr_numinst=[];var new_attr_action=[];var new_attr_shape=[];
	var new_us_dist=[];var new_us_road=[];var new_us_direc=[];var new_us_rot=[];var new_us_speed=[];var new_us_desc=[];
	var new_oth_dist=[];var new_oth_road=[];var new_oth_direc=[];var new_oth_rot=[];var new_oth_speed=[];var new_oth_desc=[];
    	len = keys.length;
    	for (i = 0; i < len; i++) {
	 	for (j = 0; j < len; j++){
			if(box_desc[j]["key"]==keys[i]){new_desc.push({key:keys[i], value:box_desc[j]["value"]});}
			if(box_attr_obj[j]["key"]==keys[i]){new_attr_obj.push({key:keys[i], value:box_attr_obj[j]["value"]});}
			if(box_attr_color[j]["key"]==keys[i]){new_attr_color.push({key:keys[i], value:box_attr_color[j]["value"]});}
			if(box_attr_numinst[j]["key"]==keys[i]){new_attr_numinst.push({key:keys[i], value:box_attr_numinst[j]["value"]});}
			if(box_attr_action[j]["key"]==keys[i]){new_attr_action.push({key:keys[i], value:box_attr_action[j]["value"]});}
			if(box_attr_shape[j]["key"]==keys[i]){new_attr_shape.push({key:keys[i], value:box_attr_shape[j]["value"]});}
			if(box_us_dist[j]["key"]==keys[i]){new_us_dist.push({key:keys[i], value:box_us_dist[j]["value"]});}
			if(box_us_road[j]["key"]==keys[i]){new_us_road.push({key:keys[i], value:box_us_road[j]["value"]});}
			if(box_us_direc[j]["key"]==keys[i]){new_us_direc.push({key:keys[i], value:box_us_direc[j]["value"]});}
			if(box_us_rot[j]["key"]==keys[i]){new_us_rot.push({key:keys[i], value:box_us_rot[j]["value"]});}
			if(box_us_speed[j]["key"]==keys[i]){new_us_speed.push({key:keys[i], value:box_us_speed[j]["value"]});}
			if(box_us_desc[j]["key"]==keys[i]){new_us_desc.push({key:keys[i], value:box_us_desc[j]["value"]});}
			if(box_oth_dist[j]["key"]==keys[i]){new_oth_dist.push({key:keys[i], value:box_oth_dist[j]["value"]});}
			if(box_oth_road[j]["key"]==keys[i]){new_oth_road.push({key:keys[i], value:box_oth_road[j]["value"]});}
			if(box_oth_direc[j]["key"]==keys[i]){new_oth_direc.push({key:keys[i], value:box_oth_direc[j]["value"]});}
			if(box_oth_rot[j]["key"]==keys[i]){new_oth_rot.push({key:keys[i], value:box_oth_rot[j]["value"]});}
			if(box_oth_speed[j]["key"]==keys[i]){new_oth_speed.push({key:keys[i], value:box_oth_speed[j]["value"]});}
			if(box_oth_desc[j]["key"]==keys[i]){new_oth_desc.push({key:keys[i], value:box_oth_desc[j]["value"]});}
	 	}
    	}
    	box_desc = new_desc;box_attr_obj=new_attr_obj;box_attr_color=new_attr_color;box_attr_numinst=new_attr_numinst; box_attr_action=new_attr_action; box_attr_shape=new_attr_shape;box_us_dist=new_us_dist;box_us_road=new_us_road;box_us_direc=new_us_direc;box_us_rot=new_us_rot;box_us_speed=new_us_speed; box_us_desc=new_us_desc;box_oth_dist=new_oth_dist;box_oth_road=new_oth_road;box_oth_direc=new_oth_direc;box_oth_rot=new_oth_rot;box_oth_speed=new_oth_speed; box_oth_desc=new_oth_desc;
    	console.log(box_desc);
	var out_data = {
	boxX:box_X,
	boxY:box_Y,
	boxW:box_W,
	boxH:box_H,
	boxcolor:box_color,
	boxdesc:box_desc,
	box_attr_obj:box_attr_obj,
	box_attr_color:box_attr_color,
	box_attr_numinst:box_attr_numinst,
	box_attr_action:box_attr_action,
	box_attr_shape:box_attr_shape,
	box_us_dist:box_us_dist,
	box_us_road:box_us_road,
	box_us_direc:box_us_direc,
	box_us_rot:box_us_rot,
	box_us_speed:box_us_speed,
	box_us_desc:box_us_desc,
	box_oth_dist:box_oth_dist,
	box_oth_road:box_oth_road,
	box_oth_direc:box_oth_direc,
	box_oth_rot:box_oth_rot,
	box_oth_speed:box_oth_speed,
	box_oth_desc:box_oth_desc,
        submitted: submit,
        //worker_id: document.getElementById('workerId').value,
        //assignment_id: document.getElementById('assignmentId').value,
    	};
	$.ajax({
      	type: "POST",
      	//dataType: 'json',
      	url: endpoint + 'savedesc/',
      	data: JSON.stringify(out_data),
      	contentType:"application/json; charset=utf-8",
      	success: function(data) {
	//alert("Hello")
		document.getElementById('quali_text').innerHTML ='Congratulations! The task is Completed.';
		$('#quali_info').modal('show');
    		setTimeout(function(){
			$("#redirect")[0].click();
		}, 2000);
		//$("#amt_submit").submit();
      	}},'json').fail(function(jqXHR, textStatus, errorThrown) {
        //console.log("error " + textStatus);
        //console.log("incoming Text " + jqXHR.responseText);
        });
    }
}
function savedata(submit) {
    if (typeof(submit)==='undefined') {
        submit=false;
    }
    //document.write("Hello")
    var frame_data = [];
    var Nimages = document.getElementsByClassName("enlarge")
    //alert(Nimages.length.toString()+cluster_filenames.length.toString())
    if (cluster_filenames.length < Nimages.length){
    	document.getElementById('quali_text').innerHTML ='Submission Failed. Group all the frames: '+cluster_filenames.length.toString()+' have been grouped and '+(Nimages.length-cluster_filenames.length).toString()+' images are left to be grouped';
	$('#quali_info').modal('show');
    }
    else{
    //alert(cluster_filenames)
    for (iter in cluster_filenames){
	if (cluster_filenames.hasOwnProperty(iter)) {
		var tr = cluster_filenames[iter]["value"]
	     	frame_data.push(tr);	
	}
    }

    var out_data = {
	cluster_files:cluster_filenames,
        submitted: submit,
        frame_data: frame_data,
	//cluster_data: cluster_data,
        //video_id: $("#video > source").attr("src").split('/').pop(),
        worker_id: document.getElementById('workerId').value,
        assignment_id: document.getElementById('assignmentId').value,
	//left_attempts:5,
	//text:'Hello',
	//success:true
    };
    //document.write(out_data['video_id'])
    //console.log(endpoint);
    //document.write(endpoint)
    //alert(JSON.stringify(out_data));
    //console.log(JSON.stringify(out_data))
    $.ajax({
      type: "POST",
      //dataType: 'json',
      url: endpoint + 'savedata/',
      data: JSON.stringify(out_data),
      contentType:"application/json; charset=utf-8",
      success: function(data) {
	//alert("Hello")
	document.getElementById('quali_text').innerHTML ='Congratulations! The task is Completed.';
	$('#quali_info').modal('show');
	$("#amt_submit").submit();
      }},'json').fail(function(jqXHR, textStatus, errorThrown) {
        //console.log("error " + textStatus);
        //console.log("incoming Text " + jqXHR.responseText);
    });
    //document.write("hai")
    }
}
