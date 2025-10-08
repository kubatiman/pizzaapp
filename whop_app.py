"""
Whop App Video Generator
Main application for processing zip files and generating videos
"""

import os
import sys
import logging
from pathlib import Path
from typing import Optional
from zip_processor import ZipProcessor, process_zip_for_video
from video_generator import VideoGenerator

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class WhopVideoApp:
    """Main application class for Whop video generation"""
    
    def __init__(self, output_dir: str = "output"):
        """
        Initialize the Whop Video App
        
        Args:
            output_dir: Directory to save generated videos
        """
        self.output_dir = output_dir
        self.video_generator = VideoGenerator(output_dir)
        os.makedirs(output_dir, exist_ok=True)
    
    def process_zip_file(self, zip_path: str, output_name: Optional[str] = None) -> dict:
        """
        Process a zip file and generate a video
        
        Args:
            zip_path: Path to the zip file
            output_name: Optional custom name for output video
            
        Returns:
            Dictionary with processing results
        """
        try:
            logger.info(f"Starting processing of zip file: {zip_path}")
            
            # Validate zip file
            if not os.path.exists(zip_path):
                raise FileNotFoundError(f"Zip file not found: {zip_path}")
            
            # Get zip contents info
            with ZipProcessor() as processor:
                zip_contents = processor.get_zip_contents(zip_path)
                logger.info(f"Zip file contains {len(zip_contents)} items")
            
            # Generate output name if not provided
            if not output_name:
                zip_name = Path(zip_path).stem
                output_name = f"{zip_name}_video.mp4"
            
            # Process zip file and generate video
            video_path = self.video_generator.process_zip_file(zip_path, output_name)
            
            # Get file size
            video_size = os.path.getsize(video_path)
            
            result = {
                "success": True,
                "video_path": video_path,
                "video_name": output_name,
                "video_size": video_size,
                "zip_items": len(zip_contents),
                "message": "Video generated successfully"
            }
            
            logger.info(f"Video generation completed: {video_path}")
            return result
            
        except Exception as e:
            logger.error(f"Error processing zip file: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to generate video"
            }
    
    def list_zip_contents(self, zip_path: str) -> dict:
        """
        List contents of a zip file without processing
        
        Args:
            zip_path: Path to the zip file
            
        Returns:
            Dictionary with zip contents information
        """
        try:
            with ZipProcessor() as processor:
                contents = processor.get_zip_contents(zip_path)
                
                # Categorize files
                media_files = {
                    'images': [],
                    'videos': [],
                    'audio': [],
                    'documents': [],
                    'other': []
                }
                
                for file_info in contents:
                    filename = file_info['filename']
                    ext = Path(filename).suffix.lower()
                    
                    if ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp']:
                        media_files['images'].append(file_info)
                    elif ext in ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm']:
                        media_files['videos'].append(file_info)
                    elif ext in ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a']:
                        media_files['audio'].append(file_info)
                    elif ext in ['.txt', '.md', '.pdf', '.doc', '.docx']:
                        media_files['documents'].append(file_info)
                    else:
                        media_files['other'].append(file_info)
                
                return {
                    "success": True,
                    "total_files": len(contents),
                    "media_files": media_files,
                    "message": "Zip contents analyzed successfully"
                }
                
        except Exception as e:
            logger.error(f"Error analyzing zip file: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to analyze zip file"
            }
    
    def create_sample_zip(self, sample_dir: str = "sample_content") -> str:
        """
        Create a sample zip file for testing
        
        Args:
            sample_dir: Directory to create sample content in
            
        Returns:
            Path to created sample zip file
        """
        import zipfile
        import tempfile
        
        # Create sample directory
        os.makedirs(sample_dir, exist_ok=True)
        
        # Create sample text file
        with open(os.path.join(sample_dir, "sample.txt"), "w") as f:
            f.write("Welcome to Whop Video Generator!\n\n")
            f.write("This is a sample text file that will be used to create a text-based video.\n")
            f.write("You can add your own content to zip files and process them here.\n\n")
            f.write("Supported formats:\n")
            f.write("- Images: JPG, PNG, GIF, BMP, TIFF, WebP\n")
            f.write("- Videos: MP4, AVI, MOV, MKV, WMV, FLV, WebM\n")
            f.write("- Audio: MP3, WAV, AAC, FLAC, OGG, M4A\n")
            f.write("- Documents: TXT, MD, PDF, DOC, DOCX\n")
        
        # Create sample zip
        zip_path = "sample_content.zip"
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for root, dirs, files in os.walk(sample_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, sample_dir)
                    zipf.write(file_path, arcname)
        
        logger.info(f"Sample zip created: {zip_path}")
        return zip_path


def main():
    """Main function for command line interface"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Whop App Video Generator")
    parser.add_argument("zip_file", nargs='?', help="Path to zip file to process")
    parser.add_argument("-o", "--output", help="Output video name")
    parser.add_argument("-l", "--list", action="store_true", help="List zip contents only")
    parser.add_argument("--create-sample", action="store_true", help="Create sample zip file")
    
    args = parser.parse_args()
    
    app = WhopVideoApp()
    
    if args.create_sample:
        sample_zip = app.create_sample_zip()
        print(f"Sample zip created: {sample_zip}")
        return
    
    if not args.zip_file:
        print("Error: Zip file path is required (unless using --create-sample)")
        parser.print_help()
        sys.exit(1)
    
    if not os.path.exists(args.zip_file):
        print(f"Error: Zip file '{args.zip_file}' not found")
        sys.exit(1)
    
    if args.list:
        # List zip contents
        result = app.list_zip_contents(args.zip_file)
        if result["success"]:
            print(f"Zip file contains {result['total_files']} items:")
            for category, files in result["media_files"].items():
                if files:
                    print(f"\n{category.upper()}:")
                    for file_info in files[:5]:  # Show first 5 files
                        print(f"  {file_info['filename']} ({file_info['file_size']} bytes)")
                    if len(files) > 5:
                        print(f"  ... and {len(files) - 5} more files")
        else:
            print(f"Error: {result['error']}")
            sys.exit(1)
    else:
        # Process zip file
        result = app.process_zip_file(args.zip_file, args.output)
        if result["success"]:
            print(f"✅ Video generated successfully!")
            print(f"📁 Video: {result['video_path']}")
            print(f"📊 Size: {result['video_size']:,} bytes")
            print(f"📦 Processed {result['zip_items']} items from zip")
        else:
            print(f"❌ Error: {result['error']}")
            sys.exit(1)


if __name__ == "__main__":
    main()