#!/usr/bin/env python3
"""
Complete demonstration of Whop App Video Generator with zip file support
"""

import os
import sys
from whop_app import WhopVideoApp

def main():
    """Demonstrate the complete functionality"""
    print("🎬 Whop App Video Generator - Complete Demo")
    print("=" * 50)
    
    # Initialize the app
    app = WhopVideoApp(output_dir="demo_output")
    
    # Create sample content
    print("1. Creating sample zip file...")
    sample_zip = app.create_sample_zip()
    print(f"   ✅ Created: {sample_zip}")
    
    # List zip contents
    print("\n2. Analyzing zip contents...")
    result = app.list_zip_contents(sample_zip)
    if result["success"]:
        print(f"   📦 Total files: {result['total_files']}")
        for category, files in result["media_files"].items():
            if files:
                print(f"   - {category}: {len(files)} files")
    else:
        print(f"   ❌ Error: {result['error']}")
        return
    
    # Process zip file (this will create a text-based video)
    print("\n3. Processing zip file for video generation...")
    result = app.process_zip_file(sample_zip, "demo_video.mp4")
    
    if result["success"]:
        print(f"   ✅ Video generated successfully!")
        print(f"   📁 Location: {result['video_path']}")
        print(f"   📊 Size: {result['video_size']:,} bytes")
        print(f"   📦 Processed {result['zip_items']} items from zip")
    else:
        print(f"   ❌ Error: {result['error']}")
        return
    
    print("\n" + "=" * 50)
    print("🎉 DEMO COMPLETED SUCCESSFULLY!")
    print("=" * 50)
    print("\nYour Whop App Video Generator is ready to use!")
    print("\nFeatures demonstrated:")
    print("✅ Zip file processing and content analysis")
    print("✅ Media file categorization (images, videos, audio, documents)")
    print("✅ Video generation from zip content")
    print("✅ Text-based video creation")
    print("✅ Command-line interface")
    print("✅ Programmatic API")
    
    print("\nNext steps:")
    print("1. Add your own images to a zip file for slideshow videos")
    print("2. Include text files for text-based videos")
    print("3. Mix different media types for complex videos")
    print("4. Use the command line: python3 whop_app.py your_file.zip")
    print("5. Integrate into your Whop app workflow")
    
    print(f"\nGenerated files are in the 'demo_output' directory")
    
    # Cleanup
    if os.path.exists(sample_zip):
        os.remove(sample_zip)
        print(f"\n🧹 Cleaned up sample file: {sample_zip}")

if __name__ == "__main__":
    main()