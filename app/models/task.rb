class Task
	def self.delegates
		THINGS_DB.database.search("//object[@type='COWORKER']")
	end
	
	def self.delegated_to(delegate_id)
		tasks = []
		[:today, :next_actions].each do |context|
			THINGS_DB.instance_eval(context.to_s).map do |task|
				xml = task.instance_variable_get('@xml_node')
				if [0, nil].include?(task.status) && (xml.at("relationship[@name=delegate]").attributes['idrefs'].split.include?(delegate_id))
					task.instance_variable_set('@task_id', xml.attributes["id"])
					tasks << task
				end
			end
		end

		annotations = Annotation.where(:task_id => tasks.map { |t| t.instance_eval('@task_id') }.uniq ).all

		# pluck the task fields and splice in annotations
		tasks = tasks.map do |t| 
			['@task_id', :title, :notes, :index, :tags, :status].inject({}) do |acc, f| 
				acc[f.to_s.sub(/^@/,'')] = t.instance_eval(f.to_s); acc 
			end
		end.map do |t|
			t.merge(:annotation => annotations.find { |a| t['task_id'] == a.task_id } || Annotation.new)
		end
	end
	
end