# Teng - Documentation
[Work in Progress]

<br><br>

## Contents:
- [General Information](#general-information)
    - [Versioning](#versioning)
- [Code Overview [WIP]](./code-overview.md#readme)

<br><br>

## General Information:
This section contains some general info about Teng

<br>

### Versioning:
Teng uses Node.js' standard versioning scheme called [SemVer (Semantic Versioning).](https://semver.org/)  
The basic format is:
```
MAJOR.MINOR.PATCH
```

1. MAJOR is incremented if there's very big changes that could break backwards compatibility
2. MINOR is incremented if functionality is added but backwards compatibility is preserved
3. PATCH is incremented when there are backwards compatible bug fixes

For alpha versions, major and minor are set to 0, so the format `0.0.x` is used.  
  
To work with these version numbers, you should use Node's native [`semver` package.](https://www.npmjs.com/package/semver)  
