var FileManagerDialogs = function(config) {
	var w = config.writer;
	
	var dfm = {};
	
	var docNames = [];
	
	$(document.body).append(''+
	'<div id="loaderDialog">'+
		'<div id="files">'+
		'<div class="column" style="left: 10px;">'+
		'<h2>Documents</h2><ul class="searchResults"></ul>'+
		'</div>'+
		'<div class="column" style="right: 10px;">'+
		'<h2>Templates</h2><ul class="searchResults">'+
		'<li class="unselectable" class="unselectable" data-name="#biography"><span>Orlando Biography</span></li><li class="unselectable" data-name="#writing"><span>Orlando Writing</span></li><li class="unselectable" data-name="#letter"><span>Letter</span></li><li class="unselectable" data-name="#poem"><span>Poem</span></li><li class="unselectable" data-name="#prose"><span>Prose</span></li><li class="unselectable" data-name="#event"><span>Event</span></li>'+
		'<li class="unselectable" data-name="#sample_biography"><span>Sample Orlando Biography</span></li><li class="unselectable" data-name="#sample_writing"><span>Sample Orlando Writing</span></li><li class="unselectable" data-name="#sample_letter"><span>Sample Letter</span></li><li class="unselectable last" data-name="#sample_poem"><span>Sample Poem</span></li>'+
		'</ul>'+
		'</div>'+
		'</div>'+
	'</div>'+
	'<div id="saverDialog">'+
		'<label for="filename">Name</label>'+
		'<input type="text" name="filename"/>'+
		'<p>Please enter letters only.</p>'+
	'</div>'+
	'<div id="unsavedDialog">'+
		'<p>You have unsaved changes.  Would you like to save?</p>'+
	'</div>');
	
	var loader = $('#loaderDialog');
	loader.dialog({
		title: 'Load Document',
		modal: true,
		height: 450,
		width: 450,
		autoOpen: false,
		buttons: {
			'Load': function() {
				var selected = $('#files ul li.selected');
				var data = selected.data();
				var isDoc = selected.parent('ul')[0] == $('#files ul:eq(0)')[0];
				if (isDoc && data) {
					w.fm.loadDocument(data.name);
					loader.dialog('close');
				} else if (data) {
					w.fm.loadInitialDocument(data.name);
					loader.dialog('close');
				} else {
					$('#files ul').css({borderColor: 'red'});
				}
			},
			'Cancel': function() {
				loader.dialog('close');
			}
		}
	});
	
	// templates events
	$('#files ul').eq(1).find('li').click(function(event) {
		$('#files ul').css({borderColor: '#fff'});
		var remove = $(this).hasClass('selected');
		$('#files li').removeClass('selected');
		if (!remove) $(this).addClass('selected');
	}).dblclick(function(event) {
		$('#files li').removeClass('selected');
		$(this).addClass('selected');
		w.fm.loadInitialDocument($(this).data('name'));
		loader.dialog('close');
	});
	
	var saver = $('#saverDialog');
	saver.dialog({
		title: 'Save Document As',
		modal: true,
		resizable: false,
		height: 160,
		width: 300,
		autoOpen: false,
		buttons: {
			'Save': function() {
				var name = $('input', saver).val();
				
				if (!_isNameValid(name)) {
					w.dialogs.show('message', {
						title: 'Invalid Name',
						msg: 'You may only enter upper or lowercase letters; no numbers, spaces, or punctuation.',
						type: 'error'
					});
					return;
				} else if (name == 'info') {
					w.dialogs.show('message', {
						title: 'Invalid Name',
						msg: 'This name is reserved, please choose a different one.',
						type: 'error'
					});
					return;
				}
				
				if ($.inArray(name, docNames) != -1) {
					// TODO add overwrite confirmation
					w.dialogs.show('message', {
						title: 'Invalid Name',
						msg: 'This name already exists, please choose a different one.',
						type: 'error'
					});
					return;
				} else {
					w.currentDocId = name;
					w.fm.saveDocument();
					saver.dialog('close');
				}
			},
			'Cancel': function() {
				saver.dialog('close');
			}
		}
	});
	
	var unsaved = $('#unsavedDialog');
	unsaved.dialog({
		title: 'Unsaved Changes',
		modal: true,
		resizable: false,
		height: 150,
		width: 300,
		autoOpen: false,
		buttons: {
			'Save': function() {
				unsaved.dialog('close');
				w.fm.saveDocument();
			},
			'New Document': function() {
				window.location = 'index.htm';
			}
		}
	});
	
	/**
	 * @memberOf dfm
	 */
	dfm.showLoader = function() {
		$('#files').css({borderColor: '#fff'});
		_getDocuments(function() {
			_populateLoader();
			loader.dialog('open');
		});
	};
	
	dfm.showSaver = function() {
		_getDocuments();
		saver.dialog('open');
	};
	
	dfm.showUnsaved = function() {
		unsaved.dialog('open');
	};
	
	function _getDocuments(callback) {
		$.ajax({
			url: w.baseUrl+'editor/documents',
			type: 'GET',
			dataType: 'json',
			success: [function(data, status, xhr) {
				docNames = data;
			}, callback],
			error: function() {
//				w.dialogs.show('message', {
//					title: 'Error',
//					msg: 'Error getting documents.',
//					type: 'error'
//				});
				docNames = [];
				callback.call();
			}
		});
	};
	
	function _populateLoader() {
		var formattedResults = '';
		var last = '';
		var d, i;
		for (i = 0; i < docNames.length; i++) {
			d = docNames[i];
			
			if (i == docNames.length - 1) last = 'last';
			else last = '';
			
			formattedResults += '<li class="unselectable '+last+'" data-name="'+d+'">';
			formattedResults += '<span>'+d+'</span>';
			formattedResults += '</li>';
		}
		
		$('#files ul').eq(0).html(formattedResults);
		
		$('#files ul').eq(0).find('li').click(function(event) {
			$('#files ul').css({borderColor: '#fff'});
			var remove = $(this).hasClass('selected');
			$('#files li').removeClass('selected');
			if (!remove) $(this).addClass('selected');
		}).dblclick(function(event) {
			$('#files li').removeClass('selected');
			$(this).addClass('selected');
			w.fm.loadDocument($(this).data('name'));
			loader.dialog('close');
		});
	};
	
	function _isNameValid(name) {
		return name.match(/[^A-Za-z]+/) == null;
	};
	
	return dfm;
};