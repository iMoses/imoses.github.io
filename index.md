---
title: About me
---
<article>
{% capture README %}
{% include_relative README.md %}
{% endcapture %}
{{ README | markdownify }}
</article>

---

## Recently Published
{% for post in site.posts limit:5 %}
{%- include post-card.html content=post -%}
{% endfor %}
