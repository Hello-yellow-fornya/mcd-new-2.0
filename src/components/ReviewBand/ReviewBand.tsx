import reviewsData from '@/data/reviews.json';
import { Icon } from '@/components/Icon/Icon';
import { reviewsHead } from '@/data/copy';
import { claimAttrs, claimVisible, getClaim } from '@/lib/claims';
import { isProduction } from '@/lib/staging';
import styles from './ReviewBand.module.css';

type Review = { quote: string; name: string; place: string; stars: number };

function Stars({ n, className }: { n: number; className?: string }) {
  return (
    <span className={[styles.stars, className].filter(Boolean).join(' ')} aria-label={`${n} stars`} role="img">
      {Array.from({ length: n }, (_, i) => (
        <Icon key={i} name="star" />
      ))}
    </span>
  );
}

/**
 * The review band (§0): "What drivers say" with the score, then an
 * auto-scrolling row of cards. CSS-only motion: the track is doubled for a
 * seamless loop, pauses on hover and touch, and with reduced motion it is a
 * scrollable row. Data from src/data/reviews.json; while sample is true the
 * band does not render on production.
 */
export function ReviewBand() {
  const { sample, reviews } = reviewsData as { sample: boolean; reviews: Review[] };
  if (sample && isProduction()) return null;
  const score = getClaim('reviews-score');
  const showScore = claimVisible(score);
  const cards = (dup: boolean) =>
    reviews.map((r, i) => (
      <article key={`${r.name}-${dup ? 'b' : 'a'}`} className={styles.card} aria-hidden={dup || undefined}>
        <Stars n={r.stars} className={styles.cardStars} />
        <p className={styles.quote}>“{r.quote}”</p>
        <div className={styles.who}>
          <span className={styles.avatar} aria-hidden="true">
            {r.name.charAt(0)}
          </span>
          <small>
            <b>{r.name}</b>
            <span className={styles.place}>{r.place}</span>
          </small>
          <span className="sr-only">{i + 1}</span>
        </div>
      </article>
    ));
  return (
    <section className={styles.reviews} aria-label="Customer reviews" data-review-band data-sample={sample ? '' : undefined}>
      <div className={`wrap ${styles.head}`}>
        <h2 className={styles.h2}>{reviewsHead.h2}</h2>
        {showScore ? (
          <p className={styles.score} {...claimAttrs(score)}>
            <Stars n={5} />
            <b>{score.score}</b> · {score.count} reviews
          </p>
        ) : null}
      </div>
      <div className={styles.viewport}>
        <div className={styles.track}>
          {cards(false)}
          {cards(true)}
        </div>
      </div>
    </section>
  );
}
