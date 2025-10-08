"""
Zip File Processor for Whop App Video Generator
Handles zip file content extraction and processing for video generation
"""

import zipfile
import os
import tempfile
import shutil
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ZipProcessor:
    """Handles zip file operations for video generation"""
    
    def __init__(self, temp_dir: Optional[str] = None):
        """
        Initialize ZipProcessor
        
        Args:
            temp_dir: Optional custom temporary directory for extraction
        """
        self.temp_dir = temp_dir or tempfile.gettempdir()
        self.extracted_paths = []
    
    def extract_zip(self, zip_path: str, extract_to: Optional[str] = None) -> str:
        """
        Extract zip file to a temporary directory
        
        Args:
            zip_path: Path to the zip file
            extract_to: Optional custom extraction directory
            
        Returns:
            Path to the extracted directory
        """
        try:
            if extract_to is None:
                # Create a unique temporary directory
                extract_to = tempfile.mkdtemp(prefix="whop_video_", dir=self.temp_dir)
            
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_to)
            
            self.extracted_paths.append(extract_to)
            logger.info(f"Successfully extracted {zip_path} to {extract_to}")
            return extract_to
            
        except zipfile.BadZipFile:
            logger.error(f"Invalid zip file: {zip_path}")
            raise
        except Exception as e:
            logger.error(f"Error extracting zip file {zip_path}: {str(e)}")
            raise
    
    def get_zip_contents(self, zip_path: str) -> List[Dict[str, str]]:
        """
        Get list of files in zip without extracting
        
        Args:
            zip_path: Path to the zip file
            
        Returns:
            List of dictionaries with file info
        """
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                file_list = []
                for file_info in zip_ref.infolist():
                    file_list.append({
                        'filename': file_info.filename,
                        'file_size': file_info.file_size,
                        'compressed_size': file_info.compress_size,
                        'is_dir': file_info.is_dir(),
                        'date_time': file_info.date_time
                    })
                return file_list
        except zipfile.BadZipFile:
            logger.error(f"Invalid zip file: {zip_path}")
            raise
        except Exception as e:
            logger.error(f"Error reading zip file {zip_path}: {str(e)}")
            raise
    
    def find_media_files(self, extracted_path: str) -> Dict[str, List[str]]:
        """
        Find media files in extracted zip content
        
        Args:
            extracted_path: Path to extracted directory
            
        Returns:
            Dictionary with categorized media files
        """
        media_extensions = {
            'images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'],
            'videos': ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'],
            'audio': ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a'],
            'documents': ['.txt', '.md', '.pdf', '.doc', '.docx']
        }
        
        found_files = {category: [] for category in media_extensions.keys()}
        
        for root, dirs, files in os.walk(extracted_path):
            for file in files:
                file_path = os.path.join(root, file)
                file_ext = Path(file).suffix.lower()
                
                for category, extensions in media_extensions.items():
                    if file_ext in extensions:
                        found_files[category].append(file_path)
                        break
        
        logger.info(f"Found media files: {sum(len(files) for files in found_files.values())} total")
        for category, files in found_files.items():
            if files:
                logger.info(f"  {category}: {len(files)} files")
        
        return found_files
    
    def get_file_content(self, zip_path: str, file_in_zip: str) -> bytes:
        """
        Read specific file content from zip without full extraction
        
        Args:
            zip_path: Path to the zip file
            file_in_zip: Path to file inside the zip
            
        Returns:
            File content as bytes
        """
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                return zip_ref.read(file_in_zip)
        except KeyError:
            logger.error(f"File {file_in_zip} not found in zip {zip_path}")
            raise
        except Exception as e:
            logger.error(f"Error reading file {file_in_zip} from zip: {str(e)}")
            raise
    
    def cleanup(self):
        """Clean up extracted temporary directories"""
        for path in self.extracted_paths:
            try:
                if os.path.exists(path):
                    shutil.rmtree(path)
                    logger.info(f"Cleaned up temporary directory: {path}")
            except Exception as e:
                logger.error(f"Error cleaning up {path}: {str(e)}")
        self.extracted_paths.clear()
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit - cleanup"""
        self.cleanup()


def process_zip_for_video(zip_path: str) -> Tuple[str, Dict[str, List[str]]]:
    """
    Process zip file and prepare for video generation
    
    Args:
        zip_path: Path to the zip file
        
    Returns:
        Tuple of (extracted_path, media_files_dict)
    """
    with ZipProcessor() as processor:
        # Extract zip file
        extracted_path = processor.extract_zip(zip_path)
        
        # Find media files
        media_files = processor.find_media_files(extracted_path)
        
        return extracted_path, media_files


if __name__ == "__main__":
    # Example usage
    import sys
    
    if len(sys.argv) != 2:
        print("Usage: python zip_processor.py <zip_file_path>")
        sys.exit(1)
    
    zip_file = sys.argv[1]
    
    try:
        # Get zip contents without extracting
        print("Zip file contents:")
        contents = ZipProcessor().get_zip_contents(zip_file)
        for file_info in contents[:10]:  # Show first 10 files
            print(f"  {file_info['filename']} ({file_info['file_size']} bytes)")
        
        if len(contents) > 10:
            print(f"  ... and {len(contents) - 10} more files")
        
        # Process for video generation
        print("\nProcessing for video generation...")
        extracted_path, media_files = process_zip_for_video(zip_file)
        
        print(f"\nExtracted to: {extracted_path}")
        print("Media files found:")
        for category, files in media_files.items():
            if files:
                print(f"  {category}: {len(files)} files")
                for file in files[:3]:  # Show first 3 files
                    print(f"    {file}")
                if len(files) > 3:
                    print(f"    ... and {len(files) - 3} more")
    
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)