# dashboard

A data-rich multi-metric display with charts, big numbers, and KPI indicators. Every panel contains illustrated data visualizations, not just text.

## Structure

### Panel Grid
- A structured grid of data panels/widgets, typically 3-4 columns
- Hero panel (largest) for the most important metric or chart — center or top-left
- Medium panels for secondary metrics with supporting charts
- Small panels for individual KPIs (big number + trend indicator)
- 6-10 total panels filling the canvas

### Panel Content
Each panel is a complete data visualization, not just a number on a background:
- **Chart panels**: Hand-drawn or styled charts (line charts, bar charts, area charts, pie charts, gauges)
- **KPI panels**: Large numbers with trend arrows, sparklines, and comparison context
- **Table panels**: Small data tables with highlighted rows
- **Status panels**: Traffic light indicators, progress bars, or gauge dials
- Every panel must have actual chart/visualization content — never just plain text

### Visual Treatment
- Charts rendered in the specified style (hand-drawn for craft, neon for cyberpunk, etc.)
- Data points clearly plotted and labeled
- Trend indicators (arrows, color coding: green for up, red for down)
- Grid lines and axes shown but subtle
- Legend or labels directly on chart elements (not in separate legend boxes)

## Text Placement

- Title: large, prominent at the very top with date range indicator
- Panel titles: bold, above each widget
- Metric values: rendered LARGE as the focal point of each panel
- Units: clearly shown next to values
- Trend context: "+12% vs last quarter" style annotations
- Axis labels: on charts

### Bottom Stats Bar
- Horizontal strip at the bottom summarizing 4-6 headline metrics
- Format: "LABEL | VALUE | TREND" with dividers
- Darker or contrasting background

## Composition Flow

1. Eye enters at the title
2. Drawn to the hero panel (largest/most prominent metric)
3. Scans across panels in grid order
4. Stats bar at bottom for quick summary

## Best For

- KPI summaries and performance reports
- Market analysis and analytics overviews
- Financial snapshots and quarterly reviews
- Status reports and monitoring dashboards

## Recommended Pairings

- `corporate-memphis`: Clean business dashboards
- `technical-schematic`: Engineering and technical metrics
- `cyberpunk-neon`: Futuristic data displays
- `bold-graphic`: High-impact metric presentations
