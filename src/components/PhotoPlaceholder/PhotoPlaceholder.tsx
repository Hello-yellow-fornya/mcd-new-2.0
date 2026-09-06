import styles from './PhotoPlaceholder.module.css';

type Props = {
  /** The scene the real photo will show; doubles as the accessible name. */
  label: string;
  /** Visible production note, e.g. "Photo: keys handed over on a driveway". */
  note?: string;
  ratio?: '4/3' | '16/9' | '3/2';
  /** white on cream surfaces (the hero), cream on white (the prose). */
  tone?: 'white' | 'cream';
  className?: string;
};

/** A box with the 24px photo-frame radius, used wherever a real photo is still to come. */
export function PhotoPlaceholder({ label, note, ratio = '4/3', tone = 'white', className }: Props) {
  return (
    <div className={[styles.ph, styles[tone], className].filter(Boolean).join(' ')} style={{ aspectRatio: ratio }} role="img" aria-label={label}>
      {note && <span>{note}</span>}
    </div>
  );
}
