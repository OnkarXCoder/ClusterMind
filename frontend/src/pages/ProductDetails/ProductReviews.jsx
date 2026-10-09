import { useCallback, useEffect, useState } from "react";
import { Star, ThumbsUp, BadgeCheck, PenLine, Loader2, AlertCircle } from "lucide-react";
import { getProductReviews, createProductReview, markReviewHelpful } from "../../services/products";
import "./ProductDetails.css";

const EMPTY_SUMMARY = { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
const RATINGS = [1, 2, 3, 4, 5];
const STAR_LABELS = { 1: "Poor", 2: "Fair", 3: "Average", 4: "Good", 5: "Excellent" };

function StarRating({ value, size = 14, onSet = null }) {
  return (
    <span className={onSet ? "star-input" : "stars"}>
      {RATINGS.map((s) => (
        <Star
          key={s}
          size={size}
          fill={s <= value ? "#F59E0B" : "#E2E8F0"}
          color={s <= value ? "#F59E0B" : "#E2E8F0"}
          onClick={onSet ? () => onSet(s) : undefined}
          style={onSet ? { cursor: "pointer" } : undefined}
          aria-label={onSet ? STAR_LABELS[s] : undefined}
        />
      ))}
    </span>
  );
}

export default function ProductReviews({ product }) {
  const productId = product?._id || product?.id;

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [viewerHasReviewed, setViewerHasReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");

  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formNotice, setFormNotice] = useState("");

  const [votes, setVotes] = useState({});

  const load = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    const data = await getProductReviews(productId, { sort });
    setReviews(data.reviews);
    setSummary(data.summary || EMPTY_SUMMARY);
    setViewerHasReviewed(data.viewerHasReviewed);
    setLoading(false);
  }, [productId, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const token = localStorage.getItem("clustermind_token");

  async function submitReview(e) {
    e.preventDefault();
    setFormError("");
    if (!token) {
      setFormError("Sign in to share your experience with other customers.");
      return;
    }
    if (rating < 1) {
      setFormError("Tap a star to choose your rating.");
      return;
    }
    setSubmitting(true);
    try {
      const data = await createProductReview(productId, { rating, title, comment });
      if (data.summary) setSummary(data.summary);
      setFormNotice("Thanks - your review is live.");
      setFormOpen(false);
      setRating(0);
      setTitle("");
      setComment("");
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function vote(id) {
    if (!token) {
      setFormError("Sign in to mark a review as helpful.");
      return;
    }
    try {
      const data = await markReviewHelpful(id);
      setVotes((prev) => ({ ...prev, [id]: data.voted }));
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, helpful: data.helpful } : r))
      );
    } catch (err) {
      setFormError(err.message);
    }
  }

  const total = summary.count || 0;

  return (
    <div className="reviews-section">
      <div className="reviews-head">
        <h2>⭐ Customer Reviews</h2>
        {!formOpen && (
          <button className="write-review" onClick={() => setFormOpen(true)}>
            <PenLine size={16} />
            Write a Review
          </button>
        )}
      </div>

      <div className="review-summary">
        <div className="summary-score">
          <strong>{total ? summary.average.toFixed(1) : "—"}</strong>
          <span>{total ? `${total} reviews` : "No reviews yet"}</span>
        </div>
        <div className="summary-bars">
          {RATINGS.slice().reverse().map((bucket) => {
            const n = summary.distribution?.[bucket] || 0;
            const pct = total ? Math.round((n / total) * 100) : 0;
            return (
              <div className="bar-row" key={bucket}>
                <span className="bar-label">{bucket}★</span>
                <span className="bar-track">
                  <span className="bar-fill" style={{ width: `${pct}%` }} />
                </span>
                <span className="bar-count">{n}</span>
              </div>
            );
          })}
        </div>
      </div>

      {formError && (
        <p className="review-notice error">
          <AlertCircle size={15} /> {formError}
        </p>
      )}
      {formNotice && !formError && <p className="review-notice">{formNotice}</p>}

      {formOpen && (
        <form className="review-form" onSubmit={submitReview}>
          <h4>Your review</h4>

          <div className="field">
            <label>Overall rating</label>
            <span className="star-input">
              {RATINGS.map((s) => (
                <Star
                  key={s}
                  size={26}
                  fill={s <= rating ? "#F59E0B" : "#E2E8F0"}
                  color={s <= rating ? "#F59E0B" : "#E2E8F0"}
                  style={{ cursor: "pointer" }}
                  onClick={() => setRating(s)}
                />
              ))}
              <em>{rating ? STAR_LABELS[rating] : "Tap to rate"}</em>
            </span>
          </div>

          <div className="field">
            <label htmlFor="review-title">Headline</label>
            <input
              id="review-title"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sums up your experience in a few words"
            />
          </div>

          <div className="field">
            <label htmlFor="review-comment">Your experience</label>
            <textarea
              id="review-comment"
              value={comment}
              rows={4}
              maxLength={2000}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What worked, what didn't, and who you would recommend it to"
            />
            <small>{comment.length}/2000</small>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel" onClick={() => setFormOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="submit" disabled={submitting}>
              {submitting ? <Loader2 size={16} className="spin" /> : <PenLine size={16} />}
              Post review
            </button>
          </div>
        </form>
      )}

      <div className="reviews-sort">
        <label htmlFor="review-sort">Sort</label>
        <select id="review-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Most recent</option>
          <option value="helpful">Most helpful</option>
          <option value="highest">Highest rated</option>
          <option value="lowest">Lowest rated</option>
        </select>
        {viewerHasReviewed && <span className="you-reviewed">You reviewed this product</span>}
      </div>

      <div className="reviews-list">
        {loading ? (
          <p className="reviews-empty">
            <Loader2 size={16} className="spin" /> Loading reviews…
          </p>
        ) : reviews.length === 0 ? (
          <p className="reviews-empty">
            No reviews yet. Be the first to tell others what you think.
          </p>
        ) : (
          reviews.map((review) => (
            <div className="review-card" key={review.id}>
              <div className="review-top">
                <div className="avatar">{(review.name || "?")[0]}</div>
                <div>
                  <h4>
                    {review.name}
                    {review.verified && (
                      <span className="verified">
                        <BadgeCheck size={14} /> Verified Purchase
                      </span>
                    )}
                  </h4>
                  <div className="review-meta">
                    <StarRating value={review.rating} />
                    <span className="date">{review.date}</span>
                  </div>
                </div>
              </div>

              <h5>{review.title}</h5>
              <p>{review.comment}</p>

              <button
                type="button"
                className={`helpful-btn ${votes[review.id] ? "active" : ""}`}
                onClick={() => vote(review.id)}
              >
                <ThumbsUp size={15} />
                Helpful ({review.helpful})
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
