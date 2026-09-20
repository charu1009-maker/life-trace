import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Music2,
  ShoppingBag,
  Receipt,
} from "lucide-react";
import "./ExploreReceipts.css";

const PAGE_SIZE = 12;

const TYPE_OPTIONS = [
  { id: "all", label: "ALL" },
  { id: "music", label: "MUSIC" },
  { id: "household", label: "HOUSEHOLD" },
  { id: "transactions", label: "TRANSACTIONS" },
];

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatAmount(value) {
  const amount = Number(value);

  if (Number.isNaN(amount)) return "—";

  return amount.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

function getDate(item, source) {
  if (source === "music") {
    return item.ts || "";
  }

  if (source === "household") {
    return item.date || item.Date || "";
  }

  return item.transDateTransTime || item.trans_date_trans_time || "";
}

function getTitle(item, source) {
  if (source === "music") {
    return item.trackName || "Unknown Track";
  }

  if (source === "household") {
    return item.note || item.subcategory || item.category || "Household Record";
  }

  return item.merchant || "Transaction";
}

function getSubtitle(item, source) {
  if (source === "music") {
    return item.artistName || "Unknown Artist";
  }

  if (source === "household") {
    return item.category || item.subcategory || "Household";
  }

  return item.category || "Transaction";
}

function getSearchText(item, source) {
  if (source === "music") {
    return [
      item.trackName,
      item.artistName,
      item.albumName,
      item.platform,
      item.reasonStart,
      item.reasonEnd,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  if (source === "household") {
    return [
      item.note,
      item.category,
      item.subcategory,
      item.mode,
      item.incomeExpense,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  return [
    item.merchant,
    item.category,
    item.city,
    item.state,
    item.first,
    item.last,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getIcon(source) {
  if (source === "music") return Music2;
  if (source === "household") return Receipt;
  return ShoppingBag;
}

function getSourceLabel(source) {
  if (source === "music") return "MUSIC";
  if (source === "household") return "HOUSEHOLD";
  return "TRANSACTION";
}

function getAmount(item, source) {
  if (source === "household") {
    return item.amount;
  }

  if (source === "transactions") {
    return item.amt;
  }

  return null;
}

export default function ExploreReceipts({ data }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  /*
   * IMPORTANT PERFORMANCE CHANGE
   *
   * We DO NOT create a giant array containing all
   * 162,000+ records.
   *
   * Instead, we keep the original datasets and only
   * collect the records required for the current page.
   */

  const results = useMemo(() => {
    if (!data) {
      return {
        items: [],
        total: 0,
      };
    }

    const query = search.trim().toLowerCase();

    const sources = [];

    if (type === "all" || type === "music") {
      sources.push({
        name: "music",
        records: data.music || [],
      });
    }

    if (type === "all" || type === "household") {
      sources.push({
        name: "household",
        records: data.household || [],
      });
    }

    if (type === "all" || type === "transactions") {
      sources.push({
        name: "transactions",
        records: data.transactions || [],
      });
    }

    /*
     * Fast path:
     *
     * When there is no search query, we only need
     * enough records to display the current page.
     *
     * This avoids creating 162K wrapper objects.
     */

    if (!query) {
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;

      let globalIndex = 0;
      const items = [];
      let total = 0;

      for (const source of sources) {
        total += source.records.length;

        if (items.length >= PAGE_SIZE) {
          continue;
        }

        for (let i = 0; i < source.records.length; i++) {
          if (globalIndex >= start && globalIndex < end) {
            items.push({
              source: source.name,
              item: source.records[i],
              index: globalIndex,
            });
          }

          globalIndex++;

          if (globalIndex >= end) {
            break;
          }
        }
      }

      return {
        items,
        total,
      };
    }

    /*
     * Search mode:
     *
     * Search through original arrays without building
     * a second copy of the complete dataset.
     */

    const matched = [];

    let total = 0;

    for (const source of sources) {
      const records = source.records;

      for (let i = 0; i < records.length; i++) {
        const item = records[i];

        if (getSearchText(item, source.name).includes(query)) {
          total++;

          if (matched.length < page * PAGE_SIZE) {
            matched.push({
              source: source.name,
              item,
              index: i,
            });
          }
        }
      }
    }

    const start = (page - 1) * PAGE_SIZE;

    return {
      items: matched.slice(start, start + PAGE_SIZE),
      total,
    };
  }, [data, search, type, page]);

  const totalPages = Math.max(1, Math.ceil(results.total / PAGE_SIZE));

  function changeType(nextType) {
    setType(nextType);
    setPage(1);
    setSelected(null);
  }

  function changeSearch(event) {
    setSearch(event.target.value);
    setPage(1);
  }

  function clearSearch() {
    setSearch("");
    setPage(1);
  }

  function openReceipt(record) {
    setSelected(record);
  }

  function closeReceipt() {
    setSelected(null);
  }

  function goToPage(nextPage) {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);

    setPage(safePage);

    window.requestAnimationFrame(() => {
      document.getElementById("explore-receipts")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <section className="explore-section" id="explore-receipts">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="explore-header">
        <div className="explore-eyebrow">
          <Receipt size={15} />
          EXPLORE YOUR DIGITAL RECEIPTS
        </div>

        <h2>
          Every record
          <span> tells something.</span>
        </h2>

        <p>
          Search across music, household activity and transaction records to
          uncover individual moments inside the larger data story.
        </p>
      </div>

      {/* =================================================
          CONTROLS
      ================================================= */}

      <div className="explore-controls">
        <div className="explore-search">
          <Search size={17} />

          <input
            type="text"
            value={search}
            onChange={changeSearch}
            placeholder="Search your digital traces..."
            aria-label="Search digital traces"
          />

          {search && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div
          className="explore-filters"
          role="tablist"
          aria-label="Receipt categories"
        >
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={type === option.id ? "active" : ""}
              onClick={() => changeType(option.id)}
              role="tab"
              aria-selected={type === option.id}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* =================================================
          RESULT META
      ================================================= */}

      <div className="explore-meta">
        <span>{formatNumber(results.total)} RECORDS</span>

        <span>
          PAGE {page} / {totalPages}
        </span>
      </div>

      {/* =================================================
          RECEIPT GRID
      ================================================= */}

      {results.items.length > 0 ? (
        <motion.div className="receipt-grid" layout>
          {results.items.map(({ source, item, index }) => {
            const Icon = getIcon(source);
            const title = getTitle(item, source);
            const subtitle = getSubtitle(item, source);
            const amount = getAmount(item, source);

            return (
              <motion.button
                type="button"
                className="receipt-card"
                key={`${source}-${index}`}
                layout
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.22,
                }}
                onClick={() =>
                  openReceipt({
                    source,
                    item,
                  })
                }
              >
                <div className="receipt-card-top">
                  <div className="receipt-icon">
                    <Icon size={18} />
                  </div>

                  <span className="receipt-source">
                    {getSourceLabel(source)}
                  </span>
                </div>

                <div className="receipt-card-body">
                  <h3>{title}</h3>

                  <p>{subtitle}</p>
                </div>

                <div className="receipt-card-bottom">
                  <span>{getDate(item, source)}</span>

                  {amount !== null && <strong>{formatAmount(amount)}</strong>}
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      ) : (
        <div className="explore-empty">
          <Search size={28} />

          <h3>No matching traces</h3>

          <p>Try another keyword or switch the dataset filter.</p>

          {search && (
            <button type="button" onClick={clearSearch}>
              CLEAR SEARCH
            </button>
          )}
        </div>
      )}

      {/* =================================================
          PAGINATION
      ================================================= */}

      {totalPages > 1 && (
        <div className="explore-pagination">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={17} />
          </button>

          <div className="page-indicator">
            <span>{String(page).padStart(2, "0")}</span>

            <small>/ {String(totalPages).padStart(2, "0")}</small>
          </div>

          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      )}

      {/* =================================================
          DETAIL MODAL
      ================================================= */}

      <AnimatePresence>
        {selected && (
          <motion.div
            className="receipt-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeReceipt}
          >
            <motion.div
              className="receipt-modal"
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="receipt-modal-close"
                onClick={closeReceipt}
                aria-label="Close receipt"
              >
                <X size={18} />
              </button>

              <div className="receipt-modal-label">
                {getSourceLabel(selected.source)}
              </div>

              <h3>{getTitle(selected.item, selected.source)}</h3>

              <p className="receipt-modal-subtitle">
                {getSubtitle(selected.item, selected.source)}
              </p>

              <div className="receipt-detail-grid">
                <div>
                  <span>DATE</span>
                  <strong>
                    {getDate(selected.item, selected.source) || "—"}
                  </strong>
                </div>

                {getAmount(selected.item, selected.source) !== null && (
                  <div>
                    <span>AMOUNT</span>
                    <strong>
                      {formatAmount(getAmount(selected.item, selected.source))}
                    </strong>
                  </div>
                )}

                {selected.source === "music" && (
                  <>
                    <div>
                      <span>PLATFORM</span>
                      <strong>{selected.item.platform || "—"}</strong>
                    </div>

                    <div>
                      <span>ALBUM</span>
                      <strong>{selected.item.albumName || "—"}</strong>
                    </div>

                    <div>
                      <span>SKIPPED</span>
                      <strong>{String(selected.item.skipped ?? "—")}</strong>
                    </div>
                  </>
                )}

                {selected.source === "household" && (
                  <>
                    <div>
                      <span>CATEGORY</span>
                      <strong>{selected.item.category || "—"}</strong>
                    </div>

                    <div>
                      <span>SUBCATEGORY</span>
                      <strong>{selected.item.subcategory || "—"}</strong>
                    </div>

                    <div>
                      <span>TYPE</span>
                      <strong>{selected.item.incomeExpense || "—"}</strong>
                    </div>
                  </>
                )}

                {selected.source === "transactions" && (
                  <>
                    <div>
                      <span>CATEGORY</span>
                      <strong>{selected.item.category || "—"}</strong>
                    </div>

                    <div>
                      <span>CITY</span>
                      <strong>{selected.item.city || "—"}</strong>
                    </div>

                    <div>
                      <span>STATE</span>
                      <strong>{selected.item.state || "—"}</strong>
                    </div>
                  </>
                )}
              </div>

              <div className="receipt-modal-note">
                This record is part of the provided dataset and is presented as
                a digital trace.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
