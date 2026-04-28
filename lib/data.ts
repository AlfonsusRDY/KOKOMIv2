// Shared mock data used across home and detail pages
export interface Comic {
  slug: string;
  title: string;
  thumbnail: string;
  author: string;
  status: "Ongoing" | "Completed";
  genre: string[];
  description: string;
  chapterCount: number;
  latestChapter: number;
  lastUpdated: string; // ISO string
  views: number; // for popularity sorting
  rating: number;
}

export const COMICS: Comic[] = [
  {
    slug: "one-piece",
    title: "One Piece",
    thumbnail: "https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_%28Japanese%29.jpg",
    author: "Eiichiro Oda",
    status: "Ongoing",
    genre: ["Action", "Adventure", "Fantasy"],
    description:
      "Monkey D. Luffy berlayar bersama krunya mencari harta karun legendaris yang dikenal sebagai 'One Piece' agar menjadi Raja Bajak Laut.",
    chapterCount: 1116,
    latestChapter: 1116,
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    views: 9800000,
    rating: 9.8,
  },
  {
    slug: "naruto",
    title: "Naruto",
    thumbnail: "https://upload.wikimedia.org/wikipedia/en/9/9b/NarutoCoverTankobon1.jpg",
    author: "Masashi Kishimoto",
    status: "Completed",
    genre: ["Action", "Ninja", "Adventure"],
    description:
      "Naruto Uzumaki, seorang ninja muda yang bermimpi menjadi Hokage — pemimpin desanya — meskipun ia dikucilkan karena menjadi inang roh rubah berekor sembilan.",
    chapterCount: 700,
    latestChapter: 700,
    lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    views: 8500000,
    rating: 9.4,
  },
  {
    slug: "dragon-ball-super",
    title: "Dragon Ball Super",
    thumbnail: "https://upload.wikimedia.org/wikipedia/en/4/47/Dragon_Ball_Super_manga_volume_1.png",
    author: "Akira Toriyama",
    status: "Ongoing",
    genre: ["Action", "Sci-Fi", "Comedy"],
    description:
      "Petualangan Son Goku dan kawan-kawan berlanjut setelah kekalahan Majin Buu, menghadapi ancaman dewa-dewa kehancuran dan alam semesta lain.",
    chapterCount: 103,
    latestChapter: 103,
    lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    views: 7200000,
    rating: 9.0,
  },
  {
    slug: "attack-on-titan",
    title: "Attack on Titan",
    thumbnail: "https://upload.wikimedia.org/wikipedia/en/d/d6/Shingeki_no_Kyojin_manga_volume_1.jpg",
    author: "Hajime Isayama",
    status: "Completed",
    genre: ["Action", "Drama", "Dark Fantasy"],
    description:
      "Di dunia di mana manusia hidup di balik tembok raksasa untuk berlindung dari Titan pemangsa manusia, Eren Yeager bersumpah untuk membasmi semua Titan.",
    chapterCount: 139,
    latestChapter: 139,
    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    views: 6800000,
    rating: 9.7,
  },
  {
    slug: "demon-slayer",
    title: "Demon Slayer",
    thumbnail: "https://upload.wikimedia.org/wikipedia/en/4/45/Kimetsu_no_Yaiba_Volume_1.png",
    author: "Koyoharu Gotouge",
    status: "Completed",
    genre: ["Action", "Supernatural", "Historical"],
    description:
      "Tanjiro Kamado menjadi pemburu iblis demi menyembuhkan adiknya Nezuko yang telah berubah menjadi iblis, sambil membalas kematian keluarganya.",
    chapterCount: 205,
    latestChapter: 205,
    lastUpdated: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    views: 6500000,
    rating: 9.3,
  },
  {
    slug: "my-hero-academia",
    title: "My Hero Academia",
    thumbnail: "https://upload.wikimedia.org/wikipedia/en/5/5a/My_Hero_Academia_Volume_1.png",
    author: "Kōhei Horikoshi",
    status: "Completed",
    genre: ["Action", "Superhero", "School"],
    description:
      "Di dunia di mana 80% manusia memiliki kekuatan super, Izuku Midoriya yang lahir tanpa kekuatan bermimpi menjadi pahlawan terbesar.",
    chapterCount: 430,
    latestChapter: 430,
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    views: 5900000,
    rating: 8.9,
  },
  {
    slug: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    thumbnail: "https://upload.wikimedia.org/wikipedia/en/0/0b/Jujutsukaisenvolume1cover.jpg",
    author: "Gege Akutami",
    status: "Ongoing",
    genre: ["Action", "Supernatural", "Dark Fantasy"],
    description:
      "Yuji Itadori menelan jari kutukan paling kuat dan bergabung dengan organisasi rahasia untuk melawan kutukan supernatural.",
    chapterCount: 271,
    latestChapter: 271,
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    views: 5500000,
    rating: 9.1,
  },
  {
    slug: "solo-leveling",
    title: "Solo Leveling",
    thumbnail: "https://upload.wikimedia.org/wikipedia/en/6/65/Solo_Leveling_manhwa_cover.jpg",
    author: "Chugong",
    status: "Completed",
    genre: ["Action", "Fantasy", "RPG"],
    description:
      "Sung Jin-Woo, hunter paling lemah, mendapat kesempatan langka untuk terus naik level sendirian di dunia penuh dungeon berbahaya.",
    chapterCount: 179,
    latestChapter: 179,
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    views: 5200000,
    rating: 9.5,
  },
];

export function getPopularComics(limit = 8) {
  return [...COMICS].sort((a, b) => b.views - a.views).slice(0, limit);
}

export function getLatestUpdated(limit = 8) {
  return [...COMICS]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, limit);
}

export function getComicBySlug(slug: string): Comic | undefined {
  return COMICS.find((c) => c.slug === slug);
}

/** Generate all chapters for a comic (newest first) */
export function generateChapters(comic: Comic) {
  const titles = [
    "Awal Perjalanan", "Musuh Baru", "Kekuatan Tersembunyi", "Pertarungan Sengit",
    "Rahasia Terungkap", "Aliansi Tak Terduga", "Akhir Sebuah Era", "Kebangkitan",
    "Pengorbanan", "Takdir Berubah", "Batas Kekuatan", "Masa Lalu yang Kelam",
    "Harapan Baru", "Pertempuran Terakhir", "Janji yang Ditepati",
  ];
  return Array.from({ length: comic.chapterCount }, (_, i) => {
    const chapterNumber = comic.chapterCount - i;
    return {
      number: chapterNumber,
      title: `Chapter ${chapterNumber}: ${titles[chapterNumber % titles.length]}`,
      date: new Date(
        new Date(comic.lastUpdated).getTime() - i * 7 * 24 * 60 * 60 * 1000
      ).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    };
  });
}

export function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(0)}K`;
  return views.toString();
}

export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  return `${days} hari lalu`;
}
