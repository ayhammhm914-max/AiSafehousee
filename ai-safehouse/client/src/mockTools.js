const mockCategories = [
  { category_id: 1, name: 'Text & Writing', icon: '??' },
  { category_id: 2, name: 'Image & Art', icon: '??' },
  { category_id: 3, name: 'Code & Dev', icon: '??' },
  { category_id: 4, name: 'Video', icon: '??' },
  { category_id: 5, name: 'Audio & Music', icon: '??' },
  { category_id: 6, name: 'Productivity', icon: '?' },
]

const categoryToolSets = {
  'Text & Writing': ['PromptForge', 'ScriptNova', 'CopyPulse', 'LexiCore', 'StoryMesh', 'NotePilot', 'BrandScribe', 'EchoDraft'],
  'Image & Art': ['VisionBloom', 'PixelMuse', 'FrameAura', 'CanvasMint', 'StyleCore', 'NeonSketch', 'DreamLayer', 'PrismNest'],
  'Code & Dev': ['CodeHarbor', 'StackPilot', 'BugLens', 'DevOrbit', 'RepoSmith', 'LogicWave', 'PatchDrive', 'BuildSpark'],
  Video: ['MotionNest', 'ClipForge', 'ScenePilot', 'ReelMint', 'FrameRush', 'VisionCut', 'StoryMotion', 'EditPulse'],
  'Audio & Music': ['AudioBloom', 'BeatHarbor', 'VoiceNova', 'ToneSmith', 'ChordFlow', 'WaveNest', 'EchoMix', 'SonicPilot'],
  Productivity: ['TaskForge', 'FocusGrid', 'FlowPilot', 'SprintIQ', 'MindDock', 'PlanPulse', 'RoutineOS', 'TimeMesh'],
}

const categoryDescriptions = {
  'Text & Writing': 'Shapes ideas into polished writing, outlines, scripts, and branded copy in seconds.',
  'Image & Art': 'Generates striking visuals, concept art, brand assets, and fast design explorations.',
  'Code & Dev': 'Helps build, debug, explain, and ship software faster with sharper engineering support.',
  Video: 'Turns rough ideas into trailers, social clips, storyboards, and cinematic edits.',
  'Audio & Music': 'Creates voiceovers, melodies, sound textures, and clean production-ready audio.',
  Productivity: 'Organizes work, plans projects, summarizes clutter, and keeps momentum high.',
}

const mockTools = mockCategories.flatMap(category =>
  categoryToolSets[category.name].map((name, index) => ({
    model_id: `${category.category_id}-${index + 1}`,
    name,
    description: `${categoryDescriptions[category.name]} Built as an experimental showcase card for AI Safehouse.`,
    category_name: category.name,
    category_id: category.category_id,
    website_url: '#',
    logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=7dd3fc&bold=true&size=160`,
    is_free: (index + category.category_id) % 3 !== 0,
    avg_rating: (4.1 + ((index % 5) * 0.17)).toFixed(1),
    tags: category.name.toLowerCase(),
    is_mock: true,
  }))
)

export { mockCategories, mockTools }
