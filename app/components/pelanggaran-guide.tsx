import Image from "next/image";

const APPEAL_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSe9UGLP3rRubXW-lE_fH7WXQdaYcfHEagurM_RDZ3QEXMgtQQ/viewform";

/**
 * The "Kena Pelanggaran? Gak Usah Panik" guide. Shared between the public
 * /pelanggaran page and the "Banding Pelanggaran" section in the creator
 * dashboard so both stay in sync.
 */
export function PelanggaranGuide() {
  return (
    <div className="guide-body">
      <h2>1. Pahami dulu penyebabnya</h2>
      <p>
        Cari tahu pelanggaran itu terjadi karena apa: apakah memang ada kesalahan yang melanggar
        aturan TikTok, atau karena error dari sistem (kamu dianggap melanggar padahal tidak
        melakukan kesalahan tersebut).
      </p>

      <h2>2. Ajukan banding lewat akunmu</h2>
      <p>
        Setelah paham, ajukan banding terlebih dahulu melalui tombol banding di akunmu. Selama proses
        banding berjalan, <strong>jangan pernah menghapus video</strong> yang terkena pelanggaran.
      </p>

      <h2>3. Lampirkan bukti</h2>
      <p>
        Sertakan dokumen pendukung: foto produk, foto kondisi saat shoot konten, atau foto lain yang
        diminta TikTok saat pengajuan banding.
      </p>

      <h2>4. Kalau banding ditolak</h2>
      <p>
        Isi <a href={APPEAL_FORM_URL} target="_blank" rel="noreferrer nofollow">formulir di bawah</a>,
        sertakan <strong>USERNAME</strong> dan <strong>UID</strong> kamu. Mohon tidak salah mengisi
        username — yang diisi adalah username, bukan nama akun. Setelah mengisi, konfirmasi ke admin di{" "}
        <a href="https://wa.me/6289526701680">089526701680</a>.
      </p>

      <p>
        <strong>Cara menemukan User ID (UID) TikTok kamu:</strong>
      </p>
      <figure className="legal-figure">
        <Image
          src="/uid-guide-1.jpg"
          alt="Langkah 1 sampai 3: buka TikTok lalu masuk ke profil, ketuk menu garis tiga di kanan atas, lalu pilih Settings and privacy."
          width={1600}
          height={900}
        />
        <Image
          src="/uid-guide-2.jpg"
          alt="Langkah 4 sampai 6: di menu Settings and privacy scroll ke paling bawah, ketuk berkali-kali pada nomor versi aplikasi sampai muncul keterangan UserId, lalu catat User ID kamu."
          width={1600}
          height={900}
        />
        <figcaption>
          Ketuk berkali-kali pada nomor versi aplikasi di bagian paling bawah menu Settings sampai
          muncul baris &ldquo;UserId&rdquo;.
        </figcaption>
      </figure>

      <h2>Banding lanjutan via MCN</h2>
      <p>
        Picnic Club dapat membantu mengajukan banding lanjutan melalui MCN. Keputusan final tetap ada
        di pihak TikTok. Untuk banding via MCN diperlukan beberapa data — isi dengan benar dan jelas.
        Prosesnya 3–7 hari kerja.
      </p>
    </div>
  );
}
