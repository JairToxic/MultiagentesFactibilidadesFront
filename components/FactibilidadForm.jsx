"use client";

import { useState } from "react";

export default function FactibilidadForm({ onSubmit }) {
  const [sessionId, setSessionId] = useState("sess-bookings1-005");
  const [projectName, setProjectName] = useState("Licenciamiento Bookings");
  const [clientName, setClientName] = useState("Comercial Andina");
  const [contactEmail, setContactEmail] = useState("cto@comercialandina.com");
  const [region, setRegion] = useState("EC");
  const [quantity, setQuantity] = useState(20);
  const [objective, setObjective] = useState(
    "Necesito cotizar y habilitar Teams Audio Conferencing para 20 usuarios en región EC. Producto: reservas/agenda, vendor Microsoft, licencia por usuario, facturación mensual."
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const slots = {
      project_name: projectName,
      client_name: clientName,
      contact_email: contactEmail,
      region,
      domain: "licensing/saas",
      quantity: Number(quantity)
    };

    onSubmit({
      sessionId,
      userInput: objective,
      slots
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border p-4 shadow-sm"
    >
      <h2 className="text-lg font-semibold">Nueva factibilidad técnica</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Session ID</label>
          <input
            className="rounded border px-2 py-1 text-sm"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            required
          />
          <span className="mt-1 text-xs text-gray-500">
            Identificador para reusar la misma sesión.
          </span>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Nombre del proyecto</label>
          <input
            className="rounded border px-2 py-1 text-sm"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Cliente</label>
          <input
            className="rounded border px-2 py-1 text-sm"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Correo de contacto</label>
          <input
            type="email"
            className="rounded border px-2 py-1 text-sm"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Región</label>
          <input
            className="rounded border px-2 py-1 text-sm"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">
            Cantidad (ej. usuarios)
          </label>
          <input
            type="number"
            min={1}
            className="rounded border px-2 py-1 text-sm"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium">Descripción / Requerimiento</label>
        <textarea
          className="min-h-[100px] rounded border px-2 py-1 text-sm"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Generar factibilidad
      </button>
    </form>
  );
}
