---
layout: default
title: Home
---
<section class="hero">
  <h1>{{ site.title }}</h1>
  <p>{{ site.description }}</p>
</section>

<section class="featured-posts">
  <h2>Latest Reviews</h2>
  <div class="grid">
    {% for post in site.posts limit:6 %}
    <div class="card">
      <img src="{{ post.image }}" alt="{{ post.title }}">
      <div class="card-content">
        <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
        <p>{{ post.excerpt | strip_html | truncatewords: 30 }}</p>
        <a href="{{ post.url }}" class="btn">Read More</a>
      </div>
    </div>
    {% endfor %}
  </div>
</section>