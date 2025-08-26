# Technical Implementation Write-up

## Input Text Processing and Slide Mapping

The application uses a sophisticated multi-step approach to transform raw text into structured presentation content:

**Content Analysis**: The system first analyzes the input text to detect structure and content type. It identifies markdown headings, estimates word count, and calculates reading time to determine optimal slide distribution. Section detection uses regex patterns to find hierarchical content (`^#+\s+(.+)$`) and categorizes the input as either "Structured Document" or "Prose" based on heading density.

**LLM Integration**: The parsed content is sent to the selected AI provider (OpenAI, Anthropic, or Google Gemini) with carefully crafted prompts that instruct the model to create presentation-appropriate content. The system uses specific JSON schemas to ensure consistent output format, requesting slide titles, content, layout types (title_slide, content, two_column, image_content, conclusion), and speaker notes.

**Slide Mapping Logic**: The AI response is processed to create slide objects with defined layouts. Title slides use center-aligned formatting, content slides support bullet points and paragraphs, two-column slides automatically split content at paragraph boundaries, and image-content slides reserve space for template images. The system automatically determines slide count based on content length, with approximately 100-150 words per slide for optimal readability.

## Template Visual Style and Asset Application

The template processing system performs comprehensive analysis of uploaded PowerPoint files to extract and apply visual styling:

**Template Parsing**: Using JSZip library, the system extracts PowerPoint files as ZIP archives and parses internal XML files. The `ppt/theme/theme1.xml` file contains color schemes, font definitions, and styling information. Template images are extracted from the `ppt/media/` directory and stored for reuse in generated presentations.

**Color Extraction**: The system navigates the Office Open XML theme structure to extract accent colors, background colors, and text colors. It handles multiple color formats including `srgbClr` (RGB values), `sysClr` (system colors), and theme-relative color definitions. Colors are converted to hex format and mapped to presentation elements: accent1 for titles, accent2 for variety, text1 for body content, and background1 for slide backgrounds.

**Font and Layout Application**: Extracted font information (majorFont for titles, minorFont for body text) is applied consistently across all slides. The system uses PptxGenJS library to recreate PowerPoint files with template styling. Each slide type has specific positioning and formatting rules that incorporate template colors and fonts. For example, title slides use extracted accent colors for titles with proper contrast ratios, while content slides maintain readable text color combinations.

**Asset Reuse**: Template images are automatically detected, extracted, and selectively reused in appropriate slide layouts. The system maintains a registry of available images and intelligently places them in image-content slides to preserve visual consistency with the original template design.