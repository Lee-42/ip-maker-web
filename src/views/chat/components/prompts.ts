// 提示词标签项
export interface PromptTagItem {
  name: string
  prompt: string
}

// 提示词分类 - 两级结构
export interface PromptTagCategory {
  category: string
  key: string
  items: PromptTagItem[]
}

// 统一的提示词库 - 基于优化提示词库文档
export const promptTags: PromptTagCategory[] = [
  // 1. 主体与装饰 (Subject & Accessories)
  {
    category: 'Subject & Accessories',
    key: 'subject_accessories',
    items: [
      {
        name: 'Mecha',
        prompt: 'mecha robot, gundam style, mechanical joints, hard surface modeling, sci-fi armor',
      },
      {
        name: 'Hoodie',
        prompt: 'streetwear hoodie, fabric texture, loose clothing, clothing folds',
      },
      {
        name: 'Armor',
        prompt: 'plate armor, knight, intricate metal design, protective gear, engraved details',
      },
      {
        name: 'Kimono',
        prompt: 'japanese kimono, silk texture, floral pattern, traditional clothing, wide sleeves',
      },
      {
        name: 'Cyborg',
        prompt: 'cyborg face, mechanical implants, half human half machine, wires, metal skin',
      },
      {
        name: 'Wings',
        prompt: 'wide spread wings, feathered details, angel wings, mechanical wings, majestic',
      },
      {
        name: 'Horns',
        prompt: 'demon horns, dragon horns, curved horns, keratin texture, sharp tip',
      },
      {
        name: 'Halo',
        prompt: 'glowing halo, ring of light, divine, angelic, floating above head',
      },
    ],
  },

  // 2. 艺术风格 (Art Style)
  {
    category: 'Art Style',
    key: 'art_style',
    items: [
      {
        name: 'Cyberpunk',
        prompt: 'cyberpunk style, neon glowing light, futuristic, sci-fi',
      },
      {
        name: 'Ukiyo-e',
        prompt: 'ukiyo-e style, woodblock print, flat color, bold lines',
      },
      {
        name: 'Oil Painting',
        prompt: 'oil painting texture, impasto, thick brushstrokes',
      },
      {
        name: 'Watercolor',
        prompt: 'watercolor painting, wet on wet, soft edges, pastel colors',
      },
      {
        name: 'Ink Painting',
        prompt: 'ink painting, sumi-e, black and white, high contrast',
      },
      {
        name: 'Pixel Art',
        prompt: 'pixel art, 16-bit, sprite, blocky, sharp edges',
      },
      {
        name: 'Low Poly',
        prompt: 'low poly art, faceted, geometric shapes, minimal shading',
      },
      {
        name: 'Vector Art',
        prompt: 'vector art, flat illustration, solid colors, clean lines',
      },
      {
        name: 'Art Nouveau',
        prompt: 'art nouveau style, mucha style, decorative border, stained glass',
      },
    ],
  },

  // 3. 材质与纹理 (Material & Texture)
  {
    category: 'Material & Texture',
    key: 'material_texture',
    items: [
      {
        name: 'Bas-relief',
        prompt:
          'bas-relief sculpture, stone carving style, 3d height map, monochromatic, depth map',
      },
      {
        name: 'Metallic',
        prompt: 'metal texture, polished surface, chrome reflection, brushed metal, shiny',
      },
      {
        name: 'Liquid Metal',
        prompt:
          'liquid chrome, melting metal, fluid simulation, mercury texture, highly reflective',
      },
      {
        name: 'Translucent',
        prompt:
          'translucent material, subsurface scattering, jade texture, frosted glass, semi-transparent',
      },
      {
        name: 'Ceramic',
        prompt: 'white porcelain material, smooth surface, matte finish, clean, minimalist',
      },
      {
        name: 'Mechanical',
        prompt: 'complex mechanical gears, clockwork, exposed mechanism, industrial, hard surface',
      },
      {
        name: 'Holographic',
        prompt: 'holographic, iridescent, prismatic color, rainbow reflection, foil effect',
      },
      {
        name: 'Glowing',
        prompt: 'bioluminescent, internal glow, light emitting, neon trim, self-luminous',
      },
    ],
  },

  // 4. 光影与环境 (Lighting & Environment)
  {
    category: 'Lighting & Environment',
    key: 'lighting_environment',
    items: [
      {
        name: 'Neon Lights',
        prompt: 'neon lighting, cyberpunk atmosphere, glowing signage, pink and blue lights',
      },
      {
        name: 'Rim Light',
        prompt: 'rim lighting, backlighting, strong outline, silhouette, separation light',
      },
      {
        name: 'Tyndall Effect',
        prompt: 'god rays, volumetric lighting, sun beams, hazy atmosphere, divine light',
      },
      {
        name: 'Universe',
        prompt: 'deep space, nebula, stars, cosmic background, galaxy, milky way',
      },
      {
        name: 'Fire',
        prompt: 'burning fire, flames, embers, dynamic lighting, warm tones, particles',
      },
      {
        name: 'Cyberpunk City',
        prompt: 'futuristic city, night city, skyscrapers, rainy street, neon reflections',
      },
    ],
  },

  // 5. 画质与基调 (Quality & Meta)
  {
    category: 'Quality & Meta',
    key: 'quality_meta',
    items: [
      {
        name: 'Masterpiece',
        prompt: '(masterpiece:1.2), best quality',
      },
      {
        name: 'Best Quality',
        prompt: 'best quality, highres',
      },
      {
        name: '8K Resolution',
        prompt: '8k resolution, 4k, ultra-detailed',
      },
      {
        name: 'Sharp Focus',
        prompt: 'sharp focus, crisp lines, clear edges, no blur',
      },
      {
        name: 'Highly Detailed',
        prompt: 'intricate details, hyperdetailed, fine details',
      },
      {
        name: '3D Render',
        prompt: 'physically based rendering, octane render, unreal engine 5',
      },
      {
        name: 'Cinematic',
        prompt: 'cinematic lighting, volumetric lighting, dramatic shadows',
      },
    ],
  },

  // 6. 构图与镜头 (Composition & Camera)
  {
    category: 'Composition & Camera',
    key: 'composition_camera',
    items: [
      {
        name: 'Front View',
        prompt: 'front view, facing camera, straight on',
      },
      {
        name: 'Symmetrical',
        prompt: 'perfectly symmetrical, mirror image, centered',
      },
      {
        name: 'Close-up',
        prompt: 'close-up, macro shot, headshot, zoom in',
      },
      {
        name: "Bird's-eye",
        prompt: "bird's-eye view, aerial view, from above",
      },
      {
        name: 'Low Angle',
        prompt: 'low angle view, from below, looking up',
      },
      {
        name: 'Fisheye',
        prompt: 'fisheye lens, distorted sphere, wide angle',
      },
      {
        name: 'Depth of Field',
        prompt: 'depth of field, bokeh, blurred background',
      },
      {
        name: 'Simple Background',
        prompt: 'simple background, solid color background, isolated',
      },
    ],
  },
]

export default promptTags
