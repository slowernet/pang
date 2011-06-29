class Annotation
	include MongoMapper::Document
	
	key	:task_id, String, :required => true, :index => true
	key :note, String
	key :pushed, Boolean
end