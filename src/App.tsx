import { useState, useEffect, useMemo, FormEvent } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent } from "motion/react";
import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import { 
  Music, 
  ShoppingBag, 
  Star, 
  Info, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Instagram, 
  Twitter, 
  Youtube,
  Facebook,
  Linkedin,
  ExternalLink,
  Play,
  Loader2,
  Menu,
  X,
  ArrowUp
} from "lucide-react";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SECTION_IDS, REVIEWS } from "./constants";
import { useSpotifyArtist, useSpotifyDiscography } from "./hooks";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(!!target.closest("a, button, .cursor-pointer"));
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleHover);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleHover);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 border-2 border-cyan-400 rounded-full pointer-events-none z-[9999] hidden lg:block"
      animate={{
        x: position.x - 16,
        y: position.y - 16,
        scale: isHovering ? 1.5 : 1,
        backgroundColor: isHovering ? "rgba(34, 211, 238, 0.2)" : "rgba(34, 211, 238, 0)",
      }}
      transition={{ type: "spring", damping: 25, stiffness: 250, mass: 0.5 }}
    />
  );
}

function SpotifyEmbed({ link }: { link: string }) {
  const url = new URL(link);
  const embedUrl = `https://open.spotify.com/embed${url.pathname}?utm_source=generator&theme=0`;
  
  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="absolute inset-0"
    ></iframe>
  );
}

