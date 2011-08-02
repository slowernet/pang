# pang

gem 'sinatra', '>= 1.2.6'
gem 'sinatra-respond_to', '>= 0.7'
gem 'mongo_mapper', '>= 0.9'

begin
	require 'sinatra'
rescue LoadError
	require 'rubygems'
	require 'sinatra'
end

require 'active_support'; $KCODE = 'u'
require 'sinatra_more/markup_plugin' # http://github.com/nesquena/sinatra_more
require 'sinatra/respond_to' # http://github.com/cehoffman/sinatra-respond_to
require 'open-uri'
require 'httparty'
require 'things'
# require 'sinatra/logger' if development?	# https://github.com/kematzy/sinatra-logger
require 'mongo_mapper'

set :views, File.join(File.dirname(__FILE__), "app", "views")
set :root, File.dirname(__FILE__)
set :logger_level, :info if development?
enable :raise_errors

Dir.glob("lib/**/*.rb") { |f| load f }

module Sinatra	
	register SinatraMore::MarkupPlugin
	register Sinatra::RespondTo

	register AssetBundler::ViewHelper
end

configure do
	CONFIG = JSON.parse(IO.read("#{File.dirname(__FILE__)}/config.json")).select { |k,v| ['default', Sinatra::Application.environment.to_s].include?(k) }.map { |a| a.last }.inject({}) { |m,e| m.merge(e) }	

	MongoMapper.connection = Mongo::Connection.new(CONFIG['annotation_db']['host'], CONFIG['annotation_db']['port'])
	MongoMapper.database = CONFIG['annotation_db']['name']
	MongoMapper.database.authenticate(CONFIG['annotation_db']['username'], CONFIG['annotation_db']['password'])
	MongoMapper.handle_passenger_forking
	
	THINGS_DB = Things.new(:database => CONFIG['things_db']['url'])

	helpers AssetBundler::ViewHelper	# http://github.com/gbuesing/asset_bundler
	helpers TextHelpers
end


Dir[File.join(File.dirname(__FILE__), "app", "models", "*.rb")].each { |file| require file }
Dir[File.join(File.dirname(__FILE__), "app", "controllers", "*.rb")].each { |file| require file }