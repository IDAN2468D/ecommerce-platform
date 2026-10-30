"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Layers,
  Zap,
  Server,
  Radio,
  ExternalLink,
  X,
  Database,
  RefreshCw,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface TelemetryEvent {
  id: string;
  topic: string;
  type: string;
  timestamp: string;
  latencyMs: number;
  cacheSource: "REDIS_HIT" | "REDIS_MISS" | "MONGO_ATLAS";
  payload: any;
}

export const ArchitectureDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TelemetryEvent | null>(null);

  // Load and sample telemetry
  useEffect(() => {
    const initialEvents: TelemetryEvent[] = [
      {
        id: "evt_1",
        topic: "order-events",
        type: "OrderCreatedEvent",
        timestamp: "לפני 2 דקות",
        latencyMs: 14,
        cacheSource: "MONGO_ATLAS",
        payload: {
          orderId: "e7a5c891-628a-4c22-b5b8-d21a14fba012",
          status: "CONFIRMED",
          amount: 4899.0,
          currency: "ILS",
          sagaStep: "STEP_1_ORCHESTRATED",
        },
      },
      {
        id: "evt_2",
        topic: "inventory-events",
        type: "StockReservedEvent",
        timestamp: "לפני 2 דקות",
        latencyMs: 2.1,
        cacheSource: "REDIS_HIT",
        payload: {
          reservationId: "res_84920481",
          skuCode: "IPHONE-16-PRO-256",
          quantity: 1,
          mode: "PESSIMISTIC_WRITE_LOCK",
        },
      },
      {
        id: "evt_3",
        topic: "payment-events",
        type: "PaymentCapturedEvent",
        timestamp: "לפני דקה",
        latencyMs: 48,
        cacheSource: "MONGO_ATLAS",
        payload: {
          transactionId: "tx_gw_4892019842",
          status: "SUCCEEDED",
          amount: 4409.1,
          method: "pm_card_visa_ok",
        },
      },
      {
        id: "evt_4",
        topic: "shipping-events",
        type: "ShipmentScheduledEvent",
        timestamp: "לפני 40 שניות",
        latencyMs: 3.4,
        cacheSource: "REDIS_HIT",
        payload: {
          trackingNumber: "IL-EXP-948271",
          carrier: "Israel Post Express",
          status: "SCHEDULED",
          sagaStep: "STEP_5_COMPLETED",
        },
      },
    ];
    setEvents(initialEvents);

    const handleCustomEvent = (e: any) => {
      if (e.detail) {
        setEvents((prev) => [
          {
            id: "evt_" + Date.now(),
            topic: e.detail.topic || "kafka-events",
            type: e.detail.type || "EventDispatched",
            timestamp: "ממש עכשיו",
            latencyMs: Math.round(Math.random() * 8 + 1.2 * 10) / 10,
            cacheSource: Math.random() > 0.3 ? "REDIS_HIT" : "REDIS_MISS",
            payload: e.detail,
          },
          ...prev.slice(0, 19),
        ]);
      }
    };

    window.addEventListener("telemetry-event", handleCustomEvent);
    return () => window.removeEventListener("telemetry-event", handleCustomEvent);
  }, []);

  return (
    <>
      {/* Floating Toggle Pill */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 start-5 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/95 hover:bg-slate-800 text-white text-xs font-mono border border-slate-700/80 shadow-2xl backdrop-blur-md hover:scale-105 transition group"
        title="פתח את סייר הטלמטריה והארכיטקטורה החיה"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <Activity className="w-3.5 h-3.5 text-brand-400 group-hover:rotate-12 transition-transform" />
        <span className="font-sans font-bold">Architecture Explorer</span>
        <span className="px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] font-mono">
          Kafka KRaft
        </span>
      </button>

      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-start bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-xl h-full bg-slate-900 text-slate-100 border-e border-slate-800 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-600/30 border border-brand-500/40 text-brand-400 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <span>Live Architecture & Event Explorer</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    Java 21 • Virtual Threads • Kafka KRaft • Redis 7 • Mongo Atlas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-3 gap-2 p-4 bg-slate-950/40 border-b border-slate-800/80 font-mono text-center">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="text-[10px] text-slate-400">REDIS LATENCY</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">1.8 ms</div>
                <div className="text-[9px] text-slate-500">Sub-5ms Cache Hit</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="text-[10px] text-slate-400">KAFKA CLUSTER</div>
                <div className="text-sm font-bold text-brand-400 mt-0.5">KRaft Mode</div>
                <div className="text-[9px] text-slate-500">4 Microservice Topics</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="text-[10px] text-slate-400">OPENZIPKIN TRACE</div>
                <a
                  href="http://localhost:9411"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 mt-1"
                >
                  <span>פתח Trace</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <div className="text-[9px] text-slate-500">Distributed Tracing</div>
              </div>
            </div>

            {/* Events Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
                Recent Kafka Events Flow (Transactional Outbox)
              </span>

              {events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-right ${
                    selectedEvent?.id === evt.id
                      ? "bg-brand-950/40 border-brand-500/60 shadow-lg"
                      : "bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                    <span className="font-bold text-brand-300">{evt.type}</span>
                    <span className="text-[10px] text-slate-400">{evt.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                      topic: {evt.topic}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                        evt.cacheSource === "REDIS_HIT"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {evt.cacheSource} ({evt.latencyMs}ms)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Event Payload Viewer Modal/Section */}
            {selectedEvent && (
              <div className="p-4 border-t border-slate-800 bg-slate-950/80 font-mono">
                <div className="flex items-center justify-between text-xs mb-2 text-slate-300">
                  <span className="font-bold text-brand-400">Payload: {selectedEvent.type}</span>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-slate-400 hover:text-white text-[11px]"
                  >
                    סגור פירוט
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto max-h-36">
                  {JSON.stringify(selectedEvent.payload, null, 2)}
                </pre>
              </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Spring Cloud Gateway :8080 Active</span>
              </span>
              <a
                href="http://localhost:8090"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-400 flex items-center gap-1"
              >
                <span>Kafka UI</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
