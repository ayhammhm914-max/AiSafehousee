const db = require('../config/db')

const categoryNames = [
  'LLMs',
  'Coding AI Models',
  'Image Generation Models',
  'Video Generation Models',
  'Audio / Speech Models',
  'Multimodal Models',
  'Robotics / Agents',
  'Data / Prediction Models',
  'Specialized AI Models',
]

const catalog = [
  { name: 'GPT-4', category: 'LLMs', websiteUrl: 'https://openai.com/research/gpt-4', description: 'Advanced text generation and reasoning model from OpenAI.', isFree: false, tags: 'llm,text,reasoning,openai,gpt-4' },
  { name: 'GPT-5', category: 'LLMs', websiteUrl: 'https://openai.com/gpt-5/', description: 'Next-generation multimodal reasoning model from OpenAI.', isFree: false, tags: 'llm,multimodal,reasoning,openai,gpt-5' },
  { name: 'Claude 3 Opus', category: 'LLMs', websiteUrl: 'https://www.anthropic.com/news/claude-3-family', description: 'High-end Claude model for deep reasoning and long-context analysis.', isFree: false, tags: 'llm,reasoning,long-context,anthropic,claude' },
  { name: 'Claude 3 Sonnet', category: 'LLMs', websiteUrl: 'https://www.anthropic.com/news/claude-3-family', description: 'Balanced Claude model for everyday assistant and reasoning tasks.', isFree: false, tags: 'llm,assistant,balanced,anthropic,claude' },
  { name: 'Claude 3 Haiku', category: 'LLMs', websiteUrl: 'https://www.anthropic.com/news/claude-3-family', description: 'Fast lightweight Claude model for quick responses.', isFree: false, tags: 'llm,fast,lightweight,anthropic,claude' },
  { name: 'Gemini 1.5 Pro', category: 'LLMs', websiteUrl: 'https://deepmind.google/models/gemini/', description: 'Gemini model focused on multimodal understanding and long context.', isFree: false, tags: 'llm,multimodal,long-context,google,gemini' },
  { name: 'Gemini 1.5 Flash', category: 'LLMs', websiteUrl: 'https://deepmind.google/models/gemini/', description: 'Fast Gemini model for lightweight assistant tasks.', isFree: false, tags: 'llm,fast,assistant,google,gemini' },
  { name: 'LLaMA 3', aliases: ['Llama 3'], category: 'LLMs', websiteUrl: 'https://www.llama.com/llama3/', description: 'Open-weight LLM family from Meta for general text reasoning.', isFree: true, tags: 'llm,open-source,meta,llama,reasoning' },
  { name: 'Mistral Large', category: 'LLMs', websiteUrl: 'https://mistral.ai/news/mistral-large/', description: 'High-performance large language model from Mistral.', isFree: false, tags: 'llm,mistral,reasoning,enterprise,large' },
  { name: 'Mixtral 8x7B', category: 'LLMs', websiteUrl: 'https://mistral.ai/news/mixtral-of-experts/', description: 'Mixture-of-experts language model from Mistral.', isFree: true, tags: 'llm,moe,mistral,open-source,mixtral' },
  { name: 'Falcon 180B', category: 'LLMs', websiteUrl: 'https://falconllm.tii.ae/', description: 'Large open-source language model from TII.', isFree: true, tags: 'llm,open-source,falcon,tii,large' },
  { name: 'Command R+', category: 'LLMs', websiteUrl: 'https://docs.cohere.com/docs/command-r-plus', description: 'Enterprise conversational AI model from Cohere.', isFree: false, tags: 'llm,enterprise,cohere,conversational,rag' },
  { name: 'Jurassic-2', category: 'LLMs', websiteUrl: 'https://docs.ai21.com/docs/jurassic-2-models', description: 'NLP and text generation model family from AI21 Labs.', isFree: false, tags: 'llm,text-generation,ai21,jurassic,nlp' },
  { name: 'BLOOM', category: 'LLMs', websiteUrl: 'https://huggingface.co/bigscience/bloom', description: 'Multilingual open large language model from BigScience.', isFree: true, tags: 'llm,multilingual,open-source,bloom,bigscience' },
  { name: 'PaLM 2', category: 'LLMs', websiteUrl: 'https://developers.googleblog.com/en/palm-2-api/', description: 'Google model for text reasoning and language tasks.', isFree: false, tags: 'llm,google,palm,text,reasoning' },
  { name: 'RWKV', category: 'LLMs', websiteUrl: 'https://www.rwkv.com/', description: 'RNN-style language model architecture with LLM behavior.', isFree: true, tags: 'llm,rnn,open-source,rwkv,text' },
  { name: 'DeepSeek LLM', category: 'LLMs', websiteUrl: 'https://github.com/deepseek-ai/DeepSeek-LLM', description: 'Reasoning and coding oriented LLM from DeepSeek.', isFree: true, tags: 'llm,reasoning,coding,deepseek,open-source' },
  { name: 'Qwen 2', category: 'LLMs', websiteUrl: 'https://qwenlm.github.io/blog/qwen2/', description: 'Alibaba open LLM family for multilingual reasoning.', isFree: true, tags: 'llm,qwen,alibaba,multilingual,open-source' },
  { name: 'Yi-34B', category: 'LLMs', websiteUrl: 'https://www.01.ai/', description: 'Chinese and English large model from 01.AI.', isFree: true, tags: 'llm,yi,01.ai,bilingual,open-source' },
  { name: 'Orca', category: 'LLMs', websiteUrl: 'https://www.microsoft.com/en-us/research/blog/orca-2-teaching-small-language-models-how-to-reason/', description: 'Reasoning-focused language model line from Microsoft Research.', isFree: true, tags: 'llm,reasoning,microsoft,orca,research' },

  { name: 'Codex', category: 'Coding AI Models', websiteUrl: 'https://openai.com/codex', description: 'OpenAI coding agent for generation, editing, and software tasks.', isFree: false, tags: 'coding,agent,openai,codex,developer' },
  { name: 'Code LLaMA', aliases: ['Code Llama'], category: 'Coding AI Models', websiteUrl: 'https://www.llama.com/code-llama/', description: 'Code-focused large language model from Meta.', isFree: true, tags: 'coding,llama,meta,open-source,developer' },
  { name: 'DeepSeek-Coder', category: 'Coding AI Models', websiteUrl: 'https://github.com/deepseek-ai/DeepSeek-Coder', description: 'Coding and debugging model family from DeepSeek.', isFree: true, tags: 'coding,debugging,deepseek,open-source,developer' },
  { name: 'StarCoder', category: 'Coding AI Models', websiteUrl: 'https://huggingface.co/bigcode/starcoder', description: 'Open-source coding model from BigCode.', isFree: true, tags: 'coding,open-source,bigcode,starcoder,developer' },
  { name: 'WizardCoder', category: 'Coding AI Models', websiteUrl: 'https://wizardlm.github.io/WizardCoder/', description: 'Instruction-tuned coding model for developer tasks.', isFree: true, tags: 'coding,instruction-tuned,wizardcoder,open-source,developer' },
  { name: 'PolyCoder', category: 'Coding AI Models', websiteUrl: 'https://github.com/VHellendoorn/Code-LMs', description: 'Code generation model with a focus on C language tasks.', isFree: true, tags: 'coding,c-language,polycoder,open-source,developer' },
  { name: 'CodeGeeX', category: 'Coding AI Models', websiteUrl: 'https://codegeex.cn/en-US', description: 'Multilingual coding AI assistant from THUDM.', isFree: true, tags: 'coding,multilingual,codegeex,assistant,developer' },
  { name: 'Replit Code AI', category: 'Coding AI Models', websiteUrl: 'https://replit.com/ai', description: 'Replit developer assistant for coding and app building.', isFree: false, tags: 'coding,replit,assistant,developer,automation' },
  { name: 'AlphaCode', category: 'Coding AI Models', websiteUrl: 'https://deepmind.google/discover/blog/competitive-programming-with-alphacode/', description: 'DeepMind model for competitive programming and hard coding tasks.', isFree: true, tags: 'coding,competitive-programming,alphacode,deepmind,reasoning' },
  { name: 'CodeT5', category: 'Coding AI Models', websiteUrl: 'https://github.com/salesforce/CodeT5', description: 'Code understanding and generation model from Salesforce.', isFree: true, tags: 'coding,code-understanding,codet5,salesforce,open-source' },

  { name: 'DALL·E 3', aliases: ['DALL-E 3', 'Dalle 3'], category: 'Image Generation Models', websiteUrl: 'https://openai.com/dall-e-3', description: 'Text-to-image generation model from OpenAI.', isFree: false, tags: 'image,text-to-image,openai,dalle,art' },
  { name: 'Midjourney', category: 'Image Generation Models', websiteUrl: 'https://www.midjourney.com/home', description: 'Artistic image generation tool for stylized visuals.', isFree: false, tags: 'image,art,midjourney,design,creative' },
  { name: 'Stable Diffusion', category: 'Image Generation Models', websiteUrl: 'https://stability.ai/stable-diffusion', description: 'Open-source image generation model family from Stability AI.', isFree: true, tags: 'image,stable-diffusion,open-source,stability,art' },
  { name: 'SDXL', category: 'Image Generation Models', websiteUrl: 'https://stability.ai/news/stable-diffusion-xl-release', description: 'High-quality image generation model in the Stable Diffusion line.', isFree: true, tags: 'image,sdxl,stable-diffusion,stability,art' },
  { name: 'Imagen', category: 'Image Generation Models', websiteUrl: 'https://deepmind.google/technologies/imagen-3/', description: 'Google photorealistic image generation model.', isFree: false, tags: 'image,imagen,google,photorealistic,art' },
  { name: 'Kandinsky', category: 'Image Generation Models', websiteUrl: 'https://github.com/ai-forever/Kandinsky-2', description: 'Creative image generation model family from AI Forever.', isFree: true, tags: 'image,kandinsky,open-source,creative,art' },
  { name: 'Leonardo AI', category: 'Image Generation Models', websiteUrl: 'https://leonardo.ai', description: 'Design-focused image generation platform.', isFree: false, tags: 'image,design,leonardo,creative,art' },
  { name: 'Firefly', category: 'Image Generation Models', websiteUrl: 'https://www.adobe.com/products/firefly.html', description: 'Adobe generative image tool for creative workflows.', isFree: false, tags: 'image,adobe,firefly,design,creative' },
  { name: 'Playground AI', category: 'Image Generation Models', websiteUrl: 'https://playground.com', description: 'Image generation workspace for creative experiments.', isFree: true, tags: 'image,playground,creative,art,design' },
  { name: 'DreamStudio', category: 'Image Generation Models', websiteUrl: 'https://dreamstudio.ai', description: 'Official Stable Diffusion interface from Stability AI.', isFree: false, tags: 'image,dreamstudio,stable-diffusion,stability,art' },

  { name: 'Sora', category: 'Video Generation Models', websiteUrl: 'https://openai.com/sora', description: 'Realistic video generation model from OpenAI.', isFree: false, tags: 'video,generation,openai,sora,motion' },
  { name: 'Runway Gen-2', aliases: ['Runway (Gen-2)'], category: 'Video Generation Models', websiteUrl: 'https://runwayml.com', description: 'Text-to-video generation model from Runway.', isFree: false, tags: 'video,generation,runway,gen-2,motion' },
  { name: 'Pika Labs', category: 'Video Generation Models', websiteUrl: 'https://pika.art', description: 'AI video creation platform for prompt-based clips.', isFree: false, tags: 'video,generation,pika,animation,motion' },
  { name: 'Stable Video Diffusion', category: 'Video Generation Models', websiteUrl: 'https://stability.ai/news/stable-video-diffusion-open-ai-video-model', description: 'Open video generation model from Stability AI.', isFree: true, tags: 'video,generation,stable-video-diffusion,stability,open-source' },
  { name: 'ModelScope', category: 'Video Generation Models', websiteUrl: 'https://modelscope.cn/studios/damo/Text-to-Video-Synthesis', description: 'Text-to-video model and studio from ModelScope.', isFree: true, tags: 'video,generation,modelscope,text-to-video,open-source' },
  { name: 'VideoCrafter', category: 'Video Generation Models', websiteUrl: 'https://ailab-cvc.github.io/videocrafter/', description: 'Video synthesis model for prompt-based generation.', isFree: true, tags: 'video,generation,videocrafter,synthesis,open-source' },
  { name: 'Genmo', category: 'Video Generation Models', websiteUrl: 'https://www.genmo.ai', description: 'AI video creation platform for motion generation.', isFree: false, tags: 'video,generation,genmo,motion,creative' },
  { name: 'Lumiere', category: 'Video Generation Models', websiteUrl: 'https://lumiere-video.github.io', description: 'Google video generation model for coherent motion.', isFree: true, tags: 'video,generation,lumiere,google,motion' },
  { name: 'Phenaki', category: 'Video Generation Models', websiteUrl: 'https://research.google/blog/phenaki-variable-length-video-generation-from-open-domain-textual-descriptions/', description: 'Google research model for long video generation from text.', isFree: true, tags: 'video,generation,phenaki,google,long-form' },
  { name: 'AnimateDiff', category: 'Video Generation Models', websiteUrl: 'https://animatediff.github.io/', description: 'Animation generation workflow built on diffusion models.', isFree: true, tags: 'video,animation,animatediff,diffusion,open-source' },

  { name: 'Whisper', category: 'Audio / Speech Models', websiteUrl: 'https://openai.com/research/whisper', description: 'Speech-to-text model from OpenAI.', isFree: true, tags: 'audio,speech-to-text,whisper,openai,transcription' },
  { name: 'VALL-E', category: 'Audio / Speech Models', websiteUrl: 'https://www.microsoft.com/en-us/research/project/vall-e-x/', description: 'Voice cloning model family from Microsoft Research.', isFree: true, tags: 'audio,voice-cloning,vall-e,microsoft,speech' },
  { name: 'Bark', category: 'Audio / Speech Models', websiteUrl: 'https://github.com/suno-ai/bark', description: 'Text-to-speech model from Suno.', isFree: true, tags: 'audio,text-to-speech,bark,suno,voice' },
  { name: 'Tacotron 2', category: 'Audio / Speech Models', websiteUrl: 'https://github.com/NVIDIA/tacotron2', description: 'Speech synthesis model from NVIDIA.', isFree: true, tags: 'audio,speech-synthesis,tacotron,nvidia,voice' },
  { name: 'WaveNet', category: 'Audio / Speech Models', websiteUrl: 'https://deepmind.google/discover/blog/wavenet-a-generative-model-for-raw-audio/', description: 'DeepMind model for realistic voice generation.', isFree: true, tags: 'audio,wavenet,deepmind,voice,generation' },
  { name: 'ElevenLabs AI', aliases: ['ElevenLabs'], category: 'Audio / Speech Models', websiteUrl: 'https://elevenlabs.io', description: 'Voice generation and dubbing platform from ElevenLabs.', isFree: false, tags: 'audio,voice,elevenlabs,dubbing,speech' },
  { name: 'AudioLM', category: 'Audio / Speech Models', websiteUrl: 'https://google-research.github.io/seanet/audiolm/examples/', description: 'Google model for generating coherent audio from prompts.', isFree: true, tags: 'audio,audiolm,google,generation,speech' },
  { name: 'MusicLM', category: 'Audio / Speech Models', websiteUrl: 'https://google-research.github.io/seanet/musiclm/examples/', description: 'Google model for music generation from text.', isFree: true, tags: 'audio,musiclm,google,music,generation' },
  { name: 'Riffusion', category: 'Audio / Speech Models', websiteUrl: 'https://www.riffusion.com', description: 'Music loop generation tool using diffusion models.', isFree: true, tags: 'audio,music,riffusion,loops,generation' },
  { name: 'SoundStorm', category: 'Audio / Speech Models', websiteUrl: 'https://google-research.github.io/seanet/soundstorm/examples/', description: 'Google audio synthesis model for fast waveform generation.', isFree: true, tags: 'audio,soundstorm,google,synthesis,voice' },

  { name: 'GPT-4o', category: 'Multimodal Models', websiteUrl: 'https://openai.com/index/hello-gpt-4o/', description: 'OpenAI multimodal model for text, image, and audio tasks.', isFree: false, tags: 'multimodal,gpt-4o,openai,text,image,audio' },
  { name: 'Gemini Ultra', category: 'Multimodal Models', websiteUrl: 'https://deepmind.google/technologies/gemini/', description: 'Advanced multimodal Gemini model from Google.', isFree: false, tags: 'multimodal,gemini,google,reasoning,image' },
  { name: 'Kosmos-2', category: 'Multimodal Models', websiteUrl: 'https://www.microsoft.com/en-us/research/project/kosmos-2/', description: 'Vision and language model from Microsoft Research.', isFree: true, tags: 'multimodal,vision-language,kosmos,microsoft,image' },
  { name: 'Flamingo', category: 'Multimodal Models', websiteUrl: 'https://deepmind.google/discover/blog/tackling-multiple-tasks-with-a-single-visual-language-model/', description: 'Image understanding model from DeepMind.', isFree: true, tags: 'multimodal,vision-language,flamingo,deepmind,image' },
  { name: 'Gato', category: 'Multimodal Models', websiteUrl: 'https://deepmind.google/discover/blog/a-generalist-agent/', description: 'Generalist multimodal agent from DeepMind.', isFree: true, tags: 'multimodal,gato,deepmind,generalist,agent' },
  { name: 'Visual ChatGPT', category: 'Multimodal Models', websiteUrl: 'https://github.com/microsoft/visual-chatgpt', description: 'Image and text interaction system from Microsoft.', isFree: true, tags: 'multimodal,visual-chatgpt,microsoft,image,text' },
  { name: 'ImageBind', category: 'Multimodal Models', websiteUrl: 'https://imagebind.metademolab.com/', description: 'Meta model for binding multiple sensory inputs.', isFree: true, tags: 'multimodal,imagebind,meta,image,audio' },
  { name: 'BLIP-2', category: 'Multimodal Models', websiteUrl: 'https://github.com/salesforce/LAVIS/tree/main/projects/blip2', description: 'Vision-language model for image understanding and captioning.', isFree: true, tags: 'multimodal,blip-2,vision-language,salesforce,image' },
  { name: 'CLIP', category: 'Multimodal Models', websiteUrl: 'https://openai.com/research/clip', description: 'OpenAI model for image-text understanding.', isFree: true, tags: 'multimodal,clip,openai,image,text' },
  { name: 'ALIGN', category: 'Multimodal Models', websiteUrl: 'https://research.google/pubs/align-scaling-up-visual-and-vision-language-representation-learning-with-noisy-text-supervision/', description: 'Google image-text alignment model.', isFree: true, tags: 'multimodal,align,google,image,text' },

  { name: 'RT-2', category: 'Robotics / Agents', websiteUrl: 'https://deepmind.google/discover/blog/rt-2-new-model-translates-vision-and-language-into-action/', description: 'Robot reasoning model that maps vision and language into actions.', isFree: true, tags: 'robotics,rt-2,deepmind,vision,action' },
  { name: 'AutoGPT', category: 'Robotics / Agents', websiteUrl: 'https://agpt.co', description: 'Autonomous agent framework for long task automation.', isFree: true, tags: 'agents,autogpt,automation,open-source,task-execution' },
  { name: 'BabyAGI', category: 'Robotics / Agents', websiteUrl: 'https://babyagi.org', description: 'Task automation agent framework for autonomous planning.', isFree: true, tags: 'agents,babyagi,automation,planning,open-source' },
  { name: 'Voyager', category: 'Robotics / Agents', websiteUrl: 'https://voyager.minedojo.org/', description: 'Minecraft autonomous AI agent from the Voyager project.', isFree: true, tags: 'agents,voyager,minecraft,autonomous,reasoning' },
  { name: 'OpenAI Operator', category: 'Robotics / Agents', websiteUrl: 'https://openai.com/index/introducing-operator/', description: 'OpenAI agent for taking actions on the web.', isFree: false, tags: 'agents,operator,openai,web,automation' },
  { name: 'Meta AI Habitat', category: 'Robotics / Agents', websiteUrl: 'https://aihabitat.org/', description: 'Embodied AI platform for simulated robotics environments.', isFree: true, tags: 'robotics,habitat,meta,embodied-ai,simulation' },
  { name: 'SayCan', category: 'Robotics / Agents', websiteUrl: 'https://say-can.github.io/', description: 'Robot decision-making system from Google Research.', isFree: true, tags: 'robotics,saycan,google,decision-making,planning' },
  { name: 'RoboCat', category: 'Robotics / Agents', websiteUrl: 'https://deepmind.google/discover/blog/robocat-a-self-improving-robotic-agent/', description: 'Self-improving robotic learning agent from DeepMind.', isFree: true, tags: 'robotics,robocat,deepmind,learning,agent' },
  { name: 'PaLM-E', category: 'Robotics / Agents', websiteUrl: 'https://palm-e.github.io/', description: 'Robot and vision model for embodied tasks.', isFree: true, tags: 'robotics,palm-e,vision,embodied-ai,google' },
  { name: 'ACT-1', category: 'Robotics / Agents', websiteUrl: 'https://www.adept.ai/blog/act-1', description: 'Humanoid control and action model from Adept.', isFree: false, tags: 'robotics,act-1,adept,agents,control' },

  { name: 'XGBoost', category: 'Data / Prediction Models', websiteUrl: 'https://xgboost.readthedocs.io/', description: 'Structured data prediction model using gradient boosting.', isFree: true, tags: 'data,prediction,xgboost,boosting,ml' },
  { name: 'LightGBM', category: 'Data / Prediction Models', websiteUrl: 'https://lightgbm.readthedocs.io/', description: 'Gradient boosting framework optimized for speed.', isFree: true, tags: 'data,prediction,lightgbm,boosting,ml' },
  { name: 'CatBoost', category: 'Data / Prediction Models', websiteUrl: 'https://catboost.ai/', description: 'Gradient boosting model with strong categorical feature support.', isFree: true, tags: 'data,prediction,catboost,boosting,ml' },
  { name: 'Prophet', category: 'Data / Prediction Models', websiteUrl: 'https://facebook.github.io/prophet/', description: 'Time-series forecasting library from Meta.', isFree: true, tags: 'data,prediction,prophet,time-series,forecasting' },
  { name: 'ARIMA', category: 'Data / Prediction Models', websiteUrl: 'https://www.statsmodels.org/stable/generated/statsmodels.tsa.arima.model.ARIMA.html', description: 'Statistical forecasting model for time-series analysis.', isFree: true, tags: 'data,prediction,arima,time-series,forecasting' },
  { name: 'BERT', category: 'Data / Prediction Models', websiteUrl: 'https://research.google/pubs/bert-pre-training-of-deep-bidirectional-transformers-for-language-understanding/', description: 'Transformer model for NLP understanding tasks.', isFree: true, tags: 'data,nlp,bert,google,understanding' },
  { name: 'RoBERTa', category: 'Data / Prediction Models', websiteUrl: 'https://ai.meta.com/blog/roberta-an-optimized-method-for-pretraining-self-supervised-nlp-systems/', description: 'Improved BERT-style language model from Meta.', isFree: true, tags: 'data,nlp,roberta,meta,understanding' },
  { name: 'DistilBERT', category: 'Data / Prediction Models', websiteUrl: 'https://huggingface.co/distilbert/distilbert-base-uncased', description: 'Lightweight distilled BERT model for NLP tasks.', isFree: true, tags: 'data,nlp,distilbert,huggingface,lightweight' },
  { name: 'T5', category: 'Data / Prediction Models', websiteUrl: 'https://research.google/blog/exploring-transfer-learning-with-t5-the-text-to-text-transfer-transformer/', description: 'Text-to-text transformer model from Google.', isFree: true, tags: 'data,nlp,t5,google,text-to-text' },
  { name: 'ELECTRA', category: 'Data / Prediction Models', websiteUrl: 'https://research.google/pubs/electra-pre-training-text-encoders-as-discriminators-rather-than-generators/', description: 'Efficient NLP pretraining approach from Google Research.', isFree: true, tags: 'data,nlp,electra,google,training' },

  { name: 'AlphaFold', category: 'Specialized AI Models', websiteUrl: 'https://alphafold.ebi.ac.uk/', description: 'Protein structure prediction model from DeepMind.', isFree: true, tags: 'specialized,alphafold,biology,protein,deepmind' },
  { name: 'AlphaZero', category: 'Specialized AI Models', websiteUrl: 'https://deepmind.google/discover/blog/alphazero-shedding-new-light-on-chess-shogi-and-go/', description: 'Game-playing reinforcement learning system from DeepMind.', isFree: true, tags: 'specialized,alphazero,games,reinforcement-learning,deepmind' },
  { name: 'MuZero', category: 'Specialized AI Models', websiteUrl: 'https://deepmind.google/discover/blog/muzero-mastering-go-chess-shogi-and-atari-without-rules/', description: 'Model-based reinforcement learning system from DeepMind.', isFree: true, tags: 'specialized,muzero,reinforcement-learning,games,deepmind' },
  { name: 'DeepSpeech', category: 'Specialized AI Models', websiteUrl: 'https://github.com/mozilla/DeepSpeech', description: 'Speech recognition engine originally from Mozilla.', isFree: true, tags: 'specialized,deepspeech,speech-recognition,mozilla,audio' },
  { name: 'SAM (Segment Anything)', aliases: ['SAM'], category: 'Specialized AI Models', websiteUrl: 'https://segment-anything.com/', description: 'Image segmentation model from Meta AI.', isFree: true, tags: 'specialized,sam,segmentation,meta,vision' },
  { name: 'ControlNet', category: 'Specialized AI Models', websiteUrl: 'https://github.com/lllyasviel/ControlNet', description: 'Image conditioning model for controlled diffusion generation.', isFree: true, tags: 'specialized,controlnet,image,conditioning,diffusion' },
  { name: 'NeRF', category: 'Specialized AI Models', websiteUrl: 'https://www.matthewtancik.com/nerf', description: 'Neural radiance field approach for 3D scene generation.', isFree: true, tags: 'specialized,nerf,3d,scene-generation,vision' },
  { name: 'DreamFusion', category: 'Specialized AI Models', websiteUrl: 'https://dreamfusion3d.github.io/', description: 'Text-to-3D generation approach from Google.', isFree: true, tags: 'specialized,dreamfusion,3d,text-to-3d,google' },
  { name: 'Point-E', category: 'Specialized AI Models', websiteUrl: 'https://openai.com/research/point-e', description: 'OpenAI system for generating 3D point clouds.', isFree: true, tags: 'specialized,point-e,3d,point-cloud,openai' },
  { name: 'GraphCast', category: 'Specialized AI Models', websiteUrl: 'https://deepmind.google/science/graphcast/', description: 'Weather prediction model from Google DeepMind.', isFree: true, tags: 'specialized,graphcast,weather,prediction,deepmind' },
]

