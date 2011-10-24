_.templateSettings = {
    evaluate    : /\#\[([\s\S]+?)\]/g,
	interpolate : /\#\{(.+?)\}/g
};

var Tasks = {
	reload: function() {
		$('#spinner').show();
		$('div.delegate-task-list > ul').empty();
	
		var ids = $('div.delegate-task-list').map(function() { return $(this).data('delegate_id') }).get();
		
		$.ajax({
			url: '/tasks/' + ids.join(',') + '.js',
			success: function(tasks) {

				var dul = $('div[data-delegate_id="pushed"] > ul');

				$(tasks).each(function(i, task) {
					var ul = $('div[data-delegate_id="' + task.delegate_id + '"] > ul');
					(task.annotation.pushed ? dul : ul).append(_.template($('.templates#task').html(), task)).linkify();
				});
				$('#menu a').removeClass('disabled');
				$('#spinner').hide();
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
	},
}

$script.ready('bundle', function() {
	$(document).ready(function() {

		$('#reload').click(function() { Tasks.reload(); return false; });
		// $('#reload-soft').click(function() { Tasks.reload_all(false); return false; });

		$('.toggle-notes').live('click', function() {
			Task.toggle($(this).parents('li.task'));
			return false;
		});
		
		$('#toggle-all-notes').live('click', function() {
			$('li.task').each(function() {
				Task.toggle($(this));
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
					// Tasks.reload();
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
			Tasks.reload();
		});

	});
});
