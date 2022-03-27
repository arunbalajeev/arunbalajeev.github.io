(function() {
  var $audioInLevel, $audioInSelect, $bufferSize, $cancel, $dateTime, $echoCancellation, $encoding, $encodingOption, $encodingProcess, $modalError, $modalLoading, $modalProgress, $record, $recording, $recordingList, $reportInterval, $testToneLevel, $timeDisplay, $timeLimit, BUFFER_SIZE, ENCODING_OPTION, MP3_BIT_RATE, OGG_KBPS, OGG_QUALITY, URL, audioContext, audioIn, audioInLevel, audioRecorder, defaultBufSz, disableControlsOnRecord, encodingProcess, iDefBufSz, minSecStr, mixer, onChangeAudioIn, onError, onGotAudioIn, onGotDevices, optionValue, plural, progressComplete, saveRecording, setProgress, startRecording, stopRecording, testTone, testToneLevel, updateBufferSizeText, updateDateTime;
  var recorded_time;

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

  URL = window.URL || window.webkitURL;

  audioContext = new AudioContext;

  if (audioContext.createScriptProcessor == null) {
    audioContext.createScriptProcessor = audioContext.createJavaScriptNode;
  }

  $testToneLevel = $('#test-tone-level');

  $audioInSelect = $('#audio-in-select');

  $audioInLevel = $('#audio-in-level');

  $echoCancellation = $('#echo-cancellation');

  $timeLimit = $('#time-limit');

  $encoding = $('input[name="encoding"]');

  $encodingOption = $('#encoding-option');

  $encodingProcess = $('input[name="encoding-process"]');

  $reportInterval = $('#report-interval');

  $bufferSize = $('#buffer-size');

  $recording_0 = $('#recording_0');$timeDisplay_0 = $('#time-display_0');$record_0 = $('#record_0');$cancel_0 = $('#cancel_0');$recordingList_0 = $('#recording-list_0');
  $recording_1 = $('#recording_1');$timeDisplay_1 = $('#time-display_1');$record_1 = $('#record_1');$cancel_1 = $('#cancel_1');$recordingList_1 = $('#recording-list_1');
  $recording_2 = $('#recording_2');$timeDisplay_2 = $('#time-display_2');$record_2 = $('#record_2');$cancel_2 = $('#cancel_2');$recordingList_2 = $('#recording-list_2');
  $recording_3 = $('#recording_3');$timeDisplay_3 = $('#time-display_3');$record_3 = $('#record_3');$cancel_3 = $('#cancel_3');$recordingList_3 = $('#recording-list_3');
  $recording_4 = $('#recording_4');$timeDisplay_4 = $('#time-display_4');$record_4 = $('#record_4');$cancel_4 = $('#cancel_4');$recordingList_4 = $('#recording-list_4');

  $dateTime = $('#date-time');

  //$recordingList = $('#recording-list');

  $modalLoading = $('#modal-loading');

  $modalProgress = $('#modal-progress');

  $modalError = $('#modal-error');

  $audioInLevel.attr('disabled', false);

  $audioInLevel[0].valueAsNumber = 50;

  $testToneLevel.attr('disabled', false);

  $testToneLevel[0].valueAsNumber = 0;

  $timeLimit.attr('disabled', false);

  $timeLimit[0].valueAsNumber = 3;

  $encoding.attr('disabled', false);

  $encoding[0].checked = true;

  $encodingProcess.attr('disabled', false);

  $encodingProcess[0].checked = true;

  $reportInterval.attr('disabled', false);

  $reportInterval[0].valueAsNumber = 1;

  $bufferSize.attr('disabled', false);

  testTone = (function() {
    var lfo, osc, oscMod, output;
    osc = audioContext.createOscillator();
    lfo = audioContext.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 2;
    oscMod = audioContext.createGain();
    osc.connect(oscMod);
    lfo.connect(oscMod.gain);
    output = audioContext.createGain();
    output.gain.value = 0.5;
    oscMod.connect(output);
    osc.start();
    lfo.start();
    return output;
  })();

  testToneLevel = audioContext.createGain();

  testToneLevel.gain.value = 0;

  testTone.connect(testToneLevel);

  audioInLevel = audioContext.createGain();

  audioInLevel.gain.value = 0.25;

  mixer = audioContext.createGain();

  testToneLevel.connect(mixer);

  audioIn = void 0;

  audioInLevel.connect(mixer);

  //mixer.connect(audioContext.destination);

  audioRecorder = new WebAudioRecorder(mixer, {
    workerDir: 'static/js/',
    onEncoderLoading: function(recorder, encoding) {
      $modalLoading.find('.modal-title').html("Loading " + (encoding.toUpperCase()) + " encoder ...");
      $modalLoading.modal('show');
    }
  });

  audioRecorder.onEncoderLoaded = function() {
    $modalLoading.modal('hide');
  };

  $testToneLevel.on('input', function() {
    var level;
    level = $testToneLevel[0].valueAsNumber / 100;
    testToneLevel.gain.value = level * level;
  });

  $audioInLevel.on('input', function() {
    var level;
    level = $audioInLevel[0].valueAsNumber / 100;
    volume_level=level;
    audioInLevel.gain.value = level * level;
  });

  onGotDevices = function(devInfos) {
    var index, info, name, options, _i, _len;
    options = '<option value="no-input" selected>(No input)</option>';
    index = 0;
    for (_i = 0, _len = devInfos.length; _i < _len; _i++) {
      info = devInfos[_i];
      if (info.kind !== 'audioinput') {
        continue;
      }
      name = info.label || ("Audio in " + (++index));
      options += "<option value=" + info.deviceId + ">" + name + "</option>";
    }
    $audioInSelect.html(options);
  };

  onError = function(msg) {
    $modalError.find('.alert').html(msg);
    $modalError.modal('show');
  };

  if ((navigator.mediaDevices != null) && (navigator.mediaDevices.enumerateDevices != null)) {
    navigator.mediaDevices.enumerateDevices().then(onGotDevices)["catch"](function(err) {
      return onError("Could not enumerate audio devices: " + err);
    });
  } else {
    $audioInSelect.html('<option value="no-input" selected>(No input)</option><option value="default-audio-input">Default audio input</option>');
  }

  onGotAudioIn = function(stream) {
    if (audioIn != null) {
      audioIn.disconnect();
    }
    audioIn = audioContext.createMediaStreamSource(stream);
    audioIn.connect(audioInLevel);
    $audioInLevel[0].valueAsNumber = 50;
    return $audioInLevel.removeClass('hidden');
  };

  onChangeAudioIn = function() {
    var constraint, deviceId;
    deviceId = $audioInSelect[0].value;
    if (deviceId === 'no-input') {
      if (audioIn != null) {
        audioIn.disconnect();
      }
      audioIn = void 0;
      $audioInLevel.addClass('hidden');
    } else {
      mic_activated=1;
      if (deviceId === 'default-audio-input') {
        deviceId = void 0;
      }
      if (navigator.webkitGetUserMedia !== undefined) {
        constraint = {
          video: false,
          audio: {
            optional: [
                {sourceId:deviceId},
                {googAutoGainControl: false},
                {googAutoGainControl2: false},
                {echoCancellation: false},
                {googEchoCancellation: false},
                {googEchoCancellation2: false},
                {googDAEchoCancellation: false},
                {googNoiseSuppression: false},
                {googNoiseSuppression2: false},
                {googHighpassFilter: false},
                {googTypingNoiseDetection: false},
                {googAudioMirroring: false}
              ]
            }
          }
        }
      else if (navigator.mozGetUserMedia !== undefined) {
        constraint = {
          video: false,
          audio: {
            deviceId: deviceId ? { exact: deviceId } : void 0,
            echoCancellation: false,
            mozAutoGainControl: false
            //mozNoiseSuppression: false
            }
          }

       }
      else {
        constraint = {
          video: false,
          audio: {
            deviceId: deviceId ? {exact: deviceId} : void 0,
            echoCancellation: false
          }
        }
      }
      if ((navigator.mediaDevices != null) && (navigator.mediaDevices.getUserMedia != null)) {
        navigator.mediaDevices.getUserMedia(constraint).then(onGotAudioIn)["catch"](function(err) {
          return onError("Could not get audio media device: " + err);
        });
      } else {
        navigator.getUserMedia(constraint, onGotAudioIn, function() {
          return onError("Could not get audio media device: " + err);
        });
      }
    }
  };

  $audioInSelect.on('change', onChangeAudioIn);

  $echoCancellation.on('change', onChangeAudioIn);

  plural = function(n) {
    if (n > 1) {
      return 's';
    } else {
      return '';
    }
  };

  $timeLimit.on('input', function() {
    var min;
    min = $timeLimit[0].valueAsNumber;
    $('#time-limit-text').html("" + min + " minute" + (plural(min)));
  });

  OGG_QUALITY = [-0.1, 0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

  OGG_KBPS = [45, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 500];

  MP3_BIT_RATE = [64, 80, 96, 112, 128, 160, 192, 224, 256, 320];

  ENCODING_OPTION = {
    wav: {
      label: '',
      hidden: true,
      max: 1,
      text: function(val) {
        return '';
      }
    },
    ogg: {
      label: 'Quality',
      hidden: false,
      max: OGG_QUALITY.length - 1,
      text: function(val) {
        return "" + (OGG_QUALITY[val].toFixed(1)) + " (~" + OGG_KBPS[val] + "kbps)";
      }
    },
    mp3: {
      label: 'Bit rate',
      hidden: false,
      max: MP3_BIT_RATE.length - 1,
      text: function(val) {
        return "" + MP3_BIT_RATE[val] + "kbps";
      }
    }
  };

  optionValue = {
    wav: null,
    ogg: 6,
    mp3: 5
  };

  $encoding.on('click', function(event) {
    var encoding, option;
    encoding = $(event.target).attr('encoding');
    audioRecorder.setEncoding(encoding);
    option = ENCODING_OPTION[encoding];
    $('#encoding-option-label').html(option.label);
    $('#encoding-option-text').html(option.text(optionValue[encoding]));
    $encodingOption.toggleClass('hidden', option.hidden).attr('max', option.max);
    $encodingOption[0].valueAsNumber = optionValue[encoding];
  });

  $encodingOption.on('input', function() {
    var encoding, option;
    encoding = audioRecorder.encoding;
    option = ENCODING_OPTION[encoding];
    optionValue[encoding] = $encodingOption[0].valueAsNumber;
    $('#encoding-option-text').html(option.text(optionValue[encoding]));
  });

  encodingProcess = 'background';

  $encodingProcess.on('click', function(event) {
    var hidden;
    encodingProcess = $(event.target).attr('mode');
    hidden = encodingProcess === 'background';
    $('#report-interval-label').toggleClass('hidden', hidden);
    $reportInterval.toggleClass('hidden', hidden);
    $('#report-interval-text').toggleClass('hidden', hidden);
  });

  $reportInterval.on('input', function() {
    var sec;
    sec = $reportInterval[0].valueAsNumber;
    //recorded_time = sec;
    //console.log("hai")
    $('#report-interval-text').html("" + sec + " second" + (plural(sec)));
  });

  defaultBufSz = (function() {
    var processor;
    processor = audioContext.createScriptProcessor(void 0, 2, 2);
    return processor.bufferSize;
  })();

  BUFFER_SIZE = [256, 512, 1024, 2048, 4096, 8192, 16384];

  iDefBufSz = BUFFER_SIZE.indexOf(defaultBufSz);

  updateBufferSizeText = function() {
    var iBufSz, text;
    iBufSz = $bufferSize[0].valueAsNumber;
    text = "" + BUFFER_SIZE[iBufSz];
    if (iBufSz === iDefBufSz) {
      text += ' (browser default)';
    }
    $('#buffer-size-text').html(text);
  };

  $bufferSize.on('input', updateBufferSizeText);

  $bufferSize[0].valueAsNumber = iDefBufSz;

  updateBufferSizeText();

  saveRecording = function(blob, enc,desc_position) {
    var html, time, url,speech_len=0;
    time = new Date();
    url = URL.createObjectURL(blob);
    desc_text =document.getElementById("descriptions_"+desc_position.toString()).innerHTML;
    console.log(recorded_time);
    hint_text = "<font color='green'> Hint: Good</font>"
    if(recorded_time<2){
	hint_text = "<font color='red'><b>Short</b> Speech.</font>";speech_len=1;}
    if(recorded_time>20){
	hint_text = "<font color='red'><b>Very long</b> Speech</font>";speech_len=1;}
    html = ("<div style='height:120px'><p recording='" + url + "'>"+/*desc_text+*/"<br>") + ("<audio controls src='" + url + "'></audio> ") /*+ ("<button style='margin-top:-20px' class='btn btn-danger' recording='" + url + "'>Delete</button>")*/;
    "</p></div>";
     blank=("")
    //html = ("<p recording='" + url + "'>") + ("<audio controls src='" + url + "'></audio> ") + ("(" + enc + ") " + (time.toString()) + " ") + (" ") + "Save..." + "</button></form> " + ("<button class='btn btn-danger' recording='" + url + "'>Delete</button>")+("</p>");
    if(desc_position==0){$recordingList_0.html($(html));$('#waveform-list_0').html(blank);var wavesurfer = WaveSurfer.create({container: '#waveform-list_0',cursorWidth:0,waveColor:'#000'});wavesurfer.load(url);active=0;if(approval0==0){$('#micthresh-list_0').html("<font color='red'><b>Low</b> volume,&nbsp;</font>");}if(speech_len==1){$('#micthresh-list_0').append(hint_text)}if(speech_len==1 || approval0==0){$('#micthresh-list_0').append("<font color='red'>Please re-record.</font>")}}
    if(desc_position==1){$recordingList_1.html($(html));$('#waveform-list_1').html(blank);var wavesurfer = WaveSurfer.create({container: '#waveform-list_1',cursorWidth:0,waveColor:'#000'});wavesurfer.load(url);active=0;if(approval1==0){$('#micthresh-list_1').html("<font color='red'><b>Low</b> volume,&nbsp;</font>");}if(speech_len==1){$('#micthresh-list_1').append(hint_text)}if(speech_len==1 || approval1==0){$('#micthresh-list_1').append("<font color='red'>Please re-record.</font>")}}
    if(desc_position==2){$recordingList_2.html($(html));$('#waveform-list_2').html(blank);var wavesurfer = WaveSurfer.create({container: '#waveform-list_2',cursorWidth:0,waveColor:'#000'});wavesurfer.load(url);active=0;if(approval2==0){$('#micthresh-list_2').html("<font color='red'><b>Low</b> volume,&nbsp;</font>");}if(speech_len==1){$('#micthresh-list_2').append(hint_text)}if(speech_len==1 || approval2==0){$('#micthresh-list_2').append("<font color='red'>Please re-record.</font>")}}
    if(desc_position==3){$recordingList_3.html($(html));$('#waveform-list_3').html(blank);var wavesurfer = WaveSurfer.create({container: '#waveform-list_3',cursorWidth:0,waveColor:'#000'});wavesurfer.load(url);active=0;if(approval3==0){$('#micthresh-list_3').html("<font color='red'><b>Low</b> volume,&nbsp;</font>");}if(speech_len==1){$('#micthresh-list_3').append(hint_text)}if(speech_len==1 || approval3==0){$('#micthresh-list_3').append("<font color='red'>Please re-record.</font>")}}
    if(desc_position==4){$recordingList_4.html($(html));$('#waveform-list_4').html(blank);var wavesurfer = WaveSurfer.create({container: '#waveform-list_4',cursorWidth:0,waveColor:'#000'});wavesurfer.load(url);active=0;if(approval4==0){$('#micthresh-list_4').html("<font color='red'><b>Low</b> volume,&nbsp;</font>");}if(speech_len==1){$('#micthresh-list_4').append(hint_text)}if(speech_len==1 || approval4==0){$('#micthresh-list_4').append("<font color='red'>Please re-record.</font>")}}
    audio_blob.set('file_'+desc_position.toString(),blob);
    console.log(audio_blob.getAll('file_'+desc_position.toString()));
    console.log(blob);
    console.log("saving to audio blob file_"+desc_position.toString())
  };

  $recordingList_0.on('click', 'button', function(event) {
    var url;
    url = $(event.target).attr('recording');
    $("p[recording='" + url + "']").remove();
    URL.revokeObjectURL(url);
    $('#micthresh-list_0').html("");$('#waveform-list_0').html("");approval0=0;
  });
  $recordingList_1.on('click', 'button', function(event) {
    var url;
    url = $(event.target).attr('recording');
    $("p[recording='" + url + "']").remove();
    URL.revokeObjectURL(url);
    $('#micthresh-list_1').html("");$('#waveform-list_1').html("");approval1=0;
  });
  $recordingList_2.on('click', 'button', function(event) {
    var url;
    url = $(event.target).attr('recording');
    $("p[recording='" + url + "']").remove();
    URL.revokeObjectURL(url);
    $('#micthresh-list_2').html("");$('#waveform-list_2').html("");approval2=0;
  });
  $recordingList_3.on('click', 'button', function(event) {
    var url;
    url = $(event.target).attr('recording');
    $("p[recording='" + url + "']").remove();
    URL.revokeObjectURL(url);
    $('#micthresh-list_3').html("");$('#waveform-list_3').html("");approval3=0;
  });
  $recordingList_4.on('click', 'button', function(event) {
    var url;
    url = $(event.target).attr('recording');
    $("p[recording='" + url + "']").remove();
    URL.revokeObjectURL(url);
    $('#micthresh-list_4').html("");$('#waveform-list_4').html("");approval4=0;
  });

  minSecStr = function(n) {
    return (n < 10 ? "0" : "") + n;
  };

  updateDateTime = function() {
    var sec;
    $dateTime.html((new Date).toString());
    sec = audioRecorder.recordingTime() | 0;
    recorded_time = sec;
    //console.log(sec)
    if(recorder_no==0){$timeDisplay_0.html("" + (minSecStr(sec / 60 | 0)) + ":" + (minSecStr(sec % 60)));}
    if(recorder_no==1){$timeDisplay_1.html("" + (minSecStr(sec / 60 | 0)) + ":" + (minSecStr(sec % 60)));}
    if(recorder_no==2){$timeDisplay_2.html("" + (minSecStr(sec / 60 | 0)) + ":" + (minSecStr(sec % 60)));}
    if(recorder_no==3){$timeDisplay_3.html("" + (minSecStr(sec / 60 | 0)) + ":" + (minSecStr(sec % 60)));}
    if(recorder_no==4){$timeDisplay_4.html("" + (minSecStr(sec / 60 | 0)) + ":" + (minSecStr(sec % 60)));}
  };

  window.setInterval(updateDateTime, 200);

  progressComplete = false;

  setProgress = function(progress) {
    var percent;
    percent = "" + ((progress * 100).toFixed(1)) + "%";
    $modalProgress.find('.progress-bar').attr('style', "width: " + percent + ";");
    $modalProgress.find('.text-center').html(percent);
    progressComplete = progress === 1;
  };

  $modalProgress.on('hide.bs.modal', function() {
    if (!progressComplete) {
      audioRecorder.cancelEncoding();
    }
  });

  disableControlsOnRecord = function(disabled) {
    $audioInSelect.attr('disabled', disabled);
    $echoCancellation.attr('disabled', disabled);
    $timeLimit.attr('disabled', disabled);
    $encoding.attr('disabled', disabled);
    $encodingOption.attr('disabled', disabled);
    $encodingProcess.attr('disabled', disabled);
    $reportInterval.attr('disabled', disabled);
    $bufferSize.attr('disabled', disabled);
  };

  startRecording = function(audio_row) {
    if(audio_row==0){$recording_0.removeClass('hidden');$record_0.html('STOP');$cancel_0.removeClass('hidden');recorder_no=0;active=1;approval0=0;$('#micthresh-list_0').html("");}
    if(audio_row==1){$recording_1.removeClass('hidden');$record_1.html('STOP');$cancel_1.removeClass('hidden');recorder_no=1;active=1;approval1=0;$('#micthresh-list_1').html("");}
    if(audio_row==2){$recording_2.removeClass('hidden');$record_2.html('STOP');$cancel_2.removeClass('hidden');recorder_no=2;active=1;approval2=0;$('#micthresh-list_2').html("");}
    if(audio_row==3){$recording_3.removeClass('hidden');$record_3.html('STOP');$cancel_3.removeClass('hidden');recorder_no=3;active=1;approval3=0;$('#micthresh-list_3').html("");}
    if(audio_row==4){$recording_4.removeClass('hidden');$record_4.html('STOP');$cancel_4.removeClass('hidden');recorder_no=4;active=1;approval4=0;$('#micthresh-list_4').html("");}    
    
    disableControlsOnRecord(true);
    audioRecorder.setOptions({
      timeLimit: $timeLimit[0].valueAsNumber * 60,
      encodeAfterRecord: encodingProcess === 'separate',
      progressInterval: $reportInterval[0].valueAsNumber * 1000,
      ogg: {
        quality: OGG_QUALITY[optionValue.ogg]
      },
      mp3: {
        bitRate: MP3_BIT_RATE[optionValue.mp3]
      }
    });
    audioRecorder.startRecording(audio_row);
    setProgress(0);
  };

  stopRecording = function(finish,audio_row) {
    if(audio_row==0){$recording_0.addClass('hidden');$record_0.html('RE-RECORD');$cancel_0.addClass('hidden');}
    if(audio_row==1){$recording_1.addClass('hidden');$record_1.html('RE-RECORD');$cancel_1.addClass('hidden');}
    if(audio_row==2){$recording_2.addClass('hidden');$record_2.html('RE-RECORD');$cancel_2.addClass('hidden');}
    if(audio_row==3){$recording_3.addClass('hidden');$record_3.html('RE-RECORD');$cancel_3.addClass('hidden');}
    if(audio_row==4){$recording_4.addClass('hidden');$record_4.html('RE-RECORD');$cancel_4.addClass('hidden');}
    disableControlsOnRecord(false);
    if (finish) {
      audioRecorder.finishRecording();
      if (audioRecorder.options.encodeAfterRecord) {
        $modalProgress.find('.modal-title').html("Encoding " + (audioRecorder.encoding.toUpperCase()));
        $modalProgress.modal('show');
      }
    } else {
      audioRecorder.cancelRecording();
    }
  };

  $record_0.on('click', function() {
    if (audioRecorder.isRecording()) {
      stopRecording(true,$record_0.selector.slice(-1));
    } else {
      startRecording($record_0.selector.slice(-1));
    }
  });
  $record_1.on('click', function() {
    if (audioRecorder.isRecording()) {
      stopRecording(true,$record_1.selector.slice(-1));
    } else {
      startRecording($record_1.selector.slice(-1));
    }
  });
  $record_2.on('click', function() {
    if (audioRecorder.isRecording()) {
      stopRecording(true,$record_2.selector.slice(-1));
    } else {
      startRecording($record_2.selector.slice(-1));
    }
  });  $record_3.on('click', function() {
    if (audioRecorder.isRecording()) {
      stopRecording(true,$record_3.selector.slice(-1));
    } else {
      startRecording($record_3.selector.slice(-1));
    }
  });
  $record_4.on('click', function() {
    if (audioRecorder.isRecording()) {
      stopRecording(true,$record_4.selector.slice(-1));
    } else {
      startRecording($record_4.selector.slice(-1));
    }
  });

  $cancel_0.on('click', function() {
    stopRecording(false,$cancel_0.selector.slice(-1));
  });
  $cancel_1.on('click', function() {
    stopRecording(false,$cancel_1.selector.slice(-1));
  });
  $cancel_2.on('click', function() {
    stopRecording(false,$cancel_2.selector.slice(-1));
  });
  $cancel_3.on('click', function() {
    stopRecording(false,$cancel_3.selector.slice(-1));
  });
  $cancel_4.on('click', function() {
    stopRecording(false,$cancel_4.selector.slice(-1));
  });

  audioRecorder.onTimeout = function(recorder) {
    stopRecording(true,recorder_no);
  };

  audioRecorder.onEncodingProgress = function(recorder, progress) {
    setProgress(progress);
  };

  audioRecorder.onComplete = function(recorder, blob) {
    if (recorder.options.encodeAfterRecord) {
      $modalProgress.modal('hide');
    }
    saveRecording(blob, recorder.encoding, recorder_no);
  };

  audioRecorder.onError = function(recorder, message) {
    onError(message);
  };

}).call(this);

