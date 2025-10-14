import gradio as gr
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from backend.app.models.enhanced_video_generation import EnhancedVideoGenerationService
from backend.app.models.enhanced_audio_generation import EnhancedAudioGenerationService
from backend.app.models.enhanced_app_generation import EnhancedAppGenerationService
from backend.app.models.enhanced_image_generation import EnhancedImageGenerationService

# Initialize services
video_service = EnhancedVideoGenerationService()
audio_service = EnhancedAudioGenerationService()
app_service = EnhancedAppGenerationService()
image_service = EnhancedImageGenerationService()

# Custom CSS for better mobile experience
custom_css = """
.gradio-container {
    max-width: 1200px !important;
}
.tab-nav {
    flex-wrap: wrap;
}
@media (max-width: 768px) {
    .gradio-container {
        margin: 0 !important;
        padding: 10px !important;
    }
}
"""

async def generate_video_interface(prompt, model, style, duration, resolution, fps):
    """Video generation interface for Gradio"""
    try:
        result = await video_service.generate_video(
            prompt=prompt,
            model=model,
            style=style,
            duration=int(duration),
            resolution=resolution,
            fps=int(fps)
        )
        
        if result['success']:
            return f"✅ Video generated successfully! Model: {model}", result.get('videoUrl', ''), result.get('enhanced_prompt', prompt)
        else:
            return f"❌ Generation failed: {result.get('error', 'Unknown error')}", None, ""
    except Exception as e:
        return f"❌ Error: {str(e)}", None, ""

async def generate_audio_interface(audio_type, prompt, model, duration, genre, voice):
    """Audio generation interface for Gradio"""
    try:
        result = await audio_service.generate_audio(
            audio_type=audio_type,
            prompt=prompt,
            model=model,
            duration=int(duration),
            genre=genre,
            voice=voice
        )
        
        if result['success']:
            return f"✅ Audio generated successfully! Model: {model}", result.get('audioUrl', ''), result.get('enhanced_prompt', prompt)
        else:
            return f"❌ Generation failed: {result.get('error', 'Unknown error')}", None, ""
    except Exception as e:
        return f"❌ Error: {str(e)}", None, ""

async def generate_app_interface(description, app_type, framework, features, design_style, model):
    """App generation interface for Gradio"""
    try:
        features_list = [f.strip() for f in features.split(',') if f.strip()]
        
        result = await app_service.generate_app(
            description=description,
            app_type=app_type,
            framework=framework,
            features=features_list,
            design_style=design_style,
            model=model
        )
        
        if result['success']:
            return f"✅ App generated successfully! Framework: {framework}", result.get('code', ''), result.get('downloadUrl', '')
        else:
            return f"❌ Generation failed: {result.get('error', 'Unknown error')}", "", ""
    except Exception as e:
        return f"❌ Error: {str(e)}", "", ""

async def generate_image_interface(prompt, style, size, model, negative_prompt, num_images):
    """Image generation interface for Gradio"""
    try:
        result = await image_service.generate_image(
            prompt=prompt,
            style=style,
            size=size,
            model=model,
            negative_prompt=negative_prompt,
            num_images=int(num_images)
        )
        
        if result['success']:
            images = result.get('imageUrls', [])
            return f"✅ {len(images)} image(s) generated successfully! Model: {model}", images, result.get('enhanced_prompt', prompt)
        else:
            return f"❌ Generation failed: {result.get('error', 'Unknown error')}", [], ""
    except Exception as e:
        return f"❌ Error: {str(e)}", [], ""

