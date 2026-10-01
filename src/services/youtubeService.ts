export interface EducationalVideo {
  id: string;
  videoId: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnail: string;
  durationTag: string; // e.g., '3 min'
  category: string;
}

const YOUTUBE_KEY =
  import.meta.env.VITE_YOUTUBE_API_KEY ||
  'AIzaSyAofrKbuV-CdASAN21vbCejohrI8FnGp-g';

// Vetted offline/curated educational micro-learning library
const CURATED_VIDEOS: EducationalVideo[] = [
  {
    id: 'vid_carpentry_1',
    videoId: 'qj8a61L_n2o',
    title: 'The Art of Japanese Joinery: Kanawa Tsugi Seamless Locks',
    channelTitle: 'Traditional Craftsmanship Guild',
    description: 'Witness the master carpenters interlocking ancient cedar beams without nails.',
    thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    durationTag: '3:45',
    category: 'Architecture',
  },
  {
    id: 'vid_quantum_1',
    videoId: 'z1GCnyRNTgk',
    title: 'Quantum Computing in 3 Minutes: The Superposition Principle',
    channelTitle: 'Domain of Science',
    description: 'How qubits utilize complex wave amplitude superpositions to evaluate algorithmic states.',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    durationTag: '3:15',
    category: 'Physics',
  },
  {
    id: 'vid_memory_1',
    videoId: 'Z-zNHHpXoMM',
    title: 'How Spaced Repetition Rewires Synaptic Pathways in 180s',
    channelTitle: 'Neuroscience Distilled',
    description: 'Visualizing long-term potentiation and dendritic spine consolidation.',
    thumbnail: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=80',
    durationTag: '2:50',
    category: 'Cognitive Science',
  },
  {
    id: 'vid_tea_1',
    videoId: 'z0Ue9vH0kOI',
    title: 'Sen no Rikyū: The Radical Minimalism of Wabi Tea Ceremony',
    channelTitle: 'Kyoto Aesthetic Archives',
    description: 'How rustic clay bowls transformed power dynamics in Feudal Japan.',
    thumbnail: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    durationTag: '4:10',
    category: 'History',
  },
  {
    id: 'vid_math_1',
    videoId: 'HEfHFsfGXjs',
    title: 'The Essence of Calculus & The Geometry of Change',
    channelTitle: '3Blue1Brown Insights',
    description: 'An intuitive visual breakdown of derivatives and integration from first principles.',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    durationTag: '3:30',
    category: 'Mathematics',
  },
  {
    id: 'vid_bio_1',
    videoId: '8kK2zwjRV0M',
    title: 'Cellular Respiration & ATP Synthase: Nature’s Rotary Motor',
    channelTitle: 'Microbiology Today',
    description: 'A 2-minute journey inside the inner mitochondrial membrane proton gradient.',
    thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
    durationTag: '2:40',
    category: 'Biology',
  },
];

/**
 * Search YouTube Data API v3 for educational micro-lectures
 */
export async function searchEducationalVideos(
  query: string = 'micro learning educational documentary'
): Promise<EducationalVideo[]> {
  try {
    const encodedQuery = encodeURIComponent(
      `${query} educational short lecture animation documentary`
    );
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodedQuery}&type=video&videoDuration=short&maxResults=8&key=${YOUTUBE_KEY}`;

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        return data.items.map((item: any, index: number) => ({
          id: item.id.videoId || `yt_${index}`,
          videoId: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          description: item.snippet.description,
          thumbnail:
            item.snippet.thumbnails?.high?.url ||
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.default?.url,
          durationTag: '< 4 min',
          category: 'Educational',
        }));
      }
    }
  } catch (err) {
    console.warn('YouTube Data API fetch fallback to curated list:', err);
  }

  // Filter curated collection if query provided
  const qLower = query.toLowerCase();
  const matched = CURATED_VIDEOS.filter(
    (v) =>
      v.title.toLowerCase().includes(qLower) ||
      v.category.toLowerCase().includes(qLower) ||
      v.description.toLowerCase().includes(qLower)
  );

  return matched.length > 0 ? matched : CURATED_VIDEOS;
}

export function getCuratedVideos(): EducationalVideo[] {
  return CURATED_VIDEOS;
}
