import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Music2,
  ShoppingBag,
  CreditCard,
  Sparkles,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import "./LifeUniverse.css";

const DATASETS = [
  {
    id: "music",
    label: "MUSIC",
    icon: Music2,
    color: "#b98cff",
  },
  {
    id: "household",
    label: "HOUSEHOLD",
    icon: ShoppingBag,
    color: "#62e6c8",
  },
  {
    id: "transactions",
    label: "TRANSACTIONS",
    icon: CreditCard,
    color: "#ff9d66",
  },
];

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(value || 0);
}

function formatAmount(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

export default function LifeUniverse({ data, loading }) {
  const [active, setActive] = useState("all");

  /*
    ---------------------------------------------------------
    BASIC DATA STATS
    ---------------------------------------------------------
  */

  const stats = useMemo(() => {
    return DATASETS.map((dataset) => ({
      ...dataset,
      count: data?.[dataset.id]?.length || 0,
    }));
  }, [data]);

  const totalRecords =
    (data?.music?.length || 0) +
    (data?.household?.length || 0) +
    (data?.transactions?.length || 0);

  /*
    ---------------------------------------------------------
    VISIBLE DATA NODES
    ---------------------------------------------------------
  */

  const visibleNodes = useMemo(() => {
    if (active === "all") {
      return stats;
    }

    return stats.filter((item) => item.id === active);
  }, [active, stats]);

  /*
    ---------------------------------------------------------
    MUSIC ANALYTICS
    ---------------------------------------------------------
  */

  const musicStats = useMemo(() => {
    const music = data?.music || [];

    if (!music.length) {
      return {
        listeningHours: 0,
        skipped: 0,
        topArtist: "—",
        topTrack: "—",
        topPlatform: "—",
      };
    }

    const artistCounts = {};
    const trackCounts = {};
    const platformCounts = {};

    let milliseconds = 0;
    let skipped = 0;

    for (const item of music) {
      /*
        Spotify JSON uses camelCase field names
        from our processed dataset.
      */

      milliseconds += Number(item.msPlayed || 0);

      if (
        item.skipped === true ||
        item.skipped === "true" ||
        item.skipped === 1
      ) {
        skipped++;
      }

      if (item.artistName) {
        artistCounts[item.artistName] =
          (artistCounts[item.artistName] || 0) + 1;
      }

      if (item.trackName) {
        trackCounts[item.trackName] = (trackCounts[item.trackName] || 0) + 1;
      }

      if (item.platform) {
        platformCounts[item.platform] =
          (platformCounts[item.platform] || 0) + 1;
      }
    }

    const topArtist =
      Object.entries(artistCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    const topTrack =
      Object.entries(trackCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    const topPlatform =
      Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    return {
      listeningHours: Math.round(milliseconds / 3600000),
      skipped,
      topArtist,
      topTrack,
      topPlatform,
    };
  }, [data?.music]);

  /*
    ---------------------------------------------------------
    HOUSEHOLD + TRANSACTION ANALYTICS
    ---------------------------------------------------------
  */

  const spendingStats = useMemo(() => {
    const household = data?.household || [];
    const transactions = data?.transactions || [];

    const householdAmount = household.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

    const transactionAmount = transactions.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

    const categoryTotals = {};

    for (const item of transactions) {
      const category = item.category || "Other";
      const amount = Number(item.amount || 0);

      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    }

    const topTransactionCategory =
      Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    return {
      householdAmount,
      transactionAmount,
      topTransactionCategory,
    };
  }, [data?.household, data?.transactions]);

  /*
    ---------------------------------------------------------
    DATASET STATUS
    ---------------------------------------------------------
  */

  const datasetStatus = useMemo(() => {
    return stats.map((item) => ({
      ...item,
      percentage:
        totalRecords > 0 ? Math.round((item.count / totalRecords) * 100) : 0,
    }));
  }, [stats, totalRecords]);

  /*
    ---------------------------------------------------------
    UI
    ---------------------------------------------------------
  */

  return (
    <section className="life-universe">
      {/* ================= HEADER ================= */}

      <div className="universe-header">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            LIVE DATA UNIVERSE
          </div>

          <h2>
            Every record
            <br />
            <span>leaves a trace.</span>
          </h2>

          <p>
            Three real datasets. Thousands of moments. Explore the patterns
            hiding underneath the digital trail.
          </p>
        </div>

        <motion.div
          className="record-counter"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span>RECEIPTS INDEXED</span>

          <strong>{loading ? "..." : formatNumber(totalRecords)}</strong>

          {!loading && <small>REAL DATA</small>}
        </motion.div>
      </div>

      {/* ================= FILTERS ================= */}

      <div className="universe-filter">
        <button
          className={active === "all" ? "active" : ""}
          onClick={() => setActive("all")}
        >
          ALL
        </button>

        {DATASETS.map((dataset) => {
          const Icon = dataset.icon;

          return (
            <button
              key={dataset.id}
              className={active === dataset.id ? "active" : ""}
              onClick={() => setActive(dataset.id)}
            >
              <Icon size={15} />
              {dataset.label}
            </button>
          );
        })}
      </div>

      {/* ================= CONSTELLATION ================= */}

      <div className="constellation-wrap">
        <div className="constellation-grid" />

        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="orbit orbit-three" />

        {/* CORE */}

        <motion.div
          className="core-node"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            type: "spring",
          }}
        >
          <div className="core-glow" />

          <Sparkles size={23} />

          <span>YOUR</span>

          <strong>TRACE</strong>
        </motion.div>

        {/* DATA NODES */}

        {visibleNodes.map((node, index) => {
          const Icon = node.icon;

          const positions = [
            {
              top: "17%",
              left: "18%",
            },
            {
              top: "66%",
              left: "20%",
            },
            {
              top: "27%",
              left: "75%",
            },
          ];

          const position = positions[index % positions.length];

          return (
            <motion.div
              key={node.id}
              className="data-node"
              style={{
                top: position.top,
                left: position.left,
                "--node-color": node.color,
              }}
              initial={{
                opacity: 0,
                scale: 0.4,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: index * 0.15,
                duration: 0.6,
              }}
              whileHover={{
                scale: 1.08,
              }}
            >
              <div className="node-ring">
                <Icon size={21} />
              </div>

              <div className="node-info">
                <span>{node.label}</span>

                <strong>{loading ? "..." : formatNumber(node.count)}</strong>

                <small>records</small>
              </div>
            </motion.div>
          );
        })}

        {/* CONNECTION LINES */}

        <div className="connection connection-a" />
        <div className="connection connection-b" />
        <div className="connection connection-c" />

        {/* FLOATING PARTICLES */}

        <div className="floating-pulse pulse-one" />
        <div className="floating-pulse pulse-two" />
        <div className="floating-pulse pulse-three" />
      </div>

      {/* ================= LOADING ================= */}

      {loading ? (
        <motion.div
          className="data-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Activity size={18} />

          <span>INDEXING LIFE RECEIPTS...</span>
        </motion.div>
      ) : (
        <>
          {/* ================= INSIGHT STRIP ================= */}

          <div className="insight-strip">
            <motion.div className="insight-card" whileHover={{ y: -4 }}>
              <span>LISTENING TIME</span>

              <strong>{formatNumber(musicStats.listeningHours)}h</strong>

              <small>across music receipts</small>
            </motion.div>

            <motion.div className="insight-card" whileHover={{ y: -4 }}>
              <span>MOST PLAYED ARTIST</span>

              <strong className="text-value">{musicStats.topArtist}</strong>

              <small>based on listening records</small>
            </motion.div>

            <motion.div className="insight-card" whileHover={{ y: -4 }}>
              <span>SKIPPED MOMENTS</span>

              <strong>{formatNumber(musicStats.skipped)}</strong>

              <small>music receipts marked skipped</small>
            </motion.div>

            <motion.div className="insight-card" whileHover={{ y: -4 }}>
              <span>TRANSACTION VALUE</span>

              <strong>{formatAmount(spendingStats.transactionAmount)}</strong>

              <small>transaction dataset total</small>
            </motion.div>

            <motion.div
              className="discover-card"
              whileHover={{
                y: -4,
                scale: 1.01,
              }}
            >
              <div>
                <span>THE NEXT LAYER</span>

                <strong>Find the connections.</strong>
              </div>

              <ArrowUpRight size={22} />
            </motion.div>
          </div>

          {/* ================= DATASET BREAKDOWN ================= */}

          <div className="dataset-breakdown">
            <div className="breakdown-heading">
              <div>
                <span>DATA COMPOSITION</span>

                <strong>What's inside the trace?</strong>
              </div>

              <small>{formatNumber(totalRecords)} total records</small>
            </div>

            <div className="breakdown-grid">
              {datasetStatus.map((dataset) => {
                const Icon = dataset.icon;

                return (
                  <motion.div
                    className="breakdown-item"
                    key={dataset.id}
                    whileHover={{ y: -3 }}
                  >
                    <div
                      className="breakdown-icon"
                      style={{
                        "--node-color": dataset.color,
                      }}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="breakdown-content">
                      <div className="breakdown-top">
                        <span>{dataset.label}</span>

                        <strong>{formatNumber(dataset.count)}</strong>
                      </div>

                      <div className="breakdown-bar">
                        <motion.div
                          className="breakdown-fill"
                          style={{
                            "--node-color": dataset.color,
                          }}
                          initial={{
                            width: 0,
                          }}
                          whileInView={{
                            width: `${dataset.percentage}%`,
                          }}
                          viewport={{
                            once: true,
                          }}
                          transition={{
                            duration: 1,
                            ease: "easeOut",
                          }}
                        />
                      </div>

                      <small>{dataset.percentage}% of indexed records</small>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ================= QUICK PATTERN SIGNALS ================= */}

          <div className="quick-signals">
            <div className="signals-heading">
              <span>EARLY SIGNALS</span>

              <strong>Patterns already visible</strong>
            </div>

            <div className="signals-grid">
              <div className="signal-card">
                <span>01</span>

                <div>
                  <strong>Music trail</strong>

                  <p>
                    {formatNumber(musicStats.listeningHours)} hours of listening
                    activity are represented in the music dataset.
                  </p>
                </div>
              </div>

              <div className="signal-card">
                <span>02</span>

                <div>
                  <strong>Transaction rhythm</strong>

                  <p>
                    The largest transaction category by recorded value is{" "}
                    <b>{spendingStats.topTransactionCategory}</b>.
                  </p>
                </div>
              </div>

              <div className="signal-card">
                <span>03</span>

                <div>
                  <strong>Listening platform</strong>

                  <p>
                    The most represented listening platform is{" "}
                    <b>{musicStats.topPlatform}</b>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
