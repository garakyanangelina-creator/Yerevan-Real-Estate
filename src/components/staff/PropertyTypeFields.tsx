"use client";

import { useTranslations } from "next-intl";

const inputCls =
  "w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm focus:border-gold-400 focus:outline-none dark:border-white/10 dark:bg-primary-800 dark:text-white";
const labelCls =
  "block text-xs font-semibold uppercase tracking-wide text-primary-500 dark:text-white/60 mb-1";

export interface TypeFields {
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
  landArea: string;
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
  const t = useTranslations("listing");

  function set<K extends keyof TypeFields>(key: K, value: string) {
    onChange({ [key]: value } as Partial<TypeFields>);
  }

  // ── Renovation (shared) ────────────────────────────────────────────────────
  const renovationField = (
    <div>
      <label className={labelCls}>{t("renovation")}</label>
      <select className={inputCls} value={fields.renovation} onChange={(e) => set("renovation", e.target.value)}>
        <option value="">{t("selectPlaceholder")}</option>
        <option value="new">{t("renovNew")}</option>
        <option value="euro">{t("renovEuro")}</option>
        <option value="good">{t("renovGood")}</option>
        <option value="cosmetic">{t("renovCosmetic")}</option>
        <option value="old">{t("renovOld")}</option>
      </select>
    </div>
  );

