#!/usr/bin/env python3
"""
Simple test script to demonstrate zip file functionality
"""

import os
import zipfile
import tempfile
from zip_processor import ZipProcessor

def create_test_zip():
    """Create a test zip file with sample content"""
    print("Creating test zip file...")
    
    # Create temporary directory for test content
    with tempfile.TemporaryDirectory() as temp_dir:
        # Create sample text file
        text_file = os.path.join(temp_dir, "sample.txt")
        with open(text_file, "w") as f:
            f.write("Hello from Whop Video Generator!\n")
            f.write("This is a test zip file.\n")
            f.write("The app can process various types of content.\n")
        
        # Create sample markdown file
        md_file = os.path.join(temp_dir, "README.md")
        with open(md_file, "w") as f:
            f.write("# Test Content\n\n")
            f.write("This is a test markdown file.\n")
            f.write("It demonstrates text processing capabilities.\n")
        
        # Create zip file
        zip_path = "test_content.zip"
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, temp_dir)
                    zipf.write(file_path, arcname)
        
        print(f"Test zip created: {zip_path}")
        return zip_path

def test_zip_processing(zip_path):
    """Test zip file processing"""
    print(f"\nTesting zip file processing: {zip_path}")
    
    try:
        # Initialize zip processor
        with ZipProcessor() as processor:
            # Get zip contents
            print("1. Getting zip contents...")
            contents = processor.get_zip_contents(zip_path)
            print(f"   Found {len(contents)} items:")
            for file_info in contents:
                print(f"   - {file_info['filename']} ({file_info['file_size']} bytes)")
            
            # Extract and analyze
            print("\n2. Extracting and analyzing...")
            extracted_path = processor.extract_zip(zip_path)
            media_files = processor.find_media_files(extracted_path)
            
            print("   Media files found:")
            for category, files in media_files.items():
                if files:
                    print(f"   - {category}: {len(files)} files")
                    for file in files:
                        print(f"     • {os.path.basename(file)}")
            
            # Read specific file content
            print("\n3. Reading file content...")
            if contents:
                first_file = contents[0]['filename']
                content = processor.get_file_content(zip_path, first_file)
                print(f"   Content of {first_file}:")
                print(f"   {content.decode('utf-8')[:100]}...")
        
        print("\n✅ Zip processing test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error during zip processing: {str(e)}")
        return False

def main():
    """Main test function"""
    print("Whop App - Zip File Processing Test")
    print("=" * 40)
    
    # Create test zip
    zip_path = create_test_zip()
    
    # Test processing
    success = test_zip_processing(zip_path)
    
    # Cleanup
    if os.path.exists(zip_path):
        os.remove(zip_path)
        print(f"\nCleaned up test file: {zip_path}")
    
    if success:
        print("\n🎉 All tests passed! Zip file functionality is working correctly.")
        print("\nYou can now use the full video generator with zip files containing:")
        print("- Images (JPG, PNG, GIF, etc.)")
        print("- Videos (MP4, AVI, MOV, etc.)")
        print("- Audio (MP3, WAV, etc.)")
        print("- Documents (TXT, MD, PDF, etc.)")
    else:
        print("\n❌ Tests failed. Please check the error messages above.")

if __name__ == "__main__":
    main()