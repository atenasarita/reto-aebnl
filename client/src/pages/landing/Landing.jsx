import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Preregistro from "../preregistro/Preregistro";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown, ArrowUp, ChevronRight, Heart, Mail, MapPin, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

import {
  AEBNL_ASSETS,
  AEBNL_CONTACT as CONTACT,
  AEBNL_COPY,
  AEBNL_DONATION,
} from "../../constants/aebnlSiteAssets";
import navLogo from "../../assets/espina.png";
import { getValidToken } from "../../utils/auth";
import "./landing.css";

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { href: "#nosotros", label: "Nosotros" },
  { href: "#consultas", label: "Consultas" },
  { href: "#areas", label: "Áreas" },
  { href: "#preregistro", label: "Pre-registro" },
  { href: "#donar", label: "Apóyanos" },
];

const STATS = [
  { value: "+1,167", label: "Familias integradas" },
  { value: "1993",   label: "Fundación" },
  { value: "30+",    label: "Años de servicio" },
  { value: "7",      label: "Áreas médicas" },
];

const AREAS = [
  { id: "neuro",    label: "Neurocirugía",               bg: "#1E3B8A" },
  { id: "ortho",    label: "Ortopedia",                  bg: "#19348a" },
  { id: "plastica", label: "Cirugía plástica",           bg: "#142d7e" },
  { id: "uro",      label: "Urología",                   bg: "#0f2672" },
  { id: "psico",    label: "Psicología",                 bg: "#0a1f66" },
  { id: "rehab",    label: "Rehabilitación",             bg: "#06175a" },
  { id: "gastro",   label: "Gastroenterología",          bg: "#030e3e" },
];