  // ── APARTMENT / OFFICE / STUDIO / PENTHOUSE ──────────────────────────────
  if (["apartment", "office", "studio", "penthouse"].includes(type)) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>{t("interiorArea")}</label>
            <input type="number" min="0" className={inputCls} value={fields.area}
              onChange={(e) => set("area", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t("bedrooms")}</label>
            <input type="number" min="0" className={inputCls} value={fields.bedrooms}
              onChange={(e) => set("bedrooms", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t("bathrooms")}</label>
            <input type="number" min="0" className={inputCls} value={fields.bathrooms}
              onChange={(e) => set("bathrooms", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>{t("floor")}</label>
            <input type="number" min="0" className={inputCls} value={fields.floor}
              onChange={(e) => set("floor", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t("totalFloors")}</label>
            <input type="number" min="0" className={inputCls} value={fields.totalFloors}
              onChange={(e) => set("totalFloors", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t("rooms")}</label>
            <select className={inputCls} value={fields.rooms} onChange={(e) => set("rooms", e.target.value)}>
              {["1","2","3","4","5","6","6+"].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t("buildingType")}</label>
            <select className={inputCls} value={fields.buildingType} onChange={(e) => set("buildingType", e.target.value)}>
              <option value="">{t("selectPlaceholder")}</option>
              <option value="panel">{t("buildingTypePanel")}</option>
              <option value="newBuilding">{t("buildingTypeNew")}</option>
              <option value="stone">{t("buildingTypeStone")}</option>
              <option value="monolith">{t("buildingTypeMonolith")}</option>
            </select>
          </div>
          {renovationField}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>{t("openBalcony")}</label>
            <select className={inputCls} value={fields.openBalcony} onChange={(e) => set("openBalcony", e.target.value)}>
              <option value="0">{t("none")}</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("closedBalcony")}</label>
            <select className={inputCls} value={fields.closedBalcony} onChange={(e) => set("closedBalcony", e.target.value)}>
              <option value="0">{t("none")}</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("ceilingHeight")}</label>
            <select className={inputCls} value={fields.ceilingHeight} onChange={(e) => set("ceilingHeight", e.target.value)}>
              <option value="">{t("anyPlaceholder")}</option>
              <option value="2.6">2.6 м</option>
              <option value="2.8">2.8 м</option>
              <option value="3.0">3.0 м</option>
              <option value="3.2">3.2 м</option>
              <option value="3.2+">3.2+ м</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>{t("view")}</label>
          <select className={inputCls} value={fields.view} onChange={(e) => set("view", e.target.value)}>
            <option value="">{t("anyPlaceholder")}</option>
            <option value="ararat">{t("viewArarat")}</option>
            <option value="city">{t("viewCity")}</option>
            <option value="garden">{t("viewGarden")}</option>
            <option value="street">{t("viewStreet")}</option>
            <option value="courtyard">{t("viewCourtyard")}</option>
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
          {t("houseAreaNote")}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t("houseArea")}</label>
            <input type="number" min="0" className={inputCls} placeholder="e.g. 200"
              value={fields.area} onChange={(e) => set("area", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t("landArea")}</label>
            <input type="number" min="0" className={inputCls} placeholder="e.g. 600"
              value={fields.landArea} onChange={(e) => set("landArea", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>{t("bedrooms")}</label>
            <input type="number" min="0" className={inputCls} value={fields.bedrooms}
              onChange={(e) => set("bedrooms", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t("bathrooms")}</label>
            <input type="number" min="0" className={inputCls} value={fields.bathrooms}
              onChange={(e) => set("bathrooms", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t("stories")}</label>
            <input type="number" min="1" max="10" className={inputCls} value={fields.totalFloors}
              onChange={(e) => set("totalFloors", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t("rooms")}</label>
            <select className={inputCls} value={fields.rooms} onChange={(e) => set("rooms", e.target.value)}>
              {["1","2","3","4","5","6","7","8","8+"].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          {renovationField}
        </div>

        <div>
          <label className={labelCls}>{t("view")}</label>
          <select className={inputCls} value={fields.view} onChange={(e) => set("view", e.target.value)}>
            <option value="">{t("anyPlaceholder")}</option>
            <option value="ararat">{t("viewArarat")}</option>
            <option value="city">{t("viewCity")}</option>
            <option value="garden">{t("viewGarden")}</option>
            <option value="street">{t("viewStreet")}</option>
            <option value="courtyard">{t("viewCourtyard")}</option>
          </select>
        </div>
      </div>
    );
  }

  // ── COMMERCIAL ────────────────────────────────────────────────────────────
  if (type === "commercial") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>{t("commercialArea")}</label>
            <input type="number" min="0" className={inputCls} placeholder="e.g. 80"
              value={fields.area} onChange={(e) => set("area", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t("sections")}</label>
            <input type="number" min="0" className={inputCls} value={fields.rooms}
              onChange={(e) => set("rooms", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t("restrooms")}</label>
            <input type="number" min="0" className={inputCls} value={fields.bathrooms}
              onChange={(e) => set("bathrooms", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t("streetLine")}</label>
            <select className={inputCls} value={fields.streetLine} onChange={(e) => set("streetLine", e.target.value)}>
              <option value="">{t("selectPlaceholder")}</option>
              <option value="first">{t("firstLine")}</option>
              <option value="second">{t("secondLine")}</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("commercialLevel")}</label>
            <select className={inputCls} value={fields.commercialLevel} onChange={(e) => set("commercialLevel", e.target.value)}>
              <option value="">{t("selectPlaceholder")}</option>
              <option value="basement">{t("basement")}</option>
              <option value="semi-basement">{t("semiBasement")}</option>
              <option value="ground">{t("groundFloor")}</option>
              <option value="upper">{t("upperFloor")}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t("storefront")}</label>
            <select className={inputCls} value={fields.storefront} onChange={(e) => set("storefront", e.target.value)}>
              <option value="">{t("selectPlaceholder")}</option>
              <option value="true">{t("yes")}</option>
              <option value="false">{t("no")}</option>
            </select>
          </div>
          {renovationField}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t("floor")}</label>
            <input type="number" min="0" className={inputCls} value={fields.floor}
              onChange={(e) => set("floor", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t("totalFloors")}</label>
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
            <label className={labelCls}>{t("landArea")}</label>
            <input type="number" min="0" className={inputCls} placeholder="e.g. 1000"
              value={fields.landArea} onChange={(e) => set("landArea", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t("buildingArea")}</label>
            <input type="number" min="0" className={inputCls} placeholder="0"
              value={fields.area} onChange={(e) => set("area", e.target.value)} />
          </div>
        </div>
      </div>
    );
  }

  // ── Fallback ───────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-3 gap-3">
      <div>
        <label className={labelCls}>{t("interiorArea")}</label>
        <input type="number" min="0" className={inputCls} value={fields.area}
          onChange={(e) => set("area", e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>{t("bedrooms")}</label>
        <input type="number" min="0" className={inputCls} value={fields.bedrooms}
          onChange={(e) => set("bedrooms", e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>{t("bathrooms")}</label>
        <input type="number" min="0" className={inputCls} value={fields.bathrooms}
          onChange={(e) => set("bathrooms", e.target.value)} />
      </div>
    </div>
  );
}
