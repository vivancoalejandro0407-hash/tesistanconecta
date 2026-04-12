export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
 
  const KEY = process.env.GOOGLE_PLACES_KEY;
  if (!KEY) return res.status(500).json({ error: 'GOOGLE_PLACES_KEY no configurada' });
 
  const { place_id, search } = req.query;
 
  try {
    if (place_id) {
      const fields = 'formatted_phone_number,website,opening_hours';
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(place_id)}&fields=${fields}&key=${KEY}&language=es`;
      const r = await fetch(url);
      const data = await r.json();
      if (data.status !== 'OK' || !data.result)
        return res.status(200).json({ ok: false, status: data.status });
      const d = data.result;
      const web = d.website || '';
      return res.status(200).json({
        ok: true,
        telefono: d.formatted_phone_number || '',
        website: web && !web.startsWith('http') ? 'https://' + web : web,
        horario: d.opening_hours?.weekday_text || [],
        abierto: d.opening_hours?.open_now ?? null,
      });
    }
 
    if (search) {
      const query = search + ' Tesistán Zapopan Jalisco México';
      const fields = 'place_id,formatted_phone_number,website,opening_hours,name';
      const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=${encodeURIComponent(fields)}&key=${KEY}&language=es`;
      const r = await fetch(url);
      const data = await r.json();
      if (data.status !== 'OK' || !data.candidates?.length)
        return res.status(200).json({ ok: false, status: data.status });
      const c = data.candidates[0];
      const web = c.website || '';
      return res.status(200).json({
        ok: true,
        place_id: c.place_id || '',
        telefono: c.formatted_phone_number || '',
        website: web && !web.startsWith('http') ? 'https://' + web : web,
        horario: c.opening_hours?.weekday_text || [],
        abierto: c.opening_hours?.open_now ?? null,
      });
    }
 
    return res.status(400).json({ error: 'Se requiere place_id o search' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
