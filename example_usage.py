"""
Example usage of the Whop App Video Generator
Demonstrates different ways to use the zip file processing and video generation features
"""

import os
import zipfile
from whop_app import WhopVideoApp
from zip_processor import ZipProcessor
from video_generator import VideoGenerator


def create_sample_content():
    """Create sample content for demonstration"""
    print("Creating sample content...")
    
    # Create sample directory
    sample_dir = "demo_content"
    os.makedirs(sample_dir, exist_ok=True)
    
    # Create sample text file
    with open(os.path.join(sample_dir, "welcome.txt"), "w") as f:
        f.write("Welcome to Whop Video Generator!\n\n")
        f.write("This is a demonstration of the video generation capabilities.\n")
        f.write("The app can process various types of content from zip files.\n\n")
        f.write("Features:\n")
        f.write("• Process zip files with images, videos, audio, and text\n")
        f.write("• Generate slideshow videos from images\n")
        f.write("• Create text-based videos from documents\n")
        f.write("• Support for multiple media formats\n")
        f.write("• Flexible video settings and customization\n")
    
    # Create sample README
    with open(os.path.join(sample_dir, "README.md"), "w") as f:
        f.write("# Sample Content\n\n")
        f.write("This is sample content for testing the Whop Video Generator.\n\n")
        f.write("## How to use:\n")
        f.write("1. Add your media files to this directory\n")
        f.write("2. Create a zip file\n")
        f.write("3. Process with the video generator\n")
    
    # Create sample zip
    zip_path = "demo_content.zip"
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        for root, dirs, files in os.walk(sample_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, sample_dir)
                zipf.write(file_path, arcname)
    
    print(f"Sample content created: {zip_path}")
    return zip_path


def demonstrate_zip_processing(zip_path):
    """Demonstrate zip file processing capabilities"""
    print("\n" + "="*50)
    print("ZIP FILE PROCESSING DEMONSTRATION")
    print("="*50)
    
    # Initialize zip processor
    with ZipProcessor() as processor:
        # Get zip contents without extracting
        print("1. Analyzing zip file contents...")
        contents = processor.get_zip_contents(zip_path)
        
        print(f"   Found {len(contents)} items in zip file:")
        for i, file_info in enumerate(contents):
            print(f"   {i+1}. {file_info['filename']} ({file_info['file_size']} bytes)")
        
        # Extract and analyze media files
        print("\n2. Extracting and analyzing media files...")
        extracted_path = processor.extract_zip(zip_path)
        media_files = processor.find_media_files(extracted_path)
        
        print("   Media files found:")
        for category, files in media_files.items():
            if files:
                print(f"   - {category}: {len(files)} files")
                for file in files[:2]:  # Show first 2 files
                    print(f"     • {os.path.basename(file)}")
                if len(files) > 2:
                    print(f"     • ... and {len(files) - 2} more")


def demonstrate_video_generation(zip_path):
    """Demonstrate video generation capabilities"""
    print("\n" + "="*50)
    print("VIDEO GENERATION DEMONSTRATION")
    print("="*50)
    
    # Initialize video generator
    generator = VideoGenerator(output_dir="demo_output")
    
    try:
        # Process zip file and generate video
        print("1. Processing zip file for video generation...")
        video_path = generator.process_zip_file(zip_path, "demo_video.mp4")
        
        print(f"   ✅ Video generated successfully!")
        print(f"   📁 Location: {video_path}")
        print(f"   📊 Size: {os.path.getsize(video_path):,} bytes")
        
        return video_path
        
    except Exception as e:
        print(f"   ❌ Error generating video: {str(e)}")
        return None


def demonstrate_advanced_features():
    """Demonstrate advanced features"""
    print("\n" + "="*50)
    print("ADVANCED FEATURES DEMONSTRATION")
    print("="*50)
    
    generator = VideoGenerator(output_dir="demo_output")
    
    # Create text-based video
    print("1. Creating text-based video...")
    try:
        text_content = """
        Advanced Video Generation Features
        
        • Custom video dimensions
        • Text overlay capabilities
        • Multiple media format support
        • Flexible processing options
        • Batch processing support
        """
        
        text_video = generator.create_text_overlay_video(
            text_content,
            background_color=(20, 30, 50),  # Dark blue background
            text_color=(255, 255, 255),     # White text
            output_name="advanced_text_video.mp4"
        )
        
        print(f"   ✅ Text video created: {text_video}")
        
    except Exception as e:
        print(f"   ❌ Error creating text video: {str(e)}")


def demonstrate_app_integration():
    """Demonstrate the main app integration"""
    print("\n" + "="*50)
    print("APP INTEGRATION DEMONSTRATION")
    print("="*50)
    
    # Initialize the main app
    app = WhopVideoApp(output_dir="demo_output")
    
    # Create sample zip
    zip_path = create_sample_content()
    
    # List zip contents
    print("1. Listing zip contents...")
    result = app.list_zip_contents(zip_path)
    if result["success"]:
        print(f"   Total files: {result['total_files']}")
        for category, files in result["media_files"].items():
            if files:
                print(f"   - {category}: {len(files)} files")
    
    # Process zip file
    print("\n2. Processing zip file...")
    result = app.process_zip_file(zip_path, "app_demo_video.mp4")
    
    if result["success"]:
        print(f"   ✅ Video created: {result['video_path']}")
        print(f"   📊 Size: {result['video_size']:,} bytes")
        print(f"   📦 Processed {result['zip_items']} items")
    else:
        print(f"   ❌ Error: {result['error']}")


def main():
    """Main demonstration function"""
    print("Whop App Video Generator - Demonstration")
    print("="*50)
    
    # Create sample content
    zip_path = create_sample_content()
    
    # Demonstrate different features
    demonstrate_zip_processing(zip_path)
    demonstrate_video_generation(zip_path)
    demonstrate_advanced_features()
    demonstrate_app_integration()
    
    print("\n" + "="*50)
    print("DEMONSTRATION COMPLETE")
    print("="*50)
    print("Check the 'demo_output' directory for generated videos!")
    print("You can also run individual components:")
    print("  python whop_app.py demo_content.zip")
    print("  python zip_processor.py demo_content.zip")
    print("  python video_generator.py demo_content.zip")


if __name__ == "__main__":
    main()