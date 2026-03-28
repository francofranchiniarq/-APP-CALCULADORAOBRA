/* ═══════════════════════════════════════════════════════════════
   Module definitions — fields, defaults, and calculation logic
   for ObraCalc's 5 calculator modules + budget module metadata.

   Cada módulo fue diseñado pensando en el usuario real del rubro:
   1. Durlock/Steel Framer → optimización de placas, perfilería, aislación
   2. Plomero/Gasista → artefactos individuales, UD automáticas, ventilación
   3. Instalador HVAC → frigorías, consumo, comparación equipos
   4. Electricista matriculado → circuitos, protecciones, caño conduit
   5. Constructor/Encargado → dosificación, encofrado, alambre de atar
   ═══════════════════════════════════════════════════════════════ */

export const CALC_MODULES = [
  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 1 — CONSTRUCCIÓN EN SECO
  // Usuario: Instalador de Durlock / Steel Framing
  // Necesita: despiece preciso, optimizar corte de placas,
  //           saber kg de perfilería para flete, aislación incluida
  // ═══════════════════════════════════════════════════════════════
  {
    id: "seco",
    name: "Construcción en Seco",
    sub: "Steel Framing / Durlock",
    icon: "drywall",
    color: "#E0024E",
    fields: [
      { k: "largo", l: "Largo muro (m)", t: "n", d: 4 },
      { k: "alto", l: "Altura (m)", t: "n", d: 2.6 },
      { k: "aber", l: "Aberturas (m²)", t: "n", d: 0 },
      { k: "tipo", l: "Tipo tabique", t: "s", o: [
        { v: "simple", l: "Simple (70mm)" },
        { v: "doble", l: "Doble (150mm)" },
        { v: "cielorraso", l: "Cielorraso" },
        { v: "revestimiento", l: "Revestimiento" },
      ], d: "simple" },
      { k: "caras", l: "Caras de placa", t: "s", o: [{ v: 1, l: "Simple" }, { v: 2, l: "Doble" }], d: 2 },
      { k: "mod", l: "Modulación", t: "s", o: [{ v: 40, l: "40cm" }, { v: 60, l: "60cm" }], d: 40 },
      { k: "esp", l: "Espesor placa", t: "s", o: [
        { v: 9.5, l: "9.5mm (std)" },
        { v: 12.5, l: "12.5mm (std)" },
        { v: 15, l: "15mm (RF)" },
      ], d: 12.5 },
      { k: "aisl", l: "Aislación", t: "s", o: [
        { v: "ninguna", l: "Ninguna" },
        { v: "lv50", l: "Lana vidrio 50mm" },
        { v: "lv100", l: "Lana vidrio 100mm" },
        { v: "eps", l: "EPS 25mm" },
      ], d: "lv50" },
      { k: "desp", l: "Desperdicio %", t: "n", d: 10 },
    ],
    calc: (v) => {
      const s = v.largo * v.alto - v.aber;
      const sd = s * (1 + v.desp / 100);
      const placaArea = 2.88; // 1.20 x 2.40
      const cp = Math.ceil((sd * v.caras) / placaArea);
      const cm = Math.ceil(v.largo / (v.mod / 100)) + 1;
      const cs = Math.ceil(v.largo / 2.6) * 2;

      // Perfilería: montantes + soleras en kg (perfil 70mm ≈ 0.9 kg/ml, 150mm ≈ 1.4 kg/ml)
      const kgPerMl = v.tipo === "doble" ? 1.4 : v.tipo === "revestimiento" ? 0.55 : 0.9;
      const mlMontantes = cm * v.alto;
      const mlSoleras = cs * v.largo;
      const perfilKg = (mlMontantes + mlSoleras) * kgPerMl;

      // Aislación
      const aislM2 = v.aisl !== "ninguna" ? Math.ceil(s * 1.05) : 0;
      const aislRollos = v.aisl !== "ninguna" ? Math.ceil(aislM2 / (v.aisl === "eps" ? 2.88 : 15.36)) : 0;

      // Tornillos: T1 (placa-perfil) ≈ 28/placa, T2 (perfil-perfil) ≈ 4/montante,
      // Fix (clavos impacto a piso) ≈ c/60cm en solera
      const t1 = cp * 28;
      const t2 = cm * 4;
      const clavosImpacto = Math.ceil(v.largo / 0.6) * 2;

      // Masilla: tomado de juntas ≈ 0.4 kg/m², base completa ≈ 0.8 kg/m²
      const masillaJunta = Math.ceil(s * v.caras * 0.4);
      const masillaKg = Math.ceil(s * v.caras * 0.8);
      const masillaBolsas = Math.ceil(masillaKg / 15);

      // Cinta de papel ≈ juntas verticales + horizontales
      const juntasMl = cm * v.alto + Math.ceil(v.largo / 1.2) * v.largo;
      const cintaRollos = Math.ceil((s * 1.5) / 23);

      // Optimización de corte: placas enteras vs recortes
      const placasEnteras = Math.floor(s * v.caras / placaArea);
      const restoM2 = (sd * v.caras) - (placasEnteras * placaArea);
      const placasConCorte = Math.ceil(restoM2 / placaArea);

      // Notas profesionales
      const notes = [];
      if (v.mod == 60 && v.esp == 15) notes.push("Modulación 60cm con placa RF 15mm: verificar que la norma local permita esta combinación en tabiques resistentes al fuego.");
      if (v.alto > 3.2) notes.push("Altura > 3.20m: considerar refuerzos horizontales (travesaño a media altura) o perfilería de mayor espesor.");
      if (v.tipo === "doble" && v.aisl === "ninguna") notes.push("Tabique doble sin aislación: se pierde la ventaja acústica. Considerar al menos lana de vidrio 50mm.");
      if (v.tipo === "cielorraso") notes.push("Cielorraso: usar suspensión cada 1.20m máx. y verificar flecha admisible según luz.");
      if (v.aber > s * 0.4) notes.push("Alto porcentaje de aberturas: verificar refuerzos en dinteles y jambas.");

      return {
        big: cp, bigU: "placas",
        bigL: `${v.esp}mm · ${v.caras} cara${v.caras > 1 ? "s" : ""} · ${v.tipo}`,
        ring: Math.min(100, Math.round(sd / 50 * 100)),
        items: [
          { l: "Superficie neta", v: s.toFixed(1), u: "m²" },
          { l: `Montantes c/${v.mod}cm`, v: cm, u: "u" },
          { l: "Soleras (sup+inf)", v: cs, u: "u" },
          { l: "Placas enteras", v: placasEnteras, u: "u" },
          { l: "Placas con corte", v: placasConCorte, u: "u" },
          { l: "Tornillos T1 (placa)", v: t1, u: "u" },
          { l: "Tornillos T2 (perfil)", v: t2, u: "u" },
          { l: "Clavos impacto (piso)", v: clavosImpacto, u: "u" },
          { l: "Perfilería total", v: perfilKg.toFixed(0), u: "kg" },
          { l: "Cinta papel", v: cintaRollos, u: "rollos" },
          { l: "Masilla (tomado juntas)", v: masillaJunta, u: "kg" },
          { l: "Masilla (base completa)", v: masillaBolsas, u: "x 15kg" },
          ...(aislM2 > 0 ? [
            { l: `Aislante (${v.aisl === "eps" ? "EPS" : "Lana vidrio"})`, v: aislM2, u: "m²" },
            { l: "Aislante rollos/placas", v: aislRollos, u: "u" },
          ] : []),
        ],
        notes,
      };
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 2A — AGUA FRÍA Y CALIENTE
  // Usuario: Plomero / Instalador sanitario
  // Necesita: cómputo de caños por diámetro, accesorios, llaves,
  //           termofusión / epoxi / bronce, lista para el corralón
  // ═══════════════════════════════════════════════════════════════
  {
    id: "agua",
    name: "Agua Fría y Caliente",
    sub: "Termofusión · Epoxi · PPR",
    icon: "water",
    color: "#3B9AE1",
    fields: [
      { k: "inod", l: "Inodoros", t: "n", d: 2 },
      { k: "bid", l: "Bidets", t: "n", d: 1 },
      { k: "lav", l: "Lavatorios", t: "n", d: 2 },
      { k: "duc", l: "Duchas", t: "n", d: 1 },
      { k: "ban", l: "Bañeras", t: "n", d: 0 },
      { k: "pil", l: "Piletas cocina", t: "n", d: 1 },
      { k: "lavar", l: "Lavarropas", t: "n", d: 1 },
      { k: "calen", l: "Calefones / Termotanques", t: "n", d: 1 },
      { k: "tipoAgua", l: "Tipo cañería", t: "s", o: [
        { v: "termo", l: "Termofusión (PPR)" },
        { v: "epoxi", l: "Epoxi / Sigas" },
        { v: "bronce", l: "Bronce (refacción)" },
      ], d: "termo" },
      { k: "lonAgua", l: "Long. troncal (m)", t: "n", d: 12 },
      { k: "desvAgua", l: "Desvíos / subidas", t: "n", d: 4 },
    ],
    calc: (v) => {
      const dAguaArt = { inod: 20, bid: 15, lav: 15, duc: 20, ban: 20, pil: 15, lavar: 15, calen: 25 };
      const mlAguaArt = { inod: 1.5, bid: 1.5, lav: 1.2, duc: 2.0, ban: 2.5, pil: 1.5, lavar: 1.5, calen: 2.0 };
      const accAguaArt = {
        inod: [2,1,1,1], bid: [2,1,1,1], lav: [2,1,1,1], duc: [3,1,1,1],
        ban: [3,1,1,1], pil: [2,1,1,1], lavar: [2,1,1,0], calen: [4,2,2,2],
      };
      const artKeys = ["inod","bid","lav","duc","ban","pil","lavar","calen"];
      const artTotal = artKeys.reduce((s,k) => s + (v[k]||0), 0);
      const artSinCalen = artTotal - (v.calen||0);

      // Troncal
      const dTroncal = artSinCalen > 15 ? 32 : 25;
      const mlTroncal = v.lonAgua || 12;
      const mlPorDiam = {};
      mlPorDiam[String(dTroncal)] = mlTroncal;

      artKeys.forEach(k => {
        const n = v[k]||0; if (!n) return;
        const d = dAguaArt[k];
        mlPorDiam[String(d)] = (mlPorDiam[String(d)]||0) + n * mlAguaArt[k];
      });

      // Agua caliente
      const artConAC = (v.duc||0) + (v.ban||0) + (v.bid||0) + (v.lav||0) + (v.pil||0);
      mlPorDiam["20"] = (mlPorDiam["20"]||0) + artConAC * 1.8;
      const mlTotal = Object.values(mlPorDiam).reduce((s,ml) => s+ml, 0);

      // Accesorios
      let acc = { codos90: 0, tes: 0, cuplas: 0, llavePaso: 0 };
      artKeys.forEach(k => {
        const n = v[k]||0; if (!n) return;
        const a = accAguaArt[k];
        acc.codos90 += n*a[0]; acc.tes += n*a[1]; acc.cuplas += n*a[2]; acc.llavePaso += n*a[3];
      });
      acc.codos90 += (v.desvAgua||0) * 2;
      acc.tes += Math.ceil(artSinCalen * 0.6);
      acc.cuplas += Math.ceil(mlTroncal / 3);
      const tapones = acc.llavePaso + 2;

      // Fijación
      const tipoAgua = v.tipoAgua || "termo";
      const unionesRoscadas = tipoAgua === "bronce"
        ? acc.codos90 + acc.tes + acc.cuplas + acc.llavePaso : 0;
      const rollosTeflón = Math.max(tipoAgua === "bronce" ? 3 : 1, Math.ceil(unionesRoscadas / 15));
      const pomosSelladore = tipoAgua === "bronce" ? Math.max(1, Math.ceil(unionesRoscadas / 30)) : 0;
      const grampas = Math.ceil(mlTotal / 0.6);

      const notes = [];
      if (artSinCalen > 15) notes.push("Más de 15 artefactos: troncal recomendada ø32mm.");
      if (tipoAgua === "bronce") notes.push("Cañería bronce: usar sellador + teflón en todas las uniones roscadas.");
      if (tipoAgua === "termo") notes.push("Termofusión: usar termofusora calibrada. Fusión: ø20=5s, ø25=7s, ø32=8s.");
      if (tipoAgua === "epoxi") notes.push("Epoxi/Sigas: respetar tiempo de fraguado del adhesivo (mínimo 24h antes de presurizar).");
      notes.push("Presión de prueba agua: 6 kg/cm² durante 30 min. Sin caída.");

      return {
        big: Math.ceil(mlTotal), bigU: "ml", bigL: `Cañería total · ${artTotal} artefactos`,
        ring: Math.min(100, Math.round((mlTotal / 80) * 100)),
        items: [
          { l: "Artefactos totales", v: artTotal, u: "u", h: true },
          { l: `── CAÑERÍA (${tipoAgua === "termo" ? "Termofusión" : tipoAgua === "epoxi" ? "Epoxi" : "Bronce"}) ──`, v: "", u: "" },
          ...Object.entries(mlPorDiam)
            .filter(([,ml]) => ml > 0)
            .sort(([a],[b]) => Number(b) - Number(a))
            .map(([d,ml]) => ({ l: `Caño ø${d}mm`, v: Math.ceil(ml), u: "ml" })),
          { l: "Total cañería", v: Math.ceil(mlTotal), u: "ml", h: true },
          { l: "── ACCESORIOS ──", v: "", u: "" },
          { l: "Codos 90°", v: acc.codos90, u: "u" },
          { l: "Tes", v: acc.tes, u: "u" },
          { l: "Cuplas", v: acc.cuplas, u: "u" },
          { l: "Llaves de paso", v: acc.llavePaso, u: "u" },
          { l: "Tapones", v: tapones, u: "u" },
          { l: "── FIJACIÓN Y SELLADO ──", v: "", u: "" },
          { l: "Grampas", v: grampas, u: "u" },
          { l: "Rollos teflón", v: rollosTeflón, u: "u" },
          ...(pomosSelladore > 0 ? [{ l: "Sellador de roscas", v: pomosSelladore, u: "pomo" }] : []),
        ],
        notes,
      };
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 2B — SANITARIA (CLOACAL Y PLUVIAL)
  // Usuario: Plomero / Instalador sanitario
  // Necesita: UD, diámetros de troncal/montante/ventilación,
  //           bajada pluvial, accesorios PVC con adhesivo
  // ═══════════════════════════════════════════════════════════════
  {
    id: "cloacal",
    name: "Cloacal y Pluvial",
    sub: "Desagüe · PVC · Ventilación",
    icon: "plumbing",
    color: "#561820",
    fields: [
      { k: "inod", l: "Inodoros", t: "n", d: 2 },
      { k: "bid", l: "Bidets", t: "n", d: 1 },
      { k: "lav", l: "Lavatorios", t: "n", d: 2 },
      { k: "duc", l: "Duchas", t: "n", d: 1 },
      { k: "ban", l: "Bañeras", t: "n", d: 0 },
      { k: "pil", l: "Piletas cocina", t: "n", d: 1 },
      { k: "lavar", l: "Lavarropas", t: "n", d: 1 },
      { k: "lon", l: "Long. troncal (m)", t: "n", d: 15 },
      { k: "pisos", l: "Pisos", t: "n", d: 2 },
      { k: "supTecho", l: "Sup. techo (m²)", t: "n", d: 80 },
    ],
    calc: (v) => {
      const udTable = { inod: 4, bid: 2, lav: 2, duc: 3, ban: 4, pil: 3, lavar: 3 };
      const accDesArt = {
        inod: [1,0,1], bid: [1,1,1], lav: [1,1,1], duc: [1,0,1],
        ban: [1,0,1], pil: [2,1,1], lavar: [1,0,1],
      };
      const artKeys = ["inod","bid","lav","duc","ban","pil","lavar"];
      const artTotal = artKeys.reduce((s,k) => s + (v[k]||0), 0);
      const udTotal = artKeys.reduce((s,k) => s + (v[k]||0) * udTable[k], 0);

      const dCloac = udTotal <= 10 ? 63 : udTotal <= 30 ? 75 : udTotal <= 80 ? 110 : 160;
      const dMontante = v.pisos <= 2 ? 110 : 160;
      const dVent = dCloac <= 75 ? 50 : dCloac <= 110 ? 63 : 75;
      const dPluvial = v.supTecho <= 35 ? 63 : v.supTecho <= 70 ? 75 : v.supTecho <= 125 ? 110 : 160;

      // Metros PVC por diámetro
      const ml110 = v.lon + (v.pisos > 1 ? (v.pisos - 1) * 3 : 0);
      const ml63 = artTotal * 1.2;
      const ml50 = (v.lav||0) * 0.8 + (v.bid||0) * 0.8;
      const mlVent = v.pisos * 3 + 2;
      const mlPluvial = v.pisos * 3;
      const mlTotal = ml110 + ml63 + ml50 + mlVent + mlPluvial;

      // Accesorios
      let acc = { codos90: 0, codos45: 0, tees: 0 };
      artKeys.forEach(k => {
        const n = v[k]||0; if (!n) return;
        const a = accDesArt[k];
        acc.codos90 += n*a[0]; acc.codos45 += n*a[1]; acc.tees += n*a[2];
      });
      acc.codos90 += Math.ceil(v.lon / 4);
      acc.codos45 += v.pisos;
      acc.tees += Math.ceil(artTotal * 0.3);
      const curvInv = v.pisos > 1 ? v.pisos - 1 : 0;
      const piletasPiso = Math.max(v.pisos, Math.ceil(artTotal / 5));
      const sifones = (v.lav||0) + (v.pil||0) + (v.bid||0);
      const camaraInsp = Math.max(1, Math.ceil(v.lon / 10));

      // Fijación
      const unionesPVC = acc.codos90 + acc.codos45 + acc.tees + curvInv + piletasPiso;
      const latasAdhesivo = Math.max(1, Math.ceil(unionesPVC / 50));
      const grampas = Math.ceil(mlTotal / 0.8);

      const notes = [];
      if (udTotal > 80) notes.push("Más de 80 UD: considerar doble bajada o cámara intermedia.");
      if (v.pisos >= 4 && dMontante < 160) notes.push("Edificios 4+ pisos: montante mínimo 160mm y ventilación primaria obligatoria.");
      notes.push("Pendiente mínima: 1% (1cm por metro). Verificar con nivel antes de tapar.");
      notes.push("Cámaras de inspección cada 10m máx. y en cada cambio de dirección.");

      return {
        big: dCloac, bigU: "mm", bigL: `Troncal cloacal · ${udTotal} UD`,
        ring: Math.min(100, Math.round(dCloac / 160 * 100)),
        items: [
          { l: "Artefactos totales", v: artTotal, u: "u", h: true },
          { l: "Unid. descarga (UD)", v: udTotal, u: "UD", h: true },
          { l: "── DIÁMETROS ──", v: "", u: "" },
          { l: "Troncal cloacal", v: dCloac, u: "mm" },
          { l: "Montante", v: dMontante, u: "mm" },
          { l: "Ventilación", v: dVent, u: "mm" },
          { l: "Bajada pluvial", v: dPluvial, u: "mm" },
          { l: "── CAÑERÍA PVC ──", v: "", u: "" },
          { l: "PVC ø110mm", v: Math.ceil(ml110), u: "ml" },
          ...(ml63 > 0 ? [{ l: "PVC ø63mm", v: Math.ceil(ml63), u: "ml" }] : []),
          ...(ml50 > 0 ? [{ l: "PVC ø50mm", v: Math.ceil(ml50), u: "ml" }] : []),
          { l: "Ventilación PVC", v: Math.ceil(mlVent), u: "ml" },
          { l: "Pluvial PVC", v: Math.ceil(mlPluvial), u: "ml" },
          { l: "Total PVC", v: Math.ceil(mlTotal), u: "ml", h: true },
          { l: "── ACCESORIOS PVC ──", v: "", u: "" },
          { l: "Codos 90°", v: acc.codos90, u: "u" },
          { l: "Codos 45°", v: acc.codos45, u: "u" },
          { l: "Tees", v: acc.tees, u: "u" },
          { l: "Curvas inversas", v: curvInv, u: "u" },
          { l: "Piletas de piso", v: piletasPiso, u: "u" },
          { l: "Sifones", v: sifones, u: "u" },
          { l: "Cámaras inspección", v: camaraInsp, u: "u" },
          { l: "── FIJACIÓN ──", v: "", u: "" },
          { l: "Adhesivo PVC", v: latasAdhesivo, u: "lata" },
          { l: "Grampas", v: grampas, u: "u" },
        ],
        notes,
      };
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 2C — GAS
  // Usuario: Gasista matriculado
  // Necesita: Renouard, NAG 200, cómputo de accesorios de gas,
  //           ventilación, prueba de hermeticidad
  // ═══════════════════════════════════════════════════════════════
  {
    id: "gas",
    name: "Gas",
    sub: "NAG 200 · Renouard · Ventilación",
    icon: "gasflame",
    color: "#F5A623",
    fields: [
      { k: "gas", l: "Tipo gas", t: "s", o: [
        { v: "natural", l: "Natural" },
        { v: "envasado", l: "Envasado (GLP)" },
      ], d: "natural" },
      { k: "calen", l: "Calefones / Termotanques", t: "n", d: 1 },
      { k: "cocina", l: "Cocinas / Anafes", t: "n", d: 1 },
      { k: "calef", l: "Calefactores / Estufas", t: "n", d: 2 },
      { k: "hornoInd", l: "Hornos industriales", t: "n", d: 0 },
      { k: "cons", l: "Consumo total kcal/h", t: "n", d: 25000 },
      { k: "lonGas", l: "Long. cañería (m)", t: "n", d: 12 },
      { k: "desvGas", l: "Desvíos / subidas", t: "n", d: 3 },
      { k: "pisos", l: "Pisos", t: "n", d: 1 },
    ],
    calc: (v) => {
      const cons = Math.max(v.cons || 1, 1);
      const lonGas = Math.max(v.lonGas || 1, 1);
      const artGas = (v.calen||0) + (v.cocina||0) + (v.calef||0) + (v.hornoInd||0);

      // Renouard
      const f = v.gas === "natural" ? 0.001 : 0.0015;
      const pc = f * lonGas * Math.pow(cons / 1000, 1.82);

      // Diámetro por consumo
      const dGas = cons <= 4000 ? '1/2"' : cons <= 10000 ? '3/4"' : cons <= 30000 ? '1"' : cons <= 60000 ? '1 1/4"' : '1 1/2"';
      // Diámetro troncal
      const dTroncal = cons <= 10000 ? '3/4"' : cons <= 30000 ? '1"' : '1 1/4"';

      // Accesorios
      const codos = Math.ceil(lonGas / 3) + artGas * 2 + (v.desvGas||0);
      const tees = artGas;
      const cuplas = Math.ceil(lonGas / 6);
      const llaves = artGas + 1; // 1 general + 1 por artefacto
      const niples = artGas * 2 + Math.ceil(lonGas / 3);
      const flexibles = artGas; // 1 flexible por artefacto

      // Ventilación NAG 200
      const ventCm2 = v.gas === "natural"
        ? Math.max(150, Math.ceil(cons / 1000) * 15)
        : Math.max(200, Math.ceil(cons / 1000) * 20);
      const rejSup = Math.ceil(ventCm2 / 150);
      const rejInf = v.gas === "envasado" ? Math.ceil(ventCm2 / 150) : 0;

      // Conductos de evacuación (1 por artefacto con tiro)
      const artConTiro = (v.calen||0) + (v.calef||0);
      const conductos = artConTiro;
      const sombreretesH = artConTiro; // sombretes tipo H

      // Prueba hermeticidad
      const presion = v.gas === "natural" ? 20 : 30;
      const tiempo = lonGas <= 10 ? 15 : lonGas <= 30 ? 20 : 30;

      // Fijación
      const unionesRoscadas = codos + tees + cuplas + llaves + niples;
      const rollosTeflón = Math.max(2, Math.ceil(unionesRoscadas / 15));
      const pomosSelladore = Math.max(1, Math.ceil(unionesRoscadas / 30));
      const grampas = Math.ceil(lonGas / 0.8);

      const notes = [];
      if (pc > 2.5) notes.push(`Pérdida de carga ${pc.toFixed(1)} mbar elevada: verificar diámetro o reducir longitud.`);
      if (v.gas === "envasado" && (v.pisos||1) > 2) notes.push("Gas envasado en más de 2 pisos: requiere habilitación especial según NAG 200.");
      if (artConTiro > 0) notes.push(`${artConTiro} artefacto(s) con tiro: requieren conducto de evacuación individual y sombrete tipo H.`);
      notes.push(`Prueba hermeticidad: ${presion} mbar durante ${tiempo} min. Sin caída admisible.`);
      notes.push("Llave de paso general obligatoria antes del medidor. Llaves individuales antes de cada artefacto.");
      if (v.gas === "envasado") notes.push("Regulador de presión: verificar capacidad vs consumo total.");

      return {
        big: dGas, bigU: "", bigL: `${cons.toLocaleString()} kcal/h · PC ${pc.toFixed(2)} mbar`,
        ring: Math.min(100, Math.round(Math.min(pc / 3, 1) * 100)),
        items: [
          { l: "Artefactos a gas", v: artGas, u: "u", h: true },
          { l: "Consumo total", v: cons.toLocaleString(), u: "kcal/h", h: true },
          { l: "Pérdida de carga", v: pc.toFixed(3), u: "mbar", h: true },
          { l: "── CAÑERÍA ──", v: "", u: "" },
          { l: "Diámetro derivaciones", v: dGas, u: "" },
          { l: "Diámetro troncal", v: dTroncal, u: "" },
          { l: "Longitud total", v: lonGas, u: "ml" },
          { l: "── ACCESORIOS ──", v: "", u: "" },
          { l: "Codos", v: codos, u: "u" },
          { l: "Tes", v: tees, u: "u" },
          { l: "Cuplas", v: cuplas, u: "u" },
          { l: "Niples", v: niples, u: "u" },
          { l: "Llaves de paso", v: llaves, u: "u" },
          { l: "Flexibles", v: flexibles, u: "u" },
          { l: "── VENTILACIÓN NAG 200 ──", v: "", u: "" },
          { l: "Área ventilación", v: ventCm2, u: "cm²" },
          { l: "Rejillas superiores (VDAS)", v: rejSup, u: "u" },
          ...(rejInf > 0 ? [{ l: "Rejillas inferiores (VDAI)", v: rejInf, u: "u" }] : []),
          ...(conductos > 0 ? [
            { l: "Conductos evacuación", v: conductos, u: "u" },
            { l: "Sombretes tipo H", v: sombreretesH, u: "u" },
          ] : []),
          { l: "── FIJACIÓN Y SELLADO ──", v: "", u: "" },
          { l: "Rollos teflón", v: rollosTeflón, u: "u" },
          { l: "Sellador de roscas", v: pomosSelladore, u: "pomo" },
          { l: "Grampas", v: grampas, u: "u" },
        ],
        notes,
      };
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 3 — TERMOMECÁNICO
  // Usuario: Instalador de calefacción / HVAC / Gasista calefaccionista
  // Necesita: frigorías + kcal, comparar equipos (radiador vs split),
  //           consumo mensual estimado, considerar orientación,
  //           renovaciones de aire, carga de refrigeración verano
  // ═══════════════════════════════════════════════════════════════
  {
    id: "termo",
    name: "Termomecánico",
    sub: "Balance Térmico",
    icon: "thermo",
    color: "#E0024E",
    fields: [
      { k: "sup", l: "Superficie (m²)", t: "n", d: 20 },
      { k: "alt", l: "Altura (m)", t: "n", d: 2.7 },
      { k: "zona", l: "Zona bioclimática", t: "s", o: [
        { v: "Ia", l: "Ia - Muy cálida" },
        { v: "Ib", l: "Ib - Cálida" },
        { v: "IIa", l: "IIa - Cálida templada" },
        { v: "IIb", l: "IIb - Templada cálida" },
        { v: "IIIa", l: "IIIa - Templada" },
        { v: "IIIb", l: "IIIb - Templada fría" },
        { v: "IVa", l: "IVa - Fría" },
        { v: "IVb", l: "IVb - Fría severa" },
        { v: "V", l: "V - Muy fría" },
        { v: "VI", l: "VI - Polar" },
      ], d: "IIIa" },
      { k: "aisl", l: "Aislación", t: "s", o: [
        { v: "buena", l: "Buena (DVH + EPS)" },
        { v: "media", l: "Media (vidrio simple)" },
        { v: "mala", l: "Mala (sin aislación)" },
      ], d: "media" },
      { k: "orient", l: "Orientación", t: "s", o: [
        { v: "N", l: "Norte" },
        { v: "S", l: "Sur" },
        { v: "E", l: "Este" },
        { v: "O", l: "Oeste" },
      ], d: "S" },
      { k: "vid", l: "Sup. vidriada (m²)", t: "n", d: 3 },
      { k: "renov", l: "Renovaciones aire/h", t: "s", o: [
        { v: 0.5, l: "0.5 (estanco)" },
        { v: 1, l: "1 (normal)" },
        { v: 1.5, l: "1.5 (ventilado)" },
        { v: 2, l: "2 (alto tránsito)" },
      ], d: 1 },
      { k: "equipo", l: "Tipo equipo", t: "s", o: [
        { v: "radiador", l: "Radiadores" },
        { v: "split", l: "Split frío/calor" },
        { v: "losa", l: "Losa radiante" },
        { v: "estufa", l: "Estufa tiro balanceado" },
      ], d: "radiador" },
    ],
    calc: (v) => {
      // Factor zona bioclimática (kcal/h por m²)
      const fzonas = {
        "Ia": 60, "Ib": 70, "IIa": 80, "IIb": 90, "IIIa": 100, "IIIb": 110,
        "IVa": 130, "IVb": 145, "V": 160, "VI": 180,
      };
      const fa = { buena: 0.85, media: 1, mala: 1.25 };
      const forient = { N: 0.9, S: 1.1, E: 1.0, O: 1.05 };

      const fz = fzonas[v.zona] || 100;
      const vol = v.sup * v.alt;

      // Carga térmica calefacción
      const qMuros = v.sup * fz * fa[v.aisl] * forient[v.orient];
      const qVidrio = v.vid * 180 * fa[v.aisl]; // vidrio pierde más
      const qRenov = vol * v.renov * 0.29 * 20; // 20°C delta T promedio, 0.29 kcal/m³°C
      const ctCalef = Math.round(qMuros + qVidrio + qRenov);

      // Carga refrigeración (frigorías ≈ kcal * 1.2 por radiación solar)
      const fSolar = { N: 1.4, S: 1.0, E: 1.2, O: 1.3 };
      const ctRefrig = Math.round(ctCalef * fSolar[v.orient]);
      const btu = Math.round(ctCalef * 3.968);
      const frigW = Math.round(ctRefrig * 1.163); // frigorías a watts

      // Equipos según tipo
      let equipoItems = [];
      if (v.equipo === "radiador") {
        const cr = Math.ceil(ctCalef / 1200);
        const elemPorRad = Math.ceil(ctCalef / cr / 120);
        const caldera = (ctCalef * 1.15 / 1000);
        equipoItems = [
          { l: "Radiadores", v: cr, u: "u" },
          { l: "Elementos/radiador", v: elemPorRad, u: "elem" },
          { l: "Caldera mínima", v: caldera.toFixed(1), u: "Mcal/h" },
          { l: "Caño calefacción", v: ctCalef <= 8000 ? '3/4"' : '1"', u: "" },
        ];
      } else if (v.equipo === "split") {
        const splitBTU = btu;
        const tipoSplit = splitBTU <= 9000 ? "2250 fg (9000 BTU)" :
          splitBTU <= 12000 ? "3000 fg (12000 BTU)" :
          splitBTU <= 18000 ? "4500 fg (18000 BTU)" :
          splitBTU <= 24000 ? "6000 fg (24000 BTU)" : "9000 fg (36000 BTU)";
        const consumoElec = (splitBTU / 12000 * 1.2).toFixed(1); // kW aprox
        equipoItems = [
          { l: "Split recomendado", v: tipoSplit, u: "" },
          { l: "Consumo eléctrico", v: consumoElec, u: "kW" },
          { l: "Circuito eléctrico", v: parseFloat(consumoElec) <= 2 ? "TUG 2.5mm²" : "TUE 4mm²", u: "" },
        ];
      } else if (v.equipo === "losa") {
        const mlCano = Math.ceil(v.sup / 0.15); // caños cada 15cm
        const caldera = (ctCalef * 1.2 / 1000);
        equipoItems = [
          { l: "Caño PEX/PERT", v: mlCano, u: "ml" },
          { l: "Caldera mínima", v: caldera.toFixed(1), u: "Mcal/h" },
          { l: "Espesor aislante piso", v: "30", u: "mm EPS" },
          { l: "Colectores", v: Math.ceil(v.sup / 15), u: "circuitos" },
        ];
      } else { // estufa
        const potEstufa = Math.ceil(ctCalef / 1000) * 1000;
        equipoItems = [
          { l: "Estufa TB mínima", v: (potEstufa / 1000).toFixed(0), u: "Mcal/h" },
          { l: "Tiraje", v: potEstufa <= 5000 ? "100mm" : "150mm", u: "" },
        ];
      }

      // Consumo mensual estimado (8h/día, 30 días)
      const gasM3mes = v.equipo !== "split" ? (ctCalef / 8000 * 8 * 30).toFixed(0) : "—";
      const elecKwhMes = v.equipo === "split" ? (btu / 12000 * 1.2 * 8 * 30).toFixed(0) : "—";

      const notes = [];
      if (v.orient === "S" && v.aisl === "mala") notes.push("Orientación Sur + mala aislación: la carga térmica es muy alta. Priorizar DVH y aislación de muros.");
      if (v.vid > v.sup * 0.4) notes.push("Superficie vidriada > 40% del ambiente: considerar DVH o triple vidriado para reducir pérdidas.");
      if (v.equipo === "losa" && v.aisl === "mala") notes.push("Losa radiante con mala aislación: la inercia térmica alta combinada con pérdidas altas genera respuesta lenta e ineficiente.");
      if (v.zona === "V" || v.zona === "VI") notes.push("Zona muy fría/polar: verificar cumplimiento IRAM 11603 para transmitancia máxima de muros y techos.");

      return {
        big: ctCalef, bigU: "kcal/h", bigL: `Calefacción · ${v.equipo}`,
        ring: Math.min(100, Math.round(ctCalef / 8000 * 100)),
        items: [
          { l: "Volumen ambiente", v: vol.toFixed(1), u: "m³" },
          { l: "Carga calefacción", v: ctCalef.toLocaleString("es-AR"), u: "kcal/h" },
          { l: "Carga refrigeración", v: ctRefrig.toLocaleString("es-AR"), u: "fg/h" },
          { l: "Equivalente BTU", v: btu.toLocaleString("es-AR"), u: "BTU" },
          { l: "Equivalente watts", v: frigW.toLocaleString("es-AR"), u: "W" },
          ...equipoItems,
          { l: "Consumo gas mensual", v: gasM3mes, u: "m³/mes" },
          { l: "Consumo eléc. mensual", v: elecKwhMes, u: "kWh/mes" },
        ],
        notes,
      };
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 4 — ELÉCTRICO
  // Usuario: Electricista matriculado
  // Necesita: sección por caída de tensión Y por capacidad,
  //           protección termomagnética + diferencial,
  //           sección de cable tierra, diámetro caño conduit,
  //           tipo de circuito, múltiples bocas
  // ═══════════════════════════════════════════════════════════════
  {
    id: "electrico",
    name: "Eléctrico",
    sub: "Conductores y Luz",
    icon: "electric",
    color: "#74777F",
    fields: [
      { k: "circuito", l: "Tipo circuito", t: "s", o: [
        { v: "ilum", l: "Iluminación" },
        { v: "tug", l: "Tomacorrientes (TUG)" },
        { v: "tue", l: "Toma especial (TUE)" },
        { v: "motor", l: "Motor" },
      ], d: "tug" },
      { k: "pot", l: "Potencia (W)", t: "n", d: 3500 },
      { k: "ten", l: "Tensión", t: "s", o: [{ v: 220, l: "220V mono" }, { v: 380, l: "380V tri" }], d: 220 },
      { k: "fp", l: "Factor potencia", t: "s", o: [
        { v: 1, l: "1.0 (resistivo)" },
        { v: 0.85, l: "0.85 (inductivo)" },
        { v: 0.9, l: "0.9 (motor)" },
      ], d: 1 },
      { k: "lon", l: "Longitud (m)", t: "n", d: 25 },
      { k: "cai", l: "Caída máx %", t: "n", d: 3 },
      { k: "bocas", l: "Cantidad bocas", t: "n", d: 6 },
      { k: "slum", l: "Sup. iluminar m²", t: "n", d: 20 },
      { k: "lux", l: "Lux requeridos", t: "s", o: [
        { v: 100, l: "100 (pasillo)" },
        { v: 150, l: "150 (dormitorio)" },
        { v: 300, l: "300 (oficina)" },
        { v: 500, l: "500 (cocina/taller)" },
        { v: 750, l: "750 (detalle)" },
      ], d: 300 },
    ],
    calc: (v) => {
      const I = v.pot / (v.ten * v.fp);

      // Sección por caída de tensión
      const scCaida = (2 * v.lon * I) / (56 * (v.cai / 100) * v.ten);
      // Sección por capacidad (corriente admisible según tabla)
      const tablaCapacidad = [
        { s: 1.5, iMax: 15 }, { s: 2.5, iMax: 21 }, { s: 4, iMax: 27 },
        { s: 6, iMax: 36 }, { s: 10, iMax: 50 }, { s: 16, iMax: 68 },
        { s: 25, iMax: 89 }, { s: 35, iMax: 110 },
      ];
      const sPorCaida = [1.5, 2.5, 4, 6, 10, 16, 25, 35].find((x) => x >= scCaida) || 35;
      const sPorCapacidad = tablaCapacidad.find((x) => x.iMax >= I)?.s || 35;
      const s = Math.max(sPorCaida, sPorCapacidad);

      // Sección mínima por tipo de circuito (norma AEA 90364)
      const sMinCircuito = { ilum: 1.5, tug: 2.5, tue: 4, motor: 2.5 };
      const sFinal = Math.max(s, sMinCircuito[v.circuito]);

      const cr = ((2 * v.lon * I) / (56 * sFinal * v.ten)) * 100;

      // Protección termomagnética
      const iNomTerm = [6, 10, 16, 20, 25, 32, 40, 50, 63].find((x) => x >= I) || 63;
      // Verificar que Iz cable > In termomagnética
      const izCable = tablaCapacidad.find((x) => x.s === sFinal)?.iMax || 110;

      // Protección diferencial
      const iDif = iNomTerm <= 25 ? 25 : iNomTerm <= 40 ? 40 : 63;
      const sensibilidad = v.circuito === "ilum" || v.circuito === "tug" ? 30 : 300; // mA

      // Cable tierra: misma sección hasta 16mm², luego mitad
      const sTierra = sFinal <= 16 ? sFinal : Math.max(16, sFinal / 2);

      // Caño conduit: según cantidad de cables y sección
      const nCables = v.ten === 380 ? 5 : 3; // F+N+T o 3F+N+T
      const areaCables = nCables * (Math.PI * Math.pow(Math.sqrt(sFinal / Math.PI) + 0.4, 2));
      const dCano = areaCables <= 78 ? 20 : areaCables <= 176 ? 25 : areaCables <= 314 ? 32 : 40;

      // Cable metros: longitud * cantidad de conductores
      const cableMl = Math.ceil(v.lon * nCables * 1.1); // +10% por curvas

      // Luminotecnia
      const pl = Math.ceil((v.lux / 100) * v.slum);
      const ledsCount = Math.ceil(pl / 40);
      const luxReal = Math.round((ledsCount * 40 * 100) / v.slum);

      // Bocas: cable adicional entre bocas (estimado 3m entre bocas)
      const cableEntreBocas = v.bocas * 3 * nCables;

      const notes = [];
      if (cr > v.cai * 0.9) notes.push(`Caída de tensión ${cr.toFixed(2)}% cercana al límite ${v.cai}%. Considerar subir sección.`);
      if (iNomTerm > izCable) notes.push("La corriente nominal de la termomagnética supera la Iz del cable. Subir sección de conductor.");
      if (v.circuito === "tug" && v.bocas > 15) notes.push("Máximo 15 bocas por circuito TUG según AEA 90364. Dividir en 2 circuitos.");
      if (v.circuito === "ilum" && v.bocas > 15) notes.push("Máximo 15 bocas por circuito de iluminación. Considerar dividir.");
      if (v.circuito === "tue") notes.push("Circuito TUE: dedicado a un solo electrodoméstico (horno, A/A, calefón). No compartir.");
      if (v.ten === 380) notes.push("Circuito trifásico: verificar equilibrado de fases en tablero general.");

      return {
        big: sFinal, bigU: "mm²", bigL: `${v.circuito.toUpperCase()} · ${I.toFixed(1)}A`,
        ring: Math.min(100, Math.round(cr / v.cai * 100)),
        items: [
          { l: "Corriente nominal", v: I.toFixed(2), u: "A" },
          { l: "Sección por caída", v: sPorCaida, u: "mm²" },
          { l: "Sección por capacidad", v: sPorCapacidad, u: "mm²" },
          { l: "Sección adoptada", v: sFinal, u: "mm²" },
          { l: "Caída real", v: cr.toFixed(2), u: "%" },
          { l: "Termomagnética", v: iNomTerm, u: "A" },
          { l: "Iz cable", v: izCable, u: "A" },
          { l: "Diferencial", v: `${iDif}A / ${sensibilidad}mA`, u: "" },
          { l: "Cable tierra", v: sTierra, u: "mm²" },
          { l: "Caño conduit", v: dCano, u: "mm" },
          { l: "Cable total estimado", v: cableMl + cableEntreBocas, u: "ml" },
          { l: "Potencia lumínica", v: pl, u: "W" },
          { l: "Artefactos LED 40W", v: ledsCount, u: "u" },
          { l: "Lux reales", v: luxReal, u: "lux" },
        ],
        notes,
      };
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 5 — ESTRUCTURAS Y LOGÍSTICA
  // Usuario: Constructor / Encargado de obra / Jefe de obra
  // Necesita: dosificación del hormigón, kg de cemento para compra,
  //           encofrado (m² de tabla/fenólico), alambre de atar,
  //           separadores, cálculo de acopio, tiempo de desencofrado
  // ═══════════════════════════════════════════════════════════════
  {
    id: "estruct",
    name: "Estructuras",
    sub: "Hormigón y Acero",
    icon: "structure",
    color: "#561820",
    fields: [
      { k: "luz", l: "Luz viga (m)", t: "n", d: 5 },
      { k: "carga", l: "Carga", t: "s", o: [
        { v: 400, l: "400 kg/m² (vivienda)" },
        { v: 600, l: "600 kg/m² (oficina)" },
        { v: 1000, l: "1000 kg/m² (depósito)" },
      ], d: 400 },
      { k: "hTipo", l: "Tipo hormigón", t: "s", o: [
        { v: "H17", l: "H-17 (bases, contrapisos)" },
        { v: "H21", l: "H-21 (losas, vigas)" },
        { v: "H25", l: "H-25 (columnas, fund.)" },
        { v: "H30", l: "H-30 (especial)" },
      ], d: "H21" },
      { k: "espL", l: "Espesor losa", t: "s", o: [
        { v: 12, l: "12cm" }, { v: 15, l: "15cm" },
        { v: 20, l: "20cm" }, { v: 25, l: "25cm" },
      ], d: 15 },
      { k: "supH", l: "Superficie (m²)", t: "n", d: 100 },
      { k: "mix", l: "Mixer", t: "s", o: [
        { v: 4, l: "4 m³" }, { v: 6, l: "6 m³" }, { v: 8, l: "8 m³" },
      ], d: 6 },
      { k: "acTipo", l: "Tipo acero", t: "s", o: [
        { v: "ADN420", l: "ADN 420 (nervurado)" },
        { v: "AL220", l: "AL 220 (liso)" },
      ], d: "ADN420" },
      { k: "dBarra", l: "Diámetro barra ppal", t: "s", o: [
        { v: 8, l: "Ø8" }, { v: 10, l: "Ø10" },
        { v: 12, l: "Ø12" }, { v: 16, l: "Ø16" },
        { v: 20, l: "Ø20" }, { v: 25, l: "Ø25" },
      ], d: 12 },
      { k: "desp", l: "Desperdicio %", t: "n", d: 5 },
    ],
    calc: (v) => {
      // Predimensionado viga
      const hViga = v.luz / 12;
      const bViga = hViga / 2;

      // Volumen hormigón
      const vLosa = (v.supH * v.espL) / 100;
      const vt = vLosa * (1 + v.desp / 100);

      // Dosificación por m³ según tipo
      const dosif = {
        H17: { cemento: 280, arena: 0.49, piedra: 0.69, agua: 185 },
        H21: { cemento: 330, arena: 0.46, piedra: 0.67, agua: 180 },
        H25: { cemento: 380, arena: 0.43, piedra: 0.65, agua: 175 },
        H30: { cemento: 420, arena: 0.40, piedra: 0.63, agua: 170 },
      };
      const d = dosif[v.hTipo];
      const cementoTotal = Math.ceil(d.cemento * vt);
      const bolsasCemento = Math.ceil(cementoTotal / 50);
      const arenaTotal = (d.arena * vt).toFixed(1);
      const piedraTotal = (d.piedra * vt).toFixed(1);
      const aguaTotal = Math.ceil(d.agua * vt);

      // Cuantía de acero
      const cuantiaMin = v.acTipo === "ADN420" ? 0.003 : 0.005;
      const aceroKg = Math.round(vt * 7850 * cuantiaMin);

      // Peso por metro lineal de barra (kg/m = d² * 0.00617)
      const pesoMl = v.dBarra * v.dBarra * 0.00617;
      const mlBarra = aceroKg / pesoMl;
      const barras12m = Math.ceil(mlBarra / 12);

      // Alambre de atar: ≈ 1.5% del peso del acero
      const alambreKg = (aceroKg * 0.015).toFixed(1);

      // Separadores: ≈ 4 por m² de losa
      const separadores = Math.ceil(v.supH * 4);

      // Encofrado: lateral de vigas + fondo de losa si aplica
      // Perímetro de losa * alto = encofrado lateral
      const perimetroAprox = Math.sqrt(v.supH) * 4; // estimado cuadrado
      const encofradoLateral = (perimetroAprox * (v.espL / 100)).toFixed(1);
      // Fenólico: placas de 1.22 x 2.44 = 2.98 m²
      const fenolicoPlacas = Math.ceil(parseFloat(encofradoLateral) / 2.98);

      // Puntales: 1 cada 1.5m² de losa aprox
      const puntales = Math.ceil(v.supH / 1.5);

      // Tiempo desencofrado estimado (días)
      const diasDesencofrado = v.espL <= 15 ? 14 : v.espL <= 20 ? 21 : 28;

      // Mixers
      const mixers = Math.ceil(vt / v.mix);

      const notes = [];
      if (v.luz > 8) notes.push("Luz > 8m: el predimensionado L/12 es orientativo. Requiere cálculo estructural.");
      if (v.hTipo === "H17" && v.carga > 400) notes.push("H-17 no es apto para cargas de servicio > 400 kg/m². Usar H-21 mínimo.");
      if (mixers > 3) notes.push(`${mixers} mixers: coordinar con hormigonera intervalo de llegada (≈ 30 min). Prever vibrador y personal suficiente.`);
      if (vt > 30) notes.push("Volumen > 30m³: considerar bomba de hormigón para optimizar tiempos de colado.");
      notes.push(`Desencofrado estimado: ${diasDesencofrado} días (clima normal, sin acelerante).`);

      return {
        big: vt.toFixed(1), bigU: "m³", bigL: `${v.hTipo} · Ø${v.dBarra}`,
        ring: Math.min(100, Math.round(vt / 30 * 100)),
        items: [
          { l: "Viga h (predim.)", v: (hViga * 100).toFixed(0), u: "cm" },
          { l: "Viga b (predim.)", v: (bViga * 100).toFixed(0), u: "cm" },
          { l: "Vol. losa neto", v: vLosa.toFixed(1), u: "m³" },
          { l: "Vol. con desperdicio", v: vt.toFixed(1), u: "m³" },
          { l: `Mixers (${v.mix}m³)`, v: mixers, u: "u" },
          { l: "Cemento", v: cementoTotal, u: "kg" },
          { l: "Bolsas cemento 50kg", v: bolsasCemento, u: "u" },
          { l: "Arena", v: arenaTotal, u: "m³" },
          { l: "Piedra", v: piedraTotal, u: "m³" },
          { l: "Agua", v: aguaTotal, u: "lts" },
          { l: `Acero ${v.acTipo}`, v: aceroKg, u: "kg" },
          { l: `Barras Ø${v.dBarra} (12m)`, v: barras12m, u: "u" },
          { l: "Alambre de atar", v: alambreKg, u: "kg" },
          { l: "Separadores", v: separadores, u: "u" },
          { l: "Encofrado lateral", v: encofradoLateral, u: "m²" },
          { l: "Fenólico (placas)", v: fenolicoPlacas, u: "u" },
          { l: "Puntales", v: puntales, u: "u" },
        ],
        notes,
      };
    },
  },
  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 6 — CRONOGRAMA DE OBRA (GANTT)
  // Usuario: Jefe de obra / Director / Contratista
  // Necesita: planificar etapas, estimar duración total,
  //           calcular solapamientos, identificar ruta crítica
  // ═══════════════════════════════════════════════════════════════
  {
    id: "gantt",
    name: "Cronograma de Obra",
    sub: "Gantt · Etapas · Ruta Crítica",
    icon: "gantt",
    color: "#E0024E",
    fields: [
      { k: "supTotal", l: "Superficie total (m²)", t: "n", d: 200 },
      { k: "pisos", l: "Pisos", t: "n", d: 2 },
      { k: "tipoObra", l: "Tipo de obra", t: "s", o: [
        { v: "vivienda", l: "Vivienda unifamiliar" },
        { v: "edificio", l: "Edificio (PB+pisos)" },
        { v: "comercial", l: "Local comercial" },
        { v: "refaccion", l: "Refacción / Ampliación" },
      ], d: "vivienda" },
      { k: "inclEst", l: "Estructura", t: "s", o: [{ v: 1, l: "Sí" }, { v: 0, l: "No" }], d: 1 },
      { k: "inclSan", l: "Sanitaria + Agua + Gas", t: "s", o: [{ v: 1, l: "Sí" }, { v: 0, l: "No" }], d: 1 },
      { k: "inclElec", l: "Eléctrica", t: "s", o: [{ v: 1, l: "Sí" }, { v: 0, l: "No" }], d: 1 },
      { k: "inclSeco", l: "Construcción en seco", t: "s", o: [{ v: 1, l: "Sí" }, { v: 0, l: "No" }], d: 0 },
      { k: "inclTermo", l: "Termomecánico (HVAC)", t: "s", o: [{ v: 1, l: "Sí" }, { v: 0, l: "No" }], d: 0 },
      { k: "equipoSize", l: "Tamaño del equipo", t: "s", o: [
        { v: "chico", l: "Chico (2-4 personas)" },
        { v: "medio", l: "Medio (5-10 personas)" },
        { v: "grande", l: "Grande (10+ personas)" },
      ], d: "medio" },
    ],
    calc: (v) => {
      // Factor de duración por tamaño de equipo
      const equipoFactor = { chico: 1.5, medio: 1.0, grande: 0.7 };
      const ef = equipoFactor[v.equipoSize] || 1;

      // Factor por tipo de obra
      const tipoFactor = { vivienda: 1, edificio: 1.3, comercial: 0.8, refaccion: 0.6 };
      const tf = tipoFactor[v.tipoObra] || 1;

      // Factor por superficie (cada 100m² adicionales suma ~30% de duración base)
      const supFactor = 1 + ((v.supTotal - 100) / 100) * 0.3;
      const sf = Math.max(0.5, supFactor);

      // Factor por pisos
      const pisosFactor = 1 + (v.pisos - 1) * 0.25;

      // ── Etapas base (días hábiles para 200m², equipo medio) ──
      const etapas = [];
      let diaAcum = 0;

      // Etapa 1: Trabajos preliminares (siempre)
      const durPrelim = Math.ceil(5 * tf * ef);
      etapas.push({ nombre: "Trabajos preliminares", inicio: diaAcum, dur: durPrelim, tipo: "prelim" });
      diaAcum += durPrelim;

      // Etapa 2: Excavación y fundaciones (siempre)
      const durExcav = Math.ceil(10 * sf * ef * pisosFactor);
      etapas.push({ nombre: "Excavación y fundaciones", inicio: diaAcum, dur: durExcav, tipo: "estructura" });
      diaAcum += durExcav;

      // Etapa 3: Estructura (si aplica)
      if (Number(v.inclEst)) {
        const durEst = Math.ceil(20 * sf * ef * pisosFactor);
        etapas.push({ nombre: "Estructura (H°A°)", inicio: diaAcum, dur: durEst, tipo: "estructura" });
        diaAcum += durEst;
      }

      // Etapa 4: Mampostería / Cerramientos
      const durMamp = Math.ceil(15 * sf * ef);
      etapas.push({ nombre: "Mampostería y cerramientos", inicio: diaAcum, dur: durMamp, tipo: "albañil" });

      // Instalaciones solapadas con mampostería (arrancan al 30% de la mampostería)
      const inicioInst = diaAcum + Math.ceil(durMamp * 0.3);

      if (Number(v.inclSan)) {
        const durSan = Math.ceil(12 * sf * ef);
        etapas.push({ nombre: "Inst. sanitaria + agua + gas", inicio: inicioInst, dur: durSan, tipo: "instalacion" });
      }
      if (Number(v.inclElec)) {
        const durElec = Math.ceil(10 * sf * ef);
        etapas.push({ nombre: "Inst. eléctrica", inicio: inicioInst, dur: durElec, tipo: "instalacion" });
      }
      diaAcum += durMamp;

      // Etapa: Construcción en seco (después de mampostería)
      if (Number(v.inclSeco)) {
        const durSeco = Math.ceil(10 * sf * ef);
        etapas.push({ nombre: "Construcción en seco", inicio: diaAcum, dur: durSeco, tipo: "seco" });
        diaAcum += durSeco;
      }

      // Etapa: Revoques y contrapisos
      const durRevoque = Math.ceil(12 * sf * ef);
      etapas.push({ nombre: "Revoques y contrapisos", inicio: diaAcum, dur: durRevoque, tipo: "albañil" });
      diaAcum += durRevoque;

      // Etapa: Pisos y revestimientos
      const durPisos = Math.ceil(10 * sf * ef);
      etapas.push({ nombre: "Pisos y revestimientos", inicio: diaAcum, dur: durPisos, tipo: "terminacion" });

      // Etapa: HVAC (solapado con terminaciones)
      if (Number(v.inclTermo)) {
        const durTermo = Math.ceil(8 * sf * ef);
        etapas.push({ nombre: "Termomecánico (HVAC)", inicio: diaAcum, dur: durTermo, tipo: "instalacion" });
      }
      diaAcum += durPisos;

      // Etapa: Pintura y terminaciones
      const durPintura = Math.ceil(8 * sf * ef);
      etapas.push({ nombre: "Pintura y terminaciones", inicio: diaAcum, dur: durPintura, tipo: "terminacion" });
      diaAcum += durPintura;

      // Etapa: Limpieza final
      const durLimpieza = Math.ceil(3 * ef);
      etapas.push({ nombre: "Limpieza final y entrega", inicio: diaAcum, dur: durLimpieza, tipo: "prelim" });
      diaAcum += durLimpieza;

      // Duración total (ruta crítica = fin máximo de todas las etapas)
      const finMax = Math.max(...etapas.map(e => e.inicio + e.dur));
      const semanas = Math.ceil(finMax / 5); // semanas hábiles
      const meses = (finMax / 22).toFixed(1); // meses hábiles (~22 días/mes)

      // Items para el resultado
      const items = [
        { l: "Duración total", v: finMax, u: "días hábiles", h: true },
        { l: "Semanas", v: semanas, u: "semanas", h: true },
        { l: "Meses estimados", v: meses, u: "meses", h: true },
        { l: "── CRONOGRAMA ──", v: "", u: "" },
      ];

      etapas.forEach(e => {
        const finDia = e.inicio + e.dur;
        items.push({
          l: `${e.nombre}`,
          v: `Día ${e.inicio + 1} → ${finDia}`,
          u: `(${e.dur}d)`,
        });
      });

      items.push({ l: "── RESUMEN ──", v: "", u: "" });
      items.push({ l: "Etapas totales", v: etapas.length, u: "etapas" });
      items.push({ l: "Superficie", v: v.supTotal, u: "m²" });
      items.push({ l: "Rubros incluidos", v: [
        Number(v.inclEst) && "Estructura",
        Number(v.inclSan) && "Sanitaria",
        Number(v.inclElec) && "Eléctrica",
        Number(v.inclSeco) && "Seco",
        Number(v.inclTermo) && "HVAC",
      ].filter(Boolean).join(", ") || "Solo albañilería", u: "" });

      const notes = [];
      notes.push("Los tiempos son estimativos para condiciones normales de obra. Clima, provisión de materiales y subcontratos pueden alterar los plazos.");
      if (v.tipoObra === "edificio") notes.push("Edificios: considerar tiempos de aprobación de planos, cargas de obra y permisos municipales adicionales.");
      if (finMax > 200) notes.push("Obra de larga duración: planificar cortes parciales y entregas por etapas si es posible.");
      if (v.equipoSize === "chico") notes.push("Equipo reducido: considerar subcontratar rubros específicos (eléctrica, gas) para no retrasar la ruta crítica.");

      return {
        big: finMax, bigU: "días", bigL: `${semanas} semanas · ${etapas.length} etapas`,
        ring: Math.min(100, Math.round((finMax / 300) * 100)),
        items,
        notes,
      };
    },
  },
];

export const BUDGET_MODULE = {
  id: "presup",
  name: "Presupuestos",
  sub: "Cómputo y Costos",
  icon: "budget",
  color: "#E0024E",
};

export const ALL_MODULES = [...CALC_MODULES, BUDGET_MODULE];
