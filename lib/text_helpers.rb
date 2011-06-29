module TextHelpers
	def simple_format(text, html_options={})
		start_tag = "<p>"
		text = text.to_s.dup
		text.gsub!(/\r\n?/, "\n")                    # \r\n and \r -> \n
		text.gsub!(/\n\n+/, "</p>\n\n#{start_tag}")  # 2+ newline  -> paragraph
		text.gsub!(/([^\n]\n)(?=[^\n])/, '\1<br />') # 1 newline   -> br
		text.insert 0, start_tag
		text << "</p>"
	end
end