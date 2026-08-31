'use client';

import React from 'react';
import { History, Shield, Sparkles, User, Clock, Tag } from 'lucide-react';
import { AuditEventRecord } from '@/lib/api';
import styles from './AuditTimeline.module.scss';

interface AuditTimelineProps {
  events: AuditEventRecord[];
  title?: string;
  subtitle?: string;
}

export default function AuditTimeline({ 
  events, 
  title = 'Auditable Activity Trail',
  subtitle = 'Auditable decision history with point-in-time state transitions' 
}: AuditTimelineProps) {

  const getActorIcon = (actor: string) => {
    const a = actor.toLowerCase();
    if (a.includes('agent') || a.includes('investigation') || a.includes('ai') || a.includes('gemini')) {
      return <Sparkles size={13} className={styles.agentIcon} />;
    }
    if (a.includes('risk') || a.includes('engine') || a.includes('policy')) {
      return <Shield size={13} className={styles.engineIcon} />;
    }
    return <User size={13} className={styles.userIcon} />;
  };

  return (
    <div className={styles.auditContainer}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <History size={14} className={styles.historyIcon} />
          <span className={styles.label}>TRANSPARENT GOVERNANCE</span>
        </div>
        <h4 className={styles.heading}>{title}</h4>
        <p className={styles.subtext}>{subtitle}</p>
      </div>

      {events.length > 0 ? (
        <div className={styles.timelineList}>
          {events.map((event, idx) => {
            const hasDetails = Boolean(event.details && Object.keys(event.details).length > 0);

            return (
              <div key={event.id || idx} className={styles.timelineItem}>
                <div className={styles.nodeColumn}>
                  <div className={styles.nodeDot}>
                    {getActorIcon(event.actor_type)}
                  </div>
                  {idx < events.length - 1 && <div className={styles.nodeLine} />}
                </div>

                <div className={styles.eventCard}>
                  <div className={styles.eventHeader}>
                    <div className={styles.actorAction}>
                      <span className={styles.actorType}>{event.actor_type}</span>
                      <span className={styles.actionName}>{event.action.replace(/_/g, ' ')}</span>
                      {event.event_type && (
                        <span className={styles.eventTypeBadge}>
                          <Tag size={10} />
                          {event.event_type}
                        </span>
                      )}
                    </div>
                    <div className={styles.eventTime}>
                      <Clock size={11} />
                      <span>{new Date(event.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Audit details representation */}
                  {hasDetails && (
                    <div className={styles.stateDetails}>
                      <div className={styles.metaRow}>
                        <code>{JSON.stringify(event.details)}</code>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Clock size={20} className={styles.emptyIcon} />
          <p>No activity events recorded yet for this transaction.</p>
        </div>
      )}
    </div>
  );
}