# Create Gradio interface
with gr.Blocks(
    title="🤖 AI Agent Studio - Complete Creative Suite",
    css=custom_css,
    theme=gr.themes.Soft()
) as demo:
    
    gr.Markdown("""
    # 🤖 AI Agent Studio - Complete Creative Suite
    
    **Create anything with AI - Videos, Apps, Music, Images, and more!**
    
    ✨ **Features:**
    - 🎬 **Video Generation**: Wan2.2, ModelScope, Stable Video Diffusion
    - 🎵 **Audio Creation**: MusicGen, Jukebox, Bark, Coqui TTS
    - 📱 **App Development**: Code Llama 3, DeepSeek-Coder, StarCoder 2
    - 🎨 **Image Generation**: Stable Diffusion XL, GFPGAN, Real-ESRGAN
    - 🔧 **All Models Free**: Using open-source GitHub repositories
    
    > **Mobile Optimized** for Poco X6 Pro (12GB RAM) and 8GB+ devices
    """)
    
    with gr.Tabs():
        
        # Video Generation Tab
        with gr.Tab("🎬 Video Generation"):
            gr.Markdown("### Generate AI Videos with Multiple Models")
            
            with gr.Row():
                with gr.Column():
                    video_prompt = gr.Textbox(
                        label="Video Description",
                        placeholder="A majestic dragon flying over a medieval castle at sunset...",
                        lines=3
                    )
                    video_model = gr.Dropdown(
                        choices=["wan2.2", "modelscope-text2video", "stable-video-diffusion", "deforum-stable-diffusion"],
                        label="AI Model",
                        value="wan2.2"
                    )
                    video_style = gr.Dropdown(
                        choices=["cinematic", "anime", "realistic", "artistic", "sci-fi", "fantasy"],
                        label="Style",
                        value="cinematic"
                    )
                    
                with gr.Column():
                    video_duration = gr.Slider(
                        minimum=5,
                        maximum=300,
                        value=30,
                        step=5,
                        label="Duration (seconds)"
                    )
                    video_resolution = gr.Dropdown(
                        choices=["480p", "720p", "1080p", "4k"],
                        label="Resolution",
                        value="1080p"
                    )
                    video_fps = gr.Dropdown(
                        choices=[24, 30, 60],
                        label="FPS",
                        value=30
                    )
            
            video_generate_btn = gr.Button("🎬 Generate Video", variant="primary", size="lg")
            
            with gr.Row():
                video_status = gr.Textbox(label="Status", interactive=False)
                video_enhanced_prompt = gr.Textbox(label="Enhanced Prompt", interactive=False)
            
            video_output = gr.Video(label="Generated Video")
            
            video_generate_btn.click(
                fn=generate_video_interface,
                inputs=[video_prompt, video_model, video_style, video_duration, video_resolution, video_fps],
                outputs=[video_status, video_output, video_enhanced_prompt]
            )
        
        # Audio Generation Tab
        with gr.Tab("🎵 Audio Generation"):
            gr.Markdown("### Generate Music, Voice, and Sound Effects")
            
            with gr.Row():
                with gr.Column():
                    audio_type = gr.Dropdown(
                        choices=["music", "voice", "effects"],
                        label="Audio Type",
                        value="music"
                    )
                    audio_prompt = gr.Textbox(
                        label="Audio Description",
                        placeholder="Upbeat electronic dance music with synthesizers...",
                        lines=3
                    )
                    audio_model = gr.Dropdown(
                        choices=["musicgen", "jukebox", "bark", "coqui-tts", "chatterbox"],
                        label="AI Model",
                        value="musicgen"
                    )
                    
                with gr.Column():
                    audio_duration = gr.Slider(
                        minimum=5,
                        maximum=300,
                        value=30,
                        step=5,
                        label="Duration (seconds)"
                    )
                    audio_genre = gr.Dropdown(
                        choices=["ambient", "electronic", "classical", "rock", "jazz", "pop", "hip-hop"],
                        label="Genre (for music)",
                        value="ambient"
                    )
                    audio_voice = gr.Dropdown(
                        choices=["male-professional", "female-professional", "male-casual", "female-casual"],
                        label="Voice Type (for TTS)",
                        value="male-professional"
                    )
            
            audio_generate_btn = gr.Button("🎵 Generate Audio", variant="primary", size="lg")
            
            with gr.Row():
                audio_status = gr.Textbox(label="Status", interactive=False)
                audio_enhanced_prompt = gr.Textbox(label="Enhanced Prompt", interactive=False)
            
            audio_output = gr.Audio(label="Generated Audio")
            
            audio_generate_btn.click(
                fn=generate_audio_interface,
                inputs=[audio_type, audio_prompt, audio_model, audio_duration, audio_genre, audio_voice],
                outputs=[audio_status, audio_output, audio_enhanced_prompt]
            )
        
        # App Generation Tab
        with gr.Tab("📱 App Development"):
            gr.Markdown("### Generate Complete Applications with AI")
            
            with gr.Row():
                with gr.Column():
                    app_description = gr.Textbox(
                        label="App Description",
                        placeholder="A social media app for photographers with AI editing tools...",
                        lines=4
                    )
                    app_type = gr.Dropdown(
                        choices=["android", "ios", "web", "desktop"],
                        label="Platform",
                        value="android"
                    )
                    app_framework = gr.Dropdown(
                        choices=["react-native", "flutter", "next.js", "electron"],
                        label="Framework",
                        value="react-native"
                    )
                    
                with gr.Column():
                    app_features = gr.Textbox(
                        label="Features (comma-separated)",
                        placeholder="user auth, camera, social sharing, AI filters",
                        lines=2
                    )
                    app_design_style = gr.Dropdown(
                        choices=["modern", "minimal", "colorful", "professional"],
                        label="Design Style",
                        value="modern"
                    )
                    app_model = gr.Dropdown(
                        choices=["code-llama-3", "deepseek-coder", "starcoder-2", "wizardcoder", "mistral-7b"],
                        label="AI Coding Model",
                        value="code-llama-3"
                    )
            
            app_generate_btn = gr.Button("📱 Generate App", variant="primary", size="lg")
            
            with gr.Row():
                app_status = gr.Textbox(label="Status", interactive=False)
                app_download = gr.File(label="Download App Code")
            
            app_code_output = gr.Code(
                label="Generated Code Preview",
                language="javascript",
                lines=20
            )
            
            app_generate_btn.click(
                fn=generate_app_interface,
                inputs=[app_description, app_type, app_framework, app_features, app_design_style, app_model],
                outputs=[app_status, app_code_output, app_download]
            )
        
        # Image Generation Tab
        with gr.Tab("🎨 Image Generation"):
            gr.Markdown("### Generate and Edit Images with AI")
            
            with gr.Row():
                with gr.Column():
                    image_prompt = gr.Textbox(
                        label="Image Description",
                        placeholder="A futuristic cityscape with flying cars and neon lights...",
                        lines=3
                    )
                    image_negative = gr.Textbox(
                        label="Negative Prompt (Optional)",
                        placeholder="blurry, low quality, distorted...",
                        lines=2
                    )
                    image_model = gr.Dropdown(
                        choices=["stable-diffusion", "automatic1111", "comfyui"],
                        label="AI Model",
                        value="stable-diffusion"
                    )
                    
                with gr.Column():
                    image_style = gr.Dropdown(
                        choices=["photorealistic", "artistic", "anime", "cartoon", "digital-art", "cyberpunk"],
                        label="Style",
                        value="photorealistic"
                    )
                    image_size = gr.Dropdown(
                        choices=["512x512", "1024x1024", "1920x1080", "1080x1920"],
                        label="Size",
                        value="1024x1024"
                    )
                    image_num = gr.Slider(
                        minimum=1,
                        maximum=8,
                        value=4,
                        step=1,
                        label="Number of Images"
                    )
            
            image_generate_btn = gr.Button("🎨 Generate Images", variant="primary", size="lg")
            
            with gr.Row():
                image_status = gr.Textbox(label="Status", interactive=False)
                image_enhanced_prompt = gr.Textbox(label="Enhanced Prompt", interactive=False)
            
            image_gallery = gr.Gallery(
                label="Generated Images",
                show_label=True,
                elem_id="gallery",
                columns=2,
                rows=2,
                height="auto"
            )
            
            image_generate_btn.click(
                fn=generate_image_interface,
                inputs=[image_prompt, image_style, image_size, image_model, image_negative, image_num],
                outputs=[image_status, image_gallery, image_enhanced_prompt]
            )
        
        # Model Management Tab
        with gr.Tab("🔧 Model Management"):
            gr.Markdown("### Add Custom AI Models from GitHub")
            
            with gr.Row():
                with gr.Column():
                    custom_model_name = gr.Textbox(
                        label="Model Name",
                        placeholder="My Custom AI Model"
                    )
                    custom_model_type = gr.Dropdown(
                        choices=["video", "audio", "code", "image"],
                        label="Model Type",
                        value="video"
                    )
                    custom_model_url = gr.Textbox(
                        label="GitHub URL",
                        placeholder="https://github.com/user/repo"
                    )
                    
                with gr.Column():
                    gr.Markdown("""
                    ### Available Models:
                    
                    **Video Models:**
                    - Wan2.2 (ModelScope)
                    - Stable Video Diffusion
                    - Deforum Stable Diffusion
                    
                    **Audio Models:**
                    - MusicGen (Meta)
                    - Jukebox (OpenAI)
                    - Bark (Suno AI)
                    - Coqui TTS
                    - ChatterBox
                    
                    **Coding Models:**
                    - Code Llama 3
                    - DeepSeek-Coder
                    - StarCoder 2
                    - WizardCoder
                    - Mistral 7B
                    
                    **Image Models:**
                    - Stable Diffusion XL
                    - Automatic1111
                    - ComfyUI
                    - GFPGAN
                    - Real-ESRGAN
                    - RemBG
                    """)
            
            add_model_btn = gr.Button("➕ Add Custom Model", variant="secondary")
            custom_model_status = gr.Textbox(label="Status", interactive=False)
    
    # Footer
    gr.Markdown("""
    ---
    
    ### 🚀 Deployment Options
    
    **Mobile App:**
    - Download APK for Android
    - Optimized for Poco X6 Pro (12GB RAM)
    - Works on 8GB+ RAM devices
    
    **Free Hosting:**
    - Hugging Face Spaces (Current)
    - GitHub Pages (Frontend)
    - Railway/Render (Backend)
    
    **Social Media Integration:**
    - Direct upload to YouTube, TikTok, Instagram
    - Automated posting with scheduling
    - Multi-platform distribution
    
    ---
    
    **🔗 Links:**
    - [GitHub Repository](https://github.com/Johnshah/ai-agent-studio-mobile-)
    - [Mobile App Download](https://github.com/Johnshah/ai-agent-studio-mobile-/releases)
    - [Documentation](https://github.com/Johnshah/ai-agent-studio-mobile-/wiki)
    
    **Made with ❤️ using open-source AI models**
    """)

# Launch configuration for Hugging Face Spaces
if __name__ == "__main__":
    demo.queue(
        concurrency_count=3,
        max_size=10,
        api_open=False
    ).launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True,
        show_tips=True,
        enable_queue=True
    )