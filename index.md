---
title: About me
---
{% capture README %}
{% include_relative README.md %}
{% endcapture %}
<article>{{ README | markdownify }}</article>
{% include post-list.html title="Recently Published" limit=5 %}
