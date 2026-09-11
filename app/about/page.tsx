import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";
import { TrackedLink, TrackView } from "../components/analytics";
import { TiktokIcon, ShopeeIcon } from "../components/brand-icons";
import { JsonLd, organizationLd } from "../components/json-ld";

export const metadata = {
  title: "About Us | Picnic Club",
  description:
    "Picnic Club adalah ekosistem creator commerce Indonesia — rumah bagi training, mentoring, networking, dan kolaborasi brand. Dioperasikan oleh PT Trijata Kini Nusantara.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Picnic Club",
    description: "Rumah yang tumbuh bersama creator dan affiliator terbaik Indonesia.",
    url: "/about",
    type: "website",
  },
};

const pillars = [
  ["01", "Training yang practical", "Strategi affiliate, content, dan live yang bisa langsung dipakai, bukan sekadar teori."],
  ["02", "Support yang nyata", "Mentor dan manager yang hadir setiap kali creator butuh arah, bukan cuma saat campaign berjalan."],
  ["03", "Network yang terbuka", "Ruang untuk berbagi insight, kolaborasi, dan energi baik antar sesama creator."],
  ["04", "Peluang yang lebih besar", "Akses campaign, sample product, dan kesempatan tumbuh bersama brand ternama."],
];

export default function AboutPage() {
  return (
    <main className="site-shell">
      <JsonLd data={organizationLd} />
      <TrackView />
      <SiteNav />

      <section className="section about-intro">
        <div className="eyebrow">About Picnic Club / 001</div>
        <h1>Rumah yang tumbuh bersama creator-nya.</h1>
        <p className="hero-copy about-lede">
          Picnic Club adalah ekosistem creator commerce Indonesia — tempat training, mentoring,
          networking, dan kolaborasi brand bertemu dalam satu rumah. Kami percaya, creator tumbuh
          lebih jauh ketika mereka tidak berjalan sendirian.
        </p>
      </section>

      <section className="section story-section">
        <div className="eyebrow">Our story / 002</div>
        <h2>Everything started<br />with a question.</h2>
        <blockquote className="story-quote">
          “Kenapa belum ada ekosistem yang benar-benar memahami kreator?”
        </blockquote>
        <div className="story-lede">
          <p>Pertanyaan sederhana itu menjadi awal dari perjalanan Picnic Club.</p>
          <p>
            Berawal dari pengalaman langsung di dunia content creation, Berto Saksono Jati, Daniel
            Moris Tambunan, Adit Suryo, Adli Hibatul, dan Gufron merasakan keresahan yang sama:
            banyak kreator punya potensi besar, tapi belum mendapatkan wadah yang benar-benar
            memahami kebutuhan mereka.
          </p>
          <p>
            Agency dan MCN memang sudah banyak. Namun bagi mereka, masih ada ruang untuk membangun
            sesuatu yang berbeda — wadah yang bukan hanya menghadirkan campaign, tetapi juga
            edukasi, pendampingan, peluang, koneksi, dan ruang untuk bertumbuh bersama.
          </p>
        </div>

        <div className="story-chapters">
          <div className="story-chapter">
            <span className="story-chapter-label">The meeting</span>
            <div>
              <h3>When Creators Meet Business</h3>
              <div className="story-chapter-body">
                <p>
                  Dalam perjalanan tersebut, mereka bertemu dengan Andika Malik Maharaya dan Rommy
                  Arrahman, yang memiliki pengalaman di bidang Business Development — mempertemukan
                  dua perspektif yang berbeda namun saling melengkapi.
                </p>
                <ul>
                  <li><strong>Creator perspective</strong> — memahami bagaimana kreator berpikir, bekerja, dan berkembang.</li>
                  <li><strong>Business perspective</strong> — memahami bagaimana brand dan seller membutuhkan strategi, distribusi, serta creator yang tepat untuk menghasilkan dampak bisnis.</li>
                </ul>
                <p>
                  Dari sinilah muncul sebuah visi: bagaimana jika kita membangun sebuah ekosistem
                  yang mampu mempertemukan keduanya? Bukan sekadar menjadi penghubung, tetapi
                  menjadi partner yang benar-benar memahami kedua sisi.
                </p>
              </div>
            </div>
          </div>

          <div className="story-chapter">
            <span className="story-chapter-label">The birth</span>
            <div>
              <h3>Picnic Club Was Born</h3>
              <div className="story-chapter-body">
                <p>
                  Pada Mei 2026, visi tersebut diwujudkan melalui lahirnya Picnic Club — dibangun
                  sebagai TikTok &amp; Shopee Agency dengan satu tujuan utama: <em>connecting the
                  right creator with the right brand.</em>
                </p>
                <p>
                  Kami percaya kolaborasi yang baik bukan hanya soal seberapa besar jumlah
                  followers, tetapi tentang menemukan kreator yang tepat, brand yang tepat,
                  strategi yang tepat, dan kesempatan yang tepat.
                </p>
                <p>
                  Karena ketika semuanya terhubung dengan tepat, hasilnya bukan hanya sebuah
                  campaign — tetapi pertumbuhan.
                </p>
              </div>
            </div>
          </div>

          <div className="story-chapter">
            <span className="story-chapter-label">The growth</span>
            <div>
              <h3>From a Small Beginning to a Growing Ecosystem</h3>
              <div className="story-chapter-body">
                <p>
                  Picnic Club tumbuh dengan sangat cepat. Dalam waktu singkat, ribuan kreator telah
                  bergabung dan ratusan brand serta seller telah menjadi mitra.
                </p>
                <p>
                  Pertumbuhan itu bukan sekadar angka. Setiap member yang bergabung membawa cerita,
                  karakter, dan potensi yang berbeda. Setiap brand yang menjadi partner membawa
                  kebutuhan dan tantangan yang berbeda.
                </p>
                <p>
                  Dan Picnic Club hadir di tengah keduanya — sebagai penghubung, sebagai partner,
                  sebagai tempat untuk bertumbuh.
                </p>
              </div>
            </div>
          </div>

          <div className="story-chapter">
            <span className="story-chapter-label">More than an agency</span>
            <div>
              <h3>We Are Building a Community</h3>
              <div className="story-chapter-body">
                <p>
                  Sejak awal, Picnic Club tidak pernah ingin berhenti sebagai sebuah agency. Kami
                  punya mimpi yang jauh lebih besar: membangun salah satu ekosistem creator
                  terbesar di Indonesia.
                </p>
                <p>
                  Sebuah komunitas tempat kreator dapat belajar, bertemu, berkolaborasi,
                  mendapatkan kesempatan, dan berkembang bersama.
                </p>
                <p>
                  Kami ingin menciptakan lingkungan di mana kreator tidak perlu berjalan sendirian
                  — di mana kreator baru dapat belajar dari mereka yang sudah berpengalaman, di
                  mana kreator berpengalaman dapat menemukan peluang yang lebih besar, dan di mana
                  brand dapat menemukan partner yang tepat untuk membangun pertumbuhan bersama.
                </p>
              </div>
            </div>
          </div>

          <div className="story-chapter">
            <span className="story-chapter-label">Our belief</span>
            <div>
              <h3>Growth Is Better When We Grow Together</h3>
              <div className="story-chapter-body">
                <p>Kami percaya bahwa pertumbuhan terbaik bukanlah pertumbuhan yang dilakukan sendirian.</p>
                <p>
                  Ketika kreator berkembang, brand berkembang. Ketika brand berkembang, semakin
                  banyak peluang tercipta. Dan ketika seluruh ekosistem berkembang bersama,
                  dampaknya menjadi jauh lebih besar.
                </p>
                <p>
                  Itulah alasan Picnic Club hadir — bukan hanya untuk menghubungkan creator dengan
                  brand, tetapi untuk membangun sebuah ekosistem di mana creator, brand, dan seller
                  dapat tumbuh bersama.
                </p>
              </div>
            </div>
          </div>

          <div className="story-chapter">
            <span className="story-chapter-label">The future</span>
            <div>
              <h3>This Is Just the Beginning</h3>
              <div className="story-chapter-body">
                <p>
                  Picnic Club dimulai dari sebuah keresahan. Kemudian berubah menjadi sebuah
                  gagasan. Gagasan itu menjadi sebuah agency.
                </p>
                <p>
                  Dan hari ini, kami sedang membangun sesuatu yang jauh lebih besar: <em>a home for
                  creators</em> — tempat bagi kreator Indonesia untuk menemukan kesempatan,
                  membangun koneksi, meningkatkan kemampuan, dan mencapai potensi terbaik mereka.
                </p>
                <p>Perjalanan ini baru dimulai. And we believe the best is yet to come.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="story-close">
          <span>Picnic Club</span>
          <strong>Grow Together. Go Further.</strong>
        </div>
      </section>

      <section className="section lime-section">
        <div className="eyebrow">What we stand for / 003</div>
        <h2>Lebih dari<br />sekadar agency.</h2>
        <p className="hero-copy lime-copy">
          Empat hal yang membuat Picnic Club terasa berbeda — dan akan terus kami jaga seiring
          bertumbuh.
        </p>
        <div className="benefit-grid">
          {pillars.map(([number, title, text]) => (
            <div className="benefit" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="stats-section">
        <div className="section stats-inner">
          <div>
            <div className="eyebrow">By the numbers / 004</div>
            <h2>Angka yang<br />terus bertumbuh.</h2>
          </div>
          <div className="stats-grid">
            <div><strong>2K<span>+</span></strong><small>Creators</small></div>
            <div><strong>100<span>+</span></strong><small>Brand collaborations</small></div>
            <div><strong>100K<span>+</span></strong><small>Videos / month</small></div>
            <div><strong>100M<span>+</span></strong><small>Views / month</small></div>
          </div>
        </div>
      </section>

      <section className="section split-section about-legal">
        <div>
          <div className="eyebrow">Legal entity / 005</div>
          <h2>Badan hukum<br />kami.</h2>
        </div>
        <div>
          <p className="hero-copy">
            Picnic Club dioperasikan oleh <strong>PT Trijata Kini Nusantara</strong>, perusahaan
            yang berbadan hukum dan berkantor di Jakarta Selatan. Seluruh kerja sama resmi,
            kontrak, dan korespondensi bisnis Picnic Club dilakukan atas nama entitas ini.
          </p>
          <Link href="/contact" className="button-dark">Lihat alamat &amp; kontak resmi ↗</Link>
        </div>
      </section>

      <section className="final-cta">
        <div className="eyebrow">Your next chapter / 006</div>
        <h2>Siap tumbuh<br /><i>bersama kami?</i></h2>
        <div className="hero-actions">
          <TrackedLink ctaKey="about_join_tiktok" className="button-lime" href="/join">
            <TiktokIcon />Join Agency Tiktok
          </TrackedLink>
          <TrackedLink ctaKey="about_join_shopee" className="button-outline light-outline" href="/join-shopee">
            <ShopeeIcon />Join Agency Shopee
          </TrackedLink>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
