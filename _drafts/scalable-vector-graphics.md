---
title: "SVG: Scalable Vector Graphics"
category: tutorials
---
This is a quick tutorial for SVG, bluntly copying from MDN and Wiki with the purpose of pointing newcomers towards
the important stuff, which aren't always easy to come by when going over refs.

Before we dive in let's get the terminology straight.

##### The Good Parts - Quick and Dirty

I'm gonna assume you know HTML, CSS & JS
I'm gonna skim over everything and summarize it into cheatsheets & tables

##### Introduction to Vector Graphics

[Vector graphics](https://en.wikipedia.org/wiki/Vector_graphics){:target="_blank"} is a form of computer graphics in
which visual images
are created directly from geometric shapes defined on a Cartesian plane, such as points, lines, curves and polygons.

SVG is an XML-based markup language for describing two-dimensional based vector graphics.

<img width="290" height="185" class="float" alt="Raster vs SVG" src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Bitmap_VS_SVG.svg/435px-Bitmap_VS_SVG.svg.png" />
As such, it's a text-based, open Web standard for describing images that can be rendered cleanly at any size and are 
designed specifically to work well with other web standards including CSS, DOM and JavaScript. SVG is, essentially, 
to graphics what HTML is to text.

SVG images and their related behaviors are defined in XML text files, which means they can be searched, indexed,
scripted, and compressed. Additionally, this means they can be created and edited with any text editor or with
drawing software.

Compared to classic bitmap image formats such as JPEG or PNG, SVG-format vector images can be rendered at any size
without loss of quality and can be easily localized by updating the text within them, without the need of a graphical
editor to do so. With proper libraries, SVG files can even be localized on-the-fly.

##### Rectangle

```xml
<rect x="10" y="10" width="30" height="30"/> <!-- OR -->
<rect x="60" y="10" rx="10" ry="10" width="30" height="30"/>
```

| Attribute | Description                                            |
|-----------|--------------------------------------------------------|
| `x`       | The x position of the top left corner of the rectangle |
| `y`       | The y position of the top left corner of the rectangle |
| `width`   | The width of the rectangle                             |
| `height`  | The height of the rectangle                            |
| `rx`      | The x radius of the corners of the rectangle           |
| `ry`      | The y radius of the corners of the rectangle           |

##### Circle

```xml
<circle cx="25" cy="75" r="20"/>
```

| Attribute | Description                                |
|-----------|--------------------------------------------|
| `r`       | The radius of the circle                   |
| `cx`      | The x position of the center of the circle |
| `cy`      | The y position of the center of the circle |

##### Ellipse

```xml
<ellipse cx="75" cy="75" rx="20" ry="5"/>
```

| Attribute | Description                                 |
|-----------|---------------------------------------------|
| `rx`      | The x radius of the ellipse                 |
| `ry`      | The y radius of the ellipse                 |
| `cx`      | The x position of the center of the ellipse |
| `cy`      | The y position of the center of the ellipse |

##### Line

```xml
<line x1="10" x2="50" y1="110" y2="150"/>
```

| Attribute | Description               |
|-----------|---------------------------|
| `x1`      | The x position of point 1 |
| `y1`      | The y position of point 1 |
| `x2`      | The x position of point 2 |
| `y2`      | The y position of point 2 |

##### Polyline

```xml
<polyline points="60, 110 65, 120 70, 115 75, 130 80, 125 85, 140 90, 135 95, 150 100, 145"/>
```

| Attribute | Description                                                                                                                                                                                                                                                 |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `points`  | A list of points. Each number must be separated by a space, comma, EOL, or a line feed character. Each point must contain two numbers: an x coordinate and a y coordinate. So, the list `(0,0)`, `(1,1)`, and `(2,2)` would be written as `0, 0 1, 1 2, 2`. |

##### Polygon

```xml
<polygon points="50, 160 55, 180 70, 180 60, 190 65, 205 50, 195 35, 205 40, 190 30, 180 45, 180"/>
```

| Attribute | Description                                                                                                                                                                                                                                                                                                                                           |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `points`  | A list of points, each number separated by a space, comma, EOL, or a line feed character. Each point must contain two numbers: an x coordinate and a y coordinate. So, the list `(0,0)`, `(1,1)`, and `(2,2)` would be written as `0, 0 1, 1 2, 2`. The drawing then closes the path, so a final straight line would be drawn from `(2,2)` to `(0,0)` |

##### Path

```xml
<path d="M20,230 Q40,205 50,230 T90,230"/>
```

| Attribute | Description                                                                                            |
|-----------|--------------------------------------------------------------------------------------------------------|
| `d`       | A list of points and other information about how to draw the path. See the [Paths](/) section for more |

Scalable Vector Graphics, SVG, is an XML dialect to mark up graphics.

Are you tired of pixelated images when you resize your graphics for the web? Say goodbye to blurry logos and fuzzy icons
with Scalable Vector Graphics (SVG). In this article, we'll introduce you to the world of SVG and explain how this
powerful image format can take your web design to the next level. By the end of this article, you'll have a solid
understanding of SVG and how to use it in your web projects. So, let's dive in!

### OLD: Let's demystify SVG

SVG is a popular image format among web developers for its ability to scale and be manipulated with text editors.
While it may seem intimidating at first because it uses XML-based text files, SVG is actually quite simple and powerful
once you understand the basics.

As a vector image format, SVG uses mathematical formulas to draw lines and shapes, allowing images to be resized without
losing quality. This makes it an excellent choice for logos, icons, and other graphics that need to be resized
frequently. SVG images can be created and edited with a wide range of tools, including free and commercial software.

In addition to its scalability, SVG offers several other benefits for web development. SVG images are lightweight and
can be easily compressed for use on the web. They can also be searched, indexed, and scripted, giving you more control
over their behavior. And because all modern web browsers support SVG, you can easily incorporate these images into your
web projects.

So, why should you use SVG in your web development projects? In short, it offers a number of advantages over other image
formats. Its ability to scale and be manipulated with text editors makes it a valuable tool for creating responsive
designs. And its compatibility with web browsers and support for features like compression and scripting make it a
versatile choice for a wide range of web projects.

Overall, SVG may seem mysterious at first, but it's actually a powerful and flexible image format for web developers. If
you're looking to improve the graphics in your web projects, give SVG a try.

