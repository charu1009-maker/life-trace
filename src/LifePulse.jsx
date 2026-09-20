import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Music2,
  WalletCards,
  Home,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import "./LifePulse.css";

const YEARS = [
  2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024,
];

function getYear(value) {
  if (!value) return null;

  const match = String(value).match(/\d{4}/);

  return match ? Number(match[0]) : null;
}

export default function LifePulse({ data }) {
  const [selectedYear, setSelectedYear] = useState(2024);

  const analytics = useMemo(() => {
    const music = data?.music || [];
    const household = data?.household || [];
    const transactions = data?.transactions || [];

    const musicByYear = {};
    const householdByYear = {};
    const transactionsByYear = {};

    const musicTotalByYear = {};
    const householdTotalByYear = {};
    const transactionTotalByYear = {};

    for (let i = 0; i < music.length; i++) {
      const year = getYear(music[i].ts);

      if (year) {
        musicByYear[year] = (musicByYear[year] || 0) + 1;
      }
    }

    for (let i = 0; i < household.length; i++) {
      const year = getYear(household[i].date || household[i].Date);

      if (year) {
        householdByYear[year] = (householdByYear[year] || 0) + 1;
      }
    }

    for (let i = 0; i < transactions.length; i++) {
      const year = getYear(
        transactions[i].transDateTransTime ||
          transactions[i].trans_date_trans_time,
      );

      if (year) {
        transactionsByYear[year] = (transactionsByYear[year] || 0) + 1;
      }
    }

    /*
      Amount totals are calculated separately so the
      visual can show both activity and spending.
    */

    for (let i = 0; i < household.length; i++) {
      const year = getYear(household[i].date || household[i].Date);

      const amount = Number(household[i].amount) || 0;

      if (year) {
        householdTotalByYear[year] = (householdTotalByYear[year] || 0) + amount;
      }
    }

    for (let i = 0; i < transactions.length; i++) {
      const year = getYear(
        transactions[i].transDateTransTime ||
          transactions[i].trans_date_trans_time,
      );

      const amount = Number(transactions[i].amt) || 0;

      if (year) {
        transactionTotalByYear[year] =
          (transactionTotalByYear[year] || 0) + amount;
      }
    }

    return {
      musicByYear,
      householdByYear,
      transactionsByYear,
      householdTotalByYear,
      transactionTotalByYear,
    };
  }, [data]);

  const current = {
    music: analytics.musicByYear[selectedYear] || 0,

    household: analytics.householdByYear[selectedYear] || 0,

    transactions: analytics.transactionsByYear[selectedYear] || 0,

    householdAmount: analytics.householdTotalByYear[selectedYear] || 0,

    transactionAmount: analytics.transactionTotalByYear[selectedYear] || 0,
  };

  const totalActivity =
    current.music + current.household + current.transactions;

  const maxActivity = Math.max(
    1,
    ...YEARS.map(
      (year) =>
        (analytics.musicByYear[year] || 0) +
        (analytics.householdByYear[year] || 0) +
        (analytics.transactionsByYear[year] || 0),
    ),
  );

  function resetTimeline() {
    setSelectedYear(2024);
  }

  return (
    <section className="pulse-section" id="life-pulse">
      {/* HEADER */}

      <div className="pulse-header">
        <div className="pulse-eyebrow">
          <Activity size={15} />
          LIFE PULSE / TIME MACHINE
        </div>

        <h2>
          Move through
          <span> time.</span>
        </h2>

        <p>
          Drag through the years and watch the available digital traces change.
          Each year becomes a different chapter in the dataset.
        </p>
      </div>

      {/* YEAR DISPLAY */}

      <div className="pulse-year">
        <span>SELECTED ERA</span>

        <motion.strong
          key={selectedYear}
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          {selectedYear}
        </motion.strong>
      </div>

      {/* TIMELINE */}

      <div className="pulse-timeline">
        <div className="pulse-line" />

        <div className="pulse-years">
          {YEARS.map((year) => {
            const active = year === selectedYear;

            const activity =
              (analytics.musicByYear[year] || 0) +
              (analytics.householdByYear[year] || 0) +
              (analytics.transactionsByYear[year] || 0);

            return (
              <button
                key={year}
                type="button"
                className={
                  active ? "pulse-year-node active" : "pulse-year-node"
                }
                onClick={() => setSelectedYear(year)}
                aria-label={`Explore ${year}`}
                aria-pressed={active}
              >
                <span
                  className="pulse-node"
                  style={{
                    transform: `scale(${
                      active ? 1.35 : 0.65 + (activity / maxActivity) * 0.45
                    })`,
                  }}
                />

                <small>{year}</small>
              </button>
            );
          })}
        </div>
      </div>

      {/* CURRENT ERA */}

      <motion.div
        className="pulse-dashboard"
        key={selectedYear}
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
        }}
      >
        {/* TOTAL */}

        <div className="pulse-total">
          <div className="pulse-card-label">TRACE DENSITY</div>

          <div className="pulse-total-number">
            {totalActivity.toLocaleString()}
          </div>

          <p>recorded traces in {selectedYear}</p>

          <div className="pulse-density">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (totalActivity / maxActivity) * 100)}%`,
              }}
              transition={{
                duration: 0.7,
              }}
            />
          </div>
        </div>

        {/* MUSIC */}

        <div className="pulse-data-card">
          <div className="pulse-card-top">
            <div className="pulse-card-icon">
              <Music2 size={18} />
            </div>

            <span>MUSIC</span>
          </div>

          <strong>{current.music.toLocaleString()}</strong>

          <small>listening records</small>
        </div>

        {/* HOUSEHOLD */}

        <div className="pulse-data-card">
          <div className="pulse-card-top">
            <div className="pulse-card-icon">
              <Home size={18} />
            </div>

            <span>HOUSEHOLD</span>
          </div>

          <strong>{current.household.toLocaleString()}</strong>

          <small>recorded entries</small>
        </div>

        {/* TRANSACTIONS */}

        <div className="pulse-data-card">
          <div className="pulse-card-top">
            <div className="pulse-card-icon">
              <WalletCards size={18} />
            </div>

            <span>TRANSACTIONS</span>
          </div>

          <strong>{current.transactions.toLocaleString()}</strong>

          <small>transaction records</small>
        </div>
      </motion.div>

      {/* STORY */}

      <motion.div
        className="pulse-story"
        key={`story-${selectedYear}`}
        initial={{
          opacity: 0,
          x: -15,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
      >
        <div className="pulse-story-icon">
          <Sparkles size={18} />
        </div>

        <div>
          <span>TRACE INTERPRETATION</span>

          <p>
            {totalActivity === 0
              ? `No records are available for ${selectedYear} in the provided datasets.`
              : totalActivity === maxActivity
                ? `${selectedYear} contains the highest combined activity density in this available year-by-year view.`
                : `${selectedYear} contains ${totalActivity.toLocaleString()} recorded traces across the available datasets.`}
          </p>
        </div>
      </motion.div>

      {/* RESET */}

      <button type="button" className="pulse-reset" onClick={resetTimeline}>
        <RotateCcw size={14} />
        RETURN TO 2024
      </button>

      {/* FOOTNOTE */}

      <div className="pulse-footnote">
        TIME VIEW IS COMPUTED FROM THE PROVIDED DATASETS · COUNTS REPRESENT
        RECORDED DATA, NOT PERSONAL CAUSATION
      </div>
    </section>
  );
}
