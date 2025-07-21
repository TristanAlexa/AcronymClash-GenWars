// server/themes.js

export const THEMES = {
  /**
   * Themes for the first 3 general rounds.
   * These are used for all lobby types.
   */
  general: [
    "Politics",
    "PopCulture",
    "Movies",
    "TV Shows",
    "Celebrities,"
    "Video Games",
    "Comics & Superheroes",
  ],

  /**
   * Themes for the final faceoff round.
   * These are specific to the generation of the lobby.
   * The 'All Generations' lobby will pick a theme at random from all faceoff themes.
   */
  faceoff: {
    "Gen Z": [
        "Create a name for an upcoming TikTok Trend",
        "I can't find a job because...",
	"During my EMO phase I...",
        "My fate during WW3",
        "Being a GEN Z is like...",
        "Why do Boomers...",
        "GEN Alpha scares me because...",
    ],
    "Millennials": [
        "My kid just told me...",
        "90's kids are better because...",
        "During my EMO phase I...",
        "My fate during WW3",
        "Being a Millennial is like..."
        "Why does GEN Z...",
    ],
    "Gen X": [
        "My kid just told me...",
        "How I cope with midlife crisis",
        "Back in my day...",
        "Being a GEN X is like..."
        "Why does GEN Z...",
    ],
    "Boomers": [
        "Back in my day...",
        "Being a Boomer is like...",
        "Why does GEN Z...",
    ]
  }
};
