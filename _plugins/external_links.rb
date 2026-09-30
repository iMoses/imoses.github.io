# Opens links to other sites in a new tab. Runs on the rendered HTML of every page and post, so it
# covers layouts, includes and Markdown content alike. Same-site links and mailto: are left alone.
Jekyll::Hooks.register [:pages, :documents], :post_render do |doc|
  next unless doc.output_ext == ".html"

  own_host = URI(doc.site.config["url"].to_s).host
  doc.output = doc.output.gsub(/<a\s([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>/) do |tag|
    attrs = "#{Regexp.last_match(1)}#{Regexp.last_match(3)}"
    host = URI(Regexp.last_match(2)).host rescue nil
    next tag if host.nil? || host == own_host || attrs.include?("target=")

    tag.sub(/>\z/, ' target="_blank" rel="noopener">')
  end
end
