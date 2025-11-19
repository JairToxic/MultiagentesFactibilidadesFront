"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./FuturisticIntro.module.css";

export default function FuturisticIntro({ onComplete }) {
  const [stage, setStage] = useState("loading");
  const [progress, setProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Generar datos aleatorios una sola vez de forma determinística
  const randomData = useMemo(() => {
    const matrixColumns = [...Array(50)].map((_, i) => ({
      left: i * 2,
      delay: (i * 0.04).toFixed(2),
      duration: (3 + (i * 0.02) % 2).toFixed(2),
      chars: [...Array(20)].map((_, j) => 
        String.fromCharCode(0x30A0 + ((i * 20 + j) % 96))
      )
    }));

    const particles = [...Array(80)].map((_, i) => ({
      left: ((i * 13) % 100).toFixed(2),
      top: ((i * 17) % 100).toFixed(2),
      width: (2 + ((i * 3) % 4)).toFixed(2),
      height: (2 + ((i * 3) % 4)).toFixed(2),
      delay: ((i * 0.037) % 3).toFixed(2),
      duration: (3 + ((i * 0.05) % 4)).toFixed(2)
    }));

    const hexagons = [...Array(5)].map((_, i) => ({
      top: 20 + i * 15,
      left: 10 + (i % 2) * 30,
      delay: (i * 0.2).toFixed(2)
    }));

    const holograms = [
      { label: "AI", top: "15%", left: "10%" },
      { label: "ML", top: "20%", right: "15%" },
      { label: "NLP", bottom: "25%", left: "12%" },
      { label: "CV", bottom: "20%", right: "10%" }
    ];

    return { matrixColumns, particles, hexagons, holograms };
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setStage("opening"), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    if (stage === "opening") {
      const timer = setTimeout(() => {
        setStage("complete");
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 800);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  if (stage === "complete") return null;

  return (
    <div className={`${styles.intro} ${stage === "opening" ? styles.opening : ""}`}>
      {/* Fondo de matriz digital */}
      {isMounted && (
        <div className={styles.matrixBg}>
          {randomData.matrixColumns.map((col, i) => (
            <div
              key={i}
              className={styles.matrixColumn}
              style={{
                left: `${col.left}%`,
                animationDelay: `${col.delay}s`,
                animationDuration: `${col.duration}s`
              }}
            >
              {col.chars.map((char, j) => (
                <span key={j} className={styles.matrixChar}>
                  {char}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Partículas flotantes */}
      {isMounted && (
        <div className={styles.particles}>
          {randomData.particles.map((particle, i) => (
            <div
              key={i}
              className={styles.particle}
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.width}px`,
                height: `${particle.height}px`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Compuertas izquierda y derecha */}
      <div className={styles.doors}>
        <div className={styles.doorLeft}>
          <div className={styles.doorPanel}>
            <div className={styles.techGrid}>
              {[...Array(15)].map((_, i) => (
                <div key={i} className={styles.gridLine} />
              ))}
            </div>

            <div className={styles.circuits}>
              <svg className={styles.circuitSvg} viewBox="0 0 300 600">
                <path
                  d="M 50 50 L 250 50 L 250 150 L 150 150 L 150 250 L 250 250"
                  className={styles.circuitPath}
                  strokeDasharray="1000"
                  strokeDashoffset="1000"
                />
                <path
                  d="M 100 300 L 200 300 L 200 400 L 100 400 L 100 500"
                  className={styles.circuitPath}
                  strokeDasharray="800"
                  strokeDashoffset="800"
                  style={{ animationDelay: "0.3s" }}
                />
                <circle cx="250" cy="50" r="8" className={styles.circuitNode} />
                <circle cx="250" cy="250" r="8" className={styles.circuitNode} />
                <circle cx="200" cy="300" r="8" className={styles.circuitNode} />
              </svg>
            </div>

            {isMounted && (
              <div className={styles.hexagons}>
                {randomData.hexagons.map((hex, i) => (
                  <div
                    key={i}
                    className={styles.hexagon}
                    style={{
                      top: `${hex.top}%`,
                      left: `${hex.left}%`,
                      animationDelay: `${hex.delay}s`
                    }}
                  />
                ))}
              </div>
            )}

            <div className={styles.scanLines} />
          </div>
        </div>

        <div className={styles.doorRight}>
          <div className={styles.doorPanel}>
            <div className={styles.techGrid}>
              {[...Array(15)].map((_, i) => (
                <div key={i} className={styles.gridLine} />
              ))}
            </div>

            <div className={styles.circuits}>
              <svg className={styles.circuitSvg} viewBox="0 0 300 600">
                <path
                  d="M 250 100 L 50 100 L 50 200 L 150 200 L 150 300 L 50 300"
                  className={styles.circuitPath}
                  strokeDasharray="1000"
                  strokeDashoffset="1000"
                />
                <path
                  d="M 200 350 L 100 350 L 100 450 L 200 450 L 200 550"
                  className={styles.circuitPath}
                  strokeDasharray="800"
                  strokeDashoffset="800"
                  style={{ animationDelay: "0.3s" }}
                />
                <circle cx="50" cy="100" r="8" className={styles.circuitNode} />
                <circle cx="50" cy="300" r="8" className={styles.circuitNode} />
                <circle cx="100" cy="350" r="8" className={styles.circuitNode} />
              </svg>
            </div>

            {isMounted && (
              <div className={styles.hexagons}>
                {randomData.hexagons.map((hex, i) => (
                  <div
                    key={i}
                    className={styles.hexagon}
                    style={{
                      top: `${hex.top + 5}%`,
                      right: `${hex.left}%`,
                      animationDelay: `${hex.delay}s`
                    }}
                  />
                ))}
              </div>
            )}

            <div className={styles.scanLines} />
          </div>
        </div>
      </div>

      {/* Centro - Logo y contenido */}
      <div className={styles.centerContent}>
        <div className={styles.orbitalRings}>
          <div className={styles.ring} style={{ animationDelay: "0s" }} />
          <div className={styles.ring} style={{ animationDelay: "0.5s" }} />
          <div className={styles.ring} style={{ animationDelay: "1s" }} />
        </div>

        <div className={styles.logoContainer}>
          <div className={styles.logoGlow} />
          <div className={styles.logo}>
            <svg viewBox="0 0 200 200" className={styles.logoSvg}>
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="url(#gradient1)"
                strokeWidth="3"
                className={styles.logoCircle}
              />
              <path
                d="M 60 100 Q 80 70, 100 80 T 140 100"
                fill="none"
                stroke="url(#gradient1)"
                strokeWidth="2.5"
                className={styles.logoBrain}
              />
              <path
                d="M 60 110 Q 80 140, 100 130 T 140 110"
                fill="none"
                stroke="url(#gradient1)"
                strokeWidth="2.5"
                className={styles.logoBrain}
              />
              <circle cx="80" cy="90" r="4" fill="#00f0ff" className={styles.logoNode}>
                <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="120" cy="90" r="4" fill="#00f0ff" className={styles.logoNode}>
                <animate attributeName="r" values="4;6;4" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
              </circle>
              <circle cx="100" cy="75" r="4" fill="#00f0ff" className={styles.logoNode}>
                <animate attributeName="r" values="4;6;4" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
              </circle>
              
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <div className={styles.textContainer}>
          <h1 className={styles.title}>
            <span className={styles.titleWord} style={{ animationDelay: "0.2s" }}>SISTEMA</span>
            <span className={styles.titleWord} style={{ animationDelay: "0.4s" }}>DE</span>
            <span className={styles.titleWord} style={{ animationDelay: "0.6s" }}>INTELIGENCIA</span>
          </h1>
          <h2 className={styles.subtitle}>
            <span className={styles.subtitleGlitch} data-text="MULTIAGENTE">MULTIAGENTE</span>
          </h2>
        </div>

        <div className={styles.progressContainer}>
          <div className={styles.progressLabel}>
            <span className={styles.progressText}>INICIALIZANDO SISTEMA</span>
            <span className={styles.progressPercent}>{progress}%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressBarBg}>
              {[...Array(20)].map((_, i) => (
                <div key={i} className={styles.progressSegment} />
              ))}
            </div>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            >
              <div className={styles.progressGlow} />
            </div>
          </div>

          <div className={styles.loadingStates}>
            {[
              { label: "Neural Networks", delay: 0 },
              { label: "AI Agents", delay: 0.5 },
              { label: "Quantum Core", delay: 1 },
              { label: "Security Protocols", delay: 1.5 }
            ].map((item, i) => (
              <div
                key={i}
                className={`${styles.loadingState} ${progress > 25 * (i + 1) ? styles.loaded : ""}`}
                style={{ animationDelay: `${item.delay}s` }}
              >
                <span className={styles.stateIndicator}>
                  {progress > 25 * (i + 1) ? "✓" : "◌"}
                </span>
                <span className={styles.stateLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {isMounted && (
          <div className={styles.holograms}>
            {randomData.holograms.map((holo, i) => (
              <div
                key={i}
                className={styles.hologram}
                style={{
                  top: holo.top,
                  left: holo.left,
                  right: holo.right,
                  bottom: holo.bottom
                }}
              >
                <span>{holo.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.scanEffect} />
      <div className={styles.vignette} />
    </div>
  );
}