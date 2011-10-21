before do
	THINGS_DB = Things.new(:database => CONFIG['things']['db_url']) if ("1" == params[:reload])
end

get '/?' do
	erb :index
end

get '/delegates/?' do
	delegates = []
	 Task.delegates.each do |c|
		delegates << { :delegate_id => c.attributes['id'], :name => c.at('/attribute[@name=title]').inner_text } if CONFIG['things']['delegate_ids'].include?(c.attributes['id'])
	end
	delegates << { :delegate_id => 'default', :name => CONFIG['default_delegate']['name'] }
	
	respond_to do |wants|
		wants.js {
			content_type 'application/json', :charset => 'utf-8'
			delegates.to_json
		}
	end	
end

get '/tasks/:delegate_id' do
	respond_to do |wants|
		wants.js {
			content_type 'application/json', :charset => 'utf-8'
			Task.delegated_to(params[:delegate_id]).map do |t|
				t['notes'] = simple_format(t['notes'])
				t['annotation']['note'] = simple_format(t['annotation']['note']) unless t['annotation'].nil?
				t
			end.to_json
		}
	end	
end

put '/tasks/:task_id' do
	a = Annotation.where(:task_id => params[:task_id]).first || Annotation.new(:task_id => params[:task_id])
	a.update_attributes!(params[:annotation])
end