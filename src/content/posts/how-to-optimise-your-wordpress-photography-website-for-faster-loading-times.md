---
title: "How to Optimise Your Wordpress Photography Website for Faster Loading Times"
description: "If you’re a photographer and looking to boost the speed of your Wordpress website, optimising your images is the first and most effective step you can take to"
summary: "Easy tactics for photographers who want sharp images and quick loading speeds"
published: 2023-12-22
updated: 2024-03-14
categories: ["Web Development"]
image:
  src: "../../assets/images/posts/how-to-optimise-your-wordpress-photography-website-for-faster-loading-times/how-to-optimise-images-img.webp"
  alt: "A photo in an image editor, with a bar showing the file reduced from 155MB to 200KB"
template: text  # the theme's "single post without featured image" template
---
If you’re a photographer and looking to boost the speed of your Wordpress website, optimising your images is the first and most effective step you can take to achieve this.  As a photographer, you want to showcase your best work online. It is important that when potential clients encounter your portfolio for the first time, that you impress with sharp, high-quality images, but large images can slow down your website significantly. Images are one of the most resource-intensive elements on a web page, so optimising them is crucial for your site speed.

## Importance of optimising images for web performance

Now you may be wondering why the speed of your website matters. The harsh truth is that Google penalises websites that are slow to load and if your aim is to have your website be visible to as many potential clients as possible then it's important that when people look for your website, it’s positioned high in the search results and isn't hidden.

Furthermore the longer it takes to view your website, the higher the bounce rate , a metric that measures how many visitors leave your website after viewing one page or one piece of content.  A study from Google showed that the bounce rate increases by 32% as load times go from 1 to 3 seconds.  So it is in your best interest to aim for load times of under 3 seconds.

Here are five tips to help you optimise you website images today.

## Use the default image block

This tip is primarily for photographers who are at the start of building their websites. When building your galleries and showcase pages, utilise the Gutenberg Image. By default, when you upload images to your Wordpress image library, Wordpress creates four sizes of your image. When you use the Image block, it takes full advantage of these sizes by providing your browser with size options to choose from, allowing your browser to make the decision on which file to load. This means your audience will always view fast loading images without the compromise on quality.

## Take control of image compression

Wordpress is not only for photographers but anyone who has something to present online. So it’s to everyone’s benefit to have a performant fast page loading website. The way Wordpress helps with that is to by default, compress images to 85%. However this setting doesn’t allow photographers to have full control of how their images are presented. An approach you can take to change this is to add the following into your functions.php:

PHP

```
add_filter ('jpeg_quality', function($arg) {return 100;});
```

This code snippet will ensure that all jpeg images uploaded to your media library are not compressed.

## Scale your images

Uploading images to your website can be like walking a tightrope: If you lean far too much to one side, you’ll have sharp but large images files while leaning too much in the opposite direction will leave you with small, blurry image files. The best approach is to pay attention to what the image will be used for. If the image is be the featured full width at the top of your home page, then uploading an image that is no larger than 1800px will ensure that the image is not blurry across all devices. However if you are only using the image as a thumbnail, then scale your image down to a size smaller than 400px before using the image on your website.

## Use photo editing software

There are many tools you can use to scale your images before using them on your website.

For quick optimisation of a lot of images, I use [JPEGMini](https://www.jpegmini.com/). It is a paid tool ,trusted by many photographers, that can reduce the size of your images by up to 80% without compromising on quality. It allows you to choose from small, medium and larger image sizes, as well as specifying your own image size in pixels.

While JPEGmini only allows you to resize jpegs and HEIC file formats, [Affinity Photo](https://affinity.serif.com/en-gb/photo/) allow you to resize all image formats. I’ve found the best results by starting a project at 240dpi and setting the image quality to 90% on export. [Canva](https://www.canva.com/) and [Photopea](https://www.photopea.com/) are free online design apps that are allow you to do similar.

## Convert your images to Webp

If you’re looking to squeeze better image quality out of a smaller file, then consider converting your images to the webp format. The format is supported by all modern browsers and does a good job of maintaining image quality at a smaller file size. Affinity Photo provides you with the option to convert images to webp. For images uploaded to your Wordpress image library, [Imagify](https://imagify.io/) provides a more efficient solution, by converting many images at a time while giving you control over which images you want to convert. It also allows you to resize images like I mentioned earlier.

## You can have sharp images and a snappy website

Optimising images on your WordPress photography website is crucial for faster loading times and improved web performance. By following these techniques, you can showcase your best work while ensuring a seamless browsing experience for your visitors.
