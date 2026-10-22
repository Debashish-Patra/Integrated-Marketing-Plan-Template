# Integrated Marketing Plan Template

An industry-agnostic template for writing an integrated marketing plan. It has 13 sections that cover every facet of integrated marketing: diagnosis, objectives, segments, positioning, messaging, experience commitments, channels, budget, funnel model, lifecycle, measurement, governance and risk, and roadmap. Each section has a fill-in table, a worked example from an investing platform and from an airline, and quality checks. The page ends with a list of common planning gaps and a final review checklist.

All numbers are illustrative round figures created for teaching. None comes from a real company.

## Structure

```
integrated-marketing-plan-template/
├── index.html        The whole template (plan on a page, 13 sections, gaps, checklist)
├── assets/
│   ├── style.css     Styles (light and dark, responsive)
│   └── site.js       Highlights the current section in the side navigation
├── .nojekyll         Tells GitHub Pages to serve files as they are
└── README.md
```

No build step and no dependencies beyond Google Fonts.

## Publish with GitHub Pages

1. Create a new repository named `integrated-marketing-plan-template` and push these files to the `main` branch.
2. Open Settings > Pages, choose "Deploy from a branch", select `main` and `/ (root)`, and save.
3. The site appears at `https://<your-username>.github.io/integrated-marketing-plan-template/` within a minute or two.

## Using the template

Copy the sections into a new document for each engagement. Fill the plan on a page first, then complete sections 1 to 13 in order. Text in [brackets] is a prompt to replace. Ranges and percentages are starting points to adjust.

## Interactive features

- **Example switcher** (top bar): show both industry examples, or only the investing platform or the airline.
- **Tickable quality checks**: every check can be ticked; progress shows per section and overall, and is saved in the browser (Reset clears it).
- **Budget splitter** (section 8): sliders over the eight objectives with live amounts and a 100% check.
- **Cost-per-outcome calculator** (section 9): spend, cost per lead or visit and two conversion rates give cost per outcome, with an amber flag above +20% versus today.
