-- MySQL dump 10.13  Distrib 9.6.0, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: ai_safehouse
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ai_models`
--

DROP TABLE IF EXISTS `ai_models`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_models` (
  `model_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `description` text,
  `tags` varchar(255) DEFAULT NULL,
  `avg_rating` decimal(3,2) DEFAULT '0.00',
  `website_url` varchar(255) DEFAULT NULL,
  `is_free` tinyint(1) DEFAULT '1',
  `category_id` int DEFAULT NULL,
  PRIMARY KEY (`model_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `ai_models_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_models`
--

LOCK TABLES `ai_models` WRITE;
/*!40000 ALTER TABLE `ai_models` DISABLE KEYS */;
INSERT INTO `ai_models` VALUES (1,'Midjourney','Generate stunning images from text prompts','image,art,design',4.80,'https://midjourney.com',0,1),(2,'ChatGPT','Powerful conversational AI for writing and tasks','chat,writing,assistant',4.70,'https://chat.openai.com',1,2),(3,'GitHub Copilot','AI pair programmer','code,programming',4.60,'https://github.com/features/copilot',0,4),(4,'Runway (Gen-2)','Runway Gen-2 for prompt-to-video generation, visual experimentation, and AI filmmaking workflows.','video,editing,generation,runway,gen-2',4.90,'https://runwayml.com',0,3),(5,'Notion AI','AI writing assistant','productivity,writing',4.40,'https://notion.so',0,5),(6,'Sora','OpenAI video generation model for cinematic prompt-to-video scenes and creative motion concepts.','video,editing,generation,openai,sora',4.95,'https://openai.com/sora',0,3),(7,'Pika Labs','Fast AI video generation for motion clips, scene animation, and stylized prompt-based output.','video,editing,generation,pika,animation',4.72,'https://pika.art',1,3),(8,'Luma Dream Machine','Luma Dream Machine for cinematic AI video generation with strong motion and scene continuity.','video,editing,generation,luma,dream-machine',4.78,'https://lumalabs.ai/dream-machine',1,3),(9,'Kling AI','AI video generation platform focused on realistic motion, stylized scenes, and prompt-driven clips.','video,editing,generation,kling,motion',4.68,'https://klingai.com',1,3),(10,'HeyGen','Creates digital presenters and talking avatar videos for marketing, explainers, and business communication.','video,editing,avatar,presenter,heygen',4.66,'https://heygen.com',0,3),(11,'Synthesia','AI avatar platform for training videos, onboarding content, and multilingual presenter videos.','video,editing,avatar,training,synthesia',4.74,'https://www.synthesia.io',0,3),(12,'InVideo AI','Turns prompts and scripts into ready-made marketing and social media videos with AI assistance.','video,editing,script-to-video,marketing,invideo',4.61,'https://invideo.io',1,3),(13,'Pictory','Creates summary videos from text, long-form content, and articles with an easy AI workflow.','video,editing,summary,pictory,content',4.45,'https://pictory.ai',1,3),(14,'Kaiber','AI video creation tool popular for artistic visuals, music videos, and experimental motion design.','video,editing,art,music,kaiber',4.53,'https://kaiber.ai',0,3),(15,'DeepBrain AI','Builds AI presenter videos and digital-human business content with realistic avatars.','video,editing,avatar,presenter,deepbrain',4.38,'https://www.deepbrain.io',0,3),(16,'Hour One','Generates business-ready AI presenter videos using synthetic actors and scripted scenes.','video,editing,avatar,hour-one,presenter',4.34,'https://hourone.ai',0,3),(17,'Colossyan','Training and explainer video generation with AI actors and localization-friendly workflows.','video,editing,training,colossyan,avatar',4.31,'https://www.colossyan.com',0,3),(18,'Elai.io','AI video creation tool for presenter-style content, explainers, and digital spokesperson videos.','video,editing,avatar,elai,presenter',4.29,'https://elai.io',0,3),(19,'Sieve','Developer-focused video processing platform for AI video pipelines and media automation workflows.','video,editing,api,sieve,processing',4.21,'https://www.sieve.id',0,3),(20,'Descript','Smart video and audio editing through text-based editing, transcript workflows, and studio tools.','video,editing,descript,text-editing,audio',4.82,'https://www.descript.com',1,3),(21,'Adobe Premiere Pro','Professional editor with AI features for color, masking, reframing, transcription, and editing speedups.','video,editing,premiere,adobe,pro',4.70,'https://www.adobe.com/products/premiere.html',0,3),(22,'CapCut','Popular AI-assisted editor for social content, captions, templates, and short-form video workflows.','video,editing,capcut,shorts,social',4.84,'https://www.capcut.com',1,3),(23,'Wondershare Filmora','Accessible AI video editor with templates, effects, smart cut tools, and creator-friendly workflows.','video,editing,filmora,wondershare,creator',4.42,'https://filmora.wondershare.com',1,3),(24,'DaVinci Resolve','Professional post-production suite with Neural Engine features for enhancement and intelligent editing.','video,editing,davinci,neural-engine,color',4.88,'https://www.blackmagicdesign.com/products/davinciresolve',1,3),(25,'Munch','Turns long-form videos into social-ready shorts and highlights optimized for platforms like Shorts and Reels.','video,editing,munch,shorts,reels',4.33,'https://www.getmunch.com',0,3),(26,'OpusClip','Converts podcasts and long videos into short viral clips, highlights, and repurposed social edits.','video,editing,opusclip,podcast,reels',4.67,'https://www.opus.pro',1,3),(27,'Veed.io','Browser-based editor with subtitles, templates, smart editing, and fast creator workflows.','video,editing,veed,browser,subtitles',4.59,'https://www.veed.io',1,3),(28,'FlexClip','Lightweight online editor with AI templates and simple drag-and-drop video creation features.','video,editing,flexclip,online,templates',4.19,'https://www.flexclip.com',1,3),(29,'Kapwing','Collaborative online editor for captions, short content, resizing, and everyday video tasks.','video,editing,kapwing,collaboration,subtitles',4.46,'https://www.kapwing.com',1,3),(30,'Wisecut','Automatically removes silence, adds jump cuts, and speeds up talking-head video editing.','video,editing,wisecut,silence,jump-cuts',4.28,'https://www.wisecut.video',1,3),(31,'Gling','YouTuber-focused editor that removes bad takes, awkward pauses, and cleanup work before publishing.','video,editing,gling,youtube,cleanup',4.37,'https://www.gling.ai',1,3),(32,'Submagic','Creates polished subtitles and social-style captions designed for short-form engagement.','video,editing,subtitles,captions,submagic',4.52,'https://www.submagic.co',0,3),(33,'Topaz Video AI','Upscales and restores video quality with AI, including sharpening, interpolation, and 4K enhancement.','video,editing,enhancement,4k,topaz',4.76,'https://www.topazlabs.com/video-ai',0,3),(34,'Remini Video','Enhances and restores video clarity using AI cleanup and quality improvement workflows.','video,editing,enhancement,remini,restoration',4.18,'https://www.remini.ai',1,3),(35,'Ecrett Music','Generates background music that can be used to support AI video and editing projects.','video,editing,music,ecrett,background-audio',4.08,'https://www.ecrettmusic.com',1,3),(36,'D-ID','Animates still images and portraits into talking videos and expressive digital spokesperson content.','video,editing,animation,d-id,talking-photo',4.58,'https://www.d-id.com',0,3),(37,'Reface','Face-swap and identity transformation tool for playful AI video effects and edits.','video,editing,reface,face-swap,effects',4.05,'https://reface.ai',1,3),(38,'Lalal.ai','Separates vocals, music, and stems to clean up audio inside video production workflows.','video,editing,audio,lalal,stem-separation',4.41,'https://www.lalal.ai',1,3),(39,'Adobe Podcast Enhance','Cleans dialogue and spoken audio to improve the sound quality of videos and podcasts.','video,editing,audio,adobe,podcast',4.73,'https://podcast.adobe.com/enhance',1,3),(40,'Rask.ai','AI dubbing platform for translating and localizing videos into many languages.','video,editing,dubbing,translation,rask',4.49,'https://www.rask.ai',0,3),(41,'Dubverse','Multilingual dubbing and voice localization tool for fast video translation workflows.','video,editing,dubbing,translation,dubverse',4.27,'https://dubverse.ai',1,3),(42,'Captions.ai','Creates captions, talking videos, and smart edits for creators building short-form content.','video,editing,captions,shorts,creator',4.57,'https://www.captions.ai',1,3),(43,'Maestra','Subtitle, dubbing, and transcription platform for multilingual video publishing.','video,editing,translation,dubbing,maestra',4.24,'https://maestra.ai',1,3),(44,'Unscreen','Removes video backgrounds without green screen using automatic AI subject isolation.','video,editing,background,greenscreen,unscreen',4.55,'https://www.unscreen.com',1,3),(45,'EbSynth','Transforms footage into painterly or stylized animation by transferring visual style frame by frame.','video,editing,style,art,ebsynth',4.16,'https://ebsynth.com',1,3),(46,'Wonder Dynamics','Adds CG characters into live-action scenes with automated compositing and tracking.','video,editing,vfx,cg,wonder-dynamics',4.63,'https://wonderdynamics.com',0,3),(47,'Plask','Video-to-animation and motion capture workflow for character movement and scene performance.','video,editing,mocap,plask,animation',4.22,'https://plask.ai',1,3),(48,'Move.ai','Markerless motion capture system for extracting realistic body movement from video.','video,editing,mocap,move.ai,animation',4.51,'https://www.move.ai',0,3),(49,'Rokoko','Character animation and motion capture ecosystem used in virtual production and VFX pipelines.','video,editing,mocap,rokoko,vfx',4.39,'https://www.rokoko.com',0,3),(50,'Artlist AI','AI-supported creative asset ecosystem for video creators working with footage, sound, and editing inspiration.','video,editing,assets,artlist,creator',4.26,'https://artlist.io',0,3),(51,'Neural Frames','Generates AI animated visuals and music-driven video scenes for artistic storytelling.','video,editing,animation,music,neural-frames',4.44,'https://www.neuralframes.com',0,3),(52,'LeiaPix','Creates depth-based 3D and parallax motion effects that can be used in videos and visual scenes.','video,editing,3d,parallax,leiapix',4.12,'https://www.leiapix.com',1,3),(53,'Viggle AI','Motion and character animation tool for playful, meme-style, and comedic video outputs.','video,editing,animation,viggle,character',4.36,'https://www.viggle.ai',1,3);
/*!40000 ALTER TABLE `ai_models` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Image Generation'),(2,'Text & Writing'),(3,'Video & Editing'),(4,'Code Assistant'),(5,'Productivity'),(6,'Marketing'),(7,'Design & UI'),(8,'Automation'),(10,'From Text to Audio'),(11,'From Text to Video'),(12,'Apply Audio on Video');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `model_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `user_id` (`user_id`),
  KEY `model_id` (`model_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`model_id`) REFERENCES `ai_models` (`model_id`),
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,1,1,5,'Amazing tool!','2026-04-12 20:21:35');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Ahmed','ahmed@example.com','2026-04-12 20:21:27');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-18 21:53:37


