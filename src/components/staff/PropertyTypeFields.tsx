"use client";

/**
 * Type-specific form sections for the property create/edit form.
 * Renders different fields depending on the selected property type.
 * Used by both the Employee and Admin dashboards.
 */

const inputCls =
  "w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm focus:border-gold-400 focus:outline-none dark:border-white/10 dark:bg-primary-800 dark:text-white";
const labelCls =
  "block text-xs font-semibold uppercase tracking-wide text-primary-500 dark:text-white/60 mb-1";

export interface TypeFields {
  // Common numeric fields (also used for apartments)
  bedrooms: string;
  bathrooms: string;
  area: string;
  floor: string;
  totalFloors: string;
  rooms: string;
  buildingType: string;
  openBalcony: string;
  closedBalcony: string;
  ceilingHeight: string;
  view: string;
  renovation: string;
  // House-specific
  landArea: string;
  // Commercial-specific
  streetLine: string;
  storefront: string;   // "" | "true" | "false"
  commercialLevel: string;
}

export function emptyTypeFields(): TypeFields {
  return {
    bedrooms: "1",
    bathrooms: "1",
    area: "",
    floor: "1",
    totalFloors: "9",
    rooms: "1",
    buildingType: "",
    openBalcony: "0",
    closedBalcony: "0",
    ceilingHeight: "",
    view: "",
    renovation: "",
    landArea: "",
    streetLine: "",
    storefront: "",
    commercialLevel: "",
  };
}

type Setter = (patch: Partial<TypeFields>) => void;

interface Props {
  type: string;
  fields: TypeFields;
  onChange: Setter;
}

