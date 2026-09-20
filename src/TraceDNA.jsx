import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Fingerprint,
  Music2,
  WalletCards,
  MapPin,
  Smartphone,
} from "lucide-react";
import "./TraceDNA.css";

function getYear(value) {
  const match = String(value ?? "").match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export default function TraceDNA({ data }) {
  const dna = useMemo(() => {
    const music = Array.isArray(data?.music) ? data.music : [];
    const household = Array.isArray(data?.household) ? data.household : [];
    const transactions = Array.isArray(data?.transactions)
      ? data.transactions
      : [];

    // ---------------- MUSIC ----------------
    const artistCounts = {};
    const platformCounts = {};

    for (let i = 0; i < music.length; i++) {
      const row = music[i] || {};

      const artist = row.artist_name || row.artistName || "Unknown Artist";

      const platform = row.platform || "Unknown Platform";

      artistCounts[artist] = (artistCounts[artist] || 0) + 1;

      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    }

    // ---------------- HOUSEHOLD ----------------
    const householdCounts = {};
    let householdTotal = 0;

    for (let i = 0; i < household.length; i++) {
      const row = household[i] || {};

      const category = row.category || row.Category || "Other";

      const amount = safeNumber(row.amount ?? row.Amount);

      householdCounts[category] = (householdCounts[category] || 0) + 1;

      householdTotal += amount;
    }

    // ---------------- TRANSACTIONS ----------------
    const transactionCounts = {};
    const cityCounts = {};
    let transactionTotal = 0;

    for (let i = 0; i < transactions.length; i++) {
      const row = transactions[i] || {};

      const category = row.category || "Other";

      const city = row.city || "Unknown";

      const amount = safeNumber(row.amt);

      transactionCounts[category] = (transactionCounts[category] || 0) + 1;

      cityCounts[city] = (cityCounts[city] || 0) + 1;

      transactionTotal += amount;
    }

    const top = (object) => {
      const entries = Object.entries(object);

      if (!entries.length) {
        return ["No data", 0];
      }

      entries.sort((a, b) => b[1] - a[1]);

      return entries[0];
    };

    const topArtist = top(artistCounts);
    const topPlatform = top(platformCounts);
    const topHousehold = top(householdCounts);
    const topTransaction = top(transactionCounts);
    const topCity = top(cityCounts);

    // ---------------- TIME RANGE ----------------
    let firstYear = null;
    let lastYear = null;

    const updateYear = (year) => {
      if (!year) return;

      if (firstYear === null || year < firstYear) {
        firstYear = year;
      }

      if (lastYear === null || year > lastYear) {
        lastYear = year;
      }
    };

    // Only scan timestamps until we get the range.
    for (let i = 0; i < music.length; i++) {
      updateYear(getYear(music[i]?.ts));
    }

    for (let i = 0; i < household.length; i++) {
      updateYear(getYear(household[i]?.date ?? household[i]?.Date));
    }

    for (let i = 0; i < transactions.length; i++) {
      updateYear(
        getYear(
          transactions[i]?.trans_date_trans_time ??
            transactions[i]?.transDateTransTime,
        ),
      );
    }

    return {
      totalRecords: music.length + household.length + transactions.length,

      musicCount: music.length,
      householdCount: household.length,
      transactionCount: transactions.length,

      topArtist,
      topPlatform,
      topHousehold,
      topTransaction,
      topCity,

      householdTotal,
      transactionTotal,

      firstYear,
      lastYear,
    };
  }, [data]);

  const cards = [
    {
      icon: Music2,
      label: "LISTENING DNA",
      title: dna.topArtist[0],
      value: dna.topArtist[1],
      suffix: "plays",
    },
    {
      icon: WalletCards,
      label: "SPENDING DNA",
      title: dna.topTransaction[0],
      value: dna.topTransaction[1],
      suffix: "records",
    },
    {
      icon: MapPin,
      label: "PLACE DNA",
      title: dna.topCity[0],
      value: dna.topCity[1],
      suffix: "records",
    },
    {
      icon: Smartphone,
      label: "DIGITAL DNA",
      title: dna.topPlatform[0],
      value: dna.topPlatform[1],
      suffix: "sessions",
    },
  ];

  return (
    <section className="dna-section" id="trace-dna">
      <div className="dna-header">
        <div className="dna-eyebrow">
          <Fingerprint size={14} />
          TRACE DNA / DATA FINGERPRINT
        </div>

        <h2>
          Your data has a<span> signature.</span>
        </h2>

        <p>
          A visual fingerprint generated directly from recurring patterns across
          the three provided datasets.
        </p>
      </div>

      {/* CORE FINGERPRINT */}
      <div className="dna-core">
        <motion.div
          className="dna-ring dna-ring-one"
          animate={{ rotate: 360 }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="dna-ring dna-ring-two"
          animate={{ rotate: -360 }}
          transition={{
            duration: 19,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="dna-ring dna-ring-three"
          animate={{ rotate: 360 }}
          transition={{
            duration: 34,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <div className="dna-core-glow" />

        <div className="dna-center">
          <Fingerprint size={30} />

          <strong>{dna.totalRecords.toLocaleString("en-IN")}</strong>

          <span>TRACE RECORDS</span>
        </div>
      </div>

      {/* SIGNAL CARDS */}
      <div className="dna-grid">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.article
              className="dna-card"
              key={card.label}
              initial={{
                opacity: 0,
                y: 25,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
              }}
              whileHover={{
                y: -6,
              }}
            >
              <div className="dna-card-top">
                <div className="dna-icon">
                  <Icon size={17} />
                </div>

                <span>0{index + 1}</span>
              </div>

              <div className="dna-label">{card.label}</div>

              <h3 title={card.title}>{card.title}</h3>

              <div className="dna-value">
                {Number(card.value).toLocaleString("en-IN")}
                <small>{card.suffix}</small>
              </div>

              <div className="dna-line">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{
                    width: `${Math.min(92, 35 + index * 17)}%`,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.2 + index * 0.1,
                  }}
                />
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* DATA ERA */}
      <div className="dna-era">
        <div>
          <span>HISTORY WINDOW</span>
          <strong>
            {dna.firstYear ?? "—"} — {dna.lastYear ?? "—"}
          </strong>
        </div>

        <div>
          <span>HOUSEHOLD RECORDS</span>
          <strong>{dna.householdCount.toLocaleString("en-IN")}</strong>
        </div>

        <div>
          <span>TRANSACTION RECORDS</span>
          <strong>{dna.transactionCount.toLocaleString("en-IN")}</strong>
        </div>

        <div>
          <span>MUSIC RECORDS</span>
          <strong>{dna.musicCount.toLocaleString("en-IN")}</strong>
        </div>
      </div>

      {/* VALUE STRIP */}
      <div className="dna-value-strip">
        <div>
          <span>HOUSEHOLD VALUE</span>
          <strong>
            {dna.householdTotal.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </strong>
        </div>

        <div className="dna-divider" />

        <div>
          <span>TRANSACTION VALUE</span>
          <strong>
            {dna.transactionTotal.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </strong>
        </div>
      </div>

      <div className="dna-note">
        OBSERVED DATA DISTRIBUTIONS · NOT PERSONAL CAUSATION
      </div>
    </section>
  );
}
