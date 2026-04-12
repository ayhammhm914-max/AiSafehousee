const db = require('../config/db');

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    const [tools] = await db.query(`
      SELECT m.name, m.description, m.tags, m.avg_rating, m.website_url, m.is_free, c.name AS category
      FROM AI_Models m
      JOIN Categories c ON m.category_id = c.category_id
      ORDER BY m.avg_rating DESC
    `);

    const toolsText = tools
      .map(tool => `- ${tool.name} | Category: ${tool.category} | Tags: ${tool.tags} | Rating: ${tool.avg_rating} | Free: ${tool.is_free ? 'Yes' : 'No'} | ${tool.description}`)
      .join('\n');

    const systemPrompt =
      '\u0623\u0646\u062a AiMaster\u060c \u0645\u0633\u0627\u0639\u062f \u0630\u0643\u064a \u0645\u062a\u062e\u0635\u0635 \u0641\u064a \u0627\u0642\u062a\u0631\u0627\u062d \u0623\u062f\u0648\u0627\u062a \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a.\n' +
      '\u0639\u0646\u062f\u0643 \u0647\u0627\u064a \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u062f\u0648\u0627\u062a \u0627\u0644\u0645\u062a\u0627\u062d\u0629 \u0645\u0646 \u0627\u0644\u062f\u0627\u062a\u0627 \u0628\u064a\u0633:\n' +
      `${toolsText}\n\n` +
      '\u0644\u0645\u0627 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645 \u0628\u064a\u0633\u0623\u0644\u0643\u060c \u0627\u0642\u062a\u0631\u062d \u0644\u0647 \u0623\u0641\u0636\u0644 2-3 \u0623\u062f\u0648\u0627\u062a \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0641\u0642\u0637 \u0645\u0639 \u0634\u0631\u062d \u0633\u0628\u0628 \u0627\u0644\u0627\u062e\u062a\u064a\u0627\u0631.\n' +
      '\u0627\u0644\u0631\u062f \u064a\u0643\u0648\u0646 \u0628\u0627\u0644\u0639\u0631\u0628\u064a \u0648\u0645\u062e\u062a\u0635\u0631 \u0648\u0648\u0627\u0636\u062d.';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    });

    const data = await response.json();
    const reply = data?.content?.[0]?.text || '\u0645\u0627 \u0642\u062f\u0631\u062a \u0623\u0633\u062a\u062e\u0631\u062c \u0627\u0642\u062a\u0631\u0627\u062d \u0645\u0646 \u0627\u0644\u0628\u0648\u062a \u062d\u0627\u0644\u064a\u0627\u064b.';

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