function normalizeName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function buildLogoUrl(websiteUrl) {
  return websiteUrl
    ? `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(websiteUrl)}`
    : null
}

async function ensureLogoColumn() {
  const [columns] = await db.query('DESCRIBE ai_models')
  const hasLogoColumn = columns.some(column => column.Field === 'logo_url')

  if (!hasLogoColumn) {
    await db.query('ALTER TABLE ai_models ADD COLUMN logo_url VARCHAR(255) NULL AFTER website_url')
  }
}

async function ensureCategories() {
  const categoryIds = new Map()

  for (const categoryName of categoryNames) {
    const [existingRows] = await db.query('SELECT category_id FROM categories WHERE name = ? LIMIT 1', [categoryName])

    if (existingRows.length) {
      categoryIds.set(categoryName, existingRows[0].category_id)
      continue
    }

    const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [categoryName])
    categoryIds.set(categoryName, result.insertId)
  }

  return categoryIds
}

async function loadExistingModels() {
  const [rows] = await db.query('SELECT model_id, name FROM ai_models')
  const existingByNormalizedName = new Map()

  for (const row of rows) {
    existingByNormalizedName.set(normalizeName(row.name), row)
  }

  return existingByNormalizedName
}

async function syncCatalog() {
  await ensureLogoColumn()
  const categoryIds = await ensureCategories()
  const existingByNormalizedName = await loadExistingModels()
  const seenInputNames = new Set()
  const results = {
    inserted: [],
    updated: [],
    duplicateInputNames: [],
  }

  for (const item of catalog) {
    const normalizedNames = [item.name, ...(item.aliases || [])].map(normalizeName).filter(Boolean)
    const primaryNormalizedName = normalizedNames[0]

    if (seenInputNames.has(primaryNormalizedName)) {
      results.duplicateInputNames.push(item.name)
      continue
    }

    seenInputNames.add(primaryNormalizedName)

    const existingModel = normalizedNames
      .map(normalizedName => existingByNormalizedName.get(normalizedName))
      .find(Boolean)

    const categoryId = categoryIds.get(item.category)
    const logoUrl = buildLogoUrl(item.websiteUrl)
    const params = [
      item.name,
      item.description,
      item.tags,
      item.websiteUrl,
      logoUrl,
      item.isFree ? 1 : 0,
      categoryId,
    ]

    if (existingModel) {
      await db.query(
        `UPDATE ai_models
         SET name = ?, description = ?, tags = ?, website_url = ?, logo_url = ?, is_free = ?, category_id = ?
         WHERE model_id = ?`,
        [...params, existingModel.model_id],
      )
      results.updated.push(item.name)
      existingByNormalizedName.set(primaryNormalizedName, { model_id: existingModel.model_id, name: item.name })
      continue
    }

    const [result] = await db.query(
      `INSERT INTO ai_models (name, description, tags, website_url, logo_url, is_free, category_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      params,
    )
    results.inserted.push(item.name)
    existingByNormalizedName.set(primaryNormalizedName, { model_id: result.insertId, name: item.name })
  }

  await db.query(
    `UPDATE ai_models
     SET logo_url = CASE
       WHEN website_url IS NULL OR website_url = '' THEN logo_url
       ELSE CONCAT('https://www.google.com/s2/favicons?sz=128&domain_url=', REPLACE(REPLACE(website_url, '&', '%26'), ' ', '%20'))
     END
     WHERE logo_url IS NULL OR logo_url = ''`,
  )

  return results
}

syncCatalog()
  .then(results => {
    console.log(JSON.stringify(results, null, 2))
    process.exit(0)
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
