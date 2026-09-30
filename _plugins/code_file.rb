require "rouge"

# {% code_file path/from/site/root.jsx [region=name] [lang=jsx] %}
#
# Renders a source file (or one `#region name` … `#endregion` block of it) as a highlighted code
# block, without running it through Liquid — JSX `{{ … }}` would otherwise be eaten as Liquid.
# Region marker lines are always stripped from the output.
module Jekyll
  class CodeFileTag < Liquid::Tag
    REGION = /#(?:end)?region\b/

    def initialize(tag_name, markup, tokens)
      super
      parts = markup.strip.split(/\s+/)
      @path = parts.shift
      @opts = parts.to_h { |p| p.split("=", 2) }
    end

    def render(context)
      site = context.registers[:site]
      file = site.in_source_dir(@path)
      raise ArgumentError, "code_file: #{@path} not found" unless File.file?(file)

      lines = File.readlines(file)
      if (name = @opts["region"])
        start = lines.index { |l| l =~ /#region #{Regexp.escape(name)}\b/ }
        raise ArgumentError, "code_file: region #{name} not found in #{@path}" unless start
        stop = lines[start..].index { |l| l =~ /#endregion/ }
        lines = lines[(start + 1)...(start + stop)]
      end
      lines = lines.reject { |l| l =~ REGION }
      indent = lines.reject { |l| l.strip.empty? }.map { |l| l[/\A */].size }.min || 0
      code = lines.map { |l| l.strip.empty? ? "\n" : l[indent..] }.join.strip

      lang = @opts["lang"] || File.extname(file).delete(".")
      lexer = Rouge::Lexer.find_fancy(lang, code) || Rouge::Lexers::PlainText
      html = Rouge::Formatters::HTML.new.format(lexer.lex(code))
      label = @opts["label"] || File.basename(@path)
      %(<div class="language-#{lang} highlighter-rouge framed" data-file="#{label}">) +
        %(<div class="highlight"><pre class="highlight"><code>#{html}</code></pre></div></div>)
    end
  end
end

Liquid::Template.register_tag("code_file", Jekyll::CodeFileTag)