export default function PropertyTypeFields({ type, fields, onChange }: Props) {
  function set<K extends keyof TypeFields>(key: K, value: string) {
    onChange({ [key]: value } as Partial<TypeFields>);
  }

  // ── Renovation (shared by apartment, house, commercial) ──────────────────
  const renovationField = (
    <div>
      <label className={labelCls}>Renovation / Renovation վիճակ</label>
      <select className={inputCls} value={fields.renovation} onChange={(e) => set("renovation", e.target.value)}>
        <option value="">— Select —</option>
        <option value="new">New / Նոր</option>
        <option value="euro">Euro renovation / Եվremonт</option>
        <option value="good">Good condition / Լavvichak</option>
        <option value="cosmetic">Cosmetic / Կosmetik</option>
        <option value="old">Needs renovation / Հesc</option>
      </select>
    </div>
  );

  // ── APARTMENT / OFFICE / STUDIO / PENTHOUSE ──────────────────────────────
  if (["apartment", "office", "studio", "penthouse"].includes(type)) {
    return (
      <div className="space-y-4">
        {/* Area / Bedrooms / Bathrooms */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Interior Area m² / Մ²</label>
            <input type="number" min="0" className={inputCls} value={fields.area}
              onChange={(e) => set("area", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Bedrooms / Ննջ.</label>
            <input type="number" min="0" className={inputCls} value={fields.bedrooms}
              onChange={(e) => set("bedrooms", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Bathrooms / Լ/Ս</label>
            <input type="number" min="0" className={inputCls} value={fields.bathrooms}
              onChange={(e) => set("bathrooms", e.target.value)} />
          </div>
        </div>

        {/* Floor / Total Floors / Rooms */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Floor / Հarк</label>
            <input type="number" min="0" className={inputCls} value={fields.floor}
              onChange={(e) => set("floor", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Total Floors / Ընdamnд. հ.</label>
            <input type="number" min="0" className={inputCls} value={fields.totalFloors}
              onChange={(e) => set("totalFloors", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Rooms / Syenyak</label>
            <select className={inputCls} value={fields.rooms} onChange={(e) => set("rooms", e.target.value)}>
              {["1","2","3","4","5","6","6+"].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        {/* Building type / Renovation */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Building Type / Karucum</label>
            <select className={inputCls} value={fields.buildingType} onChange={(e) => set("buildingType", e.target.value)}>
              <option value="">— Select —</option>
              <option value="panel">Panel / Панел</option>
              <option value="newBuilding">New building / Nor kar.</option>
              <option value="stone">Stone / Qarakert</option>
              <option value="monolith">Monolith / Monоlit</option>
            </select>
          </div>
          {renovationField}
        </div>

        {/* Balconies / Ceiling height */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Open Balcony / Bac pat.</label>
            <select className={inputCls} value={fields.openBalcony} onChange={(e) => set("openBalcony", e.target.value)}>
              <option value="0">None</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Closed Balcony / Pak pat.</label>
            <select className={inputCls} value={fields.closedBalcony} onChange={(e) => set("closedBalcony", e.target.value)}>
              <option value="0">None</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Ceiling Height / Barek</label>
            <select className={inputCls} value={fields.ceilingHeight} onChange={(e) => set("ceilingHeight", e.target.value)}>
              <option value="">— Any —</option>
              <option value="2.6">2.6 m</option>
              <option value="2.8">2.8 m</option>
              <option value="3.0">3.0 m</option>
              <option value="3.2">3.2 m</option>
              <option value="3.2+">3.2+ m</option>
            </select>
          </div>
        </div>

        {/* View */}
        <div>
          <label className={labelCls}>View / Tesaran</label>
          <select className={inputCls} value={fields.view} onChange={(e) => set("view", e.target.value)}>
            <option value="">— Any —</option>
            <option value="ararat">Ararat / Ararats</option>
            <option value="city">City / Kaqaq</option>
            <option value="garden">Garden / Aygi</option>
            <option value="street">Street / Poxoc</option>
          </select>
        </div>
      </div>
    );
  }

  // ── HOUSE / VILLA ─────────────────────────────────────────────────────────
  if (["house", "villa"].includes(type)) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs text-blue-700 dark:border-blue-800/30 dark:bg-blue-900/20 dark:text-blue-300">
          House Area = interior floor area of the building. Land Area = total plot/territory.
        </div>

        {/* House Area / Land Area */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>House Area m² / Tnerus</label>
            <input type="number" min="0" className={inputCls} placeholder="e.g. 200"
              value={fields.area} onChange={(e) => set("area", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Land / Plot Area m² / Hogi</label>
            <input type="number" min="0" className={inputCls} placeholder="e.g. 600"
              value={fields.landArea} onChange={(e) => set("landArea", e.target.value)} />
          </div>
        </div>

        {/* Bedrooms / Bathrooms / Floors */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Bedrooms / Nnj.</label>
            <input type="number" min="0" className={inputCls} value={fields.bedrooms}
              onChange={(e) => set("bedrooms", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Bathrooms / L/S</label>
            <input type="number" min="0" className={inputCls} value={fields.bathrooms}
              onChange={(e) => set("bathrooms", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Stories / Hark</label>
            <input type="number" min="1" max="10" className={inputCls} value={fields.totalFloors}
              onChange={(e) => set("totalFloors", e.target.value)} />
          </div>
        </div>

        {/* Rooms / Renovation */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Rooms / Senyak</label>
            <select className={inputCls} value={fields.rooms} onChange={(e) => set("rooms", e.target.value)}>
              {["1","2","3","4","5","6","7","8","8+"].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          {renovationField}
        </div>
      </div>
    );
  }

  // ── COMMERCIAL ────────────────────────────────────────────────────────────
  if (type === "commercial") {
    return (
      <div className="space-y-4">
        {/* Area / Rooms / Bathrooms */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Commercial Area m²</label>
            <input type="number" min="0" className={inputCls} placeholder="e.g. 80"
              value={fields.area} onChange={(e) => set("area", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Rooms / Sections</label>
            <input type="number" min="0" className={inputCls} value={fields.rooms}
              onChange={(e) => set("rooms", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Restrooms</label>
            <input type="number" min="0" className={inputCls} value={fields.bathrooms}
              onChange={(e) => set("bathrooms", e.target.value)} />
          </div>
        </div>

        {/* Street Line / Commercial Level */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Street Position / Kargi</label>
            <select className={inputCls} value={fields.streetLine} onChange={(e) => set("streetLine", e.target.value)}>
              <option value="">— Select —</option>
              <option value="first">First line / Ayrvats</option>
              <option value="second">Second line / Erkrord</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Level / Floor Type</label>
            <select className={inputCls} value={fields.commercialLevel} onChange={(e) => set("commercialLevel", e.target.value)}>
              <option value="">— Select —</option>
              <option value="basement">Basement / Kelani hark</option>
              <option value="semi-basement">Semi-basement / Kartez kelani</option>
              <option value="ground">Ground floor / Gettayamazard</option>
              <option value="upper">Upper floor / Verev hark</option>
            </select>
          </div>
        </div>

        {/* Storefront / Renovation */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Storefront / Display Windows</label>
            <select className={inputCls} value={fields.storefront} onChange={(e) => set("storefront", e.target.value)}>
              <option value="">— Select —</option>
              <option value="true">Yes — has storefront</option>
              <option value="false">No storefront</option>
            </select>
          </div>
          {renovationField}
        </div>

        {/* Floor (optional for multi-story buildings) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Floor (if in building)</label>
            <input type="number" min="0" className={inputCls} value={fields.floor}
              onChange={(e) => set("floor", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Total Floors in Building</label>
            <input type="number" min="0" className={inputCls} value={fields.totalFloors}
              onChange={(e) => set("totalFloors", e.target.value)} />
          </div>
        </div>
      </div>
    );
  }

  // ── LAND ──────────────────────────────────────────────────────────────────
  if (type === "land") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Land Area m² / Hogi mas</label>
            <input type="number" min="0" className={inputCls} placeholder="e.g. 1000"
              value={fields.landArea} onChange={(e) => set("landArea", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Building Area m² (if any)</label>
            <input type="number" min="0" className={inputCls} placeholder="0 if empty land"
              value={fields.area} onChange={(e) => set("area", e.target.value)} />
          </div>
        </div>
      </div>
    );
  }

  // ── Fallback (unknown type) ───────────────────────────────────────────────
  return (
    <div className="grid grid-cols-3 gap-3">
      <div>
        <label className={labelCls}>Area m²</label>
        <input type="number" min="0" className={inputCls} value={fields.area}
          onChange={(e) => set("area", e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Bedrooms</label>
        <input type="number" min="0" className={inputCls} value={fields.bedrooms}
          onChange={(e) => set("bedrooms", e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Bathrooms</label>
        <input type="number" min="0" className={inputCls} value={fields.bathrooms}
          onChange={(e) => set("bathrooms", e.target.value)} />
      </div>
    </div>
  );
}
