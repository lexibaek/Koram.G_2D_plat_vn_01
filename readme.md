# Koram.G_2D_plat_vn

## Adding new levels

Levels are authored using [LDtk](https://ldtk.io/). When adding new levels to the game,
include only the LDtk project file in `src/config/manifest.json`. The
`ManifestLoader` will automatically parse the project and queue all referenced
external level files, so there is no need to list each level JSON individually.

