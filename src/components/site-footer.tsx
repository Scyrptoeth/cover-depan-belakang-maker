import { Heart, MessageCircle } from "lucide-react";

function GitHubMark() {
  return (
    <svg aria-hidden="true" height="22" viewBox="0 0 24 24" width="22">
      <path
        d="M12 0.5C5.65 0.5 0.5 5.65 0.5 12c0 5.08 3.29 9.39 7.86 10.91 0.58 0.11 0.79-0.25 0.79-0.56 0-0.27-0.01-0.99-0.02-1.95-3.2 0.7-3.88-1.54-3.88-1.54-0.52-1.33-1.28-1.68-1.28-1.68-1.05-0.72 0.08-0.7 0.08-0.7 1.16 0.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37 0.96 0.1-0.75 0.4-1.26 0.73-1.55-2.55-0.29-5.23-1.28-5.23-5.68 0-1.25 0.45-2.28 1.18-3.08-0.12-0.29-0.51-1.46 0.11-3.04 0 0 0.97-0.31 3.16 1.18A10.9 10.9 0 0 1 12 5.57c0.98 0 1.96 0.13 2.88 0.39 2.19-1.49 3.15-1.18 3.15-1.18 0.63 1.58 0.24 2.75 0.12 3.04 0.74 0.8 1.18 1.83 1.18 3.08 0 4.42-2.69 5.39-5.25 5.68 0.42 0.36 0.78 1.07 0.78 2.16 0 1.56-0.01 2.82-0.01 3.2 0 0.31 0.21 0.68 0.8 0.56A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35 0.5 12 0.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="Informasi website">
      <p className="footer-brand">
        Cover Depan-Belakang Maker: Workbench PDF Privat untuk Sisipan Cover
      </p>
      <p className="footer-made">
        Dibuat dengan <Heart aria-hidden="true" className="footer-heart" size={18} /> untuk dokumen
        yang rapi.
      </p>
      <div className="footer-links">
        <a
          aria-label="Buka website Persiapantubel"
          href="https://persiapantubel.com/"
          rel="noopener noreferrer"
          target="_blank"
        >
          <GitHubMark />
          <span>Persiapantubel</span>
        </a>
        <a
          aria-label="Hubungi saran dan kendala via WhatsApp"
          href="https://wa.me/6282294116001"
          rel="noopener noreferrer"
          target="_blank"
        >
          <MessageCircle aria-hidden="true" size={22} />
          <span>Saran & Kendala: 0822-9411-6001</span>
        </a>
      </div>
      <p className="footer-copy">© 2026 Cover Depan-Belakang Maker</p>
    </footer>
  );
}
