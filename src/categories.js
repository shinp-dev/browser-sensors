window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('sensor-container');
  if (!container) return;

  const groups = [
    {
      title: '本体センサー',
      description: '端末内蔵センサーや測位情報など、環境や動きを直接観測するAPIです。',
      ids: [
        'geolocation',
        'orientation',
        'motion',
        'generic-accelerometer',
        'linear-acceleration',
        'gravity-sensor',
        'generic-gyroscope',
        'magnetometer',
        'absolute-orientation',
        'relative-orientation',
        'ambient-light'
      ]
    },
    {
      title: '端末能力',
      description: 'ブラウザ / OS がWebへ公開しているカメラ、マイク、画面、入力、電源、通信などの端末機能です。',
      ids: [
        'camera',
        'microphone',
        'media-devices',
        'pointer',
        'touch-capability',
        'screen',
        'screen-orientation',
        'device-posture',
        'battery',
        'network',
        'hardware',
        'vibration',
        'wakelock',
        'speech',
        'screenshare'
      ]
    }
  ];

  const allCards = Array.from(container.querySelectorAll('.card'));
  const byId = new Map(allCards.map((card) => [card.id.replace(/^card-/, ''), card]));
  const placed = new Set();

  groups.forEach((group) => {
    const heading = document.createElement('section');
    heading.className = 'category-heading';
    const h2 = document.createElement('h2');
    h2.textContent = group.title;
    const p = document.createElement('p');
    p.textContent = group.description;
    heading.append(h2, p);
    container.appendChild(heading);

    group.ids.forEach((id) => {
      const card = byId.get(id);
      if (!card) return;
      placed.add(card);
      container.appendChild(card);
    });
  });

  const remaining = allCards.filter((card) => !placed.has(card));
  if (remaining.length) {
    const heading = document.createElement('section');
    heading.className = 'category-heading';
    heading.innerHTML = '<h2>その他のWeb API</h2><p>既存機能のうち、上記カテゴリへまだ明示分類していない項目です。</p>';
    container.appendChild(heading);
    remaining.forEach((card) => container.appendChild(card));
  }
});
