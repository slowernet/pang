require "bundler/capistrano"

load 'deploy' if respond_to?(:namespace) # cap2 differentiator
Dir['vendor/plugins/*/recipes/*.rb'].each { |plugin| load(plugin) }

default_run_options[:pty] = true
set :application, "pang"
set :scm, "git"
set :repository, "git@github.com:slowernet/pang.git"
set :branch, "master"
set :deploy_to, "/home/curbed/apps/pang"
set :keep_releases, 2
set :use_sudo, false
set :user, "curbed"
set :domain, "97.107.139.158"
server domain, :app, :web
role :db, domain, :primary => true

namespace :deploy do
	
	task :tail_production, :roles => :app do
	  stream "tail -f #{current_path}/log/production.log"
	end
	
	desc "Creating tmp directory"
	task :create_tmpdir do
		# Make shared directories.
		%w(
			tmp/
		).each { |path| run "mkdir -p #{release_path}/#{path}" }	
	end

	desc "Symlinking shared directories"
	task :symlink_shared_directories do
		# symlink shared directories
		%w(
			public/assets
			config.json
			tmp
		).each do |path|
			run "rm -rf #{release_path}/#{path}"
			run "ln -sf #{shared_path}/#{path} #{release_path}/#{path}"
		end
	end
	
	desc "Restarting application"
	task :passenger_restart do
		run "touch #{release_path}/tmp/restart.txt"
	end
	
end

after "deploy:update_code", "deploy:symlink_shared_directories"
after "deploy:update_code", "deploy:create_tmpdir"
after "deploy:update_code", "deploy:passenger_restart"
after "deploy:update", "deploy:cleanup"
