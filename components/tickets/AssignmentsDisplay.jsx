// components/tickets/AssignmentsDisplay.jsx
"use client";

import React from 'react';
import styles from './AssignmentsDisplay.module.css';

export default function AssignmentsDisplay({ technicians = [], compact = false }) {
  if (!technicians || technicians.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>👤</span>
          <span className={styles.emptyText}>Sin asignar</span>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={styles.compactContainer}>
        {technicians.map((tech, idx) => (
          <div key={tech.id || idx} className={styles.compactBadge}>
            <span className={styles.compactAvatar}>
              {tech.name?.charAt(0) || '?'}
            </span>
            <span className={styles.compactName}>{tech.name}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>
          👥 {technicians.length} {technicians.length === 1 ? 'Técnico Asignado' : 'Técnicos Asignados'}
        </span>
      </div>
      <div className={styles.grid}>
        {technicians.map((tech, idx) => (
          <div key={tech.id || idx} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.avatar}>
                {tech.name
                  ?.split(' ')
                  .map(n => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || '??'}
              </div>
              <div className={styles.cardInfo}>
                <h4 className={styles.name}>{tech.name || 'Sin nombre'}</h4>
                {tech.id && (
                  <span className={styles.id}>ID: {tech.id}</span>
                )}
              </div>
              {tech.reranker_score && (
                <div className={styles.score}>
                  <span className={styles.scoreLabel}>Match</span>
                  <span className={styles.scoreValue}>
                    {Math.round((tech.reranker_score * 100) / 3)}%
                  </span>
                </div>
              )}
            </div>
            
            {tech.profile_summary && (
              <div className={styles.section}>
                <strong>Perfil:</strong>
                <p className={styles.summary}>{tech.profile_summary}</p>
              </div>
            )}
            
            {tech.skills && tech.skills.length > 0 && (
              <div className={styles.section}>
                <strong>Habilidades:</strong>
                <div className={styles.tags}>
                  {tech.skills.slice(0, 5).map((skill, i) => (
                    <span key={i} className={styles.tag}>{skill}</span>
                  ))}
                </div>
              </div>
            )}
            
            {tech.certifications && tech.certifications.length > 0 && (
              <div className={styles.section}>
                <strong>Certificaciones:</strong>
                <div className={styles.tags}>
                  {tech.certifications.slice(0, 3).map((cert, i) => (
                    <span key={i} className={styles.certTag}>🏆 {cert}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

