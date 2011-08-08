_.templateSettings = {
    evaluate    : /\#\[([\s\S]+?)\]/g,
	interpolate : /\#\{(.+?)\}/g
};

var Tasks = {
	reload: function(delegate_id, hard) {
		hard = (typeof hard == 'undefined') ? true : hard;
		$('#spinner').show();
		$('#menu a').addClass('disabled');
		
		var ul = $('div[data-delegate_id="' + delegate_id + '"] > ul');
		var dul = $('div[data-delegate_id="default"] > ul');
		
		$.ajax({
			url: '/tasks/' + delegate_id + '.js',
			data: { 'reload': (hard ? 1 : 0) },
			success: function(tasks) {
				ul.empty();

				$(tasks).each(function(i, task) {
					(task.annotation.pushed ? dul : ul).append(_.template($('.templates#task').html(), task)).linkify();
				});
				$('#menu a').removeClass('disabled');
				$('#spinner').hide();
			}
		});				
	},
	
	reload_all: function(hard) {
		$('div[data-delegate_id="default"] > ul').empty();
		$('div.delegate-task-list').each(function() {
			hard = (typeof hard == 'undefined') ? true : hard;
			if ($(this).data('delegate_id') != 'default') {
				Tasks.reload($(this).data('delegate_id'), hard);
			}
		});
	}
}

var Task = {
	render_visibility: function($s) {
		if (0 == $.Storage.get('task-notes-visible-' + $s.data('task_id'))) { 
			Task.toggle($s); 
		}
	},
	
	toggle: function($s) {
		var iv = $s.children('.notes,.annotation').toggle().is(':visible');
		$s.children('.toggle-notes').html(iv ? "&#9662;" : "&#9656;");
		$.Storage.set('task-notes-visible-' + $s.data('task_id'), (iv ? "1" : "0"));
	}
}

$(document).ready(function() {
	
	$('#reload').click(function() { Tasks.reload_all(true); return false; });
	$('#reload-soft').click(function() { Tasks.reload_all(false); return false; });

	$('.toggle-notes').livequery(function() {
		$(this).click(function() {
			Task.toggle($(this).parents('li.task'));
			return false;
		});
	});
	$('li.task').livequery(function() {
		Task.render_visibility($(this));
	});
	
	$('.annotation').livequery(function() {
		$(this).find('.note').editable(function(value, settings) {
			$('#spinner').show();
			$.post($(this).parents('.annotation').data('endpoint'), { "_method": 'put', "annotation[note]": value }, function(d) {
				$('#spinner').hide();								
			});
			return value;
		}, {
			placeholder: '<span style="color: #aaa">Add a note</span>',
			height: '19px'
		});
		
		$(this).find('input[type=checkbox]').bind('change', function() {
			$('#spinner').show();
			var $that = $(this);
			$.post($(this).parents('.annotation').data('endpoint'), { "_method": 'put', "annotation[pushed]": (this.checked ? 1 : 0) }, function() {
				$that.tooltip().hide();
				Tasks.reload_all(false);
				$('#spinner').hide();				
			});
		}).tooltip({
			position: 'center right',
			offset: [0, 4]
		});
	});
	
	$.get('/delegates.js', function(delegates) {
		_.each(delegates, function(d) {
			$('#delegate-list').append(_.template($('.templates#delegate-task-list').html(), d));
		});
		Tasks.reload_all();
	});
	
});