export default function App() {

  const { artist, loading: artistLoading } = useSpotifyArtist();
  const { albums, loading: albumsLoading } = useSpotifyDiscography();
  
  const [storeIndex, setStoreIndex] = useState(0);
  const [checkoutItem, setCheckoutItem] = useState<any>(null);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handlePurchase = (item: any) => {
    setCheckoutItem(item);
  };

  const processPayment = () => {
    if (!checkoutEmail || !checkoutEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    // @ts-ignore - PaystackPop is loaded from script tag
    const handler = window.PaystackPop.setup({
      key: (import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY,
      email: checkoutEmail,
      amount: 5000000, // 50,000 NGN (in kobo)
      currency: 'NGN',
      ref: 'KUL-' + Math.floor(Math.random() * 1000000000),
      metadata: {
        custom_fields: [
          {
            display_name: "Product",
            variable_name: "product",
            value: checkoutItem.name
          }
        ]
      },
      callback: function(response: any) {
        showToast(`Payment successful! Reference: ${response.reference}`, 'success');
        setCheckoutItem(null);
        setCheckoutEmail("");
      },
      onClose: function() {
        // Transaction cancelled
      }
    });
    handler.openIframe();
  };

  return (
    <BrowserRouter>
      <ScrollToSection />
      <Routes>
        <Route 
          path="*" 
          element={
            <MainContent 
              artist={artist} 
              albums={albums} 
              loading={{ albums: albumsLoading, artist: artistLoading }}
              storeIndex={storeIndex} 
              setStoreIndex={setStoreIndex} 
              handlePurchase={handlePurchase} 
              checkoutItem={checkoutItem} 
              setCheckoutItem={setCheckoutItem} 
              checkoutEmail={checkoutEmail} 
              setCheckoutEmail={setCheckoutEmail} 
              processPayment={processPayment} 
              toast={toast} 
            />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

function ScrollToSection() {
  const { pathname } = useLocation();

  useEffect(() => {
    const sectionId = pathname.substring(1);
    if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);

  return null;
}

function MainContent({ artist, albums, loading, storeIndex, setStoreIndex, handlePurchase, checkoutItem, setCheckoutItem, checkoutEmail, setCheckoutEmail, processPayment, toast }: any) {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success">("idle");

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      setMousePos({
        x: (clientX / innerWidth - 0.5) * 20,
        y: (clientY / innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleNewsletterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus("loading");
    setTimeout(() => {
      setNewsletterStatus("success");
      setNewsletterEmail("");
    }, 1500);
  };

  const { pathname } = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setShowScrollTop(latest > 0.05);
  });

  // --- Dynamic Hero Logic ---
  const heroCta = useMemo(() => {
    const latest = albums[0];
    if (latest) {
      const releaseDate = new Date(latest.release_date);
      const now = new Date();
      const daysDiff = (releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff > 0) {
        // Future release — pre-save
        return {
          badge: `🔥 NEW RELEASE — ${latest.name.toUpperCase()}`,
          label: "PRE-SAVE NOW",
          href: latest.external_urls.spotify,
          external: true,
        };
      }
      if (daysDiff > -30) {
        // Released within last 30 days
        return {
          badge: `🎵 OUT NOW — ${latest.name.toUpperCase()}`,
          label: "STREAM NOW",
          href: latest.external_urls.spotify,
          external: true,
        };
      }
    }
    return {
      badge: "KENNERY",
      label: "FOLLOW ON SPOTIFY",
      href: "https://open.spotify.com/artist/4JlARvQLGoU9Ri1RdZXWGm",
      external: true,
    };
  }, [albums]);

  return (
      <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-400 selection:text-black cursor-none">
        <CustomCursor />

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
          <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
            <Link 
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl md:text-3xl font-display tracking-tighter text-white hover:text-cyan-400 transition-colors"
            >
              DR. ORLANDO OWOH
            </Link>
            
            <div className="hidden lg:flex items-center space-x-10">
              {[
                { id: SECTION_IDS.HERO, label: "HOME" },
                { id: SECTION_IDS.DISCOGRAPHY, label: "MUSIC" },
                { id: SECTION_IDS.STORE, label: "STORE" },
                { id: SECTION_IDS.ABOUT, label: "ABOUT" },
                { id: SECTION_IDS.REVIEWS, label: "REVIEWS" },
              ].map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/${item.id}`}
                    aria-label={`Navigate to ${item.label} section`}
                    className="text-[10px] font-black tracking-widest text-white/50 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:block"
              >
                <Link
                  to={`/${SECTION_IDS.DISCOGRAPHY}`}
                  aria-label="Listen to the latest music"
                  className="neo-border-accent bg-cyan-400 text-black px-6 py-2 text-[10px] font-black tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center"
                >
                  LISTEN NOW
                </Link>
              </motion.div>

              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-white hover:text-cyan-400 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="lg:hidden absolute top-20 left-0 right-0 bg-[#050505] border-b border-white/5 p-6 z-40"
              >
                <div className="flex flex-col space-y-6">
                  {[
                    { id: SECTION_IDS.HERO, label: "HOME" },
                    { id: SECTION_IDS.DISCOGRAPHY, label: "MUSIC" },
                    { id: SECTION_IDS.STORE, label: "STORE" },
                    { id: SECTION_IDS.ABOUT, label: "ABOUT" },
                    { id: SECTION_IDS.REVIEWS, label: "REVIEWS" },
                  ].map((item) => (
                    <Link
                      key={item.id}
                      to={`/${item.id}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-lg font-display tracking-widest text-white/70 hover:text-cyan-400 transition-colors uppercase"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    to={`/${SECTION_IDS.DISCOGRAPHY}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="neo-border-accent bg-cyan-400 text-black px-8 py-4 text-xs font-black tracking-widest text-center"
                  >
                    LISTEN NOW
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Hero Section */}
        <motion.section
          id={SECTION_IDS.HERO}
          style={{ opacity: heroOpacity }}
          className="relative h-screen flex items-center justify-center overflow-hidden bg-black"
        >
          {/* Background Image */}
          <motion.div 
            className="absolute inset-0 z-0"
            style={{
              x: mousePos.x * -1.5,
              y: mousePos.y * -1.5,
            }}
          >
            <img 
              src={artist?.images[0]?.url || "https://i.scdn.co/image/ab6761610000e5ebab6d77b6ce349595d200f33d"} 
              alt={`${artist?.name || 'DR. ORLANDO OWOH'} Spotify Background`}
              className="w-full h-full object-cover object-center opacity-55 grayscale hover:opacity-65 hover:grayscale-0 transition-all duration-1000"
              style={{ objectPosition: '50% 20%' }}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
          </motion.div>

          {/* Gritty Texture */}
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />
          </div>

          {/* Name glow backdrop */}
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[300px] bg-cyan-400/5 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 text-center px-4 md:px-6 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ x: mousePos.x * 0.5, y: mousePos.y * 0.5 }}
              className="mb-6"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={heroCta.badge}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.3 }}
                  className="neo-border bg-white text-black px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] inline-block"
                >
                  {heroCta.badge}
                </motion.span>
              </AnimatePresence>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              style={{ x: mousePos.x, y: mousePos.y }}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-[8vw] font-display leading-[0.85] text-white uppercase tracking-tighter mb-4"
            >
              DR. ORLANDO OWOH
            </motion.h1>

            {/* Genre tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-cyan-400/80 text-xs sm:text-sm font-black tracking-[0.4em] uppercase mb-8"
            >
              FÚJÌ &nbsp;&bull;&nbsp; HIGHLIFE &nbsp;&bull;&nbsp; NIGERIAN LEGEND
            </motion.p>

            {/* Spotify followers stat */}
            {artist?.followers?.total && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="flex items-center justify-center gap-2 mb-8"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-white/50 text-[10px] font-black tracking-[0.3em] uppercase">
                  {artist.followers.total.toLocaleString()} SPOTIFY FOLLOWERS
                </span>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6"
            >
              <Link 
                to={`/${SECTION_IDS.DISCOGRAPHY}`}
                aria-label="Stream the latest music"
                className="w-full sm:w-auto neo-border-accent bg-cyan-400 text-black px-10 py-5 text-sm font-black tracking-widest hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5 fill-current" />
                STREAM LATEST
              </Link>
              <AnimatePresence mode="wait">
                {heroCta.external ? (
                  <motion.a
                    key={heroCta.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    href={heroCta.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={heroCta.label}
                    className="w-full sm:w-auto neo-border bg-white text-black px-10 py-5 text-sm font-black tracking-widest hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all flex items-center justify-center gap-3"
                  >
                    <ExternalLink className="w-5 h-5" />
                    {heroCta.label}
                  </motion.a>
                ) : (
                  <motion.div
                    key={heroCta.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      to={heroCta.href}
                      aria-label={heroCta.label}
                      className="w-full sm:w-auto neo-border bg-white text-black px-10 py-5 text-sm font-black tracking-widest hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all flex items-center justify-center gap-3"
                    >
                      <ExternalLink className="w-5 h-5" />
                      {heroCta.label}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          >
            <span className="text-white/30 text-[9px] font-black tracking-[0.4em] uppercase">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <ChevronDown className="w-5 h-5 text-cyan-400/60" />
            </motion.div>
          </motion.div>

          {/* Marquee Bottom */}
          <div className="absolute bottom-0 left-0 right-0 py-4 bg-white overflow-hidden whitespace-nowrap">
            <div className="flex animate-marquee">
              {[...Array(10)].map((_, i) => (
                <span key={i} className="text-black font-display text-2xl mx-6 uppercase">
                  FÚJÌ &nbsp;•&nbsp; HIGHLIFE &nbsp;•&nbsp; KENNERY &nbsp;•&nbsp; NIGERIAN LEGEND &nbsp;•
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Discography Section */}
        <section id={SECTION_IDS.DISCOGRAPHY} className="py-20 md:py-32 px-4 md:px-6 bg-[#050505]">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-[1400px] mx-auto"
          >
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-12 md:mb-20 gap-8 text-center md:text-left">
              <div>
                <h2 className="text-5xl sm:text-6xl md:text-8xl font-display text-white mb-4 uppercase leading-none">DISCOGRAPHY</h2>
                <p className="text-white/40 max-w-md font-medium">EXPLORE THE SONIC UNIVERSE OF DR. ORLANDO OWOH.</p>
              </div>
              <a 
                href="https://open.spotify.com/artist/4JlARvQLGoU9Ri1RdZXWGm" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Follow Dr. Orlando Owoh on Spotify"
                className="w-full md:w-auto neo-border bg-white text-black px-6 py-3 text-xs font-black tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
              >
                FOLLOW ON SPOTIFY <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {loading.albums ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
              </div>
            ) : albums.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-7">
                  <div className="overflow-hidden aspect-[4/5] sm:aspect-video relative group neo-border-accent bg-black/20 backdrop-blur-sm">
                     <SpotifyEmbed link={albums[0].external_urls.spotify} />
                  </div>
                  <div className="mt-8 p-6 md:p-10 glass border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="text-cyan-400 font-black text-xs tracking-[0.3em] uppercase mb-4 block relative z-10">🎵 NOW PLAYING - LATEST RELEASE</span>
                    <h3 className="text-3xl md:text-5xl font-display text-white mb-6 uppercase relative z-10">"{albums[0].name}"</h3>
                    <p className="text-white/60 mb-8 leading-relaxed max-w-xl text-sm md:text-base relative z-10 uppercase tracking-tight">EXPERIENCE THE LEGENDARY SOUND OF DR. ORLANDO OWOH. A MASTERPIECE OF FÚJÌ AND HIGHLIFE FROM KENNERY.</p>
                    <button 
                      onClick={() => handlePurchase(albums[0])}
                      aria-label={`Buy ${albums[0].name} now`}
                      className="neo-border bg-white text-black px-8 py-3 text-xs font-black tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all inline-block relative z-10"
                    >
                      BUY NOW
                    </button>
                  </div>
                </div>
                
                <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                  {albums.slice(1, 5).map((album) => (
                    <motion.div 
                      key={album.id}
                      whileHover={{ scale: 1.02 }}
                      className="group cursor-pointer"
                      onClick={() => window.open(album.external_urls.spotify, "_blank")}
                    >
                      <div className="aspect-square neo-border bg-white/5 overflow-hidden mb-4 relative group-hover:neo-border-accent transition-all duration-300">
                        <img 
                          src={album.images[0]?.url} 
                          alt={album.name}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-current drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                        </div>
                      </div>
                      <h4 className="font-display text-lg md:text-xl text-white uppercase truncate">{album.name}</h4>
                      <p className="text-white/40 text-[10px] font-black tracking-widest uppercase">{album.album_type === "single" ? "Single" : "Album"} • {album.release_date.split("-")[0]}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-white/20 font-display text-4xl uppercase">
                NO DISCOGRAPHY FOUND.
              </div>
            )}
          </motion.div>
        </section>

        {/* Store Section */}
        <section id={SECTION_IDS.STORE} className="py-20 md:py-32 px-4 md:px-6 bg-[#050505] overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-[1400px] mx-auto"
          >
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-5xl sm:text-6xl md:text-8xl font-display text-white mb-4 uppercase leading-none">OFFICIAL STORE</h2>
              <p className="text-white/40 font-medium uppercase tracking-widest text-xs md:text-sm">EXCLUSIVE MERCHANDISE FROM THE LEGENDARY DR. ORLANDO OWOH.</p>
            </div>

            {loading.albums ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
              </div>
            ) : albums.length > 0 ? (
              <div className="relative">
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-5xl relative">
                    <div className="overflow-hidden">
                      <motion.div 
                        animate={{ x: `-${storeIndex * 100}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="flex"
                      >
                        {albums.slice(0, 3).map((album, i) => (
                          <div key={album.id} className="w-full flex-shrink-0 p-4">
                            <div className="neo-border bg-white overflow-hidden flex flex-col md:flex-row">
                              <div className="w-full md:w-1/2 aspect-square relative">
                                <img 
                                  src={album.images[0]?.url} 
                                  alt={album.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="absolute top-6 left-6 bg-black text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 neo-border">
                                  LATEST DROP
                                </span>
                              </div>
                              <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-white text-black">
                                <span className="text-cyan-600 font-black text-xs uppercase tracking-[0.3em] mb-4">LIMITED EDITION</span>
                                <h3 className="text-4xl md:text-6xl font-display mb-6 leading-none uppercase">
                                  {album.name}
                                </h3>
                                <p className="text-black/60 mb-10 leading-relaxed font-medium">
                                  GET THE EXCLUSIVE PHYSICAL COPY OF DR. ORLANDO OWOH'S LEGENDARY MASTERPIECE. HIGH-QUALITY 180G VINYL WITH CUSTOM ARTWORK.
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                  <div>
                                    <p className="text-black/40 text-[10px] uppercase font-black tracking-widest mb-1">PRICE</p>
                                    <p className="text-4xl font-display">$50.00</p>
                                  </div>
                                  <button 
                                    onClick={() => handlePurchase(album)}
                                    className="neo-border-accent bg-cyan-400 text-black px-10 py-5 text-xs font-black tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-3"
                                  >
                                    <ShoppingBag className="w-5 h-5" />
                                    BUY NOW
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    </div>

                    {/* Carousel Controls */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-2 md:-left-16 z-10">
                      <button 
                        onClick={() => setStoreIndex(prev => Math.max(0, prev - 1))}
                        disabled={storeIndex === 0}
                        className="p-3 md:p-5 neo-border bg-white text-black hover:bg-cyan-400 disabled:opacity-30 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 -right-2 md:-right-16 z-10">
                      <button 
                        onClick={() => setStoreIndex(prev => Math.min(albums.slice(0, 3).length - 1, prev + 1))}
                        disabled={storeIndex === albums.slice(0, 3).length - 1}
                        className="p-3 md:p-5 neo-border bg-white text-black hover:bg-cyan-400 disabled:opacity-30 transition-all"
                      >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-white/20 font-display text-4xl uppercase">
                NO PRODUCTS FOUND.
              </div>
            )}
          </motion.div>
        </section>

        {/* Reviews Section */}
        <section id={SECTION_IDS.REVIEWS} className="py-20 md:py-32 px-4 md:px-6 bg-[#050505]">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-5xl sm:text-6xl md:text-8xl font-display text-white mb-4 uppercase leading-none">WHAT THEY SAY</h2>
              <p className="text-white/40 font-medium uppercase tracking-widest text-xs md:text-sm">CRITICS AND FANS SHARE THEIR THOUGHTS.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {REVIEWS.map((review, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  className="glass p-12 border-white/5 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Star className="w-20 h-20 text-cyan-400 fill-current" />
                  </div>
                  <div className="flex gap-1 mb-8 text-cyan-400">
                    {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-xl text-white font-medium italic mb-10 leading-relaxed uppercase tracking-tight">"{review.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-1 bg-cyan-400" />
                    <span className="font-black text-xs text-white tracking-widest uppercase">{review.author}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id={SECTION_IDS.ABOUT} className="py-20 md:py-32 px-4 md:px-6 bg-[#0a0a0a] overflow-hidden">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
              <div className="relative">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="aspect-[4/5] neo-border-accent overflow-hidden relative z-10"
                >
                  <img 
                    src={artist?.images[0]?.url || "https://i.scdn.co/image/ab6761610000e5ebab6d77b6ce349595d200f33d"} 
                    alt={`${artist?.name || 'DR. ORLANDO OWOH'} Official Spotify Profile`}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                <div className="absolute -top-10 md:-top-20 -left-10 md:-left-20 w-40 md:w-80 h-40 md:h-80 bg-cyan-400/10 rounded-full blur-[60px] md:blur-[100px] pointer-events-none" />
              </div>
              
              <div className="text-center md:text-left">
                <h2 className="text-5xl sm:text-6xl md:text-8xl font-display text-white mb-8 md:mb-10 uppercase leading-none">ABOUT DR. ORLANDO OWOH</h2>
                <div className="space-y-6 md:space-y-8 text-base md:text-lg text-white/60 leading-relaxed font-medium uppercase tracking-tight">
                  <p>
                    {artist?.name || "DR. ORLANDO OWOH"} IS A {artist?.genres?.slice(0, 3).join(", ") || "FÚJÌ, HIGHLIFE"} LEGEND WITH {artist?.followers?.total?.toLocaleString() || "59,000+"} FOLLOWERS ON SPOTIFY. KNOWN AS KENNERY, HE ROSE FROM THE STREETS OF LAGOS TO BECOME ONE OF NIGERIA'S MOST CELEBRATED MUSICIANS.
                  </p>
                  <p>
                    HIS UNIQUE FUSION OF FÚJÌ AND HIGHLIFE CREATED A SOUND THAT DEFINED AN ERA. WITH DECADES OF MUSIC, HE HAS TOUCHED MILLIONS OF HEARTS ACROSS AFRICA AND THE DIASPORA.
                  </p>
                  <p>
                    DR. ORLANDO OWOH'S LEGACY IS ETCHED IN THE HISTORY OF NIGERIAN MUSIC. HIS STORYTELLING, HUMOR, AND SOCIAL COMMENTARY MADE HIM A VOICE FOR THE COMMON PEOPLE.
                  </p>
                </div>
                
                <div className="mt-12 md:mt-16 flex flex-wrap justify-center md:justify-start gap-4 md:gap-6">
                  {[
                    { icon: Instagram, href: "https://instagram.com/drorlandoowoh", label: "Instagram" },
                    { icon: Twitter, href: "https://twitter.com/drorlandoowoh", label: "Twitter" },
                    { icon: Facebook, href: "https://facebook.com/drorlandoowoh", label: "Facebook" },
                    { icon: Youtube, href: "https://www.youtube.com/channel/UCPd1dJab8isJwQITcmFEZnA", label: "YouTube" },
                  ].map((social, i) => (
                    <a 
                      key={i}
                      href={social.href} 
                      target="_blank" 
                      rel="noreferrer" 
                      aria-label={`Follow Dr. Orlando Owoh on ${social.label}`}
                      className="p-4 md:p-5 neo-border bg-white text-black hover:bg-cyan-400 transition-all"
                    >
                      <social.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-20 md:py-32 px-4 md:px-6 bg-black text-white border-t border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-400/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-[1400px] mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-24">
              <div className="col-span-1 md:col-span-2">
                <h2 className="text-6xl font-display tracking-tighter mb-10 uppercase">DR. ORLANDO OWOH</h2>
                <p className="text-white/40 max-w-sm mb-10 font-medium uppercase tracking-widest text-sm">
                  JOIN THE MAILING LIST FOR EXCLUSIVE UPDATES, EARLY ACCESS TO TICKETS, AND SPECIAL MERCHANDISE DROPS FROM DR. ORLANDO OWOH.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md">
                  {newsletterStatus === "success" ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-cyan-400 text-black px-8 py-4 text-xs font-black uppercase tracking-widest neo-border w-full text-center"
                    >
                      THANK YOU FOR JOINING!
                    </motion.div>
                  ) : (
                    <>
                      <input 
                        type="email" 
                        required
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="YOUR@EMAIL.COM" 
                        className="flex-1 bg-white/5 neo-border border-white/20 px-8 py-4 text-xs font-black focus:outline-none focus:border-cyan-400 transition-colors uppercase tracking-widest"
                      />
                      <button 
                        type="submit"
                        disabled={newsletterStatus === "loading"}
                        className="neo-border-accent bg-cyan-400 text-black px-10 py-4 text-xs font-black tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase disabled:opacity-50"
                      >
                        {newsletterStatus === "loading" ? "..." : "JOIN"}
                      </button>
                    </>
                  )}
                </form>
              </div>
              
              <div>
                <h4 className="font-black mb-10 text-cyan-400 uppercase tracking-[0.3em] text-[10px]">NAVIGATION</h4>
                <ul className="space-y-6 text-white/40 font-black text-xs tracking-widest uppercase">
                  <li><Link to="/" aria-label="Go to home section" className="hover:text-cyan-400 transition-colors">HOME</Link></li>
                  <li><Link to={`/${SECTION_IDS.DISCOGRAPHY}`} aria-label="Go to music section" className="hover:text-cyan-400 transition-colors">MUSIC</Link></li>
                  <li><Link to={`/${SECTION_IDS.STORE}`} aria-label="Go to store section" className="hover:text-cyan-400 transition-colors">STORE</Link></li>
                  <li><Link to={`/${SECTION_IDS.ABOUT}`} aria-label="Go to about section" className="hover:text-cyan-400 transition-colors">ABOUT</Link></li>
                  <li><Link to={`/${SECTION_IDS.REVIEWS}`} aria-label="Go to reviews section" className="hover:text-cyan-400 transition-colors">REVIEWS</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-black mb-10 text-cyan-400 uppercase tracking-[0.3em] text-[10px]">SUPPORT</h4>
                <ul className="space-y-6 text-white/40 font-black text-xs tracking-widest uppercase">
                  <li><a href="#" aria-label="Privacy Policy" className="hover:text-white transition-colors">PRIVACY</a></li>
                  <li><a href="#" aria-label="Terms of Service" className="hover:text-white transition-colors">TERMS</a></li>
                  <li><a href="#" aria-label="Customer Support" className="hover:text-white transition-colors">SUPPORT</a></li>
                  <li><a href="#" aria-label="Refund Policy" className="hover:text-white transition-colors">REFUND POLICY</a></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-white/20 text-[10px] font-black tracking-[0.2em] uppercase">
              <p>© {new Date().getFullYear()} DR. ORLANDO OWOH. ALL RIGHTS RESERVED.</p>
              <p className="text-cyan-400/30">KENNERY</p>
            </div>
          </div>
        </footer>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`fixed top-24 right-8 z-[200] neo-border p-6 max-w-md ${
                toast.type === 'success' ? 'bg-cyan-400 text-black' :
                toast.type === 'error' ? 'bg-red-500 text-white' :
                'bg-white text-black'
              }`}
            >
              <p className="font-black text-sm uppercase tracking-widest">{toast.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="fixed bottom-8 right-8 z-[60] p-4 neo-border bg-cyan-400 text-black hover:bg-white transition-all group"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Checkout Modal */}
        <AnimatePresence>
          {checkoutItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setCheckoutItem(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white text-black p-8 md:p-12 neo-border max-w-md w-full"
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-3xl font-display uppercase">Checkout</h3>
                  <button
                    onClick={() => setCheckoutItem(null)}
                    className="p-2 hover:bg-black/5 transition-colors"
                    aria-label="Close checkout"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-black/60 uppercase font-black tracking-widest mb-2">Product</p>
                  <p className="text-xl font-display">{checkoutItem.name}</p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-black/60 uppercase font-black tracking-widest mb-2">Price</p>
                  <p className="text-3xl font-display">₦50,000</p>
                  <p className="text-xs text-black/40 mt-1">~$50 USD</p>
                </div>

                <div className="mb-8">
                  <label className="text-sm text-black/60 uppercase font-black tracking-widest mb-2 block">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={checkoutEmail}
                    onChange={(e) => setCheckoutEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full neo-border bg-white px-4 py-3 text-sm font-medium focus:outline-none focus:border-cyan-400 transition-colors"
                    required
                  />
                </div>

                <button
                  onClick={processPayment}
                  className="w-full neo-border-accent bg-cyan-400 text-black px-8 py-4 text-sm font-black tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase"
                >
                  Proceed to Payment
                </button>

                <p className="text-xs text-black/40 text-center mt-6 uppercase tracking-wide">
                  Secure payment powered by Paystack
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
