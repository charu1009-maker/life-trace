import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Music2,
  ShoppingBag,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import "./ExploreReceipts.css";

const PAGE_SIZE = 12;

function formatAmount(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function formatDate(value) {
  if (!value) return "Unknown date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTitle(item, source) {
  if (source === "music") {
    return item.trackName || "Unknown track";
  }

  if (source === "household") {
    return (
      item.note || item.subcategory || item.category || "Household receipt"
    );
  }

  return item.merchant || item.category || "Transaction";
}

function getSubtitle(item, source) {
  if (source === "music") {
    return item.artistName || "Unknown artist";
  }

  if (source === "household") {
    return `${item.category || "Other"} · ${item.subcategory || "General"}`;
  }

  return `${item.category || "Other"} · ${item.city || "Unknown location"}`;
}

function getDate(item, source) {
  if (source === "music") {
    return item.ts;
  }

  if (source === "household") {
    return item.date;
  }

  return item.transDateTransTime;
}

function getIcon(source) {
  if (source === "music") return Music2;
  if (source === "household") return ShoppingBag;
  return CreditCard;
}

function getTypeLabel(source) {
  if (source === "music") return "MUSIC";
  if (source === "household") return "HOUSEHOLD";
  return "TRANSACTION";
}

function ReceiptCard({ receipt, onOpen }) {
  const Icon = getIcon(receipt.source);

  const amount =
    receipt.source === "music" ? null : Number(receipt.amount || 0);

  return (
    <motion.button
      className={`receipt-card receipt-${receipt.source}`}
      onClick={() => onOpen(receipt)}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <div className="receipt-card-top">
        <div className="receipt-icon">
          <Icon size={19} />
        </div>

        <span className="receipt-type">{getTypeLabel(receipt.source)}</span>
      </div>

      <div className="receipt-card-body">
        <h3>{getTitle(receipt.item, receipt.source)}</h3>

        <p>{getSubtitle(receipt.item, receipt.source)}</p>
      </div>

      <div className="receipt-card-bottom">
        <span>{formatDate(getDate(receipt.item, receipt.source))}</span>

        {amount !== null ? (
          <strong>{formatAmount(amount)}</strong>
        ) : (
          <span className="receipt-open">VIEW →</span>
        )}
      </div>
    </motion.button>
  );
}

export default function ExploreReceipts({ data }) {
  const [activeType, setActiveType] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const allReceipts = useMemo(() => {
    return [
      ...(data?.music || []).map((item) => ({
        source: "music",
        item,
      })),

      ...(data?.household || []).map((item) => ({
        source: "household",
        item,
      })),

      ...(data?.transactions || []).map((item) => ({
        source: "transactions",
        item,
      })),
    ];
  }, [data]);

  const filteredReceipts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allReceipts.filter(({ source, item }) => {
      const typeMatches = activeType === "all" || source === activeType;

      if (!typeMatches) return false;

      if (!query) return true;

      const searchableText = [
        item.trackName,
        item.artistName,
        item.albumName,
        item.note,
        item.category,
        item.subcategory,
        item.merchant,
        item.city,
        item.state,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [allReceipts, activeType, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReceipts.length / PAGE_SIZE),
  );

  const safePage = Math.min(page, totalPages);

  const visibleReceipts = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;

    return filteredReceipts.slice(start, start + PAGE_SIZE);
  }, [filteredReceipts, safePage]);

  function changeType(type) {
    setActiveType(type);
    setPage(1);
  }

  function handleSearch(event) {
    setSearch(event.target.value);
    setPage(1);
  }

  return (
    <section className="explore-receipts">
      <div className="receipts-header">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            RECEIPT ARCHIVE
          </div>

          <h2>
            Explore the
            <br />
            <span>raw moments.</span>
          </h2>

          <p>
            Search across music, household records and transaction receipts from
            the supplied datasets.
          </p>
        </div>

        <div className="receipt-total">
          <span>VISIBLE RECORDS</span>
          <strong>{filteredReceipts.length.toLocaleString("en-IN")}</strong>
        </div>
      </div>

      <div className="receipt-controls">
        <div className="receipt-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search artist, merchant, category, city..."
            value={search}
            onChange={handleSearch}
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="receipt-filters">
          <button
            className={activeType === "all" ? "active" : ""}
            onClick={() => changeType("all")}
          >
            ALL
          </button>

          <button
            className={activeType === "music" ? "active" : ""}
            onClick={() => changeType("music")}
          >
            <Music2 size={14} />
            MUSIC
          </button>

          <button
            className={activeType === "household" ? "active" : ""}
            onClick={() => changeType("household")}
          >
            <ShoppingBag size={14} />
            HOUSEHOLD
          </button>

          <button
            className={activeType === "transactions" ? "active" : ""}
            onClick={() => changeType("transactions")}
          >
            <CreditCard size={14} />
            TRANSACTIONS
          </button>
        </div>
      </div>

      {visibleReceipts.length > 0 ? (
        <>
          <motion.div className="receipts-grid" layout>
            {visibleReceipts.map((receipt, index) => (
              <ReceiptCard
                key={`${receipt.source}-${index}-${safePage}`}
                receipt={receipt}
                onOpen={setSelectedReceipt}
              />
            ))}
          </motion.div>

          <div className="pagination">
            <button
              disabled={safePage === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft size={17} />
              PREVIOUS
            </button>

            <div className="page-status">
              <span>PAGE</span>
              <strong>{safePage}</strong>
              <span>OF</span>
              <strong>{totalPages}</strong>
            </div>

            <button
              disabled={safePage === totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              NEXT
              <ChevronRight size={17} />
            </button>
          </div>
        </>
      ) : (
        <div className="empty-receipts">
          <Search size={30} />

          <h3>No matching receipts</h3>

          <p>Try another search term or change the dataset filter.</p>
        </div>
      )}

      {selectedReceipt && (
        <div
          className="receipt-modal-backdrop"
          onClick={() => setSelectedReceipt(null)}
        >
          <motion.div
            className="receipt-modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedReceipt(null)}
              aria-label="Close receipt"
            >
              <X size={20} />
            </button>

            <div className="modal-label">
              {getTypeLabel(selectedReceipt.source)}
            </div>

            <h2>{getTitle(selectedReceipt.item, selectedReceipt.source)}</h2>

            <p className="modal-subtitle">
              {getSubtitle(selectedReceipt.item, selectedReceipt.source)}
            </p>

            <div className="modal-details">
              <div>
                <span>DATE</span>
                <strong>
                  {formatDate(
                    getDate(selectedReceipt.item, selectedReceipt.source),
                  )}
                </strong>
              </div>

              {selectedReceipt.source !== "music" && (
                <div>
                  <span>AMOUNT</span>
                  <strong>{formatAmount(selectedReceipt.item.amount)}</strong>
                </div>
              )}

              {selectedReceipt.source === "music" && (
                <>
                  <div>
                    <span>ARTIST</span>
                    <strong>{selectedReceipt.item.artistName || "—"}</strong>
                  </div>

                  <div>
                    <span>PLATFORM</span>
                    <strong>{selectedReceipt.item.platform || "—"}</strong>
                  </div>

                  <div>
                    <span>LISTENING TIME</span>
                    <strong>
                      {Math.round(
                        Number(selectedReceipt.item.msPlayed || 0) / 60000,
                      )}{" "}
                      min
                    </strong>
                  </div>
                </>
              )}

              {selectedReceipt.source === "household" && (
                <>
                  <div>
                    <span>CATEGORY</span>
                    <strong>{selectedReceipt.item.category || "—"}</strong>
                  </div>

                  <div>
                    <span>MODE</span>
                    <strong>{selectedReceipt.item.mode || "—"}</strong>
                  </div>

                  <div>
                    <span>TYPE</span>
                    <strong>{selectedReceipt.item.incomeExpense || "—"}</strong>
                  </div>
                </>
              )}

              {selectedReceipt.source === "transactions" && (
                <>
                  <div>
                    <span>CATEGORY</span>
                    <strong>{selectedReceipt.item.category || "—"}</strong>
                  </div>

                  <div>
                    <span>LOCATION</span>
                    <strong>{selectedReceipt.item.city || "—"}</strong>
                  </div>

                  <div>
                    <span>STATE</span>
                    <strong>{selectedReceipt.item.state || "—"}</strong>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
