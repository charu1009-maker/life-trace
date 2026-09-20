import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  CalendarDays,
  Music2,
  ShoppingBag,
  MapPin,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import "./PatternDiscovery.css";

const PATTERNS = [
  {
    id: "rhythm",
    label: "ACTIVITY RHYTHM",
    icon: Activity,
    title: "Your digital activity has a rhythm.",
    description:
      "Explore how listening activity changes across the months represented in the music history.",
  },
  {
    id: "music",
    label: "LISTENING DNA",
    icon: Music2,
    title: "Music leaves a detailed trace.",
    description:
      "Artists, tracks and listening behaviour reveal recurring patterns inside the music history.",
  },
  {
    id: "spending",
    label: "SPENDING SIGNALS",
    icon: ShoppingBag,
    title: "Transactions reveal category patterns.",
    description:
      "Explore which transaction categories appear most often and where the recorded amount is concentrated.",
  },
  {
    id: "place",
    label: "PLACE SIGNALS",
    icon: MapPin,
    title: "Activity has a geographic footprint.",
    description:
      "Explore the cities appearing most frequently in the available transaction records.",
  },
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getMonthFromTimestamp(ts) {
  if (!ts) return -1;

  // Spotify timestamps are already stored in a standard
  // YYYY-MM-DD format, so there is no need for new Date().
  const month = Number(String(ts).slice(5, 7));

  return month >= 1 && month <= 12 ? month - 1 : -1;
}

export default function PatternDiscovery({ data, loading }) {
  const [activePattern, setActivePattern] = useState("rhythm");

  const analytics = useMemo(() => {
    if (!data) return null;

    const music = data.music || [];
    const transactions = data.transactions || [];

    /*
      IMPORTANT PERFORMANCE CHANGE:
      We perform simple string/map operations instead of
      creating Date objects for every Spotify record.
    */

    const monthCounts = new Array(12).fill(0);

    const artistCounts = Object.create(null);

    for (let i = 0; i < music.length; i++) {
      const item = music[i];

      const monthIndex = getMonthFromTimestamp(item.ts);

      if (monthIndex !== -1) {
        monthCounts[monthIndex]++;
      }

      const artist = item.artistName || item.artist_name || "Unknown Artist";

      artistCounts[artist] = (artistCounts[artist] || 0) + 1;
    }

    const monthData = MONTHS.map((month, index) => ({
      month,
      value: monthCounts[index],
    }));

    const maxMonth = monthData.reduce(
      (max, item) => (item.value > max.value ? item : max),
      { month: "—", value: 0 },
    );

    const topArtists = Object.entries(artistCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    /*
      Transaction analysis
    */

    const categoryCounts = Object.create(null);
    const categoryAmounts = Object.create(null);
    const cityCounts = Object.create(null);

    for (let i = 0; i < transactions.length; i++) {
      const item = transactions[i];

      const category = item.category || "Unknown";
      const amount = Number(item.amt) || 0;
      const city = item.city || "Unknown";

      categoryCounts[category] = (categoryCounts[category] || 0) + 1;

      categoryAmounts[category] = (categoryAmounts[category] || 0) + amount;

      if (city !== "Unknown") {
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      }
    }

    const categories = Object.keys(categoryCounts)
      .map((name) => ({
        name,
        count: categoryCounts[name],
        amount: categoryAmounts[name] || 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      monthData,
      maxMonth,
      topArtists,
      categories,
      topCities,
      totalMusic: music.length,
      totalTransactions: transactions.length,
    };
  }, [data]);

  if (loading || !analytics) {
    return (
      <section className="pattern-section pattern-loading">
        <span>ANALYZING DIGITAL TRACES...</span>
      </section>
    );
  }

  const active =
    PATTERNS.find((pattern) => pattern.id === activePattern) || PATTERNS[0];

  const ActiveIcon = active.icon;

  return (
    <section className="pattern-section" id="pattern-discovery">
      <div className="pattern-header">
        <div className="pattern-eyebrow">
          <Sparkles size={15} />
          DISCOVER THE HIDDEN PATTERNS
        </div>

        <h2>
          Beyond the <span>receipt.</span>
        </h2>

        <p>
          Data becomes more meaningful when individual moments are connected
          into larger patterns.
        </p>
      </div>

      <div className="pattern-layout">
        {/* LEFT NAVIGATION */}

        <div className="pattern-menu">
          {PATTERNS.map((pattern) => {
            const Icon = pattern.icon;
            const isActive = activePattern === pattern.id;

            return (
              <button
                key={pattern.id}
                className={`pattern-tab ${isActive ? "active" : ""}`}
                onClick={() => setActivePattern(pattern.id)}
                aria-label={`Explore ${pattern.label}`}
                aria-pressed={isActive}
              >
                <Icon size={18} />

                <span>{pattern.label}</span>

                {isActive && (
                  <motion.div
                    className="pattern-tab-line"
                    layoutId="pattern-line"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* MAIN CONTENT */}

        <AnimatePresence mode="wait">
          <motion.div
            key={activePattern}
            className="pattern-card"
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            transition={{
              duration: 0.25,
            }}
          >
            <div className="pattern-card-top">
              <div className="pattern-icon">
                <ActiveIcon size={22} />
              </div>

              <div>
                <div className="pattern-label">{active.label}</div>

                <h3>{active.title}</h3>

                <p>{active.description}</p>
              </div>
            </div>

            {/* RHYTHM */}

            {activePattern === "rhythm" && (
              <div className="month-chart">
                <div className="chart-title">MONTHLY ACTIVITY</div>

                <div className="bars">
                  {analytics.monthData.map((item) => {
                    const height =
                      analytics.maxMonth.value > 0
                        ? Math.max(
                            8,
                            (item.value / analytics.maxMonth.value) * 100,
                          )
                        : 8;

                    return (
                      <div className="bar-column" key={item.month}>
                        <div className="bar-value">
                          {item.value.toLocaleString()}
                        </div>

                        <div className="bar-track">
                          <motion.div
                            className="bar-fill"
                            initial={{
                              height: 0,
                            }}
                            animate={{
                              height: `${height}%`,
                            }}
                            transition={{
                              duration: 0.5,
                              delay: 0.03,
                            }}
                          />
                        </div>

                        <span>{item.month}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pattern-insight">
                  <TrendingUp size={17} />

                  <span>
                    <strong>{analytics.maxMonth.month}</strong> contains the
                    highest recorded listening activity in this month-of-year
                    view.
                  </span>
                </div>
              </div>
            )}

            {/* MUSIC */}

            {activePattern === "music" && (
              <div className="signal-panel">
                <div className="chart-title">MOST FREQUENT ARTISTS</div>

                <div className="signal-list">
                  {analytics.topArtists.map(([artist, count], index) => (
                    <div className="signal-row" key={artist}>
                      <span className="signal-rank">0{index + 1}</span>

                      <div className="signal-name">{artist}</div>

                      <div className="signal-count">
                        {count.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pattern-insight">
                  <Music2 size={17} />

                  <span>
                    The music dataset contains{" "}
                    <strong>{analytics.totalMusic.toLocaleString()}</strong>{" "}
                    listening records.
                  </span>
                </div>
              </div>
            )}

            {/* SPENDING */}

            {activePattern === "spending" && (
              <div className="signal-panel">
                <div className="chart-title">HIGHEST RECORDED CATEGORIES</div>

                <div className="signal-list">
                  {analytics.categories.map((item, index) => (
                    <div className="signal-row" key={item.name}>
                      <span className="signal-rank">0{index + 1}</span>

                      <div className="signal-name">{item.name}</div>

                      <div className="signal-count">
                        {item.amount.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pattern-insight">
                  <ShoppingBag size={17} />

                  <span>
                    Showing the top categories by recorded transaction amount.
                  </span>
                </div>
              </div>
            )}

            {/* PLACE */}

            {activePattern === "place" && (
              <div className="signal-panel">
                <div className="chart-title">MOST FREQUENT CITIES</div>

                <div className="signal-list">
                  {analytics.topCities.map(([city, count], index) => (
                    <div className="signal-row" key={city}>
                      <span className="signal-rank">0{index + 1}</span>

                      <div className="signal-name">{city}</div>

                      <div className="signal-count">
                        {count.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pattern-insight">
                  <MapPin size={17} />

                  <span>
                    Geographic signals are based on the location fields
                    available in the transaction dataset.
                  </span>
                </div>
              </div>
            )}

            <div className="pattern-footer">
              <CalendarDays size={15} />

              <span>
                COMPUTED FROM THE PROVIDED DATASETS · PATTERNS SHOW DATA
                DISTRIBUTIONS, NOT PERSONAL CAUSATION
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
