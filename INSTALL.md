# Quick Installation Guide

Get the Embed Consent Plugin running in 5 minutes!

## Step 1: Copy Files

Copy the plugin files to your Hugo site:

```bash
# From the plugin directory, copy to your Hugo site:
cp -r layouts/ /path/to/your/hugo/site/
cp -r static/ /path/to/your/hugo/site/
```

Your Hugo site structure should now include:

```
your-hugo-site/
├── layouts/
│   └── shortcodes/
│       └── embed.html          # ← New
├── static/
│   ├── css/
│   │   └── embed-consent.css   # ← New
│   └── js/
│       └── embed-consent.js    # ← New
```

## Step 2: Include Assets

### Option A: Add to Base Template (Recommended)

Edit your `layouts/_default/baseof.html`:

```html
<!DOCTYPE html>
<html lang="{{ .Site.Language.Lang }}">
<head>
    <!-- Your existing head content -->

    <!-- ADD THIS: Embed Consent CSS -->
    <link rel="stylesheet" href="{{ "css/embed-consent.css" | relURL }}">
</head>
<body>
    {{ block "main" . }}{{ end }}

    <!-- Your existing scripts -->

    <!-- ADD THIS: Embed Consent JS -->
    <script src="{{ "js/embed-consent.js" | relURL }}"></script>
</body>
</html>
```

### Option B: Add to Partial (Alternative)

Create or edit `layouts/partials/head.html`:

```html
<link rel="stylesheet" href="{{ "css/embed-consent.css" | relURL }}">
```

Create or edit `layouts/partials/footer.html`:

```html
<script src="{{ "js/embed-consent.js" | relURL }}"></script>
```

Then ensure these partials are included in your base template.

## Step 3: Configure

Add to your `config.toml`:

```toml
[params.embedConsent]
  enableLocalStorage = true
  showAlwaysAllowOption = true
  language = "en"  # or "de" for German
  privacyPolicyUrl = "/privacy/"
```

Or for `config.yaml`:

```yaml
params:
  embedConsent:
    enableLocalStorage: true
    showAlwaysAllowOption: true
    language: en  # or "de" for German
    privacyPolicyUrl: /privacy/
```

## Step 4: Use It!

In any content file (`.md`), add an embed:

```markdown
---
title: "My Post"
date: 2024-01-01
---

Check out this video:

{{< embed provider="youtube" id="dQw4w9WgXcQ" title="Cool Video" >}}
```

## Step 5: Test

1. Start your Hugo server:
   ```bash
   hugo server -D
   ```

2. Visit your post in a browser

3. You should see:
   - A consent overlay with your chosen language
   - A "Load content" button
   - Optional "Always allow" checkbox (if enabled)

4. Click the button - the video should load!

---

## Verification Checklist

- [ ] Files copied to correct locations
- [ ] CSS included in `<head>`
- [ ] JS included before `</body>`
- [ ] Config added to `config.toml` or `config.yaml`
- [ ] Shortcode works in content files
- [ ] Consent overlay appears
- [ ] Video loads after clicking button
- [ ] No console errors

---

## Troubleshooting Quick Fixes

### Styles not loading?
- Check browser DevTools → Network tab
- Ensure `embed-consent.css` is loading (200 OK)
- Try hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### Embeds not working?
- Check browser DevTools → Console tab
- Look for error messages
- Ensure you provided `id` (YouTube/Vimeo) or `url` (ARTE/generic)

### Button does nothing?
- Check that `embed-consent.js` is loading
- Check console for JavaScript errors
- Ensure JS is loaded *after* the HTML content

### Wrong language showing?
- Check `language` setting in `config.toml`
- Supported: `"en"` or `"de"`
- Override per-shortcode with `consent_text`, `button_label` parameters

---

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [EXAMPLES.md](EXAMPLES.md) for usage examples
- See [config.toml.example](config.toml.example) for all options
- Review [CHANGELOG.md](CHANGELOG.md) for version history

---

## Quick Reference

### YouTube
```markdown
{{< embed provider="youtube" id="VIDEO_ID" >}}
```

### Vimeo
```markdown
{{< embed provider="vimeo" id="VIDEO_ID" >}}
```

### ARTE
```markdown
{{< embed provider="arte" url="https://www.arte.tv/player/..." >}}
```

### Generic
```markdown
{{< embed provider="generic" url="https://example.com/embed/123" >}}
```

### With all options
```markdown
{{< embed
    provider="youtube"
    id="VIDEO_ID"
    title="Video Title"
    ratio="16/9"
    thumbnail="/images/thumb.jpg"
    consent_text="Custom consent text"
    button_label="Custom button text"
    always_allow_label="Custom checkbox text"
>}}
```

---

**Need Help?** Check the [README.md](README.md) or open an issue on GitHub.
