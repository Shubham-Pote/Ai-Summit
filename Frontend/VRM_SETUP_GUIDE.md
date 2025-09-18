# 🎭 VRM Model Integration Guide

## 📁 **Where to Place VRM Models**

Create the following directory structure in your Frontend:

```
Frontend/
├── public/
│   └── models/
│       ├── maria/
│       │   ├── maria.vrm        (Main VRM file for María)
│       │   ├── textures/        (Optional: additional textures)
│       │   └── animations/      (Optional: custom animations)
│       ├── akira/
│       │   ├── akira.vrm        (Main VRM file for Akira)
│       │   ├── textures/        (Optional: additional textures)
│       │   └── animations/      (Optional: custom animations)
│       └── shared/
│           ├── environments/    (Background environments)
│           └── effects/         (Particle effects, etc.)
```

## 🎯 **Recommended VRM Models**

### For María (Spanish Teacher):
- **Style**: Friendly, warm appearance
- **Clothing**: Casual teacher attire (blouse, cardigan)
- **Hair**: Brown/dark, medium length
- **Expressions**: Happy, encouraging, thoughtful
- **Animations**: Gesturing, nodding, speaking

### For Akira (Japanese Teacher):
- **Style**: Professional, respectful appearance  
- **Clothing**: Business casual (shirt, jacket)
- **Hair**: Dark, neat style
- **Expressions**: Polite, concentrated, encouraging
- **Animations**: Bowing, precise gestures, teaching poses

## 🔗 **Free VRM Model Sources**

1. **VRoid Hub**: https://hub.vroid.com/
   - Search for "teacher" or "student" models
   - Filter by "Commercial Use OK" if needed

2. **Booth.pm**: https://booth.pm/
   - Search for "VRM 先生" (teacher) or "VRM キャラクター"
   - Many free and paid options

3. **VRChat Community**: 
   - Look for educational/teacher avatars
   - Ensure proper licensing

## ⚙️ **VRM File Requirements**

- **Format**: .vrm (VRM 0.0 or 1.0)
- **Polygons**: <20k triangles for web performance
- **Textures**: 1024x1024 or 512x512 for optimization
- **Blendshapes**: For facial expressions and lip sync
- **Bones**: Standard humanoid bone structure

## 🎮 **Animation Requirements**

The VRM models should support these expressions:
- **Happy** (for positive responses)
- **Thinking** (during processing)
- **Surprised** (for interesting topics)
- **Neutral** (default state)
- **Speaking** (lip sync blendshapes)

## 📝 **Installation Steps**

1. **Download VRM models** from the sources above
2. **Rename them** to `maria.vrm` and `akira.vrm`
3. **Place them** in the respective folders:
   - `Frontend/public/models/maria/maria.vrm`
   - `Frontend/public/models/akira/akira.vrm`
4. **Test loading** in the character chat interface
5. **Adjust positioning** in the VRM viewer component

## 🚀 **Implementation Notes**

The VRM integration includes:
- **three.js** for 3D rendering
- **@pixiv/three-vrm** for VRM loading
- **Emotion-based animations** triggered by AI responses
- **Performance optimization** for web browsers
- **Fallback placeholder** when models aren't loaded

## 🎨 **Customization Options**

You can customize:
- **Lighting** (ambient, directional)
- **Camera positioning** (angle, distance)
- **Background** (solid color, environment)
- **Animation timing** (emotion transitions)
- **Model scaling** (to fit interface)

The system automatically detects if VRM files are present and loads them, otherwise shows a placeholder with the character flag emoji.