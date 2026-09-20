import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";

import LifeUniverse from "./LifeUniverse";
import ExploreReceipts from "./ExploreReceipts";

import "./App.css";

function App() {
  const [typedText, setTypedText] = useState("");

  const [data, setData] = useState({
    music: [],
    household: [],
    transactions: [],
  });

  const [dataLoading, setDataLoading] = useState(true);

  const fullText = "Every moment leaves a trace.";

  // -----------------------------
  // Typing animation
  // -----------------------------
  useEffect(() => {
    let index = 0;

    const timer = setInterval(() => {
      setTypedText(fullText.slice(0, index + 1));
      index++;

      if (index === fullText.length) {
        clearInterval(timer);
      }
    }, 65);

    return () => clearInterval(timer);
  }, []);

  // -----------------------------
  // Load all three datasets once
  // -----------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadLifeData() {
      try {
        const [musicResponse, householdResponse, transactionResponse] =
          await Promise.all([
            fetch("/data/spotify.json"),
            fetch("/data/household.json"),
            fetch("/data/transactions.json"),
          ]);

        if (
          !musicResponse.ok ||
          !householdResponse.ok ||
          !transactionResponse.ok
        ) {
          throw new Error("One or more datasets could not be loaded.");
        }

        const [music, household, transactions] = await Promise.all([
          musicResponse.json(),
          householdResponse.json(),
          transactionResponse.json(),
        ]);

        if (!cancelled) {
          setData({
            music,
            household,
            transactions,
          });

          setDataLoading(false);
        }
      } catch (error) {
        console.error("LIFE//TRACE data loading error:", error);

        if (!cancelled) {
          setDataLoading(false);
        }
      }
    }

    loadLifeData();

    return () => {
      cancelled = true;
    };
  }, []);

  // -----------------------------
  // Smooth scroll to universe
  // -----------------------------
  function enterStory() {
    document.getElementById("life-universe")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  return (
    <main className="app">
      {/* =====================================
          BACKGROUND PARTICLES
      ===================================== */}

      <div className="particles">
        {Array.from({ length: 35 }).map((_, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 61) % 100}%`,
              animationDelay: `${(i % 5) * 0.8}s`,
              animationDuration: `${4 + (i % 6)}s`,
            }}
          />
        ))}
      </div>

      {/* =====================================
          NAVIGATION
      ===================================== */}

      <nav className="navbar">
        <div className="logo">
          LIFE<span>//</span>TRACE
        </div>

        <div className="nav-status">
          <span className="status-dot" />

          {dataLoading
            ? "INDEXING DIGITAL MEMORY"
            : "DIGITAL MEMORY SYSTEM ONLINE"}
        </div>
      </nav>

      {/* =====================================
          HERO
      ===================================== */}

      <section className="hero">
        <motion.div
          className="hero-content"
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1,
          }}
        >
          <div className="eyebrow">
            <Sparkles size={15} />
            YOUR DIGITAL LIFE, REIMAGINED
          </div>

          <h1>
            LIFE
            <span>//</span>
            TRACE
          </h1>

          <div className="typing-line">
            {typedText}

            <span className="cursor">|</span>
          </div>

          <p className="hero-description">
            Thousands of tiny moments. Songs, purchases and transactions —
            connected into one living data story.
          </p>

          <motion.button
            className="explore-btn"
            onClick={enterStory}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.97,
            }}
          >
            ENTER YOUR STORY
            <ArrowDown size={18} />
          </motion.button>
        </motion.div>

        {/* =====================================
            ORBITAL LIFE ORB
        ===================================== */}

        <motion.div
          className="life-orb"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="orb-ring ring-one" />

          <div className="orb-ring ring-two" />

          <div className="orb-ring ring-three" />

          <div className="orb-core">
            <span>∞</span>
          </div>
        </motion.div>
      </section>

      {/* =====================================
          DATA UNIVERSE
      ===================================== */}

      <div id="life-universe">
        <LifeUniverse data={data} loading={dataLoading} />
      </div>

      {/* =====================================
          RECEIPT EXPLORER
      ===================================== */}

      {!dataLoading && <ExploreReceipts data={data} />}

      {/* =====================================
          BOTTOM INFORMATION
      ===================================== */}

      <div className="bottom-bar">
        <div>
          <span className="tiny-label">SYSTEM</span>

          <strong>{dataLoading ? "INDEXING DATA" : "READY TO EXPLORE"}</strong>
        </div>

        <div>
          <span className="tiny-label">RECEIPTS</span>

          <strong>
            {dataLoading
              ? "—"
              : (
                  data.music.length +
                  data.household.length +
                  data.transactions.length
                ).toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="scroll-indicator">SCROLL TO DISCOVER ↓</div>
      </div>
    </main>
  );
}

export default App;