function AreasAccordion() {
  const [open, setOpen] = useState(null);
  return (
    <div className="lp-accordion" role="list" aria-label="Áreas médicas">
      {AREAS.map((area, i) => (
        <div
          key={area.id}
          className={`lp-slice${open === i ? " is-open" : ""}`}
          style={{ "--slice-bg": area.bg }}
          role="listitem"
          tabIndex={0}
          onMouseEnter={() => setOpen(i)}
          onMouseLeave={() => setOpen(null)}
          onFocus={() => setOpen(i)}
          onBlur={() => setOpen(null)}
          aria-label={area.label}
        >
          <span className="lp-slice-v" aria-hidden>{area.label}</span>
          <span className="lp-slice-h" aria-hidden>{area.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Landing() {
  const mainRef  = useRef(null);
  const wordsRef = useRef(null);
  const [heroPhotoIndex, setHeroPhotoIndex] = useState(0);

  useEffect(() => {
    const photos = AEBNL_ASSETS.consultasPhotos;
    if (!photos.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      setHeroPhotoIndex((i) => (i + 1) % photos.length);
    }, 5500);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (window.location.hash !== "#preregistro") return;
    const el = document.getElementById("preregistro");
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    }, 150);
    return () => window.clearTimeout(t);
  }, []);

  if (getValidToken()) return <Navigate to="/dashboard" replace />;

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(".lp-hero-reveal", {
        y: 36,
        opacity: 0,
        duration: 0.95,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.1,
      });

      gsap.utils.toArray(".lp-reveal").forEach((el) => {
        gsap.from(el, {
          y: 24,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      const img = document.querySelector(".lp-consultas-img");
      if (img) {
        gsap.fromTo(
          img,
          { scale: 0.9, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: { trigger: img, start: "top 85%", once: true },
          }
        );
      }

      if (wordsRef.current) {
        const words = wordsRef.current.querySelectorAll(".lp-word");
        gsap.fromTo(
          words,
          { opacity: 0.12 },
          {
            opacity: 1,
            stagger: 0.045,
            ease: "none",
            scrollTrigger: {
              trigger: wordsRef.current,
              start: "top 72%",
              end: "bottom 38%",
              scrub: true,
            },
          }
        );
      }
    },
    { scope: mainRef }
  );

  useEffect(() => () => ScrollTrigger.getAll().forEach((t) => t.kill()), []);

  const words = AEBNL_COPY.quienesSomos.split(" ");

  return (
    <main ref={mainRef} className="lp-page">
      <a href="#hero" className="lp-skip">Saltar al contenido</a>

      {/* NAV */}
      <div className="lp-nav-outer">
        <nav className="lp-nav-pill" aria-label="Principal">
          <Link to="/" className="lp-nav-brand" aria-label="Inicio">
            <img src={navLogo} alt="AEBNL" />
          </Link>
          <ul className="lp-nav-links">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
          <div className="lp-nav-actions">
            <Link to="/login" className="lp-nav-login">Acceso</Link>
          </div>
        </nav>
      </div>

      {/* HERO */}
      <section id="hero" className="lp-hero">
        <div className="lp-hero-bg" aria-hidden>
          <div className="lp-hero-photos">
            {AEBNL_ASSETS.consultasPhotos.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                className={`lp-hero-photo${i === heroPhotoIndex ? " is-active" : ""}`}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            ))}
          </div>
          <div className="lp-hero-overlay" />
        </div>
        <div className="lp-hero-content">
          <p className="lp-hero-eyebrow lp-hero-reveal">
            Asociación Civil de Nuevo León, desde 1993
          </p>
          <h1 className="lp-hero-h1 lp-hero-reveal">
            Tu apoyo <span className="lp-text-transforma">transforma</span> vidas
          </h1>
          <p className="lp-hero-sub lp-hero-reveal">
            Orientación médica y acompañamiento para familias con espina bífida en Nuevo León.
          </p>
          <div className="lp-hero-ctas lp-hero-reveal">
            <a href="#preregistro" className="lp-btn lp-btn--amber lp-btn--lg">
              Iniciar pre-registro
              <ChevronRight size={20} aria-hidden />
            </a>
            <a href="#nosotros" className="lp-btn lp-btn--ghost">
              Saber más
              <ArrowDown size={18} aria-hidden />
            </a>
          </div>
        </div>
        <a href="#nosotros" className="lp-hero-scroll" aria-hidden tabIndex={-1}>
          <ArrowDown size={22} />
        </a>
      </section>

      {/* STATS */}
      <div className="lp-stats-band" aria-label="Cifras de la asociación">
        {STATS.map((s) => (
          <div key={s.label} className="lp-stat">
            <span className="lp-stat-val">{s.value}</span>
            <span className="lp-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* NOSOTROS */}
      <section id="nosotros" className="lp-section lp-section--sky">
        <div className="lp-inner lp-split">
          <div className="lp-reveal">
            <span className="lp-eyebrow">Nosotros</span>
            <h2 className="lp-h2">¿Quiénes somos?</h2>
            <p ref={wordsRef} className="lp-prose">
              {words.map((word, i) => (
                <span key={i} className="lp-word">{word}{" "}</span>
              ))}
            </p>
          </div>
          <div className="lp-reveal">
            <span className="lp-eyebrow">La condición</span>
            <h2 className="lp-h2">¿Qué es la espina bífida?</h2>
            <p className="lp-prose">{AEBNL_COPY.queEsEspinaBifida}</p>
          </div>
        </div>
        <div className="lp-inner lp-reveal">
          <figure className="lp-infographic">
            <img
              src={AEBNL_ASSETS.queEsEspinaBifida}
              alt="Tipos de espina bífida: oculta, meningocele, lipomielomeningocele y mielomeningocele"
              loading="lazy"
              width={1024}
              height={301}
            />
          </figure>
        </div>
      </section>

      {/* CONSULTAS */}
      <section id="consultas" className="lp-section lp-section--dark">
        <div className="lp-inner lp-reveal">
          <div className="lp-consultas-inner">
            <div className="lp-consultas-text">
              <span className="lp-eyebrow lp-eyebrow--light">Atención</span>
              <h2 className="lp-h2 lp-h2--white">Nuestras consultas</h2>
              <p className="lp-prose lp-prose--light">
                Acompañamos a familias en consultas, orientación y seguimiento continuo con un equipo
                comprometido con la salud y el bienestar.
              </p>
            </div>
            <div className="lp-consultas-mosaic">
              <img
                src={AEBNL_ASSETS.consultasMosaic}
                alt="Momentos de consultas y acompañamiento en la asociación"
                className="lp-consultas-img"
                loading="lazy"
                width={1536}
                height={674}
                style={{ borderRadius: "var(--radius-card)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ÁREAS */}
      <section id="areas" className="lp-section lp-section--white">
        <div className="lp-inner lp-reveal" style={{ marginBottom: 28 }}>
          <span className="lp-eyebrow">Especialidades</span>
          <h2 className="lp-h2">Áreas médicas</h2>
          <p className="lp-prose">
            Vinculamos a familias con especialistas en las principales disciplinas. Pasa el cursor
            sobre cada área.
          </p>
        </div>
        <div className="lp-inner">
          <AreasAccordion />
        </div>
      </section>

      {/* PRE-REGISTRO EMBEBIDO */}
      <section id="preregistro" className="lp-section lp-section--preregistro">
        <div className="lp-inner lp-reveal">
          <div className="lp-preregistro-header">
            <span className="lp-eyebrow lp-eyebrow--light">Primeros pasos</span>
            <h2 className="lp-h2 lp-h2--white">¿Necesitas apoyo para tu familia?</h2>
            <p className="lp-prose lp-prose--light">
              Completa el pre-registro en tres pasos. Un miembro del equipo revisará tu solicitud
              y te orientará sobre los programas disponibles.
            </p>
          </div>
          <div className="lp-preregistro-card">
            <Preregistro />
          </div>
        </div>
      </section>

      {/* DONAR */}
      <section id="donar" className="lp-section lp-section--sky lp-section--donate">
        <div className="lp-inner lp-donate-layout">
          <div className="lp-donate-text lp-reveal">
            <span className="lp-eyebrow">Donaciones</span>
            <h2 className="lp-h2">Apóyanos</h2>
            <p className="lp-prose">{AEBNL_COPY.apoyanos}</p>
            <div className="lp-bank">
              <img src={AEBNL_ASSETS.banorte} alt="Banorte" className="lp-bank-logo" />
              <ul className="lp-bank-list">
                <li>{AEBNL_DONATION.bank} banco</li>
                <li>Cuenta: {AEBNL_DONATION.account}</li>
                <li className="lp-mono">CLABE: {AEBNL_DONATION.clabe}</li>
                <li className="lp-slogan">{AEBNL_DONATION.slogan}</li>
              </ul>
            </div>
            <div className="lp-donate-actions">
              <a
                href={CONTACT.website}
                target="_blank"
                rel="noreferrer"
                className="lp-btn lp-btn--amber"
              >
                <Heart size={16} aria-hidden />
                Donar ahora
              </a>
              <a href={CONTACT.phoneHref} className="lp-btn lp-btn--outline">
                <Phone size={16} aria-hidden />
                {CONTACT.phone}
              </a>
            </div>
          </div>
          <figure className="lp-donate-photo lp-reveal">
            <img
              src={AEBNL_ASSETS.apoyanos}
              alt="Niña beneficiaria de AEBNL sosteniendo diploma de agradecimiento por donativo"
              loading="lazy"
              width={1024}
              height={832}
            />
          </figure>
        </div>
      </section>

      {/* DONANTES */}
      <section className="lp-section lp-section--white">
        <div className="lp-inner lp-reveal" style={{ marginBottom: 32 }}>
          <span className="lp-eyebrow">Quienes nos apoyan</span>
          <h2 className="lp-h2">Nuestros donantes</h2>
        </div>
        <div className="lp-marquee" aria-hidden>
          <div className="lp-marquee-track">
            {[...AEBNL_ASSETS.donorLogos, ...AEBNL_ASSETS.donorLogos].map((src, i) => (
              <img
                key={`${src}-${i}`}
                src={src}
                alt=""
                loading="lazy"
                className="lp-donor-logo"
              />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div>
            <img src={navLogo} alt="AEBNL" className="lp-footer-logo" />
            <p className="lp-footer-brand">
              Asociación de Espina Bífida<br />de Nuevo León A.B.P.
            </p>
            <p className="lp-footer-copy">&copy; {new Date().getFullYear()}</p>
            <div className="lp-footer-social">
              <a href={CONTACT.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                <FaFacebook size={16} />
              </a>
              <a href={CONTACT.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                <FaInstagram size={16} />
              </a>
              <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <FaWhatsapp size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4>Contacto</h4>
            <ul>
              <li>
                <a href={CONTACT.mapsUrl} target="_blank" rel="noreferrer">
                  <MapPin size={13} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                  {CONTACT.address}
                </a>
              </li>
              <li>
                <a href={CONTACT.phoneHref}>
                  <Phone size={13} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                  T: {CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={CONTACT.phoneMobileHref}>
                  <Phone size={13} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                  C: {CONTACT.phoneMobile}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`}>
                  <Mail size={13} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Acceso</h4>
            <ul>
              <li><a href="#preregistro">Pre-registro de beneficiario</a></li>
              <li><Link to="/login">Sistema administrativo</Link></li>
              <li>
                <a href={CONTACT.website} target="_blank" rel="noreferrer">
                  Sitio web oficial
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="lp-footer-rule">
          Asociación de Espina Bífida de Nuevo León A.B.P.
        </p>
      </footer>

      <a href="#hero" className="lp-back-top" aria-label="Volver arriba">
        <ArrowUp size={18} />
      </a>
    </main>
  );
}
