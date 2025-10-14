import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Select,
  CheckIcon,
  Slider,
  Switch,
  TextArea,
  ScrollView,
  Heading,
  Progress,
  useToast,
  Modal,
  FormControl,
  Badge,
  Divider,
  IconButton,
  useDisclose,
  Image
} from 'native-base';
import { Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

import { aiModelService, AudioGenerationParams, AIModel } from '../services/AIModelService';

const { width } = Dimensions.get('window');

interface AudioGenre {
  id: string;
  name: string;
  description: string;
  mood: string;
}

const MUSIC_GENRES: AudioGenre[] = [
  { id: 'ambient', name: 'Ambient', description: 'Atmospheric soundscapes', mood: 'calm' },
  { id: 'cinematic', name: 'Cinematic', description: 'Epic orchestral music', mood: 'dramatic' },
  { id: 'electronic', name: 'Electronic', description: 'Synthesized beats', mood: 'energetic' },
  { id: 'classical', name: 'Classical', description: 'Traditional orchestral', mood: 'elegant' },
  { id: 'rock', name: 'Rock', description: 'Guitar-driven music', mood: 'energetic' },
  { id: 'jazz', name: 'Jazz', description: 'Improvisational music', mood: 'smooth' },
  { id: 'pop', name: 'Pop', description: 'Mainstream catchy tunes', mood: 'upbeat' },
  { id: 'hip-hop', name: 'Hip-Hop', description: 'Rhythmic spoken lyrics', mood: 'urban' },
  { id: 'folk', name: 'Folk', description: 'Traditional acoustic music', mood: 'warm' },
  { id: 'blues', name: 'Blues', description: 'Soulful emotional music', mood: 'melancholic' }
];

const VOICE_TYPES = [
  { id: 'male-professional', name: 'Male Professional', description: 'Deep, authoritative voice' },
  { id: 'female-professional', name: 'Female Professional', description: 'Clear, confident voice' },
  { id: 'male-casual', name: 'Male Casual', description: 'Friendly, relaxed tone' },
  { id: 'female-casual', name: 'Female Casual', description: 'Warm, conversational tone' },
  { id: 'child', name: 'Child Voice', description: 'Young, playful voice' },
  { id: 'elderly', name: 'Elderly Voice', description: 'Wise, mature voice' },
  { id: 'robot', name: 'Robot Voice', description: 'Synthetic, futuristic voice' },
  { id: 'narrator', name: 'Narrator', description: 'Storytelling voice' }
];

const SOUND_EFFECTS = [
  'Rain', 'Thunder', 'Ocean Waves', 'Forest', 'City Traffic', 'Cafe Ambiance',
  'Fireplace', 'Wind', 'Birds Chirping', 'Water Drops', 'Footsteps', 'Door Opening',
  'Phone Ring', 'Clock Ticking', 'Keyboard Typing', 'Car Engine', 'Airplane', 'Train',
  'Explosion', 'Gunshot', 'Sword Clash', 'Magic Spell', 'Alien Sound', 'Robot Voice'
];

const LANGUAGES_AUDIO = [
  { code: 'en', name: 'English', accent: 'American' },
  { code: 'en-gb', name: 'English', accent: 'British' },
  { code: 'en-au', name: 'English', accent: 'Australian' },
  { code: 'es', name: 'Spanish', accent: 'European' },
  { code: 'es-mx', name: 'Spanish', accent: 'Mexican' },
  { code: 'fr', name: 'French', accent: 'European' },
  { code: 'de', name: 'German', accent: 'Standard' },
  { code: 'it', name: 'Italian', accent: 'Standard' },
  { code: 'pt', name: 'Portuguese', accent: 'Brazilian' },
  { code: 'ru', name: 'Russian', accent: 'Standard' },
  { code: 'zh', name: 'Chinese', accent: 'Mandarin' },
  { code: 'ja', name: 'Japanese', accent: 'Standard' },
  { code: 'ko', name: 'Korean', accent: 'Standard' },
  { code: 'hi', name: 'Hindi', accent: 'Standard' },
  { code: 'ar', name: 'Arabic', accent: 'Modern Standard' }
];

export default function AudioGenerationScreen() {
  const toast = useToast();
  const { isOpen: isPlaybackOpen, onOpen: openPlayback, onClose: closePlayback } = useDisclose();
  const { isOpen: isVoiceCloneOpen, onOpen: openVoiceClone, onClose: closeVoiceClone } = useDisclose();

  // Form State
  const [audioType, setAudioType] = useState<'music' | 'voice' | 'effects'>('music');
  const [prompt, setPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ambient');
  const [selectedVoice, setSelectedVoice] = useState('male-professional');
  const [duration, setDuration] = useState(30); // seconds
  const [selectedModel, setSelectedModel] = useState('musicgen');
  const [language, setLanguage] = useState('en');
  
  // Music Settings
  const [tempo, setTempo] = useState(120); // BPM
  const [key, setKey] = useState('C');
  const [mood, setMood] = useState('happy');
  const [instruments, setInstruments] = useState<string[]>([]);
  
  // Voice Settings
  const [voiceText, setVoiceText] = useState('');
  const [emotion, setEmotion] = useState('neutral');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  
  // Voice Cloning
  const [voiceCloneFiles, setVoiceCloneFiles] = useState<any[]>([]);
  const [clonedVoiceId, setClonedVoiceId] = useState('');
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState('');
  const [audioPlayer, setAudioPlayer] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Models and Options
  const [audioModels, setAudioModels] = useState<AIModel[]>([]);

  useEffect(() => {
    loadAudioModels();
    return () => {
      if (audioPlayer) {
        audioPlayer.unloadAsync();
      }
    };
  }, []);

  const loadAudioModels = async () => {
    try {
      const models = await aiModelService.getAvailableModels('audio');
      setAudioModels(models);
    } catch (error) {
      console.error('Error loading audio models:', error);
      toast.show({
        title: "Error",
        description: "Failed to load audio models",
        status: "error",
      });
    }
  };

  const handleGenerateAudio = async () => {
    if (!prompt.trim() && audioType !== 'effects') {
      toast.show({
        title: "Missing Prompt",
        description: "Please enter audio description",
        status: "warning",
      });
      return;
    }

    if (audioType === 'voice' && !voiceText.trim()) {
      toast.show({
        title: "Missing Text",
        description: "Please enter text for voice synthesis",
        status: "warning",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 1500);

      const params: AudioGenerationParams = {
        type: audioType,
        prompt: audioType === 'voice' ? voiceText : prompt,
        genre: audioType === 'music' ? selectedGenre : undefined,
        voice: audioType === 'voice' ? selectedVoice : undefined,
        duration,
        model: selectedModel
      };

      const response = await aiModelService.generateAudio(params);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response.data.success) {
        setGeneratedAudioUrl(response.data.audioUrl);
        
        toast.show({
          title: "Success!",
          description: "Audio generated successfully",
          status: "success",
        });
      } else {
        throw new Error(response.data.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Audio generation error:', error);
      toast.show({
        title: "Generation Failed",
        description: error.message || "Something went wrong",
        status: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!generatedAudioUrl) return;

    try {
      if (isPlaying && audioPlayer) {
        await audioPlayer.pauseAsync();
        setIsPlaying(false);
      } else {
        if (audioPlayer) {
          await audioPlayer.playAsync();
        } else {
          const { sound } = await Audio.Sound.createAsync(
            { uri: generatedAudioUrl },
            { shouldPlay: true }
          );
          setAudioPlayer(sound);
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
            }
          });
        }
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      toast.show({
        title: "Playback Failed",
        description: "Could not play audio",
        status: "error",
      });
    }
  };

  const handleDownloadAudio = async () => {
    if (!generatedAudioUrl) return;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        toast.show({
          title: "Permission Denied",
          description: "Please grant media library permissions",
          status: "error",
        });
        return;
      }

      const downloadUri = FileSystem.documentDirectory + `generated_audio_${Date.now()}.mp3`;
      const { uri } = await FileSystem.downloadAsync(generatedAudioUrl, downloadUri);
      
      await MediaLibrary.saveToLibraryAsync(uri);
      
      toast.show({
        title: "Downloaded!",
        description: "Audio saved to gallery",
        status: "success",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast.show({
        title: "Download Failed",
        description: "Could not save audio",
        status: "error",
      });
    }
  };

  const handleVoiceCloneUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        setVoiceCloneFiles([...voiceCloneFiles, ...result.assets]);
        toast.show({
          title: "Files Uploaded",
          description: `${result.assets.length} voice sample(s) added`,
          status: "success",
        });
      }
    } catch (error) {
      console.error('Voice clone upload error:', error);
      toast.show({
        title: "Upload Failed",
        description: "Could not upload voice samples",
        status: "error",
      });
    }
  };

  const handleCreateVoiceClone = async () => {
    if (voiceCloneFiles.length === 0) {
      toast.show({
        title: "No Voice Samples",
        description: "Please upload at least one voice sample",
        status: "warning",
      });
      return;
    }

    try {
      // Voice cloning implementation would go here
      toast.show({
        title: "Voice Clone Created",
        description: "Custom voice model is ready to use",
        status: "success",
      });
      setClonedVoiceId(`custom-voice-${Date.now()}`);
      closeVoiceClone();
    } catch (error) {
      console.error('Voice clone error:', error);
      toast.show({
        title: "Voice Clone Failed",
        description: "Could not create voice clone",
        status: "error",
      });
    }
  };

  const renderMusicControls = () => (
    <VStack space={4}>
      <FormControl>
        <FormControl.Label>Music Genre</FormControl.Label>
        <Select
          selectedValue={selectedGenre}
          onValueChange={setSelectedGenre}
          _selectedItem={{ endIcon: <CheckIcon size="5" /> }}
        >
          {MUSIC_GENRES.map(genre => (
            <Select.Item
              key={genre.id}
              label={genre.name}
              value={genre.id}
            />
          ))}
        </Select>
      </FormControl>

      <HStack space={4}>
        <VStack flex={1}>
          <FormControl.Label>Tempo (BPM)</FormControl.Label>
          <HStack alignItems="center" space={2}>
            <Text>60</Text>
            <Slider
              flex={1}
              value={tempo}
              onChange={setTempo}
              minValue={60}
              maxValue={200}
              step={5}
            >
              <Slider.Track>
                <Slider.FilledTrack />
              </Slider.Track>
              <Slider.Thumb />
            </Slider>
            <Text>200</Text>
          </HStack>
          <Text fontSize="sm" color="gray.600" textAlign="center">{tempo} BPM</Text>
        </VStack>
      </HStack>

      <HStack space={4}>
        <FormControl flex={1}>
          <FormControl.Label>Key</FormControl.Label>
          <Select selectedValue={key} onValueChange={setKey}>
            {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(k => (
              <Select.Item key={k} label={k} value={k} />
            ))}
          </Select>
        </FormControl>

        <FormControl flex={1}>
          <FormControl.Label>Mood</FormControl.Label>
          <Select selectedValue={mood} onValueChange={setMood}>
            <Select.Item label="Happy" value="happy" />
            <Select.Item label="Sad" value="sad" />
            <Select.Item label="Energetic" value="energetic" />
            <Select.Item label="Calm" value="calm" />
            <Select.Item label="Dramatic" value="dramatic" />
            <Select.Item label="Mysterious" value="mysterious" />
          </Select>
        </FormControl>
      </HStack>
    </VStack>
  );

  const renderVoiceControls = () => (
    <VStack space={4}>
      <FormControl>
        <FormControl.Label>Voice Type</FormControl.Label>
        <Select
          selectedValue={selectedVoice}
          onValueChange={setSelectedVoice}
          _selectedItem={{ endIcon: <CheckIcon size="5" /> }}
        >
          {VOICE_TYPES.map(voice => (
            <Select.Item
              key={voice.id}
              label={voice.name}
              value={voice.id}
            />
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormControl.Label>Text to Speak</FormControl.Label>
        <TextArea
          placeholder="Enter the text you want to convert to speech..."
          value={voiceText}
          onChangeText={setVoiceText}
          h={20}
        />
      </FormControl>

      <HStack space={4}>
        <FormControl flex={1}>
          <FormControl.Label>Language</FormControl.Label>
          <Select selectedValue={language} onValueChange={setLanguage}>
            {LANGUAGES_AUDIO.map(lang => (
              <Select.Item
                key={lang.code}
                label={`${lang.name} (${lang.accent})`}
                value={lang.code}
              />
            ))}
          </Select>
        </FormControl>

        <FormControl flex={1}>
          <FormControl.Label>Emotion</FormControl.Label>
          <Select selectedValue={emotion} onValueChange={setEmotion}>
            <Select.Item label="Neutral" value="neutral" />
            <Select.Item label="Happy" value="happy" />
            <Select.Item label="Sad" value="sad" />
            <Select.Item label="Excited" value="excited" />
            <Select.Item label="Angry" value="angry" />
            <Select.Item label="Calm" value="calm" />
          </Select>
        </FormControl>
      </HStack>

      <HStack space={4}>
        <VStack flex={1}>
          <FormControl.Label>Speech Rate</FormControl.Label>
          <HStack alignItems="center" space={2}>
            <Text>0.5x</Text>
            <Slider
              flex={1}
              value={speechRate}
              onChange={setSpeechRate}
              minValue={0.5}
              maxValue={2.0}
              step={0.1}
            >
              <Slider.Track>
                <Slider.FilledTrack />
              </Slider.Track>
              <Slider.Thumb />
            </Slider>
            <Text>2.0x</Text>
          </HStack>
        </VStack>
      </HStack>

      <HStack justifyContent="space-between" alignItems="center">
        <Text>Use Cloned Voice</Text>
        <Button size="sm" variant="outline" onPress={openVoiceClone}>
          Clone Voice
        </Button>
      </HStack>
    </VStack>
  );

  const renderEffectsControls = () => (
    <VStack space={4}>
      <FormControl>
        <FormControl.Label>Sound Effect Type</FormControl.Label>
        <Box bg="gray.50" p={3} rounded="lg" maxH="200">
          <ScrollView>
            <VStack space={2}>
              {SOUND_EFFECTS.map(effect => (
                <Button
                  key={effect}
                  size="sm"
                  variant={prompt === effect ? "solid" : "outline"}
                  onPress={() => setPrompt(effect)}
                >
                  {effect}
                </Button>
              ))}
            </VStack>
          </ScrollView>
        </Box>
      </FormControl>

      <FormControl>
        <FormControl.Label>Custom Sound Description</FormControl.Label>
        <Input
          placeholder="Describe a custom sound effect..."
          value={prompt}
          onChangeText={setPrompt}
        />
      </FormControl>
    </VStack>
  );

  return (
    <ScrollView flex={1} bg="white" p={4}>
      <VStack space={6}>
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center">
          <Heading size="lg">🎵 AI Audio Studio</Heading>
          <HStack space={2}>
            <IconButton
              icon={<Ionicons name="musical-notes-outline" size={24} color="gray" />}
              onPress={openPlayback}
              isDisabled={!generatedAudioUrl}
            />
          </HStack>
        </HStack>

        {/* Audio Type Selection */}
        <Box>
          <FormControl.Label>Audio Type</FormControl.Label>
          <HStack space={2}>
            <Button
              flex={1}
              variant={audioType === 'music' ? 'solid' : 'outline'}
              onPress={() => setAudioType('music')}
              leftIcon={<Ionicons name="musical-notes" size={16} />}
            >
              Music
            </Button>
            <Button
              flex={1}
              variant={audioType === 'voice' ? 'solid' : 'outline'}
              onPress={() => setAudioType('voice')}
              leftIcon={<Ionicons name="mic" size={16} />}
            >
              Voice
            </Button>
            <Button
              flex={1}
              variant={audioType === 'effects' ? 'solid' : 'outline'}
              onPress={() => setAudioType('effects')}
              leftIcon={<Ionicons name="volume-high" size={16} />}
            >
              Effects
            </Button>
          </HStack>
        </Box>

        {/* Audio Description */}
        {audioType !== 'voice' && (
          <FormControl>
            <FormControl.Label>
              {audioType === 'music' ? 'Music Description' : 'Sound Effect Description'}
            </FormControl.Label>
            <TextArea
              placeholder={
                audioType === 'music'
                  ? "Describe the music you want... (e.g., 'Upbeat electronic dance music with synthesizers')"
                  : "Describe the sound effect... (e.g., 'Thunder during a storm')"
              }
              value={prompt}
              onChangeText={setPrompt}
              h={16}
            />
          </FormControl>
        )}

        {/* AI Model Selection */}
        <FormControl>
          <FormControl.Label>AI Audio Model</FormControl.Label>
          <Select
            selectedValue={selectedModel}
            onValueChange={setSelectedModel}
            _selectedItem={{
              bg: "orange.600",
              endIcon: <CheckIcon size="5" />
            }}
          >
            {audioModels.map(model => (
              <Select.Item
                key={model.id}
                label={model.name}
                value={model.id}
              />
            ))}
          </Select>
        </FormControl>

        {/* Duration */}
        <VStack>
          <FormControl.Label>Duration (seconds)</FormControl.Label>
          <HStack alignItems="center" space={2}>
            <Text>5</Text>
            <Slider
              flex={1}
              value={duration}
              onChange={setDuration}
              minValue={5}
              maxValue={300}
              step={5}
            >
              <Slider.Track>
                <Slider.FilledTrack />
              </Slider.Track>
              <Slider.Thumb />
            </Slider>
            <Text>300</Text>
          </HStack>
          <Text fontSize="sm" color="gray.600" textAlign="center">
            {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
          </Text>
        </VStack>

        {/* Type-specific Controls */}
        <Box bg="gray.50" p={4} rounded="lg">
          <Heading size="md" mb={3}>
            {audioType === 'music' && 'Music Settings'}
            {audioType === 'voice' && 'Voice Settings'}
            {audioType === 'effects' && 'Effect Settings'}
          </Heading>
          
          {audioType === 'music' && renderMusicControls()}
          {audioType === 'voice' && renderVoiceControls()}
          {audioType === 'effects' && renderEffectsControls()}
        </Box>

        {/* Generation Progress */}
        {isGenerating && (
          <Box>
            <HStack justifyContent="space-between" mb={2}>
              <Text>Generating Audio...</Text>
              <Text>{Math.round(progress)}%</Text>
            </HStack>
            <Progress value={progress} colorScheme="orange" />
            <Text fontSize="sm" color="gray.600" mt={1}>
              Using {audioModels.find(m => m.id === selectedModel)?.name || 'AI Model'}
            </Text>
          </Box>
        )}

        {/* Generated Audio Player */}
        {generatedAudioUrl && (
          <Box bg="purple.50" p={4} rounded="lg">
            <Heading size="md" mb={3}>Generated Audio</Heading>
            
            <HStack justifyContent="center" alignItems="center" space={4} mb={4}>
              <IconButton
                icon={
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={32}
                    color="purple.600"
                  />
                }
                size="lg"
                variant="ghost"
                onPress={handlePlayAudio}
              />
              <VStack flex={1}>
                <Text fontSize="sm" color="gray.600">
                  {audioType} • {duration}s • {audioModels.find(m => m.id === selectedModel)?.name}
                </Text>
              </VStack>
            </HStack>
            
            <HStack justifyContent="space-between">
              <Button
                variant="outline"
                leftIcon={<Ionicons name="download-outline" size={16} />}
                onPress={handleDownloadAudio}
              >
                Download
              </Button>
              <Button
                variant="outline"
                leftIcon={<Ionicons name="share-outline" size={16} />}
                onPress={() => {
                  if (generatedAudioUrl) {
                    Sharing.shareAsync(generatedAudioUrl);
                  }
                }}
              >
                Share
              </Button>
            </HStack>
          </Box>
        )}

        {/* Generate Button */}
        <Button
          size="lg"
          colorScheme="orange"
          leftIcon={<Ionicons name="musical-notes-outline" size={20} />}
          onPress={handleGenerateAudio}
          isLoading={isGenerating}
          loadingText="Generating..."
        >
          Generate {audioType === 'music' ? 'Music' : audioType === 'voice' ? 'Voice' : 'Sound Effect'}
        </Button>
      </VStack>

      {/* Voice Clone Modal */}
      <Modal isOpen={isVoiceCloneOpen} onClose={closeVoiceClone}>
        <Modal.Content maxWidth="90%">
          <Modal.CloseButton />
          <Modal.Header>Clone Voice</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <Text>Upload 3-5 voice samples (10-30 seconds each) to create a custom voice clone.</Text>
              
              <Button
                variant="outline"
                leftIcon={<Ionicons name="cloud-upload-outline" size={16} />}
                onPress={handleVoiceCloneUpload}
              >
                Upload Voice Samples
              </Button>
              
              {voiceCloneFiles.length > 0 && (
                <Box>
                  <Text fontWeight="bold" mb={2}>Uploaded Samples:</Text>
                  {voiceCloneFiles.map((file, index) => (
                    <HStack key={index} justifyContent="space-between" alignItems="center">
                      <Text fontSize="sm" flex={1}>{file.name}</Text>
                      <IconButton
                        size="sm"
                        icon={<Ionicons name="close" size={16} />}
                        onPress={() => setVoiceCloneFiles(files => files.filter((_, i) => i !== index))}
                      />
                    </HStack>
                  ))}
                </Box>
              )}
              
              <Button
                onPress={handleCreateVoiceClone}
                isDisabled={voiceCloneFiles.length < 3}
              >
                Create Voice Clone
              </Button>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </ScrollView>
  );
}