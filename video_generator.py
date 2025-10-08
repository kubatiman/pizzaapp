"""
Video Generator for Whop App
Creates videos from zip file contents including images, videos, and text
"""

import os
import cv2
import numpy as np
from moviepy import VideoFileClip, ImageClip, AudioFileClip, concatenate_videoclips
from PIL import Image, ImageDraw, ImageFont
import tempfile
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import logging
from zip_processor import ZipProcessor

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class VideoGenerator:
    """Generates videos from zip file contents"""
    
    def __init__(self, output_dir: str = "output"):
        """
        Initialize VideoGenerator
        
        Args:
            output_dir: Directory to save generated videos
        """
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
        # Video settings
        self.video_width = 1920
        self.video_height = 1080
        self.fps = 30
        self.duration_per_image = 3  # seconds per image
        self.transition_duration = 0.5  # seconds for transitions
    
    def create_slideshow_video(self, media_files: Dict[str, List[str]], 
                              output_name: str = "slideshow.mp4") -> str:
        """
        Create a slideshow video from images
        
        Args:
            media_files: Dictionary of categorized media files
            output_name: Name of output video file
            
        Returns:
            Path to generated video
        """
        image_files = media_files.get('images', [])
        
        if not image_files:
            raise ValueError("No image files found for slideshow")
        
        logger.info(f"Creating slideshow with {len(image_files)} images")
        
        clips = []
        
        for i, image_path in enumerate(image_files):
            try:
                # Load and resize image
                img = Image.open(image_path)
                img = img.convert('RGB')
                
                # Resize to video dimensions while maintaining aspect ratio
                img.thumbnail((self.video_width, self.video_height), Image.Resampling.LANCZOS)
                
                # Create a canvas with the video dimensions
                canvas = Image.new('RGB', (self.video_width, self.video_height), (0, 0, 0))
                
                # Center the image on the canvas
                x = (self.video_width - img.width) // 2
                y = (self.video_height - img.height) // 2
                canvas.paste(img, (x, y))
                
                # Convert to numpy array for moviepy
                img_array = np.array(canvas)
                
                # Create video clip
                clip = ImageClip(img_array, duration=self.duration_per_image)
                
                # Add fade in/out effects
                if i == 0:  # First image
                    clip = clip.fadein(self.transition_duration)
                if i == len(image_files) - 1:  # Last image
                    clip = clip.fadeout(self.transition_duration)
                else:  # Middle images
                    clip = clip.fadein(self.transition_duration).fadeout(self.transition_duration)
                
                clips.append(clip)
                
            except Exception as e:
                logger.warning(f"Error processing image {image_path}: {str(e)}")
                continue
        
        if not clips:
            raise ValueError("No valid images could be processed")
        
        # Concatenate clips
        final_video = concatenate_videoclips(clips, method="compose")
        
        # Add audio if available
        audio_files = media_files.get('audio', [])
        if audio_files:
            try:
                audio_clip = AudioFileClip(audio_files[0])
                # Loop audio if it's shorter than video
                if audio_clip.duration < final_video.duration:
                    audio_clip = audio_clip.loop(duration=final_video.duration)
                elif audio_clip.duration > final_video.duration:
                    audio_clip = audio_clip.subclip(0, final_video.duration)
                
                final_video = final_video.set_audio(audio_clip)
            except Exception as e:
                logger.warning(f"Error adding audio: {str(e)}")
        
        # Write video file
        output_path = os.path.join(self.output_dir, output_name)
        final_video.write_videofile(
            output_path,
            fps=self.fps,
            codec='libx264',
            audio_codec='aac',
            temp_audiofile='temp-audio.m4a',
            remove_temp=True
        )
        
        logger.info(f"Video saved to: {output_path}")
        return output_path
    
    def create_text_overlay_video(self, text_content: str, 
                                 background_color: Tuple[int, int, int] = (0, 0, 0),
                                 text_color: Tuple[int, int, int] = (255, 255, 255),
                                 output_name: str = "text_video.mp4") -> str:
        """
        Create a video with text overlay
        
        Args:
            text_content: Text to display
            background_color: RGB background color
            text_color: RGB text color
            output_name: Name of output video file
            
        Returns:
            Path to generated video
        """
        # Create a blank image
        img = Image.new('RGB', (self.video_width, self.video_height), background_color)
        draw = ImageDraw.Draw(img)
        
        # Try to use a default font, fallback to basic if not available
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
        except:
            font = ImageFont.load_default()
        
        # Split text into lines that fit the screen
        words = text_content.split()
        lines = []
        current_line = []
        
        for word in words:
            test_line = ' '.join(current_line + [word])
            bbox = draw.textbbox((0, 0), test_line, font=font)
            text_width = bbox[2] - bbox[0]
            
            if text_width <= self.video_width - 100:  # Leave some margin
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                    current_line = [word]
                else:
                    lines.append(word)
        
        if current_line:
            lines.append(' '.join(current_line))
        
        # Calculate text position (centered)
        line_height = 80
        total_height = len(lines) * line_height
        start_y = (self.video_height - total_height) // 2
        
        # Draw each line
        for i, line in enumerate(lines):
            bbox = draw.textbbox((0, 0), line, font=font)
            text_width = bbox[2] - bbox[0]
            x = (self.video_width - text_width) // 2
            y = start_y + i * line_height
            draw.text((x, y), line, fill=text_color, font=font)
        
        # Convert to numpy array and create video clip
        img_array = np.array(img)
        clip = ImageClip(img_array, duration=5)  # 5 second duration
        
        # Write video file
        output_path = os.path.join(self.output_dir, output_name)
        clip.write_videofile(
            output_path,
            fps=self.fps,
            codec='libx264'
        )
        
        logger.info(f"Text video saved to: {output_path}")
        return output_path
    
    def process_zip_file(self, zip_path: str, output_name: str = "generated_video.mp4") -> str:
        """
        Process a zip file and generate a video
        
        Args:
            zip_path: Path to the zip file
            output_name: Name of output video file
            
        Returns:
            Path to generated video
        """
        logger.info(f"Processing zip file: {zip_path}")
        
        with ZipProcessor() as processor:
            # Extract zip file
            extracted_path = processor.extract_zip(zip_path)
            
            # Find media files
            media_files = processor.find_media_files(extracted_path)
            
            # Check for text files to include as text overlay
            text_content = ""
            for doc_file in media_files.get('documents', []):
                try:
                    with open(doc_file, 'r', encoding='utf-8') as f:
                        text_content += f.read() + "\n\n"
                except Exception as e:
                    logger.warning(f"Error reading text file {doc_file}: {str(e)}")
            
            # Generate video based on available content
            if media_files.get('images'):
                logger.info("Creating slideshow video from images")
                video_path = self.create_slideshow_video(media_files, output_name)
            elif text_content.strip():
                logger.info("Creating text video from documents")
                video_path = self.create_text_overlay_video(text_content, output_name=output_name)
            else:
                raise ValueError("No suitable content found for video generation")
            
            return video_path


def main():
    """Main function for command line usage"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python video_generator.py <zip_file_path> [output_name]")
        print("Example: python video_generator.py content.zip my_video.mp4")
        sys.exit(1)
    
    zip_file = sys.argv[1]
    output_name = sys.argv[2] if len(sys.argv) > 2 else "generated_video.mp4"
    
    if not os.path.exists(zip_file):
        print(f"Error: Zip file '{zip_file}' not found")
        sys.exit(1)
    
    try:
        generator = VideoGenerator()
        video_path = generator.process_zip_file(zip_file, output_name)
        print(f"Video generated successfully: {video_path}")
    
    except Exception as e:
        print(f"Error generating video: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()