# Security Best Practices for Integrations

To ensure the "Mindful Breathing" ecosystem is deployed securely across all platforms, follow these guidelines.

## 1. Web / Universal (Ghost, Webflow, Custom)

### Subresource Integrity (SRI)

When loading the script from a CDN, always use SRI to prevent "Man-in-the-Middle" attacks if the CDN is compromised.

**Secure:**

```html
<script src="https://example.com/widget.js" integrity="sha384-..." crossorigin="anonymous"></script>
```

### Content Security Policy (CSP)

Enforce a strict deny-by-default CSP with zero `'unsafe-inline'` or `'unsafe-eval'` in `script-src` to preserve Mozilla HTTP Observatory Grade A+ (125/100) bonus gates:

```
Content-Security-Policy: default-src 'none'; script-src 'self' https://philgear.github.io; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; manifest-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self';
```

### Mandatory Edge Security Headers (Mozilla Observatory 125/100)

When self-hosting on Firebase Hosting, Vercel, Netlify, Cloudflare, or Express/Spring Boot, configure the following HTTP response headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
```

## 2. LMS Platforms (Canvas, Moodle)

### Moodle

- **API Usage**: Never inject `<script>` tags directly. Use `$PAGE->requires->js()`.
- **Capabilities**: Define strict capabilities in `access.php` to restrict block placement.

### Canvas (LTI)

- **HTTPS**: Ensure the `launch_url` is strictly `https`.
- **Authentication**: Prefer LTI 1.3 (OIDC/JWT) over LTI 1.1.

## 3. CMS (Drupal, Shopify, Ghost)

### Shopify

- **Assets**: Host scripts within Shopify's **Assets** folder (Theme App Extension).
- **Isolation**: Use specific class names or Shadow DOM to avoid global scope pollution.

### Ghost

- **Code Injection**: Validate any code injected into the footer. Prefer using the vetted `Web Component` integration.

## 4. AI Agents (MCP Server)

- **Input Validation**: Strictly validate all tool arguments.
- **Sanitization**: Do not execute arbitrary code or shell commands based on LLM input.
- **Information Leakage**: Return structured, sanitized error messages, never raw stack traces.

## 5. System & Native (Mobile/CLI)

- **Immutability**: Use frozen objects (`Object.freeze`, `let`, `final`, `val`) for configuration.
- **Dependencies**: Minimize external deps. Audit `package.json`, `Gemfile`, `Cargo.toml` regularly.
- **Permissions**: Only request necessary permissions (e.g., Audio, Haptics/Vibrate). Do not request Location or Contacts.

## 6. General Guidelines

- **Terminology**: Use **"Mindful"** terminology. Avoid "Zen" to maintain neutrality.
- **Context**: Refer to `.gemini` in the root for approved constants and standards.
