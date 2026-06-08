import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import "./CircularTestimonials.css";

function calculateGap(width) {
  const minWidth = 1024;
  const maxWidth = 1456;
  const minGap = 60;
  const maxGap = 86;
  if (width <= minWidth) return minGap;
  if (width >= maxWidth) return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

const quoteVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function CircularTestimonials({
  testimonials,
  autoplay = true,
  colors = {},
  fontSizes = {},
}) {
  const colorName        = colors.name            ?? "#ffffff";
  const colorDesignation = colors.designation     ?? "rgba(255,255,255,0.55)";
  const colorTestimony   = colors.testimony       ?? "rgba(255,255,255,0.82)";
  const colorArrowBg     = colors.arrowBackground ?? "#1E3B8A";
  const colorArrowFg     = colors.arrowForeground ?? "#ffffff";
  const colorArrowHover  = colors.arrowHoverBackground ?? "#F4A300";
  const fontName         = fontSizes.name         ?? "1.45rem";
  const fontDesig        = fontSizes.designation  ?? "0.85rem";
  const fontQuote        = fontSizes.quote        ?? "1.05rem";

  const [activeIndex, setActiveIndex]     = useState(0);
  const [hoverPrev, setHoverPrev]         = useState(false);
  const [hoverNext, setHoverNext]         = useState(false);
  const [containerWidth, setContainerWidth] = useState(1200);

  const imageContainerRef = useRef(null);
  const intervalRef       = useRef(null);

  const total  = useMemo(() => testimonials.length, [testimonials]);
  const active = useMemo(() => testimonials[activeIndex], [activeIndex, testimonials]);

  useEffect(() => {
    function onResize() {
      if (imageContainerRef.current) {
        setContainerWidth(imageContainerRef.current.offsetWidth);
      }
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((p) => (p + 1) % total);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [autoplay, total]);

  const handleNext = useCallback(() => {
    clearInterval(intervalRef.current);
    setActiveIndex((p) => (p + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    clearInterval(intervalRef.current);
    setActiveIndex((p) => (p - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft")  handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlePrev, handleNext]);

  function getImageStyle(index) {
    const gap       = calculateGap(containerWidth);
    const maxStickUp = gap * 0.8;
    const isActive  = index === activeIndex;
    const isLeft    = (activeIndex - 1 + total) % total === index;
    const isRight   = (activeIndex + 1) % total === index;

    if (isActive) {
      return {
        zIndex: 3, opacity: 1, pointerEvents: "auto",
        transform: "translateX(0) translateY(0) scale(1) rotateY(0deg)",
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }
    if (isLeft) {
      return {
        zIndex: 2, opacity: 1, pointerEvents: "auto",
        transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }
    if (isRight) {
      return {
        zIndex: 2, opacity: 1, pointerEvents: "auto",
        transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }
    return { zIndex: 1, opacity: 0, pointerEvents: "none", transition: "all 0.8s cubic-bezier(.4,2,.3,1)" };
  }

  return (
    <div className="ct-wrap">
      <div className="ct-grid">
        <div className="ct-images" ref={imageContainerRef}>
          {testimonials.map((t, i) => (
            <img
              key={t.src}
              src={t.src}
              alt={t.name}
              className="ct-img"
              style={getImageStyle(i)}
            />
          ))}
        </div>

        <div className="ct-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              variants={quoteVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <h3 className="ct-name"  style={{ color: colorName, fontSize: fontName }}>
                {active.name}
              </h3>
              <p className="ct-desig" style={{ color: colorDesignation, fontSize: fontDesig }}>
                {active.designation}
              </p>
              <motion.p className="ct-quote" style={{ color: colorTestimony, fontSize: fontQuote }}>
                {active.quote.split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ filter: "blur(8px)", opacity: 0, y: 4 }}
                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut", delay: 0.02 * i }}
                    style={{ display: "inline-block" }}
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          <div className="ct-arrows">
            <button
              className="ct-arrow"
              onClick={handlePrev}
              onMouseEnter={() => setHoverPrev(true)}
              onMouseLeave={() => setHoverPrev(false)}
              style={{ backgroundColor: hoverPrev ? colorArrowHover : colorArrowBg }}
              aria-label="Testimonio anterior"
            >
              <FaArrowLeft size={20} color={colorArrowFg} />
            </button>
            <button
              className="ct-arrow"
              onClick={handleNext}
              onMouseEnter={() => setHoverNext(true)}
              onMouseLeave={() => setHoverNext(false)}
              style={{ backgroundColor: hoverNext ? colorArrowHover : colorArrowBg }}
              aria-label="Siguiente testimonio"
            >
              <FaArrowRight size={20} color={colorArrowFg} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CircularTestimonials;
