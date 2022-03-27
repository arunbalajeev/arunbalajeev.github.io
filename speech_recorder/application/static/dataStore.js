function saveaudio1(submit){
	if (typeof(submit)==='undefined') {
        	submit=false;
    	}
	var fmkey_count=0
	for (var pair of audio_blob.keys()) {
    		fmkey_count=fmkey_count+1;
	}
	console.log(approval0)
	console.log(approval4)
	console.log(fmkey_count)
	if (fmkey_count!=5 || approval0!=1 || approval1!=1 || approval2!=1 || approval3!=1 || approval4!=1 )
	{
	document.getElementById('quali_text').innerHTML ='Submission Failed. Record all the 5 expressions in the boxes.<br/> '+fmkey_count.toString()+' expressions have been recorded.<br/> Please ensure all red warnings are addressed.';
	$('#quali_info').modal('show');
	console.log('hehe')
    }
    else{
		click_record=1;
		x=document.getElementById('save_audio');
		x.style.display='none';
		//var out_data = {blob:audio_blob};
		//console.log(audio_blob.getAll('file')[0])
		var ablob = new window.FileReader();
		//console.log(audio_blob.getAll('file').length);
		//for(var i=0;i<audio_blob.getAll('file').length;i++){
		//   ablob.readAsDataURL(audio_blob.getAll('file')[i]);
		//}
		var fmkey_count=0
		for (var pair of audio_blob.keys()) {
	    		fmkey_count=fmkey_count+1;
		}
		var element = document.getElementById('audio-in-select');
		element.value = "no-input";
		console.log(fmkey_count)
		function readFile(index) {
		    if( index >= fmkey_count ) return;

		    ablob.onload = function(e) {  
		        // get file content  
		        var base64dat = ablob.result; 
			str_arr.push(base64dat.substr(base64dat.indexOf(',')+1))
			if(index==fmkey_count-1){
				out_data = {blob:str_arr,submitted: submit,};
				console.log("qwerty0");console.log(str_arr);console.log(out_data);
				/*$.ajax({
			      	type: "POST",
			      	//dataType: 'json',
			      	url: endpoint + 'saveaudio/',
			      	data: JSON.stringify(out_data),
			      	contentType:"application/json; charset=utf-8",
				//processData: false,
			      	success: function(data) {
				//alert("Hello")
					document.getElementById('quali_text').innerHTML ='Congratulations! The task is Completed.';
					//$('#quali_info').modal('show');
			    		//setTimeout(function(){
					//	$("#redirect")[0].click();
					//}, 2000);
					//$("#amt_submit").submit();
			      	}},'json').fail(function(jqXHR, textStatus, errorThrown) {
				console.log("error submitting ");
				console.log(errorThrown);
				console.log(textStatus);
				console.log(jqXHR);
				});*/
				execute_ajax(out_data)
			}
		        readFile(index+1)
		    }
		    console.log(audio_blob.getAll('file_'+index.toString()))
		    ablob.readAsDataURL(audio_blob.getAll('file_'+index.toString())[0]);
		}
		//setTimeout(function(){
		readFile(0);
		//}, 1000)
		function execute_ajax(out_data){
    			//out_data = {blob:str_arr,submitted: submit,};
		console.log("qwerty");console.log(out_data);console.log(str_arr);
		//}, 2000)
		//setTimeout(function(){
		$.ajax({
	      	type: "POST",
	      	//dataType: 'json',
	      	url: endpoint + 'saveaudio/',
	      	data: JSON.stringify(out_data),
	      	contentType:"application/json; charset=utf-8",
		//processData: false,
	      	success: function(data) {
		//alert("Hello")
			document.getElementById('quali_text').innerHTML ='Congratulations! The task is Completed.';
			//$('#quali_info').modal('show');
	    		//setTimeout(function(){
			//	$("#redirect")[0].click();
			//}, 2000);
			//$("#amt_submit").submit();
	      	}},'json').fail(function(jqXHR, textStatus, errorThrown) {
		console.log("error submitting ");
		console.log(errorThrown);
		console.log(textStatus);
		console.log(jqXHR);
		});
		}

		//ablob.readAsDataURL(audio_blob.getAll('file')[0]); 
		//var base64dat ="";
		//console.log( base64dat.substr(base64dat.indexOf(',')+1) );
		/*ablob.onloadend = function() {
			base64dat = ablob.result;
			//console.log(ablob)         
			//console.log(base64dat );
			//console.log( base64dat.substr(base64dat.indexOf(',')+1) );
			out_data = {blob:base64dat.substr(base64dat.indexOf(',')+1),submitted: submit,};
			//console.log(ablob)
			//console.log(base64dat)
		};*/
	}
}
function saveaudio(submit){
	if (typeof(submit)==='undefined') {
        	submit=false;
    	}
	var fmkey_count=0
	for (var pair of audio_blob.keys()) {
    		fmkey_count=fmkey_count+1;
	}
	console.log(approval0)
	console.log(approval4)
	console.log(fmkey_count)
	if (click_record!=1)// || approval0!=1 || approval1!=1 || approval2!=1 || approval3!=1 || approval4!=1 )
	{
	document.getElementById('quali_text').innerHTML ='Please click Save Audio button';
	$('#quali_info').modal('show');
	console.log('hehe')
    }
    else{
		submit=-1;
		//var out_data = {blob:audio_blob};
		//console.log(audio_blob.getAll('file')[0])
		var ablob = new window.FileReader();
		//console.log(audio_blob.getAll('file').length);
		//for(var i=0;i<audio_blob.getAll('file').length;i++){
		//   ablob.readAsDataURL(audio_blob.getAll('file')[i]);
		//}
		var fmkey_count=0
		for (var pair of audio_blob.keys()) {
	    		fmkey_count=fmkey_count+1;
		}
		var element = document.getElementById('audio-in-select');
		element.value = "no-input";
		console.log(fmkey_count)

		function readFile(index) {
		    if( index >= fmkey_count ) return;

		    ablob.onload = function(e) {  
		        // get file content  
		        var base64dat = ablob.result; 
			str_arr_dummy.push("dummy")//base64dat.substr(base64dat.indexOf(',')+1))
			if(index==fmkey_count-1){
				out_data = {blob:str_arr_dummy,status:"Fail",submitted: submit,};
				console.log("qwerty0");console.log(str_arr);console.log(out_data);
				/*$.ajax({
			      	type: "POST",
			      	//dataType: 'json',
			      	url: endpoint + 'saveaudio/',
			      	data: JSON.stringify(out_data),
			      	contentType:"application/json; charset=utf-8",
				//processData: false,
			      	success: function(data) {
				//alert("Hello")
					document.getElementById('quali_text').innerHTML ='Congratulations! The task is Completed.';
					//$('#quali_info').modal('show');
			    		//setTimeout(function(){
					//	$("#redirect")[0].click();
					//}, 2000);
					//$("#amt_submit").submit();
			      	}},'json').fail(function(jqXHR, textStatus, errorThrown) {
				console.log("error submitting ");
				console.log(errorThrown);
				console.log(textStatus);
				console.log(jqXHR);
				});*/
				execute_ajax(out_data)
			}
		        readFile(index+1)
		    }
		    console.log(audio_blob.getAll('file_'+index.toString()))
		    ablob.readAsDataURL(audio_blob.getAll('file_'+index.toString())[0]);
		}
		//setTimeout(function(){
		readFile(0);
		//}, 1000)
		function execute_ajax(out_data){
    			//out_data = {blob:str_arr_dummy,submitted: submit,};
		console.log("qwerty");console.log(out_data);console.log(str_arr);
		//}, 2000)
		//setTimeout(function(){
		$.ajax({
	      	type: "POST",
	      	//dataType: 'json',
	      	url: endpoint + 'saveaudio/',
	      	data: JSON.stringify(out_data),
	      	contentType:"application/json; charset=utf-8",
		//processData: false,
	      	success: function(data) {
			data= JSON.parse(data)
			if(data['status']=='OK'){
				document.getElementById('quali_text').innerHTML ='Congratulations! The task is Completed.';
				$('#quali_info').modal('show');
		    		//setTimeout(function(){
				//	$("#redirect")[0].click();
				//}, 2000);
				$("#amt_submit").submit();}
			else{
				document.getElementById('quali_text').innerHTML ='Please wait, data is saving....Click Submit HIT again';
				$('#quali_info').modal('show');}
	      	}},'json').fail(function(jqXHR, textStatus, errorThrown) {
		console.log("error submitting ");
		console.log(errorThrown);
		console.log(textStatus);
		console.log(jqXHR);
		});
		}

		//ablob.readAsDataURL(audio_blob.getAll('file')[0]); 
		//var base64dat ="";
		//console.log( base64dat.substr(base64dat.indexOf(',')+1) );
		/*ablob.onloadend = function() {
			base64dat = ablob.result;
			//console.log(ablob)         
			//console.log(base64dat );
			//console.log( base64dat.substr(base64dat.indexOf(',')+1) );
			out_data = {blob:base64dat.substr(base64dat.indexOf(',')+1),submitted: submit,};
			//console.log(ablob)
			//console.log(base64dat)
		};*/
	}
}
