# Whop App Video Generator

A Python-based application that processes zip files and generates videos from their contents. Perfect for creating slideshows, text-based videos, and multimedia presentations from zip archives.

## Features

- **Zip File Processing**: Extract and analyze zip file contents
- **Video Generation**: Create videos from images, text, and other media
- **Multiple Formats**: Support for images, videos, audio, and documents
- **Flexible Output**: Customizable video settings and output formats
- **Command Line Interface**: Easy-to-use CLI for batch processing

## Supported File Types

### Images
- JPG, JPEG, PNG, GIF, BMP, TIFF, WebP

### Videos  
- MP4, AVI, MOV, MKV, WMV, FLV, WebM

### Audio
- MP3, WAV, AAC, FLAC, OGG, M4A

### Documents
- TXT, MD, PDF, DOC, DOCX

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Make sure you have FFmpeg installed for video processing:
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

## Usage

### Basic Usage

Process a zip file and generate a video:
```bash
python whop_app.py your_content.zip
```

### Advanced Usage

List zip contents without processing:
```bash
python whop_app.py your_content.zip --list
```

Specify custom output name:
```bash
python whop_app.py your_content.zip -o my_video.mp4
```

Create a sample zip file for testing:
```bash
python whop_app.py --create-sample
```

### Programmatic Usage

```python
from whop_app import WhopVideoApp

# Initialize the app
app = WhopVideoApp(output_dir="my_videos")

# Process a zip file
result = app.process_zip_file("content.zip", "output_video.mp4")

if result["success"]:
    print(f"Video created: {result['video_path']}")
else:
    print(f"Error: {result['error']}")
```

### Using Individual Components

#### Zip Processor
```python
from zip_processor import ZipProcessor

with ZipProcessor() as processor:
    # Extract zip file
    extracted_path = processor.extract_zip("content.zip")
    
    # Find media files
    media_files = processor.find_media_files(extracted_path)
    
    # Get specific file content
    content = processor.get_file_content("content.zip", "file.txt")
```

#### Video Generator
```python
from video_generator import VideoGenerator

generator = VideoGenerator(output_dir="output")

# Create slideshow from images
video_path = generator.create_slideshow_video(media_files)

# Create text video
video_path = generator.create_text_overlay_video("Your text content")
```

## Configuration

### Video Settings
You can customize video settings in `video_generator.py`:

```python
self.video_width = 1920        # Video width
self.video_height = 1080       # Video height  
self.fps = 30                  # Frames per second
self.duration_per_image = 3    # Seconds per image
self.transition_duration = 0.5 # Transition duration
```

## Examples

### Create a Slideshow
1. Put your images in a folder
2. Create a zip file: `zip -r images.zip images/`
3. Generate video: `python whop_app.py images.zip`

### Create a Text Video
1. Create a text file with your content
2. Zip it: `zip text_content.zip my_text.txt`
3. Generate video: `python whop_app.py text_content.zip`

### Mixed Content
1. Add images, videos, audio, and text files to a zip
2. The app will automatically use the most appropriate content for video generation

## Output

Generated videos are saved in the `output/` directory by default. Videos are created in MP4 format with H.264 codec for maximum compatibility.

## Requirements

- Python 3.7+
- FFmpeg
- OpenCV
- MoviePy
- Pillow
- NumPy

## Troubleshooting

### Common Issues

1. **FFmpeg not found**: Install FFmpeg and ensure it's in your PATH
2. **Memory issues with large files**: Process smaller batches or increase system memory
3. **Unsupported file formats**: Check the supported formats list above

### Logging

The application uses Python's logging module. Set log level to DEBUG for detailed information:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## License

This project is open source and available under the MIT License.