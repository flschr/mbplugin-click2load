# Embed Consent Plugin - Usage Examples

This file contains comprehensive examples of how to use the `embed` shortcode in your Hugo content files.

## Basic Examples

### YouTube Video (Simple)

```markdown
{{< embed provider="youtube" id="dQw4w9WgXcQ" >}}
```

### YouTube Video (With Title)

```markdown
{{< embed provider="youtube" id="dQw4w9WgXcQ" title="Rick Astley - Never Gonna Give You Up (Official Music Video)" >}}
```

### Vimeo Video

```markdown
{{< embed provider="vimeo" id="76979871" title="The New Vimeo Player (You Know, For Videos)" >}}
```

### ARTE Video

```markdown
{{< embed provider="arte" url="https://www.arte.tv/player/v5/index.php?json_url=https%3A%2F%2Fapi.arte.tv%2Fapi%2Fplayer%2Fv2%2Fconfig%2Fde%2F123456-000-A" title="ARTE Documentary" >}}
```

### Generic Embed

```markdown
{{< embed provider="generic" url="https://example.com/embed/video/12345" title="Custom Video Player" >}}
```

## Advanced Examples

### Custom Aspect Ratios

#### Ultra-Wide (21:9)

```markdown
{{< embed provider="youtube" id="dQw4w9WgXcQ" ratio="21/9" title="Cinematic Video" >}}
```

#### Square (1:1)

```markdown
{{< embed provider="youtube" id="dQw4w9WgXcQ" ratio="1/1" title="Square Video" >}}
```

#### Classic (4:3)

```markdown
{{< embed provider="youtube" id="dQw4w9WgXcQ" ratio="4/3" title="Classic Format Video" >}}
```

### With Thumbnail Preview

```markdown
{{< embed
    provider="youtube"
    id="dQw4w9WgXcQ"
    title="Rick Astley - Never Gonna Give You Up"
    thumbnail="/images/video-previews/rickroll-thumb.jpg"
>}}
```

### Custom Text Overrides

#### Override Consent Text

```markdown
{{< embed
    provider="youtube"
    id="dQw4w9WgXcQ"
    consent_text="This video is hosted by YouTube. Loading it will send data to Google."
>}}
```

#### Override Button Label

```markdown
{{< embed
    provider="youtube"
    id="dQw4w9WgXcQ"
    button_label="Watch Video"
>}}
```

#### Override All Text (Custom Language)

```markdown
{{< embed
    provider="youtube"
    id="dQw4w9WgXcQ"
    consent_text="Esta video es alojada por YouTube. Al cargarlo, se transmitirán datos a Google."
    button_label="Cargar video"
    always_allow_label="Permitir siempre videos externos"
>}}
```

### Complete Example with All Options

```markdown
{{< embed
    provider="youtube"
    id="dQw4w9WgXcQ"
    title="Rick Astley - Never Gonna Give You Up (Official Music Video)"
    ratio="16/9"
    thumbnail="/images/thumbnails/rickroll.jpg"
    consent_text="This video is hosted on YouTube. By loading it, you agree to YouTube's privacy policy."
    button_label="Load YouTube Video"
    always_allow_label="Always load YouTube videos automatically"
>}}
```

## Real-World Use Cases

### Blog Post with Multiple Videos

```markdown
---
title: "My Favorite Music Videos of 2024"
date: 2024-01-15
---

Here are my top 5 music videos from last year!

## #5: Artist Name - Song Title

{{< embed provider="youtube" id="abc123def45" title="Artist - Song" >}}

This video features amazing choreography...

## #4: Another Artist - Different Song

{{< embed provider="youtube" id="xyz789ghi01" title="Another Artist - Song" >}}

The cinematography in this one is incredible...
```

### Educational Content with ARTE Documentaries

```markdown
---
title: "Recommended Documentaries About Climate Change"
date: 2024-02-20
---

## Documentary 1: Climate Crisis

{{< embed
    provider="arte"
    url="https://www.arte.tv/player/v5/index.php?json_url=..."
    title="ARTE: Climate Crisis Documentary"
    thumbnail="/images/climate-doc-thumb.jpg"
>}}

This ARTE documentary explores...

## Documentary 2: Renewable Energy

{{< embed
    provider="arte"
    url="https://www.arte.tv/player/v5/index.php?json_url=..."
    title="ARTE: The Future of Energy"
>}}

An in-depth look at renewable energy solutions...
```

### Tutorial Series with Custom Thumbnails

