---
tags:
  - style-sheet
---

# Code

Inline code in a sentence: run `status --all`, then read `logs/today.txt`. Long inline code wraps: `lorem.ipsum.dolor.sit.amet.consectetur.adipiscing.elit()`.

Ligatures: `!= == === !== => -> <= >= :: ++ && ||`

## TypeScript

```ts
// Query the main system
const PRIORITY = 937;

interface CrewMember {
  name: string;
  awake: boolean;
}

export async function query(crew: CrewMember[]): Promise<string> {
  if (crew.length !== 0 && crew.every((c) => !c.awake)) {
    return "all asleep";
  }
  return crew.map((c) => `${c.name}: ${c.awake ? "awake" : "asleep"}`).join("\n");
}
```

## Python

```python
from dataclasses import dataclass

@dataclass
class Reading:
    sensor: str
    value: float = 0.0

def average(readings: list[Reading]) -> float:
    """Return the mean of all readings."""
    if not readings:
        return 0.0
    return sum(r.value for r in readings) / len(readings)  # simple mean
```

## Rust

```rust
#[derive(Debug, Clone)]
struct Course {
    heading: f64,
    burn_seconds: u32,
}

fn plot(course: &Course) -> Result<String, &'static str> {
    match course.burn_seconds {
        0 => Err("no burn"),
        n => Ok(format!("heading {:.1} for {n}s", course.heading)),
    }
}
```

## Shell

```bash
#!/usr/bin/env bash
set -euo pipefail

for log in logs/*.txt; do
  echo "Reading ${log}"
  grep -c "ALERT" "$log" || true
done
```

## JSON

```json
{
  "name": "fa-th-ur",
  "version": "0.1.0",
  "dark": true,
  "accent": "#e5a54b",
  "tags": ["warm", "minimal", null]
}
```

## CSS

```css
.theme-dark {
  --background-primary: #32302f;
  --text-accent: #e5a54b;
}

.markdown-rendered h1:hover {
  text-shadow: 0 0 0.6em rgb(229 165 75 / 0.22);
}
```

## HTML

```html
<section class="log" data-level="2">
  <h2>Interface ready</h2>
  <p>Lorem <strong>ipsum</strong> dolor.</p>
</section>
```

## Diff

```diff
- --text-muted: #5f554d;
+ --text-muted: #504945;
  --text-faint: #665c54;
```

## Plain text block

```
No language. Lorem ipsum dolor sit amet.
┌──────────┐
│ ░▒▓ OK ▓▒░ │
└──────────┘
```

## Indented code

    Four spaces make an indented code block.
    Lorem ipsum dolor sit amet.
