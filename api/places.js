export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { place_id } = req.query;
  if (!place_id) return res.status(400).json({ error: 'place_id requerido' });

  const KEY = process.env.GOOGLE_PLACES_KEY;
  if (!KEY) return res.status(500).json({ error: 'GOOGLE_PLACES_KEY no configurada' });

  try {
    const fields = 'formatted_phone_number,website,opening_hours,types';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(place_id)}&fields=${fields}&key=${KEY}&language=es`;
    const r = await fetch(url);
    const data = await r.json();

    if (!data.result) return res.status(200).json({ ok: false, status: data.status });

    const d = data.result;
    return res.status(200).json({
      ok: true,
      telefono: d.formatted_phone_number || '',
      website:  d.website || '',
      horario:  d.opening_hours?.weekday_text || [],
      abierto:  d.opening_hours?.open_now ?? null,
      types:    d.types || []
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
