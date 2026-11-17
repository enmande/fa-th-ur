---
tags:
  - style-sheet
---

# Callouts

> [!note]
> Lorem ipsum dolor sit amet, consectetur adipiscing elit.

> [!abstract] Abstract
> Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

> [!info]
> Ut enim ad minim veniam, quis nostrud exercitation.

> [!todo]
> - [ ] Ullamco laboris nisi ut aliquip
> - [x] Ex ea commodo consequat

> [!tip]
> Duis aute irure dolor in reprehenderit in voluptate.

> [!success]
> Velit esse cillum dolore eu fugiat nulla pariatur.

> [!question]
> Excepteur sint occaecat cupidatat non proident?

> [!warning]
> Sunt in culpa qui officia deserunt mollit anim.

> [!failure]
> Id est laborum. Curabitur pretium tincidunt lacus.

> [!danger]
> Nulla gravida orci a odio. Nullam varius, turpis et commodo.

> [!bug]
> Pharetra, est eros bibendum elit, nec luctus magna felis.

> [!example]
> Sollicitudin mauris. Integer in mauris eu nibh euismod gravida.

> [!quote]
> Duis ac tellus et risus vulputate vehicula.
> — Lorem Ipsum

## Callouts with rich content

> [!info] Title with **bold** and `code`
> A paragraph with a [[Welcome|link]], a #tag, and ==highlighted text==.
>
> ```ts
> const status = query("all");
> ```
>
> | Key | Value |
> |-----|-------|
> | Lorem | Ipsum |

## Foldable callouts

> [!tip]- Closed by default
> Lorem ipsum dolor sit amet. Open this callout to read it.

> [!warning]+ Open by default
> Consectetur adipiscing elit. Close this callout to hide it.

## Nested callouts

> [!note] Outer callout
> Lorem ipsum dolor sit amet.
>
> > [!danger] Inner callout
> > Consectetur adipiscing elit.
