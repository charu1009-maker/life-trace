import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Music2,
  WalletCards,
  MapPin,
  Database,
  ArrowDown,
} from "lucide-react";

import "./DataStory.css";

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function getTop(object, fallback) {
  const entries = Object.entries(object);

  if (!entries.length) {
    return [fallback, 0];
  }

  entries.sort((a, b) => b[1] - a[1]);

  return entries[0];
}

export default function DataStory({ data }) {
  const story = useMemo(() => {
    const music = Array.isArray(data?.music) ? data.music : [];

    const household = Array.isArray(data?.household) ? data.household : [];

    const transactions = Array.isArray(data?.transactions)
      ? data.transactions
      : [];

    const artists = {};
    const categories = {};
    const cities = {};

    let householdValue = 0;
    let transactionValue = 0;

    for (let i = 0; i < music.length; i++) {
      const artist =
        music[i]?.artist_name || music[i]?.artistName || "Unknown Artist";

      artists[artist] = (artists[artist] || 0) + 1;
    }

    for (let i = 0; i < household.length; i++) {
      const category =
        household[i]?.category || household[i]?.Category || "Other";

      categories[category] = (categories[category] || 0) + 1;

      householdValue += safeNumber(
        household[i]?.amount ?? household[i]?.Amount,
      );
    }

    for (let i = 0; i < transactions.length; i++) {
      const category = transactions[i]?.category || "Other";

      const city = transactions[i]?.city || "Unknown City";

      categories[category] = (categories[category] || 0) + 1;

      cities[city] = (cities[city] || 0) + 1;

      transactionValue += safeNumber(transactions[i]?.amt);
    }

    return {
      musicCount: music.length,
      householdCount: household.length,
      transactionCount: transactions.length,

      total: music.length + household.length + transactions.length,

      topArtist: getTop(artists, "Unknown Artist"),

      topCategory: getTop(categories, "Unknown Category"),

      topCity: getTop(cities, "Unknown City"),

      householdValue,
      transactionValue,
    };
  }, [data]);

  const chapters = [
    {
      number: "01",
      eyebrow: "THE DIGITAL ERA",
      title: "It starts with a trace.",
      text: "Thousands of individual records become a larger archive when viewed together. The supplied datasets contain signals from music, household activity and transactions.",
      icon: Database,
      metric: story.total,
      metricLabel: "TOTAL TRACES",
    },
    {
      number: "02",
      eyebrow: "LISTENING MEMORY",
      title: "Some moments return.",
      text: "The listening archive contains repeated records across years. One artist appears more frequently than any other artist in the supplied music history.",
      icon: Music2,
      metric: story.topArtist[1],
      metricLabel: `${story.topArtist[0]} · RECORDS`,
    },
    {
      number: "03",
      eyebrow: "EVERYDAY SIGNALS",
      title: "Ordinary activity leaves patterns.",
      text: "Transaction records turn everyday activity into measurable categories. Repetition becomes visible when thousands of individual entries are viewed together.",
      icon: WalletCards,
      metric: story.topCategory[1],
      metricLabel: `${story.topCategory[0]} · RECORDS`,
    },
    {
      number: "04",
      eyebrow: "PLACES LEAVE TRACES",
      title: "Data has a geography.",
      text: "Location fields reveal where transaction records are concentrated inside the supplied dataset, turning rows into a geographic signal.",
      icon: MapPin,
      metric: story.topCity[1],
      metricLabel: `${story.topCity[0]} · RECORDS`,
    },
  ];

  return (
    <section className="story-section" id="data-story">
      {/* HEADER */}

      <div className="story-header">
        <div className="story-eyebrow">
          <Sparkles size={14} />
          DATA STORY / INTERACTIVE ARCHIVE
        </div>

        <h2>
          A dataset is
          <span> more than numbers.</span>
        </h2>

        <p>
          Scroll through the archive and watch recorded signals transform into a
          visual story.
        </p>
      </div>

      {/* HERO CHARACTER */}

      <div className="story-intro">
        <motion.div
          className="story-character"
          initial={{
            opacity: 0,
            scale: 0.7,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
          }}
        >
          <div className="character-aura" />

          <motion.div
            className="character-orbit"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <motion.div
            className="character"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="character-antenna" />

            <div className="character-head">
              <span />
              <span />
            </div>

            <div className="character-body">
              <div className="character-screen">
                <Database size={18} />
              </div>
            </div>

            <div className="character-leg left" />
            <div className="character-leg right" />
          </motion.div>
        </motion.div>

        <div className="story-intro-copy">
          <span>ARCHIVE ONLINE</span>

          <strong>{story.total.toLocaleString("en-IN")}</strong>

          <p>records waiting to be explored.</p>
        </div>
      </div>

      {/* CHAPTERS */}

      <div className="story-line">
        {chapters.map((chapter, index) => {
          const Icon = chapter.icon;

          return (
            <motion.article
              className="story-chapter"
              key={chapter.number}
              initial={{
                opacity: 0,
                y: 50,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.18,
              }}
              transition={{
                duration: 0.6,
                delay: 0.05,
              }}
            >
              <div className="story-node">
                <span>{chapter.number}</span>
              </div>

              <div className="story-chapter-content">
                <div className="story-chapter-icon">
                  <Icon size={18} />
                </div>

                <div className="story-chapter-label">{chapter.eyebrow}</div>

                <h3>{chapter.title}</h3>

                <p>{chapter.text}</p>

                <div className="story-metric">
                  <strong>{chapter.metric.toLocaleString("en-IN")}</strong>

                  <span>{chapter.metricLabel}</span>
                </div>
              </div>

              {/* MINI CHARACTER */}

              <motion.div
                className="story-character-mini"
                initial={{
                  x: -15,
                  opacity: 0,
                }}
                whileInView={{
                  x: 0,
                  opacity: 1,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.2,
                }}
              >
                <div className="mini-head">
                  <i />
                  <i />
                </div>

                <div className="mini-body">
                  <div />
                </div>

                <div className="mini-leg mini-left" />
                <div className="mini-leg mini-right" />
              </motion.div>
            </motion.article>
          );
        })}
      </div>

      {/* FINALE */}

      <motion.div
        className="story-finale"
        initial={{
          opacity: 0,
          scale: 0.96,
        }}
        whileInView={{
          opacity: 1,
          scale: 1,
        }}
        viewport={{
          once: true,
          amount: 0.3,
        }}
        transition={{
          duration: 0.7,
        }}
      >
        <div className="finale-glow" />

        <div className="finale-icon">
          <Sparkles size={20} />
        </div>

        <span>THE ARCHIVE CONTINUES</span>

        <h3>
          Every record is
          <em> a piece of the trace.</em>
        </h3>

        <p>
          The story ends here. The data does not. Explore the individual records
          and discover the details behind the larger patterns.
        </p>

        <motion.div
          className="story-scroll-hint"
          animate={{
            y: [0, 6, 0],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
          }}
        >
          <ArrowDown size={16} />
          EXPLORE BELOW
        </motion.div>
      </motion.div>

      <div className="story-method">
        OBSERVED DATA PATTERNS · PROVIDED DATASETS · NO CAUSAL INFERENCE
      </div>
    </section>
  );
}