```markdown
---
title: "Web Development Tutorial Series"
date: 2024-03-10
---

## Lesson 1: HTML Basics

{{< embed
    provider="youtube"
    id="lesson1abc"
    title="HTML Tutorial - Lesson 1"
    thumbnail="/images/tutorials/html-lesson1.jpg"
    ratio="16/9"
>}}

In this lesson, we cover...

## Lesson 2: CSS Fundamentals

{{< embed
    provider="youtube"
    id="lesson2def"
    title="CSS Tutorial - Lesson 2"
    thumbnail="/images/tutorials/css-lesson2.jpg"
    ratio="16/9"
>}}

Now let's style our HTML...
```

### Multilingual Site (German Example)

```markdown
---
title: "Interessante Dokumentationen"
date: 2024-04-05
lang: de
---

## Natur und Umwelt

{{< embed
    provider="youtube"
    id="naturdoku123"
    title="Natur Dokumentation"
    consent_text="Dieses Video wird von YouTube bereitgestellt. Durch das Laden werden Daten an Google übertragen."
    button_label="Video laden"
    always_allow_label="YouTube-Videos immer automatisch laden"
>}}

Diese Dokumentation zeigt...
```

### Vimeo Portfolio Showcase

```markdown
---
title: "My Video Production Portfolio"
date: 2024-05-12
---

## Commercial Work

### Brand Campaign 2024

{{< embed
    provider="vimeo"
    id="987654321"
    title="Brand Campaign - Director's Cut"
    thumbnail="/images/portfolio/brand-campaign.jpg"
    ratio="21/9"
>}}

### Product Launch Video

{{< embed
    provider="vimeo"
    id="876543210"
    title="Product Launch Event"
    thumbnail="/images/portfolio/product-launch.jpg"
>}}
```

### Conference Talk Recordings

```markdown
---
title: "My Speaking Engagements"
date: 2024-06-18
---

## Tech Conference 2024 - Keynote

{{< embed
    provider="youtube"
    id="keynote2024"
    title="Building Scalable Applications - Keynote Talk"
    ratio="16/9"
    consent_text="This conference recording is hosted on YouTube."
    button_label="Watch Keynote"
>}}

**Topics covered:**
- Microservices architecture
- Database scaling strategies
- Performance optimization

**Slides:** [Download PDF](/slides/keynote-2024.pdf)
```

## Error Handling Examples

### Missing Required Parameter (YouTube without ID)

```markdown
<!-- This will show an error message -->
{{< embed provider="youtube" >}}
```

### Missing Required Parameter (Generic without URL)

```markdown
<!-- This will show an error message -->
{{< embed provider="generic" title="Some Video" >}}
```

### Correct Usage After Error

```markdown
<!-- Correct: Provide the id parameter -->
{{< embed provider="youtube" id="dQw4w9WgXcQ" >}}

<!-- Correct: Provide the url parameter -->
{{< embed provider="generic" url="https://example.com/embed/123" >}}
```

## Integration with Hugo Features

### Using with Hugo Page Resources

```markdown
---
title: "My Video Post"
resources:
- src: "video-thumbnail.jpg"
  name: "thumb"
---

{{< embed
    provider="youtube"
    id="abc123"
    thumbnail="/images/video-thumbnail.jpg"
>}}
```

### Using with Front Matter Variables

```markdown
---
title: "Featured Video"
videoID: "dQw4w9WgXcQ"
videoProvider: "youtube"
---

{{< embed provider=.Params.videoProvider id=.Params.videoID >}}
```

## Tips and Best Practices

1. **Always provide meaningful titles** for accessibility
2. **Use thumbnails** for important videos to improve visual appeal
3. **Override consent text** when you need to be more specific about data handling
4. **Choose appropriate aspect ratios** based on your content
5. **Test without JavaScript** to ensure noscript fallback works
6. **Consider your privacy policy** when configuring localStorage options

## Testing Your Embeds

After adding embeds to your content:

1. Build your Hugo site: `hugo server`
2. Check that embeds display correctly
3. Test the consent overlay functionality
4. Verify localStorage behavior (if enabled)
5. Test on mobile devices
6. Verify accessibility with screen readers
7. Check console for any JavaScript errors

## Debugging

If an embed isn't working:

1. **Check the browser console** for errors
2. **Verify parameters**: Ensure `id` (YouTube/Vimeo) or `url` (ARTE/generic) is provided
3. **Check URL format**: ARTE URLs should be the full player URL with json_url parameter
4. **Validate YouTube ID**: Should be 11 characters (e.g., `dQw4w9WgXcQ`)
5. **Check Vimeo ID**: Should be numeric (e.g., `76979871`)
6. **Inspect HTML output**: Use browser DevTools to examine the generated HTML

---

For more information, see the main [README.md](README.md) file.
