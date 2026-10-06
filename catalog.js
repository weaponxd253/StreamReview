// Built-in plan catalog. Prices are regular U.S. list prices; each provider records the
// date they were last checked. Introductory offers are noted in details but not priced.
(function (root, factory) {
  const catalog = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = catalog;
  }

  root.StreamReviewCatalog = catalog;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const categories = [
    { id: "gaming", name: "Gaming", shortName: "Gaming", iconClass: "fa-solid fa-gamepad" },
    { id: "streaming", name: "Streaming Video", shortName: "Streaming", iconClass: "fa-solid fa-tv" },
    { id: "music", name: "Music", shortName: "Music", iconClass: "fa-solid fa-music" },
  ];

  const providers = [
    {
      id: "playstation",
      shortName: "PlayStation",
      name: "PlayStation Plus",
      category: "gaming",
      planPrefix: "PlayStation Plus",
      iconClass: "fa-brands fa-playstation",
      theme: { brand: "#07158f", light: "#f3f8ff", border: "#c7d2fe" },
      pricesCheckedOn: "2026-07-20",
      tiers: [
        {
          id: "essential",
          name: "Essential",
          detailTitle: "PlayStation Plus Essential",
          detailIntro: "This is the foundational tier, providing core benefits to enhance your gaming experience:",
          detailItems: [
            ["Online Multiplayer Access", "Play online with friends and other players."],
            ["Monthly Games", "Access to PS4 and PS5 games each month."],
            ["Exclusive Discounts", "Special deals in the PlayStation Store."],
            ["Cloud Storage", "100 GB for your game saves."],
          ],
          plans: [
            { id: "ps-essential-monthly", label: "Monthly", price: 10.99, duration: "Monthly", legacyNames: ["PlayStation Essential - Monthly", "PlayStation Essential - 1 Month"] },
            { id: "ps-essential-3-months", label: "3 Months", price: 27.99, duration: "3 Months" },
            { id: "ps-essential-yearly", label: "Yearly", price: 79.99, duration: "Yearly" },
          ],
        },
        {
          id: "extra",
          name: "Extra",
          detailTitle: "PlayStation Plus Extra",
          detailIntro: "Building upon the Essential tier, the Extra plan offers additional perks:",
          detailItems: [
            ["Game Catalog", "Access the PlayStation Plus Game Catalog."],
            ["Ubisoft+ Classics", "A curated selection of Ubisoft titles."],
          ],
          plans: [
            { id: "ps-extra-monthly", label: "Monthly", price: 16.99, duration: "Monthly", legacyNames: ["PlayStation Extra - Monthly", "PlayStation Extra - 1 Month"] },
            { id: "ps-extra-3-months", label: "3 Months", price: 43.99, duration: "3 Months" },
            { id: "ps-extra-yearly", label: "Yearly", price: 134.99, duration: "Yearly" },
          ],
        },
        {
          id: "premium",
          name: "Premium",
          detailTitle: "PlayStation Plus Premium",
          detailIntro: "Offering all benefits of Essential and Extra tiers, plus exclusive features:",
          detailItems: [
            ["Classics Catalog", "Stream or download games from older PlayStation generations."],
            ["Game Trials", "Try new games before buying."],
            ["Cloud Streaming", "Play on PS4, PS5, or PC."],
          ],
          plans: [
            { id: "ps-premium-monthly", label: "Monthly", price: 19.99, duration: "Monthly", legacyNames: ["PlayStation Premium - Monthly", "PlayStation Premium - 1 Month"] },
            { id: "ps-premium-3-months", label: "3 Months", price: 54.99, duration: "3 Months" },
            { id: "ps-premium-yearly", label: "Yearly", price: 159.99, duration: "Yearly" },
          ],
        },
      ],
    },
    {
      id: "xbox",
      shortName: "Xbox",
      name: "Xbox Game Pass",
      category: "gaming",
      planPrefix: "Xbox",
      iconClass: "fa-brands fa-xbox",
      theme: { brand: "#006b1e", light: "#f2fbf2", border: "#bbf7d0" },
      pricesCheckedOn: "2026-07-20",
      tiers: [
        {
          id: "xbox-essential",
          name: "Game Pass Essential",
          detailTitle: "Xbox Game Pass Essential",
          detailIntro: "Essential covers console, PC, and cloud access with online console multiplayer:",
          detailItems: [
            ["Platform Coverage", "Console, PC, and cloud."],
            ["Online Console Multiplayer", "Included for supported games."],
            ["Intro Offer", "$1 for the first month for eligible accounts; renews at the regular price."],
          ],
          plans: [
            { id: "xbox-essential-monthly", label: "Monthly", price: 9.99, duration: "Monthly", legacyNames: ["Xbox Game Pass Core - Monthly"] },
            { id: "xbox-essential-3-months", label: "3 Months", price: 24.99, duration: "3 Months", legacyNames: ["Xbox Game Pass Core - Yearly"] },
          ],
        },
        {
          id: "xbox-pc",
          name: "Game Pass PC",
          detailTitle: "Xbox Game Pass PC",
          detailIntro: "PC Game Pass focuses on Windows gaming access:",
          detailItems: [
            ["Platform Coverage", "Windows PC."],
            ["Day-One PC Games", "Includes day-one PC games."],
            ["EA Play", "Included with PC Game Pass."],
            ["Intro Offer", "$1 for 14 days for eligible accounts; renews at the regular price."],
          ],
          plans: [
            { id: "xbox-pc-monthly", label: "Monthly", price: 13.99, duration: "Monthly" },
          ],
        },
        {
          id: "xbox-premium",
          name: "Game Pass Premium",
          detailTitle: "Xbox Game Pass Premium",
          detailIntro: "Premium covers console, PC, and cloud at the regular monthly price:",
          detailItems: [
            ["Platform Coverage", "Console, PC, and cloud."],
            ["Game Catalog", "Access the Premium Game Pass library."],
            ["Intro Offer", "$1 for 14 days for eligible accounts; renews at the regular price."],
          ],
          plans: [
            { id: "xbox-premium-monthly", label: "Monthly", price: 14.99, duration: "Monthly", legacyNames: ["Xbox Game Pass Standard - Monthly"] },
          ],
        },
        {
          id: "xbox-ultimate",
          name: "Game Pass Ultimate",
          detailTitle: "Xbox Game Pass Ultimate",
          detailIntro: "Ultimate is the largest Xbox Game Pass benefit package:",
          detailItems: [
            ["Platform Coverage", "Console, PC, and cloud."],
            ["Day-One Releases", "Includes day-one releases."],
            ["Included Benefits", "Cloud gaming, EA Play, Fortnite Crew, and Ubisoft+ Classics."],
            ["Intro Offer", "No general introductory offer shown."],
          ],
          plans: [
            { id: "xbox-ultimate-monthly", label: "Monthly", price: 22.99, duration: "Monthly" },
          ],
        },
      ],
    },
    {
      id: "nintendo",
      shortName: "Nintendo",
      name: "Nintendo Switch Online",
      category: "gaming",
      planPrefix: "Nintendo Switch Online",
      iconClass: "fa-solid fa-gamepad",
      theme: { brand: "#9c0000", light: "#fff6f7", border: "#fecaca" },
      pricesCheckedOn: "2026-07-20",
      tiers: [
        {
          id: "nintendo-switch-online",
          name: "Standard Individual",
          detailTitle: "Nintendo Switch Online Standard Individual",
          detailIntro: "The standard individual membership covers core Nintendo Switch Online features:",
          detailItems: [
            ["Online Play", "Play compatible Nintendo Switch games online."],
            ["Classic Games", "Access selected classic game libraries."],
            ["Cloud Saves", "Back up supported save data online."],
            ["Trial", "Nintendo offers a seven-day trial of the standard individual membership."],
          ],
          plans: [
            { id: "nintendo-switch-monthly", label: "Monthly", price: 3.99, duration: "Monthly", legacyNames: ["Nintendo Switch Online - Monthly", "Nintendo Switch Online - 1 Month"] },
            { id: "nintendo-switch-3-months", label: "3 Months", price: 7.99, duration: "3 Months" },
            { id: "nintendo-switch-yearly", label: "Yearly", price: 19.99, duration: "Yearly" },
          ],
        },
        {
          id: "nintendo-family",
          name: "Standard Family",
          detailTitle: "Nintendo Switch Online Standard Family",
          detailIntro: "Family Membership extends Nintendo Switch Online access across multiple accounts:",
          detailItems: [
            ["Shared Access", "Supports up to 8 Nintendo Accounts."],
            ["Online Play", "Online multiplayer for supported games."],
            ["Classic Games and Cloud Saves", "Includes core Switch Online benefits."],
          ],
          plans: [
            { id: "nintendo-family-yearly", label: "Yearly", price: 34.99, duration: "Yearly", legacyNames: ["Nintendo Family Membership - Monthly"] },
          ],
        },
        {
          id: "nintendo-expansion-individual",
          name: "Expansion Pack Individual",
          detailTitle: "Nintendo Switch Online + Expansion Pack Individual",
          detailIntro: "Expansion Pack is offered as a 12-month membership with expanded benefits:",
          detailItems: [
            ["Expanded Classics", "Adds Nintendo 64, Game Boy Advance, Sega Genesis, and other expanded benefits."],
            ["Availability", "Offered as a 12-month membership."],
          ],
          plans: [
            { id: "nintendo-expansion-yearly", label: "Yearly", price: 49.99, duration: "Yearly", legacyNames: ["Nintendo Expansion Pack - Yearly"] },
          ],
        },
        {
          id: "nintendo-expansion-family",
          name: "Expansion Pack Family",
          detailTitle: "Nintendo Switch Online + Expansion Pack Family",
          detailIntro: "Expansion Pack Family covers up to eight Nintendo Accounts with expanded benefits:",
          detailItems: [
            ["Family Coverage", "Covers up to eight Nintendo Accounts."],
            ["Expanded Classics", "Adds Nintendo 64, Game Boy Advance, Sega Genesis, and other expanded benefits."],
          ],
          plans: [
            { id: "nintendo-expansion-family-yearly", label: "Yearly", price: 79.99, duration: "Yearly", legacyNames: ["Nintendo Expansion Pack - Yearly (Up to 8 accounts)"] },
          ],
        },
      ],
    },
    {
      id: "netflix",
      name: "Netflix",
      shortName: "Netflix",
      category: "streaming",
      planPrefix: "Netflix",
      iconClass: "fa-solid fa-film",
      theme: { brand: "#b20710", light: "#fff5f5", border: "#fecaca" },
      pricesCheckedOn: "2026-10-06",
      tiers: [
        {
          id: "netflix-standard-ads",
          name: "Standard with Ads",
          detailTitle: "Netflix Standard with Ads",
        summary: "With ads · Full HD",
          detailIntro: "The lowest-priced Netflix plan, supported by ads:",
          detailItems: [
            ["Ads", "Includes ads on most titles."],
            ["Price Change", "Raised from $7.99 on March 26, 2026."],
          ],
          plans: [
            { id: "netflix-standard-ads-monthly", label: "Monthly", price: 8.99, duration: "Monthly" },
          ],
        },
        {
          id: "netflix-standard",
          name: "Standard",
          detailTitle: "Netflix Standard",
        summary: "Ad-free · Full HD · 2 screens",
          detailIntro: "Ad-free Netflix in Full HD:",
          detailItems: [
            ["Ad-Free", "No ads."],
            ["Extra Members", "Can add a member outside your household for $9.99/month."],
            ["Price Change", "Raised from $17.99 on March 26, 2026."],
          ],
          plans: [
            { id: "netflix-standard-monthly", label: "Monthly", price: 19.99, duration: "Monthly" },
          ],
        },
        {
          id: "netflix-premium",
          name: "Premium",
          detailTitle: "Netflix Premium",
        summary: "Ad-free · 4K Ultra HD · 4 screens",
          detailIntro: "Netflix's top plan with the highest picture quality:",
          detailItems: [
            ["Ad-Free", "No ads."],
            ["Ultra HD", "Supports 4K and HDR on more screens at once."],
            ["Price Change", "Raised from $24.99 on March 26, 2026."],
          ],
          plans: [
            { id: "netflix-premium-monthly", label: "Monthly", price: 26.99, duration: "Monthly" },
          ],
        },
      ],
    },
    {
      id: "disney",
      name: "Disney+",
      shortName: "Disney+",
      category: "streaming",
      planPrefix: "Disney+",
      iconClass: "fa-solid fa-wand-magic-sparkles",
      theme: { brand: "#0b3d91", light: "#f2f6ff", border: "#c7d7fe" },
      pricesCheckedOn: "2026-10-06",
      tiers: [
        {
          id: "disney-ads",
          name: "Disney+ with Ads",
          detailTitle: "Disney+ with Ads",
        summary: "With ads · Disney, Pixar, Marvel, Star Wars",
          detailIntro: "Disney, Pixar, Marvel, Star Wars and National Geographic, with ads:",
          detailItems: [
            ["Ads", "Includes ads."],
            ["Price Change", "Raised from $11.99 for new subscribers on September 23, 2026."],
          ],
          plans: [
            { id: "disney-ads-monthly", label: "Monthly", price: 12.49, duration: "Monthly" },
          ],
        },
        {
          id: "disney-premium",
          name: "Disney+ Premium",
          detailTitle: "Disney+ Premium",
        summary: "Ad-free · Downloads · Yearly billing available",
          detailIntro: "Ad-free Disney+:",
          detailItems: [
            ["Ad-Free", "No ads."],
            ["Annual Option", "Yearly billing costs less than 12 monthly payments."],
            ["Price Change", "Raised from $18.99 for new subscribers on September 23, 2026."],
          ],
          plans: [
            { id: "disney-premium-monthly", label: "Monthly", price: 21.49, duration: "Monthly" },
            { id: "disney-premium-yearly", label: "Yearly", price: 214.99, duration: "Yearly" },
          ],
        },
        {
          id: "disney-hulu-bundle-ads",
          name: "Disney+ & Hulu Bundle with Ads",
          detailTitle: "Disney+, Hulu Bundle with Ads",
        summary: "Disney+ and Hulu together, with ads",
          detailIntro: "Disney+ and Hulu together, with ads:",
          detailItems: [
            ["Includes Hulu", "Remove a separate Hulu plan if you choose this bundle."],
            ["Price", "Unchanged in the September 2026 increase."],
          ],
          plans: [
            { id: "disney-hulu-bundle-ads-monthly", label: "Monthly", price: 12.99, duration: "Monthly" },
          ],
        },
        {
          id: "disney-hulu-bundle-premium",
          name: "Disney+ & Hulu Premium Bundle",
          detailTitle: "Disney+, Hulu Premium Bundle",
        summary: "Disney+ and Hulu together, ad-free",
          detailIntro: "Disney+ and Hulu together, without ads:",
          detailItems: [
            ["Includes Hulu", "Remove a separate Hulu plan if you choose this bundle."],
            ["Ad-Free", "No ads on either service."],
            ["Price Change", "Raised from $19.99 for new subscribers on September 23, 2026."],
          ],
          plans: [
            { id: "disney-hulu-bundle-premium-monthly", label: "Monthly", price: 21.99, duration: "Monthly" },
          ],
        },
      ],
    },
    {
      id: "hulu",
      name: "Hulu",
      shortName: "Hulu",
      category: "streaming",
      planPrefix: "Hulu",
      iconClass: "fa-solid fa-tv",
      theme: { brand: "#0b7a3e", light: "#f0fdf5", border: "#bbf7d0" },
      pricesCheckedOn: "2026-10-06",
      tiers: [
        {
          id: "hulu-ads",
          name: "Hulu with Ads",
          detailTitle: "Hulu with Ads",
        summary: "With ads · Full Hulu library",
          detailIntro: "Hulu's on-demand library, with ads:",
          detailItems: [
            ["Ads", "Includes ads."],
            ["Bundle Option", "The Disney+ & Hulu bundle with ads costs only $0.50 more."],
            ["Price Change", "Raised from $11.99 for new subscribers on September 23, 2026."],
          ],
          plans: [
            { id: "hulu-ads-monthly", label: "Monthly", price: 12.49, duration: "Monthly" },
          ],
        },
        {
          id: "hulu-premium",
          name: "Hulu Premium",
          detailTitle: "Hulu Premium",
        summary: "Ad-free · Downloads",
          detailIntro: "Hulu without ads:",
          detailItems: [
            ["Ad-Free", "No ads."],
            ["Price Change", "Raised from $18.99 for new subscribers on September 23, 2026."],
          ],
          plans: [
            { id: "hulu-premium-monthly", label: "Monthly", price: 21.49, duration: "Monthly" },
          ],
        },
      ],
    },
    {
      id: "hbo-max",
      name: "HBO Max",
      shortName: "HBO Max",
      category: "streaming",
      planPrefix: "HBO Max",
      iconClass: "fa-solid fa-clapperboard",
      theme: { brand: "#4b1fb0", light: "#f6f3ff", border: "#ddd6fe" },
      pricesCheckedOn: "2026-10-06",
      tiers: [
        {
          id: "hbo-max-basic",
          name: "Basic with Ads",
          detailTitle: "HBO Max Basic with Ads",
        summary: "With ads · Full HD · No downloads",
          detailIntro: "The lowest-priced HBO Max plan:",
          detailItems: [
            ["Ads", "Includes ads."],
            ["Full HD", "Streams up to 1080p, with no offline downloads."],
          ],
          plans: [
            { id: "hbo-max-basic-monthly", label: "Monthly", price: 10.99, duration: "Monthly" },
            { id: "hbo-max-basic-yearly", label: "Yearly", price: 109.99, duration: "Yearly" },
          ],
        },
        {
          id: "hbo-max-standard",
          name: "Standard",
          detailTitle: "HBO Max Standard",
        summary: "Ad-free · Full HD · 30 downloads",
          detailIntro: "Ad-free HBO Max in Full HD:",
          detailItems: [
            ["Ad-Free", "No ads."],
            ["Downloads", "Up to 30 offline downloads."],
            ["Price Change", "Raised on October 21, 2025."],
          ],
          plans: [
            { id: "hbo-max-standard-monthly", label: "Monthly", price: 18.49, duration: "Monthly" },
            { id: "hbo-max-standard-yearly", label: "Yearly", price: 184.99, duration: "Yearly" },
          ],
        },
        {
          id: "hbo-max-premium",
          name: "Premium",
          detailTitle: "HBO Max Premium",
        summary: "Ad-free · 4K and Dolby Atmos · 4 screens",
          detailIntro: "HBO Max's top plan:",
          detailItems: [
            ["4K and Dolby Atmos", "The only HBO Max plan with 4K UHD."],
            ["More Screens", "Four streams at once and up to 100 downloads."],
            ["Price Change", "Raised on October 21, 2025."],
          ],
          plans: [
            { id: "hbo-max-premium-monthly", label: "Monthly", price: 22.99, duration: "Monthly" },
            { id: "hbo-max-premium-yearly", label: "Yearly", price: 229.99, duration: "Yearly" },
          ],
        },
      ],
    },
    {
      id: "peacock",
      name: "Peacock",
      shortName: "Peacock",
      category: "streaming",
      planPrefix: "Peacock",
      iconClass: "fa-solid fa-feather",
      theme: { brand: "#1f2937", light: "#f5f7fa", border: "#d9dee7" },
      pricesCheckedOn: "2026-10-06",
      tiers: [
        {
          id: "peacock-select",
          name: "Select",
          detailTitle: "Peacock Select",
        summary: "With ads · Selected on-demand library",
          detailIntro: "Peacock's entry plan with its on-demand library:",
          detailItems: [
            ["On-Demand Library", "Selected shows and movies, with ads."],
            ["Price Change", "Raised in August 2026."],
          ],
          plans: [
            { id: "peacock-select-monthly", label: "Monthly", price: 8.99, duration: "Monthly" },
            { id: "peacock-select-yearly", label: "Yearly", price: 89.99, duration: "Yearly" },
          ],
        },
        {
          id: "peacock-premium",
          name: "Premium",
          detailTitle: "Peacock Premium",
        summary: "With ads · Full library and live sports",
          detailIntro: "Peacock's full library and live sports, with ads:",
          detailItems: [
            ["Live Sports", "Includes Peacock's live sports and events."],
            ["Ads", "Includes ads."],
            ["Price Change", "Raised in August 2026."],
          ],
          plans: [
            { id: "peacock-premium-monthly", label: "Monthly", price: 12.99, duration: "Monthly" },
            { id: "peacock-premium-yearly", label: "Yearly", price: 129.99, duration: "Yearly" },
          ],
        },
        {
          id: "peacock-premium-plus",
          name: "Premium Plus",
          detailTitle: "Peacock Premium Plus",
        summary: "Mostly ad-free · Downloads · Live sports",
          detailIntro: "Peacock's top plan:",
          detailItems: [
            ["Mostly Ad-Free", "Removes ads from most on-demand titles."],
            ["Downloads", "Download select titles to watch offline."],
            ["Price Change", "Raised in August 2026."],
          ],
          plans: [
            { id: "peacock-premium-plus-monthly", label: "Monthly", price: 19.99, duration: "Monthly" },
            { id: "peacock-premium-plus-yearly", label: "Yearly", price: 199.99, duration: "Yearly" },
          ],
        },
      ],
    },
    {
      id: "paramount",
      name: "Paramount+",
      shortName: "Paramount+",
      category: "streaming",
      planPrefix: "Paramount+",
      iconClass: "fa-solid fa-mountain-sun",
      theme: { brand: "#0047c4", light: "#f2f6ff", border: "#c7d7fe" },
      pricesCheckedOn: "2026-10-06",
      tiers: [
        {
          id: "paramount-essential",
          name: "Essential",
          detailTitle: "Paramount+ Essential",
        summary: "With ads · On-demand library",
          detailIntro: "Paramount+'s ad-supported plan:",
          detailItems: [
            ["Ads", "Includes ads."],
            ["Price Change", "Raised from $7.99 on January 15, 2026."],
          ],
          plans: [
            { id: "paramount-essential-monthly", label: "Monthly", price: 8.99, duration: "Monthly" },
            { id: "paramount-essential-yearly", label: "Yearly", price: 89.99, duration: "Yearly" },
          ],
        },
        {
          id: "paramount-premium",
          name: "Premium",
          detailTitle: "Paramount+ Premium",
        summary: "Mostly ad-free · Includes Showtime",
          detailIntro: "Paramount+ without ads, including Showtime:",
          detailItems: [
            ["Ad-Free", "No ads on most titles."],
            ["Showtime", "Includes Showtime content."],
            ["Price Change", "Raised from $12.99 on January 15, 2026."],
          ],
          plans: [
            { id: "paramount-premium-monthly", label: "Monthly", price: 13.99, duration: "Monthly" },
            { id: "paramount-premium-yearly", label: "Yearly", price: 139.99, duration: "Yearly" },
          ],
        },
      ],
    },
    {
      id: "apple-tv",
      name: "Apple TV",
      shortName: "Apple TV",
      category: "streaming",
      planPrefix: "Apple TV",
      iconClass: "fa-brands fa-apple",
      theme: { brand: "#1d1d1f", light: "#f5f5f7", border: "#d9dee7" },
      pricesCheckedOn: "2026-10-06",
      tiers: [
        {
          id: "apple-tv",
          name: "Apple TV",
          detailTitle: "Apple TV",
        summary: "Ad-free Apple Originals · MLB and F1",
          detailIntro: "Apple's streaming service, formerly Apple TV+:",
          detailItems: [
            ["Apple Originals", "Apple's original series and films, ad-free."],
            ["Sports", "Includes Friday Night Baseball and, in the US from 2026, Formula 1."],
            ["Price Change", "Raised from $12.99 and $99 per year on August 28, 2026."],
          ],
          plans: [
            { id: "apple-tv-monthly", label: "Monthly", price: 14.99, duration: "Monthly" },
            { id: "apple-tv-yearly", label: "Yearly", price: 119, duration: "Yearly" },
          ],
        },
      ],
    },
    {
      id: "prime-video",
      name: "Prime Video",
      shortName: "Prime Video",
      category: "streaming",
      planPrefix: "Prime Video",
      iconClass: "fa-brands fa-amazon",
      theme: { brand: "#0b5e8f", light: "#f0f8fd", border: "#bae6fd" },
      pricesCheckedOn: "2026-10-06",
      tiers: [
        {
          id: "prime-video-standalone",
          name: "Prime Video",
          detailTitle: "Prime Video (standalone)",
        summary: "With ads · No Amazon Prime membership needed",
          detailIntro: "Prime Video without a full Amazon Prime membership, with ads:",
          detailItems: [
            ["Ads", "Includes ads."],
            ["Prime Members", "Prime Video is also included with an Amazon Prime membership."],
          ],
          plans: [
            { id: "prime-video-monthly", label: "Monthly", price: 8.99, duration: "Monthly" },
          ],
        },
        {
          id: "prime-video-ultra",
          name: "Prime Video with Ultra",
          detailTitle: "Prime Video with Ultra",
        summary: "Ad-free · 4K and Dolby Atmos · 5 screens",
          detailIntro: "Standalone Prime Video plus the Ultra add-on ($8.99 + $4.99):",
          detailItems: [
            ["Ad-Free", "Ultra removes ads."],
            ["4K and Dolby Atmos", "Adds 4K UHD, Dolby Atmos, five streams and up to 100 downloads."],
            ["Price Change", "Ultra replaced the $2.99 ad-free add-on on April 10, 2026."],
          ],
          plans: [
            { id: "prime-video-ultra-monthly", label: "Monthly", price: 13.98, duration: "Monthly" },
          ],
        },
      ],
    },
    {
      id: "spotify",
      name: "Spotify",
      shortName: "Spotify",
      category: "music",
      planPrefix: "Spotify",
      iconClass: "fa-brands fa-spotify",
      theme: { brand: "#11712f", light: "#f0fdf4", border: "#bbf7d0" },
      pricesCheckedOn: "2026-10-06",
      tiers: [
        {
          id: "spotify-individual",
          name: "Premium Individual",
          detailTitle: "Spotify Premium Individual",
          summary: "Ad-free · Offline listening · 1 account",
          detailIntro: "Spotify Premium for one person:",
          detailItems: [
            ["Ad-Free", "Ad-free listening with offline downloads."],
            ["Price Change", "Raised from $11.99 in February 2026 billing."],
          ],
          plans: [
            { id: "spotify-individual-monthly", label: "Monthly", price: 12.99, duration: "Monthly" },
          ],
        },
        {
          id: "spotify-duo",
          name: "Premium Duo",
          detailTitle: "Spotify Premium Duo",
          summary: "2 Premium accounts under one roof",
          detailIntro: "Two Premium accounts for people who live together:",
          detailItems: [
            ["Two Accounts", "Each person keeps their own account and recommendations."],
            ["Price Change", "Raised from $16.99 in February 2026 billing."],
          ],
          plans: [
            { id: "spotify-duo-monthly", label: "Monthly", price: 18.99, duration: "Monthly" },
          ],
        },
        {
          id: "spotify-family",
          name: "Premium Family",
          detailTitle: "Spotify Premium Family",
          summary: "Up to 6 Premium accounts under one roof",
          detailIntro: "Up to six Premium accounts for a household:",
          detailItems: [
            ["Six Accounts", "Up to six accounts for family members living together."],
            ["Price Change", "Raised from $19.99 in February 2026 billing."],
          ],
          plans: [
            { id: "spotify-family-monthly", label: "Monthly", price: 21.99, duration: "Monthly" },
          ],
        },
        {
          id: "spotify-student",
          name: "Premium Student",
          detailTitle: "Spotify Premium Student",
          summary: "Discounted Premium for verified students · Includes Hulu with Ads",
          detailIntro: "Discounted Premium for eligible college students:",
          detailItems: [
            ["Student Verification", "Requires enrollment at an accredited college or university."],
            ["Hulu with Ads", "Included at no extra cost for eligible students."],
            ["Price Change", "Raised from $5.99 in February 2026 billing."],
          ],
          plans: [
            { id: "spotify-student-monthly", label: "Monthly", price: 6.99, duration: "Monthly" },
          ],
        },
      ],
    },
    {
      id: "apple-music",
      name: "Apple Music",
      shortName: "Apple Music",
      category: "music",
      planPrefix: "Apple Music",
      iconClass: "fa-brands fa-apple",
      theme: { brand: "#b3123c", light: "#fff1f4", border: "#fecdd3" },
      pricesCheckedOn: "2026-10-06",
      tiers: [
        {
          id: "apple-music-individual",
          name: "Individual",
          detailTitle: "Apple Music Individual",
          summary: "Ad-free · Lossless and Dolby Atmos",
          detailIntro: "Apple Music for one person:",
          detailItems: [
            ["Lossless and Spatial Audio", "Includes lossless audio and Dolby Atmos."],
            ["Price Change", "Raised from $10.99 on July 17, 2026."],
          ],
          plans: [
            { id: "apple-music-individual-monthly", label: "Monthly", price: 11.99, duration: "Monthly" },
          ],
        },
        {
          id: "apple-music-family",
          name: "Family",
          detailTitle: "Apple Music Family",
          summary: "Up to 6 people with Family Sharing",
          detailIntro: "Apple Music for up to six people:",
          detailItems: [
            ["Family Sharing", "Each member gets their own library and recommendations."],
            ["Price Change", "Raised from $16.99 on July 17, 2026."],
          ],
          plans: [
            { id: "apple-music-family-monthly", label: "Monthly", price: 19.99, duration: "Monthly" },
          ],
        },
        {
          id: "apple-music-student",
          name: "Student",
          detailTitle: "Apple Music Student",
          summary: "Discounted Apple Music for verified students",
          detailIntro: "Discounted Apple Music for eligible college students:",
          detailItems: [
            ["Student Verification", "Requires enrollment at an eligible college or university."],
            ["Price Change", "Raised from $5.99 on July 17, 2026."],
          ],
          plans: [
            { id: "apple-music-student-monthly", label: "Monthly", price: 6.99, duration: "Monthly" },
          ],
        },
      ],
    },
    {
      id: "youtube-premium",
      name: "YouTube Premium",
      shortName: "YouTube",
      category: "music",
      planPrefix: "YouTube",
      iconClass: "fa-brands fa-youtube",
      theme: { brand: "#a50f0f", light: "#fff4f4", border: "#fecaca" },
      pricesCheckedOn: "2026-10-06",
      tiers: [
        {
          id: "youtube-music-premium",
          name: "YouTube Music Premium",
          detailTitle: "YouTube Music Premium",
          summary: "Ad-free music only · Background play",
          detailIntro: "Ad-free YouTube Music without the rest of YouTube Premium:",
          detailItems: [
            ["Music Only", "Ad-free, background and offline listening in YouTube Music."],
            ["Price Change", "Raised from $10.99 on April 10, 2026."],
          ],
          plans: [
            { id: "youtube-music-premium-monthly", label: "Monthly", price: 11.99, duration: "Monthly" },
          ],
        },
        {
          id: "youtube-premium-individual",
          name: "Premium Individual",
          detailTitle: "YouTube Premium Individual",
          summary: "Ad-free YouTube and YouTube Music",
          detailIntro: "Ad-free YouTube with YouTube Music Premium included:",
          detailItems: [
            ["Includes YouTube Music", "YouTube Music Premium is included."],
            ["Ad-Free Video", "Ad-free videos, background play and downloads."],
            ["Price Change", "Raised from $13.99 on April 10, 2026."],
          ],
          plans: [
            { id: "youtube-premium-individual-monthly", label: "Monthly", price: 15.99, duration: "Monthly" },
          ],
        },
        {
          id: "youtube-premium-family",
          name: "Premium Family",
          detailTitle: "YouTube Premium Family",
          summary: "YouTube Premium for up to 5 household members",
          detailIntro: "YouTube Premium for a household:",
          detailItems: [
            ["Household Members", "Share with up to five members of your household."],
            ["Price Change", "Raised from $22.99 on April 10, 2026."],
          ],
          plans: [
            { id: "youtube-premium-family-monthly", label: "Monthly", price: 26.99, duration: "Monthly" },
          ],
        },
      ],
    },
    {
      id: "amazon-music",
      name: "Amazon Music Unlimited",
      shortName: "Amazon Music",
      category: "music",
      planPrefix: "Amazon Music Unlimited",
      iconClass: "fa-brands fa-amazon",
      theme: { brand: "#0b5c80", light: "#eff8fc", border: "#bae6fd" },
      pricesCheckedOn: "2026-10-06",
      tiers: [
        {
          id: "amazon-music-prime",
          name: "Individual (Prime members)",
          detailTitle: "Amazon Music Unlimited Individual (Prime)",
          summary: "Discounted for Amazon Prime members",
          detailIntro: "Amazon Music Unlimited for Amazon Prime members:",
          detailItems: [
            ["Prime Required", "This price requires an Amazon Prime membership."],
            ["Price Change", "Raised from $10.99 in March 2026."],
          ],
          plans: [
            { id: "amazon-music-prime-monthly", label: "Monthly", price: 11.99, duration: "Monthly" },
            { id: "amazon-music-prime-yearly", label: "Yearly", price: 119, duration: "Yearly" },
          ],
        },
        {
          id: "amazon-music-individual",
          name: "Individual",
          detailTitle: "Amazon Music Unlimited Individual",
          summary: "No Amazon Prime membership needed",
          detailIntro: "Amazon Music Unlimited without a Prime membership:",
          detailItems: [
            ["No Prime Needed", "Available without an Amazon Prime membership."],
            ["Price Change", "Raised from $11.99 in March 2026."],
          ],
          plans: [
            { id: "amazon-music-individual-monthly", label: "Monthly", price: 12.99, duration: "Monthly" },
          ],
        },
        {
          id: "amazon-music-family",
          name: "Family",
          detailTitle: "Amazon Music Unlimited Family",
          summary: "Up to 6 accounts streaming at once",
          detailIntro: "Amazon Music Unlimited for up to six people:",
          detailItems: [
            ["Six Accounts", "Up to six accounts can stream at the same time."],
            ["Price Change", "Raised from $19.99 and $199 per year in March 2026."],
          ],
          plans: [
            { id: "amazon-music-family-monthly", label: "Monthly", price: 21.99, duration: "Monthly" },
            { id: "amazon-music-family-yearly", label: "Yearly", price: 219, duration: "Yearly" },
          ],
        },
      ],
    },
    {
      id: "tidal",
      name: "Tidal",
      shortName: "Tidal",
      category: "music",
      planPrefix: "Tidal",
      iconClass: "fa-solid fa-wave-square",
      theme: { brand: "#111827", light: "#f5f7fa", border: "#d9dee7" },
      pricesCheckedOn: "2026-10-06",
      tiers: [
        {
          id: "tidal-individual",
          name: "Individual",
          detailTitle: "Tidal Individual",
          summary: "Ad-free · Lossless, hi-res FLAC and Dolby Atmos",
          detailIntro: "Tidal for one person:",
          detailItems: [
            ["Hi-Res Audio", "Lossless, hi-res FLAC and Dolby Atmos."],
            ["Price Change", "Raised from $10.99 from August 3, 2026 billing."],
          ],
          plans: [
            { id: "tidal-individual-monthly", label: "Monthly", price: 11.99, duration: "Monthly" },
          ],
        },
        {
          id: "tidal-family",
          name: "Family",
          detailTitle: "Tidal Family",
          summary: "Up to 6 accounts · Hi-res audio",
          detailIntro: "Tidal for a household:",
          detailItems: [
            ["Six Accounts", "Up to six accounts on one plan."],
            ["Price Change", "Raised from $16.99 from August 3, 2026 billing."],
          ],
          plans: [
            { id: "tidal-family-monthly", label: "Monthly", price: 19.99, duration: "Monthly" },
          ],
        },
        {
          id: "tidal-student",
          name: "Student",
          detailTitle: "Tidal Student",
          summary: "Discounted Tidal for verified students",
          detailIntro: "Discounted Tidal for eligible students:",
          detailItems: [
            ["Student Verification", "Requires enrollment at an eligible college or university."],
            ["Price Change", "Raised from $5.49 from August 3, 2026 billing."],
          ],
          plans: [
            { id: "tidal-student-monthly", label: "Monthly", price: 6.99, duration: "Monthly" },
          ],
        },
      ],
    },
  ];

  return { categories, providers };
});
